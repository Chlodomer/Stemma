import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useStemmaStore } from '../stores/stemmaStore';
import { NodeData, Edge } from '../types';

const StemmaGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const {
    nodes,
    data,
    expandedFamilies,
    selectedNode,
    setSelectedNode,
    toggleFamily,
    showEvidence,
    layoutMode
  } = useStemmaStore();

  const familyColors: Record<string, string> = {
    'A': '#c47a4a',
    'B': '#5d7285',
    'C': '#7a8a5c',
    'D': '#9a8b7a',
    'archetype': '#4a4a4a'
  };

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1200;
    const height = 800;

    // Create filtered edges mapped to D3's source/target format
    const nodeIds = new Set(nodes.map(n => n.id));
    const visibleEdges = data.edges
      .filter(edge => nodeIds.has(edge.from) && nodeIds.has(edge.to))
      .map(edge => ({ ...edge, source: edge.from, target: edge.to }));

    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom as any);

    // Choose layout
    if (layoutMode === 'tree') {
      renderTreeLayout(g, nodes, visibleEdges, width, height);
    } else {
      renderNetworkLayout(g, svg, nodes, visibleEdges, width, height);
    }

    // Clear selection on background click
    svg.on('click', () => {
      setSelectedNode(null);
    });
  }, [nodes, data.edges, expandedFamilies, selectedNode, showEvidence, layoutMode, setSelectedNode, toggleFamily]);

  // --- Shared rendering helpers ---

  function getFillColor(d: NodeData): string {
    if (d.type === 'archetype') return familyColors.archetype;
    const familyId = d.familyId || d.id.replace('_family', '');
    return familyColors[familyId] || '#4a4a4a';
  }

  function getNodeRadius(d: NodeData): number {
    if (d.type === 'archetype') return 20;
    if (d.type === 'family') return d.isExpanded ? 15 : 25;
    return 12;
  }

  function applyNodeAppearance(nodeGroups: d3.Selection<any, NodeData, any, any>) {
    nodeGroups.append('circle')
      .attr('r', (d: NodeData) => getNodeRadius(d))
      .style('fill', (d: NodeData) => getFillColor(d))
      .style('stroke', (d: NodeData) => selectedNode === d.id ? '#1a1a1a' : '#fafaf8')
      .style('stroke-width', (d: NodeData) => selectedNode === d.id ? 3 : 2)
      .style('opacity', (d: NodeData) => d.type === 'family' && d.isExpanded ? 0.7 : 1);

    nodeGroups.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .style('fill', '#2d2d2d')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text((d: NodeData) => d.label);

    if (showEvidence) {
      nodeGroups.filter((d: NodeData) => Boolean(d.data && 'citations' in d.data))
        .append('circle')
        .attr('cx', 15).attr('cy', -15).attr('r', 8)
        .style('fill', '#d4652a').style('stroke', '#fff').style('stroke-width', 1);

      nodeGroups.filter((d: NodeData) => Boolean(d.data && 'citations' in d.data))
        .append('text')
        .attr('x', 15).attr('y', -15).attr('dy', '.35em').attr('text-anchor', 'middle')
        .style('fill', '#fff').style('font-size', '10px').style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text((d: NodeData) => d.data && 'citations' in d.data ? (d.data as any).citations.length : 0);
    }
  }

  function applyLinkAppearance(links: d3.Selection<any, any, any, any>) {
    links
      .style('stroke', '#9a9590')
      .style('stroke-opacity', 0.6)
      .style('stroke-width', (d: any) => Math.sqrt(d.confidence * 3))
      .style('stroke-dasharray', (d: any) => {
        if (d.type === 'contamination') return '5,5';
        if (d.type === 'inferred') return '10,3';
        return 'none';
      });
  }

  function applyInteraction(nodeGroups: d3.Selection<any, NodeData, any, any>) {
    nodeGroups.on('click', (event: MouseEvent, d: NodeData) => {
      event.stopPropagation();
      if (d.type === 'family') {
        toggleFamily(d.familyId!);
        setSelectedNode(d.id);
      } else {
        setSelectedNode(d.id === selectedNode ? null : d.id);
      }
    });

    nodeGroups.on('mouseenter', (event: MouseEvent) => {
      d3.select(event.currentTarget as any).select('circle')
        .style('stroke-width', 3).style('stroke', '#1a1a1a');
    })
    .on('mouseleave', (event: MouseEvent, d: NodeData) => {
      if (selectedNode !== d.id) {
        d3.select(event.currentTarget as any).select('circle')
          .style('stroke-width', 2).style('stroke', '#fafaf8');
      }
    });
  }

  // --- Network (force-directed) layout ---

  function renderNetworkLayout(
    g: d3.Selection<any, any, any, any>,
    svg: d3.Selection<any, any, any, any>,
    nodes: NodeData[],
    visibleEdges: any[],
    width: number,
    height: number
  ) {
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(visibleEdges as any).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    const links = g.selectAll('.link')
      .data(visibleEdges).enter().append('line').attr('class', 'link');
    applyLinkAppearance(links);

    const nodeGroups = g.selectAll('.node')
      .data(nodes).enter().append('g').attr('class', 'node').style('cursor', 'pointer');
    applyNodeAppearance(nodeGroups);
    applyInteraction(nodeGroups);

    simulation.on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
      nodeGroups.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Store cleanup ref
    svg.node().__simulation = simulation;
  }

  // --- Tree (hierarchical) layout ---

  function renderTreeLayout(
    g: d3.Selection<any, any, any, any>,
    nodes: NodeData[],
    visibleEdges: any[],
    width: number,
    height: number
  ) {
    // Build a hierarchy from the edges. Only use copy/inferred edges for the tree structure.
    // Contamination edges are drawn as cross-links after.
    const treeEdges = visibleEdges.filter((e: any) => e.type !== 'contamination');
    const crossEdges = visibleEdges.filter((e: any) => e.type === 'contamination');

    // Build parent map (each node's parent in the tree)
    const parentMap = new Map<string, string>();
    for (const edge of treeEdges) {
      const target = typeof edge.target === 'string' ? edge.target : edge.target.id;
      const source = typeof edge.source === 'string' ? edge.source : edge.source.id;
      if (!parentMap.has(target)) {
        parentMap.set(target, source);
      }
    }

    // Find root (archetype)
    const nodeMap = new Map<string, NodeData>();
    for (const n of nodes) nodeMap.set(n.id, n);

    const rootId = 'archetype';

    // Build d3 hierarchy data
    interface TreeNode {
      id: string;
      nodeData: NodeData;
      children: TreeNode[];
    }

    function buildTree(nodeId: string): TreeNode | null {
      const nd = nodeMap.get(nodeId);
      if (!nd) return null;

      const childIds = treeEdges
        .filter((e: any) => {
          const src = typeof e.source === 'string' ? e.source : e.source.id;
          return src === nodeId;
        })
        .map((e: any) => typeof e.target === 'string' ? e.target : e.target.id);

      const children: TreeNode[] = [];
      for (const cid of childIds) {
        const child = buildTree(cid);
        if (child) children.push(child);
      }

      return { id: nodeId, nodeData: nd, children };
    }

    const treeData = buildTree(rootId);
    if (!treeData) return;

    const root = d3.hierarchy(treeData, d => d.children);

    // Compute tree layout
    const treeLayout = d3.tree<TreeNode>()
      .size([width - 120, height - 160]);

    treeLayout(root);

    // Offset to center
    const offsetX = 60;
    const offsetY = 80;

    // Build a position lookup so we can draw cross-edges
    const posMap = new Map<string, { x: number; y: number }>();
    root.descendants().forEach(d => {
      // d3.tree assigns x (horizontal) and y (depth). We use x as horizontal, y as vertical.
      posMap.set(d.data.id, { x: (d as any).x + offsetX, y: (d as any).y + offsetY });
    });

    // Draw tree links (curved paths)
    const linkGen = d3.linkVertical<any, any>()
      .x((d: any) => d.x + offsetX)
      .y((d: any) => d.y + offsetY);

    // Map tree links to include edge data for styling
    const treeLinks = root.links().map(link => {
      const sourceId = link.source.data.id;
      const targetId = link.target.data.id;
      const edgeData = treeEdges.find((e: any) => {
        const src = typeof e.source === 'string' ? e.source : e.source.id;
        const tgt = typeof e.target === 'string' ? e.target : e.target.id;
        return src === sourceId && tgt === targetId;
      });
      return { ...link, edgeData };
    });

    const links = g.selectAll('.link')
      .data(treeLinks)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d: any) => linkGen(d))
      .attr('fill', 'none')
      .style('stroke', '#9a9590')
      .style('stroke-opacity', 0.6)
      .style('stroke-width', (d: any) => d.edgeData ? Math.sqrt(d.edgeData.confidence * 3) : 1)
      .style('stroke-dasharray', (d: any) => {
        if (!d.edgeData) return 'none';
        if (d.edgeData.type === 'inferred') return '10,3';
        return 'none';
      });

    // Draw contamination cross-links as dashed curves
    if (crossEdges.length > 0) {
      g.selectAll('.cross-link')
        .data(crossEdges)
        .enter()
        .append('line')
        .attr('class', 'cross-link')
        .attr('x1', (d: any) => {
          const id = typeof d.source === 'string' ? d.source : d.source.id;
          return posMap.get(id)?.x || 0;
        })
        .attr('y1', (d: any) => {
          const id = typeof d.source === 'string' ? d.source : d.source.id;
          return posMap.get(id)?.y || 0;
        })
        .attr('x2', (d: any) => {
          const id = typeof d.target === 'string' ? d.target : d.target.id;
          return posMap.get(id)?.x || 0;
        })
        .attr('y2', (d: any) => {
          const id = typeof d.target === 'string' ? d.target : d.target.id;
          return posMap.get(id)?.y || 0;
        })
        .style('stroke', '#d4652a')
        .style('stroke-opacity', 0.5)
        .style('stroke-width', (d: any) => Math.sqrt(d.confidence * 3))
        .style('stroke-dasharray', '5,5');
    }

    // Draw nodes at tree positions
    const nodeGroups = g.selectAll('.node')
      .data(root.descendants().map(d => ({
        ...d.data.nodeData,
        x: (d as any).x + offsetX,
        y: (d as any).y + offsetY
      })))
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer');

    applyNodeAppearance(nodeGroups);
    applyInteraction(nodeGroups);
  }

  return (
    <div className="stemma-graph">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid meet"
        style={{ background: '#f2f0ed' }}
      />
    </div>
  );
};

export default StemmaGraph;
