<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import type { FeatureCollection, Feature } from 'geojson';

  export let map: any;
  export let L: any;
  export let drawings: FeatureCollection;
  export let onDrawingsChange: (drawings: FeatureCollection) => void;
  export let enabled: boolean = false;

  let drawnItems: any = null;
  let drawControl: any = null;

  onMount(async () => {
    if (!browser || !map || !L || !enabled) return;

    try {
      // Dynamically import leaflet-draw
      await import('leaflet-draw');
      await import('leaflet-draw/dist/leaflet.draw.css');

      // Get computed theme colors from CSS variables
      const rootStyles = getComputedStyle(document.documentElement);
      const linkColor = rootStyles.getPropertyValue('--link-color').trim();
      const accentPrimary = rootStyles.getPropertyValue('--accent-primary').trim();
      const accentSecondary = rootStyles.getPropertyValue('--accent-secondary').trim();

      // Create a feature group for drawn items
      drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      // Load existing drawings
      if (drawings && drawings.features && drawings.features.length > 0) {
        loadDrawings();
      }

      // Create draw control with theme colors
      drawControl = new (L.Control as any).Draw({
        position: 'topright',
        draw: {
          polyline: {
            shapeOptions: {
              color: linkColor,
              weight: 3,
            },
          },
          polygon: {
            shapeOptions: {
              color: accentSecondary,
              fillColor: accentSecondary,
              weight: 2,
              fillOpacity: 0.2,
            },
          },
          rectangle: {
            shapeOptions: {
              color: accentPrimary,
              fillColor: accentPrimary,
              weight: 2,
              fillOpacity: 0.2,
            },
          },
          circle: false,
          circlemarker: false,
          marker: false,
        },
        edit: {
          featureGroup: drawnItems,
          remove: true,
        },
      });

      map.addControl(drawControl);

      // Add event listeners
      map.on((L as any).Draw.Event.CREATED, handleDrawCreated);
      map.on((L as any).Draw.Event.EDITED, handleDrawEdited);
      map.on((L as any).Draw.Event.DELETED, handleDrawDeleted);

      console.log('[MapDrawingTools] Drawing tools initialized');
    } catch (error) {
      console.error('[MapDrawingTools] Failed to load drawing tools:', error);
    }
  });

  // Update drawn items when drawings change externally
  $: if (browser && drawnItems && enabled && drawings) {
    loadDrawings();
  }

  // Handle drawing enabled/disabled
  $: if (browser && map && drawControl) {
    if (enabled) {
      if (!map.hasLayer(drawnItems)) {
        map.addLayer(drawnItems);
      }
      if (!map._controlContainer.contains(drawControl._container)) {
        map.addControl(drawControl);
      }
    } else {
      if (map.hasLayer(drawnItems)) {
        map.removeLayer(drawnItems);
      }
      if (drawControl._map) {
        map.removeControl(drawControl);
      }
    }
  }

  function loadDrawings() {
    if (!drawnItems || !L) return;

    // Get computed theme colors from CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    const accentPrimary = rootStyles.getPropertyValue('--accent-primary').trim();

    // Clear existing layers
    drawnItems.clearLayers();

    // Add new layers from drawings
    if (drawings && drawings.features && drawings.features.length > 0) {
      drawings.features.forEach((feature: Feature) => {
        try {
          const layer = L.geoJSON(feature, {
            style: {
              color: accentPrimary,
              weight: 2,
              fillOpacity: 0.2,
            },
          });
          layer.eachLayer((l: any) => {
            drawnItems.addLayer(l);
          });
        } catch (error) {
          console.error('[MapDrawingTools] Error loading feature:', error);
        }
      });
    }
  }

  function handleDrawCreated(e: any) {
    const layer = e.layer;
    drawnItems.addLayer(layer);

    // Update drawings state
    const geoJSON = drawnItems.toGeoJSON() as FeatureCollection;
    onDrawingsChange(geoJSON);
  }

  function handleDrawEdited(e: any) {
    // Update drawings state
    const geoJSON = drawnItems.toGeoJSON() as FeatureCollection;
    onDrawingsChange(geoJSON);
  }

  function handleDrawDeleted(e: any) {
    // Update drawings state
    const geoJSON = drawnItems.toGeoJSON() as FeatureCollection;
    onDrawingsChange(geoJSON);
  }

  onDestroy(() => {
    if (map && L) {
      if (drawControl) {
        try {
          map.removeControl(drawControl);
        } catch (e) {
          // Control may already be removed
        }
      }
      if (drawnItems) {
        try {
          map.removeLayer(drawnItems);
        } catch (e) {
          // Layer may already be removed
        }
      }

      // Remove event listeners
      if ((L as any).Draw) {
        map.off((L as any).Draw.Event.CREATED, handleDrawCreated);
        map.off((L as any).Draw.Event.EDITED, handleDrawEdited);
        map.off((L as any).Draw.Event.DELETED, handleDrawDeleted);
      }
    }
  });
</script>
