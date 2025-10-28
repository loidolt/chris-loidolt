<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import type { LocationPublic } from '$lib/pocketbase';
  import { filteredLocations, allLocations } from '$lib/stores/locationFilters';
  import PasswordModal from './PasswordModal.svelte';

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
  let isPanelOpen = false;

  // Set all locations for filtering
  $: if (browser && locations) {
    allLocations.set(locations);
  }

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
          // Show location details
          selectedLocation = location;
          isPanelOpen = true;
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

        // Close modal and open panel
        showPasswordModal = false;
        isPanelOpen = true;
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

  function handleClosePanel() {
    isPanelOpen = false;
    selectedLocation = null;
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

  <!-- Password Modal -->
  {#if showPasswordModal && selectedLocation}
    <PasswordModal
      locationName={selectedLocation.name}
      onSubmit={handlePasswordSubmit}
      onCancel={handlePasswordCancel}
      error={passwordError}
    />
  {/if}

  <!-- Location Info Panel -->
  {#if isPanelOpen && selectedLocation}
    <div
      class="absolute top-4 right-4 z-[1000] max-w-md border-2 p-4 shadow-lg"
      style="background-color: var(--bg-surface); border-color: var(--border-color); max-height: calc(100vh - 8rem); overflow-y: auto;"
    >
      <!-- Close button -->
      <button
        on:click={handleClosePanel}
        class="absolute top-2 right-2 text-xl hover:opacity-70 transition-opacity"
        style="color: var(--text-primary)"
        aria-label="Close panel"
      >
        [×]
      </button>

      <!-- Content -->
      <div class="space-y-4 pr-6">
        <h3 class="text-sm font-bold" style="color: var(--link-color)">
          {selectedLocation.name}
        </h3>

        {#if selectedLocation.image}
          <img
            src={selectedLocation.image}
            alt={selectedLocation.name}
            class="w-full h-auto"
          />
        {/if}

        {#if selectedLocation.description}
          <p class="text-sm" style="color: var(--text-muted)">
            {selectedLocation.description}
          </p>
        {/if}

        {#if selectedLocation.category || selectedLocation.categories}
          <div class="text-xs" style="color: var(--accent-secondary)">
            Categories: {selectedLocation.categories?.join(', ') || selectedLocation.category || 'None'}
          </div>
        {/if}

        {#if selectedLocation.latitude && selectedLocation.longitude}
          <div class="text-xs font-mono" style="color: var(--text-muted)">
            Coordinates: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
          </div>
        {/if}

        {#if selectedLocation.url}
          <a
            href={selectedLocation.url}
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm hover:opacity-70 transition-opacity inline-block"
            style="color: var(--link-color)"
          >
            [View more info →]
          </a>
        {/if}
      </div>
    </div>
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
