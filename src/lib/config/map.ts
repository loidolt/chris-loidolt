/**
 * Map configuration constants
 * Centralized configuration for the GIS map system
 */

export const MAP_CONFIG = {
  // Default map view
  DEFAULT_CENTER: [39.5, -98.35] as [number, number], // Center of US
  DEFAULT_ZOOM: 4,
  MAX_ZOOM: 19,
  MIN_ZOOM: 2,

  // Tile layer configuration
  TILE_RETRY_LIMIT: 3,
  TILE_SUBDOMAINS: ['a', 'b', 'c'] as const,
  TILE_BASE_DELAY_MS: 1000,
  TILE_OSM_DELAY_MS: 500,
  TILE_ZOOM_THRESHOLD: 13, // Switch to OSM at this zoom level

  // Clustering
  AUTO_CLUSTER_THRESHOLD: 10, // Auto-enable clustering if more than N locations
  CLUSTER_RADIUS: {
    ZOOM_0_3: 400,
    ZOOM_4_5: 300,
    ZOOM_6_7: 200,
    ZOOM_8_10: 120,
    ZOOM_11_PLUS: 80,
  } as const,

  // Private location fuzzing
  PRIVATE_LOCATION_FUZZ_KM: 2,
  KM_TO_DEGREES: 0.009, // Approximate conversion (1km ≈ 0.009 degrees)

  // Auto-zoom behavior
  FIT_BOUNDS_PADDING: [50, 50] as [number, number],
  FIT_BOUNDS_MAX_ZOOM: 13,

  // Map invalidation
  INVALIDATE_DELAY_MS: 100,

  // Search and filtering
  SEARCH_DEBOUNCE_MS: 300,
  SEARCH_THRESHOLD: 0.3, // Fuse.js threshold

  // LocalStorage keys
  STORAGE_KEYS: {
    CLUSTERING_ENABLED: 'mapClusteringEnabled',
    AUTO_ZOOM_ENABLED: 'mapAutoZoomToExtents',
    UNLOCKED_LOCATIONS: 'unlockedLocations',
    LOCATION_OFFSETS: 'map_location_offsets',
    DRAWINGS: 'map-drawings',
  } as const,
} as const;

/**
 * Category colors for map markers
 */
export const CATEGORY_COLORS: Record<string, string> = {
  landmark: 'var(--accent-primary)',
  trail: 'var(--accent-secondary)',
  camp: 'var(--link-color)',
  default: 'var(--text-primary)',
} as const;

/**
 * Tile layer configurations
 */
export const TILE_LAYERS = {
  OPENTOPO: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
    maxNativeZoom: 13,
  },
  OSM: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    minZoom: 13,
    opacity: 0.8,
  },
} as const;

/**
 * Get adaptive cluster radius based on zoom level
 */
export function getClusterRadius(zoom: number): number {
  if (zoom <= 3) return MAP_CONFIG.CLUSTER_RADIUS.ZOOM_0_3;
  if (zoom <= 5) return MAP_CONFIG.CLUSTER_RADIUS.ZOOM_4_5;
  if (zoom <= 7) return MAP_CONFIG.CLUSTER_RADIUS.ZOOM_6_7;
  if (zoom <= 10) return MAP_CONFIG.CLUSTER_RADIUS.ZOOM_8_10;
  return MAP_CONFIG.CLUSTER_RADIUS.ZOOM_11_PLUS;
}
