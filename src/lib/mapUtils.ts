import type * as LeafletType from 'leaflet';
import type { LocationPublic } from '$lib/pocketbase';
import type { MarkerDiff, Coordinates } from '$lib/types/map';
import { MAP_CONFIG, CATEGORY_COLORS } from '$lib/config/map';
import { storage } from '$lib/utils/helpers';

/**
 * Function to fuzz coordinates for private locations using cryptographically secure random offsets
 * Returns coordinates offset by a random amount within a radius
 * Offsets are stored in localStorage to ensure consistency within the same browser/device
 */
export function fuzzCoordinates(lat: number, lng: number, locationId: string): [number, number] {
  const STORAGE_KEY = MAP_CONFIG.STORAGE_KEYS.LOCATION_OFFSETS;
  const radiusInDegrees = MAP_CONFIG.PRIVATE_LOCATION_FUZZ_KM * MAP_CONFIG.KM_TO_DEGREES;

  try {
    // Retrieve or initialize offset storage
    const storedData = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const offsetMap: Record<string, { latOffset: number; lngOffset: number }> = storedData
      ? JSON.parse(storedData)
      : {};

    // Check if we already have an offset for this location
    if (offsetMap[locationId]) {
      const { latOffset, lngOffset } = offsetMap[locationId];
      return [lat + latOffset, lng + lngOffset];
    }

    // Generate new cryptographically secure random offset
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const randomArray = new Uint32Array(2);
      window.crypto.getRandomValues(randomArray);

      // Convert to angle and distance
      const angle = (randomArray[0] / 0xFFFFFFFF) * 2 * Math.PI;
      const distance = (randomArray[1] / 0xFFFFFFFF) * radiusInDegrees;

      const latOffset = Math.cos(angle) * distance;
      const lngOffset = Math.sin(angle) * distance;

      // Store for future use
      offsetMap[locationId] = { latOffset, lngOffset };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offsetMap));

      return [lat + latOffset, lng + lngOffset];
    }

    // Fallback for server-side rendering or browsers without crypto API
    // Use deterministic hash-based offset that doesn't require randomness
    // This ensures consistent offsets per location ID without using weak RNG
    const hash = (str: string, seed = 0): number => {
      let h = seed;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h = h & h; // Convert to 32-bit integer
      }
      return Math.abs(h);
    };

    // Generate deterministic but unpredictable offsets based on location ID
    // Use different seeds for angle and distance to get different values
    const angle = ((hash(locationId, 12345) % 360) * (Math.PI / 180));
    const distance = ((hash(locationId, 67890) % 10000) / 10000) * radiusInDegrees;

    const latOffset = Math.cos(angle) * distance;
    const lngOffset = Math.sin(angle) * distance;

    // Store the deterministic offset for consistency
    offsetMap[locationId] = { latOffset, lngOffset };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offsetMap));
    }

    return [lat + latOffset, lng + lngOffset];
  } catch (error) {
    console.error('[fuzzCoordinates] Error fuzzing coordinates:', error);
    // If all else fails, return original coordinates
    return [lat, lng];
  }
}

/**
 * Custom marker icon with e-ink styling
 * Creates SVG-based marker icons with category-specific colors
 */
export function createCustomIcon(L: typeof LeafletType, category?: string, isLocked: boolean = false): LeafletType.Icon {
  const color = isLocked
    ? 'var(--text-muted)'
    : (CATEGORY_COLORS[category?.toLowerCase() || 'default'] || CATEGORY_COLORS.default);

  const lockIcon = isLocked ? `
    <g transform="translate(7.5, 7.5)">
      <rect x="3" y="5" width="7" height="6" rx="1" fill="var(--bg-primary)" stroke="${color}" stroke-width="1"/>
      <path d="M4.5 5 V3.5 A2 2 0 0 1 8.5 3.5 V5" fill="none" stroke="${color}" stroke-width="1"/>
      <circle cx="6.5" cy="8" r="1" fill="${color}"/>
    </g>
  ` : `<circle cx="12.5" cy="12.5" r="4" fill="var(--bg-primary)"/>`;

  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.5 12.5 28.5S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z"
            fill="${color}"
            stroke="var(--bg-primary)"
            stroke-width="2"
            opacity="${isLocked ? '0.6' : '1'}"/>
      ${lockIcon}
    </svg>
  `;

  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

/**
 * Calculate marker diff to efficiently update only changed markers
 * Returns what needs to be added, removed, and updated
 */
export function calculateMarkerDiff(
  currentLocations: LocationPublic[],
  newLocations: LocationPublic[],
  unlockedLocations?: Set<string>
): MarkerDiff {
  const currentIds = new Set(currentLocations.map(loc => loc.id));
  const newIds = new Set(newLocations.map(loc => loc.id));

  // Locations to add (in new but not in current)
  const toAdd = newLocations.filter(loc => !currentIds.has(loc.id));

  // Locations to remove (in current but not in new)
  const toRemove = currentLocations
    .filter(loc => !newIds.has(loc.id))
    .map(loc => loc.id);

  // Locations to update (in both, but may have changed lock state)
  const toUpdate: LocationPublic[] = [];
  if (unlockedLocations) {
    for (const loc of newLocations) {
      if (currentIds.has(loc.id)) {
        // Check if lock state might have changed
        const wasInCurrent = currentLocations.find(c => c.id === loc.id);
        if (wasInCurrent) {
          // If privacy changed or location was unlocked, we need to update
          toUpdate.push(loc);
        }
      }
    }
  }

  return { toAdd, toRemove, toUpdate };
}

/**
 * Validate if location has required coordinates
 */
export function hasValidCoordinates(location: LocationPublic): boolean {
  return (
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    !isNaN(location.latitude) &&
    !isNaN(location.longitude)
  );
}

/**
 * Get coordinates for a location (fuzzy if locked)
 */
export function getLocationCoordinates(
  location: LocationPublic,
  isLocked: boolean
): Coordinates {
  if (!hasValidCoordinates(location)) {
    throw new Error(`Location ${location.id} has invalid coordinates`);
  }

  if (isLocked) {
    return fuzzCoordinates(location.latitude, location.longitude, location.id);
  }

  return [location.latitude, location.longitude];
}

/**
 * Throttle resize events to avoid excessive map invalidation
 */
export function createThrottledResizeObserver(
  callback: () => void,
  delay: number = 100
): ResizeObserver {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return new ResizeObserver(() => {
    if (timeout) return;

    timeout = setTimeout(() => {
      callback();
      timeout = null;
    }, delay);
  });
}
