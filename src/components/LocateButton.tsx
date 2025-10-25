'use client';

import { useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface LocateButtonProps {
  onLocate: (lat: number, lng: number) => void;
}

export default function LocateButton({ onLocate }: LocateButtonProps) {
  const { latitude, longitude, error, isLoading, requestLocation } = useGeolocation();

  useEffect(() => {
    if (latitude && longitude) {
      onLocate(latitude, longitude);
    }
  }, [latitude, longitude, onLocate]);

  return (
    <div>
      <button
        onClick={requestLocation}
        disabled={isLoading}
        className="w-full p-2 text-sm transition-opacity hover:opacity-70"
        style={{
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--link-color)',
          cursor: isLoading ? 'wait' : 'pointer',
          opacity: isLoading ? 0.6 : 1,
        }}
        title="Find my current location"
      >
        {isLoading ? '[Locating...]' : '[📍 Locate Me]'}
      </button>
      {error && (
        <div
          className="text-xs mt-1 p-1"
          style={{
            color: 'var(--error-color)',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--error-color)',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
