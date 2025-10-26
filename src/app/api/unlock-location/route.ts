import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllLocations } from '@/lib/airtable';

// Validation schema
const unlockSchema = z.object({
  locationId: z.string().min(1),
  password: z.string().min(1),
});

// Rate limiting store (in-memory)
// In production, use Redis or a proper rate limiting service
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limiting configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes after max attempts

function getClientId(request: NextRequest): string {
  // Use IP address as client identifier
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';
  return ip;
}

function checkRateLimit(clientId: string, locationId: string): { allowed: boolean; retryAfter?: number } {
  const key = `${clientId}:${locationId}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    // First attempt
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttempt: now,
    });
    return { allowed: true };
  }

  // Check if currently blocked
  if (entry.blockedUntil && now < entry.blockedUntil) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Check if window has expired
  if (now - entry.firstAttempt > WINDOW_MS) {
    // Reset the window
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttempt: now,
    });
    return { allowed: true };
  }

  // Increment attempts
  entry.attempts++;

  // Check if max attempts reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION_MS;
    rateLimitStore.set(key, entry);
    const retryAfter = Math.ceil(BLOCK_DURATION_MS / 1000);
    return { allowed: false, retryAfter };
  }

  rateLimitStore.set(key, entry);
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const result = unlockSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { locationId, password } = result.data;

    // Check rate limiting
    const clientId = getClientId(request);
    const rateLimit = checkRateLimit(clientId, locationId);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many attempts. Please try again later.',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || 60),
          },
        }
      );
    }

    // Fetch locations from Airtable
    const locations = await getAllLocations();
    const location = locations.find(loc => loc.id === locationId);

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      );
    }

    // Verify password
    if (location.password && password === location.password) {
      // Generate a session token for this location
      // In production, use a proper JWT or session token
      const sessionToken = Buffer.from(
        `${locationId}:${Date.now()}:${Math.random()}`
      ).toString('base64');

      return NextResponse.json({
        success: true,
        sessionToken,
        location: {
          id: location.id,
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
    }

    // Incorrect password
    return NextResponse.json(
      { success: false, error: 'Incorrect password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Unlock location error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove entries older than 1 hour
    if (now - entry.firstAttempt > 60 * 60 * 1000) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes
