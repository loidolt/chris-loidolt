'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { FeatureCollection, Feature } from 'geojson';
import 'leaflet-draw/dist/leaflet.draw.css';

interface MapDrawingToolsProps {
  drawings: FeatureCollection;
  onDrawingsChange: (drawings: FeatureCollection) => void;
  enabled?: boolean;
}

/**
 * MapDrawingTools component - Adds drawing capabilities to the map
 *
 * Features:
 * - Draw polylines, polygons, rectangles
 * - Edit existing shapes
 * - Delete shapes
 * - Persists to state via callback
 */
export default function MapDrawingTools({
  drawings,
  onDrawingsChange,
  enabled = true
}: MapDrawingToolsProps) {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Dynamically import leaflet-draw
    const loadDrawLibrary = async () => {
      try {
        // @ts-ignore
        await import('leaflet-draw');
        console.log('[MapDrawingTools] leaflet-draw loaded');
      } catch (error) {
        console.error('[MapDrawingTools] Failed to load leaflet-draw:', error);
        return;
      }

      // Get computed theme colors from CSS variables
      const rootStyles = getComputedStyle(document.documentElement);
      const linkColor = rootStyles.getPropertyValue('--link-color').trim();
      const accentPrimary = rootStyles.getPropertyValue('--accent-primary').trim();
      const accentSecondary = rootStyles.getPropertyValue('--accent-secondary').trim();

      // Create a feature group for drawn items
      const drawnItems = new L.FeatureGroup();
      drawnItemsRef.current = drawnItems;
      map.addLayer(drawnItems);

      // Load existing drawings from state
      if (drawings && drawings.features && drawings.features.length > 0) {
        drawings.features.forEach((feature: Feature) => {
          try {
            const layer = L.geoJSON(feature, {
              style: {
                color: accentPrimary,
                weight: 2,
                fillOpacity: 0.2,
              }
            });
            layer.eachLayer((l) => {
              drawnItems.addLayer(l);
            });
          } catch (error) {
            console.error('[MapDrawingTools] Error loading feature:', error);
          }
        });
      }

      // Create draw control with theme colors
      // @ts-ignore - L.Control.Draw exists after import
      const drawControl = new L.Control.Draw({
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
          circle: false, // Disable circle
          circlemarker: false, // Disable circle marker
          marker: false, // Disable marker (we already have location markers)
        },
        edit: {
          featureGroup: drawnItems,
          remove: true,
        },
      });

      drawControlRef.current = drawControl;
      map.addControl(drawControl);

      // Handle draw created event
      const handleDrawCreated = (e: any) => {
        const layer = e.layer;
        drawnItems.addLayer(layer);

        // Update drawings state
        const geoJSON = drawnItems.toGeoJSON() as FeatureCollection;
        onDrawingsChange(geoJSON);
      };

      // Handle draw edited event
      const handleDrawEdited = (e: any) => {
        // Update drawings state
        const geoJSON = drawnItems.toGeoJSON() as FeatureCollection;
        onDrawingsChange(geoJSON);
      };

      // Handle draw deleted event
      const handleDrawDeleted = (e: any) => {
        // Update drawings state
        const geoJSON = drawnItems.toGeoJSON() as FeatureCollection;
        onDrawingsChange(geoJSON);
      };

      // Add event listeners
      map.on(L.Draw.Event.CREATED as any, handleDrawCreated);
      map.on(L.Draw.Event.EDITED as any, handleDrawEdited);
      map.on(L.Draw.Event.DELETED as any, handleDrawDeleted);

      console.log('[MapDrawingTools] Drawing tools initialized');
    };

    loadDrawLibrary();

    // Cleanup
    return () => {
      if (drawControlRef.current && map) {
        map.removeControl(drawControlRef.current);
      }
      if (drawnItemsRef.current && map) {
        map.removeLayer(drawnItemsRef.current);
      }
      if (map) {
        map.off(L.Draw.Event.CREATED as any);
        map.off(L.Draw.Event.EDITED as any);
        map.off(L.Draw.Event.DELETED as any);
      }
    };
  }, [map, enabled, onDrawingsChange]);

  // Update drawn items when drawings prop changes externally
  useEffect(() => {
    if (!drawnItemsRef.current || !enabled) return;

    // Get computed theme colors from CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    const accentPrimary = rootStyles.getPropertyValue('--accent-primary').trim();

    // Clear existing layers
    drawnItemsRef.current.clearLayers();

    // Add new layers from drawings
    if (drawings && drawings.features && drawings.features.length > 0) {
      drawings.features.forEach((feature: Feature) => {
        try {
          const layer = L.geoJSON(feature, {
            style: {
              color: accentPrimary,
              weight: 2,
              fillOpacity: 0.2,
            }
          });
          layer.eachLayer((l) => {
            drawnItemsRef.current?.addLayer(l);
          });
        } catch (error) {
          console.error('[MapDrawingTools] Error loading feature:', error);
        }
      });
    }
  }, [drawings, enabled]);

  // This component doesn't render anything
  return null;
}
