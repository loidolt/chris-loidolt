import { SeedCard } from './SeedCard';
import type { SeedContent } from '@/lib/seed/types';

interface SeedGridProps {
  seeds: SeedContent[];
  emptyMessage?: string;
}

export function SeedGrid({ seeds, emptyMessage = 'No seeds found.' }: SeedGridProps) {
  if (seeds.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {seeds.map((seed) => (
        <SeedCard key={seed.slug} seed={seed} />
      ))}
    </div>
  );
}