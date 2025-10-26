import L from 'leaflet';

/**
 * Function to fuzz coordinates for private locations using cryptographically secure random offsets
 * Returns coordinates offset by a random amount within a radius
 * Offsets are stored in localStorage to ensure consistency within the same browser/device
 */
export function fuzzCoordinates(lat: number, lng: number, locationId: string): [number, number] {
  const STORAGE_KEY = 'map_location_offsets';
  const MAX_OFFSET_KM = 2; // Maximum offset in kilometers
  const KM_TO_DEGREES = 0.009; // Approximate conversion (1km ≈ 0.009 degrees)
  const radiusInDegrees = MAX_OFFSET_KM * KM_TO_DEGREES;

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
    // Use a different method that's still unpredictable but consistent per session
    const sessionSeed = Date.now() + Math.random();
    const hash = (seed: number) => {
      let h = seed;
      for (let i = 0; i < locationId.length; i++) {
        h = ((h << 5) - h) + locationId.charCodeAt(i);
        h = h & h; // Convert to 32-bit integer
      }
      return Math.abs(h);
    };

    const angle = (hash(sessionSeed) % 360) * (Math.PI / 180);
    const distance = ((hash(sessionSeed * 2) / 0x7FFFFFFF) * radiusInDegrees);

    const latOffset = Math.cos(angle) * distance;
    const lngOffset = Math.sin(angle) * distance;

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
export function createCustomIcon(category?: string, isLocked: boolean = false): L.Icon {
  // Use different icons/colors based on category
  const categoryColors: Record<string, string> = {
    landmark: 'var(--accent-primary)',
    trail: 'var(--accent-secondary)',
    camp: 'var(--link-color)',
    default: 'var(--text-primary)',
  };

  const color = isLocked
    ? 'var(--text-muted)'
    : (categoryColors[category?.toLowerCase() || 'default'] || categoryColors.default);

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
