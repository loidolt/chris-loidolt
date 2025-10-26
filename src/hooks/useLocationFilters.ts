import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import type { LocationPublic } from '@/lib/airtable';

export interface LocationFiltersResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: Set<string>;
  setSelectedCategories: (categories: Set<string>) => void;
  privacyFilter: 'all' | 'public' | 'private';
  setPrivacyFilter: (filter: 'all' | 'public' | 'private') => void;
  hasImageFilter: boolean | null;
  setHasImageFilter: (filter: boolean | null) => void;
  filteredLocations: LocationPublic[];
  categories: string[];
  filterKey: string;
  activeFilterCount: number;
  clearAllFilters: () => void;
}

/**
 * Hook to manage location filtering logic
 * Handles search, category, privacy, and image filters
 * @param locations - Array of all locations to filter
 * @returns Filtering state and filtered results
 */
export function useLocationFilters(locations: LocationPublic[]): LocationFiltersResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');
  const [hasImageFilter, setHasImageFilter] = useState<boolean | null>(null);

  // Initialize Fuse.js for fuzzy searching
  const fuse = useMemo(
    () =>
      new Fuse(locations, {
        keys: ['name', 'description', 'category', 'categories'],
        threshold: 0.3,
      }),
    [locations]
  );

  // Filter locations based on search and category
  const filteredLocations = useMemo(() => {
    let filtered = locations;

    // Apply search filter
    if (searchQuery) {
      filtered = fuse.search(searchQuery).map((result) => result.item);
    }

    // Apply category filter (multi-select)
    if (selectedCategories.size > 0) {
      filtered = filtered.filter((loc) => {
        // Check if location has any of the selected categories
        if (loc.categories && loc.categories.some(cat => selectedCategories.has(cat))) {
          return true;
        }
        return loc.category && selectedCategories.has(loc.category);
      });
    }

    // Apply privacy filter
    if (privacyFilter !== 'all') {
      filtered = filtered.filter((loc) => {
        if (privacyFilter === 'public') {
          return loc.privacy !== 'Private';
        } else {
          return loc.privacy === 'Private';
        }
      });
    }

    // Apply has image filter
    if (hasImageFilter !== null) {
      filtered = filtered.filter((loc) => {
        return hasImageFilter ? !!loc.image : !loc.image;
      });
    }

    return filtered;
  }, [locations, searchQuery, selectedCategories, privacyFilter, hasImageFilter, fuse]);

  // Get unique categories from all locations
  const categories = useMemo(() => {
    const cats = new Set<string>();
    locations.forEach((loc) => {
      if (loc.categories && loc.categories.length > 0) {
        loc.categories.forEach((cat) => cats.add(cat));
      }
      if (loc.category) {
        cats.add(loc.category);
      }
    });
    return Array.from(cats).sort();
  }, [locations]);

  // Create a filter key to detect when filters change
  const filterKey = useMemo(() => {
    return JSON.stringify({
      search: searchQuery,
      categories: Array.from(selectedCategories).sort(),
      privacy: privacyFilter,
      hasImage: hasImageFilter,
    });
  }, [searchQuery, selectedCategories, privacyFilter, hasImageFilter]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCategories.size > 0) count++;
    if (privacyFilter !== 'all') count++;
    if (hasImageFilter !== null) count++;
    return count;
  }, [searchQuery, selectedCategories, privacyFilter, hasImageFilter]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories(new Set());
    setPrivacyFilter('all');
    setHasImageFilter(null);
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    privacyFilter,
    setPrivacyFilter,
    hasImageFilter,
    setHasImageFilter,
    filteredLocations,
    categories,
    filterKey,
    activeFilterCount,
    clearAllFilters,
  };
}
