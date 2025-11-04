/**
 * TypeScript types for map components
 */

import type {
  Map as LeafletMap,
  Marker,
  Icon,
  LayerGroup,
  TileLayer,
  LatLngBounds,
} from 'leaflet';
import type { LocationPublic } from '$lib/pocketbase';

/**
 * Leaflet module type (for dynamic imports)
 * Define as any to avoid SSR import issues - the actual type will be inferred at runtime
 */
export type LeafletModule = any;

/**
 * Extended Marker type with location metadata
 */
export interface LocationMarker extends Marker {
  locationId?: string;
  location?: LocationPublic;
}

/**
 * Map instance with proper typing
 */
export type MapInstance = LeafletMap | null;

/**
 * Marker cluster group type (from leaflet.markercluster)
 */
export interface MarkerClusterGroupType extends LayerGroup {
  addLayer(layer: Marker): this;
  removeLayer(layer: Marker): this;
  clearLayers(): this;
  refreshClusters(): this;
}

/**
 * Map bounds for fitting markers
 */
export type MapBounds = LatLngBounds;

/**
 * Tile layer error event
 */
export interface TileErrorEvent {
  tile: HTMLImageElement;
  coords: {
    x: number;
    y: number;
    z: number;
  };
}

/**
 * Map initialization options
 */
export interface MapInitOptions {
  center?: [number, number];
  zoom?: number;
  maxZoom?: number;
  minZoom?: number;
  zoomControl?: boolean;
}

/**
 * Marker creation options
 */
export interface MarkerOptions {
  location: LocationPublic;
  isLocked: boolean;
  icon: Icon;
  onClick?: (location: LocationPublic) => void;
}

/**
 * Marker diff result
 */
export interface MarkerDiff {
  toAdd: LocationPublic[];
  toRemove: string[];
  toUpdate: LocationPublic[];
}

/**
 * Map state
 */
export interface MapState {
  zoom: number;
  center: [number, number];
  bounds: MapBounds | null;
  isReady: boolean;
}

/**
 * Location with coordinates validated
 */
export type ValidLocation = LocationPublic & {
  latitude: number;
  longitude: number;
};

/**
 * Coordinate tuple
 */
export type Coordinates = [latitude: number, longitude: number];

/**
 * Marker layer management
 */
export interface MarkerLayerManager {
  markers: Map<string, LocationMarker>;
  add(location: LocationPublic, marker: LocationMarker): void;
  remove(locationId: string): LocationMarker | undefined;
  get(locationId: string): LocationMarker | undefined;
  has(locationId: string): boolean;
  clear(): void;
  size: number;
}

// Avoid conflict between JavaScript Map and Leaflet Map
export type JSMap<K, V> = globalThis.Map<K, V>;
