import type { LayoutServerLoad } from './$types';
import { getThemeBySlug } from '$lib/themes';

/**
 * Root layout server load function
 * Runs on every page request and provides data to all pages
 */
export const load: LayoutServerLoad = async ({ locals }) => {
	// Get person-specific theme configuration
	const siteConfig = getThemeBySlug(locals.personSlug);

	return {
		personSlug: locals.personSlug,
		siteConfig
	};
};
