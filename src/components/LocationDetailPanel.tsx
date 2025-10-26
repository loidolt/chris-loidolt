'use client';

import type { Location } from '@/lib/airtable';

interface LocationDetailPanelProps {
  location: Location | null;
  onClose: () => void;
  isDark?: boolean;
}

export default function LocationDetailPanel({ location, onClose, isDark = true }: LocationDetailPanelProps) {
  if (!location) return null;

  return (
    <div
      className="fixed sm:absolute left-0 right-0 bottom-0 sm:top-5 sm:right-20 sm:bottom-5 sm:left-auto
                 w-full sm:w-[400px] lg:w-[450px] sm:max-w-[calc(100vw-120px)]
                 max-h-[70vh] sm:max-h-none
                 flex flex-col overflow-hidden z-[1000]
                 transition-transform duration-300 ease-in-out"
      role="complementary"
      aria-label="Location details"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <div style={{ flex: 1 }}>
          <h2
            className="text-lg font-semibold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {location.name}
          </h2>
          {location.category && (
            <div className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
              [{location.category}]
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-xs hover:opacity-70 transition-opacity px-2 py-1"
          style={{
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
          }}
          aria-label="Close location details"
        >
          [close]
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
        }}
      >
        {/* Featured Image */}
        {location.image && (
          <div style={{ marginBottom: '20px' }}>
            <img
              src={location.image}
              alt={location.name}
              className="w-full object-cover h-48 sm:h-60"
              style={{
                border: '1px solid var(--border-color)',
                filter: isDark ? 'grayscale(100%)' : 'grayscale(50%)',
              }}
            />
          </div>
        )}

        {/* Metadata Section */}
        {(location.categories && location.categories.length > 0) && (
          <div style={{ marginBottom: '20px' }}>
            <div
              className="text-xs mb-2"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Categories
            </div>
            <div className="flex flex-wrap gap-2">
              {location.categories.map((cat, idx) => (
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
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </div>
        </div>

        {/* Description */}
        {location.description && (
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
              {location.description}
            </div>
          </div>
        )}

        {/* External Link */}
        {location.url && (
          <div style={{ marginBottom: '20px' }}>
            <a
              href={location.url}
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

        {/* Additional Metadata */}
        {location.privacy && (
          <div style={{ marginBottom: '12px' }}>
            <div
              className="text-xs mb-2"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Privacy
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {location.privacy}
            </div>
          </div>
        )}
      </div>

      {/* Footer with action buttons */}
      <div
        className="p-3 sm:p-4 flex gap-2"
        style={{
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <button
          onClick={() => {
            // Copy coordinates to clipboard
            const coords = `${location.latitude}, ${location.longitude}`;
            navigator.clipboard.writeText(coords);
          }}
          className="flex-1 text-xs sm:text-sm px-3 py-3 sm:py-2 hover:opacity-70 transition-opacity active:opacity-50"
          style={{
            color: 'var(--link-color)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
          }}
          aria-label="Copy coordinates to clipboard"
        >
          <span className="hidden sm:inline">[Copy Coords]</span>
          <span className="sm:hidden">📋 Copy</span>
        </button>
        {location.url && (
          <button
            onClick={() => {
              window.open(location.url, '_blank', 'noopener,noreferrer');
            }}
            className="flex-1 text-xs sm:text-sm px-3 py-3 sm:py-2 hover:opacity-70 transition-opacity active:opacity-50"
            style={{
              color: 'var(--accent-primary)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
            }}
            aria-label="Visit external link"
          >
            <span className="hidden sm:inline">[Visit Link]</span>
            <span className="sm:hidden">🔗 Link</span>
          </button>
        )}
      </div>
    </div>
  );
}
