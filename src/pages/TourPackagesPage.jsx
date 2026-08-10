import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar, MapPin, CheckCircle2, ChevronRight, Play, X } from 'lucide-react';
import RouteGraph from '../components/graph/RouteGraph';
import { Queue } from '../structures/Queue.js';
import './TourPackagesPage.css';

export default function TourPackagesPage() {
  const { tourPackages, cities, savePackage, startTour } = useAppContext();
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  
  // States para la funcionalidad FIFO de Checkout
  const [checkoutQueue, setCheckoutQueue] = useState(null);
  const [checkoutTick, setCheckoutTick] = useState(0);
  const [ticket, setTicket] = useState(null);

  const selectedPackage = tourPackages.find(p => p.id === selectedPackageId);

  const handleBuyPackage = (pkg) => {
    const q = new Queue();
    q.enqueue({ id: 1, name: '🛂 Pasaporte' });
    q.enqueue({ id: 2, name: '📄 Antecedentes' });
    q.enqueue({ id: 3, name: '🏨 Hospedaje' });
    q.enqueue({ id: 4, name: '🛡️ Seguro' });
    setCheckoutQueue(q);
    setTicket(null);
    setCheckoutTick(0);
  };

  const handleFulfillRequirement = () => {
    if (!checkoutQueue || checkoutQueue.isEmpty()) return;
    checkoutQueue.dequeue();
    
    if (checkoutQueue.isEmpty()) {
      setTicket({
        id: `TKT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        pkgName: selectedPackage.name,
        status: 'En revisión',
        message: 'Tu solicitud será revisada en aproximadamente 10 minutos.'
      });
      setCheckoutQueue(null);
    } else {
      setCheckoutTick(prev => prev + 1);
    }
  };

  const handleSavePackage = (pkg) => {
    savePackage(pkg);
    alert('¡Paquete guardado en tus viajes!');
  };

  // --- Vista de Detalle de Paquete ---
  if (selectedPackage) {
    const pkgCities = selectedPackage.cities.map(cityKey => 
      cities.find(c => c.key === cityKey)
    ).filter(Boolean);

    return (
      <div className="package-detail-view animate-fade-in">
        <div className="container pt-4">
          <button 
            className="btn btn-ghost mb-4"
            onClick={() => setSelectedPackageId(null)}
          >
            &larr; Volver a Paquetes
          </button>
        </div>

        <div className="container detail-content">
          <div className="package-header text-center mb-5">
            <div className="badge badge-accent mb-3 mx-auto">
              {selectedPackage.duration} Días
            </div>
            <h1 className="display-title">{selectedPackage.name}</h1>
            <p className="subtitle">{selectedPackage.description}</p>
          </div>

          {/* Graph Visualization */}
          <div className="graph-section glass mb-5 p-4 rounded-xl">
            <h3 className="section-title mb-4">Mapa de Ruta</h3>
            <RouteGraph 
              route={selectedPackage.route} 
              cities={pkgCities} 
            />
          </div>

          <div className="package-grid">
            {/* Itinerary */}
            <div className="itinerary-section">
              <h3 className="section-title mb-4">Itinerario</h3>
              <div className="timeline">
                {pkgCities.map((city, index) => (
                  <div key={city.key} className="timeline-item">
                    <div className="timeline-marker">{index + 1}</div>
                    <div className="timeline-content glass">
                      <div className="timeline-img">
                        <img src={city.image || `/images/${city.key}.png`} alt={city.name} />
                      </div>
                      <div className="timeline-info">
                        <h4>{city.name}</h4>
                        <p><MapPin size={14} /> {city.country}</p>
                        <p className="text-muted text-sm mt-2">{city.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="package-sidebar">
              <div className="booking-card glass sticky">
                <div className="price-header">
                  <span className="price">${selectedPackage.price}</span>
                  <span className="unit">por persona</span>
                </div>
                
                <div className="services-list mb-4">
                  <h4 className="text-sm uppercase text-muted mb-3 font-bold">Incluido</h4>
                  {selectedPackage.services.map((service, i) => (
                    <div key={i} className="service-item">
                      <CheckCircle2 size={16} className="text-emerald" />
                      <span className="capitalize">{service.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>

                <div className="d-flex flex-column gap-3">
                  <button 
                    className="btn btn-accent btn-block btn-lg"
                    onClick={() => handleBuyPackage(selectedPackage)}
                  >
                    Comprar Viaje
                  </button>
                  <button 
                    className="btn btn-primary btn-block btn-lg"
                    onClick={() => handleSavePackage(selectedPackage)}
                  >
                    Guardar Paquete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Queue Modal (FIFO) */}
        {(checkoutQueue || ticket) && (
          <div className="modal-overlay animate-fade-in" onClick={() => { setCheckoutQueue(null); setTicket(null); }}>
            <div className="modal animate-slide-up" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Solicitud de Compra</h2>
                <button className="btn-icon btn-sm" onClick={() => { setCheckoutQueue(null); setTicket(null); }}><X size={18} /></button>
              </div>
              <div className="modal-body text-center">
                {ticket ? (
                  <div className="ticket-success">
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
                    <h3 className="text-emerald mb-2">Solicitud Generada</h3>
                    <div className="glass p-3 mb-3 text-left" style={{ borderRadius: 'var(--radius-md)' }}>
                      <p className="mb-2"><strong>Ticket ID:</strong> {ticket.id}</p>
                      <p className="mb-2"><strong>Viaje:</strong> {ticket.pkgName}</p>
                      <p className="mb-0"><strong>Estado:</strong> <span className="badge badge-accent" style={{ marginLeft: '8px' }}>{ticket.status}</span></p>
                    </div>
                    <p className="text-muted text-sm">{ticket.message}</p>
                    <button className="btn btn-primary mt-4 btn-block" onClick={() => setTicket(null)}>Aceptar</button>
                  </div>
                ) : (
                  <div className="checkout-queue-process">
                    <p className="mb-4 text-muted">Por favor completa los siguientes requisitos obligatorios.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                      
                      {checkoutQueue.toArray().map((req, i) => {
                        const isFront = i === 0;
                        return (
                          <div key={req.id} className={`glass d-flex align-center justify-between p-3`} style={{ 
                            borderRadius: 'var(--radius-md)', 
                            border: isFront ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                            opacity: isFront ? 1 : 0.6,
                            background: isFront ? 'var(--bg-secondary)' : 'var(--bg-tertiary)'
                          }}>
                            <span style={{ fontWeight: isFront ? 'bold' : 'normal', fontSize: '1.1rem' }}>{req.name}</span>
                            <span className="badge" style={{ background: isFront ? 'var(--accent)' : 'var(--bg-tertiary)', color: isFront ? '#fff' : 'var(--text-muted)' }}>
                              {isFront ? '← ACTIVO' : '← bloqueado'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="d-flex justify-between align-center" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                      <span className="text-sm font-bold text-muted">Requisito {5 - checkoutQueue.size()} de 4</span>
                      <button className="btn btn-accent" onClick={handleFulfillRequirement}>
                        Cumplido: {checkoutQueue.peek().name}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Vista Principal ---
  return (
    <div className="packages-page animate-fade-in">
      <div className="packages-header">
        <div className="container text-center">
          <div className="badge badge-white mb-4">Experiencias Seleccionadas</div>
          <h1 className="hero-title">Nuestros Paquetes de Viaje</h1>
          <p className="hero-subtitle mx-auto">
            Descubre nuestros itinerarios cuidadosamente seleccionados. Desde escapadas de fin de semana hasta aventuras de un mes, todo está planeado para ti.
          </p>
        </div>
      </div>

      <div className="container packages-content">
        <div className="grid-cards grid-cards-2 stagger">
          {tourPackages.map(pkg => (
            <div key={pkg.id} className="package-card glass">
              <div className="package-img">
                <img src={pkg.image || `/images/${pkg.image}.png`} alt={pkg.name} />
                <div className="package-duration">
                  <Calendar size={14} /> {pkg.duration} días
                </div>
              </div>
              <div className="package-content">
                <h3 className="package-title">{pkg.name}</h3>
                
                <div className="route-preview mb-3">
                  {pkg.cities.map((c, i) => (
                    <React.Fragment key={c}>
                      <span className="city-dot">{cities.find(city => city.key === c)?.name || c}</span>
                      {i < pkg.cities.length - 1 && <ChevronRight size={12} className="mx-1 text-muted" />}
                    </React.Fragment>
                  ))}
                </div>
                
                <p className="package-desc truncate-2">{pkg.description}</p>
                
                <div className="package-footer">
                  <div className="package-price">
                    <span className="label">Total Price</span>
                    <span className="amount">${pkg.price}</span>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setSelectedPackageId(pkg.id)}
                  >
                    Ver Itinerario
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
