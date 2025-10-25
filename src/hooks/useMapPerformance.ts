import { useState, useCallback } from 'react';

interface PerformanceMetrics {
  tilesLoaded: number;
  tilesFailed: number;
  averageLoadTime: number;
  totalLoadTime: number;
  lastUpdate: number;
}

export function useMapPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    tilesLoaded: 0,
    tilesFailed: 0,
    averageLoadTime: 0,
    totalLoadTime: 0,
    lastUpdate: Date.now(),
  });

  const recordTileLoad = useCallback((loadTime: number) => {
    // ALWAYS log (no env check) for debugging
    console.log('[useMapPerformance] Recording tile load:', loadTime, 'ms');
    setMetrics(prev => {
      const newTotal = prev.totalLoadTime + loadTime;
      const newCount = prev.tilesLoaded + 1;
      const newMetrics = {
        ...prev,
        tilesLoaded: newCount,
        totalLoadTime: newTotal,
        averageLoadTime: newTotal / newCount,
        lastUpdate: Date.now(),
      };
      // ALWAYS log (no env check) for debugging
      console.log('[useMapPerformance] New metrics:', newMetrics);
      return newMetrics;
    });
  }, []);

  const recordTileError = useCallback(() => {
    // ALWAYS log (no env check) for debugging
    console.log('[useMapPerformance] Recording tile error');
    setMetrics(prev => ({
      ...prev,
      tilesFailed: prev.tilesFailed + 1,
      lastUpdate: Date.now(),
    }));
  }, []);

  const reset = useCallback(() => {
    setMetrics({
      tilesLoaded: 0,
      tilesFailed: 0,
      averageLoadTime: 0,
      totalLoadTime: 0,
      lastUpdate: Date.now(),
    });
  }, []);

  const getSuccessRate = useCallback(() => {
    const total = metrics.tilesLoaded + metrics.tilesFailed;
    if (total === 0) return 100;
    return (metrics.tilesLoaded / total) * 100;
  }, [metrics]);

  return { metrics, recordTileLoad, recordTileError, reset, getSuccessRate };
}
