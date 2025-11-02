import type { Handle } from '@sveltejs/kit';
import { getAuthUser } from '$lib/auth';
import { ENV, debugLog } from '$lib/env';

/**
 * SvelteKit server hooks - Multi-tenancy detection + Authentication
 *
 * Detects person slug from subdomain or route and sets event.locals
 * Validates authentication and sets user context
 * This is MUCH cleaner than Next.js middleware!
 */

export type PersonSlug = 'chris' | 'julia' | 'theo' | 'jack' | 'family';

const validPersonSlugs: PersonSlug[] = ['chris', 'julia', 'theo', 'jack', 'family'];

function isValidPersonSlug(slug: string): slug is PersonSlug {
  return validPersonSlugs.includes(slug as PersonSlug);
}

export const handle: Handle = async ({ event, resolve }) => {
  const { hostname, pathname } = new URL(event.url);

  let personSlug: PersonSlug = 'family'; // Default to family hub

  // ===== MULTI-TENANT DETECTION =====

  // Get base domain from centralized environment configuration
  const baseDomain = ENV.BASE_DOMAIN;

  // Extract subdomain from hostname
  // Example: chris.loidolt.space -> 'chris'
  const parts = hostname.split('.');

  if (parts.length > 2) {
    const subdomain = parts[0];
    if (isValidPersonSlug(subdomain)) {
      personSlug = subdomain;
    }
  }

  // Check for root domain -> family hub
  // Compare the hostname against the base domain (e.g., loidolt.space)
  if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
    personSlug = 'family';
  }

  // Alternative: Check for person-specific routes
  // Example: /julia/projects -> 'julia'
  const pathMatch = pathname.match(/^\/?(chris|julia|theo|jack|family)\//);
  if (pathMatch && isValidPersonSlug(pathMatch[1])) {
    personSlug = pathMatch[1];
  }

  // For local development, allow query parameter override
  const queryPersonSlug = event.url.searchParams.get('person');
  if (queryPersonSlug && isValidPersonSlug(queryPersonSlug)) {
    personSlug = queryPersonSlug;
  }

  // Set person slug in event.locals
  event.locals.personSlug = personSlug;

  // ===== AUTHENTICATION DETECTION =====

  // Check for authenticated user using centralized PocketBase URL
  const user = await getAuthUser(event.cookies, ENV.POCKETBASE_URL);
  event.locals.user = user;

  // Log auth status using debug logging
  if (user) {
    debugLog(`User authenticated: ${user.email} (${user.id})`);
  }

  // ===== SECURITY HEADERS =====

  // Resolve the request and add security headers
  const response = await resolve(event);

  // Add HTTP security headers
  const securityHeaders = {
    // Prevent clickjacking
    'X-Frame-Options': 'SAMEORIGIN',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Enable XSS protection (legacy browsers)
    'X-XSS-Protection': '1; mode=block',

    // Referrer policy - don't send full URL to external sites
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy - restrict browser features
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',

    // Content Security Policy - Allow inline styles and scripts for Svelte
    // In production, you should use nonces or hashes instead of 'unsafe-inline'
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Vite HMR in dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' " + ENV.POCKETBASE_URL,
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  };

  // Apply security headers to the response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add HTTPS-only security header in production
  if (ENV.IS_PRODUCTION) {
    // HSTS: Force HTTPS for 1 year, including subdomains
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
};
