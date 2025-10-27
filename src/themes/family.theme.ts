import { SiteConfig } from './types';

/**
 * Family Hub Theme: Unified & Welcoming
 *
 * A neutral, welcoming theme that incorporates elements from
 * all family members' themes. Uses balanced colors that work
 * well with collaborative content.
 */
export const familyTheme: SiteConfig = {
  theme: {
    id: 'family',
    name: 'Family Hub',
    description: 'Unified, welcoming theme for the family hub',

    colors: {
      // Light mode - warm neutral
      light: {
        bgPrimary: '#f5f3f0',
        bgSurface: '#eae6e0',
        bgElevated: '#fdfcfa',

        textPrimary: '#2a2824',
        textSecondary: '#5a564f',
        textMuted: '#8a867f',

        accentPrimary: '#5a8c75', // Balanced green-teal
        accentSecondary: '#8b7f6a', // Warm taupe
        accentTertiary: '#7a92b0', // Soft blue

        linkColor: '#5a7c8c',
        linkHover: '#4a6c7c',

        borderColor: '#d0cac0',
        borderSubtle: '#e0dcd0',

        success: '#5a8c75',
        error: '#c55a5a',
        warning: '#d2a922',
        info: '#5a7c8c',

        overlayBg: 'rgba(42, 40, 36, 0.7)',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
      },

      // Dark mode - balanced warm/cool
      dark: {
        bgPrimary: '#1a1816',
        bgSurface: '#252220',
        bgElevated: '#2f2c28',

        textPrimary: '#d5cfc0',
        textSecondary: '#b5afa0',
        textMuted: '#958f80',

        accentPrimary: '#7aac8f', // Soft sage green
        accentSecondary: '#cab88a', // Golden tan
        accentTertiary: '#8aa2c0', // Muted blue

        linkColor: '#8aacbc',
        linkHover: '#aabccc',

        borderColor: '#3a3530',
        borderSubtle: '#2f2c28',

        success: '#7aac8f',
        error: '#e88a8a',
        warning: '#e2b952',
        info: '#8aacbc',

        overlayBg: 'rgba(26, 24, 22, 0.85)',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
      },
    },

    typography: {
      fontMono: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
      fontSans: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
      fontSerif: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',

      baseFontSize: '16px',
      scaleRatio: 1.25,

      lineHeightBase: 1.75,
      lineHeightHeading: 1.35,

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
      showLogo: true,
      logoText: 'Loidolt Family',
    },

    footer: {
      style: 'rich',
      showSocial: true,
      customText: 'The Loidolt Family',
    },

    content: {
      maxWidth: '1400px',
      padding: '2rem',
      centerContent: true,
    },

    homepage: {
      showWelcomeAnimation: true,
      welcomeText: 'loidolt@family:~$',
      layout: 'grid',
    },
  },
};
