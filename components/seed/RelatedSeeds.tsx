import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { SeedContent } from '@/lib/seed/types';

interface RelatedSeedsProps {
  currentSeed: SeedContent;
  relatedSeeds: SeedContent[];
}

export function RelatedSeeds({ relatedSeeds }: RelatedSeedsProps) {
  if (relatedSeeds.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-semibold mb-6">Related Seeds</h2>
      <div className="grid gap-4">
        {relatedSeeds.map(seed => (
          <Link
            key={seed.slug}
            href={`/forest/${seed.slug}`}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{seed.meta.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {seed.excerpt}
                </p>
              </div>
              <Badge variant="outline">{seed.meta.type}</Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}