import type { SiteConfig } from './types';

/**
 * Jack's Theme: Energetic Sunset
 *
 * A playful, energetic aesthetic with orange and yellow accents.
 * Vibrant and cheerful with warm sunset colors.
 */
export const jackTheme: SiteConfig = {
	theme: {
		id: 'jack',
		name: 'Sunset Orange',
		personSlug: 'jack',
		description: 'Playful, energetic aesthetic with warm sunset tones',

		colors: {
			// Light mode - bright and sunny
			light: {
				bgPrimary: '#fef6e7',
				bgSurface: '#fcefd1',
				bgElevated: '#fffcf5',

				textPrimary: '#3e2723',
				textSecondary: '#5d4037',
				textMuted: '#8d6e63',

				accentPrimary: '#f39c12',
				accentSecondary: '#e67e22',
				accentTertiary: '#f4a460',

				linkColor: '#d35400',
				linkHover: '#ba4a00',

				borderColor: '#f0ddc0',
				borderSubtle: '#f5e8d5',

				success: '#27ae60',
				error: '#e74c3c',
				warning: '#f39c12',
				info: '#3498db',

				overlayBg: 'rgba(62, 39, 35, 0.7)',
				shadowColor: 'rgba(0, 0, 0, 0.1)'
			},

			// Dark mode - warm ember glow
			dark: {
				bgPrimary: '#2c1810',
				bgSurface: '#3c2820',
				bgElevated: '#4c3830',

				textPrimary: '#ffefd5',
				textSecondary: '#e0cfb5',
				textMuted: '#c0af95',

				accentPrimary: '#ffa726',
				accentSecondary: '#ff9800',
				accentTertiary: '#ffb74d',

				linkColor: '#ffb84d',
				linkHover: '#ffc97d',

				borderColor: '#5c4840',
				borderSubtle: '#4c3830',

				success: '#4ade80',
				error: '#ff7676',
				warning: '#fbbf24',
				info: '#7dd3fc',

				overlayBg: 'rgba(44, 24, 16, 0.85)',
				shadowColor: 'rgba(0, 0, 0, 0.3)'
			}
		},

		typography: {
			fontMono: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
			fontSans: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
			fontSerif: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',

			baseFontSize: '16px',
			scaleRatio: 1.25,

			lineHeightBase: 1.7,
			lineHeightHeading: 1.3,

			weightNormal: 400,
			weightMedium: 600,
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
			transitionTiming: 'ease-out',
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
			paperGrain: true,
			vignette: true
		}
	},

	layout: {
		navigation: {
			style: 'minimal',
			position: 'top',
			sticky: true,
			showLogo: true,
			logoText: 'Jack'
		},

		footer: {
			style: 'minimal',
			showSocial: true,
			customText: '// jack loidolt'
		},

		content: {
			maxWidth: '1100px',
			padding: '1.5rem',
			centerContent: true
		},

		homepage: {
			showWelcomeAnimation: true,
			welcomeText: 'jack@sunshine:~$',
			layout: 'single-column'
		}
	}
};
