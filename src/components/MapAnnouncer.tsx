'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

/**
 * MapAnnouncer component - Provides screen reader announcements for map interactions
 *
 * Announces:
 * - Zoom level changes
 * - Map center changes (on moveend)
 */
export default function MapAnnouncer() {
  const map = useMap();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    let announceTimeout: NodeJS.Timeout;

    const handleZoomEnd = () => {
      const zoom = map.getZoom();
      const message = `Map zoom level changed to ${zoom.toFixed(1)}`;
      setAnnouncement(message);

      // Clear announcement after it's been read
      announceTimeout = setTimeout(() => setAnnouncement(''), 3000);
    };

    const handleMoveEnd = () => {
      const center = map.getCenter();
      const message = `Map centered at latitude ${center.lat.toFixed(4)}, longitude ${center.lng.toFixed(4)}`;
      setAnnouncement(message);

      // Clear announcement after it's been read
      announceTimeout = setTimeout(() => setAnnouncement(''), 3000);
    };

    // Listen to map events
    map.on('zoomend', handleZoomEnd);
    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('moveend', handleMoveEnd);
      if (announceTimeout) {
        clearTimeout(announceTimeout);
      }
    };
  }, [map]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {announcement}
    </div>
  );
}
