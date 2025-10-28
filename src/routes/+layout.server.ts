import type { LayoutServerLoad } from './$types';

/**
 * Root layout server load function
 * Runs on every page request and provides data to all pages
 */
export const load: LayoutServerLoad = async ({ locals }) => {
  // Look how clean this is compared to Next.js headers!
  return {
    personSlug: locals.personSlug,
  };
};
