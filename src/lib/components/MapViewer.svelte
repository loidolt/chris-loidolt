<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import type { LocationPublic } from '$lib/pocketbase';
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
  import DataPanel, { type PanelTab } from './DataPanel.svelte';
  import SearchFilter, { type FilterSection } from './SearchFilter.svelte';
  import PasswordModal from './PasswordModal.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';

  export let locations: LocationPublic[];
  export let initialCenter: [number, number] = [39.5, -98.35]; // Center of US
  export let initialZoom: number = 4;

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

  // Set all locations for filtering
  $: if (browser && locations) {
    allLocations.set(locations);
  }

  // Convert store values to SearchFilter format
  let localSearchQuery = '';
  let localSelectedFilters: Record<string, any> = {
    categories: new Set<string>(),
    privacy: 'all',
    hasImage: null,
  };

  // Sync local state with stores
  $: {
    searchQuery.set(localSearchQuery);
  }

  $: {
    selectedCategories.set(localSelectedFilters.categories || new Set());
    privacyFilter.set(localSelectedFilters.privacy || 'all');
    hasImageFilter.set(localSelectedFilters.hasImage ?? null);
  }

  // Define filter sections for SearchFilter component
  $: filterSections = [
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
  ] as FilterSection[];

  // Define tabs for the panel
  const tabs: PanelTab[] = [
    {
      id: 'filters',
      label: 'Filters',
    },
    {
      id: 'info',
      label: 'Info',
      disabled: !selectedLocation,
    },
  ];

  const handleClearFilters = () => {
    clearAllFilters();
    localSearchQuery = '';
    localSelectedFilters = {
      categories: new Set(),
      privacy: 'all',
      hasImage: null,
    };
  };

  onMount(async () => {
    if (!browser) return;

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

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Create marker layer
    markerLayer = L.layerGroup().addTo(map);

    // Initial marker render
    updateMarkers();

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
  });

  // Update markers when filtered locations change
  $: if (browser && map && L && $filteredLocations) {
    updateMarkers();
  }

  function updateMarkers() {
    if (!map || !L || !markerLayer) return;

    // Clear existing markers
    markerLayer.clearLayers();

    // Add markers for filtered locations
    $filteredLocations.forEach((location) => {
      if (!location.latitude || !location.longitude) return;

      const isPrivate = location.privacy === 'Private';
      const isUnlocked = unlockedLocations.has(location.id);

      // Use fuzzy coordinates for private locations that aren't unlocked
      const [lat, lng] = (isPrivate && !isUnlocked)
        ? fuzzCoordinates(location.latitude, location.longitude, location.id)
        : [location.latitude, location.longitude];

      const icon = createCustomIcon(location.category, isPrivate && !isUnlocked);

      const marker = L.marker([lat, lng], { icon }).addTo(markerLayer);

      // Add click handler
      marker.on('click', () => {
        if (isPrivate && !isUnlocked) {
          // Show password modal
          selectedLocation = location;
          showPasswordModal = true;
          passwordError = '';
        } else {
          // Show location details in info tab
          selectedLocation = location;
        }
      });

      // Add popup with basic info
      const popupContent = `
        <div style="color: var(--text-primary); min-width: 150px;">
          <strong style="color: var(--link-color)">${location.name}</strong>
          ${isPrivate && !isUnlocked ? '<br><em style="color: var(--text-muted)">(Private - click to unlock)</em>' : ''}
          ${location.description && (!isPrivate || isUnlocked) ? `<br><span style="color: var(--text-muted)">${location.description}</span>` : ''}
        </div>
      `;
      marker.bindPopup(popupContent);
    });

    // Fit bounds to filtered markers if filter changed and we have locations
    if ($filteredLocations.length > 0 && $filteredLocations.length < locations.length) {
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

  <!-- Data Panel with Filters and Info -->
  <DataPanel
    {tabs}
    defaultTab="filters"
    position="left"
    storageKey="map-viewer"
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
