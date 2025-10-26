import { useState, useCallback, useEffect } from 'react';
import type { FeatureCollection } from 'geojson';

/**
 * useDrawings hook - Manages drawing state and provides save/load functionality
 *
 * Features:
 * - Local state management for drawings
 * - Save to localStorage
 * - Load from localStorage on mount
 * - Export as GeoJSON file
 * - Clear all drawings
 */
export function useDrawings() {
  const [drawings, setDrawings] = useState<FeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });

  // Load drawings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('map-drawings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.type === 'FeatureCollection') {
          setDrawings(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading drawings from localStorage:', error);
    }
  }, []);

  // Save drawings to localStorage
  const saveDrawings = useCallback(() => {
    try {
      localStorage.setItem('map-drawings', JSON.stringify(drawings));
      return true;
    } catch (error) {
      console.error('Error saving drawings to localStorage:', error);
      return false;
    }
  }, [drawings]);

  // Load drawings from localStorage
  const loadDrawings = useCallback(() => {
    try {
      const saved = localStorage.getItem('map-drawings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.type === 'FeatureCollection') {
          setDrawings(parsed);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading drawings from localStorage:', error);
      return false;
    }
  }, []);

  // Export drawings as GeoJSON file
  const exportGeoJSON = useCallback(() => {
    try {
      const dataStr = JSON.stringify(drawings, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', `map-drawings-${new Date().toISOString().split('T')[0]}.geojson`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error('Error exporting GeoJSON:', error);
      return false;
    }
  }, [drawings]);

  // Clear all drawings
  const clearDrawings = useCallback(() => {
    setDrawings({
      type: 'FeatureCollection',
      features: [],
    });
    try {
      localStorage.removeItem('map-drawings');
      return true;
    } catch (error) {
      console.error('Error clearing drawings from localStorage:', error);
      return false;
    }
  }, []);

  // Get drawing count
  const drawingCount = drawings.features.length;

  return {
    drawings,
    setDrawings,
    saveDrawings,
    loadDrawings,
    exportGeoJSON,
    clearDrawings,
    drawingCount,
  };
}
