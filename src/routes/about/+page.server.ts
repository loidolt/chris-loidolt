import { getQualificationsByPerson, getServicesByPerson, getSkillsByPerson, type Qualification, type Service, type Skill } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

/**
 * Error handler with proper logging for data fetch failures
 */
function handleLoadError<T>(field: string, defaultValue: T) {
  return (error: unknown) => {
    console.error(`[about/+page.server.ts] Error loading ${field}:`, error);
    // Log additional details for debugging
    if (error instanceof Error) {
      console.error(`  Message: ${error.message}`);
      console.error(`  Stack: ${error.stack}`);
    }
    return defaultValue;
  };
}

export const load: PageServerLoad = async ({ locals }) => {
  const personSlug = locals.personSlug;

  let qualifications: Qualification[] = [];
  let services: Service[] = [];
  let skills: Skill[] = [];

  try {
    [qualifications, services, skills] = await Promise.all([
      getQualificationsByPerson(personSlug).catch(handleLoadError('qualifications', [])),
      getServicesByPerson(personSlug).catch(handleLoadError('services', [])),
      getSkillsByPerson(personSlug).catch(handleLoadError('skills', [])),
    ]);
  } catch (error) {
    console.error('[about/+page.server.ts] Unexpected error loading about page data:', error);
  }

  return {
    qualifications,
    services,
    skills,
    personSlug,
  };
};
