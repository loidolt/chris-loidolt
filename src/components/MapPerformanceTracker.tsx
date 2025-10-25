'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface TileEvent {
  tile: HTMLImageElement;
}

interface MapPerformanceTrackerProps {
  onTileLoad: (loadTime: number) => void;
  onTileError: () => void;
}

export default function MapPerformanceTracker({
  onTileLoad,
  onTileError
}: MapPerformanceTrackerProps) {
  const map = useMap();

  // ALWAYS log when component mounts (no env check)
  console.log('[MapPerformanceTracker] Component mounted!');
  console.log('[MapPerformanceTracker] Map object:', map);
  console.log('[MapPerformanceTracker] onTileLoad:', typeof onTileLoad);
  console.log('[MapPerformanceTracker] onTileError:', typeof onTileError);

  useEffect(() => {
    const tileLoadTimes = new Map<string, number>();

    const handleTileLoadStart = (event: L.TileEvent) => {
      const tile = event.tile as HTMLImageElement;
      const tileUrl = tile.src;
      tileLoadTimes.set(tileUrl, performance.now());

      // ALWAYS log (no env check) for debugging
      console.log('[Performance] Tile load start:', tileUrl);
    };

    const handleTileLoad = (event: L.TileEvent) => {
      const tile = event.tile as HTMLImageElement;
      const tileUrl = tile.src;
      const startTime = tileLoadTimes.get(tileUrl);

      if (startTime) {
        const loadTime = performance.now() - startTime;
        console.log('[Performance] Calling onTileLoad with:', loadTime);
        onTileLoad(loadTime);
        tileLoadTimes.delete(tileUrl);

        // ALWAYS log (no env check) for debugging
        console.log('[Performance] Tile loaded in', loadTime.toFixed(0), 'ms:', tileUrl);
      } else {
        console.log('[Performance] Tile loaded but no start time found:', tileUrl);
      }
    };

    const handleTileError = (event: L.TileEvent) => {
      const tile = event.tile as HTMLImageElement;
      const tileUrl = tile.src;
      tileLoadTimes.delete(tileUrl);
      console.log('[Performance] Calling onTileError');
      onTileError();

      // ALWAYS log (no env check) for debugging
      console.log('[Performance] Tile error:', tileUrl);
    };

    console.log('[Performance] Registering event listeners on map...');
    map.on('tileloadstart', handleTileLoadStart);
    map.on('tileload', handleTileLoad);
    map.on('tileerror', handleTileError);
    console.log('[Performance] Event listeners registered!');

    // Check map state after a delay
    setTimeout(() => {
      console.log('[Performance] Checking map state after 2 seconds...');
      const center = map.getCenter();
      console.log('[Performance] Current map center:', center);
      console.log('[Performance] Current zoom:', map.getZoom());
      console.log('[Performance] Map event listeners:', (map as any)._events);
    }, 2000);

    return () => {
      map.off('tileloadstart', handleTileLoadStart);
      map.off('tileload', handleTileLoad);
      map.off('tileerror', handleTileError);
    };
  }, [map, onTileLoad, onTileError]);

  return null;
}
