import { writable, derived, readable } from 'svelte/store';
import Fuse from 'fuse.js';
import type { LocationPublic } from '$lib/pocketbase';
import { MAP_CONFIG } from '$lib/config/map';

// Filter state stores
export const searchQuery = writable('');
export const selectedCategories = writable<Set<string>>(new Set());
export const privacyFilter = writable<'all' | 'public' | 'private'>('all');
export const hasImageFilter = writable<boolean | null>(null);

// Base locations store (will be set by the page)
export const allLocations = writable<LocationPublic[]>([]);

// Debounced search query - updates after user stops typing
export const debouncedSearchQuery = readable('', (set) => {
  let timeout: ReturnType<typeof setTimeout>;

  const unsubscribe = searchQuery.subscribe((value) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      set(value);
    }, MAP_CONFIG.SEARCH_DEBOUNCE_MS);
  });

  return () => {
    clearTimeout(timeout);
    unsubscribe();
  };
});

// Memoized Fuse instance for better performance
let fuseInstance: Fuse<LocationPublic> | null = null;
let lastLocations: LocationPublic[] = [];

function getFuseInstance(locations: LocationPublic[]): Fuse<LocationPublic> {
  // Only recreate Fuse if locations changed
  if (fuseInstance && lastLocations === locations) {
    return fuseInstance;
  }

  lastLocations = locations;
  fuseInstance = new Fuse(locations, {
    keys: ['name', 'description', 'category', 'categories'],
    threshold: MAP_CONFIG.SEARCH_THRESHOLD,
    ignoreLocation: true, // Don't weight by position in string
    minMatchCharLength: 2, // Minimum characters to match
  });

  return fuseInstance;
}

// Derived store for filtered locations with debounced search
export const filteredLocations = derived(
  [allLocations, debouncedSearchQuery, selectedCategories, privacyFilter, hasImageFilter],
  ([$allLocations, $debouncedSearchQuery, $selectedCategories, $privacyFilter, $hasImageFilter]) => {
    let filtered = $allLocations;

    // Apply search filter with debounced query
    if ($debouncedSearchQuery.trim()) {
      const fuse = getFuseInstance(filtered);
      filtered = fuse.search($debouncedSearchQuery).map((result) => result.item);
    }

    // Apply category filter (multi-select)
    if ($selectedCategories.size > 0) {
      filtered = filtered.filter((loc) => {
        // Check if location has any of the selected categories
        if (loc.categories && loc.categories.some(cat => $selectedCategories.has(cat))) {
          return true;
        }
        return loc.category && $selectedCategories.has(loc.category);
      });
    }

    // Apply privacy filter
    if ($privacyFilter !== 'all') {
      filtered = filtered.filter((loc) => {
        if ($privacyFilter === 'public') {
          return loc.privacy !== 'Private';
        } else {
          return loc.privacy === 'Private';
        }
      });
    }

    // Apply has image filter
    if ($hasImageFilter !== null) {
      filtered = filtered.filter((loc) => {
        return $hasImageFilter ? !!loc.image : !loc.image;
      });
    }

    return filtered;
  }
);

// Derived store for unique categories
export const categories = derived(
  allLocations,
  ($allLocations) => {
    const cats = new Set<string>();
    $allLocations.forEach((loc) => {
      if (loc.categories && loc.categories.length > 0) {
        loc.categories.forEach((cat) => cats.add(cat));
      }
      if (loc.category) {
        cats.add(loc.category);
      }
    });
    return Array.from(cats).sort();
  }
);

// Derived store for filter key (used to detect changes)
export const filterKey = derived(
  [searchQuery, selectedCategories, privacyFilter, hasImageFilter],
  ([$searchQuery, $selectedCategories, $privacyFilter, $hasImageFilter]) => {
    return JSON.stringify({
      search: $searchQuery,
      categories: Array.from($selectedCategories).sort(),
      privacy: $privacyFilter,
      hasImage: $hasImageFilter,
    });
  }
);

// Derived store for active filter count
export const activeFilterCount = derived(
  [debouncedSearchQuery, selectedCategories, privacyFilter, hasImageFilter],
  ([$debouncedSearchQuery, $selectedCategories, $privacyFilter, $hasImageFilter]) => {
    let count = 0;
    if ($debouncedSearchQuery.trim()) count++;
    if ($selectedCategories.size > 0) count++;
    if ($privacyFilter !== 'all') count++;
    if ($hasImageFilter !== null) count++;
    return count;
  }
);

// Action to clear all filters
export function clearAllFilters() {
  searchQuery.set('');
  selectedCategories.set(new Set());
  privacyFilter.set('all');
  hasImageFilter.set(null);
}
