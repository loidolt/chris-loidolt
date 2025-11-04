<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import type { Map as LeafletMap } from 'leaflet';
  import type { LocationPublic } from '$lib/pocketbase';
  import type { FeatureCollection } from 'geojson';
  import type { LeafletModule } from '$lib/types/map';
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
  import { isMobile } from '$lib/utils/breakpoints';
  import { storage, throttle } from '$lib/utils/helpers';
  import { MAP_CONFIG, TILE_LAYERS } from '$lib/config/map';
  import { createThrottledResizeObserver } from '$lib/mapUtils';

  // Components
  import DataPanel from './DataPanel.svelte';
  import BottomSheet from './BottomSheet.svelte';
  import SearchFilter, { type FilterSection } from './SearchFilter.svelte';
  import MarkerCluster from './MarkerCluster.svelte';
  import MapDrawingTools from './MapDrawingTools.svelte';
  import MapActionControls from './MapActionControls.svelte';
  import LocationListPanel from './LocationListPanel.svelte';
  import LocationSecurity from './map/LocationSecurity.svelte';
  import LocationManager from './map/LocationManager.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';

  // Props
  type Props = {
    locations: LocationPublic[];
    initialCenter?: [number, number];
    initialZoom?: number;
    sharedLocationId?: string | null;
    sharedLocationToken?: string | null;
  };

  let {
    locations,
    initialCenter = MAP_CONFIG.DEFAULT_CENTER,
    initialZoom = MAP_CONFIG.DEFAULT_ZOOM,
    sharedLocationId = null,
    sharedLocationToken = null,
  }: Props = $props();

  // Map state
  let mapContainer: HTMLDivElement;
  let map = $state<LeafletMap | null>(null);
  let L = $state<LeafletModule | null>(null);
  let selectedLocation = $state<LocationPublic | null>(null);

  // Feature toggles
  let clusteringEnabled = $state(false);
  let drawingEnabled = $state(false);
  let autoZoomToExtents = $state(true);
  let mapZoom = $state(initialZoom);

  // Component references
  let locationSecurity = $state<LocationSecurity | undefined>(undefined);
  let locationManager = $state<LocationManager | undefined>(undefined);

  // UI state
  let activePanelTab = $state('filters');
  let mobileSheetOpen = $state(false);

  // Local filter state for SearchFilter
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

  // Set all locations for filtering
  $effect(() => {
    if (browser && locations) {
      allLocations.set(locations);
    }
  });

  // Load settings from storage
  onMount(async () => {
    if (!browser) return;

    // Load user preferences
    clusteringEnabled = storage.get(
      MAP_CONFIG.STORAGE_KEYS.CLUSTERING_ENABLED,
      locations.length > MAP_CONFIG.AUTO_CLUSTER_THRESHOLD
    );
    autoZoomToExtents = storage.get(MAP_CONFIG.STORAGE_KEYS.AUTO_ZOOM_ENABLED, true);

    // Initialize Leaflet
    await initializeMap();

    // Handle shared location
    if (sharedLocationId && sharedLocationToken && locationSecurity) {
      await handleSharedLocation();
    }
  });

  // Save settings when changed
  $effect(() => {
    if (browser) {
      storage.set(MAP_CONFIG.STORAGE_KEYS.CLUSTERING_ENABLED, clusteringEnabled);
    }
  });

  $effect(() => {
    if (browser) {
      storage.set(MAP_CONFIG.STORAGE_KEYS.AUTO_ZOOM_ENABLED, autoZoomToExtents);
    }
  });

  /**
   * Initialize Leaflet map
   */
  async function initializeMap() {
    if (!browser || map) return;

    // Dynamically import Leaflet as namespace
    L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');

    // Create map instance
    map = L.map(mapContainer, {
      zoomControl: false,
      center: initialCenter,
      zoom: initialZoom,
      maxZoom: MAP_CONFIG.MAX_ZOOM,
      minZoom: MAP_CONFIG.MIN_ZOOM,
    });

    // Add tile layers
    const topoLayer = L.tileLayer(TILE_LAYERS.OPENTOPO.url, {
      attribution: TILE_LAYERS.OPENTOPO.attribution,
      maxZoom: TILE_LAYERS.OPENTOPO.maxZoom,
      maxNativeZoom: TILE_LAYERS.OPENTOPO.maxNativeZoom,
      subdomains: MAP_CONFIG.TILE_SUBDOMAINS,
    }).addTo(map);

    const osmLayer = L.tileLayer(TILE_LAYERS.OSM.url, {
      attribution: TILE_LAYERS.OSM.attribution,
      maxZoom: TILE_LAYERS.OSM.maxZoom,
      minZoom: TILE_LAYERS.OSM.minZoom,
      opacity: TILE_LAYERS.OSM.opacity,
      subdomains: MAP_CONFIG.TILE_SUBDOMAINS,
    });

    // Switch to OSM at high zoom
    map.on('zoomend', () => {
      const zoom = map!.getZoom();
      mapZoom = zoom;

      if (zoom >= MAP_CONFIG.TILE_ZOOM_THRESHOLD && !map!.hasLayer(osmLayer)) {
        map!.addLayer(osmLayer);
      } else if (zoom < MAP_CONFIG.TILE_ZOOM_THRESHOLD && map!.hasLayer(osmLayer)) {
        map!.removeLayer(osmLayer);
      }
    });

    // Add zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Handle tile errors with retry logic
    setupTileErrorHandling(topoLayer, osmLayer);

    // Setup resize handling
    setupResizeHandling();

    // Fit bounds to locations
    fitBoundsToAllLocations();
  }

  /**
   * Setup tile error handling with retry logic
   */
  function setupTileErrorHandling(topoLayer: any, osmLayer: any) {
    const failedTiles = new Set<string>();
    const tileRetryCount = new Map<string, number>();

    const handleTileError = (isOSM: boolean) => (event: any) => {
      const tile = event.tile;
      const tileKey = `${event.coords.z}-${event.coords.x}-${event.coords.y}`;

      failedTiles.add(tileKey);
      const retryCount = tileRetryCount.get(tileKey) || 0;

      if (retryCount < MAP_CONFIG.TILE_RETRY_LIMIT) {
        const baseDelay = isOSM ? MAP_CONFIG.TILE_OSM_DELAY_MS : MAP_CONFIG.TILE_BASE_DELAY_MS;
        const zoomMultiplier = Math.max(1, 14 - event.coords.z);
        const delay = baseDelay * Math.pow(1.5, retryCount) / zoomMultiplier;

        // Rotate subdomain
        const currentSubdomain = new URL(tile.src).hostname.split('.')[0];
        const currentIndex = MAP_CONFIG.TILE_SUBDOMAINS.indexOf(currentSubdomain);
        const nextSubdomain = MAP_CONFIG.TILE_SUBDOMAINS[(currentIndex + 1) % MAP_CONFIG.TILE_SUBDOMAINS.length];

        setTimeout(() => {
          tile.src = tile.src.replace(/\/\/[a-c]\./, `//${nextSubdomain}.`);
          tileRetryCount.set(tileKey, retryCount + 1);
        }, delay);
      }
    };

    topoLayer.on('tileerror', handleTileError(false));
    osmLayer.on('tileerror', handleTileError(true));
  }

  /**
   * Setup resize and visibility change handling
   */
  function setupResizeHandling() {
    if (!map || !mapContainer) return;

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden && map) {
        setTimeout(() => {
          map!.invalidateSize();
          map!.eachLayer((layer: any) => {
            if (layer._tileZoom !== undefined) {
              layer.redraw();
            }
          });
        }, MAP_CONFIG.INVALIDATE_DELAY_MS);
      }
    };

    // Throttled resize observer
    const resizeObserver = createThrottledResizeObserver(() => {
      if (map) {
        map.invalidateSize();
      }
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    resizeObserver.observe(mapContainer);

    // Cleanup
    onDestroy(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
    });
  }

  /**
   * Fit map bounds to all locations
   */
  function fitBoundsToAllLocations() {
    if (!map || !L || locations.length === 0) return;

    const validLocations = locations.filter(
      (loc) => loc.latitude && loc.longitude
    );

    if (validLocations.length > 0) {
      const bounds = L.latLngBounds(
        validLocations.map((loc) => [loc.latitude, loc.longitude])
      );
      map.fitBounds(bounds, {
        padding: MAP_CONFIG.FIT_BOUNDS_PADDING,
        maxZoom: MAP_CONFIG.FIT_BOUNDS_MAX_ZOOM,
      });
    }
  }

  /**
   * Handle shared location from URL parameters
   */
  async function handleSharedLocation() {
    if (!sharedLocationId || !locationSecurity) return;

    const location = locations.find((loc) => loc.id === sharedLocationId);
    if (!location) return;

    // Try to unlock with token
    if (sharedLocationToken && location.privacy === 'Private') {
      await locationSecurity.unlockWithToken(sharedLocationId, sharedLocationToken);
    }

    // Navigate to location
    if (locationManager && location.latitude && location.longitude) {
      locationManager.panToLocation(location, 15);
    }

    // Select location
    selectedLocation = location;
    activePanelTab = 'info';
  }

  /**
   * Handle location click
   */
  function handleLocationClick(location: LocationPublic) {
    if (locationSecurity) {
      const unlockedLocation = locationSecurity.handleLocationClick(location);
      if (unlockedLocation) {
        selectedLocation = location;
        activePanelTab = 'info';
      }
    }
  }

  /**
   * Handle location selection from list
   */
  function handleLocationSelect(location: LocationPublic) {
    if (locationManager) {
      locationManager.panToLocation(location, Math.max(mapZoom, 13));
    }
    handleLocationClick(location);
  }

  /**
   * Handle user geolocation
   */
  function handleLocate() {
    if (!navigator.geolocation || !map) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (map) {
          map.setView([position.coords.latitude, position.coords.longitude], 16);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to access your location. Please check browser permissions.');
      }
    );
  }

  /**
   * Handle location unlock
   */
  function handleLocationUnlock(locationId: string) {
    // Trigger marker update by forcing LocationManager to refresh
    if (locationManager) {
      // The locationManager will automatically update via its $effect
    }
  }

  /**
   * Clear all filters
   */
  function handleClearFilters() {
    clearAllFilters();
    localSearchQuery = '';
    localSelectedFilters = {
      categories: new Set(),
      privacy: 'all',
      hasImage: null,
    };
  }

  // Define filter sections
  const filterSections = $derived<FilterSection[]>([
    {
      id: 'categories',
      label: 'Categories',
      type: 'multi',
      options: $categories.map((cat) => ({
        value: cat,
        label: cat,
        count: locations.filter(
          (loc) =>
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
  ]);

  // Define tabs
  const tabs = $derived([
    { id: 'filters', label: 'Filters' },
    { id: 'locations', label: 'Locations' },
    { id: 'info', label: 'Info', disabled: !selectedLocation },
  ]);

  // Keyboard shortcuts
  $effect(() => {
    if (!browser || !map) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

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
          if (selectedLocation) {
            selectedLocation = null;
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });
</script>

<div class="relative h-full w-full">
  <!-- Map Container -->
  <div bind:this={mapContainer} class="h-full w-full"></div>

  {#if browser && map && L}
    <!-- Location Security Manager -->
    <LocationSecurity bind:this={locationSecurity} onUnlock={handleLocationUnlock} />

    <!-- Marker Management -->
    {#if !clusteringEnabled}
      <LocationManager
        bind:this={locationManager}
        {map}
        {L}
        locations={$filteredLocations}
        unlockedLocations={locationSecurity?.getUnlockedLocations() || new Set()}
        isLocationLocked={(loc) => locationSecurity?.isLocationLocked(loc) || false}
        onLocationClick={handleLocationClick}
        {autoZoomToExtents}
      />
    {/if}

    <!-- Marker Clustering -->
    {#if clusteringEnabled}
      <MarkerCluster
        {map}
        {L}
        locations={$filteredLocations}
        isLocationLocked={(loc) => locationSecurity?.isLocationLocked(loc) || false}
        onLocationClick={handleLocationClick}
      />
    {/if}

    <!-- Drawing Tools -->
    {#if drawingEnabled}
      <MapDrawingTools
        {map}
        {L}
        drawings={$drawings}
        onDrawingsChange={(newDrawings) => drawings.set(newDrawings)}
        enabled={drawingEnabled}
      />
    {/if}

    <!-- Map Action Controls -->
    <MapActionControls
      onLocate={handleLocate}
      {clusteringEnabled}
      onToggleClustering={() => (clusteringEnabled = !clusteringEnabled)}
      {drawingEnabled}
      onToggleDrawing={() => (drawingEnabled = !drawingEnabled)}
    />

    <!-- Desktop Panel / Mobile Bottom Sheet -->
    {#if $isMobile}
      <BottomSheet bind:isOpen={mobileSheetOpen} title="Map Controls">
        {@render panelContent()}
      </BottomSheet>
    {:else}
      <DataPanel
        {tabs}
        defaultTab="filters"
        position="left"
        storageKey="map-viewer"
        tab={activePanelTab}
        onTabChange={(newTab) => (activePanelTab = newTab)}
      >
        {@render panelContent()}
      </DataPanel>
    {/if}
  {/if}
</div>

{#snippet panelContent()}
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
              <strong>Categories:</strong>
              {selectedLocation.categories?.join(', ') || selectedLocation.category || 'None'}
            </div>
          {/if}

          {#if selectedLocation.latitude && selectedLocation.longitude}
            <div class="text-xs font-mono text-muted-foreground">
              <strong>Coordinates:</strong>
              {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
            </div>
          {/if}

          {#if selectedLocation.url}
            <Button
              variant="link"
              size="sm"
              class="p-0 h-auto text-sm"
              onclick={() =>
                selectedLocation && window.open(selectedLocation.url, '_blank')}
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
{/snippet}

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
