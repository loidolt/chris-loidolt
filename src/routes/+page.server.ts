import { getAllProjects } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

/**
 * Homepage server load function
 * Fetches projects for the node graph
 */
export const load: PageServerLoad = async () => {
  const allProjects = await getAllProjects();

  // Prepare simplified project data for the graph
  const projectsForGraph = allProjects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    categories: p.categories || [],
    tags: p.tags || [],
  }));

  return {
    projects: projectsForGraph,
    projectCount: allProjects.length,
  };
};
