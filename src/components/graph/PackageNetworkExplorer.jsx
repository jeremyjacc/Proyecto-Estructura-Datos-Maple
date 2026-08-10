import React, { useState } from 'react';
import RouteGraph from './RouteGraph';
import { Graph } from '../../structures/Graph.js';
import { MapPin } from 'lucide-react';

export default function PackageNetworkExplorer({ tourPackages, cities }) {
  const [selectedPkgId, setSelectedPkgId] = useState('');

  const selectedPkg = tourPackages?.find(p => p.id === selectedPkgId);
  
  let packageGraph = null;
  let pkgCities = [];

  if (selectedPkg) {
    packageGraph = new Graph();
    pkgCities = selectedPkg.cities.map(cityKey => 
      cities.find(c => c.key === cityKey)
    ).filter(Boolean);

    // Agregar vértices
    pkgCities.forEach(city => {
      if (!packageGraph.getNode(city.key)) {
        packageGraph.addNode(city.key, {
          name: city.name,
          country: city.country,
          image: city.image
        });
      }
    });

    // Agregar aristas reales
    if (selectedPkg.route) {
      selectedPkg.route.forEach(edge => {
        if (packageGraph.getNode(edge.from) && packageGraph.getNode(edge.to)) {
          packageGraph.addEdge(edge.from, edge.to, {
            distance: edge.distance,
            cost: edge.cost
          });
        }
      });
    }
  }

  return (
    <div className="graph-builder" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
      <div className="graph-toolbar" style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <select 
          className="select-input" 
          value={selectedPkgId} 
          onChange={(e) => setSelectedPkgId(e.target.value)}
          style={{ minWidth: '350px', padding: '10px 14px', fontSize: '1.1rem', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}
        >
          <option value="">[ Selecciona un Paquete Turístico ▼ ]</option>
          {tourPackages && tourPackages.map(pkg => (
            <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
          ))}
        </select>
      </div>
      
      <div style={{ flex: 1, position: 'relative', background: 'var(--bg-tertiary)', minHeight: '400px' }}>
        {packageGraph ? (
          <RouteGraph packageGraph={packageGraph} cities={pkgCities} />
        ) : (
          <div className="empty-state" style={{ height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <MapPin size={48} opacity={0.2} />
            <h3 style={{ marginTop: '16px' }}>Explorador Visual de Grafos</h3>
            <p>Selecciona un paquete arriba para visualizar su red de destinos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
