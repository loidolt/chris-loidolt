'use client';

import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import Fuse from 'fuse.js';
import L from 'leaflet';
import type { Location } from '@/lib/airtable';
import PasswordModal from './PasswordModal';
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

// Component to handle map view changes
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

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
  const isDark = useTheme();

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

  // Calculate center from all locations if not provided
  useEffect(() => {
    if (locations.length > 0 && initialCenter === initialCenter) {
      const validLocations = locations.filter(loc => loc.latitude && loc.longitude);
      if (validLocations.length > 0) {
        const avgLat = validLocations.reduce((sum, loc) => sum + loc.latitude, 0) / validLocations.length;
        const avgLng = validLocations.reduce((sum, loc) => sum + loc.longitude, 0) / validLocations.length;
        setMapCenter([avgLat, avgLng]);
      }
    }
  }, [locations, initialCenter]);

  // Check if location is locked
  const isLocationLocked = (location: Location) => {
    return location.privacy === 'Private' && !unlockedLocations.has(location.id);
  };

  // Handle password submission
  const handlePasswordSubmit = (password: string) => {
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
  };

  // Handle location click from search/list or marker
  const handleLocationClick = (location: Location) => {
    if (isLocationLocked(location)) {
      // Show password modal for locked locations
      setPasswordModal({ location });
    } else {
      // Navigate to location (exact coords for unlocked, fuzzy for public)
      setMapCenter([location.latitude, location.longitude]);
      setMapZoom(14);
      setShowLocationList(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Full-page Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className={`e-ink-map ${isDark ? 'theme-dark' : 'theme-light'}`}
        zoomControl={false}
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* Zoom controls positioned in bottom-right */}
        <ZoomControl position="bottomright" />

        {/* OpenTopoMap tiles with theme-aware styling */}
        <TileLayer
          attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          maxZoom={17}
          className="theme-tiles"
        />

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
            <div className="text-sm mb-1" style={{ color: 'var(--accent-secondary)' }}>
              GIS Map
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
    </div>
  );
}
