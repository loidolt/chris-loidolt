'use client';

import { useState, type ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface ProjectTabsProps {
  tabs: Tab[];
  children: ReactNode[];
}

export function ProjectTabs({ tabs, children }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  return (
    <div className="space-y-0">
      {/* Terminal-style tab navigation */}
      <div className="border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-1 px-4 py-2" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <span className="text-sm mr-2" style={{ color: 'var(--link-color)' }}>
            $ view --mode=
          </span>
          <div className="flex gap-1">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-sm transition-all border ${
                  activeTab === tab.id ? 'border-transparent' : 'border-transparent'
                }`}
                style={{
                  color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                  backgroundColor: activeTab === tab.id ? 'var(--bg-dark)' : 'transparent',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                }}
              >
                {tab.icon && <span className="mr-1">{tab.icon}</span>}
                {tab.label}
                {index < tabs.length - 1 && (
                  <span className="ml-2" style={{ color: 'var(--text-muted)' }}>
                    |
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6" style={{ backgroundColor: 'var(--bg-dark)' }}>
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            style={{ display: activeTab === tab.id ? 'block' : 'none' }}
          >
            {children[index]}
          </div>
        ))}
      </div>
    </div>
  );
}
