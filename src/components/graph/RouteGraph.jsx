import React, { useEffect, useRef, useState } from 'react';
import './RouteGraph.css';

export default function RouteGraph({ route, cities }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 200 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 240
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!route || route.length === 0 || !cities || cities.length === 0) {
    return <div className="text-muted text-center p-4">No route data available</div>;
  }

  // Extraer nodos únicos en orden de ruta
  const nodes = [];
  const nodeMap = new Map();

  // El primer nodo es el 'from' de la primera arista
  const firstCityKey = route[0].from;
  const firstCity = cities.find(c => c.key === firstCityKey);
  if (firstCity) {
    const node = { id: firstCityKey, label: firstCity.name, image: firstCity.image };
    nodes.push(node);
    nodeMap.set(firstCityKey, node);
  }

  // Agregar los nodos 'to'
  route.forEach(edge => {
    const city = cities.find(c => c.key === edge.to);
    if (city && !nodeMap.has(edge.to)) {
      const node = { id: edge.to, label: city.name, image: city.image };
      nodes.push(node);
      nodeMap.set(edge.to, node);
    }
  });

  // Calcular posiciones (layout horizontal)
  const padding = 60;
  const availableWidth = dimensions.width - (padding * 2);
  const step = nodes.length > 1 ? availableWidth / (nodes.length - 1) : 0;
  
  const positionedNodes = nodes.map((node, index) => ({
    ...node,
    cx: padding + (index * step),
    cy: dimensions.height / 2
  }));

  // Mapear aristas a coordenadas
  const edges = route.map(edge => {
    const fromNode = positionedNodes.find(n => n.id === edge.from);
    const toNode = positionedNodes.find(n => n.id === edge.to);
    return {
      ...edge,
      x1: fromNode ? fromNode.cx : 0,
      y1: fromNode ? fromNode.cy : 0,
      x2: toNode ? toNode.cx : 0,
      y2: toNode ? toNode.cy : 0,
      cx: fromNode && toNode ? (fromNode.cx + toNode.cx) / 2 : 0,
      cy: fromNode && toNode ? (fromNode.cy + toNode.cy) / 2 : 0
    };
  }).filter(e => e.x1 !== 0 && e.x2 !== 0);

  return (
    <div className="route-graph-container" ref={containerRef}>
      <svg width={dimensions.width} height={dimensions.height} className="route-graph-svg">
        
        {/* Draw Edges */}
        {edges.map((edge, i) => (
          <g key={`edge-${i}`} className="route-edge-group">
            <line 
              x1={edge.x1} y1={edge.y1} 
              x2={edge.x2} y2={edge.y2} 
              className="route-edge"
            />
            
            {/* Distance/Cost Badge */}
            <rect 
              x={edge.cx - 30} y={edge.cy - 12} 
              width="60" height="24" rx="12" 
              className="route-edge-badge"
            />
            <text x={edge.cx} y={edge.cy + 4} className="route-edge-text text-distance">
              {edge.distance} km
            </text>
            <text x={edge.cx} y={edge.cy - 18} className="route-edge-text text-cost">
              ${edge.cost}
            </text>
          </g>
        ))}

        {/* Draw Nodes */}
        {positionedNodes.map((node, i) => (
          <g key={`node-${node.id}`} className="route-node-group">
            <circle cx={node.cx} cy={node.cy} r="24" className="route-node-circle" />
            
            {/* Clip path for image */}
            <clipPath id={`clip-${node.id}`}>
              <circle cx={node.cx} cy={node.cy} r="20" />
            </clipPath>
            
            <image 
              x={node.cx - 20} y={node.cy - 20} 
              width="40" height="40" 
              href={node.image || `/images/${node.id}.png`}
              clipPath={`url(#clip-${node.id})`}
              preserveAspectRatio="xMidYMid slice"
            />
            
            <circle cx={node.cx} cy={node.cy} r="20" className="route-node-border" />
            
            <text 
              x={node.cx} 
              y={i % 2 === 0 ? node.cy + 45 : node.cy - 35} 
              className="route-node-label"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
