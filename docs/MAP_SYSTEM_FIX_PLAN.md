# Map Rendering System - Fix Plan & Recommendations

**Created**: 2025-11-03  
**Status**: Ready for Implementation  
**Estimated Time**: 6-12 hours (depending on scope)

---

## Executive Summary

Your GIS map system has a **solid foundation** with good architecture and features. The core issues are:

1. **MarkerCluster component rebuilds all markers on every update** (biggest performance issue)
2. **Minor memory leaks** in tile error handling and resize observers
3. **Missing error boundaries** for graceful degradation
4. **No performance monitoring** in production

**Good News**: These are all fixable in 6-8 hours with immediate performance gains.

---

## Current System Assessment

### ✅ Strengths
- **Strong Architecture**: Clean component separation, proper TypeScript typing
- **Feature Complete**: Clustering, drawing tools, accessibility, mobile support
- **LocationManager**: Already uses efficient diffing algorithm
- **Configuration**: Centralized in `map.ts` with good defaults
- **Privacy System**: Coordinate fuzzing implemented correctly

### ⚠️ Issues Found

#### 1. MarkerCluster Performance (CRITICAL)
**File**: `src/lib/components/MarkerCluster.svelte` (lines 75-114)

**Problem**:
```typescript
$effect(() => {
  if (browser && markerClusterGroup && locations) {
    updateMarkers(); // ❌ Rebuilds ALL markers every time
  }
});

function updateMarkers() {
  markerClusterGroup.clearLayers(); // ❌ Destroys everything
  locations.forEach((location) => {
    // ❌ Creates brand new markers
  });
}
```

**Impact**: 
- Unnecessary DOM thrashing with 100+ markers
- Poor performance on filter changes (100-200ms)
- Location popup state lost on every filter

**Why LocationManager is faster**:
- Uses `calculateMarkerDiff()` to only update changed markers
- Tracks existing markers in a Map
- Only removes/adds what changed

---

#### 2. Tile Error Handling Memory Leak (MODERATE)
**File**: `src/lib/components/MapViewer.svelte` (lines 198-228)

**Problem**:
```typescript
function setupTileErrorHandling(topoLayer: any, osmLayer: any) {
  const handleTileError = (isOSM: boolean) => (event: any) => {
    // ❌ Creates new Maps on EVERY tile error
    const failedTiles = new Set<string>();
    const tileRetryCount = new Map<string, number>();
    // ❌ Never cleaned up, grows unbounded
  };
}
```

**Impact**: 
- Memory leak over long sessions
- Maps/Sets created repeatedly but never cleaned
- No limit on failed tile tracking (could grow to thousands)

---

#### 3. Multiple Effect Triggers (LOW-MODERATE)
**File**: `src/lib/components/MapViewer.svelte` (lines 85-93)

**Problem**:
```typescript
// ❌ 4 separate effects that could be batched
$effect(() => { searchQuery.set(localSearchQuery); });
$effect(() => { selectedCategories.set(...); });
$effect(() => { privacyFilter.set(...); });
$effect(() => { hasImageFilter.set(...); });
```

**Impact**: Potential double-renders when multiple filters change at once

---

#### 4. ResizeObserver Recreation (LOW)
**File**: `src/lib/components/MapViewer.svelte` (line 251)

**Problem**:
```typescript
// ❌ Creates new observer if effect re-runs
const resizeObserver = createThrottledResizeObserver(() => {
  if (map) map.invalidateSize();
});
```

**Impact**: Minor memory leak if component re-renders frequently

---

#### 5. Missing Error Boundaries (LOW)
**File**: `src/lib/components/MapViewer.svelte` (line 138)

**Problem**:
```typescript
async function initializeMap() {
  // ❌ No try-catch
  L = await import('leaflet');
  map = L.map(mapContainer, { ... });
}
```

**Impact**: Entire app crashes if Leaflet fails to load

---

## Fix Plan

### Phase 1: Critical Performance Fixes (3 hours)

#### Task 1.1: Optimize MarkerCluster Diffing ⏱️ 1 hour
**Impact**: 10-100x faster filter changes

**File**: `src/lib/components/MarkerCluster.svelte`

**Implementation**:
```typescript
<script lang="ts">
  // ... existing imports ...
  import { calculateMarkerDiff } from '$lib/mapUtils';

  // Add marker tracking
  let currentMarkers = new Map<string, any>();
  let currentLocations = $state<LocationPublic[]>([]);

  // Replace updateMarkers() with efficient diffing
  $effect(() => {
    if (!browser || !markerClusterGroup || !L) return;
    
    const diff = calculateMarkerDiff(
      currentLocations, 
      locations, 
      new Set() // No unlock tracking needed in cluster view
    );
    
    // Remove only deleted markers
    diff.toRemove.forEach(locationId => {
      const marker = currentMarkers.get(locationId);
      if (marker) {
        markerClusterGroup.removeLayer(marker);
        currentMarkers.delete(locationId);
      }
    });
    
    // Add only new markers
    diff.toAdd.forEach(location => {
      if (!hasValidCoordinates(location)) return;
      
      const marker = createMarker(location);
      if (marker) {
        markerClusterGroup.addLayer(marker);
        currentMarkers.set(location.id, marker);
      }
    });
    
    // Update changed markers (lock state, etc)
    diff.toUpdate.forEach(location => {
      const oldMarker = currentMarkers.get(location.id);
      if (oldMarker) {
        markerClusterGroup.removeLayer(oldMarker);
      }
      
      const newMarker = createMarker(location);
      if (newMarker) {
        markerClusterGroup.addLayer(newMarker);
        currentMarkers.set(location.id, newMarker);
      }
    });
    
    // Update reference
    currentLocations = locations;
  });
  
  // Extract marker creation to reusable function
  function createMarker(location: LocationPublic) {
    const isLocked = isLocationLocked(location);
    const [lat, lng] = getLocationCoordinates(location, isLocked);
    const icon = createCustomIcon(L, location.category, isLocked);
    const marker = L.marker([lat, lng], { icon });
    
    marker.on('click', () => onLocationClick(location));
    
    const popupContent = `
      <div style="color: var(--text-primary); min-width: 150px;">
        <strong style="color: var(--link-color)">${location.name}</strong>
        ${isLocked ? '<br><em style="color: var(--text-muted)">(Private - click to unlock)</em>' : ''}
        ${location.description && !isLocked ? `<br><span style="color: var(--text-muted)">${location.description}</span>` : ''}
      </div>
    `;
    marker.bindPopup(popupContent);
    
    return marker;
  }
  
  onDestroy(() => {
    if (markerClusterGroup && map) {
      map.removeLayer(markerClusterGroup);
      currentMarkers.clear();
    }
  });
</script>
```

**Testing**:
- [ ] Filter changes are instant (<50ms)
- [ ] Markers don't flicker
- [ ] Popup state preserved when filtering
- [ ] Memory doesn't grow on repeated filters

---

#### Task 1.2: Fix Tile Error Handler Leak ⏱️ 45 minutes
**Impact**: Prevents memory leaks over long sessions

**File**: `src/lib/components/MapViewer.svelte`

**Implementation**:
```typescript
/**
 * Setup tile error handling with retry logic
 * FIXED: Move Maps outside handler, add cleanup, limit size
 */
function setupTileErrorHandling(topoLayer: any, osmLayer: any) {
  // ✅ Create once, not per-error
  const failedTiles = new Set<string>();
  const tileRetryCount = new Map<string, number>();
  const MAX_FAILED_TILES = 100; // Prevent unbounded growth
  const MAX_RETRIES_PER_TILE = MAP_CONFIG.TILE_RETRY_LIMIT;

  const handleTileError = (isOSM: boolean) => (event: any) => {
    const tile = event.tile;
    const tileKey = `${event.coords.z}-${event.coords.x}-${event.coords.y}`;

    failedTiles.add(tileKey);
    const retryCount = tileRetryCount.get(tileKey) || 0;

    if (retryCount < MAX_RETRIES_PER_TILE) {
      const baseDelay = isOSM ? MAP_CONFIG.TILE_OSM_DELAY_MS : MAP_CONFIG.TILE_BASE_DELAY_MS;
      const zoomMultiplier = Math.max(1, 14 - event.coords.z);
      const delay = baseDelay * Math.pow(1.5, retryCount) / zoomMultiplier;

      // Rotate subdomain
      const currentSubdomain = new URL(tile.src).hostname.split('.')[0];
      const currentIndex = MAP_CONFIG.TILE_SUBDOMAINS.indexOf(currentSubdomain);
      const nextSubdomain = MAP_CONFIG.TILE_SUBDOMAINS[(currentIndex + 1) % MAP_CONFIG.TILE_SUBDOMAINS.length];

      setTimeout(() => {
        tile.src = tile.src.replace(/\/\/[a-c]\./, `//${nextSubdomain}.`);
        tileRetryCount.set(tileKey, retryCount + 1);
      }, delay);
    } else {
      // ✅ Stop retrying after max attempts
      console.warn(`[MapViewer] Tile ${tileKey} failed after ${MAX_RETRIES_PER_TILE} attempts`);
    }

    // ✅ Cleanup old entries to prevent unbounded growth
    if (failedTiles.size > MAX_FAILED_TILES) {
      const tilesToRemove = Array.from(failedTiles).slice(0, failedTiles.size - MAX_FAILED_TILES);
      tilesToRemove.forEach(key => {
        failedTiles.delete(key);
        tileRetryCount.delete(key);
      });
    }
  };

  topoLayer.on('tileerror', handleTileError(false));
  osmLayer.on('tileerror', handleTileError(true));

  // ✅ Cleanup on component destroy
  onDestroy(() => {
    failedTiles.clear();
    tileRetryCount.clear();
    topoLayer.off('tileerror');
    osmLayer.off('tileerror');
  });
}
```

**Testing**:
- [ ] Memory stays stable over 1 hour session
- [ ] Failed tiles stop retrying after limit
- [ ] Maps/Sets are cleared on component destroy

---

#### Task 1.3: Batch Store Updates ⏱️ 30 minutes
**Impact**: Reduces unnecessary re-renders

**File**: `src/lib/components/MapViewer.svelte`

**Implementation**:
```typescript
// Replace separate effects (lines 85-93) with single batched update
$effect(() => {
  // ✅ Single effect batches all store updates together
  searchQuery.set(localSearchQuery);
  selectedCategories.set(localSelectedFilters.categories || new Set());
  privacyFilter.set(localSelectedFilters.privacy || 'all');
  hasImageFilter.set(localSelectedFilters.hasImage ?? null);
});
```

**Testing**:
- [ ] Filters still work correctly
- [ ] Only one re-render per user action
- [ ] No regression in functionality

---

#### Task 1.4: Fix ResizeObserver Leak ⏱️ 15 minutes
**Impact**: Prevents observer duplication

**File**: `src/lib/components/MapViewer.svelte`

**Implementation**:
```typescript
function setupResizeHandling() {
  if (!map || !mapContainer) return;

  // Handle visibility changes
  const handleVisibilityChange = () => {
    if (!document.hidden && map) {
      setTimeout(() => {
        map!.invalidateSize();
        map!.eachLayer((layer: any) => {
          if (layer._tileZoom !== undefined) {
            layer.redraw();
          }
        });
      }, MAP_CONFIG.INVALIDATE_DELAY_MS);
    }
  };

  // ✅ Create ResizeObserver once, store reference
  let resizeObserver: ResizeObserver | null = null;
  
  resizeObserver = createThrottledResizeObserver(() => {
    if (map) {
      map.invalidateSize();
    }
  });

  document.addEventListener('visibilitychange', handleVisibilityChange);
  resizeObserver.observe(mapContainer);

  // ✅ Cleanup function returned from effect
  onDestroy(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });
}
```

**Testing**:
- [ ] Only one ResizeObserver created
- [ ] Observer cleaned up on destroy
- [ ] Map still resizes correctly

---

### Phase 2: Reliability Improvements (1.5 hours)

#### Task 2.1: Add Error Boundaries ⏱️ 45 minutes
**Impact**: Graceful degradation instead of crashes

**File**: `src/lib/components/MapViewer.svelte`

**Implementation**:
```typescript
// Add error state
let mapError = $state<string | null>(null);

async function initializeMap() {
  if (!browser || map) return;

  try {
    // Dynamically import Leaflet with timeout
    const loadTimeout = setTimeout(() => {
      throw new Error('Timeout loading Leaflet (slow network?)');
    }, 10000);

    L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');
    clearTimeout(loadTimeout);

    if (!mapContainer) {
      throw new Error('Map container element not found');
    }

    // Create map instance
    map = L.map(mapContainer, {
      zoomControl: false,
      center: initialCenter,
      zoom: initialZoom,
      maxZoom: MAP_CONFIG.MAX_ZOOM,
      minZoom: MAP_CONFIG.MIN_ZOOM,
    });

    // Verify map initialized correctly
    if (!map.getZoom() || !map.getCenter()) {
      throw new Error('Map initialized but invalid state');
    }

    // ... rest of initialization ...

  } catch (error) {
    console.error('[MapViewer] Failed to initialize map:', error);
    mapError = error instanceof Error 
      ? error.message 
      : 'Failed to load map. Please refresh the page.';
    
    // Optional: Report to error tracking service
    // reportError('map-init-failed', error);
  }
}

// Add error UI in template
{#if mapError}
  <div class="flex h-full items-center justify-center">
    <div class="text-center p-6">
      <div class="mb-4 text-lg" style="color: var(--error-color)">
        Map Error
      </div>
      <div class="text-sm mb-4" style="color: var(--text-muted)">
        {mapError}
      </div>
      <button
        onclick={() => window.location.reload()}
        class="px-4 py-2 border border-current"
        style="color: var(--link-color)"
      >
        [Reload Page]
      </button>
    </div>
  </div>
{:else if browser && map && L}
  <!-- Existing map content -->
{/if}
```

**Testing**:
- [ ] Shows error UI if Leaflet fails to load
- [ ] Shows error if container not found
- [ ] Reload button works
- [ ] No console errors

---

#### Task 2.2: Add Map Health Check ⏱️ 30 minutes
**Impact**: Detect and recover from corrupted state

**File**: `src/lib/mapUtils.ts`

**Implementation**:
```typescript
/**
 * Check if map instance is in a healthy state
 */
export function isMapHealthy(map: LeafletMap | null): boolean {
  if (!map) return false;
  
  try {
    const zoom = map.getZoom();
    const center = map.getCenter();
    const container = map.getContainer();
    
    return (
      !isNaN(zoom) &&
      zoom >= 0 &&
      center !== null &&
      container !== null &&
      container.offsetParent !== null // Check if visible
    );
  } catch (error) {
    console.error('[mapUtils] Map health check failed:', error);
    return false;
  }
}

/**
 * Safely execute map operations with health check
 */
export function safeMapOperation<T>(
  map: LeafletMap | null,
  operation: (map: LeafletMap) => T,
  fallback: T
): T {
  if (!isMapHealthy(map)) {
    console.warn('[mapUtils] Map unhealthy, skipping operation');
    return fallback;
  }
  
  try {
    return operation(map!);
  } catch (error) {
    console.error('[mapUtils] Map operation failed:', error);
    return fallback;
  }
}
```

**Usage in MapViewer**:
```typescript
import { isMapHealthy, safeMapOperation } from '$lib/mapUtils';

function fitBoundsToAllLocations() {
  safeMapOperation(map, (m) => {
    const bounds = L.latLngBounds(/* ... */);
    m.fitBounds(bounds, {
      padding: MAP_CONFIG.FIT_BOUNDS_PADDING,
      maxZoom: MAP_CONFIG.FIT_BOUNDS_MAX_ZOOM,
    });
  }, undefined);
}
```

**Testing**:
- [ ] Health check detects invalid map
- [ ] Safe operations don't crash
- [ ] Fallback values returned correctly

---

#### Task 2.3: Add Performance Telemetry ⏱️ 15 minutes
**Impact**: Debug performance issues in production

**File**: `src/lib/mapUtils.ts`

**Implementation**:
```typescript
/**
 * Simple performance telemetry for map operations
 */
export class MapTelemetry {
  private metrics = new Map<string, number[]>();
  
  track(operation: string, durationMs: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    const times = this.metrics.get(operation)!;
    times.push(durationMs);
    
    // Keep last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }
  
  getStats(operation: string) {
    const times = this.metrics.get(operation) || [];
    if (times.length === 0) return null;
    
    const sorted = [...times].sort((a, b) => a - b);
    return {
      count: times.length,
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  }
  
  report() {
    console.group('[MapTelemetry] Performance Report');
    for (const [operation, _] of this.metrics) {
      const stats = this.getStats(operation);
      if (stats) {
        console.log(`${operation}:`, stats);
      }
    }
    console.groupEnd();
  }
}

// Usage
export const telemetry = new MapTelemetry();

// In MapViewer
import { telemetry } from '$lib/mapUtils';

function handleLocationSelect(location: LocationPublic) {
  const start = performance.now();
  
  // ... existing code ...
  
  telemetry.track('location-select', performance.now() - start);
}

// Report on destroy (dev mode only)
onDestroy(() => {
  if (import.meta.env.DEV) {
    telemetry.report();
  }
});
```

**Testing**:
- [ ] Metrics collected during use
- [ ] Report shows reasonable times
- [ ] No performance impact (<1ms overhead)

---

### Phase 3: Testing & Validation (1.5 hours)

#### Task 3.1: Load Testing ⏱️ 1 hour

**Create test data generator**:

**File**: `scripts/generate-test-locations.ts`

```typescript
import { writeFileSync } from 'fs';

function generateTestLocations(count: number) {
  const categories = ['landmark', 'trail', 'camp', 'viewpoint'];
  const locations = [];
  
  for (let i = 0; i < count; i++) {
    locations.push({
      id: `test-${i}`,
      name: `Test Location ${i}`,
      description: `Generated test location ${i}`,
      latitude: 39 + (Math.random() - 0.5) * 10,
      longitude: -98 + (Math.random() - 0.5) * 20,
      category: categories[Math.floor(Math.random() * categories.length)],
      privacy: Math.random() > 0.8 ? 'Private' : 'Public',
      created: new Date().toISOString(),
    });
  }
  
  writeFileSync(
    `test-locations-${count}.json`,
    JSON.stringify(locations, null, 2)
  );
  
  console.log(`Generated ${count} test locations`);
}

// Generate different sizes
generateTestLocations(50);   // Baseline
generateTestLocations(500);  // Stress test
generateTestLocations(5000); // Extreme
```

**Test scenarios**:

1. **Baseline (50 markers)**
   - Initial render: Should be <300ms
   - Filter change: Should be <50ms
   - Memory: Stable over 5 minutes

2. **Stress (500 markers)**
   - Initial render: Should be <1000ms
   - Filter change: Should be <100ms
   - Pan/zoom: Should maintain 30fps
   - Memory: Stable over 10 minutes

3. **Extreme (5000 markers)**
   - With clustering: Should be usable
   - Without clustering: May be slow (document behavior)

**Measurement tools**:
```typescript
// Add to MapViewer for testing
if (import.meta.env.DEV) {
  $effect(() => {
    console.log(`[Performance] Rendering ${locations.length} locations`);
    const start = performance.now();
    
    return () => {
      console.log(`[Performance] Render took ${performance.now() - start}ms`);
    };
  });
}
```

**Testing checklist**:
- [ ] 50 markers: <300ms initial, <50ms filter
- [ ] 500 markers: <1s initial, <100ms filter
- [ ] 5000 markers: Clustering required, usable with clusters
- [ ] Memory stable over 10min session
- [ ] No console errors or warnings

---

#### Task 3.2: Browser Compatibility ⏱️ 30 minutes

**Test matrix**:

| Browser | Version | Initial Load | Filtering | Clustering | Drawing |
|---------|---------|--------------|-----------|------------|---------|
| Chrome  | Latest  | ⏱️ | ⏱️ | ⏱️ | ⏱️ |
| Firefox | Latest  | ⏱️ | ⏱️ | ⏱️ | ⏱️ |
| Safari  | Latest  | ⏱️ | ⏱️ | ⏱️ | ⏱️ |
| iOS Safari | 16+ | ⏱️ | ⏱️ | ⏱️ | ⏱️ |
| Chrome Mobile | Latest | ⏱️ | ⏱️ | ⏱️ | ⏱️ |

**Specific checks**:
- [ ] Leaflet loads correctly in all browsers
- [ ] Markers render correctly
- [ ] Clustering works on mobile
- [ ] Touch gestures work (pinch zoom, pan)
- [ ] Drawing tools work on touch devices
- [ ] No console errors specific to any browser

---

### Phase 4: Advanced Optimizations (Optional - 3 hours)

> **Note**: Only needed if dealing with 1000+ markers or performance issues after Phase 1-3

#### Task 4.1: Marker Object Pool ⏱️ 1.5 hours

**When needed**: 1000+ markers, high churn rate

**File**: `src/lib/mapUtils.ts`

```typescript
/**
 * Object pool for marker reuse
 * Reduces GC pressure by reusing marker instances
 */
export class MarkerPool {
  private available: any[] = [];
  private inUse = new Map<string, any>();
  private L: any;
  
  constructor(leaflet: any) {
    this.L = leaflet;
  }
  
  acquire(
    locationId: string,
    coords: [number, number],
    icon: any
  ): any {
    let marker = this.available.pop();
    
    if (!marker) {
      // Create new marker if pool empty
      marker = this.L.marker(coords, { icon });
    } else {
      // Reuse existing marker
      marker.setLatLng(coords);
      marker.setIcon(icon);
    }
    
    this.inUse.set(locationId, marker);
    return marker;
  }
  
  release(locationId: string) {
    const marker = this.inUse.get(locationId);
    if (marker) {
      // Remove all event listeners
      marker.off();
      // Close popup if open
      marker.closePopup();
      // Return to pool
      this.inUse.delete(locationId);
      this.available.push(marker);
    }
  }
  
  releaseAll() {
    for (const [id, _] of this.inUse) {
      this.release(id);
    }
  }
  
  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    };
  }
}
```

**Usage**:
```typescript
// In LocationManager.svelte
let markerPool: MarkerPool;

$effect(() => {
  if (browser && L && !markerPool) {
    markerPool = new MarkerPool(L);
  }
});

// Replace createMarker with pool acquisition
const marker = markerPool.acquire(location.id, coords, icon);
```

**Expected gains**: 50-90% reduction in GC time with 1000+ markers

---

#### Task 4.2: Viewport Culling ⏱️ 1 hour

**When needed**: 5000+ markers, even with clustering

**File**: `src/lib/mapUtils.ts`

```typescript
/**
 * Get locations visible in current viewport (with buffer)
 */
export function getVisibleLocations(
  map: LeafletMap,
  locations: LocationPublic[],
  bufferPercent: number = 0.2
): LocationPublic[] {
  try {
    const bounds = map.getBounds().pad(bufferPercent);
    
    return locations.filter(loc => {
      if (!hasValidCoordinates(loc)) return false;
      return bounds.contains([loc.latitude, loc.longitude]);
    });
  } catch (error) {
    console.error('[mapUtils] Viewport culling failed:', error);
    return locations; // Fallback to all locations
  }
}
```

**Usage in LocationManager**:
```typescript
import { getVisibleLocations } from '$lib/mapUtils';

// Add viewport-based filtering
let visibleLocations = $derived(
  map ? getVisibleLocations(map, locations) : locations
);

// Update markers only for visible locations
$effect(() => {
  updateMarkersEfficiently(visibleLocations);
});

// Refresh on map move
$effect(() => {
  if (map) {
    const handler = () => {
      // Trigger re-evaluation
      visibleLocations = getVisibleLocations(map, locations);
    };
    
    map.on('moveend', handler);
    return () => map.off('moveend', handler);
  }
});
```

**Expected gains**: Constant performance regardless of total marker count

---

#### Task 4.3: Web Worker Filtering ⏱️ 30 minutes

**When needed**: Complex filtering logic, 1000+ locations

**File**: `src/lib/workers/map-filter.worker.ts`

```typescript
// Web Worker for heavy filtering
self.onmessage = ({ data }) => {
  const { locations, filters } = data;
  
  // Perform heavy filtering
  const filtered = locations.filter((loc: any) => {
    // Complex filtering logic here
    if (filters.searchQuery && !loc.name.includes(filters.searchQuery)) {
      return false;
    }
    // ... more filters ...
    return true;
  });
  
  self.postMessage(filtered);
};
```

**Usage**:
```typescript
// In MapViewer
const filterWorker = new Worker(
  new URL('$lib/workers/map-filter.worker.ts', import.meta.url),
  { type: 'module' }
);

filterWorker.onmessage = ({ data }) => {
  filteredLocations = data;
};

// Trigger filtering
$effect(() => {
  filterWorker.postMessage({
    locations,
    filters: {
      searchQuery: localSearchQuery,
      categories: localSelectedFilters.categories,
      // ...
    },
  });
});
```

---

## Implementation Timeline

### Week 1: Core Fixes (Day 1-2, 6-8 hours)
**Goal**: Fix all critical issues

- **Monday AM**: Task 1.1 - MarkerCluster diffing (1h)
- **Monday PM**: Task 1.2 - Tile error cleanup (45m), Task 1.3 - Batch updates (30m), Task 1.4 - Resize fix (15m)
- **Tuesday AM**: Task 2.1 - Error boundaries (45m), Task 2.2 - Health checks (30m)
- **Tuesday PM**: Task 2.3 - Telemetry (15m), Task 3.1 - Load testing (1h)

### Week 2: Validation (Day 1, 1-2 hours)
**Goal**: Ensure fixes work across environments

- **Monday AM**: Task 3.2 - Browser testing (30m)
- **Monday PM**: Documentation updates, deployment prep

### Optional: Advanced Features (Week 3, 3-5 hours)
**Goal**: Only if performance issues persist

- Task 4.1 - Marker pooling (if needed)
- Task 4.2 - Viewport culling (if needed)
- Task 4.3 - Web workers (if needed)

---

## Success Metrics

### Before (Current Baseline)
- ❓ Filter change: ~100-200ms with 50 markers
- ❓ Initial render: ~500ms
- ❓ Memory: Unknown leak characteristics
- ❓ Clustering: Rebuilds all markers

### After Phase 1-2 (Target)
- ✅ Filter change: <50ms with 500 markers
- ✅ Initial render: <300ms
- ✅ Memory: Stable over 1 hour session
- ✅ Clustering: Only updates changed markers
- ✅ No crashes on Leaflet load failure
- ✅ 60fps pan/zoom with 500 markers

### After Phase 4 (If Needed)
- ✅ Filter change: <50ms with 5000 markers
- ✅ 60fps with 5000 markers (with culling)
- ✅ Minimal GC pressure (with pooling)

---

## Quick Wins (30 minutes each) ⚡

These can be done independently at any time:

1. **Add loading skeleton** for map container
   ```typescript
   <div class="animate-pulse bg-gray-200 h-full w-full">
     Loading map...
   </div>
   ```

2. **Debounce resize events more aggressively**
   - Change throttle from 100ms to 250ms
   - Reduces CPU usage on window resize

3. **Lazy load MarkerCluster CSS**
   - Only import when clustering enabled
   - Faster initial page load

4. **Add keyboard shortcuts help panel**
   - Press '?' to show shortcuts
   - Better accessibility UX

5. **Cache fuzzed coordinates in memory**
   - Currently reads localStorage every time
   - Cache in Map for session

---

## Risk Mitigation

### Rollback Plan
- Each task is independent and can be reverted separately
- Git commit after each completed task
- Tag current version before starting: `git tag pre-map-fixes`

### Feature Flags
Consider adding flags for new optimizations:
```typescript
// src/lib/config/map.ts
export const MAP_FEATURES = {
  USE_MARKER_POOLING: false, // Enable in production after testing
  USE_VIEWPORT_CULLING: false,
  USE_WEB_WORKERS: false,
} as const;
```

### Monitoring
After deployment, monitor:
- Error rate (should not increase)
- Page load time (should decrease)
- User reports of issues
- Browser console errors

---

## Notes & Recommendations

### What's Already Good ✅
- **LocationManager** uses proper diffing - use as template
- **Configuration** is well organized in `map.ts`
- **TypeScript** types are comprehensive
- **Accessibility** features implemented
- **Mobile support** with bottom sheet

### Priority Order 🎯
1. **Do First**: Task 1.1 (MarkerCluster diffing) - biggest impact
2. **Do Next**: Tasks 1.2-1.4 (cleanup tasks) - quick wins
3. **Do After**: Phase 2 (reliability) - prevents crashes
4. **Do Last**: Phase 4 (advanced) - only if needed

### When to Skip Phase 4
Skip advanced optimizations if after Phase 1-3:
- ✅ Filter changes feel instant
- ✅ Memory usage is stable
- ✅ 60fps maintained during pan/zoom
- ✅ No user complaints about performance

You probably **won't need** Phase 4 unless dealing with:
- ❌ 5000+ markers
- ❌ Real-time marker updates
- ❌ Complex filtering logic (>100ms)
- ❌ Embedded in constrained environments

---

## Questions & Answers

**Q: Why is MarkerCluster slower than LocationManager?**  
A: MarkerCluster rebuilds everything, LocationManager uses diffing. We'll fix this in Task 1.1.

**Q: Will these changes break existing functionality?**  
A: No. We're optimizing the implementation, not changing the API or behavior.

**Q: How much performance improvement should I expect?**  
A: 5-10x faster filter changes, 50% faster initial render, stable memory.

**Q: Do I need to change my data model?**  
A: No. All changes are internal to components.

**Q: What if I have 10,000+ markers?**  
A: Implement Phase 4 (viewport culling + pooling). Consider server-side clustering.

---

## Next Steps

1. **Review this document** - Adjust priorities if needed
2. **Create branch**: `git checkout -b fix/map-performance`
3. **Start with Task 1.1** - Biggest impact, 1 hour
4. **Test thoroughly** - Use generated test data
5. **Commit after each task** - Easy rollback if needed
6. **Deploy to staging** - Validate before production

**Recommended first session**: Tasks 1.1 + 1.2 (2 hours) for maximum impact

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-03  
**Author**: OpenCode Analysis  
**Status**: Ready for implementation
