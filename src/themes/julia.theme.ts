import { SiteConfig } from './types';

/**
 * Julia's Theme: Warm & Artistic
 *
 * A warm, inviting palette with pink and coral accents.
 * Maintains monospace font for consistency but with a
 * softer, more artistic color approach.
 */
export const juliaTheme: SiteConfig = {
  theme: {
    id: 'julia',
    name: 'Warm Coral',
    personSlug: 'julia',
    description: 'Warm, artistic aesthetic with coral and pink tones',

    colors: {
      // Light mode - soft pastels
      light: {
        bgPrimary: '#fef5f1',
        bgSurface: '#fceee8',
        bgElevated: '#fffbfa',

        textPrimary: '#3d2b2e',
        textSecondary: '#6d5558',
        textMuted: '#9d8588',

        accentPrimary: '#e07a5f',
        accentSecondary: '#f4a261',
        accentTertiary: '#f8b88b',

        linkColor: '#c44569',
        linkHover: '#a43559',

        borderColor: '#f0d5cd',
        borderSubtle: '#f5e5dd',

        success: '#81b29a',
        error: '#e07a5f',
        warning: '#f4a261',
        info: '#c44569',

        overlayBg: 'rgba(61, 43, 46, 0.7)',
        shadowColor: 'rgba(0, 0, 0, 0.08)',
      },

      // Dark mode - rich warm tones
      dark: {
        bgPrimary: '#2d1f21',
        bgSurface: '#3d2b2e',
        bgElevated: '#4d3b3e',

        textPrimary: '#f5d5d8',
        textSecondary: '#d5b5b8',
        textMuted: '#b59598',

        accentPrimary: '#ff6b9d',
        accentSecondary: '#ffa5b8',
        accentTertiary: '#ffcbd8',

        linkColor: '#ff85a8',
        linkHover: '#ffa5b8',

        borderColor: '#5d4b4e',
        borderSubtle: '#4d3b3e',

        success: '#a1d2ba',
        error: '#ff8b6f',
        warning: '#ffb581',
        info: '#ff85a8',

        overlayBg: 'rgba(45, 31, 33, 0.85)',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
      },
    },

    typography: {
      fontMono: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
      fontSans: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
      fontSerif: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',

      baseFontSize: '16px',
      scaleRatio: 1.25,

      lineHeightBase: 1.7,
      lineHeightHeading: 1.35,

      weightNormal: 400,
      weightMedium: 500,
      weightBold: 600,

      letterSpacingBase: '0.015em',
      letterSpacingHeading: '0.01em',
    },

    spacing: {
      base: '1rem',
      scale: [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8],
    },

    animation: {
      transitionDuration: '0.35s',
      transitionTiming: 'ease-in-out',
      enableAnimations: true,
      reducedMotion: false,
    },

    borders: {
      defaultWidth: '1px',
      defaultStyle: 'solid',
      radiusBase: '0',
      radiusLarge: '0',
    },

    effects: {
      paperGrain: true,
      vignette: true,
    },
  },

  layout: {
    navigation: {
      style: 'topbar',
      position: 'top',
      sticky: true,
      showLogo: true,
      logoText: 'Julia Loidolt',
    },

    footer: {
      style: 'centered',
      showSocial: true,
    },

    content: {
      maxWidth: '1200px',
      padding: '2rem',
      centerContent: true,
    },

    homepage: {
      showWelcomeAnimation: true,
      welcomeText: 'julia@creative:~$',
      layout: 'two-column',
    },
  },
};
