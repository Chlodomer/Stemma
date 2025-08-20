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
    showEvidence 
  } = useStemmaStore();

  const familyColors = {
    'A': '#e74c3c',
    'B': '#3498db', 
    'C': '#2ecc71',
    'D': '#f39c12',
    'archetype': '#95a5a6'
  };

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1200;
    const height = 800;

    // Create filtered edges based on current nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    const visibleEdges = data.edges.filter(edge => 
      nodeIds.has(edge.from) && nodeIds.has(edge.to)
    );

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(visibleEdges as any)
        .id((d: any) => d.id)
        .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    const g = svg.append('g')
      .attr('width', width)
      .attr('height', height);

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Create links
    const links = g.selectAll('.link')
      .data(visibleEdges)
      .enter()
      .append('line')
      .attr('class', 'link')
      .style('stroke', '#999')
      .style('stroke-opacity', 0.6)
      .style('stroke-width', (d: Edge) => Math.sqrt(d.confidence * 3))
      .style('stroke-dasharray', (d: Edge) => {
        if (d.type === 'contamination') return '5,5';
        if (d.type === 'inferred') return '10,3';
        return 'none';
      });

    // Create node groups
    const nodeGroups = g.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    // Add circles for nodes
    nodeGroups.append('circle')
      .attr('r', (d: NodeData) => {
        if (d.type === 'archetype') return 20;
        if (d.type === 'family') return d.isExpanded ? 15 : 25;
        return 12;
      })
      .style('fill', (d: NodeData) => {
        if (d.type === 'archetype') return familyColors.archetype;
        const familyId = d.familyId || d.id.replace('_family', '');
        return familyColors[familyId as keyof typeof familyColors] || '#95a5a6';
      })
      .style('stroke', (d: NodeData) => selectedNode === d.id ? '#000' : '#fff')
      .style('stroke-width', (d: NodeData) => selectedNode === d.id ? 3 : 2)
      .style('opacity', (d: NodeData) => {
        if (d.type === 'family' && d.isExpanded) return 0.7;
        return 1;
      });

    // Add labels
    nodeGroups.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .style('fill', '#333')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text((d: NodeData) => d.label);

    // Add evidence badges if enabled
    if (showEvidence) {
      nodeGroups.filter((d: NodeData) => Boolean(d.data && 'citations' in d.data))
        .append('circle')
        .attr('cx', 15)
        .attr('cy', -15)
        .attr('r', 8)
        .style('fill', '#e67e22')
        .style('stroke', '#fff')
        .style('stroke-width', 1);

      nodeGroups.filter((d: NodeData) => Boolean(d.data && 'citations' in d.data))
        .append('text')
        .attr('x', 15)
        .attr('y', -15)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .style('fill', '#fff')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text((d: NodeData) => d.data && 'citations' in d.data ? (d.data as any).citations.length : 0);
    }

    // Add click handlers
    nodeGroups.on('click', (event: MouseEvent, d: NodeData) => {
      event.stopPropagation();
      
      if (d.type === 'family') {
        toggleFamily(d.familyId!);
      } else {
        setSelectedNode(d.id === selectedNode ? null : d.id);
      }
    });

    // Add hover effects
    nodeGroups.on('mouseenter', (event: MouseEvent) => {
      d3.select(event.currentTarget as any)
        .select('circle')
        .style('stroke-width', 3)
        .style('stroke', '#000');
    })
    .on('mouseleave', (event: MouseEvent, d: NodeData) => {
      if (selectedNode !== d.id) {
        d3.select(event.currentTarget as any)
          .select('circle')
          .style('stroke-width', 2)
          .style('stroke', '#fff');
      }
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroups
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Clear selection on background click
    svg.on('click', () => {
      setSelectedNode(null);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, data.edges, expandedFamilies, selectedNode, showEvidence, setSelectedNode, toggleFamily]);

  return (
    <div className="stemma-graph">
      <svg
        ref={svgRef}
        width="100%"
        height="800"
        viewBox="0 0 1200 800"
        style={{ border: '1px solid #ddd', background: '#fafafa' }}
      />
    </div>
  );
};

export default StemmaGraph;