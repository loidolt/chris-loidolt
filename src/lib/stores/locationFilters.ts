import { writable, derived } from 'svelte/store';
import Fuse from 'fuse.js';
import type { LocationPublic } from '$lib/pocketbase';

// Filter state stores
export const searchQuery = writable('');
export const selectedCategories = writable<Set<string>>(new Set());
export const privacyFilter = writable<'all' | 'public' | 'private'>('all');
export const hasImageFilter = writable<boolean | null>(null);

// Base locations store (will be set by the page)
export const allLocations = writable<LocationPublic[]>([]);

// Derived store for filtered locations
export const filteredLocations = derived(
  [allLocations, searchQuery, selectedCategories, privacyFilter, hasImageFilter],
  ([$allLocations, $searchQuery, $selectedCategories, $privacyFilter, $hasImageFilter]) => {
    let filtered = $allLocations;

    // Apply search filter
    if ($searchQuery) {
      const fuse = new Fuse(filtered, {
        keys: ['name', 'description', 'category', 'categories'],
        threshold: 0.3,
      });
      filtered = fuse.search($searchQuery).map((result) => result.item);
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
  [searchQuery, selectedCategories, privacyFilter, hasImageFilter],
  ([$searchQuery, $selectedCategories, $privacyFilter, $hasImageFilter]) => {
    let count = 0;
    if ($searchQuery) count++;
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
