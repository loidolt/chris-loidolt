'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function LayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isGISPage = pathname === '/gis';
  const isProjectsPage = pathname === '/projects' || pathname.startsWith('/projects/');

  if (isGISPage) {
    // Full-width, full-height layout for GIS page
    return (
      <main className="flex-1" style={{ position: 'relative', minHeight: 0 }}>
        {children}
      </main>
    );
  }

  if (isProjectsPage) {
    // Wider layout for projects page with split panel
    return (
      <main className="flex-1">
        {children}
      </main>
    );
  }

  // Standard constrained layout for other pages
  return (
    <main className="flex-1 container mx-auto px-6 py-12 max-w-6xl">
      {children}
    </main>
  );
}
