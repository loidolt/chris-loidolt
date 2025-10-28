/**
 * Responsive breakpoint utilities
 *
 * Provides reactive breakpoint detection for responsive layouts
 */

import { readable } from 'svelte/store';
import { browser } from '$app/environment';

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Create a readable store that tracks current screen width
 */
export const screenWidth = readable(browser ? window.innerWidth : 1024, (set) => {
  if (!browser) return;

  const updateWidth = () => set(window.innerWidth);

  window.addEventListener('resize', updateWidth);
  return () => window.removeEventListener('resize', updateWidth);
});

/**
 * Create a readable store that returns true when viewport is at or above breakpoint
 */
export function createMediaQuery(breakpoint: Breakpoint) {
  return readable(false, (set) => {
    if (!browser) return;

    const query = window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`);
    set(query.matches);

    const updateMatch = (e: MediaQueryListEvent) => set(e.matches);
    query.addEventListener('change', updateMatch);
    return () => query.removeEventListener('change', updateMatch);
  });
}

/**
 * Pre-created media query stores for common breakpoints
 */
export const isMobile = readable(false, (set) => {
  if (!browser) return;

  const query = window.matchMedia(`(max-width: ${breakpoints.md - 1}px)`);
  set(query.matches);

  const updateMatch = (e: MediaQueryListEvent) => set(e.matches);
  query.addEventListener('change', updateMatch);
  return () => query.removeEventListener('change', updateMatch);
});

export const isTablet = readable(false, (set) => {
  if (!browser) return;

  const query = window.matchMedia(
    `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`
  );
  set(query.matches);

  const updateMatch = (e: MediaQueryListEvent) => set(e.matches);
  query.addEventListener('change', updateMatch);
  return () => query.removeEventListener('change', updateMatch);
});

export const isDesktop = readable(false, (set) => {
  if (!browser) return;

  const query = window.matchMedia(`(min-width: ${breakpoints.lg}px)`);
  set(query.matches);

  const updateMatch = (e: MediaQueryListEvent) => set(e.matches);
  query.addEventListener('change', updateMatch);
  return () => query.removeEventListener('change', updateMatch);
});

/**
 * Get current breakpoint name
 */
export const currentBreakpoint = readable<Breakpoint>('lg', (set) => {
  if (!browser) return;

  const updateBreakpoint = () => {
    const width = window.innerWidth;
    if (width >= breakpoints['2xl']) set('2xl');
    else if (width >= breakpoints.xl) set('xl');
    else if (width >= breakpoints.lg) set('lg');
    else if (width >= breakpoints.md) set('md');
    else set('sm');
  };

  updateBreakpoint();
  window.addEventListener('resize', updateBreakpoint);
  return () => window.removeEventListener('resize', updateBreakpoint);
});
