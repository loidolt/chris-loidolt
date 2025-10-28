import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PocketBase from 'pocketbase';
import { timingSafeEqual } from 'crypto';
import { ENV } from '$lib/env';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '$lib/rateLimit';

/**
 * Constant-time password comparison to prevent timing attacks
 */
function timingSafePasswordCompare(storedPassword: string, suppliedPassword: string): boolean {
  try {
    // Ensure both strings are the same length to prevent early returns
    const storedBuffer = Buffer.from(storedPassword, 'utf8');
    const suppliedBuffer = Buffer.from(suppliedPassword, 'utf8');

    // If lengths differ, compare against a dummy buffer to maintain constant time
    if (storedBuffer.length !== suppliedBuffer.length) {
      // Create a buffer of the same length as stored password for timing consistency
      const dummyBuffer = Buffer.alloc(storedBuffer.length);
      timingSafeEqual(storedBuffer, dummyBuffer);
      return false;
    }

    return timingSafeEqual(storedBuffer, suppliedBuffer);
  } catch (error) {
    // If any error occurs, fail safely
    return false;
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Check rate limit
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, RATE_LIMITS.UNLOCK);

    if (!rateLimit.success) {
      return json(
        {
          success: false,
          error: RATE_LIMITS.UNLOCK.message,
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter),
          },
        }
      );
    }

    const { locationId, password } = await request.json();

    if (!locationId || !password) {
      return json({ success: false, error: 'Missing locationId or password' }, { status: 400 });
    }

    // Initialize PocketBase using centralized environment configuration
    const pb = new PocketBase(ENV.POCKETBASE_URL);
    pb.autoCancellation(false);

    // Fetch the location from PocketBase (including password field)
    const location = await pb.collection('locations').getOne(locationId);

    if (!location) {
      return json({ success: false, error: 'Location not found' }, { status: 404 });
    }

    // Check if location is private
    if (location.privacy !== 'Private') {
      return json({ success: true }); // Not private, no need to check password
    }

    // Verify password using constant-time comparison to prevent timing attacks
    if (timingSafePasswordCompare(location.password, password)) {
      return json({ success: true });
    } else {
      return json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }
  } catch (error) {
    console.error('[unlock-location] Error:', error);
    return json({ success: false, error: 'Server error' }, { status: 500 });
  }
};
