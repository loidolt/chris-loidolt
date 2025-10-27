'use client';

/**
 * Theme Provider
 *
 * Provides theme context to the entire application, manages
 * light/dark mode switching, and applies CSS custom properties
 * dynamically based on the current person's theme.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { SiteConfig, ThemeMode, PersonSlug } from '@/themes/types';
import { getThemeBySlug, generateThemeVariables } from '@/themes';

interface ThemeContextValue {
  // Current theme configuration
  siteConfig: SiteConfig;
  personSlug: PersonSlug;

  // Theme mode (light/dark)
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;

  // Mounted state (for preventing hydration mismatches)
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  personSlug?: PersonSlug;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({
  children,
  personSlug = 'chris',
  defaultMode = 'dark',
}: ThemeProviderProps) {
  const [siteConfig] = useState<SiteConfig>(() => getThemeBySlug(personSlug));
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);

    // Check for saved theme preference or use system preference
    const savedMode = localStorage.getItem('theme') as ThemeMode | null;

    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setModeState(savedMode);
      applyTheme(savedMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemMode: ThemeMode = prefersDark ? 'dark' : 'light';
      setModeState(systemMode);
      applyTheme(systemMode);
    }
  }, []);

  // Apply theme whenever mode changes
  useEffect(() => {
    if (mounted) {
      applyTheme(mode);
    }
  }, [mode, mounted]);

  const applyTheme = (newMode: ThemeMode) => {
    const root = document.documentElement;

    // Apply light class
    if (newMode === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }

    // Generate and apply CSS custom properties
    const variables = generateThemeVariables(siteConfig.theme, newMode);

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Also set legacy CSS variables for backward compatibility
    setLegacyVariables(newMode);
  };

  const setLegacyVariables = (newMode: ThemeMode) => {
    const root = document.documentElement;
    const palette = newMode === 'light' ? siteConfig.theme.colors.light : siteConfig.theme.colors.dark;

    // Map new variables to old variable names for backward compatibility
    root.style.setProperty('--bg-primary', palette.bgPrimary);
    root.style.setProperty('--bg-surface', palette.bgSurface);
    root.style.setProperty('--text-primary', palette.textPrimary);
    root.style.setProperty('--text-muted', palette.textMuted);
    root.style.setProperty('--accent-primary', palette.accentPrimary);
    root.style.setProperty('--accent-secondary', palette.accentSecondary);
    root.style.setProperty('--link-color', palette.linkColor);
    root.style.setProperty('--border-color', palette.borderColor);
    root.style.setProperty('--error-color', palette.error);
    root.style.setProperty('--success-color', palette.success);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('theme', newMode);
  };

  const toggleMode = () => {
    const newMode: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  const value: ThemeContextValue = {
    siteConfig,
    personSlug,
    mode,
    setMode,
    toggleMode,
    mounted,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Hook for simplified theme mode access
 */
export function useThemeMode() {
  const { mode, setMode, toggleMode, mounted } = useThemeContext();
  return { mode, setMode, toggleMode, mounted };
}

/**
 * Hook to get current site configuration
 */
export function useSiteConfig() {
  const { siteConfig, personSlug } = useThemeContext();
  return { siteConfig, personSlug };
}
