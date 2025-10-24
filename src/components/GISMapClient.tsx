'use client';

import dynamic from 'next/dynamic';

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
  locations: any[];
}

export default function GISMapClient({ locations }: GISMapClientProps) {
  return <MapViewer locations={locations} />;
}
