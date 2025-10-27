import { SiteConfig } from './types';

/**
 * Theo's Theme: Cool Tech
 *
 * A cool, tech-focused aesthetic with blue and purple accents.
 * Modern and sleek with a focus on clarity and functionality.
 */
export const theoTheme: SiteConfig = {
  theme: {
    id: 'theo',
    name: 'Electric Blue',
    personSlug: 'theo',
    description: 'Cool, tech-focused aesthetic with blue and purple tones',

    colors: {
      // Light mode - crisp blues
      light: {
        bgPrimary: '#f0f4f8',
        bgSurface: '#e3eaf0',
        bgElevated: '#f8fbfd',

        textPrimary: '#1e293b',
        textSecondary: '#475569',
        textMuted: '#64748b',

        accentPrimary: '#4834d4',
        accentSecondary: '#686de0',
        accentTertiary: '#95a4fc',

        linkColor: '#2563eb',
        linkHover: '#1d4ed8',

        borderColor: '#cbd5e1',
        borderSubtle: '#e2e8f0',

        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',

        overlayBg: 'rgba(30, 41, 59, 0.7)',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
      },

      // Dark mode - deep tech
      dark: {
        bgPrimary: '#0f172a',
        bgSurface: '#1e293b',
        bgElevated: '#334155',

        textPrimary: '#e2e8f0',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',

        accentPrimary: '#8b7cf6',
        accentSecondary: '#a78bfa',
        accentTertiary: '#c4b5fd',

        linkColor: '#60a5fa',
        linkHover: '#93c5fd',

        borderColor: '#334155',
        borderSubtle: '#1e293b',

        success: '#34d399',
        error: '#f87171',
        warning: '#fbbf24',
        info: '#60a5fa',

        overlayBg: 'rgba(15, 23, 42, 0.85)',
        shadowColor: 'rgba(0, 0, 0, 0.4)',
      },
    },

    typography: {
      fontMono: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
      fontSans: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
      fontSerif: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',

      baseFontSize: '16px',
      scaleRatio: 1.2,

      lineHeightBase: 1.65,
      lineHeightHeading: 1.25,

      weightNormal: 400,
      weightMedium: 500,
      weightBold: 700,

      letterSpacingBase: '0',
      letterSpacingHeading: '-0.01em',
    },

    spacing: {
      base: '1rem',
      scale: [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8],
    },

    animation: {
      transitionDuration: '0.25s',
      transitionTiming: 'cubic-bezier(0.4, 0, 0.2, 1)',
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
      paperGrain: false,
      vignette: false,
    },
  },

  layout: {
    navigation: {
      style: 'sidebar',
      position: 'left',
      sticky: true,
      showLogo: true,
      logoText: 'TL',
    },

    footer: {
      style: 'minimal',
      showSocial: true,
    },

    content: {
      maxWidth: '1400px',
      padding: '2rem',
      centerContent: false,
    },

    homepage: {
      showWelcomeAnimation: true,
      welcomeText: 'theo@tech:~$',
      layout: 'grid',
    },
  },
};
