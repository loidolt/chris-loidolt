import { getAllProjects, getProjectsByPerson, getAllPersons } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

/**
 * Homepage server load function
 * Fetches person-specific or family-wide content based on subdomain
 */
export const load: PageServerLoad = async ({ locals }) => {
  const personSlug = locals.personSlug;

  if (personSlug === 'family') {
    // ===== FAMILY HUB =====
    // Show all family-scoped projects and all persons
    const allProjects = await getAllProjects();
    const familyProjects = allProjects.filter(p => p.scope === 'Family' || !p.scope);
    const allPersons = await getAllPersons();

    const projectsForGraph = familyProjects.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      categories: p.categories || [],
      tags: p.tags || [],
    }));

    return {
      isFamilyHub: true,
      projects: projectsForGraph,
      projectCount: familyProjects.length,
      persons: allPersons,
    };
  } else {
    // ===== INDIVIDUAL PERSON SITE =====
    // Show person-specific projects only
    const personProjects = await getProjectsByPerson(personSlug);

    const projectsForGraph = personProjects.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      categories: p.categories || [],
      tags: p.tags || [],
    }));

    return {
      isFamilyHub: false,
      projects: projectsForGraph,
      projectCount: personProjects.length,
    };
  }
};
