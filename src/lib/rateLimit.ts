/**
 * Simple in-memory rate limiter for API endpoints
 *
 * Uses sliding window algorithm to track requests per IP address
 * For production with multiple servers, consider Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store rate limit data in memory (IP -> entry)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional custom message for rate limit exceeded */
  message?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (usually IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No previous entry - allow request
  if (!entry) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: now + config.windowMs,
    };
  }

  // Entry exists but window has expired - reset
  if (now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: now + config.windowMs,
    };
  }

  // Entry exists and window is still valid
  const remaining = config.maxRequests - entry.count;

  // Rate limit exceeded
  if (remaining <= 0) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000), // seconds
    };
  }

  // Increment count and allow request
  entry.count++;

  return {
    success: true,
    limit: config.maxRequests,
    remaining: remaining - 1,
    reset: entry.resetTime,
  };
}

/**
 * Get client IP address from request
 * Handles proxies and load balancers
 */
export function getClientIP(request: Request): string {
  // Check common headers for real IP (when behind proxy/load balancer)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, use the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to 'unknown' if we can't determine IP
  // In production, you might want to block these requests
  return 'unknown';
}

/**
 * Preset rate limit configurations
 */
export const RATE_LIMITS = {
  /** Strict rate limiting for auth endpoints (5 requests per 15 minutes) */
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Too many authentication attempts. Please try again later.',
  },

  /** Moderate rate limiting for contact form (3 requests per hour) */
  CONTACT: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    message: 'Too many contact form submissions. Please try again later.',
  },

  /** Lenient rate limiting for unlock location (10 requests per minute) */
  UNLOCK: {
    maxRequests: 10,
    windowMs: 60 * 1000,
    message: 'Too many unlock attempts. Please wait before trying again.',
  },

  /** General API rate limiting (100 requests per minute) */
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000,
    message: 'Too many requests. Please slow down.',
  },
} as const;
