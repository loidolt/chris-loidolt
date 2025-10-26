import React from 'react';
import type { LocationPublic } from '@/lib/airtable';
import LocationShareButton from '../LocationShareButton';

interface LocationInfoPanelProps {
  selectedLocation: LocationPublic | null;
  isDark: boolean;
}

export default function LocationInfoPanel({
  selectedLocation,
  isDark,
}: LocationInfoPanelProps) {
  if (!selectedLocation) {
    return null;
  }

  return (
    <div style={{ padding: '16px' }}>
      {/* Featured Image */}
      {selectedLocation.image && (
        <div style={{ marginBottom: '20px' }}>
          <img
            src={selectedLocation.image}
            alt={selectedLocation.name}
            className="w-full object-cover h-48 sm:h-60"
            style={{
              border: '1px solid var(--border-color)',
              filter: isDark ? 'grayscale(100%)' : 'grayscale(50%)',
            }}
          />
        </div>
      )}

      {/* Name */}
      <div style={{ marginBottom: '16px' }}>
        <h2
          className="text-lg font-semibold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {selectedLocation.name}
        </h2>
      </div>

      {/* Categories */}
      {(selectedLocation.categories && selectedLocation.categories.length > 0) && (
        <div style={{ marginBottom: '20px' }}>
          <div
            className="text-xs mb-2"
            style={{ color: 'var(--accent-secondary)' }}
          >
            Categories
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedLocation.categories.map((cat, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1"
                style={{
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                }}
              >
                [{cat}]
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Coordinates */}
      <div style={{ marginBottom: '20px' }}>
        <div
          className="text-xs mb-2"
          style={{ color: 'var(--accent-secondary)' }}
        >
          Coordinates
        </div>
        <div className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
        </div>
      </div>

      {/* Description */}
      {selectedLocation.description && (
        <div style={{ marginBottom: '20px' }}>
          <div
            className="text-xs mb-2"
            style={{ color: 'var(--accent-secondary)' }}
          >
            Description
          </div>
          <div
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
          >
            {selectedLocation.description}
          </div>
        </div>
      )}

      {/* External Link */}
      {selectedLocation.url && (
        <div style={{ marginBottom: '20px' }}>
          <a
            href={selectedLocation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm hover:opacity-70 transition-opacity px-3 py-2"
            style={{
              color: 'var(--link-color)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            [Learn more →]
          </a>
        </div>
      )}

      {/* Privacy */}
      {selectedLocation.privacy && (
        <div style={{ marginBottom: '12px' }}>
          <div
            className="text-xs mb-2"
            style={{ color: 'var(--accent-secondary)' }}
          >
            Privacy
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {selectedLocation.privacy}
          </div>
        </div>
      )}

      {/* Footer with action buttons */}
      <div className="space-y-2 mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              const coords = `${selectedLocation.latitude}, ${selectedLocation.longitude}`;
              navigator.clipboard.writeText(coords);
            }}
            className="flex-1 text-xs sm:text-sm px-3 py-2 hover:opacity-70 transition-opacity active:opacity-50"
            style={{
              color: 'var(--link-color)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
            }}
            aria-label="Copy coordinates to clipboard"
          >
            [Copy Coords]
          </button>
          {selectedLocation.url && (
            <button
              onClick={() => {
                window.open(selectedLocation.url, '_blank', 'noopener,noreferrer');
              }}
              className="flex-1 text-xs sm:text-sm px-3 py-2 hover:opacity-70 transition-opacity active:opacity-50"
              style={{
                color: 'var(--accent-primary)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
              }}
              aria-label="Visit external link"
            >
              [Visit Link]
            </button>
          )}
        </div>
        {/* Share button */}
        <LocationShareButton location={selectedLocation} />
      </div>
    </div>
  );
}
