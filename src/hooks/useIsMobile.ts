'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect mobile screen sizes
 * Uses a shared resize listener for better performance when used in multiple components
 *
 * @param breakpoint - The breakpoint width in pixels (default: 640px / Tailwind's sm breakpoint)
 * @returns boolean indicating if the screen width is below the breakpoint
 */
export function useIsMobile(breakpoint: number = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Set initial value
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}
