'use client';

import { useState, useMemo } from 'react';
import { 
  SeedSearch,
  SeedFilter,
  TagCloud,
  GrowthTimeline,
  FuzzySearch,
  SeedNetwork,
  type FilterState
} from '@/components/forest';
import { SeedGrid } from '@/components/seed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SeedContent } from '@/lib/seed/types';

interface ForestExploreClientProps {
  seeds: SeedContent[];
}

export function ForestExploreClient({ seeds }: ForestExploreClientProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedTag, setSelectedTag] = useState<string>();

  // Filter seeds based on current filters and selected tag
  const filteredSeeds = useMemo(() => {
    let result = [...seeds];

    if (filters.type) {
      result = result.filter(seed => seed.meta.type === filters.type);
    }

    if (filters.stage) {
      result = result.filter(seed => seed.meta.stage === filters.stage);
    }

    if (filters.featured) {
      result = result.filter(seed => seed.meta.featured === true);
    }

    if (selectedTag) {
      result = result.filter(seed => seed.meta.tags?.includes(selectedTag));
    }

    return result;
  }, [seeds, filters, selectedTag]);

  return (
    <Tabs defaultValue="browse" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="browse">Browse</TabsTrigger>
        <TabsTrigger value="search">Search</TabsTrigger>
        <TabsTrigger value="fuzzy">Smart Search</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="network">Network</TabsTrigger>
      </TabsList>

      <TabsContent value="browse" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-1 space-y-6">
            <SeedFilter onFilterChange={setFilters} />
            
            <div className="sticky top-6">
              <TagCloud 
                seeds={seeds}
                selectedTag={selectedTag}
                onTagClick={setSelectedTag}
              />
            </div>
          </div>

          <div className="md:col-span-3">
            {selectedTag && (
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Seeds tagged with &quot;{selectedTag}&quot;
                </h3>
                <button
                  onClick={() => setSelectedTag(undefined)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear tag filter
                </button>
              </div>
            )}
            
            <SeedGrid 
              seeds={filteredSeeds}
              emptyMessage="No seeds match your current filters"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="search" className="space-y-6">
        <SeedSearch seeds={seeds} />
      </TabsContent>

      <TabsContent value="fuzzy" className="space-y-6">
        <FuzzySearch seeds={seeds} />
      </TabsContent>

      <TabsContent value="timeline" className="space-y-6">
        <div className="max-w-4xl mx-auto">
          <GrowthTimeline seeds={seeds} limit={20} />
        </div>
      </TabsContent>

      <TabsContent value="network" className="space-y-6">
        <SeedNetwork seeds={seeds} />
      </TabsContent>
    </Tabs>
  );
}