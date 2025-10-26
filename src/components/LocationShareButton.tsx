'use client';

import { useState } from 'react';
import type { Location } from '@/lib/airtable';

interface LocationShareButtonProps {
  location: Location;
}

export default function LocationShareButton({ location }: LocationShareButtonProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedType, setCopiedType] = useState<'normal' | 'token' | null>(null);

  const generateShareLink = (includeToken: boolean) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams();
    params.set('location', location.id);

    if (includeToken && location.shareToken) {
      params.set('token', location.shareToken);
    }

    return `${baseUrl}/gis?${params.toString()}`;
  };

  const copyToClipboard = async (text: string, type: 'normal' | 'token') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const isPrivate = location.privacy === 'Private';
  const hasShareToken = !!location.shareToken;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="btn-terminal flex-1 text-xs sm:text-sm px-3 py-2 active:opacity-50"
        style={{
          color: 'var(--accent-primary)',
        }}
        aria-label="Share location"
      >
        [Share Location]
      </button>

      {showShareMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1999,
            }}
            onClick={() => setShowShareMenu(false)}
          />

          {/* Share menu */}
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              marginBottom: '8px',
              backgroundColor: 'var(--bg-surface)',
              border: '2px solid var(--border-color)',
              padding: '12px',
              zIndex: 2000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="text-xs mb-3"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Share Link Options
            </div>

            {/* Normal share link */}
            <div style={{ marginBottom: '12px' }}>
              <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {isPrivate ? 'Normal (requires password)' : 'Public Link'}
              </div>
              <button
                onClick={() => copyToClipboard(generateShareLink(false), 'normal')}
                className="btn-terminal w-full text-left p-2 text-xs"
                style={{
                  color: 'var(--link-color)',
                  fontFamily: 'monospace',
                }}
              >
                {copiedType === 'normal' ? '✓ Copied!' : '[Copy Link]'}
              </button>
            </div>

            {/* Token share link (only for private locations with tokens) */}
            {isPrivate && hasShareToken && (
              <div>
                <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  With Token (no password required)
                </div>
                <button
                  onClick={() => copyToClipboard(generateShareLink(true), 'token')}
                  className="btn-terminal w-full text-left p-2 text-xs"
                  style={{
                    color: 'var(--accent-primary)',
                    fontFamily: 'monospace',
                  }}
                >
                  {copiedType === 'token' ? '✓ Copied!' : '[Copy Token Link]'}
                </button>
                <div className="text-xs mt-1.5" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                  Anyone with this link can view without password
                </div>
              </div>
            )}

            {/* Warning for private locations without tokens */}
            {isPrivate && !hasShareToken && (
              <div
                className="text-xs p-2 mt-2"
                style={{
                  color: 'var(--accent-secondary)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                }}
              >
                This private location doesn't have a share token. Contact the admin to generate one.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
