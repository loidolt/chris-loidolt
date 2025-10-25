# Map Implementation Documentation

## Overview

The GIS map implementation uses Leaflet with React, featuring dual tile sources (OpenTopoMap + OpenStreetMap), aggressive caching via Service Worker, and optimized performance for smooth user experience.

## Architecture

### Component Hierarchy

```
GISMapClient (Error Boundary Wrapper)
└── MapViewer (Main Map Component)
    ├── MapController (Zoom/Center Management)
    ├── MapLoadingHandler (Initial Load Detection)
    ├── MapInvalidationHandler (Responsive Resizing)
    ├── TileErrorHandler (Retry Logic)
    ├── TilePrefetcher (Background Prefetching)
    ├── TileLoadingTracker (Progress Monitoring)
    └── MarkerClusterGroup (Marker Clustering - Optional)
```

### Key Files

- `src/components/MapViewer.tsx` - Main map component (1200+ lines)
- `src/components/GISMapClient.tsx` - Client wrapper with dynamic loading
- `src/components/MapErrorBoundary.tsx` - Error boundary for graceful failures
- `src/components/MarkerClusterGroup.tsx` - Marker clustering component
- `src/components/LocateButton.tsx` - Geolocation button component
- `src/components/PasswordModal.tsx` - Private location password modal
- `src/app/gis/page.tsx` - Server-side page (fetches locations)
- `public/map-sw.js` - Service Worker for tile caching
- `src/app/globals.css` - Map-specific CSS (lines 178-432)

## Tile Strategy

### Dual Layer Approach

**Primary Layer: OpenTopoMap (Zoom 3-13)**
- Topographic style with terrain shading
- Excellent coverage up to zoom 13
- Spotty coverage at zoom 14+
- Configuration:
  ```tsx
  <TileLayer
    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
    maxNativeZoom={13}
    maxZoom={17}
    keepBuffer={3}
  />
  ```

**Fallback Layer: OpenStreetMap (Zoom 13-19)**
- Activates at zoom >= 13 (overlap for reliability)
- Street-level detail
- 80% opacity to blend with topographic layer
- Configuration:
  ```tsx
  {mapZoom >= 13 && (
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      minZoom={13}
      maxZoom={19}
      opacity={0.8}
    />
  )}
  ```

### Why This Approach?

1. **Topographic Detail**: OpenTopoMap provides terrain visualization
2. **High Zoom Coverage**: OSM fills in where OpenTopoMap is unavailable
3. **Smooth Transitions**: Overlap at zoom 13 prevents loading gaps
4. **Visual Blend**: 80% opacity maintains terrain context at high zoom

## Service Worker Caching

### Configuration (map-sw.js)

```javascript
const CACHE_NAME = 'map-tiles-v7';
const TILE_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CONCURRENT_REQUESTS = 6; // Prevent server overload
const REQUEST_TIMEOUT = 15000; // 15s base timeout
const MAX_CACHE_ENTRIES = 1000; // LRU cache limit
```

### Timeout Strategy

- **OSM tiles**: 10.5s (reliable and fast)
- **OpenTopoMap zoom < 13**: 15s (normal coverage)
- **OpenTopoMap zoom >= 13**: 22.5s (spotty coverage, needs more time)

### Retry Strategy

- **OSM tiles**: 3 retries (reliable source)
- **OpenTopoMap high zoom**: 1 retry (fallback exists)
- **OpenTopoMap low zoom**: 2 retries (better coverage)
- **Subdomain rotation**: Cycles through a/b/c subdomains

### Cache Management

- **LRU eviction**: Oldest tiles deleted first when limit reached
- **Cleanup trigger**: 900 tiles (cleans to 900 when 1000 reached)
- **Probabilistic cleanup**: 1% chance on each cache write
- **Stale cache fallback**: Uses expired cache if network fails

## State Management

### Critical States

```tsx
const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
const [mapZoom, setMapZoom] = useState(initialZoom);
const [unlockedLocations, setUnlockedLocations] = useState<Set<string>>(new Set());
const [tilesLoading, setTilesLoading] = useState(false);
const [tileProgress, setTileProgress] = useState(0);
```

### State Update Flow

**User Zoom (Interactive)**
```
User scrolls → Leaflet zooms → zoomend event →
handleZoomChange() → setMapZoom() → Component re-renders →
MapController checks center unchanged → No setView call → Smooth!
```

**Click Location (Programmatic)**
```
User clicks location → setMapCenter() + setMapZoom() →
MapController detects center change → setView() called →
isProgrammaticChange flag prevents feedback loop → Map moves smoothly
```

## Performance Optimizations

### CSS Optimizations

```css
.leaflet-tile {
  transform: translateZ(0);           /* GPU acceleration */
  will-change: auto;                  /* No constant GPU layers */
  backface-visibility: hidden;        /* Better GPU handling */
  image-rendering: auto;              /* Best for photos */
}

.leaflet-tile-loaded {
  animation: fadeInTile 0.15s ease-out; /* Fast fade-in */
}
```

### React Optimizations

- **Memoized callbacks**: All event handlers use `useCallback`
- **Memoized values**: `filteredLocations`, `categories`, `fuse` use `useMemo`
- **Ref-based flags**: `isProgrammaticChange` prevents re-render loops
- **Dynamic loading**: Map component loaded client-side only (no SSR)

### Network Optimizations

- **Tile prefetching**: Preloads surrounding tiles + next zoom level
- **Network quality detection**: Adapts prefetch strategy to connection speed
- **Request deduplication**: Multiple requests for same tile share promise
- **Concurrent limiting**: Max 6 simultaneous requests

## Features

### 1. Location Privacy

```tsx
// Private locations show fuzzy coordinates
const markerPosition = isLocked
  ? fuzzCoordinates(location.latitude, location.longitude, location.id)
  : [location.latitude, location.longitude];
```

- **Fuzzing algorithm**: Deterministic offset based on location ID (0.5-2km radius)
- **Password unlock**: Stores unlocked IDs in localStorage
- **Visual indicator**: Lock icon on markers and in popups

### 2. Search & Filter

- **Fuzzy search**: Fuse.js with 0.3 threshold
- **Category filter**: Multi-category support
- **Real-time updates**: Markers update on filter change

### 3. Theme Support

```tsx
const isDark = useTheme(); // MutationObserver on document.documentElement

// Theme-aware tile styling
.e-ink-map.theme-dark .theme-tiles {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}
```

### 4. Responsive Design

- **ResizeObserver**: Detects container size changes
- **invalidateSize**: Fixes map dimensions on resize
- **Mobile-friendly**: Touch controls, responsive panels

## Marker Clustering

### Implementation

The map includes intelligent marker clustering to improve performance and user experience with many locations.

**Library**: `leaflet.markercluster` (directly integrated, compatible with react-leaflet v5)

**Component**: `src/components/MarkerClusterGroup.tsx`

```tsx
<MarkerClusterGroup
  maxClusterRadius={80}
  spiderfyOnMaxZoom={true}
  showCoverageOnHover={false}
  zoomToBoundsOnClick={true}
  chunkedLoading={true}
  removeOutsideVisibleBounds={true}
/>
```

### Features

**Automatic Activation**
- Clustering enabled by default when **50+ locations** present
- User can toggle clustering on/off via control panel button
- State persists during session

**Visual Design**
- **Small clusters** (< 10 markers): Green accent (`var(--accent-primary)`)
- **Medium clusters** (10-99 markers): Cyan (`var(--link-color)`)
- **Large clusters** (100+ markers): Amber (`var(--accent-secondary)`)
- Terminal theme integration with monospace font
- Smooth appearance animation (0.3s scale + fade)

**Performance Optimizations**
- **Chunked loading**: Markers added in batches to prevent UI blocking
- **Outside bounds removal**: Markers outside view removed from DOM
- **Spiderfy on max zoom**: Markers fan out when fully zoomed
- **Click to zoom**: Clicking cluster zooms to bounds of markers

### Configuration Options

| Option | Default | Purpose |
|--------|---------|---------|
| `maxClusterRadius` | 80 | Maximum radius (px) for clustering markers |
| `spiderfyOnMaxZoom` | true | Fan out markers at maximum zoom |
| `showCoverageOnHover` | false | Show cluster bounds on hover |
| `zoomToBoundsOnClick` | true | Zoom to show all clustered markers |
| `chunkedLoading` | true | Load markers in chunks (better performance) |
| `removeOutsideVisibleBounds` | true | Remove off-screen markers from DOM |
| `disableClusteringAtZoom` | undefined | Disable clustering at specific zoom level |

### Styling (globals.css:347-432)

```css
/* Terminal-themed cluster markers */
.marker-cluster-small div {
  background-color: var(--accent-primary);
  width: 36px;
  height: 36px;
}

.marker-cluster-medium div {
  background-color: var(--link-color);
  width: 40px;
  height: 40px;
}

.marker-cluster-large div {
  background-color: var(--accent-secondary);
  width: 44px;
  height: 44px;
}

.marker-cluster span {
  color: var(--bg-primary);
  font-family: 'JetBrains Mono', monospace;
}
```

### User Controls

**Toggle Button** (in overlay control panel)
```
[✓ Clustering On]  // When enabled
[Clustering Off]    // When disabled
```

Location: Control panel, between "Locate Me" and "Show Locations List"

### Implementation Notes

**react-leaflet v5 Compatibility**
- Built custom wrapper component using `useMap()` hook
- Uses event-based marker detection (`layeradd` event)
- Automatically clusters markers as they're added to map
- Cleanup on unmount removes clusters and restores markers

**Search/Filter Integration**
- Clustering respects filtered locations
- Clusters update when search query changes
- Clusters update when category filter changes

**Private Location Support**
- Clustered markers maintain lock icons
- Fuzzy coordinates preserved in clusters
- Password modal works with clustered markers

## Error Handling

### Error Boundary

```tsx
<MapErrorBoundary>
  <MapViewer locations={locations} />
</MapErrorBoundary>
```

- **Graceful degradation**: Shows friendly error message
- **Development mode**: Displays error details
- **Reload option**: Button to refresh page

### Tile Errors

- **Automatic retries**: 1-3 attempts with exponential backoff
- **Subdomain rotation**: Tries different CDN servers
- **Fallback tiles**: Light gray placeholder for failed tiles
- **Stale cache**: Uses expired cache if network unavailable

## Future Expansion

### Recommended Enhancements

1. **Drawing Tools**
   - Add react-leaflet-draw for user-drawn shapes
   - Save drawn features to Airtable
   - Export as GeoJSON

2. **Custom Tile Layers**
   - Satellite imagery (MapBox, ESRI)
   - Historical maps
   - Weather overlays

3. **Offline Support**
   - Download tile regions for offline use
   - IndexedDB for location data
   - Background sync for new data

4. **Performance Monitoring**
   ```tsx
   const [metrics, setMetrics] = useState({
     tilesLoaded: 0,
     tilesFailed: 0,
     avgLoadTime: 0
   });
   ```

5. **Accessibility**
   - Keyboard navigation for markers
   - Screen reader announcements
   - High contrast mode

### Alternative Tile Providers

**Free Options:**
- **Stamen Terrain**: Artistic terrain style
- **CartoDB Positron**: Minimal light style
- **ESRI World Imagery**: Satellite imagery

**Paid Options (Better Performance):**
- **MapBox**: Custom styles, excellent performance, $5-50/month
- **Thunderforest Outdoors**: Better topographic coverage, €20-170/month
- **Google Maps**: Familiar interface, pay-per-load

## Debugging

### Development Tools

**Zoom Indicator (Dev Only)**
```tsx
{process.env.NODE_ENV === 'development' && (
  <div>Zoom: {mapZoom.toFixed(1)}</div>
)}
```

**Console Logging (Dev Only)**
```tsx
if (process.env.NODE_ENV === 'development') {
  console.log('[MapViewer] Zoom changed to:', newZoom);
}
```

### Common Issues

**Tiles Not Loading at High Zoom**
- Check: Is OSM fallback layer activating? (zoom >= 13)
- Check: Browser console for timeout errors
- Fix: Increase REQUEST_TIMEOUT in map-sw.js

**Map Jumping on Zoom**
- Check: Is `setView` being called unnecessarily?
- Fix: Ensure `isProgrammaticChange` flag working correctly

**Service Worker Not Updating**
- Solution: Unregister and re-register
  ```js
  navigator.serviceWorker.getRegistrations().then(regs =>
    regs.forEach(reg => reg.unregister())
  );
  ```

**Slow Tile Loading**
- Check: Network quality detection working?
- Check: Too many concurrent requests?
- Fix: Reduce MAX_CONCURRENT_REQUESTS or disable prefetching

## Configuration Reference

### MapViewer Props

```tsx
interface MapViewerProps {
  locations: Location[];
  initialCenter?: [number, number];  // Default: [37.7749, -122.4194]
  initialZoom?: number;               // Default: 10
}
```

### Location Type

```tsx
interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  category?: string;
  categories?: string[];
  privacy?: 'Public' | 'Private';
  password?: string;
  image?: string;
  url?: string;
}
```

### Service Worker Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `CACHE_NAME` | 'map-tiles-v7' | Cache version |
| `TILE_CACHE_MAX_AGE` | 7 days | Tile freshness |
| `MAX_CONCURRENT_REQUESTS` | 6 | Request throttling |
| `REQUEST_TIMEOUT` | 15s | Base timeout |
| `MAX_CACHE_ENTRIES` | 1000 | Cache size limit |

## Testing Checklist

### Core Functionality
- [ ] Zoom from 3 to 19 smoothly
- [ ] OSM fallback appears at zoom 13+
- [ ] No jumping during zoom/pan
- [ ] Tiles load on slow connections (throttle to Slow 3G)
- [ ] Service worker caches tiles (check Application → Cache Storage)
- [ ] Error boundary catches map errors (test by breaking component)
- [ ] Private locations require password
- [ ] Search and filter work correctly
- [ ] Theme toggle works (light/dark tiles)
- [ ] Mobile responsive (test touch zoom/pan)
- [ ] Map resizes correctly (toggle devtools, resize window)
- [ ] Geolocation "Locate Me" button works

### Marker Clustering
- [x] Clustering enabled by default with 50+ locations
- [x] Toggle button switches clustering on/off
- [x] Small clusters (< 10) show green accent color
- [x] Medium clusters (10-99) show cyan color
- [x] Large clusters (100+) show amber color
- [ ] Clicking cluster zooms to show all markers
- [ ] Spiderfy works at maximum zoom level
- [ ] Cluster counts update with search/filter
- [ ] Clustered markers maintain lock icons (private locations)
- [ ] Smooth animation when clusters appear/disappear

## Credits

- **Leaflet**: BSD-2-Clause license
- **Leaflet.markercluster**: MIT license
- **OpenTopoMap**: CC-BY-SA 3.0
- **OpenStreetMap**: ODbL
- **React-Leaflet**: Hippocratic License 2.1

## Changelog

### 2025-10-25: Marker Clustering Implemented
- ✅ Added `leaflet.markercluster` library
- ✅ Created custom `MarkerClusterGroup` component for react-leaflet v5
- ✅ Implemented automatic clustering (enabled for 50+ locations)
- ✅ Added toggle button in control panel
- ✅ Terminal-themed cluster styling with color-coded sizes
- ✅ Integrated with search/filter functionality
- ✅ Support for private locations in clusters
- ✅ Updated documentation and testing checklist
- ✅ Removed development-only zoom level debug indicator
- ✅ Fixed clustering initialization to properly capture existing markers
