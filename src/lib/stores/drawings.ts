import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { FeatureCollection } from 'geojson';

const STORAGE_KEY = 'map-drawings';

// Initialize default drawings
const defaultDrawings: FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

// Load drawings from localStorage if in browser
function loadDrawings(): FeatureCollection {
  if (!browser) return defaultDrawings;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.type === 'FeatureCollection') {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading drawings from localStorage:', error);
  }

  return defaultDrawings;
}

// Create the drawings store
export const drawings = writable<FeatureCollection>(loadDrawings());

// Subscribe to changes and save to localStorage
if (browser) {
  drawings.subscribe((value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving drawings to localStorage:', error);
    }
  });
}

// Export drawings as GeoJSON file
export function exportDrawingsAsGeoJSON() {
  if (!browser) return false;

  try {
    let currentDrawings: FeatureCollection = defaultDrawings;
    drawings.subscribe((value) => { currentDrawings = value; })();

    const dataStr = JSON.stringify(currentDrawings, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `map-drawings-${new Date().toISOString().split('T')[0]}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Error exporting GeoJSON:', error);
    return false;
  }
}

// Clear all drawings
export function clearAllDrawings() {
  drawings.set(defaultDrawings);

  if (browser) {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing drawings from localStorage:', error);
      return false;
    }
  }

  return true;
}
