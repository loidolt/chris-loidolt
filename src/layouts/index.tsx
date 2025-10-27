/**
 * Layout Registry
 *
 * Maps person slugs to their layout components.
 */

import { ReactNode, ComponentType } from 'react';
import ChrisLayout from './ChrisLayout';
import JuliaLayout from './JuliaLayout';
import TheoLayout from './TheoLayout';
import JackLayout from './JackLayout';
import FamilyLayout from './FamilyLayout';
import type { PersonSlug } from '@/themes/types';

interface LayoutProps {
  children: ReactNode;
}

type LayoutComponent = ComponentType<LayoutProps>;

/**
 * Layout registry mapping person slugs to layout components
 */
export const layouts: Record<PersonSlug, LayoutComponent> = {
  chris: ChrisLayout,
  julia: JuliaLayout,
  theo: TheoLayout,
  jack: JackLayout,
  family: FamilyLayout,
};

/**
 * Get layout component by person slug
 */
export function getLayoutBySlug(slug: string): LayoutComponent {
  const validSlugs: PersonSlug[] = ['chris', 'julia', 'theo', 'jack', 'family'];

  if (validSlugs.includes(slug as PersonSlug)) {
    return layouts[slug as PersonSlug];
  }

  // Fallback to Chris's layout
  return ChrisLayout;
}

/**
 * Re-export layout components for direct imports
 */
export { ChrisLayout, JuliaLayout, TheoLayout, JackLayout, FamilyLayout };
export { default as BaseLayout } from './BaseLayout';
