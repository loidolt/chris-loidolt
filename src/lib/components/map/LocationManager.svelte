<script lang="ts">
  import { browser } from '$app/environment';
  import type { Map as LeafletMap } from 'leaflet';
  import type { LocationPublic } from '$lib/pocketbase';
  import type { LeafletModule, LocationMarker } from '$lib/types/map';
  import {
    calculateMarkerDiff,
    getLocationCoordinates,
    hasValidCoordinates,
    createCustomIcon,
  } from '$lib/mapUtils';
  import { MAP_CONFIG } from '$lib/config/map';

  /**
   * Efficiently manages location markers on the map
   * Uses diffing algorithm to only update changed markers
   */

  type Props = {
    map: LeafletMap;
    L: LeafletModule;
    locations: LocationPublic[];
    unlockedLocations: Set<string>;
    isLocationLocked: (location: LocationPublic) => boolean;
    onLocationClick: (location: LocationPublic) => void;
    autoZoomToExtents?: boolean;
  };

  let {
    map,
    L,
    locations,
    unlockedLocations,
    isLocationLocked,
    onLocationClick,
    autoZoomToExtents = true,
  }: Props = $props();

  // Marker management
  let markerLayer: any;
  let currentLocations = $state<LocationPublic[]>([]);
  let markers = new Map<string, LocationMarker>();

  // Initialize marker layer
  $effect(() => {
    if (browser && map && L && !markerLayer) {
      markerLayer = L.layerGroup().addTo(map);
    }
  });

  // Update markers when locations change (with diffing)
  $effect(() => {
    if (!browser || !map || !L || !markerLayer) return;

    updateMarkersEfficiently(locations);
  });

  /**
   * Efficiently update markers using diffing algorithm
   */
  function updateMarkersEfficiently(newLocations: LocationPublic[]) {
    const diff = calculateMarkerDiff(currentLocations, newLocations, unlockedLocations);

    // Remove markers
    diff.toRemove.forEach((locationId) => {
      const marker = markers.get(locationId);
      if (marker) {
        markerLayer.removeLayer(marker);
        markers.delete(locationId);
      }
    });

    // Add new markers
    diff.toAdd.forEach((location) => {
      if (hasValidCoordinates(location)) {
        const marker = createMarker(location);
        if (marker) {
          markerLayer.addLayer(marker);
          markers.set(location.id, marker);
        }
      }
    });

    // Update changed markers (e.g., lock state changed)
    diff.toUpdate.forEach((location) => {
      if (hasValidCoordinates(location)) {
        const existingMarker = markers.get(location.id);
        if (existingMarker) {
          markerLayer.removeLayer(existingMarker);
        }

        const newMarker = createMarker(location);
        if (newMarker) {
          markerLayer.addLayer(newMarker);
          markers.set(location.id, newMarker);
        }
      }
    });

    // Update current locations reference
    currentLocations = newLocations;

    // Auto-zoom to extents if enabled and filter is active
    if (
      autoZoomToExtents &&
      newLocations.length > 0 &&
      newLocations.length < locations.length
    ) {
      fitBoundsToLocations(newLocations);
    }
  }

  /**
   * Create a marker for a location
   */
  function createMarker(location: LocationPublic): LocationMarker | null {
    try {
      const isLocked = isLocationLocked(location);
      const [lat, lng] = getLocationCoordinates(location, isLocked);
      const icon = createCustomIcon(L, location.category, isLocked);

      const marker = L.marker([lat, lng], { icon }) as LocationMarker;

      // Store location metadata
      marker.locationId = location.id;
      marker.location = location;

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

      return marker;
    } catch (error) {
      console.error(`Error creating marker for location ${location.id}:`, error);
      return null;
    }
  }

  /**
   * Fit map bounds to show all locations
   */
  function fitBoundsToLocations(locs: LocationPublic[]) {
    if (!map || !L) return;

    const validLocations = locs.filter(hasValidCoordinates);
    if (validLocations.length === 0) return;

    try {
      const bounds = L.latLngBounds(
        validLocations.map((loc) => {
          const isLocked = isLocationLocked(loc);
          return getLocationCoordinates(loc, isLocked);
        })
      );

      map.fitBounds(bounds, {
        padding: MAP_CONFIG.FIT_BOUNDS_PADDING,
        maxZoom: MAP_CONFIG.FIT_BOUNDS_MAX_ZOOM,
        animate: true,
      });
    } catch (error) {
      console.error('Error fitting bounds:', error);
    }
  }

  /**
   * Pan map to a specific location
   */
  export function panToLocation(location: LocationPublic, zoom?: number) {
    if (!map || !hasValidCoordinates(location)) return;

    try {
      const isLocked = isLocationLocked(location);
      const coords = getLocationCoordinates(location, isLocked);

      map.setView(coords, zoom || Math.max(map.getZoom(), 13), { animate: true });
    } catch (error) {
      console.error('Error panning to location:', error);
    }
  }

  /**
   * Clear all markers
   */
  export function clearMarkers() {
    if (markerLayer) {
      markerLayer.clearLayers();
      markers.clear();
      currentLocations = [];
    }
  }

  /**
   * Get marker layer for external use
   */
  export function getMarkerLayer() {
    return markerLayer;
  }
</script>
