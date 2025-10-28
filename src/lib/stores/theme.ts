import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

// Initialize theme from localStorage or system preference
const getInitialTheme = (): Theme => {
  if (!browser) return 'dark';

  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

// Create writable store
export const theme = writable<Theme>(getInitialTheme());

// Subscribe to theme changes and update DOM + localStorage
if (browser) {
  theme.subscribe((value) => {
    // shadcn uses 'dark' class, no class for light mode
    document.documentElement.classList.toggle('dark', value === 'dark');
    localStorage.setItem('theme', value);
  });
}

// Toggle function
export function toggleTheme() {
  theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
}
