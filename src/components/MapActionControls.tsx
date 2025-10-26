'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import Tooltip from './Tooltip';

interface MapActionControlsProps {
  onLocate: () => void;
  clusteringEnabled: boolean;
  onToggleClustering: () => void;
  drawingEnabled: boolean;
  onToggleDrawing: () => void;
}

/**
 * Custom Leaflet control that displays action buttons on the right side of the map
 * Positioned above the zoom controls
 */
export default function MapActionControls({
  onLocate,
  clusteringEnabled,
  onToggleClustering,
  drawingEnabled,
  onToggleDrawing,
}: MapActionControlsProps) {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    // Create custom Leaflet control
    const ActionControl = L.Control.extend({
      options: {
        position: 'topright',
      },

      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        // Prevent map interactions when clicking on controls
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        // Style the container
        container.style.backgroundColor = 'var(--bg-surface)';
        container.style.border = '1px solid var(--border-color)';
        container.style.borderRadius = '0';
        container.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '0';

        // Create buttons
        const buttons = [
          {
            id: 'locate-btn',
            icon: '📍',
            title: 'Locate me (L)',
            onClick: onLocate,
            active: false,
          },
          {
            id: 'cluster-btn',
            icon: '⬢',
            title: clusteringEnabled ? 'Disable clustering (C)' : 'Enable clustering (C)',
            onClick: onToggleClustering,
            active: clusteringEnabled,
          },
          {
            id: 'draw-btn',
            icon: '✏️',
            title: drawingEnabled ? 'Disable drawing (D)' : 'Enable drawing (D)',
            onClick: onToggleDrawing,
            active: drawingEnabled,
          },
        ];

        buttons.forEach((btn, index) => {
          const button = L.DomUtil.create('button', '', container);
          button.id = btn.id;
          button.innerHTML = btn.icon;
          button.title = btn.title;
          button.style.cssText = `
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-bottom: ${index < buttons.length - 1 ? '1px solid var(--border-color)' : 'none'};
            background-color: ${btn.active ? 'var(--bg-primary)' : 'var(--bg-surface)'};
            color: ${btn.active ? 'var(--accent-primary)' : 'var(--text-muted)'};
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s ease;
            padding: 0;
            outline: none;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          `;

          // Hover effect
          button.onmouseenter = () => {
            button.style.backgroundColor = 'var(--bg-primary)';
            button.style.opacity = '0.8';
          };
          button.onmouseleave = () => {
            button.style.backgroundColor = btn.active ? 'var(--bg-primary)' : 'var(--bg-surface)';
            button.style.opacity = '1';
          };

          // Click handler
          L.DomEvent.on(button, 'click', (e) => {
            L.DomEvent.stopPropagation(e);
            btn.onClick();
          });
        });

        return container;
      },
    });

    // Add control to map
    const control = new ActionControl();
    controlRef.current = control;
    control.addTo(map);

    // Cleanup
    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
      }
    };
  }, [map, onLocate, clusteringEnabled, onToggleClustering, drawingEnabled, onToggleDrawing]);

  // Update button states when props change
  useEffect(() => {
    const clusterBtn = document.getElementById('cluster-btn');
    const drawBtn = document.getElementById('draw-btn');

    if (clusterBtn) {
      clusterBtn.style.backgroundColor = clusteringEnabled ? 'var(--bg-primary)' : 'var(--bg-surface)';
      clusterBtn.style.color = clusteringEnabled ? 'var(--accent-primary)' : 'var(--text-muted)';
      clusterBtn.title = clusteringEnabled ? 'Disable clustering (C)' : 'Enable clustering (C)';
    }

    if (drawBtn) {
      drawBtn.style.backgroundColor = drawingEnabled ? 'var(--bg-primary)' : 'var(--bg-surface)';
      drawBtn.style.color = drawingEnabled ? 'var(--accent-primary)' : 'var(--text-muted)';
      drawBtn.title = drawingEnabled ? 'Disable drawing (D)' : 'Enable drawing (D)';
    }
  }, [clusteringEnabled, drawingEnabled]);

  return null;
}
