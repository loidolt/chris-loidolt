'use client';

import { useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SeedContent } from '@/lib/seed/types';

// Dynamic import to avoid SSR issues with D3
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

interface SeedNetworkProps {
  seeds: SeedContent[];
  currentSeed?: string;
}

interface GraphNode {
  id: string;
  name: string;
  type: 'project' | 'experiment' | 'note' | 'writing';
  stage: 'seedling' | 'budding' | 'evergreen' | 'perennial';
  val: number;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

const typeColors = {
  project: '#3b82f6',
  experiment: '#8b5cf6',
  note: '#f59e0b',
  writing: '#10b981',
};

const stageSize = {
  seedling: 4,
  budding: 6,
  evergreen: 8,
  perennial: 10,
};

export function SeedNetwork({ seeds, currentSeed }: SeedNetworkProps) {
  const graphRef = useRef<any>(null);

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // Create nodes
    seeds.forEach(seed => {
      const node: GraphNode = {
        id: seed.slug,
        name: seed.meta.title,
        type: seed.meta.type,
        stage: seed.meta.stage,
        val: stageSize[seed.meta.stage],
      };
      nodes.push(node);
      nodeMap.set(seed.slug, node);
    });

    // Create links based on connections and shared tags
    seeds.forEach(seed => {
      // Direct connections
      seed.meta.connections?.forEach(connectionSlug => {
        if (nodeMap.has(connectionSlug)) {
          links.push({
            source: seed.slug,
            target: connectionSlug,
            value: 3, // Strong connection
          });
        }
      });

      // Tag-based connections
      if (seed.meta.tags) {
        seeds.forEach(otherSeed => {
          if (seed.slug !== otherSeed.slug && otherSeed.meta.tags && seed.meta.tags) {
            const sharedTags = seed.meta.tags.filter(tag => 
              otherSeed.meta.tags!.includes(tag)
            );
            
            if (sharedTags.length > 0) {
              // Check if link already exists
              const existingLink = links.find(
                link => 
                  (link.source === seed.slug && link.target === otherSeed.slug) ||
                  (link.source === otherSeed.slug && link.target === seed.slug)
              );
              
              if (!existingLink) {
                links.push({
                  source: seed.slug,
                  target: otherSeed.slug,
                  value: sharedTags.length, // Weight by number of shared tags
                });
              }
            }
          }
        });
      }
    });

    return { nodes, links };
  }, [seeds]);

  useEffect(() => {
    if (currentSeed) {
      // Center graph on current seed if needed
    }
  }, [currentSeed]);

  if (seeds.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Seed Connection Network</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height: '600px' }}>
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeId="id"
            nodeLabel="name"
            nodeColor={(node: any) => typeColors[node.type as keyof typeof typeColors]}
            nodeVal="val"
            linkWidth={(link: any) => Math.sqrt(link.value)}
            linkColor={() => '#6b7280'}
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

              // Draw node
              ctx.fillStyle = typeColors[node.type as keyof typeof typeColors];
              ctx.beginPath();
              ctx.arc(node.x!, node.y!, node.val, 0, 2 * Math.PI, false);
              ctx.fill();

              // Draw label background
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.fillRect(
                node.x! - bckgDimensions[0] / 2,
                node.y! - bckgDimensions[1] / 2,
                bckgDimensions[0],
                bckgDimensions[1]
              );

              // Draw label
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#1f2937';
              ctx.fillText(label, node.x!, node.y!);

              // Highlight current seed
              if (node.id === currentSeed) {
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(node.x!, node.y!, node.val + 4, 0, 2 * Math.PI, false);
                ctx.stroke();
              }
            }}
            onNodeClick={(node: any) => {
              window.location.href = `/forest/${node.id}`;
            }}
            enableZoomInteraction={true}
            enablePanInteraction={true}
          />
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Experiments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Notes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Writing</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}