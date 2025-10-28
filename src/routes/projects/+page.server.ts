import { getAllProjects, getProjectsByPerson, type Project } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const personSlug = locals.personSlug;
  const authToken = locals.user?.token;

  let projects: Project[] = [];
  try {
    if (personSlug && personSlug !== 'loidolt') {
      // Person-specific site: get only their projects (with visibility filtering)
      projects = await getProjectsByPerson(personSlug, { authToken });
    } else {
      // Family hub: get all family-scoped projects (with visibility filtering)
      const allProjects = await getAllProjects({ authToken });
      projects = allProjects.filter(p => p.scope === 'Family');
    }
  } catch (error) {
    console.error('Error loading projects:', error);
  }

  return {
    projects,
    personSlug,
    user: locals.user, // Pass user to client for UI
  };
};
