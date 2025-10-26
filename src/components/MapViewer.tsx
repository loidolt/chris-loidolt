'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from 'react-leaflet';
import Fuse from 'fuse.js';
import L from 'leaflet';
import type { Location } from '@/lib/airtable';
import PasswordModal from './PasswordModal';
import LocateButton from './LocateButton';
import MarkerClusterGroup from './MarkerClusterGroup';
import MapKeyboardNav from './MapKeyboardNav';
import MapAnnouncer from './MapAnnouncer';
import MapDrawingTools from './MapDrawingTools';
import MapActionControls from './MapActionControls';
import Tooltip from './Tooltip';
import OverlayPanel, { PanelTab } from './OverlayPanel';
import { useDrawings } from '@/hooks/useDrawings';
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

// Component to fit map bounds to filtered locations when filters change
function MapFilterExtentsHandler({
  locations,
  enabled,
  filterKey
}: {
  locations: Location[];
  enabled: boolean;
  filterKey: string; // Used to detect filter changes
}) {
  const map = useMap();
  const previousFilterKey = useRef(filterKey);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip on initial mount (let MapBoundsInitializer handle that)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousFilterKey.current = filterKey;
      return;
    }

    // Only run if auto-zoom is enabled and filters actually changed
    if (!enabled || filterKey === previousFilterKey.current || locations.length === 0) {
      previousFilterKey.current = filterKey;
      return;
    }

    // Get all valid coordinates
    const validLocations = locations.filter(loc => loc.latitude && loc.longitude);

    if (validLocations.length === 0) return;

    // Create bounds from filtered locations
    const bounds = L.latLngBounds(
      validLocations.map(loc => [loc.latitude, loc.longitude] as [number, number])
    );

    // Fit map to bounds with padding
    map.fitBounds(bounds, {
      padding: [50, 50], // Add 50px padding on all sides
      maxZoom: 13, // Don't zoom in too far if there are few markers
      animate: true, // Animate for filter changes
      duration: 0.5, // Smooth animation
    });

    previousFilterKey.current = filterKey;
  }, [map, locations, enabled, filterKey]);

  return null;
}

// Component to fit map bounds to markers on initial load
function MapBoundsInitializer({ locations }: { locations: Location[] }) {
  const map = useMap();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasInitialized.current || locations.length === 0) return;

    // Get all valid coordinates
    const validLocations = locations.filter(loc => loc.latitude && loc.longitude);

    if (validLocations.length === 0) return;

    // Create bounds from all locations
    const bounds = L.latLngBounds(
      validLocations.map(loc => [loc.latitude, loc.longitude] as [number, number])
    );

    // Fit map to bounds with padding
    map.fitBounds(bounds, {
      padding: [50, 50], // Add 50px padding on all sides
      maxZoom: 13, // Don't zoom in too far if there's only one marker
      animate: false, // Don't animate on initial load
    });

    hasInitialized.current = true;
  }, [map, locations]);

  return null;
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
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');
  const [hasImageFilter, setHasImageFilter] = useState<boolean | null>(null);
  const [autoZoomToExtents, setAutoZoomToExtents] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [showLocationList, setShowLocationList] = useState(false);
  const [unlockedLocations, setUnlockedLocations] = useState<Set<string>>(new Set());
  const [passwordModal, setPasswordModal] = useState<{ location: Location; error?: string } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tilesLoading, setTilesLoading] = useState(false);
  const [tileProgress, setTileProgress] = useState(0);
  const [clusteringEnabled, setClusteringEnabled] = useState(locations.length > 10);
  const [drawingEnabled, setDrawingEnabled] = useState(false);

  // Panel visibility state
  const [activeTab, setActiveTab] = useState<'search' | 'locations' | 'info'>('search');
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const isDark = useTheme();
  const { quality: networkQuality, isOnline } = useNetworkQuality();

  // Drawing tools state
  const {
    drawings,
    setDrawings,
    saveDrawings,
    exportGeoJSON,
    clearDrawings,
    drawingCount
  } = useDrawings();

  // Debug clustering state
  useEffect(() => {
    console.log('[MapViewer] Clustering enabled:', clusteringEnabled, 'Locations count:', locations.length);
  }, [clusteringEnabled, locations.length]);

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

  // Load auto-zoom preference from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mapAutoZoomToExtents');
      if (stored !== null) {
        setAutoZoomToExtents(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading auto-zoom preference:', error);
    }
  }, []);

  // Save auto-zoom preference to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('mapAutoZoomToExtents', JSON.stringify(autoZoomToExtents));
    } catch (error) {
      console.error('Error saving auto-zoom preference:', error);
    }
  }, [autoZoomToExtents]);

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

    // Apply category filter (multi-select)
    if (selectedCategories.size > 0) {
      filtered = filtered.filter((loc) => {
        // Check if location has any of the selected categories
        if (loc.categories && loc.categories.some(cat => selectedCategories.has(cat))) {
          return true;
        }
        return loc.category && selectedCategories.has(loc.category);
      });
    }

    // Apply privacy filter
    if (privacyFilter !== 'all') {
      filtered = filtered.filter((loc) => {
        if (privacyFilter === 'public') {
          return loc.privacy !== 'Private';
        } else {
          return loc.privacy === 'Private';
        }
      });
    }

    // Apply has image filter
    if (hasImageFilter !== null) {
      filtered = filtered.filter((loc) => {
        return hasImageFilter ? !!loc.image : !loc.image;
      });
    }

    return filtered;
  }, [locations, searchQuery, selectedCategories, privacyFilter, hasImageFilter, fuse]);

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

  // Create a filter key to detect when filters change
  const filterKey = useMemo(() => {
    return JSON.stringify({
      search: searchQuery,
      categories: Array.from(selectedCategories).sort(),
      privacy: privacyFilter,
      hasImage: hasImageFilter,
    });
  }, [searchQuery, selectedCategories, privacyFilter, hasImageFilter]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCategories.size > 0) count++;
    if (privacyFilter !== 'all') count++;
    if (hasImageFilter !== null) count++;
    return count;
  }, [searchQuery, selectedCategories, privacyFilter, hasImageFilter]);


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

      // Show location details in panel
      setSelectedLocation(location);
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
      // Set selected location and switch to info tab
      setSelectedLocation(location);
      setActiveTab('info');
      setIsPanelOpen(true); // Open the panel to show location info
    }
  }, [unlockedLocations]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Allow "/" to focus search even when not in an input
        if (e.key === '/' && e.target.id !== 'location-search') {
          e.preventDefault();
          document.getElementById('location-search')?.focus();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'l':
          if (e.shiftKey) {
            // Shift+L: Switch to locations tab
            e.preventDefault();
            setActiveTab('locations');
            setShowLocationList(true); // Keep for backward compat
          } else {
            // L: Locate user
            e.preventDefault();
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setMapCenter([position.coords.latitude, position.coords.longitude]);
                  setMapZoom(16);
                },
                (error) => {
                  console.error('Error getting location:', error);
                }
              );
            }
          }
          break;
        case 'c':
          // C: Toggle clustering
          e.preventDefault();
          setClusteringEnabled(prev => !prev);
          break;
        case 'd':
          // D: Toggle drawing
          e.preventDefault();
          setDrawingEnabled(prev => !prev);
          break;
        case '/':
          // /: Focus search and switch to search tab
          e.preventDefault();
          setActiveTab('search');
          setTimeout(() => {
            document.getElementById('location-search')?.focus();
          }, 100);
          break;
        case 'escape':
          // Escape: Close modals/panels
          if (passwordModal) {
            setPasswordModal(null);
          } else if (selectedLocation && activeTab === 'info') {
            setSelectedLocation(null);
            setActiveTab('search');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLocation, passwordModal, showLocationList, activeTab]);

  // Define panel tabs
  const panelTabs: PanelTab[] = [
    {
      id: 'search',
      label: 'Search',
      content: (
        <>
          {/* Network status indicator */}
          {(!isOnline || networkQuality === 'slow') && (
            <div
              style={{
                padding: '6px 8px',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              {!isOnline && (
                <div
                  className="text-xs px-1.5 py-0.5"
                  style={{
                    color: 'var(--error-color)',
                    border: '1px solid var(--error-color)',
                    backgroundColor: 'var(--bg-primary)',
                    display: 'inline-block',
                  }}
                >
                  Offline
                </div>
              )}
              {isOnline && networkQuality === 'slow' && (
                <div
                  className="text-xs px-1.5 py-0.5"
                  style={{
                    color: 'var(--accent-secondary)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    display: 'inline-block',
                  }}
                >
                  Slow
                </div>
              )}
            </div>
          )}

          {/* Search & Filter Section */}
          <div style={{ padding: '8px 8px 12px', borderBottom: '1px solid var(--border-color)' }}>
            {/* Compact Search */}
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <input
                id="location-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full p-2.5 pl-9 text-sm sm:text-xs sm:p-1.5 sm:pl-7 focus:outline-none focus:ring-1 transition-all"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  minHeight: '44px',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
                aria-label="Search locations by name or description"
              />
              <span
                style={{
                  position: 'absolute',
                  left: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                  fontSize: '11px',
                }}
                aria-hidden="true"
              >
                🔍
              </span>
            </div>

            {/* Multi-select Category Filter */}
            {categories.length > 0 && (
              <div>
                <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Categories {selectedCategories.size > 0 && `(${selectedCategories.size})`}
                </div>
                <div
                  role="group"
                  aria-label="Category filters"
                  className="flex flex-wrap gap-1"
                >
                  {categories.map((cat) => {
                    const isSelected = selectedCategories.has(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          const newCategories = new Set(selectedCategories);
                          if (isSelected) {
                            newCategories.delete(cat);
                          } else {
                            newCategories.add(cat);
                          }
                          setSelectedCategories(newCategories);
                        }}
                        className="px-2.5 py-2 sm:px-1.5 sm:py-0.5 text-sm sm:text-xs transition-all hover:opacity-70 focus:ring-1"
                        style={{
                          color: isSelected ? 'var(--link-color)' : 'var(--text-muted)',
                          border: `1px solid ${isSelected ? 'var(--link-color)' : 'var(--border-color)'}`,
                          backgroundColor: isSelected ? 'var(--bg-primary)' : 'transparent',
                          outline: 'none',
                          fontWeight: isSelected ? 600 : 400,
                          minHeight: '36px',
                          touchAction: 'manipulation',
                          WebkitTapHighlightColor: 'transparent',
                        }}
                        aria-pressed={isSelected}
                        aria-label={`${isSelected ? 'Remove' : 'Add'} ${cat} filter`}
                      >
                        {isSelected && '✓ '}{cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Filters Section */}
          <details style={{ padding: '8px', backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
            <summary
              className="text-xs cursor-pointer transition-opacity hover:opacity-70 mb-2"
              style={{ color: 'var(--accent-secondary)', listStyle: 'none', userSelect: 'none' }}
            >
              ⚙️ Advanced Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </summary>
            <div className="space-y-3">
              {/* Privacy Filter */}
              <div>
                <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Privacy
                </div>
                <div className="flex gap-1">
                  {['all', 'public', 'private'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setPrivacyFilter(option as 'all' | 'public' | 'private')}
                      className="px-2 py-2 sm:py-1 text-sm sm:text-xs transition-all hover:opacity-70 focus:ring-1"
                      style={{
                        color: privacyFilter === option ? 'var(--link-color)' : 'var(--text-muted)',
                        border: `1px solid ${privacyFilter === option ? 'var(--link-color)' : 'var(--border-color)'}`,
                        backgroundColor: privacyFilter === option ? 'var(--bg-primary)' : 'transparent',
                        outline: 'none',
                        fontWeight: privacyFilter === option ? 600 : 400,
                        flex: 1,
                        minHeight: '40px',
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      aria-pressed={privacyFilter === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Has Image Filter */}
              <div>
                <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Images
                </div>
                <div className="flex gap-1">
                  {[
                    { label: 'all', value: null },
                    { label: 'with image', value: true },
                    { label: 'no image', value: false },
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setHasImageFilter(option.value)}
                      className="px-2 py-2 sm:py-1 text-sm sm:text-xs transition-all hover:opacity-70 focus:ring-1"
                      style={{
                        color: hasImageFilter === option.value ? 'var(--link-color)' : 'var(--text-muted)',
                        border: `1px solid ${hasImageFilter === option.value ? 'var(--link-color)' : 'var(--border-color)'}`,
                        backgroundColor: hasImageFilter === option.value ? 'var(--bg-primary)' : 'transparent',
                        outline: 'none',
                        fontWeight: hasImageFilter === option.value ? 600 : 400,
                        flex: 1,
                        minHeight: '40px',
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      aria-pressed={hasImageFilter === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-zoom Toggle */}
              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Auto-zoom to extents
                  </span>
                  <button
                    onClick={() => setAutoZoomToExtents(!autoZoomToExtents)}
                    className="px-3 py-2 sm:px-2 sm:py-1 text-sm sm:text-xs transition-all hover:opacity-70"
                    style={{
                      color: autoZoomToExtents ? 'var(--accent-primary)' : 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      minWidth: '52px',
                      minHeight: '36px',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    aria-pressed={autoZoomToExtents}
                  >
                    {autoZoomToExtents ? 'ON' : 'OFF'}
                  </button>
                </label>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                  Automatically zoom to fit filtered locations
                </div>
              </div>
            </div>
          </details>

          {/* Drawing Actions - shown when drawing is enabled and there are drawings */}
          {drawingEnabled && drawingCount > 0 && (
            <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)' }}>
              <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Drawings ({drawingCount})
              </div>
              <div className="grid grid-cols-3 gap-1">
                <Tooltip content="Save to storage" position="bottom">
                  <button
                    onClick={() => saveDrawings()}
                    className="p-1 text-xs transition-all hover:opacity-70 focus:ring-1"
                    style={{
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--link-color)',
                      outline: 'none',
                    }}
                    aria-label="Save drawings to browser storage"
                  >
                    Save
                  </button>
                </Tooltip>
                <Tooltip content="Export GeoJSON" position="bottom">
                  <button
                    onClick={() => exportGeoJSON()}
                    className="p-1 text-xs transition-all hover:opacity-70 focus:ring-1"
                    style={{
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--link-color)',
                      outline: 'none',
                    }}
                    aria-label="Export drawings as GeoJSON file"
                  >
                    Export
                  </button>
                </Tooltip>
                <Tooltip content="Clear all" position="bottom">
                  <button
                    onClick={() => {
                      if (confirm('Clear all drawings?')) {
                        clearDrawings();
                      }
                    }}
                    className="p-1 text-xs transition-all hover:opacity-70 focus:ring-1"
                    style={{
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--error-color)',
                      outline: 'none',
                    }}
                    aria-label="Clear all drawings"
                  >
                    Clear
                  </button>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Compact Keyboard Shortcuts */}
          <details style={{ padding: '6px 8px', backgroundColor: 'var(--bg-primary)' }}>
            <summary
              className="text-xs cursor-pointer transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-muted)', listStyle: 'none', userSelect: 'none' }}
            >
              ⌨️ Shortcuts
            </summary>
            <div className="mt-1.5 space-y-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="flex justify-between">
                <span>Locate</span>
                <kbd style={{ padding: '0 3px', border: '1px solid var(--border-color)', borderRadius: '2px', fontSize: '10px' }}>L</kbd>
              </div>
              <div className="flex justify-between">
                <span>List</span>
                <kbd style={{ padding: '0 3px', border: '1px solid var(--border-color)', borderRadius: '2px', fontSize: '10px' }}>⇧L</kbd>
              </div>
              <div className="flex justify-between">
                <span>Cluster</span>
                <kbd style={{ padding: '0 3px', border: '1px solid var(--border-color)', borderRadius: '2px', fontSize: '10px' }}>C</kbd>
              </div>
              <div className="flex justify-between">
                <span>Draw</span>
                <kbd style={{ padding: '0 3px', border: '1px solid var(--border-color)', borderRadius: '2px', fontSize: '10px' }}>D</kbd>
              </div>
              <div className="flex justify-between">
                <span>Search</span>
                <kbd style={{ padding: '0 3px', border: '1px solid var(--border-color)', borderRadius: '2px', fontSize: '10px' }}>/</kbd>
              </div>
              <div className="flex justify-between">
                <span>Close</span>
                <kbd style={{ padding: '0 3px', border: '1px solid var(--border-color)', borderRadius: '2px', fontSize: '10px' }}>Esc</kbd>
              </div>
            </div>
          </details>
        </>
      ),
    },
    {
      id: 'locations',
      label: 'Locations',
      content: (
        <div style={{ padding: '8px' }}>
          {filteredLocations.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No results found
              </div>
            </div>
          ) : (
            <>
              {filteredLocations.map((location) => {
                const isLocked = isLocationLocked(location);
                return (
                  <button
                    key={location.id}
                    onClick={() => handleLocationClick(location)}
                    className="w-full text-left p-3 sm:p-2 mb-2 transition-opacity hover:opacity-70"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      opacity: isLocked ? 0.7 : 1,
                      minHeight: '56px',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isLocked && <span style={{ color: 'var(--text-muted)' }}>🔒</span>}
                      <div className="text-base sm:text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
                        {location.name}
                      </div>
                    </div>
                    {location.category && (
                      <div className="text-sm sm:text-xs" style={{ color: 'var(--accent-secondary)' }}>
                        [{location.category}]
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>
      ),
    },
    {
      id: 'info',
      label: 'Info',
      disabled: !selectedLocation,
      content: selectedLocation ? (
        <div style={{ padding: '16px' }}>
          {/* Featured Image */}
          {selectedLocation.image && (
            <div style={{ marginBottom: '20px' }}>
              <img
                src={selectedLocation.image}
                alt={selectedLocation.name}
                className="w-full object-cover h-48 sm:h-60"
                style={{
                  border: '1px solid var(--border-color)',
                  filter: isDark ? 'grayscale(100%)' : 'grayscale(50%)',
                }}
              />
            </div>
          )}

          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <h2
              className="text-lg font-semibold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {selectedLocation.name}
            </h2>
          </div>

          {/* Categories */}
          {(selectedLocation.categories && selectedLocation.categories.length > 0) && (
            <div style={{ marginBottom: '20px' }}>
              <div
                className="text-xs mb-2"
                style={{ color: 'var(--accent-secondary)' }}
              >
                Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedLocation.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1"
                    style={{
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                    }}
                  >
                    [{cat}]
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Coordinates */}
          <div style={{ marginBottom: '20px' }}>
            <div
              className="text-xs mb-2"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Coordinates
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </div>
          </div>

          {/* Description */}
          {selectedLocation.description && (
            <div style={{ marginBottom: '20px' }}>
              <div
                className="text-xs mb-2"
                style={{ color: 'var(--accent-secondary)' }}
              >
                Description
              </div>
              <div
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-primary)' }}
              >
                {selectedLocation.description}
              </div>
            </div>
          )}

          {/* External Link */}
          {selectedLocation.url && (
            <div style={{ marginBottom: '20px' }}>
              <a
                href={selectedLocation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm hover:opacity-70 transition-opacity px-3 py-2"
                style={{
                  color: 'var(--link-color)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                }}
              >
                [Learn more →]
              </a>
            </div>
          )}

          {/* Privacy */}
          {selectedLocation.privacy && (
            <div style={{ marginBottom: '12px' }}>
              <div
                className="text-xs mb-2"
                style={{ color: 'var(--accent-secondary)' }}
              >
                Privacy
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {selectedLocation.privacy}
              </div>
            </div>
          )}

          {/* Footer with action buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                const coords = `${selectedLocation.latitude}, ${selectedLocation.longitude}`;
                navigator.clipboard.writeText(coords);
              }}
              className="flex-1 text-xs sm:text-sm px-3 py-2 hover:opacity-70 transition-opacity active:opacity-50"
              style={{
                color: 'var(--link-color)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
              }}
              aria-label="Copy coordinates to clipboard"
            >
              [Copy Coords]
            </button>
            {selectedLocation.url && (
              <button
                onClick={() => {
                  window.open(selectedLocation.url, '_blank', 'noopener,noreferrer');
                }}
                className="flex-1 text-xs sm:text-sm px-3 py-2 hover:opacity-70 transition-opacity active:opacity-50"
                style={{
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                }}
                aria-label="Visit external link"
              >
                [Visit Link]
              </button>
            )}
          </div>
        </div>
      ) : null,
    },
  ];

  // Panel header
  const panelHeader = activeTab === 'search' ? (
    <div className="px-3 py-1.5 text-xs flex items-center justify-between">
      <span style={{ color: 'var(--text-muted)' }}>
        {filteredLocations.length} {filteredLocations.length === 1 ? 'location' : 'locations'}
        {activeFilterCount > 0 && (
          <span style={{ color: 'var(--accent-secondary)' }}> • {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}</span>
        )}
      </span>
      {activeFilterCount > 0 && (
        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedCategories(new Set());
            setPrivacyFilter('all');
            setHasImageFilter(null);
          }}
          className="text-xs hover:opacity-70 transition-opacity px-2.5 py-1.5"
          style={{
            color: 'var(--error-color)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            minHeight: '32px',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="Clear all filters"
        >
          Clear all
        </button>
      )}
    </div>
  ) : activeTab === 'locations' ? (
    <div className="px-3 py-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
      {filteredLocations.length} {filteredLocations.length === 1 ? 'result' : 'results'}
    </div>
  ) : activeTab === 'info' && selectedLocation ? (
    <div className="px-3 py-1.5 text-xs" style={{ color: 'var(--accent-secondary)' }}>
      {selectedLocation.category ? `[${selectedLocation.category}]` : 'Location Details'}
    </div>
  ) : null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}>
      {/* Overlay Panel */}
      <OverlayPanel
        tabs={panelTabs}
        activeTab={activeTab}
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        panelHeader={panelHeader}
        onTabChange={(tabId) => setActiveTab(tabId as 'search' | 'locations' | 'info')}
        position="left"
      />

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
        // Accessibility attributes
        // @ts-ignore - role is not in the types but is valid HTML
        role="application"
        aria-label="Interactive map showing geographic locations"
        aria-roledescription="Map with markers and controls"
      >
        <MapBoundsInitializer locations={locations} />
        <MapFilterExtentsHandler
          locations={filteredLocations}
          enabled={autoZoomToExtents}
          filterKey={filterKey}
        />
        <MapController center={mapCenter} zoom={mapZoom} onZoomChange={handleZoomChange} />
        <MapLoadingHandler onLoad={() => setIsLoading(false)} />
        <MapInvalidationHandler />
        <TileErrorHandler />
        <TilePrefetcher networkQuality={networkQuality} />
        <TileLoadingTracker onProgress={handleTileProgress} />

        {/* Accessibility components */}
        <MapKeyboardNav initialCenter={initialCenter} initialZoom={initialZoom} />
        <MapAnnouncer />

        {/* Drawing tools */}
        <MapDrawingTools
          drawings={drawings}
          onDrawingsChange={setDrawings}
          enabled={drawingEnabled}
        />

        {/* Action controls on the right side */}
        <MapActionControls
          onLocate={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setMapCenter([position.coords.latitude, position.coords.longitude]);
                  setMapZoom(16);
                },
                (error) => {
                  console.error('Error getting location:', error);
                  alert('Unable to access your location. Please check browser permissions.');
                }
              );
            } else {
              alert('Geolocation is not supported by your browser.');
            }
          }}
          clusteringEnabled={clusteringEnabled}
          onToggleClustering={() => setClusteringEnabled(!clusteringEnabled)}
          drawingEnabled={drawingEnabled}
          onToggleDrawing={() => setDrawingEnabled(!drawingEnabled)}
        />

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

        {/* Marker Clustering - renders markers programmatically */}
        {clusteringEnabled ? (
          <MarkerClusterGroup
            locations={filteredLocations}
            isLocationLocked={isLocationLocked}
            createCustomIcon={createCustomIcon}
            handleLocationClick={handleLocationClick}
            fuzzCoordinates={fuzzCoordinates}
            maxClusterRadius={(zoom: number) => {
              // Increase cluster radius at lower zoom levels for wide geographic spread
              // At zoom 3: 400px radius, at zoom 10: 80px radius
              if (zoom <= 3) return 400;
              if (zoom <= 5) return 300;
              if (zoom <= 7) return 200;
              if (zoom <= 10) return 120;
              return 80;
            }}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            chunkedLoading={true}
            removeOutsideVisibleBounds={false}
          />
        ) : (
          /* Markers for filtered locations - React components */
          filteredLocations.map((location) => {
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
            />
          );
        })
        )}
      </MapContainer>

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

    </div>
  );
}
