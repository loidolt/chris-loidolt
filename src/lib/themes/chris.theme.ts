import type { SiteConfig } from './types';

/**
 * Chris's Theme: Catppuccin Mocha
 *
 * A soothing pastel theme with a dark, cozy aesthetic.
 * Using the popular Catppuccin Mocha color palette.
 */
export const chrisTheme: SiteConfig = {
	theme: {
		id: 'chris',
		name: 'Catppuccin Mocha',
		personSlug: 'chris',
		description: 'Soothing pastel theme with Catppuccin Mocha colors',

		colors: {
			// Light mode (Catppuccin Latte)
			light: {
				bgPrimary: '#eff1f5', // Base
				bgSurface: '#e6e9ef', // Mantle
				bgElevated: '#dce0e8', // Crust

				textPrimary: '#4c4f69', // Text
				textSecondary: '#5c5f77', // Subtext1
				textMuted: '#6c6f85', // Subtext0

				accentPrimary: '#40a02b', // Green
				accentSecondary: '#1e66f5', // Blue
				accentTertiary: '#04a5e5', // Sky

				linkColor: '#1e66f5', // Blue
				linkHover: '#7287fd', // Lavender

				borderColor: '#acb0be', // Surface2
				borderSubtle: '#bcc0cc', // Surface1

				success: '#40a02b', // Green
				error: '#d20f39', // Red
				warning: '#df8e1d', // Yellow
				info: '#209fb5', // Sapphire

				overlayBg: 'rgba(76, 79, 105, 0.7)',
				shadowColor: 'rgba(0, 0, 0, 0.1)'
			},

			// Dark mode (Catppuccin Mocha)
			dark: {
				bgPrimary: '#1e1e2e', // Base
				bgSurface: '#181825', // Mantle
				bgElevated: '#313244', // Surface0

				textPrimary: '#cdd6f4', // Text
				textSecondary: '#bac2de', // Subtext1
				textMuted: '#a6adc8', // Subtext0

				accentPrimary: '#a6e3a1', // Green
				accentSecondary: '#89b4fa', // Blue
				accentTertiary: '#94e2d5', // Teal

				linkColor: '#89b4fa', // Blue
				linkHover: '#b4befe', // Lavender

				borderColor: '#45475a', // Surface1
				borderSubtle: '#313244', // Surface0

				success: '#a6e3a1', // Green
				error: '#f38ba8', // Red
				warning: '#f9e2af', // Yellow
				info: '#74c7ec', // Sapphire

				overlayBg: 'rgba(30, 30, 46, 0.85)',
				shadowColor: 'rgba(0, 0, 0, 0.3)'
			}
		},

		typography: {
			fontMono: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
			fontSans: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
			fontSerif: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',

			baseFontSize: '16px',
			scaleRatio: 1.2,

			lineHeightBase: 1.75,
			lineHeightHeading: 1.3,

			weightNormal: 400,
			weightMedium: 500,
			weightBold: 700,

			letterSpacingBase: '0.01em',
			letterSpacingHeading: '0'
		},

		spacing: {
			base: '1rem',
			scale: [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8]
		},

		animation: {
			transitionDuration: '0.3s',
			transitionTiming: 'ease',
			enableAnimations: true,
			reducedMotion: false
		},

		borders: {
			defaultWidth: '1px',
			defaultStyle: 'solid',
			radiusBase: '0',
			radiusLarge: '0'
		},

		effects: {
			paperGrain: false,
			vignette: false
		}
	},

	layout: {
		navigation: {
			style: 'tabs',
			position: 'top',
			sticky: true,
			showLogo: false
		},

		footer: {
			style: 'split',
			showSocial: true,
			customText: '~/catppuccin'
		},

		content: {
			maxWidth: '1280px',
			padding: '1.5rem',
			centerContent: true
		},

		homepage: {
			showWelcomeAnimation: true,
			welcomeText: 'chris@mocha:~$',
			layout: 'single-column'
		}
	}
};
