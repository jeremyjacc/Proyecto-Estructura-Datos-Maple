import React, { useEffect, useRef, useState } from 'react';
import './RouteGraph.css';

export default function RouteGraph({ packageGraph, cities }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 550 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 550
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!packageGraph || packageGraph.isEmpty() || !cities || cities.length === 0) {
    return <div className="text-muted text-center p-4">No route data available</div>;
  }

  // Extraer nodos desde la instancia de Graph
  const graphNodes = packageGraph.getAllNodes();
  
  // Calcular posiciones (layout en red: centro y periferia)
  const padding = 60;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const radius = Math.min(centerX, centerY) - padding;

  // Desactivamos el centerNode para evitar que las aristas de los otros nodos crucen y tapen al nodo central.
  // Todos los nodos irán a la periferia (círculo).
  const outerNodes = graphNodes;
  
  const positionedNodes = [];

  outerNodes.forEach((gNode, index) => {
    // Distribuimos los nodos en un círculo alrededor del centro vacío
    const angle = (2 * Math.PI * index) / Math.max(outerNodes.length, 1) - Math.PI / 2;
    positionedNodes.push({
      id: gNode.key,
      label: gNode.data.name,
      image: gNode.data.image || `/images/${gNode.key}.png`,
      cx: centerX + radius * Math.cos(angle),
      cy: centerY + radius * Math.sin(angle)
    });
  });

  // Mapear aristas iterando sobre las conexiones reales del Grafo
  const edgesToDraw = [];

  graphNodes.forEach(gNode => {
    gNode.edges.forEach(edge => {
      const fromNode = positionedNodes.find(n => n.id === gNode.key);
      const toNode = positionedNodes.find(n => n.id === edge.node);
      
      if (fromNode && toNode) {
        const dx = toNode.cx - fromNode.cx;
        const dy = toNode.cy - fromNode.cy;
        const angle = Math.atan2(dy, dx);
        
        // Ajustamos start y end para que no se dibujen debajo del nodo
        const startRadius = 30;
        const endRadius = 36; // más margen para la flecha
        
        const startX = fromNode.cx + Math.cos(angle) * startRadius;
        const startY = fromNode.cy + Math.sin(angle) * startRadius;
        const endX = toNode.cx - Math.cos(angle) * endRadius;
        const endY = toNode.cy - Math.sin(angle) * endRadius;
        
        // Vector normal para curvar la línea (grafo dirigido)
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / (len || 1);
        const ny = dx / (len || 1);
        
        // Desplazamiento de la curva para que A->B y B->A formen un óvalo visible
        const curveOffset = 45;
        const cxControl = (startX + endX) / 2 + nx * curveOffset;
        const cyControl = (startY + endY) / 2 + ny * curveOffset;
        
        // Ubicación de la etiqueta de texto usando interpolación Bézier (t = 0.5, el punto medio de la curva)
        // Esto coloca la etiqueta en la "cresta" de la curva, alejándola del centro de la pantalla
        const t = 0.5;
        const mt = 1 - t;
        const labelCx = mt * mt * startX + 2 * mt * t * cxControl + t * t * endX;
        const labelCy = mt * mt * startY + 2 * mt * t * cyControl + t * t * endY;

        edgesToDraw.push({
          id: `${gNode.key}->${edge.node}`,
          from: gNode.key,
          to: edge.node,
          distance: edge.distance,
          cost: edge.cost,
          startX, startY,
          cxControl, cyControl,
          endX, endY,
          labelCx, labelCy
        });
      }
    });
  });

  return (
    <div className="route-graph-container" ref={containerRef}>
      <svg width={dimensions.width} height={dimensions.height} className="route-graph-svg">
        <defs>
          <marker 
            id="arrowhead" 
            markerWidth="10" 
            markerHeight="7" 
            refX="9" 
            refY="3.5" 
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent)" />
          </marker>
        </defs>

        {/* Draw Edges */}
        {edgesToDraw.map((edge, i) => (
          <g key={`edge-${edge.id}`} className="route-edge-group">
            <path 
              d={`M ${edge.startX} ${edge.startY} Q ${edge.cxControl} ${edge.cyControl} ${edge.endX} ${edge.endY}`}
              className="route-edge"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            
            {/* Unified Distance Badge */}
            <rect 
              x={edge.labelCx - 35} y={edge.labelCy - 12} 
              width="70" height="24" rx="12" 
              fill="var(--bg-primary)"
              stroke="var(--border-subtle)"
              strokeWidth="1"
              opacity="0.95"
            />
            <text x={edge.labelCx} y={edge.labelCy + 4} style={{ fontSize: '12px', fill: 'var(--text-primary)', textAnchor: 'middle', fontWeight: 'bold' }}>
              {edge.distance} km
            </text>
          </g>
        ))}

        {/* Draw Nodes */}
        {positionedNodes.map((node, i) => (
          <g key={`node-${node.id}`} className="route-node-group">
            <circle cx={node.cx} cy={node.cy} r="28" className="route-node-circle" />
            
            {/* Clip path for image */}
            <clipPath id={`clip-${node.id}`}>
              <circle cx={node.cx} cy={node.cy} r="24" />
            </clipPath>
            
            <image 
              x={node.cx - 24} y={node.cy - 24} 
              width="48" height="48" 
              href={node.image || `/images/${node.id}.png`}
              clipPath={`url(#clip-${node.id})`}
              preserveAspectRatio="xMidYMid slice"
            />
            
            <circle cx={node.cx} cy={node.cy} r="24" className="route-node-border" />
            
            {/* Fondo semitransparente para la etiqueta para evitar que choque con las líneas */}
            <rect 
              x={node.cx - 40} 
              y={node.cy + 32} 
              width="80" 
              height="20" 
              rx="4" 
              fill="var(--bg-primary)" 
              opacity="0.8"
            />
            <text 
              x={node.cx} 
              y={node.cy + 46} 
              className="route-node-label"
              style={{ fontWeight: 'bold' }}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
