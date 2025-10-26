import { useState, useEffect } from 'react';

export type NetworkQuality = 'fast' | 'slow' | 'offline';

export interface NetworkQualityResult {
  quality: NetworkQuality;
  effectiveType: string;
  isOnline: boolean;
}

/**
 * Hook to detect network quality using the Network Information API
 * Monitors connection changes and online/offline status
 * @returns {NetworkQualityResult} Network quality information
 */
export function useNetworkQuality(): NetworkQualityResult {
  const [quality, setQuality] = useState<NetworkQuality>('fast');
  const [effectiveType, setEffectiveType] = useState<string>('4g');

  useEffect(() => {
    // Check if Network Information API is available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    const updateNetworkQuality = () => {
      if (!navigator.onLine) {
        setQuality('offline');
        return;
      }

      if (connection) {
        const type = connection.effectiveType || '4g';
        setEffectiveType(type);

        // Classify network quality
        if (type === '4g' || type === '3g') {
          setQuality('fast');
        } else if (type === '2g' || type === 'slow-2g') {
          setQuality('slow');
        } else {
          setQuality('fast'); // Default to fast
        }
      } else {
        setQuality('fast'); // Default if API not available
      }
    };

    // Initial check
    updateNetworkQuality();

    // Listen for network changes
    window.addEventListener('online', updateNetworkQuality);
    window.addEventListener('offline', updateNetworkQuality);

    if (connection) {
      connection.addEventListener('change', updateNetworkQuality);
    }

    return () => {
      window.removeEventListener('online', updateNetworkQuality);
      window.removeEventListener('offline', updateNetworkQuality);
      if (connection) {
        connection.removeEventListener('change', updateNetworkQuality);
      }
    };
  }, []);

  return { quality, effectiveType, isOnline: quality !== 'offline' };
}
