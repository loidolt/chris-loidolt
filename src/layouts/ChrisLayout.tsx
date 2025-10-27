'use client';

/**
 * Chris's Layout
 *
 * Terminal-style tab navigation with the current design.
 * This layout preserves the existing navigation structure.
 */

import { ReactNode } from 'react';
import BaseLayout from './BaseLayout';
import Navigation from '@/components/Navigation';

interface ChrisLayoutProps {
  children: ReactNode;
}

export default function ChrisLayout({ children }: ChrisLayoutProps) {
  return (
    <BaseLayout
      navigation={<Navigation />}
      className="chris-layout"
    >
      {children}
    </BaseLayout>
  );
}
