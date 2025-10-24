'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface Project {
  id: string;
  title: string;
  slug: string;
  categories?: string[];
  tags?: string[];
}

interface ProjectNodeGraphProps {
  projects: Project[];
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  slug: string;
  categories: string[];
  primaryCategory: string;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  strength: number;
}

// E-ink color palette - muted grayscale with subtle variations
const CATEGORY_COLORS: Record<string, string> = {
  '3D Printing': '#6b7280', // gray-500
  'Woodworking': '#6b7280', // gray-500
  'Software': '#6b7280', // gray-500
  'Electronics': '#6b7280', // gray-500
  'Design': '#6b7280', // gray-500
  'Metalworking': '#6b7280', // gray-500
  'Other': '#6b7280', // gray-500
  'Uncategorized': '#6b7280', // gray-500
};

export default function ProjectNodeGraph({ projects }: ProjectNodeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [isMounted, setIsMounted] = useState(false);
  const simulationRef = useRef<d3.Simulation<Node, Edge> | null>(null);

  // Physics constants - tuned for immersive, close-up effect
  const PHYSICS = {
    charge: -400, // Stronger repulsion for more spread
    linkDistance: 200, // Larger spacing for immersive effect
    linkStrength: 0.2, // Weaker links for looser structure
    collisionRadius: 40, // Larger collision radius
  };

  // Helper to get category color
  const getCategoryColor = (category: string): string => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS['Uncategorized'];
  };

  // Set actual dimensions after hydration to avoid mismatch
  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    setIsMounted(true);
  }, []);

  // Initialize D3 force simulation
  useEffect(() => {
    if (!svgRef.current || !gRef.current || projects.length === 0) return;

    const width = dimensions.width;
    const height = dimensions.height;

    // Create nodes
    const nodes: Node[] = projects.map((project) => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      categories: project.categories || [],
      primaryCategory: project.categories?.[0] || 'Uncategorized',
    }));

    // Create edges for projects with 2+ shared categories
    const edges: Edge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const shared = nodes[i].categories.filter((cat) =>
          nodes[j].categories.includes(cat)
        );
        if (shared.length >= 2) {
          edges.push({
            source: nodes[i].id,
            target: nodes[j].id,
            strength: shared.length,
          });
        }
      }
    }

    // Set up D3 force simulation
    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        'link',
        d3
          .forceLink<Node, Edge>(edges)
          .id((d) => d.id)
          .distance(PHYSICS.linkDistance)
          .strength(PHYSICS.linkStrength)
      )
      .force('charge', d3.forceManyBody().strength(PHYSICS.charge))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(PHYSICS.collisionRadius));

    simulationRef.current = simulation;

    // Select SVG elements
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    // Clear existing content
    g.selectAll('*').remove();

    // Create edge lines - subtle but visible for immersive effect
    const link = g
      .append('g')
      .attr('class', 'edges')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', '#a1a1a1')
      .attr('stroke-opacity', 0.12)
      .attr('stroke-width', 0.75);

    // Create node groups
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended) as any
      );

    // Add circles to nodes - larger for immersive effect
    node
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#6b7280')
      .attr('fill-opacity', 0.4)
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3);

    // Add labels (hidden by default, shown on hover) - minimal and subtle
    node
      .append('text')
      .attr('class', 'node-label')
      .attr('x', 8)
      .attr('y', 3)
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono)')
      .attr('fill', '#6b7280')
      .attr('opacity', 0)
      .text((d) => d.title);

    // Add subtle hover effects
    node
      .on('mouseenter', function (event, d) {
        setHoveredNode(d.id);
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', 8)
          .attr('fill-opacity', 0.6)
          .attr('stroke-opacity', 0.5);
        d3.select(this)
          .select('text')
          .transition()
          .duration(200)
          .attr('opacity', 0.8);
      })
      .on('mouseleave', function () {
        setHoveredNode(null);
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', 5)
          .attr('fill-opacity', 0.4)
          .attr('stroke-opacity', 0.3);
        d3.select(this)
          .select('text')
          .transition()
          .duration(200)
          .attr('opacity', 0);
      })
      .on('dblclick', function (event, d) {
        setFocusedNode((prev) => (prev === d.id ? null : d.id));
      })
      .on('click', function (event, d) {
        if (event.detail === 1) {
          window.location.href = `/projects/${d.slug}`;
        }
      });

    // Set up zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Update positions on each tick
    function ticked() {
      link
        .attr('x1', (d) => (d.source as Node).x ?? 0)
        .attr('y1', (d) => (d.source as Node).y ?? 0)
        .attr('x2', (d) => (d.target as Node).x ?? 0)
        .attr('y2', (d) => (d.target as Node).y ?? 0);

      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    }

    simulation.on('tick', ticked);

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [projects, dimensions]);

  // Handle window resize - fill entire viewport
  useEffect(() => {
    const handleResize = () => {
      setDimensions(prev => {
        // Only update if dimensions actually changed
        if (prev.width !== window.innerWidth || prev.height !== window.innerHeight) {
          return {
            width: window.innerWidth,
            height: window.innerHeight,
          };
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update visual highlighting based on focus - very subtle
  useEffect(() => {
    if (!gRef.current) return;

    const g = d3.select(gRef.current);

    // Get nodes and edges to highlight
    const nodesToHighlight = new Set<string>();

    if (focusedNode) {
      // Highlight focused node and its connections
      nodesToHighlight.add(focusedNode);
      g.selectAll<SVGLineElement, Edge>('.edges line').each(function(d) {
        const source = typeof d.source === 'string' ? d.source : d.source.id;
        const target = typeof d.target === 'string' ? d.target : d.target.id;
        if (source === focusedNode) nodesToHighlight.add(target);
        if (target === focusedNode) nodesToHighlight.add(source);
      });
    }

    // Apply very subtle highlighting to nodes
    g.selectAll<SVGGElement, Node>('.nodes g')
      .transition()
      .duration(300)
      .style('opacity', (d) => {
        if (nodesToHighlight.size === 0) return 1;
        return nodesToHighlight.has(d.id) ? 1 : 0.15;
      });

    // Apply very subtle highlighting to edges
    g.selectAll<SVGLineElement, Edge>('.edges line')
      .transition()
      .duration(300)
      .attr('stroke-opacity', (d) => {
        if (nodesToHighlight.size === 0) return 0.12;
        const source = typeof d.source === 'string' ? d.source : d.source.id;
        const target = typeof d.target === 'string' ? d.target : d.target.id;
        return nodesToHighlight.has(source) && nodesToHighlight.has(target) ? 0.3 : 0.04;
      });
  }, [focusedNode]);

  // Reset view
  const resetView = () => {
    if (svgRef.current && gRef.current) {
      const svg = d3.select(svgRef.current);
      const g = d3.select(gRef.current);
      svg
        .transition()
        .duration(750)
        .call(
          d3.zoom<SVGSVGElement, unknown>().transform as any,
          d3.zoomIdentity
        );
    }
    setFocusedNode(null);
  };

  return (
    <div className="w-full h-full">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          background: 'transparent',
          cursor: 'default',
          display: 'block',
          pointerEvents: 'auto',
        }}
      >
        {/* D3 will render nodes and edges into this group */}
        <g ref={gRef} />
      </svg>
    </div>
  );
}
