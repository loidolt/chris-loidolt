'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { SeedGrid } from '@/components/seed';
import type { SeedContent } from '@/lib/seed/types';

interface SeedSearchProps {
  seeds: SeedContent[];
}

export function SeedSearch({ seeds }: SeedSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SeedContent[]>([]);

  useEffect(() => {
    if (query.length > 2) {
      const filtered = seeds.filter(seed => {
        const searchQuery = query.toLowerCase();
        return (
          seed.meta.title.toLowerCase().includes(searchQuery) ||
          seed.meta.description?.toLowerCase().includes(searchQuery) ||
          seed.meta.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
        );
      });
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, seeds]);

  return (
    <div className="space-y-6">
      <Input
        type="search"
        placeholder="Search seeds by title, description, or tags..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />
      
      {query.length > 2 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Found {results.length} {results.length === 1 ? 'seed' : 'seeds'}
          </h3>
          <SeedGrid seeds={results} />
        </div>
      )}
    </div>
  );
}