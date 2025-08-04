'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SeedContent } from '@/lib/seed/types';

interface GrowthTimelineProps {
  seeds: SeedContent[];
  limit?: number;
}

interface TimelineEntry {
  seed: SeedContent;
  date: Date;
  type: 'planted' | 'tended';
}

const stageEmojis = {
  seedling: '🌱',
  budding: '🌿',
  evergreen: '🌳',
  perennial: '🌲',
};

const typeEmojis = {
  project: '🚀',
  experiment: '🧪',
  note: '📝',
  writing: '✍️',
};

export function GrowthTimeline({ seeds, limit = 10 }: GrowthTimelineProps) {
  const timelineEntries = useMemo(() => {
    const entries: TimelineEntry[] = [];

    seeds.forEach(seed => {
      if (seed.meta.planted) {
        entries.push({
          seed,
          date: new Date(seed.meta.planted),
          type: 'planted'
        });
      }
      
      if (seed.meta.tended && seed.meta.tended !== seed.meta.planted) {
        entries.push({
          seed,
          date: new Date(seed.meta.tended),
          type: 'tended'
        });
      }
    });

    // Sort by date descending
    return entries
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }, [seeds, limit]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (timelineEntries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No timeline data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineEntries.map((entry, index) => (
            <div
              key={`${entry.seed.slug}-${entry.type}-${index}`}
              className="flex items-start gap-4 relative"
            >
              {/* Timeline line */}
              {index < timelineEntries.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
              )}
              
              {/* Timeline dot */}
              <div className="relative z-10 mt-1">
                <div className={`w-3 h-3 rounded-full ${
                  entry.type === 'planted' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium truncate">
                    {entry.seed.meta.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(entry.date)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {stageEmojis[entry.seed.meta.stage]} {entry.seed.meta.stage}
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs">
                    {typeEmojis[entry.seed.meta.type]} {entry.seed.meta.type}
                  </Badge>
                  
                  <span className="text-xs text-muted-foreground">
                    {entry.type === 'planted' ? '🌱 Planted' : '💧 Tended'}
                  </span>
                </div>
                
                {entry.seed.meta.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {entry.seed.meta.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}