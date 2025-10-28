import { getPublicLocations, type LocationPublic } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const personSlug = locals.personSlug || 'chris';

  try {
    // Fetch locations from PocketBase
    const locations = await getPublicLocations();

    return {
      personSlug,
      locations,
    };
  } catch (error) {
    console.error('[GIS Page] Error loading locations:', error);

    // Return empty locations array on error
    return {
      personSlug,
      locations: [] as LocationPublic[],
      error: 'Failed to load locations',
    };
  }
};
