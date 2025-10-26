'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapKeyboardNavProps {
  initialCenter?: [number, number];
  initialZoom?: number;
}

/**
 * MapKeyboardNav component - Adds keyboard navigation to the map
 *
 * Keyboard controls:
 * - Arrow keys: Pan the map
 * - + or =: Zoom in
 * - - or _: Zoom out
 * - Home: Reset to initial view
 */
export default function MapKeyboardNav({
  initialCenter = [44.5, -110.5],
  initialZoom = 6
}: MapKeyboardNavProps) {
  const map = useMap();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events when the map container or its children are focused
      const mapContainer = map.getContainer();
      if (!mapContainer.contains(document.activeElement)) {
        return;
      }

      const panDistance = 50; // pixels
      const zoomIncrement = 1;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          map.panBy([0, -panDistance]);
          break;
        case 'ArrowDown':
          e.preventDefault();
          map.panBy([0, panDistance]);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          map.panBy([-panDistance, 0]);
          break;
        case 'ArrowRight':
          e.preventDefault();
          map.panBy([panDistance, 0]);
          break;
        case '+':
        case '=':
          e.preventDefault();
          map.zoomIn(zoomIncrement);
          break;
        case '-':
        case '_':
          e.preventDefault();
          map.zoomOut(zoomIncrement);
          break;
        case 'Home':
          e.preventDefault();
          map.setView(initialCenter, initialZoom);
          break;
        default:
          // No action for other keys
          break;
      }
    };

    const mapContainer = map.getContainer();

    // Make map container focusable
    mapContainer.setAttribute('tabindex', '0');

    // Add keyboard event listener
    mapContainer.addEventListener('keydown', handleKeyDown);

    return () => {
      mapContainer.removeEventListener('keydown', handleKeyDown);
    };
  }, [map, initialCenter, initialZoom]);

  // This component doesn't render anything
  return null;
}
