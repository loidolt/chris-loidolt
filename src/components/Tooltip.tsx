'use client';

import { useState, useRef, ReactNode } from 'react';

interface TooltipProps {
  content: string;
  shortcut?: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export default function Tooltip({
  content,
  shortcut,
  children,
  position = 'bottom',
  delay = 500
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleFocus = () => {
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  const positionStyles = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: '8px',
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '8px',
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: '8px',
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: '8px',
    },
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 10000,
            padding: '6px 10px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            ...positionStyles[position],
          }}
        >
          <div style={{ color: 'var(--text-primary)', marginBottom: shortcut ? '2px' : 0 }}>
            {content}
          </div>
          {shortcut && (
            <div
              style={{
                color: 'var(--text-muted)',
                fontSize: '10px',
                marginTop: '2px',
              }}
            >
              <kbd
                style={{
                  padding: '1px 4px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '2px',
                }}
              >
                {shortcut}
              </kbd>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
