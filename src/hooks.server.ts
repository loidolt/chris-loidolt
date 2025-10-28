import type { Handle } from '@sveltejs/kit';
import { getAuthUser } from '$lib/auth';

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
  if (parts.length === 2 && parts[0] === 'loidolt') {
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

  // Get PocketBase URL from environment
  const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

  // Check for authenticated user
  const user = await getAuthUser(event.cookies, pbUrl);
  event.locals.user = user;

  // Log auth status for debugging (remove in production)
  if (user) {
    console.log(`[Auth] User authenticated: ${user.email} (${user.id})`);
  }

  return resolve(event);
};
