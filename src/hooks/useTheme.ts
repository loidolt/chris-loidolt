import { useState, useEffect } from 'react';

/**
 * Hook to detect theme changes (dark/light mode)
 * Watches for class changes on document.documentElement
 * @returns {boolean} isDark - true if dark theme is active
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light');
      setIsDark(!isLight);
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}
