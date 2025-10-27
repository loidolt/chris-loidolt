import React from 'react';
import type { LocationPublic } from '@/lib/pocketbase';

interface LocationsListPanelProps {
  filteredLocations: LocationPublic[];
  isLocationLocked: (location: LocationPublic) => boolean;
  onLocationClick: (location: LocationPublic) => void;
}

export default function LocationsListPanel({
  filteredLocations,
  isLocationLocked,
  onLocationClick,
}: LocationsListPanelProps) {
  return (
    <div style={{ padding: '8px' }}>
      {filteredLocations.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            No results found
          </div>
        </div>
      ) : (
        <>
          {filteredLocations.map((location) => {
            const isLocked = isLocationLocked(location);
            return (
              <button
                key={location.id}
                onClick={() => onLocationClick(location)}
                className="btn-terminal w-full text-left p-3 sm:p-2 mb-2"
                style={{
                  opacity: isLocked ? 0.7 : 1,
                  minHeight: '56px',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isLocked && <span style={{ color: 'var(--text-muted)' }}>🔒</span>}
                  <div className="text-base sm:text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
                    {location.name}
                  </div>
                </div>
                {location.category && (
                  <div className="text-sm sm:text-xs" style={{ color: 'var(--accent-secondary)' }}>
                    [{location.category}]
                  </div>
                )}
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}
