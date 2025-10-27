'use client';

/**
 * Root Layout Client Component
 *
 * Client-side wrapper that provides theme context and renders
 * the appropriate person-specific layout based on the current
 * person slug from middleware.
 */

import { ReactNode } from 'react';
import { ThemeProvider } from '@/lib/theme-provider';
import { getLayoutBySlug } from '@/layouts';
import type { PersonSlug } from '@/themes/types';

interface RootLayoutClientProps {
  children: ReactNode;
  personSlug: PersonSlug;
}

export default function RootLayoutClient({ children, personSlug }: RootLayoutClientProps) {
  // Get the appropriate layout component for this person
  const LayoutComponent = getLayoutBySlug(personSlug);

  return (
    <ThemeProvider personSlug={personSlug}>
      <LayoutComponent>{children}</LayoutComponent>
    </ThemeProvider>
  );
}
