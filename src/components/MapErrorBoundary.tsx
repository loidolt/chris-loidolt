'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[MapErrorBoundary] Map error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              textAlign: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <div
              className="text-sm mb-4"
              style={{ color: 'var(--error-color)' }}
            >
              [Map Error]
            </div>
            <div
              className="text-sm mb-4"
              style={{ color: 'var(--text-muted)' }}
            >
              The map failed to load. This could be due to a network issue or browser compatibility.
            </div>
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div
                className="text-xs mb-4 p-3"
                style={{
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  fontFamily: 'monospace',
                  textAlign: 'left',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm transition-opacity hover:opacity-70"
              style={{
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--link-color)',
                cursor: 'pointer',
              }}
            >
              [Reload Page]
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
