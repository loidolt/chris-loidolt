/**
 * Theme Type System for Multi-Tenant Portfolio Sites
 *
 * Defines the structure for per-person themes including colors,
 * typography, spacing, and layout preferences.
 */

export type ThemeMode = 'light' | 'dark';

/**
 * Color palette for a theme mode (light or dark)
 */
export interface ColorPalette {
	// Background colors
	bgPrimary: string;
	bgSurface: string;
	bgElevated?: string;

	// Text colors
	textPrimary: string;
	textSecondary: string;
	textMuted: string;

	// Accent colors
	accentPrimary: string;
	accentSecondary: string;
	accentTertiary?: string;

	// Interactive elements
	linkColor: string;
	linkHover?: string;

	// Borders and dividers
	borderColor: string;
	borderSubtle?: string;

	// Status colors
	success: string;
	error: string;
	warning?: string;
	info?: string;

	// Overlay/shadow colors
	overlayBg?: string;
	shadowColor?: string;
}

/**
 * Typography configuration
 */
export interface Typography {
	// Font families
	fontMono: string;
	fontSans?: string;
	fontSerif?: string;

	// Font sizes
	baseFontSize: string;
	scaleRatio: number; // Modular scale ratio (e.g., 1.25 for Major Third)

	// Line heights
	lineHeightBase: number;
	lineHeightHeading: number;

	// Font weights
	weightNormal: number;
	weightMedium: number;
	weightBold: number;

	// Letter spacing
	letterSpacingBase: string;
	letterSpacingHeading?: string;
}

/**
 * Spacing scale configuration
 */
export interface SpacingScale {
	base: string; // Base unit (e.g., '1rem', '8px')
	scale: number[]; // Multipliers for spacing scale
}

/**
 * Animation and transition preferences
 */
export interface AnimationConfig {
	transitionDuration: string;
	transitionTiming: string;
	enableAnimations: boolean;
	reducedMotion?: boolean;
}

/**
 * Border and radius configuration
 */
export interface BorderConfig {
	defaultWidth: string;
	defaultStyle: 'solid' | 'dashed' | 'dotted';
	radiusBase: string;
	radiusLarge?: string;
}

/**
 * Complete theme configuration
 */
export interface Theme {
	// Theme metadata
	id: string;
	name: string;
	personSlug?: string;
	description?: string;

	// Color palettes for light and dark modes
	colors: {
		light: ColorPalette;
		dark: ColorPalette;
	};

	// Typography settings
	typography: Typography;

	// Spacing system
	spacing: SpacingScale;

	// Animation preferences
	animation: AnimationConfig;

	// Border configuration
	borders: BorderConfig;

	// Custom effects
	effects?: {
		paperGrain?: boolean;
		vignette?: boolean;
		customCss?: string;
	};
}

/**
 * Navigation style options
 */
export type NavigationStyle =
	| 'tabs' // Horizontal tabs (current default)
	| 'sidebar' // Vertical sidebar navigation
	| 'topbar' // Top bar with logo
	| 'minimal' // Minimal text-only nav
	| 'hamburger'; // Mobile-style hamburger menu

/**
 * Footer style options
 */
export type FooterStyle =
	| 'minimal' // Simple text footer
	| 'rich' // Multi-column footer with links
	| 'centered' // Centered content
	| 'split'; // Split left/right layout

/**
 * Layout configuration per person
 */
export interface LayoutConfig {
	// Navigation settings
	navigation: {
		style: NavigationStyle;
		position: 'top' | 'left' | 'right';
		sticky?: boolean;
		showLogo?: boolean;
		logoText?: string;
	};

	// Footer settings
	footer: {
		style: FooterStyle;
		showSocial?: boolean;
		customText?: string;
	};

	// Content layout
	content: {
		maxWidth: string;
		padding: string;
		centerContent?: boolean;
	};

	// Homepage specific
	homepage?: {
		showWelcomeAnimation?: boolean;
		welcomeText?: string;
		layout: 'single-column' | 'two-column' | 'grid';
	};
}

/**
 * Complete site configuration (theme + layout)
 */
export interface SiteConfig {
	theme: Theme;
	layout: LayoutConfig;
}

/**
 * Theme registry type
 */
export interface ThemeRegistry {
	chris: SiteConfig;
	julia: SiteConfig;
	theo: SiteConfig;
	jack: SiteConfig;
	family: SiteConfig;
}

/**
 * Person slug type
 */
export type PersonSlug = keyof ThemeRegistry;

/**
 * Helper type for CSS custom properties
 */
export type CSSCustomProperties = Record<string, string>;
