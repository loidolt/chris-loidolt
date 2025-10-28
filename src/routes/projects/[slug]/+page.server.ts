import { error } from '@sveltejs/kit';
import { getProjectBySlug, getRelatedProjects, type Project } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const authToken = locals.user?.token;

  const project = await getProjectBySlug(params.slug, { authToken });

  if (!project) {
    throw error(404, 'Project not found');
  }

  // Fetch related projects (optimized - only fetches what's needed)
  const relatedProjects = await getRelatedProjects(project.id, 3);

  return {
    project,
    allProjects: relatedProjects, // Keep same prop name for compatibility
    user: locals.user, // Pass user for UI
  };
};
