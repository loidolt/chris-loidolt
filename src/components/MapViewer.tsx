'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import Fuse from 'fuse.js';
import L from 'leaflet';
import type { Location } from '@/lib/airtable';
import PasswordModal from './PasswordModal';
import LocateButton from './LocateButton';
import 'leaflet/dist/leaflet.css';

interface MapViewerProps {
  locations: Location[];
  initialCenter?: [number, number];
  initialZoom?: number;
}

// Hook to detect theme changes
function useTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light');
      setIsDark(!isLight);
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

// Hook to detect network quality
function useNetworkQuality() {
  const [quality, setQuality] = useState<'fast' | 'slow' | 'offline'>('fast');
  const [effectiveType, setEffectiveType] = useState<string>('4g');

  useEffect(() => {
    // Check if Network Information API is available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    const updateNetworkQuality = () => {
      if (!navigator.onLine) {
        setQuality('offline');
        return;
      }

      if (connection) {
        const type = connection.effectiveType || '4g';
        setEffectiveType(type);

        // Classify network quality
        if (type === '4g' || type === '3g') {
          setQuality('fast');
        } else if (type === '2g' || type === 'slow-2g') {
          setQuality('slow');
        } else {
          setQuality('fast'); // Default to fast
        }
      } else {
        setQuality('fast'); // Default if API not available
      }
    };

    // Initial check
    updateNetworkQuality();

    // Listen for network changes
    window.addEventListener('online', updateNetworkQuality);
    window.addEventListener('offline', updateNetworkQuality);

    if (connection) {
      connection.addEventListener('change', updateNetworkQuality);
    }

    return () => {
      window.removeEventListener('online', updateNetworkQuality);
      window.removeEventListener('offline', updateNetworkQuality);
      if (connection) {
        connection.removeEventListener('change', updateNetworkQuality);
      }
    };
  }, []);

  return { quality, effectiveType, isOnline: quality !== 'offline' };
}

// Function to fuzz coordinates for private locations
// Returns coordinates offset by a random amount within a radius
function fuzzCoordinates(lat: number, lng: number, locationId: string): [number, number] {
  // Use location ID as seed for consistent fuzzing (same location always gets same offset)
  const seed = locationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Pseudo-random based on seed
  const random = (seed: number, index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  // Offset radius in degrees (roughly 0.5-2km depending on latitude)
  const radiusInDegrees = 0.02;

  // Generate consistent random offset
  const angle = random(seed, 1) * 2 * Math.PI;
  const distance = random(seed, 2) * radiusInDegrees;

  const latOffset = Math.cos(angle) * distance;
  const lngOffset = Math.sin(angle) * distance;

  return [lat + latOffset, lng + lngOffset];
}

// Component to handle map view changes and track zoom
function MapController({
  center,
  zoom,
  onZoomChange
}: {
  center: [number, number];
  zoom: number;
  onZoomChange?: (zoom: number) => void;
}) {
  const map = useMap();
  const isProgrammaticChange = useRef(false);
  const lastCenterRef = useRef<string>(JSON.stringify(center));

  useEffect(() => {
    // Only call setView if the CENTER changed from outside
    // (clicking a location, not user pan/zoom)
    const centerKey = JSON.stringify(center);

    if (centerKey !== lastCenterRef.current) {
      // Center changed programmatically (user clicked a location)
      isProgrammaticChange.current = true;
      map.setView(center, zoom);
      lastCenterRef.current = centerKey;

      // Reset flag after a brief delay
      setTimeout(() => {
        isProgrammaticChange.current = false;
      }, 100);
    }
    // If only zoom changed (from our own state update), do nothing
    // Let Leaflet handle zoom naturally
  }, [center, zoom, map]);

  // Listen for zoom changes and update parent state
  useEffect(() => {
    if (!onZoomChange) return;

    const handleZoomEnd = () => {
      // Only update state if this wasn't triggered by our own setView
      if (!isProgrammaticChange.current) {
        const currentZoom = map.getZoom();
        onZoomChange(currentZoom);
      }
    };

    map.on('zoomend', handleZoomEnd);

    // Set initial zoom
    const currentZoom = map.getZoom();
    onZoomChange(currentZoom);

    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onZoomChange]);

  return null;
}

// Component to handle map loading events
function MapLoadingHandler({ onLoad }: { onLoad: () => void }) {
  const map = useMap();

  useEffect(() => {
    let loadTimeout: NodeJS.Timeout;
    let hasLoaded = false;

    // Set loading to false when tiles are loaded
    const handleLoad = () => {
      if (!hasLoaded) {
        hasLoaded = true;
        onLoad();
      }
    };

    // Listen for when all tiles have loaded
    map.whenReady(() => {
      // Give tiles a moment to render before removing loading screen
      loadTimeout = setTimeout(handleLoad, 500);
    });

    // Also handle subsequent tile loads
    map.on('load', handleLoad);

    return () => {
      map.off('load', handleLoad);
      clearTimeout(loadTimeout);
    };
  }, [map, onLoad]);

  return null;
}

// Component to handle map visibility and invalidation
function MapInvalidationHandler() {
  const map = useMap();

  useEffect(() => {
    let invalidateTimeout: NodeJS.Timeout;
    let resizeObserver: ResizeObserver;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // When page becomes visible, invalidate map size after a brief delay
        invalidateTimeout = setTimeout(() => {
          map.invalidateSize();
          // Force tile layer refresh
          map.eachLayer((layer: any) => {
            if (layer._url) { // This is a TileLayer
              layer.redraw();
            }
          });
        }, 100);
      }
    };

    const handleResize = () => {
      // Debounce resize invalidation
      clearTimeout(invalidateTimeout);
      invalidateTimeout = setTimeout(() => {
        map.invalidateSize();
      }, 150);
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Use ResizeObserver for responsive container changes
    const mapContainer = map.getContainer();
    if (mapContainer && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(mapContainer.parentElement || mapContainer);
    } else {
      // Fallback to window resize
      window.addEventListener('resize', handleResize);
    }

    // Invalidate on mount to ensure proper sizing
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
      clearTimeout(invalidateTimeout);
    };
  }, [map]);

  return null;
}

// Component to handle tile loading errors and retries
function TileErrorHandler() {
  const map = useMap();

  useEffect(() => {
    const failedTiles = new Set<string>();

    const retryTile = (event: L.TileErrorEvent) => {
      const tile = event.tile;
      const tileUrl = tile.src;

      // Extract zoom level from tile URL
      const zoomMatch = tileUrl.match(/\/(\d+)\/\d+\/\d+\.png/);
      const zoomLevel = zoomMatch ? parseInt(zoomMatch[1], 10) : 0;

      // Track failed tiles
      if (!tile._retryCount) {
        tile._retryCount = 0;
      }

      // Retry strategy based on zoom level and tile source
      const isOSM = tileUrl.includes('openstreetmap.org');

      // OSM tiles are more reliable - retry them more aggressively
      // OpenTopoMap at high zoom has spotty coverage - fewer retries since fallback exists
      const maxRetries = isOSM ? 3 : (zoomLevel >= 14 ? 1 : 2);

      if (tile._retryCount < maxRetries) {
        tile._retryCount++;

        // Try different subdomain if available
        const currentSubdomain = tileUrl.match(/https:\/\/([abc])\./)?.[1];
        const subdomains = ['a', 'b', 'c'];
        const nextSubdomain = subdomains[(subdomains.indexOf(currentSubdomain || 'a') + 1) % 3];

        // Adaptive delay based on tile source and zoom
        const baseDelay = isOSM ? 300 : (zoomLevel >= 14 ? 1000 : 500);

        setTimeout(() => {
          // Try with different subdomain
          const newUrl = tileUrl.replace(/https:\/\/[abc]\./, `https://${nextSubdomain}.`);
          tile.src = newUrl;
        }, baseDelay * tile._retryCount);
      } else {
        failedTiles.add(tileUrl);
        // Only log failures for low zoom or OSM tiles (unexpected failures)
        if (zoomLevel < 13 || isOSM) {
          console.warn('[MapViewer] Tile failed after retries:', tileUrl);
        }
      }
    };

    const clearFailed = () => {
      // Clear failed tiles list when map successfully loads tiles
      failedTiles.clear();
    };

    map.on('tileerror', retryTile);
    map.on('load', clearFailed);

    return () => {
      map.off('tileerror', retryTile);
      map.off('load', clearFailed);
    };
  }, [map]);

  return null;
}

// Component to prefetch tiles in the background
function TilePrefetcher({ networkQuality }: { networkQuality: 'fast' | 'slow' | 'offline' }) {
  const map = useMap();

  useEffect(() => {
    // Skip prefetching if offline or slow connection
    if (networkQuality === 'offline' || networkQuality === 'slow') {
      return;
    }

    let prefetchTimeout: NodeJS.Timeout;

    const prefetchTiles = () => {
      // Clear any pending prefetch
      clearTimeout(prefetchTimeout);

      // Debounce prefetching to avoid excessive requests during pan/zoom
      prefetchTimeout = setTimeout(() => {
        const bounds = map.getBounds();
        const currentZoom = Math.floor(map.getZoom());
        const tileUrls: string[] = [];

        // Don't prefetch beyond zoom 13 (OpenTopoMap's reliable coverage limit)
        const maxPrefetchZoom = 13;

        // Only prefetch if zoom is within reasonable range
        if (currentZoom >= 8 && currentZoom <= maxPrefetchZoom) {
          const currentBounds = getTileBounds(bounds, currentZoom);

          // Expand bounds by 1 tile in each direction for surrounding tiles
          for (let x = currentBounds.minX - 1; x <= currentBounds.maxX + 1; x++) {
            for (let y = currentBounds.minY - 1; y <= currentBounds.maxY + 1; y++) {
              if (x >= 0 && y >= 0) {
                const subdomain = ['a', 'b', 'c'][Math.abs(x + y) % 3];
                tileUrls.push(`https://${subdomain}.tile.opentopomap.org/${currentZoom}/${x}/${y}.png`);
              }
            }
          }
        }

        // Also prefetch tiles at zoom + 1 for smooth zooming in (fast network only)
        // But never prefetch beyond maxPrefetchZoom
        if (networkQuality === 'fast' && currentZoom < maxPrefetchZoom && currentZoom >= 8) {
          const nextZoom = currentZoom + 1;

          // Skip if next zoom exceeds our limit
          if (nextZoom <= maxPrefetchZoom) {
            const nextBounds = getTileBounds(bounds, nextZoom);

            // Limit the number of tiles to prefetch at next zoom
            const tileCount = (nextBounds.maxX - nextBounds.minX + 1) * (nextBounds.maxY - nextBounds.minY + 1);

            // Only prefetch if reasonable number of tiles
            if (tileCount <= 24) {
              for (let x = nextBounds.minX; x <= nextBounds.maxX; x++) {
                for (let y = nextBounds.minY; y <= nextBounds.maxY; y++) {
                  const subdomain = ['a', 'b', 'c'][Math.abs(x + y) % 3];
                  tileUrls.push(`https://${subdomain}.tile.opentopomap.org/${nextZoom}/${x}/${y}.png`);
                }
              }
            }
          }
        }

        // Send prefetch request to service worker (limit based on network quality)
        const maxPrefetch = networkQuality === 'fast' ? 40 : 20;
        if (tileUrls.length > 0 && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'PREFETCH_TILES',
            tiles: tileUrls.slice(0, maxPrefetch)
          });
        }
      }, 1000); // Reduced to 1s for faster prefetching
    };

    // Helper function to calculate tile bounds for a zoom level
    const getTileBounds = (bounds: L.LatLngBounds, zoom: number) => {
      const nwPoint = latLngToTile(bounds.getNorthWest(), zoom);
      const sePoint = latLngToTile(bounds.getSouthEast(), zoom);

      return {
        minX: Math.max(0, Math.floor(nwPoint.x)),
        maxX: Math.floor(sePoint.x),
        minY: Math.max(0, Math.floor(nwPoint.y)),
        maxY: Math.floor(sePoint.y)
      };
    };

    // Convert lat/lng to tile coordinates
    const latLngToTile = (latLng: L.LatLng, zoom: number) => {
      const lat = latLng.lat;
      const lng = latLng.lng;
      const n = Math.pow(2, zoom);
      const x = ((lng + 180) / 360) * n;
      const y = (1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2 * n;
      return { x, y };
    };

    // Trigger prefetch on moveend (after pan/zoom completes)
    map.on('moveend', prefetchTiles);

    // Initial prefetch
    prefetchTiles();

    return () => {
      map.off('moveend', prefetchTiles);
      clearTimeout(prefetchTimeout);
    };
  }, [map, networkQuality]);

  return null;
}

// Custom marker icon with e-ink styling
function createCustomIcon(category?: string, isLocked: boolean = false): L.Icon {
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

// Component to track tile loading progress
function TileLoadingTracker({ onProgress }: { onProgress: (loading: boolean, progress: number) => void }) {
  const map = useMap();

  useEffect(() => {
    let loadingTiles = 0;
    let totalTiles = 0;

    const handleTileLoadStart = () => {
      totalTiles++;
      loadingTiles++;
      onProgress(true, totalTiles > 0 ? (totalTiles - loadingTiles) / totalTiles : 0);
    };

    const handleTileLoad = () => {
      loadingTiles = Math.max(0, loadingTiles - 1);
      const progress = totalTiles > 0 ? (totalTiles - loadingTiles) / totalTiles : 1;
      onProgress(loadingTiles > 0, progress);

      // Reset counters when all tiles are loaded
      if (loadingTiles === 0) {
        totalTiles = 0;
      }
    };

    const handleTileError = () => {
      loadingTiles = Math.max(0, loadingTiles - 1);
      const progress = totalTiles > 0 ? (totalTiles - loadingTiles) / totalTiles : 1;
      onProgress(loadingTiles > 0, progress);

      // Reset counters when all tiles are done (including errors)
      if (loadingTiles === 0) {
        totalTiles = 0;
      }
    };

    map.on('tileloadstart', handleTileLoadStart);
    map.on('tileload', handleTileLoad);
    map.on('tileerror', handleTileError);

    return () => {
      map.off('tileloadstart', handleTileLoadStart);
      map.off('tileload', handleTileLoad);
      map.off('tileerror', handleTileError);
    };
  }, [map, onProgress]);

  return null;
}

export default function MapViewer({
  locations,
  initialCenter = [37.7749, -122.4194], // Default to San Francisco
  initialZoom = 10
}: MapViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [showLocationList, setShowLocationList] = useState(false);
  const [unlockedLocations, setUnlockedLocations] = useState<Set<string>>(new Set());
  const [passwordModal, setPasswordModal] = useState<{ location: Location; error?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tilesLoading, setTilesLoading] = useState(false);
  const [tileProgress, setTileProgress] = useState(0);
  const isDark = useTheme();
  const { quality: networkQuality, isOnline } = useNetworkQuality();

  // Handle tile loading progress (memoized to prevent re-creating)
  const handleTileProgress = useCallback((loading: boolean, progress: number) => {
    setTilesLoading(loading);
    setTileProgress(progress);
  }, []);

  // Handle zoom changes from map interaction (memoized)
  const handleZoomChange = useCallback((newZoom: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[MapViewer] Zoom changed to:', newZoom, 'OSM fallback active:', newZoom >= 13);
    }
    setMapZoom(newZoom);
  }, []);

  // Register service worker for tile caching
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/map-sw.js', { scope: '/' })
        .then((registration) => {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Map tile cache service worker registered:', registration.scope);
          }
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
    }
  }, []);

  // Load unlocked locations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('unlockedLocations');
      if (stored) {
        setUnlockedLocations(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Error loading unlocked locations:', error);
    }
  }, []);

  // Save unlocked locations to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('unlockedLocations', JSON.stringify(Array.from(unlockedLocations)));
    } catch (error) {
      console.error('Error saving unlocked locations:', error);
    }
  }, [unlockedLocations]);

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

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((loc) => {
        if (loc.categories && loc.categories.includes(selectedCategory)) {
          return true;
        }
        return loc.category === selectedCategory;
      });
    }

    return filtered;
  }, [locations, searchQuery, selectedCategory, fuse]);

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

  // Calculate center from all locations if not provided (only once on mount)
  const hasSetInitialCenter = useRef(false);
  useEffect(() => {
    if (!hasSetInitialCenter.current && locations.length > 0) {
      const validLocations = locations.filter(loc => loc.latitude && loc.longitude);
      if (validLocations.length > 0) {
        const avgLat = validLocations.reduce((sum, loc) => sum + loc.latitude, 0) / validLocations.length;
        const avgLng = validLocations.reduce((sum, loc) => sum + loc.longitude, 0) / validLocations.length;
        setMapCenter([avgLat, avgLng]);
        hasSetInitialCenter.current = true;
      }
    }
  }, [locations]);

  // Check if location is locked (memoized)
  const isLocationLocked = useCallback((location: Location) => {
    return location.privacy === 'Private' && !unlockedLocations.has(location.id);
  }, [unlockedLocations]);

  // Handle password submission (memoized)
  const handlePasswordSubmit = useCallback((password: string) => {
    if (!passwordModal) return;

    const { location } = passwordModal;

    if (password === location.password) {
      // Password correct - unlock location
      setUnlockedLocations(prev => new Set([...prev, location.id]));
      setPasswordModal(null);

      // Navigate to exact location
      setMapCenter([location.latitude, location.longitude]);
      setMapZoom(14);
    } else {
      // Password incorrect
      setPasswordModal({
        location,
        error: 'Incorrect password. Please try again.'
      });
    }
  }, [passwordModal]);

  // Handle location click from search/list or marker (memoized)
  const handleLocationClick = useCallback((location: Location) => {
    const locked = location.privacy === 'Private' && !unlockedLocations.has(location.id);

    if (locked) {
      // Show password modal for locked locations
      setPasswordModal({ location });
    } else {
      // Navigate to location (exact coords for unlocked, fuzzy for public)
      setMapCenter([location.latitude, location.longitude]);
      setMapZoom(14);
      setShowLocationList(false);
    }
  }, [unlockedLocations]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}>
      {/* Full-page Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className={`e-ink-map ${isDark ? 'theme-dark' : 'theme-light'}`}
        zoomControl={false}
        preferCanvas={false}
        // Add attributionControl at bottom
        attributionControl={true}
      >
        <MapController center={mapCenter} zoom={mapZoom} onZoomChange={handleZoomChange} />
        <MapLoadingHandler onLoad={() => setIsLoading(false)} />
        <MapInvalidationHandler />
        <TileErrorHandler />
        <TilePrefetcher networkQuality={networkQuality} />
        <TileLoadingTracker onProgress={handleTileProgress} />

        {/* Zoom controls positioned in bottom-right */}
        <ZoomControl position="bottomright" />

        {/* OpenTopoMap tiles - primary layer */}
        <TileLayer
          key={`topo-layer-${isDark ? 'dark' : 'light'}`}
          attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          maxZoom={17}
          minZoom={3}
          className="theme-tiles"
          keepBuffer={3}
          updateWhenZooming={false}
          updateWhenIdle={true}
          updateInterval={200}
          tileSize={256}
          zoomOffset={0}
          crossOrigin="anonymous"
          subdomains={['a', 'b', 'c']}
          // OpenTopoMap has very spotty coverage above zoom 13
          // Most areas only have tiles up to zoom 13 reliably
          maxNativeZoom={13}
          noWrap={false}
          bounds={undefined}
          // Don't show error tiles - let the fallback layer handle it
          errorTileUrl=""
          // Add retry logic
          retryDelay={1000}
          retryAttempts={2}
        />

        {/* OpenStreetMap fallback layer for high zoom */}
        {mapZoom >= 13 && (
          <TileLayer
            key={`osm-fallback-${isDark ? 'dark' : 'light'}`}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            minZoom={13}
            className="theme-tiles osm-fallback"
            keepBuffer={3}
            updateWhenZooming={false}
            updateWhenIdle={true}
            updateInterval={200}
            tileSize={256}
            crossOrigin="anonymous"
            subdomains={['a', 'b', 'c']}
            // OSM has better high-zoom coverage
            maxNativeZoom={19}
            opacity={0.8} // Slightly transparent to blend with topo layer
            // Add pane to ensure proper layering
            pane="tilePane"
          />
        )}

        {/* Markers for filtered locations */}
        {filteredLocations.map((location) => {
          if (!location.latitude || !location.longitude) return null;

          const isLocked = isLocationLocked(location);

          // Use fuzzy coordinates for locked locations
          const markerPosition: [number, number] = isLocked
            ? fuzzCoordinates(location.latitude, location.longitude, location.id)
            : [location.latitude, location.longitude];

          return (
            <Marker
              key={location.id}
              position={markerPosition}
              icon={createCustomIcon(location.category, isLocked)}
              eventHandlers={{
                click: () => handleLocationClick(location)
              }}
            >
              <Popup className="e-ink-popup">
                <div style={{ minWidth: '200px' }}>
                  <h3
                    className="text-sm font-semibold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {location.name}
                  </h3>

                  {isLocked && (
                    <div
                      className="text-xs mb-2 p-2"
                      style={{
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      🔒 This is a private location. Click the marker to unlock with password.
                    </div>
                  )}

                  {location.category && (
                    <div
                      className="text-xs mb-2"
                      style={{ color: 'var(--accent-secondary)' }}
                    >
                      [{location.category}]
                    </div>
                  )}

                  {!isLocked && location.description && (
                    <p
                      className="text-sm mb-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {location.description}
                    </p>
                  )}

                  {!isLocked && location.image && (
                    <img
                      src={location.image}
                      alt={location.name}
                      className="w-full h-32 object-cover mb-2"
                      style={{
                        border: '1px solid var(--border-color)',
                        filter: isDark ? 'grayscale(100%)' : 'grayscale(50%)'
                      }}
                    />
                  )}

                  {!isLocked && location.url && (
                    <a
                      href={location.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--link-color)' }}
                    >
                      [Learn more →]
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Overlay Control Panel */}
      <div
        className="map-overlay-panel"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          maxWidth: '360px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ padding: '16px' }}>
          {/* Header */}
          <div style={{ marginBottom: '16px' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm" style={{ color: 'var(--accent-secondary)' }}>
                GIS Map
              </div>
              {/* Network status indicator */}
              {!isOnline && (
                <div
                  className="text-xs px-2 py-1"
                  style={{
                    color: 'var(--error-color)',
                    border: '1px solid var(--error-color)',
                    backgroundColor: 'var(--bg-primary)',
                  }}
                >
                  [Offline]
                </div>
              )}
              {isOnline && networkQuality === 'slow' && (
                <div
                  className="text-xs px-2 py-1"
                  style={{
                    color: 'var(--accent-secondary)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                  }}
                >
                  [Slow connection]
                </div>
              )}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {filteredLocations.length} location{filteredLocations.length === 1 ? '' : 's'}
            </div>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locations..."
              className="w-full p-2 text-sm focus:outline-none transition-all"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div className="text-xs mb-2" style={{ color: 'var(--accent-secondary)' }}>
                Category
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-2 py-1 text-xs transition-opacity hover:opacity-70"
                  style={{
                    color: selectedCategory === null ? 'var(--link-color)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: selectedCategory === null ? 'var(--bg-primary)' : 'transparent'
                  }}
                >
                  [all]
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="px-2 py-1 text-xs transition-opacity hover:opacity-70"
                    style={{
                      color: selectedCategory === cat ? 'var(--link-color)' : 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: selectedCategory === cat ? 'var(--bg-primary)' : 'transparent'
                    }}
                  >
                    [{cat}]
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Locate Me Button */}
          <div style={{ marginBottom: '12px' }}>
            <LocateButton
              onLocate={(lat, lng) => {
                setMapCenter([lat, lng]);
                setMapZoom(16);
              }}
            />
          </div>

          {/* Toggle Location List */}
          <button
            onClick={() => setShowLocationList(!showLocationList)}
            className="w-full p-2 text-sm transition-opacity hover:opacity-70"
            style={{
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--link-color)',
            }}
          >
            [{showLocationList ? 'Hide' : 'Show'} Locations List]
          </button>
        </div>
      </div>

      {/* Collapsible Location List Sidebar */}
      {showLocationList && (
        <div
          className="map-overlay-sidebar"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            width: '320px',
            maxHeight: 'calc(100vh - 40px)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Sidebar Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div className="text-sm" style={{ color: 'var(--accent-secondary)' }}>
              Locations
            </div>
            <button
              onClick={() => setShowLocationList(false)}
              className="text-xs hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              [close]
            </button>
          </div>

          {/* Location List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredLocations.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  No results found
                </div>
              </div>
            ) : (
              <div style={{ padding: '8px' }}>
                {filteredLocations.map((location) => {
                  const isLocked = isLocationLocked(location);
                  return (
                    <button
                      key={location.id}
                      onClick={() => handleLocationClick(location)}
                      className="w-full text-left p-2 mb-2 transition-opacity hover:opacity-70"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        opacity: isLocked ? 0.7 : 1,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isLocked && <span style={{ color: 'var(--text-muted)' }}>🔒</span>}
                        <div className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
                          {location.name}
                        </div>
                      </div>
                      {location.category && (
                        <div className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
                          [{location.category}]
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordModal && (
        <PasswordModal
          locationName={passwordModal.location.name}
          onSubmit={handlePasswordSubmit}
          onCancel={() => setPasswordModal(null)}
          error={passwordModal.error}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            transition: 'opacity 0.3s ease',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              className="text-sm mb-2"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Loading map tiles...
            </div>
            <div
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              [Initializing topographic data]
            </div>
          </div>
        </div>
      )}

      {/* Tile Loading Indicator */}
      {!isLoading && tilesLoading && (
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '8px 16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <div
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Loading tiles...
          </div>
          <div
            style={{
              width: '80px',
              height: '4px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${tileProgress * 100}%`,
                backgroundColor: 'var(--accent-primary)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <div
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {Math.round(tileProgress * 100)}%
          </div>
        </div>
      )}

      {/* Debug: Current Zoom Level Indicator - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '20px',
            zIndex: 1000,
            padding: '4px 8px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          Zoom: {mapZoom.toFixed(1)} {mapZoom >= 13 ? '(OSM active)' : '(OpenTopoMap only)'}
        </div>
      )}
    </div>
  );
}
