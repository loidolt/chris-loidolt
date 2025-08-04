import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SeedContent } from '@/lib/seed/types';

interface SeedCardProps {
  seed: SeedContent;
}

const stageColors = {
  sprout: 'bg-green-100 text-green-800',
  sapling: 'bg-yellow-100 text-yellow-800',
  mature: 'bg-blue-100 text-blue-800',
  ancient: 'bg-purple-100 text-purple-800',
};

const stageEmojis = {
  sprout: '🌱',
  sapling: '🌿',
  mature: '🌳',
  ancient: '🌲',
};

export function SeedCard({ seed }: SeedCardProps) {
  return (
    <Link href={`/forest/${seed.slug}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge className={stageColors[seed.meta.stage]}>
              {stageEmojis[seed.meta.stage]} {seed.meta.stage}
            </Badge>
            {seed.meta.featured && (
              <Badge variant="secondary">⭐ Featured</Badge>
            )}
          </div>
          <CardTitle className="line-clamp-2">{seed.meta.title}</CardTitle>
          <CardDescription className="line-clamp-3">
            {seed.meta.description || seed.excerpt}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {seed.meta.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {seed.meta.tags && seed.meta.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{seed.meta.tags.length - 3}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{seed.readingTime} min read</span>
            <span>{seed.meta.type}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}