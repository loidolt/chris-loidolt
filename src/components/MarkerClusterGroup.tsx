'use client';

import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '@/lib/airtable';

interface MarkerClusterGroupProps {
  locations: Location[];
  isLocationLocked: (location: Location) => boolean;
  createCustomIcon: (category?: string, isLocked?: boolean) => L.Icon;
  handleLocationClick: (location: Location) => void;
  fuzzCoordinates: (lat: number, lng: number, locationId: string) => [number, number];
  chunkedLoading?: boolean;
  maxClusterRadius?: number | ((zoom: number) => number);
  spiderfyOnMaxZoom?: boolean;
  showCoverageOnHover?: boolean;
  zoomToBoundsOnClick?: boolean;
  disableClusteringAtZoom?: number;
  removeOutsideVisibleBounds?: boolean;
}

/**
 * MarkerClusterGroup component for react-leaflet v5
 * Creates markers programmatically and adds them to a cluster group
 */
export default function MarkerClusterGroup({
  locations,
  isLocationLocked,
  createCustomIcon,
  handleLocationClick,
  fuzzCoordinates,
  chunkedLoading = true,
  maxClusterRadius = 80,
  spiderfyOnMaxZoom = true,
  showCoverageOnHover = false,
  zoomToBoundsOnClick = true,
  disableClusteringAtZoom = undefined,
  removeOutsideVisibleBounds = true,
}: MarkerClusterGroupProps) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const [libraryLoaded, setLibraryLoaded] = useState(false);

  // Load the markercluster library dynamically on mount
  useEffect(() => {
    const loadLibrary = async () => {
      try {
        console.log('[MarkerClusterGroup] Attempting to load leaflet.markercluster library...');
        // @ts-ignore
        await import('leaflet.markercluster');
        console.log('[MarkerClusterGroup] Library loaded successfully');
        console.log('[MarkerClusterGroup] L.markerClusterGroup type:', typeof (L as any).markerClusterGroup);
        setLibraryLoaded(true);
      } catch (error) {
        console.error('[MarkerClusterGroup] Failed to load library:', error);
      }
    };

    if (typeof window !== 'undefined') {
      loadLibrary();
    }
  }, []);

  useEffect(() => {
    if (!libraryLoaded) {
      console.log('[MarkerClusterGroup] Waiting for library to load...');
      return;
    }

    if (!map || !locations || locations.length === 0) {
      console.log('[MarkerClusterGroup] Skipping - map, locations, or length issue', { map: !!map, locationsCount: locations?.length });
      return;
    }

    console.log('[MarkerClusterGroup] Creating cluster group with', locations.length, 'locations');
    console.log('[MarkerClusterGroup] L.markerClusterGroup available?', typeof (L as any).markerClusterGroup);

    // Check if the library is loaded
    if (typeof (L as any).markerClusterGroup !== 'function') {
      console.error('[MarkerClusterGroup] L.markerClusterGroup is not a function! Library not loaded correctly.');
      console.error('[MarkerClusterGroup] L object keys:', Object.keys(L));
      return;
    }

    // Create marker cluster group with configuration
    const markerClusterGroup = (L as any).markerClusterGroup({
      chunkedLoading,
      maxClusterRadius,
      spiderfyOnMaxZoom,
      showCoverageOnHover,
      zoomToBoundsOnClick,
      disableClusteringAtZoom,
      removeOutsideVisibleBounds,
      // Custom cluster icon creator
      iconCreateFunction: (cluster: L.MarkerCluster) => {
        const count = cluster.getChildCount();

        // Determine cluster size class based on marker count
        let sizeClass = 'marker-cluster-small';
        if (count >= 100) {
          sizeClass = 'marker-cluster-large';
        } else if (count >= 10) {
          sizeClass = 'marker-cluster-medium';
        }

        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${sizeClass}`,
          iconSize: L.point(40, 40),
        });
      },
    });

    clusterGroupRef.current = markerClusterGroup;

    // Create markers programmatically for each location
    locations.forEach((location) => {
      if (!location.latitude || !location.longitude) return;

      const isLocked = isLocationLocked(location);

      // Use fuzzy coordinates for locked locations
      const markerPosition: [number, number] = isLocked
        ? fuzzCoordinates(location.latitude, location.longitude, location.id)
        : [location.latitude, location.longitude];

      // Create marker
      const marker = L.marker(markerPosition, {
        icon: createCustomIcon(location.category, isLocked),
      });

      // Add click handler
      marker.on('click', () => {
        handleLocationClick(location);
      });

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '200px';

      popupContent.innerHTML = `
        <div>
          <h3 class="text-sm font-semibold mb-2" style="color: var(--text-primary)">
            ${location.name}
          </h3>

          ${isLocked ? `
            <div class="text-xs mb-2 p-2" style="color: var(--text-muted); backgroundColor: var(--bg-primary); border: 1px solid var(--border-color)">
              🔒 This is a private location. Click the marker to unlock with password.
            </div>
          ` : ''}

          ${location.category ? `
            <div class="text-xs mb-2" style="color: var(--accent-secondary)">
              [${location.category}]
            </div>
          ` : ''}

          ${!isLocked && location.description ? `
            <p class="text-sm mb-2" style="color: var(--text-muted)">
              ${location.description}
            </p>
          ` : ''}

          ${!isLocked && location.image ? `
            <img
              src="${location.image}"
              alt="${location.name}"
              class="w-full h-32 object-cover mb-2"
              style="border: 1px solid var(--border-color); filter: grayscale(100%)"
            />
          ` : ''}

          ${!isLocked && location.url ? `
            <a
              href="${location.url}"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm hover:opacity-70 transition-opacity"
              style="color: var(--link-color)"
            >
              [Learn more →]
            </a>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'e-ink-popup',
      });

      // Add marker to cluster group
      markerClusterGroup.addLayer(marker);
    });

    // Add cluster group to map
    map.addLayer(markerClusterGroup);
    console.log('[MarkerClusterGroup] Added cluster group to map');
    console.log('[MarkerClusterGroup] Cluster stats:', {
      totalMarkers: markerClusterGroup.getLayers().length,
      visibleClusters: Object.keys((markerClusterGroup as any)._featureGroup._layers).length
    });

    // Debug: Check what's actually on the map
    setTimeout(() => {
      const markerPaneElements = document.querySelectorAll('.leaflet-marker-pane .leaflet-marker-icon');
      const clusterPaneElements = document.querySelectorAll('.leaflet-marker-pane .marker-cluster');
      const currentZoom = map.getZoom();
      console.log('[MarkerClusterGroup] DOM Check at zoom', currentZoom, ':', {
        individualMarkers: markerPaneElements.length,
        clusterMarkers: clusterPaneElements.length,
        totalShouldBe: locations.length
      });

      if (clusterPaneElements.length > 0) {
        const firstCluster = clusterPaneElements[0] as HTMLElement;
        console.log('[MarkerClusterGroup] First cluster element:', {
          classes: firstCluster.className,
          visible: firstCluster.offsetParent !== null,
          display: window.getComputedStyle(firstCluster).display,
          opacity: window.getComputedStyle(firstCluster).opacity,
          zIndex: window.getComputedStyle(firstCluster).zIndex,
          position: window.getComputedStyle(firstCluster).position,
          innerHTML: firstCluster.innerHTML
        });
      } else if (clusterPaneElements.length === 0 && markerPaneElements.length === locations.length) {
        console.warn('[MarkerClusterGroup] All markers showing individually - no clustering occurring. Try zooming out or increasing maxClusterRadius.');
      }
    }, 500);

    // Cleanup
    return () => {
      if (clusterGroupRef.current && map.hasLayer(clusterGroupRef.current)) {
        console.log('[MarkerClusterGroup] Removing cluster group from map');
        map.removeLayer(clusterGroupRef.current);
      }
      clusterGroupRef.current = null;
    };
  }, [
    map,
    locations,
    isLocationLocked,
    createCustomIcon,
    handleLocationClick,
    fuzzCoordinates,
    chunkedLoading,
    maxClusterRadius,
    spiderfyOnMaxZoom,
    showCoverageOnHover,
    zoomToBoundsOnClick,
    disableClusteringAtZoom,
    removeOutsideVisibleBounds,
    libraryLoaded,
  ]);

  // Return null - this component doesn't render anything itself
  return null;
}
