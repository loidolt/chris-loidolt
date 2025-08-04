import { ReactNode } from 'react';

interface GardenLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export function GardenLayout({ children, sidebar }: GardenLayoutProps) {
  if (!sidebar) {
    return <main className="container mx-auto px-4 py-8">{children}</main>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <main>{children}</main>
        <aside className="space-y-6">{sidebar}</aside>
      </div>
    </div>
  );
}