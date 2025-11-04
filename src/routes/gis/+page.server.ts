import { getLocationsByPerson, type LocationPublic } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const personSlug = locals.personSlug || 'family';

  try {
    // Fetch locations filtered by person or family
    const locations = await getLocationsByPerson(personSlug);

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
