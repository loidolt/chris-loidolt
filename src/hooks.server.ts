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

  let personSlug: PersonSlug = 'chris'; // Default

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

  return resolve(event);
};
