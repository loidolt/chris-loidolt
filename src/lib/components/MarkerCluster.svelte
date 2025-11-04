<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import type { LocationPublic } from '$lib/pocketbase';
  import type { LeafletModule } from '$lib/types/map';
  import type { Map as LeafletMap } from 'leaflet';
  import {
    createCustomIcon,
    getLocationCoordinates,
    hasValidCoordinates,
  } from '$lib/mapUtils';
  import { getClusterRadius } from '$lib/config/map';

  type Props = {
    map: LeafletMap;
    L: LeafletModule;
    locations: LocationPublic[];
    isLocationLocked: (location: LocationPublic) => boolean;
    onLocationClick: (location: LocationPublic) => void;
  };

  let {
    map,
    L,
    locations,
    isLocationLocked,
    onLocationClick,
  }: Props = $props();

  let markerClusterGroup: any;
  let MarkerClusterGroup: any;

  onMount(async () => {
    if (!browser || !map || !L) return;

    // Dynamically import markercluster
    const markerCluster = await import('leaflet.markercluster');
    await import('leaflet.markercluster/dist/MarkerCluster.css');
    await import('leaflet.markercluster/dist/MarkerCluster.Default.css');

    // Create marker cluster group with adaptive clustering
    markerClusterGroup = (L as any).markerClusterGroup({
      maxClusterRadius: getClusterRadius,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      chunkedLoading: true,
      removeOutsideVisibleBounds: false,
      iconCreateFunction: function (cluster: any) {
        const count = cluster.getChildCount();
        let size = 'small';

        if (count >= 100) {
          size = 'large';
        } else if (count >= 10) {
          size = 'medium';
        }

        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: L.point(40, 40),
        });
      },
    });

    // Add markers to cluster group
    updateMarkers();

    // Add cluster group to map
    map.addLayer(markerClusterGroup);
  });

  // Update markers when locations change
  $effect(() => {
    if (browser && markerClusterGroup && locations) {
      updateMarkers();
    }
  });

  function updateMarkers() {
    if (!markerClusterGroup || !L) return;

    // Clear existing markers
    markerClusterGroup.clearLayers();

    // Add markers for each location
    locations.forEach((location) => {
      if (!hasValidCoordinates(location)) return;

      const isLocked = isLocationLocked(location);
      const [lat, lng] = getLocationCoordinates(location, isLocked);
      const icon = createCustomIcon(L, location.category, isLocked);
      const marker = L.marker([lat, lng], { icon });

      // Add click handler
      marker.on('click', () => {
        onLocationClick(location);
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

      // Add to cluster group
      markerClusterGroup.addLayer(marker);
    });
  }

  onDestroy(() => {
    if (markerClusterGroup && map) {
      map.removeLayer(markerClusterGroup);
    }
  });
</script>

<style>
  :global(.marker-cluster-small) {
    background-color: rgba(var(--accent-rgb), 0.6);
  }

  :global(.marker-cluster-small div) {
    background-color: rgba(var(--accent-rgb), 0.8);
  }

  :global(.marker-cluster-medium) {
    background-color: rgba(var(--accent-rgb), 0.7);
  }

  :global(.marker-cluster-medium div) {
    background-color: rgba(var(--accent-rgb), 0.9);
  }

  :global(.marker-cluster-large) {
    background-color: rgba(var(--accent-rgb), 0.8);
  }

  :global(.marker-cluster-large div) {
    background-color: rgba(var(--accent-rgb), 1);
  }

  :global(.marker-cluster) {
    border-radius: 50%;
  }

  :global(.marker-cluster div) {
    width: 30px;
    height: 30px;
    margin-left: 5px;
    margin-top: 5px;
    text-align: center;
    border-radius: 50%;
    font-weight: bold;
    color: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  :global(.marker-cluster span) {
    line-height: 30px;
  }
</style>
