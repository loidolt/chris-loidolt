'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ContentType, GrowthStage } from '@/lib/seed/types';

interface SeedFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  type?: ContentType;
  stage?: GrowthStage;
  featured?: boolean;
}

const contentTypes: { value: ContentType; label: string; emoji: string }[] = [
  { value: 'project', label: 'Projects', emoji: '🚀' },
  { value: 'experiment', label: 'Experiments', emoji: '🧪' },
  { value: 'note', label: 'Notes', emoji: '📝' },
  { value: 'writing', label: 'Writing', emoji: '✍️' },
];

const growthStages: { value: GrowthStage; label: string; emoji: string }[] = [
  { value: 'sprout', label: 'Sprout', emoji: '🌱' },
  { value: 'sapling', label: 'Sapling', emoji: '🌿' },
  { value: 'mature', label: 'Mature', emoji: '🌳' },
  { value: 'ancient', label: 'Ancient', emoji: '🌲' },
];

export function SeedFilter({ onFilterChange }: SeedFilterProps) {
  const [filters, setFilters] = useState<FilterState>({});

  const updateFilter = (update: Partial<FilterState>) => {
    const newFilters = { ...filters, ...update };
    
    // Remove undefined values
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key as keyof FilterState] === undefined) {
        delete newFilters[key as keyof FilterState];
      }
    });
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium mb-2">Content Type</h4>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map(type => (
              <Badge
                key={type.value}
                variant={filters.type === type.value ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => updateFilter({ 
                  type: filters.type === type.value ? undefined : type.value 
                })}
              >
                {type.emoji} {type.label}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Growth Stage</h4>
          <div className="flex flex-wrap gap-2">
            {growthStages.map(stage => (
              <Badge
                key={stage.value}
                variant={filters.stage === stage.value ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => updateFilter({ 
                  stage: filters.stage === stage.value ? undefined : stage.value 
                })}
              >
                {stage.emoji} {stage.label}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Featured</h4>
          <Badge
            variant={filters.featured === true ? 'default' : 'outline'}
            className="cursor-pointer transition-colors"
            onClick={() => updateFilter({ 
              featured: filters.featured === true ? undefined : true 
            })}
          >
            ⭐ Featured Only
          </Badge>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Active filters: {Object.keys(filters).length}
          </p>
        </div>
      )}
    </div>
  );
}