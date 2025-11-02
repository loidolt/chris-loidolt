<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import type { LocationPublic } from '$lib/pocketbase';
  import type { FeatureCollection } from 'geojson';
  import {
    filteredLocations,
    allLocations,
    searchQuery,
    selectedCategories,
    privacyFilter,
    hasImageFilter,
    categories,
    activeFilterCount,
    clearAllFilters,
  } from '$lib/stores/locationFilters';
  import { drawings, exportDrawingsAsGeoJSON, clearAllDrawings } from '$lib/stores/drawings';
  import DataPanel, { type PanelTab } from './DataPanel.svelte';
  import SearchFilter, { type FilterSection } from './SearchFilter.svelte';
  import PasswordModal from './PasswordModal.svelte';
  import MarkerCluster from './MarkerCluster.svelte';
  import MapDrawingTools from './MapDrawingTools.svelte';
  import MapActionControls from './MapActionControls.svelte';
  import LocationListPanel from './LocationListPanel.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';

  // Props using Svelte 5 runes syntax
  let {
    locations,
    initialCenter = [39.5, -98.35] as [number, number], // Center of US
    initialZoom = 4,
    sharedLocationId = null,
    sharedLocationToken = null,
  }: {
    locations: LocationPublic[];
    initialCenter?: [number, number];
    initialZoom?: number;
    sharedLocationId?: string | null;
    sharedLocationToken?: string | null;
  } = $props();

  let mapContainer: HTMLDivElement;
  let map: any;
  let L: any;
  let markerLayer: any;
  let fuzzCoordinates: any;
  let createCustomIcon: any;
  let showPasswordModal = false;
  let selectedLocation: LocationPublic | null = null;
  let passwordError = '';
  let unlockedLocations = new Set<string>();

  // New feature state
  let clusteringEnabled = $state(false);
  let drawingEnabled = $state(false);
  let autoZoomToExtents = $state(true);
  let mapZoom = $state(initialZoom);
  let currentDrawings = $state<FeatureCollection>($drawings);

  // Tile error tracking for retry logic
  const failedTiles = new Set<string>();
  const tileRetryCount = new Map<string, number>();
  const TILE_RETRY_LIMIT = 3;
  const TILE_SUBDOMAINS = ['a', 'b', 'c'];

  // Set all locations for filtering
  $effect(() => {
    if (browser && locations) {
      allLocations.set(locations);
    }
  });

  // Convert store values to SearchFilter format
  let localSearchQuery = $state('');
  let localSelectedFilters = $state<Record<string, any>>({
    categories: new Set<string>(),
    privacy: 'all',
    hasImage: null,
  });

  // Sync local state with stores
  $effect(() => {
    searchQuery.set(localSearchQuery);
  });

  $effect(() => {
    selectedCategories.set(localSelectedFilters.categories || new Set());
    privacyFilter.set(localSelectedFilters.privacy || 'all');
    hasImageFilter.set(localSelectedFilters.hasImage ?? null);
  });

  // Define filter sections for SearchFilter component
  const filterSections = $derived([
    {
      id: 'categories',
      label: 'Categories',
      type: 'multi',
      options: $categories.map(cat => ({
        value: cat,
        label: cat,
        count: locations.filter(loc =>
          (loc.categories && loc.categories.includes(cat)) || loc.category === cat
        ).length,
      })),
    },
    {
      id: 'privacy',
      label: 'Privacy',
      type: 'toggle',
      options: [
        { value: 'all', label: 'All' },
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' },
      ],
    },
    {
      id: 'hasImage',
      label: 'Image',
      type: 'toggle',
      options: [
        { value: null, label: 'All' },
        { value: true, label: 'With Image' },
        { value: false, label: 'No Image' },
      ],
    },
  ] as FilterSection[]);

  // Define tabs for the panel
  const tabs = $derived([
    {
      id: 'filters',
      label: 'Filters',
    },
    {
      id: 'locations',
      label: 'Locations',
    },
    {
      id: 'info',
      label: 'Info',
      disabled: !selectedLocation,
    },
  ]);

  const handleClearFilters = () => {
    clearAllFilters();
    localSearchQuery = '';
    localSelectedFilters = {
      categories: new Set(),
      privacy: 'all',
      hasImage: null,
    };
  };

  // Save settings to localStorage when they change
  $effect(() => {
    if (browser) {
      try {
        localStorage.setItem('mapClusteringEnabled', JSON.stringify(clusteringEnabled));
      } catch (error) {
        console.error('Error saving clustering setting:', error);
      }
    }
  });

  $effect(() => {
    if (browser) {
      try {
        localStorage.setItem('mapAutoZoomToExtents', JSON.stringify(autoZoomToExtents));
      } catch (error) {
        console.error('Error saving auto-zoom setting:', error);
      }
    }
  });

  $effect(() => {
    if (browser) {
      try {
        localStorage.setItem('unlockedLocations', JSON.stringify(Array.from(unlockedLocations)));
      } catch (error) {
        console.error('Error saving unlocked locations:', error);
      }
    }
  });

  // Sync drawings store to local state
  $effect(() => {
    currentDrawings = $drawings;
  });

  // Map invalidation handler for resize and visibility changes
  $effect(() => {
    if (!browser || !map || !mapContainer) return;

    // Handle visibility changes (tab switching, window minimizing)
    const handleVisibilityChange = () => {
      if (!document.hidden && map) {
        // Give the browser a moment to finish rendering
        setTimeout(() => {
          map.invalidateSize();
          // Force tile layers to redraw
          map.eachLayer((layer: any) => {
            if (layer._tileZoom !== undefined) {
              layer.redraw();
            }
          });
        }, 100);
      }
    };

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      if (map) {
        map.invalidateSize();
      }
    });

    // Attach listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    resizeObserver.observe(mapContainer);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
    };
  });

  // Helper function to check if location is locked
  const isLocationLocked = (location: LocationPublic) => {
    return location.privacy === 'Private' && !unlockedLocations.has(location.id);
  };

  // Handle location click
  const handleLocationClick = (location: LocationPublic) => {
    if (isLocationLocked(location)) {
      selectedLocation = location;
      showPasswordModal = true;
      passwordError = '';
    } else {
      selectedLocation = location;
    }
  };

  // Handle location selection from list - pan to location and select it
  const handleLocationSelect = (location: LocationPublic) => {
    if (!map || !location.latitude || !location.longitude) return;

    const isLocked = isLocationLocked(location);

    // Pan to location
    const [lat, lng] = isLocked
      ? fuzzCoordinates(location.latitude, location.longitude, location.id)
      : [location.latitude, location.longitude];

    map.setView([lat, lng], Math.max(map.getZoom(), 13), { animate: true });

    // Select location (will trigger password modal if locked)
    handleLocationClick(location);
  };

  // Handle locate user
  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map) {
            map.setView([position.coords.latitude, position.coords.longitude], 16);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to access your location. Please check browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Handle drawings change
  const handleDrawingsChange = (newDrawings: FeatureCollection) => {
    drawings.set(newDrawings);
  };

  // Track active panel tab for keyboard shortcuts
  let activePanelTab = $state('filters');

  // Keyboard shortcuts - using $effect for cleanup
  $effect(() => {
    if (!browser || !map) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Check for Shift+L (locations list)
      if (e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        activePanelTab = activePanelTab === 'locations' ? 'filters' : 'locations';
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'l':
          e.preventDefault();
          handleLocate();
          break;
        case 'c':
          e.preventDefault();
          clusteringEnabled = !clusteringEnabled;
          break;
        case 'd':
          e.preventDefault();
          drawingEnabled = !drawingEnabled;
          break;
        case 'escape':
          if (showPasswordModal) {
            handlePasswordCancel();
          } else if (selectedLocation) {
            selectedLocation = null;
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  onMount(async () => {
    if (!browser) return;

    // Load settings from localStorage
    try {
      const storedClustering = localStorage.getItem('mapClusteringEnabled');
      if (storedClustering !== null) {
        clusteringEnabled = JSON.parse(storedClustering);
      } else {
        // Auto-enable clustering if there are many locations
        clusteringEnabled = locations.length > 10;
      }

      const storedAutoZoom = localStorage.getItem('mapAutoZoomToExtents');
      if (storedAutoZoom !== null) {
        autoZoomToExtents = JSON.parse(storedAutoZoom);
      }

      const storedUnlocked = localStorage.getItem('unlockedLocations');
      if (storedUnlocked) {
        unlockedLocations = new Set(JSON.parse(storedUnlocked));
      }
    } catch (error) {
      console.error('Error loading map settings:', error);
    }

    // Dynamically import Leaflet and map utils to avoid SSR issues
    L = await import('leaflet');
    const mapUtils = await import('$lib/mapUtils');
    fuzzCoordinates = mapUtils.fuzzCoordinates;
    createCustomIcon = mapUtils.createCustomIcon;
    await import('leaflet/dist/leaflet.css');

    // Initialize map
    map = L.map(mapContainer, {
      zoomControl: false, // We'll add it in a custom position
    }).setView(initialCenter, initialZoom);

    // Add OpenTopoMap tile layer (primary) with fallback to OSM
    const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      maxZoom: 17,
      maxNativeZoom: 13, // OpenTopoMap has spotty coverage above zoom 13
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    // Add OSM fallback layer for high zoom (13+)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 13,
      opacity: 0.8,
      subdomains: ['a', 'b', 'c'],
    });

    // Track zoom and add/remove OSM layer based on zoom level
    map.on('zoomend', () => {
      const zoom = map.getZoom();
      mapZoom = zoom;

      if (zoom >= 13 && !map.hasLayer(osmLayer)) {
        map.addLayer(osmLayer);
      } else if (zoom < 13 && map.hasLayer(osmLayer)) {
        map.removeLayer(osmLayer);
      }
    });

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tile error handling with retry logic
    const handleTileError = (layer: any, isOSM: boolean) => {
      return (event: any) => {
        const tile = event.tile;
        const tileUrl = tile.src;
        const tileKey = `${event.coords.z}-${event.coords.x}-${event.coords.y}`;

        // Track this tile as failed
        failedTiles.add(tileKey);

        // Get current retry count
        const retryCount = tileRetryCount.get(tileKey) || 0;

        // Only retry if under limit
        if (retryCount < TILE_RETRY_LIMIT) {
          // Calculate delay based on zoom and tile source
          const baseDelay = isOSM ? 500 : 1000; // OSM is faster, so shorter delay
          const zoomMultiplier = Math.max(1, 14 - event.coords.z); // Higher zoom = shorter delay
          const delay = baseDelay * Math.pow(1.5, retryCount) / zoomMultiplier;

          // Pick a different subdomain for retry
          const currentSubdomain = new URL(tileUrl).hostname.split('.')[0];
          const currentIndex = TILE_SUBDOMAINS.indexOf(currentSubdomain);
          const nextSubdomain = TILE_SUBDOMAINS[(currentIndex + 1) % TILE_SUBDOMAINS.length];

          // Retry after delay
          setTimeout(() => {
            const newUrl = tileUrl.replace(/\/\/[a-c]\./, `//${nextSubdomain}.`);
            tile.src = newUrl;
            tileRetryCount.set(tileKey, retryCount + 1);
          }, delay);
        } else {
          // Only log unexpected failures (low zoom for OpenTopoMap or any OSM failure)
          const shouldLog = (!isOSM && event.coords.z <= 10) || isOSM;
          if (shouldLog) {
            console.warn(`Tile failed after ${TILE_RETRY_LIMIT} retries:`, tileKey);
          }
        }
      };
    };

    // Add error handlers to both layers
    topoLayer.on('tileerror', handleTileError(topoLayer, false));
    osmLayer.on('tileerror', handleTileError(osmLayer, true));

    // Create marker layer (only used when clustering is disabled)
    markerLayer = L.layerGroup();
    if (!clusteringEnabled) {
      markerLayer.addTo(map);
    }

    // Initial marker render (only if clustering is disabled)
    if (!clusteringEnabled) {
      updateMarkers();
    }

    // Fit bounds to all markers if we have locations
    if (locations.length > 0) {
      const validLocations = locations.filter(loc => loc.latitude && loc.longitude);
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(
          validLocations.map(loc => [loc.latitude, loc.longitude])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }

    // Handle shared location from URL parameters
    if (sharedLocationId) {
      const location = locations.find(loc => loc.id === sharedLocationId);

      if (location) {
        // If location is private and we have a token, try to unlock it
        if (location.privacy === 'Private' && sharedLocationToken) {
          try {
            const response = await fetch('/api/unlock-location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                locationId: sharedLocationId,
                password: sharedLocationToken,
              }),
            });

            const data = await response.json();

            if (data.success) {
              // Add to unlocked set
              unlockedLocations.add(sharedLocationId);
              unlockedLocations = unlockedLocations; // Trigger reactivity
            } else {
              console.warn('Failed to unlock shared location:', data.error);
            }
          } catch (error) {
            console.error('Error unlocking shared location:', error);
          }
        }

        // Navigate to location
        if (location.latitude && location.longitude) {
          const isLocked = isLocationLocked(location);
          const [lat, lng] = isLocked
            ? fuzzCoordinates(location.latitude, location.longitude, location.id)
            : [location.latitude, location.longitude];

          map.setView([lat, lng], 15, { animate: true });
        }

        // Select location and switch to Info tab
        selectedLocation = location;
        activePanelTab = 'info';
      } else {
        console.warn('Shared location not found:', sharedLocationId);
      }
    }
  });

  // Update markers when filtered locations change (only when clustering is disabled)
  $effect(() => {
    if (browser && map && L && $filteredLocations && !clusteringEnabled) {
      updateMarkers();
    }
  });

  // Toggle marker layer based on clustering state
  $effect(() => {
    if (browser && map && markerLayer) {
      if (clusteringEnabled) {
        if (map.hasLayer(markerLayer)) {
          map.removeLayer(markerLayer);
        }
      } else {
        if (!map.hasLayer(markerLayer)) {
          map.addLayer(markerLayer);
          updateMarkers();
        }
      }
    }
  });

  function updateMarkers() {
    if (!map || !L || !markerLayer) return;

    // Clear existing markers
    markerLayer.clearLayers();

    // Add markers for filtered locations
    $filteredLocations.forEach((location) => {
      if (!location.latitude || !location.longitude) return;

      const isLocked = isLocationLocked(location);

      // Use fuzzy coordinates for private locations that aren't unlocked
      const [lat, lng] = isLocked
        ? fuzzCoordinates(location.latitude, location.longitude, location.id)
        : [location.latitude, location.longitude];

      const icon = createCustomIcon(location.category, isLocked);

      const marker = L.marker([lat, lng], { icon }).addTo(markerLayer);

      // Add click handler
      marker.on('click', () => {
        handleLocationClick(location);
      });

      // Add popup with basic info
      const popupContent = `
        <div style="color: var(--text-primary); min-width: 150px;">
          <strong style="color: var(--link-color)">${location.name}</strong>
          ${isLocked ? '<br><em style="color: var(--text-muted)">(Private - click to unlock)</em>' : ''}
          ${location.description && !isLocked ? `<br><span style="color: var(--text-muted)">${location.description}</span>` : ''}
        </div>
      `;
      marker.bindPopup(popupContent);
    });

    // Fit bounds to filtered markers if auto-zoom is enabled and filter changed
    if (autoZoomToExtents && $filteredLocations.length > 0 && $filteredLocations.length < locations.length) {
      const validLocations = $filteredLocations.filter(loc => loc.latitude && loc.longitude);
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(
          validLocations.map(loc => [loc.latitude, loc.longitude])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13, animate: true });
      }
    }
  }

  async function handlePasswordSubmit(password: string) {
    if (!selectedLocation) return;

    try {
      // Call unlock API
      const response = await fetch('/api/unlock-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: selectedLocation.id,
          password,
        }),
      });

      const data = await response.json();

      // Handle rate limiting (HTTP 429)
      if (response.status === 429) {
        const retryAfter = data.retryAfter || 60; // Default to 60 seconds if not provided
        const minutes = Math.ceil(retryAfter / 60);
        passwordError = `Too many attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`;
        return;
      }

      if (data.success) {
        // Add to unlocked set
        unlockedLocations.add(selectedLocation.id);
        unlockedLocations = unlockedLocations; // Trigger reactivity

        // Close modal
        showPasswordModal = false;
        passwordError = '';

        // Update markers to show unlocked location
        updateMarkers();
      } else {
        passwordError = data.error || 'Incorrect password';
      }
    } catch (error) {
      console.error('Error unlocking location:', error);
      passwordError = 'Failed to unlock location';
    }
  }

  function handlePasswordCancel() {
    showPasswordModal = false;
    selectedLocation = null;
    passwordError = '';
  }

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });
</script>

<div class="relative h-full w-full">
  <!-- Map Container -->
  <div bind:this={mapContainer} class="h-full w-full"></div>

  <!-- Marker Clustering (conditionally rendered) -->
  {#if browser && map && L && clusteringEnabled}
    <MarkerCluster
      {map}
      {L}
      locations={$filteredLocations}
      {createCustomIcon}
      {fuzzCoordinates}
      {isLocationLocked}
      onLocationClick={handleLocationClick}
    />
  {/if}

  <!-- Drawing Tools (conditionally rendered when enabled) -->
  {#if browser && map && L && drawingEnabled}
    <MapDrawingTools
      {map}
      {L}
      drawings={currentDrawings}
      onDrawingsChange={handleDrawingsChange}
      enabled={drawingEnabled}
    />
  {/if}

  <!-- Map Action Controls -->
  {#if browser && map}
    <MapActionControls
      onLocate={handleLocate}
      {clusteringEnabled}
      onToggleClustering={() => clusteringEnabled = !clusteringEnabled}
      {drawingEnabled}
      onToggleDrawing={() => drawingEnabled = !drawingEnabled}
    />
  {/if}

  <!-- Data Panel with Filters, Locations, and Info -->
  <DataPanel
    {tabs}
    defaultTab="filters"
    position="left"
    storageKey="map-viewer"
    tab={activePanelTab}
    onTabChange={(newTab) => activePanelTab = newTab}
  >
    <div slot="filters">
      <SearchFilter
        bind:searchQuery={localSearchQuery}
        bind:selectedFilters={localSelectedFilters}
        {filterSections}
        activeFilterCount={$activeFilterCount}
        resultCount={$filteredLocations.length}
        searchPlaceholder="Search locations..."
        onClearAll={handleClearFilters}
      />
    </div>

    <div slot="locations">
      <LocationListPanel
        locations={$filteredLocations}
        selectedLocationId={selectedLocation?.id}
        onLocationSelect={handleLocationSelect}
      />
    </div>

    <div slot="info">
      {#if selectedLocation}
        <Card.Root class="border-0 shadow-none">
          <Card.Content class="p-0 space-y-4">
            <div>
              <Card.Title class="text-base mb-2">{selectedLocation.name}</Card.Title>
              {#if selectedLocation.privacy === 'Private'}
                <Badge variant="secondary" class="text-xs">Private</Badge>
              {/if}
            </div>

            {#if selectedLocation.image}
              <img
                src={selectedLocation.image}
                alt={selectedLocation.name}
                class="w-full h-auto rounded-md"
              />
            {/if}

            {#if selectedLocation.description}
              <p class="text-sm text-muted-foreground">
                {selectedLocation.description}
              </p>
            {/if}

            {#if selectedLocation.category || selectedLocation.categories}
              <div class="text-xs text-muted-foreground">
                <strong>Categories:</strong> {selectedLocation.categories?.join(', ') || selectedLocation.category || 'None'}
              </div>
            {/if}

            {#if selectedLocation.latitude && selectedLocation.longitude}
              <div class="text-xs font-mono text-muted-foreground">
                <strong>Coordinates:</strong> {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
              </div>
            {/if}

            {#if selectedLocation.url}
              <Button
                variant="link"
                size="sm"
                class="p-0 h-auto text-sm"
                onclick={() => selectedLocation && window.open(selectedLocation.url, '_blank')}
              >
                View more info →
              </Button>
            {/if}
          </Card.Content>
        </Card.Root>
      {:else}
        <div class="text-sm text-muted-foreground text-center py-8">
          Click on a marker to view location details
        </div>
      {/if}
    </div>
  </DataPanel>

  <!-- Password Modal -->
  {#if showPasswordModal && selectedLocation}
    <PasswordModal
      locationName={selectedLocation.name}
      onSubmit={handlePasswordSubmit}
      onCancel={handlePasswordCancel}
      error={passwordError}
    />
  {/if}
</div>

<style>
  :global(.leaflet-container) {
    font-family: 'JetBrains Mono', monospace;
  }

  :global(.leaflet-popup-content-wrapper) {
    background-color: var(--bg-surface);
    border: 1px solid var(--border-color);
  }

  :global(.leaflet-popup-content) {
    color: var(--text-primary);
  }

  :global(.leaflet-popup-tip) {
    background-color: var(--bg-surface);
  }
</style>
