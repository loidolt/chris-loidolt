import React from 'react';
import type { LocationPublic } from '@/lib/pocketbase';
import Tooltip from '../Tooltip';

interface SearchPanelProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  categories: string[];
  selectedCategories: Set<string>;
  onSelectedCategoriesChange: (categories: Set<string>) => void;
  privacyFilter: 'all' | 'public' | 'private';
  onPrivacyFilterChange: (filter: 'all' | 'public' | 'private') => void;
  hasImageFilter: boolean | null;
  onHasImageFilterChange: (filter: boolean | null) => void;
  autoZoomToExtents: boolean;
  onAutoZoomToExtentsChange: (enabled: boolean) => void;
  activeFilterCount: number;
  isOnline: boolean;
  networkQuality: 'fast' | 'slow' | 'offline';
  drawingEnabled: boolean;
  drawingCount: number;
  onSaveDrawings: () => void;
  onExportGeoJSON: () => void;
  onClearDrawings: () => void;
}

export default function SearchPanel({
  searchQuery,
  onSearchQueryChange,
  categories,
  selectedCategories,
  onSelectedCategoriesChange,
  privacyFilter,
  onPrivacyFilterChange,
  hasImageFilter,
  onHasImageFilterChange,
  autoZoomToExtents,
  onAutoZoomToExtentsChange,
  activeFilterCount,
  isOnline,
  networkQuality,
  drawingEnabled,
  drawingCount,
  onSaveDrawings,
  onExportGeoJSON,
  onClearDrawings,
}: SearchPanelProps) {
  return (
    <>
      {/* Network status indicator */}
      {(!isOnline || networkQuality === 'slow') && (
        <div
          style={{
            padding: '6px 8px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          {!isOnline && (
            <div
              className="text-xs px-1.5 py-0.5"
              style={{
                color: 'var(--error-color)',
                border: '1px solid var(--error-color)',
                backgroundColor: 'var(--bg-primary)',
                display: 'inline-block',
              }}
            >
              Offline
            </div>
          )}
          {isOnline && networkQuality === 'slow' && (
            <div
              className="text-xs px-1.5 py-0.5"
              style={{
                color: 'var(--accent-secondary)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                display: 'inline-block',
              }}
            >
              Slow
            </div>
          )}
        </div>
      )}

      {/* Search & Filter Section */}
      <div style={{ padding: '8px 8px 12px', borderBottom: '1px solid var(--border-color)' }}>
        {/* Compact Search */}
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <input
            id="location-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search..."
            className="input-terminal-primary pl-9 text-sm sm:text-xs sm:p-1.5 sm:pl-7 focus:ring-1 transition-all"
            aria-label="Search locations by name or description"
          />
          <span
            style={{
              position: 'absolute',
              left: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
              fontSize: '11px',
            }}
            aria-hidden="true"
          >
            🔍
          </span>
        </div>

        {/* Multi-select Category Filter */}
        {categories.length > 0 && (
          <div>
            <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Categories {selectedCategories.size > 0 && `(${selectedCategories.size})`}
            </div>
            <div
              role="group"
              aria-label="Category filters"
              className="flex flex-wrap gap-1"
            >
              {categories.map((cat) => {
                const isSelected = selectedCategories.has(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      const newCategories = new Set(selectedCategories);
                      if (isSelected) {
                        newCategories.delete(cat);
                      } else {
                        newCategories.add(cat);
                      }
                      onSelectedCategoriesChange(newCategories);
                    }}
                    className={`px-2.5 py-2 sm:px-1.5 sm:py-0.5 ${isSelected ? 'btn-terminal-selected' : 'btn-terminal-muted'}`}
                    style={{ minHeight: '36px', fontWeight: isSelected ? 600 : 400 }}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? 'Remove' : 'Add'} ${cat} filter`}
                  >
                    {isSelected && '✓ '}{cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters Section */}
      <details style={{ padding: '8px', backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
        <summary
          className="text-xs cursor-pointer transition-opacity hover:opacity-70 mb-2"
          style={{ color: 'var(--accent-secondary)', listStyle: 'none', userSelect: 'none' }}
        >
          ⚙️ Advanced Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </summary>
        <div className="space-y-3">
          {/* Privacy Filter */}
          <div>
            <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Privacy
            </div>
            <div className="flex gap-1">
              {['all', 'public', 'private'].map((option) => (
                <button
                  key={option}
                  onClick={() => onPrivacyFilterChange(option as 'all' | 'public' | 'private')}
                  className={`px-2 py-2 sm:py-1 ${privacyFilter === option ? 'btn-terminal-selected' : 'btn-terminal-muted'}`}
                  style={{ flex: 1, minHeight: '40px', fontWeight: privacyFilter === option ? 600 : 400 }}
                  aria-pressed={privacyFilter === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Has Image Filter */}
          <div>
            <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Images
            </div>
            <div className="flex gap-1">
              {[
                { label: 'all', value: null },
                { label: 'with image', value: true },
                { label: 'no image', value: false },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => onHasImageFilterChange(option.value)}
                  className={`px-2 py-2 sm:py-1 ${hasImageFilter === option.value ? 'btn-terminal-selected' : 'btn-terminal-muted'}`}
                  style={{ flex: 1, minHeight: '40px', fontWeight: hasImageFilter === option.value ? 600 : 400 }}
                  aria-pressed={hasImageFilter === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-zoom Toggle */}
          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Auto-zoom to extents
              </span>
              <button
                onClick={() => onAutoZoomToExtentsChange(!autoZoomToExtents)}
                className="btn-terminal px-3 py-2 sm:px-2 sm:py-1"
                style={{
                  color: autoZoomToExtents ? 'var(--accent-primary)' : 'var(--text-muted)',
                  minWidth: '52px',
                  minHeight: '36px',
                }}
                aria-pressed={autoZoomToExtents}
              >
                {autoZoomToExtents ? 'ON' : 'OFF'}
              </button>
            </label>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
              Automatically zoom to fit filtered locations
            </div>
          </div>
        </div>
      </details>

      {/* Drawing Actions - shown when drawing is enabled and there are drawings */}
      {drawingEnabled && drawingCount > 0 && (
        <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Drawings ({drawingCount})
          </div>
          <div className="grid grid-cols-3 gap-1">
            <Tooltip content="Save to storage" position="bottom">
              <button
                onClick={onSaveDrawings}
                className="p-1 text-xs transition-all hover:opacity-70 focus:ring-1"
                style={{
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--link-color)',
                  outline: 'none',
                }}
                aria-label="Save drawings to browser storage"
              >
                Save
              </button>
            </Tooltip>
            <Tooltip content="Export GeoJSON" position="bottom">
              <button
                onClick={onExportGeoJSON}
                className="p-1 text-xs transition-all hover:opacity-70 focus:ring-1"
                style={{
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--link-color)',
                  outline: 'none',
                }}
                aria-label="Export drawings as GeoJSON file"
              >
                Export
              </button>
            </Tooltip>
            <Tooltip content="Clear all" position="bottom">
              <button
                onClick={() => {
                  if (confirm('Clear all drawings?')) {
                    onClearDrawings();
                  }
                }}
                className="p-1 text-xs transition-all hover:opacity-70 focus:ring-1"
                style={{
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--error-color)',
                  outline: 'none',
                }}
                aria-label="Clear all drawings"
              >
                Clear
              </button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Compact Keyboard Shortcuts */}
      <details style={{ padding: '6px 8px', backgroundColor: 'var(--bg-primary)' }}>
        <summary
          className="text-xs cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)', listStyle: 'none', userSelect: 'none' }}
        >
          ⌨️ Shortcuts
        </summary>
        <div className="mt-1.5 space-y-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex justify-between">
            <span>Locate</span>
            <kbd style={{ padding: '0 3px', border: '1px solid var(--border-color)', borderRadius: '2px', fontSize: '10px' }}>L</kbd>
          </div>
          <div className="flex justify-between">
            <span>List</span>
            <kbd style={{ padding: '0 3px', border: '1px solid var(--border-color)', borderRadius: '2px', fontSize: '10px' }}>⇧L</kbd>
          </div>
          <div className="flex justify-between">
            <span>Cluster</span>
            <kbd style={{ padding: '0 3px', border: '1px solid var(--border-color)', borderRadius: '2px', fontSize: '10px' }}>C</kbd>
          </div>
          <div className="flex justify-between">
            <span>Draw</span>
            <kbd style={{ padding: '0 3px', border: '1px solid var(--border-color)', borderRadius: '2px', fontSize: '10px' }}>D</kbd>
          </div>
          <div className="flex justify-between">
            <span>Search</span>
            <kbd style={{ padding: '0 3px', border: '1px solid var(--border-color)', borderRadius: '2px', fontSize: '10px' }}>/</kbd>
          </div>
          <div className="flex justify-between">
            <span>Close</span>
            <kbd style={{ padding: '0 3px', border: '1px solid var(--border-color)', borderRadius: '2px', fontSize: '10px' }}>Esc</kbd>
          </div>
        </div>
      </details>
    </>
  );
}
