'use client';

import { useState, useEffect, useMemo, useRef, ReactNode, CSSProperties } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

export interface PanelTab {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

interface OverlayPanelProps {
  tabs: PanelTab[];
  defaultTab?: string;
  defaultOpen?: boolean;
  panelHeader?: ReactNode;
  onTabChange?: (tabId: string) => void;
  position?: 'left' | 'right';
  width?: {
    mobile?: string;
    desktop?: string;
  };
  // Controlled state
  activeTab?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Configurable props (with sensible defaults)
  tabBarWidth?: number;
  mobileBreakpoint?: number;
  // State persistence
  storageKey?: string; // Unique key for localStorage persistence
}

// Helper function: Get container positioning styles
function getContainerPosition(position: 'left' | 'right'): CSSProperties {
  return position === 'left' ? { left: '2px' } : { right: '2px' };
}

// Helper function: Get container transform based on panel state
function getContainerTransform(
  isPanelOpen: boolean,
  position: 'left' | 'right',
  tabBarWidth: number
): string {
  if (position === 'left') {
    return isPanelOpen ? 'translateX(0)' : `translateX(calc(-100% + ${tabBarWidth}px))`;
  } else {
    return isPanelOpen ? 'translateX(0)' : `translateX(calc(100% - ${tabBarWidth}px))`;
  }
}

// Helper function: Get flex direction based on position
function getFlexDirection(position: 'left' | 'right'): 'row' | 'row-reverse' {
  return position === 'left' ? 'row-reverse' : 'row';
}

// Helper function: Get tab button styles
function getTabButtonStyles(
  tab: PanelTab,
  isActive: boolean,
  isPanelOpen: boolean,
  position: 'left' | 'right'
): CSSProperties {
  const baseStyles: CSSProperties = {
    padding: '10px 4px',
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    fontSize: '11px',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? 'var(--link-color)' : 'var(--text-muted)',
    backgroundColor: isActive && isPanelOpen
      ? 'var(--bg-primary)'
      : isActive
        ? 'var(--bg-surface)'
        : 'var(--color-terminal-darker)',
    border: '1px solid var(--border-color)',
    opacity: tab.disabled ? 0.5 : 1,
    minHeight: '56px',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    position: 'relative',
    zIndex: isActive ? 10 : 1,
    transform: isActive ? 'scale(1)' : 'scale(0.95)',
  };

  // Position-specific styles
  if (position === 'left') {
    return {
      ...baseStyles,
      borderTopRightRadius: '3px',
      borderBottomRightRadius: '3px',
      borderLeft: isActive ? '2px solid var(--link-color)' : '1px solid var(--border-color)',
      borderLeftWidth: isActive ? '2px' : '1px',
      boxShadow: isActive && isPanelOpen
        ? '4px 0 12px rgba(0,0,0,0.35), 2px 0 6px rgba(0,0,0,0.25), 1px 0 3px rgba(0,0,0,0.2)'
        : '2px 0 4px rgba(0,0,0,0.15)',
    };
  } else {
    return {
      ...baseStyles,
      borderTopLeftRadius: '3px',
      borderBottomLeftRadius: '3px',
      borderRight: isActive ? '2px solid var(--link-color)' : '1px solid var(--border-color)',
      borderRightWidth: isActive ? '2px' : '1px',
      boxShadow: isActive && isPanelOpen
        ? '-4px 0 12px rgba(0,0,0,0.35), -2px 0 6px rgba(0,0,0,0.25), -1px 0 3px rgba(0,0,0,0.2)'
        : '-2px 0 4px rgba(0,0,0,0.15)',
    };
  }
}

// Helper function: Get panel content border styles
function getPanelBorderStyles(position: 'left' | 'right'): CSSProperties {
  return position === 'left'
    ? { borderLeft: '1px solid var(--border-color)' }
    : { borderRight: '1px solid var(--border-color)' };
}

export default function OverlayPanel({
  tabs,
  defaultTab,
  defaultOpen = false, // Changed default to false for better UX
  panelHeader,
  onTabChange,
  position = 'left',
  width = {
    mobile: 'calc(100vw - 16px)',
    desktop: '400px',
  },
  // Controlled state
  activeTab: controlledActiveTab,
  open: controlledOpen,
  onOpenChange,
  // Configurable props with defaults
  tabBarWidth = 32,
  mobileBreakpoint = 640,
  // State persistence
  storageKey,
}: OverlayPanelProps) {
  // Load initial state from localStorage if available
  const getInitialOpenState = (): boolean => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`overlayPanel_${storageKey}_open`);
        if (stored !== null) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.error('Error loading panel state from localStorage:', error);
      }
    }
    return defaultOpen;
  };

  const [internalPanelOpen, setInternalPanelOpen] = useState(getInitialOpenState);
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  // Use custom hook for mobile detection
  const isMobile = useIsMobile(mobileBreakpoint);

  // Ref for keyboard navigation
  const tabListRef = useRef<HTMLDivElement>(null);

  // Use controlled state if provided, otherwise use internal state
  const isPanelOpen = controlledOpen !== undefined ? controlledOpen : internalPanelOpen;
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const setIsPanelOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    }
    if (controlledOpen === undefined) {
      setInternalPanelOpen(open);
    }
  };

  const setActiveTab = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
  };

  // Save panel state to localStorage when it changes (only in uncontrolled mode)
  useEffect(() => {
    if (storageKey && controlledOpen === undefined && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`overlayPanel_${storageKey}_open`, JSON.stringify(isPanelOpen));
      } catch (error) {
        console.error('Error saving panel state to localStorage:', error);
      }
    }
  }, [isPanelOpen, storageKey, controlledOpen]);

  // Auto-close panel on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setIsPanelOpen(false);
    }
  }, [isMobile]);

  const handleTabClick = (tabId: string) => {
    // If clicking the active tab and panel is open, close the panel
    if (activeTab === tabId && isPanelOpen) {
      setIsPanelOpen(false);
    } else {
      // Otherwise, switch to the tab and open the panel
      setActiveTab(tabId);
      setIsPanelOpen(true);
      if (onTabChange) {
        onTabChange(tabId);
      }
    }
  };

  // Keyboard navigation for tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if focus is within the tab list
      if (!tabListRef.current?.contains(document.activeElement)) {
        return;
      }

      const enabledTabs = tabs.filter(t => !t.disabled);
      const currentIndex = enabledTabs.findIndex(t => t.id === activeTab);

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          if (currentIndex > 0) {
            setActiveTab(enabledTabs[currentIndex - 1].id);
            setIsPanelOpen(true);
          }
          break;

        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          if (currentIndex < enabledTabs.length - 1) {
            setActiveTab(enabledTabs[currentIndex + 1].id);
            setIsPanelOpen(true);
          }
          break;

        case 'Home':
          e.preventDefault();
          setActiveTab(enabledTabs[0].id);
          setIsPanelOpen(true);
          break;

        case 'End':
          e.preventDefault();
          setActiveTab(enabledTabs[enabledTabs.length - 1].id);
          setIsPanelOpen(true);
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          // Toggle panel open/close
          setIsPanelOpen(!isPanelOpen);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTab, isPanelOpen]);

  // Memoize active tab data
  const activeTabData = useMemo(
    () => tabs.find(t => t.id === activeTab),
    [tabs, activeTab]
  );

  // Memoize container styles
  const containerStyles = useMemo<CSSProperties>(
    () => ({
      ...getContainerPosition(position),
      flexDirection: getFlexDirection(position),
      transform: getContainerTransform(isPanelOpen, position, tabBarWidth),
      maxWidth: '100vw',
    }),
    [position, isPanelOpen, tabBarWidth]
  );

  // Memoize panel content styles
  const panelContentStyles = useMemo<CSSProperties>(
    () => ({
      width: isMobile ? width.mobile : width.desktop,
      maxWidth: `calc(100vw - ${tabBarWidth + 16}px)`,
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-color)',
      borderBottom: '1px solid var(--border-color)',
      ...getPanelBorderStyles(position),
      boxShadow: isPanelOpen
        ? '0 8px 24px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)'
        : 'none',
    }),
    [isMobile, width, tabBarWidth, position, isPanelOpen]
  );

  return (
    <div
      className="fixed top-[60px] sm:top-[68px] bottom-16 sm:bottom-20 flex z-[1000] transition-transform duration-300 ease-in-out"
      style={containerStyles}
      role="complementary"
      aria-label="Side panel"
    >
      {/* Vertical Tab Bar - Moves with panel - Binder tab style */}
      <div
        ref={tabListRef}
        className="flex flex-col flex-shrink-0"
        style={{
          width: `${tabBarWidth}px`,
          backgroundColor: 'transparent',
          paddingTop: '4px',
          paddingBottom: '4px',
          gap: '3px', // Small gap between tabs like physical binder tabs
        }}
        role="tablist"
        aria-label="Panel tabs"
        aria-orientation="vertical"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="flex items-center justify-center transition-all hover:opacity-70"
              style={getTabButtonStyles(tab, isActive, isPanelOpen, position)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel Content */}
      <div
        id={`panel-${activeTab}`}
        className="flex flex-col flex-1"
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        style={panelContentStyles}
      >
        {/* Panel Header with Close Button */}
        <div
          className="flex-shrink-0"
          style={{
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          {/* Top bar with active tab name and close button */}
          <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="text-xs font-semibold" style={{ color: 'var(--link-color)' }}>
              {activeTabData?.label}
            </div>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-sm sm:text-xs hover:opacity-70 transition-opacity px-2 py-1"
              style={{
                color: 'var(--text-muted)',
                minWidth: '28px',
                minHeight: '28px',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          {/* Panel Header (optional) */}
          {panelHeader && (
            <div style={{ borderBottom: '1px solid var(--border-color)' }}>
              {panelHeader}
            </div>
          )}
        </div>

        {/* Tab Content - Independently Scrollable */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            backgroundColor: 'var(--bg-primary)',
            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          }}
        >
          {activeTabData?.content}
        </div>
      </div>
    </div>
  );
}
