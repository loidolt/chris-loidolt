'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { SeedContent } from '@/lib/seed/types';

interface TagCloudProps {
  seeds: SeedContent[];
  selectedTag?: string;
  onTagClick?: (tag: string) => void;
  asLinks?: boolean;
}

interface TagData {
  tag: string;
  count: number;
  size: 'sm' | 'md' | 'lg' | 'xl';
}

export function TagCloud({ seeds, selectedTag, onTagClick, asLinks = false }: TagCloudProps) {
  const tagData = useMemo(() => {
    // Count occurrences of each tag
    const tagCounts = new Map<string, number>();
    
    seeds.forEach(seed => {
      seed.meta.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Convert to array and sort by count
    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));

    // Calculate size categories based on count
    const maxCount = Math.max(...sortedTags.map(t => t.count));
    const minCount = Math.min(...sortedTags.map(t => t.count));
    const range = maxCount - minCount;

    return sortedTags.map(({ tag, count }): TagData => {
      let size: TagData['size'];
      
      if (range === 0) {
        size = 'md';
      } else {
        const normalized = (count - minCount) / range;
        if (normalized >= 0.75) size = 'xl';
        else if (normalized >= 0.5) size = 'lg';
        else if (normalized >= 0.25) size = 'md';
        else size = 'sm';
      }

      return { tag, count, size };
    });
  }, [seeds]);

  if (tagData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No tags found</p>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
    xl: 'text-lg px-5 py-2.5 font-medium'
  };

  const TagElement = ({ data }: { data: TagData }) => {
    const isSelected = selectedTag === data.tag;
    
    const badge = (
      <Badge
        variant={isSelected ? 'default' : 'outline'}
        className={`${sizeClasses[data.size]} cursor-pointer hover:shadow-sm transition-all`}
        onClick={!asLinks ? () => onTagClick?.(data.tag) : undefined}
      >
        {data.tag}
        <span className="ml-1 text-xs opacity-70">({data.count})</span>
      </Badge>
    );

    if (asLinks) {
      return (
        <Link href={`/tags/${encodeURIComponent(data.tag)}`}>
          {badge}
        </Link>
      );
    }

    return badge;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Browse by Tags</h3>
        <span className="text-sm text-muted-foreground">
          {tagData.length} tags
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tagData.map(data => (
          <TagElement key={data.tag} data={data} />
        ))}
      </div>
    </div>
  );
}