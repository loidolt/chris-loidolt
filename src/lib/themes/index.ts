/**
 * Theme Registry and Utilities
 *
 * Central hub for all theme-related functionality including
 * theme registry, CSS variable generation, and theme utilities.
 */

import { chrisTheme } from './chris.theme';
import { juliaTheme } from './julia.theme';
import { theoTheme } from './theo.theme';
import { jackTheme } from './jack.theme';
import { familyTheme } from './family.theme';
import type {
	ThemeRegistry,
	PersonSlug,
	SiteConfig,
	Theme,
	ColorPalette,
	CSSCustomProperties,
	ThemeMode
} from './types';

/**
 * Theme registry containing all site configurations
 */
export const themes: ThemeRegistry = {
	chris: chrisTheme,
	julia: juliaTheme,
	theo: theoTheme,
	jack: jackTheme,
	family: familyTheme
};

/**
 * Default theme (fallback) - Family Hub
 */
export const defaultTheme: SiteConfig = familyTheme;

/**
 * Get theme configuration by person slug
 */
export function getThemeBySlug(slug: string): SiteConfig {
	const validSlugs: PersonSlug[] = ['chris', 'julia', 'theo', 'jack', 'family'];

	if (validSlugs.includes(slug as PersonSlug)) {
		return themes[slug as PersonSlug];
	}

	// Fallback to default theme
	return defaultTheme;
}

/**
 * Convert hex color to HSL format (without hsl() wrapper) for shadcn compatibility
 */
function hexToHSL(hex: string): string {
	// Remove # if present
	hex = hex.replace('#', '');

	// Convert to RGB
	const r = parseInt(hex.substring(0, 2), 16) / 255;
	const g = parseInt(hex.substring(2, 4), 16) / 255;
	const b = parseInt(hex.substring(4, 6), 16) / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0,
		s = 0,
		l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}

	h = Math.round(h * 360);
	s = Math.round(s * 100);
	l = Math.round(l * 100);

	return `${h} ${s}% ${l}%`;
}

/**
 * Generate CSS custom properties from a color palette (shadcn format)
 */
export function generateColorVariables(
	palette: ColorPalette,
	prefix: string = '--color'
): CSSCustomProperties {
	return {
		// Shadcn variable names (HSL format without hsl() wrapper)
		'--background': hexToHSL(palette.bgPrimary),
		'--foreground': hexToHSL(palette.textPrimary),
		'--card': hexToHSL(palette.bgSurface),
		'--card-foreground': hexToHSL(palette.textPrimary),
		'--popover': hexToHSL(palette.bgSurface),
		'--popover-foreground': hexToHSL(palette.textPrimary),
		'--primary': hexToHSL(palette.accentPrimary),
		'--primary-foreground': hexToHSL(palette.bgPrimary),
		'--secondary': hexToHSL(palette.bgElevated || palette.bgSurface),
		'--secondary-foreground': hexToHSL(palette.textPrimary),
		'--muted': hexToHSL(palette.bgElevated || palette.bgSurface),
		'--muted-foreground': hexToHSL(palette.textMuted),
		'--accent': hexToHSL(palette.accentSecondary),
		'--accent-foreground': hexToHSL(palette.textPrimary),
		'--destructive': hexToHSL(palette.error),
		'--destructive-foreground': hexToHSL(palette.bgPrimary),
		'--border': hexToHSL(palette.borderColor),
		'--input': hexToHSL(palette.borderColor),
		'--ring': hexToHSL(palette.accentPrimary),

		// Custom variables (for direct use)
		[`${prefix}-bg-primary`]: palette.bgPrimary,
		[`${prefix}-bg-surface`]: palette.bgSurface,
		[`${prefix}-bg-elevated`]: palette.bgElevated || palette.bgSurface,

		[`${prefix}-text-primary`]: palette.textPrimary,
		[`${prefix}-text-secondary`]: palette.textSecondary,
		[`${prefix}-text-muted`]: palette.textMuted,

		[`${prefix}-accent-primary`]: palette.accentPrimary,
		[`${prefix}-accent-secondary`]: palette.accentSecondary,
		[`${prefix}-accent-tertiary`]: palette.accentTertiary || palette.accentPrimary,

		[`${prefix}-link`]: palette.linkColor,
		[`${prefix}-link-hover`]: palette.linkHover || palette.linkColor,

		[`${prefix}-border`]: palette.borderColor,
		[`${prefix}-border-subtle`]: palette.borderSubtle || palette.borderColor,

		[`${prefix}-success`]: palette.success,
		[`${prefix}-error`]: palette.error,
		[`${prefix}-warning`]: palette.warning || palette.error,
		[`${prefix}-info`]: palette.info || palette.linkColor,

		[`${prefix}-overlay-bg`]: palette.overlayBg || 'rgba(0, 0, 0, 0.7)',
		[`${prefix}-shadow`]: palette.shadowColor || 'rgba(0, 0, 0, 0.1)'
	};
}

/**
 * Generate all CSS custom properties for a theme
 */
export function generateThemeVariables(
	theme: Theme,
	mode: ThemeMode = 'dark'
): CSSCustomProperties {
	const palette = mode === 'light' ? theme.colors.light : theme.colors.dark;
	const colorVars = generateColorVariables(palette);

	// Typography variables
	const typoVars: CSSCustomProperties = {
		'--font-mono': theme.typography.fontMono,
		'--font-sans': theme.typography.fontSans || theme.typography.fontMono,
		'--font-serif': theme.typography.fontSerif || theme.typography.fontMono,
		'--font-size-base': theme.typography.baseFontSize,
		'--line-height-base': theme.typography.lineHeightBase.toString(),
		'--line-height-heading': theme.typography.lineHeightHeading.toString(),
		'--font-weight-normal': theme.typography.weightNormal.toString(),
		'--font-weight-medium': theme.typography.weightMedium.toString(),
		'--font-weight-bold': theme.typography.weightBold.toString(),
		'--letter-spacing-base': theme.typography.letterSpacingBase,
		'--letter-spacing-heading':
			theme.typography.letterSpacingHeading || theme.typography.letterSpacingBase
	};

	// Spacing variables
	const spacingVars: CSSCustomProperties = {};
	theme.spacing.scale.forEach((multiplier, index) => {
		spacingVars[`--spacing-${index}`] = `calc(${theme.spacing.base} * ${multiplier})`;
	});

	// Animation variables
	const animationVars: CSSCustomProperties = {
		'--transition-duration': theme.animation.transitionDuration,
		'--transition-timing': theme.animation.transitionTiming
	};

	// Border variables
	const borderVars: CSSCustomProperties = {
		'--border-width': theme.borders.defaultWidth,
		'--border-radius': theme.borders.radiusBase,
		'--border-radius-lg': theme.borders.radiusLarge || theme.borders.radiusBase
	};

	// Combine all variables
	return {
		...colorVars,
		...typoVars,
		...spacingVars,
		...animationVars,
		...borderVars
	};
}

/**
 * Generate CSS string from custom properties object
 */
export function generateCSSString(properties: CSSCustomProperties): string {
	return Object.entries(properties)
		.map(([key, value]) => `  ${key}: ${value};`)
		.join('\n');
}

/**
 * Generate complete CSS for a theme mode
 */
export function generateThemeCSS(theme: Theme, mode: ThemeMode): string {
	const variables = generateThemeVariables(theme, mode);
	const selector = mode === 'light' ? ':root.light' : ':root';

	return `${selector} {\n${generateCSSString(variables)}\n}`;
}

/**
 * Get all valid person slugs
 */
export function getValidPersonSlugs(): PersonSlug[] {
	return Object.keys(themes) as PersonSlug[];
}

/**
 * Check if a slug is valid
 */
export function isValidPersonSlug(slug: string): slug is PersonSlug {
	return getValidPersonSlugs().includes(slug as PersonSlug);
}

/**
 * Re-export types for convenience
 */
export * from './types';
