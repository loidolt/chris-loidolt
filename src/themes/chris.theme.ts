import { SiteConfig } from './types';

/**
 * Chris's Theme: E-Paper Terminal Aesthetic
 *
 * Inspired by developer tools and code editors with a clean,
 * monospace aesthetic and dark color palette. This is the
 * current default theme extracted into a theme configuration.
 */
export const chrisTheme: SiteConfig = {
  theme: {
    id: 'chris',
    name: 'Terminal Green',
    personSlug: 'chris',
    description: 'E-paper terminal aesthetic with green accents',

    colors: {
      // Light mode (E-Paper cream)
      light: {
        bgPrimary: '#f4f1ea',
        bgSurface: '#e8e5dd',
        bgElevated: '#fdfcfa',

        textPrimary: '#2b2926',
        textSecondary: '#5a5650',
        textMuted: '#8a8479',

        accentPrimary: '#4a7c59',
        accentSecondary: '#7b6c4f',
        accentTertiary: '#6b9b7f',

        linkColor: '#4a6c7c',
        linkHover: '#3a5c6c',

        borderColor: '#d4cfc4',
        borderSubtle: '#e4dfd4',

        success: '#4a7c59',
        error: '#c54a4a',
        warning: '#d29922',
        info: '#4a6c7c',

        overlayBg: 'rgba(43, 41, 38, 0.7)',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
      },

      // Dark mode (E-Paper dark)
      dark: {
        bgPrimary: '#1c1a16',
        bgSurface: '#252219',
        bgElevated: '#2d2a23',

        textPrimary: '#d4c5b0',
        textSecondary: '#b4a595',
        textMuted: '#9a8f7e',

        accentPrimary: '#6b9b7f',
        accentSecondary: '#c9a876',
        accentTertiary: '#8fb09f',

        linkColor: '#7fa5b8',
        linkHover: '#9fb5c8',

        borderColor: '#3a352d',
        borderSubtle: '#2d2a23',

        success: '#6b9b7f',
        error: '#e87c7c',
        warning: '#d29922',
        info: '#7fa5b8',

        overlayBg: 'rgba(28, 26, 22, 0.85)',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
      },
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
      letterSpacingHeading: '0',
    },

    spacing: {
      base: '1rem',
      scale: [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8],
    },

    animation: {
      transitionDuration: '0.3s',
      transitionTiming: 'ease',
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
      style: 'tabs',
      position: 'top',
      sticky: true,
      showLogo: false,
    },

    footer: {
      style: 'split',
      showSocial: true,
      customText: '~/portfolio',
    },

    content: {
      maxWidth: '1280px',
      padding: '1.5rem',
      centerContent: true,
    },

    homepage: {
      showWelcomeAnimation: true,
      welcomeText: 'chris@loidolt:~$',
      layout: 'single-column',
    },
  },
};
