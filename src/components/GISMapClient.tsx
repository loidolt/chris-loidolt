'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import type { LocationPublic } from '@/lib/airtable';
import MapErrorBoundary from '@/components/MapErrorBoundary';

// Dynamic import to avoid SSR issues with Leaflet
const MapViewer = dynamic(() => import('@/components/MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div style={{ color: 'var(--text-primary)' }}>Loading map...</div>
    </div>
  ),
});

interface GISMapClientProps {
  locations: LocationPublic[];
}

export default function GISMapClient({ locations }: GISMapClientProps) {
  const searchParams = useSearchParams();
  const [sharedLocationId, setSharedLocationId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);

  useEffect(() => {
    // Read URL parameters for shared locations
    const locationParam = searchParams.get('location');
    const tokenParam = searchParams.get('token');

    if (locationParam) {
      setSharedLocationId(locationParam);
      setShareToken(tokenParam);
    }
  }, [searchParams]);

  return (
    <MapErrorBoundary>
      <MapViewer
        locations={locations}
        sharedLocationId={sharedLocationId}
        shareToken={shareToken}
      />
    </MapErrorBoundary>
  );
}
