'use client';

import { useState } from 'react';

interface PasswordModalProps {
  locationName: string;
  onSubmit: (password: string) => void;
  onCancel: () => void;
  error?: string;
}

export default function PasswordModal({
  locationName,
  onSubmit,
  onCancel,
  error
}: PasswordModalProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '2px solid var(--border-color)',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-sm mb-2"
          style={{ color: 'var(--accent-secondary)' }}
        >
          Private Location
        </h2>

        <p
          className="text-sm mb-4"
          style={{ color: 'var(--text-muted)' }}
        >
          Enter password to view "{locationName}"
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password..."
            autoFocus
            className="w-full p-3 text-sm mb-3 focus:outline-none"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />

          {error && (
            <div
              className="text-xs mb-3"
              style={{ color: 'var(--error-color)' }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              className="flex-1 p-2 text-sm transition-opacity hover:opacity-70"
              style={{
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--link-color)',
              }}
            >
              [Unlock]
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 p-2 text-sm transition-opacity hover:opacity-70"
              style={{
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-muted)',
              }}
            >
              [Cancel]
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
