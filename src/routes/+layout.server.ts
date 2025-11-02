import type { LayoutServerLoad } from './$types';
import { getThemeBySlug } from '$lib/themes';
import { getPersonBySlug, getAllPersons } from '$lib/pocketbase';

/**
 * Root layout server load function
 * Runs on every page request and provides data to all pages
 */
export const load: LayoutServerLoad = async ({ locals }) => {
	// Get person-specific theme configuration
	const siteConfig = getThemeBySlug(locals.personSlug);

	// Fetch person data for configuration
	let person = null;
	let allPersons = [];

	if (locals.personSlug === 'family') {
		// Family hub: fetch all persons for directory
		allPersons = await getAllPersons();
	} else {
		// Individual person site: fetch person config
		person = await getPersonBySlug(locals.personSlug);
	}

	return {
		personSlug: locals.personSlug,
		siteConfig,
		person, // Person configuration (null for family hub)
		allPersons, // All persons (for family hub)
		enabledRoutes: person?.enabledRoutes || ['projects', 'gis', 'about', 'contact'],
		homepageConfig: person?.homepageConfig || {
			layout: 'grid',
			showProjects: true,
			showStats: true
		}
	};
};
