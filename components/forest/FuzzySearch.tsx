'use client';

import { useState, useEffect, useMemo } from 'react';
import Fuse, { FuseResult, RangeTuple } from 'fuse.js';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { SeedContent } from '@/lib/seed/types';

interface FuzzySearchProps {
  seeds: SeedContent[];
}

type SearchResult = FuseResult<SeedContent>;

export function FuzzySearch({ seeds }: FuzzySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  // Initialize Fuse.js with search configuration
  const fuse = useMemo(() => {
    return new Fuse(seeds, {
      keys: [
        { name: 'meta.title', weight: 0.4 },
        { name: 'meta.description', weight: 0.3 },
        { name: 'meta.tags', weight: 0.2 },
        { name: 'excerpt', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true,
      ignoreLocation: true,
      useExtendedSearch: true
    });
  }, [seeds]);

  useEffect(() => {
    if (query.length > 1) {
      const searchResults = fuse.search(query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, fuse]);

  const highlightMatch = (text: string, indices?: readonly RangeTuple[]) => {
    if (!indices || indices.length === 0) return text;
    
    let lastIndex = 0;
    const parts: React.ReactElement[] = [];
    
    indices.forEach(([start, end], i) => {
      if (start > lastIndex) {
        parts.push(<span key={`text-${i}`}>{text.substring(lastIndex, start)}</span>);
      }
      parts.push(
        <mark key={`match-${i}`} className="bg-yellow-200 dark:bg-yellow-800">
          {text.substring(start, end + 1)}
        </mark>
      );
      lastIndex = end + 1;
    });
    
    if (lastIndex < text.length) {
      parts.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }
    
    return <>{parts}</>;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Input
          type="search"
          placeholder="Search with fuzzy matching (e.g., 'reac' finds 'React')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Searches titles, descriptions, tags, and content with intelligent fuzzy matching
        </p>
      </div>
      
      {query.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Found {results.length} {results.length === 1 ? 'result' : 'results'}
            </h3>
            {results.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Best match: {Math.round((1 - (results[0].score || 0)) * 100)}% confidence
              </p>
            )}
          </div>

          {results.length > 0 ? (
            <div className="space-y-6">
              {results.slice(0, 10).map((result) => {
                const { item, matches, score } = result;
                const confidence = Math.round((1 - (score || 0)) * 100);
                
                return (
                  <div key={item.slug} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-lg">
                        {matches?.find(m => m.key === 'meta.title') ? (
                          highlightMatch(
                            item.meta.title,
                            matches.find(m => m.key === 'meta.title')?.indices
                          )
                        ) : (
                          item.meta.title
                        )}
                      </h4>
                      <Badge variant="outline" className="ml-2">
                        {confidence}% match
                      </Badge>
                    </div>
                    
                    {item.meta.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {matches?.find(m => m.key === 'meta.description') ? (
                          highlightMatch(
                            item.meta.description,
                            matches.find(m => m.key === 'meta.description')?.indices
                          )
                        ) : (
                          item.meta.description
                        )}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{item.meta.type}</Badge>
                      <Badge variant="secondary">{item.meta.stage}</Badge>
                      {item.meta.tags?.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {matches && matches.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Matched in: {matches.map(m => m.key?.split('.').pop() || '').filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {results.length > 10 && (
                <p className="text-center text-sm text-muted-foreground">
                  Showing top 10 results of {results.length} total matches
                </p>
              )}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No results found for &quot;{query}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
}