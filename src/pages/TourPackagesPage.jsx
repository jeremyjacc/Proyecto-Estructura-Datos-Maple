import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar, MapPin, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import RouteGraph from '../components/graph/RouteGraph';
import './TourPackagesPage.css';

export default function TourPackagesPage() {
  const { tourPackages, cities, savePackage, startTour } = useAppContext();
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  const selectedPackage = tourPackages.find(p => p.id === selectedPackageId);

  const handleStartTour = (pkg) => {
    // Iniciar el tour: meter ciudades a la Queue
    startTour(pkg.cities);
    // TODO: en una implementación completa, esto podría redirigir a un modo "Tour Activo"
    alert(`Tour started! Added ${pkg.cities.length} cities to your active queue.`);
  };

  const handleSavePackage = (pkg) => {
    savePackage(pkg);
    alert('Package saved to your trips!');
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
            &larr; Back to Packages
          </button>
        </div>

        <div className="container detail-content">
          <div className="package-header text-center mb-5">
            <div className="badge badge-accent mb-3 mx-auto">
              {selectedPackage.duration} Days
            </div>
            <h1 className="display-title">{selectedPackage.name}</h1>
            <p className="subtitle">{selectedPackage.description}</p>
          </div>

          {/* Graph Visualization */}
          <div className="graph-section glass mb-5 p-4 rounded-xl">
            <h3 className="section-title mb-4">Route Map</h3>
            <RouteGraph 
              route={selectedPackage.route} 
              cities={pkgCities} 
            />
          </div>

          <div className="package-grid">
            {/* Itinerary */}
            <div className="itinerary-section">
              <h3 className="section-title mb-4">Itinerary</h3>
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
                  <span className="unit">per person</span>
                </div>
                
                <div className="services-list mb-4">
                  <h4 className="text-sm uppercase text-muted mb-3 font-bold">Included</h4>
                  {selectedPackage.services.map((service, i) => (
                    <div key={i} className="service-item">
                      <CheckCircle2 size={16} className="text-emerald" />
                      <span className="capitalize">{service.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>

                <div className="d-flex flex-column gap-3">
                  <button 
                    className="btn btn-primary btn-block btn-lg"
                    onClick={() => handleSavePackage(selectedPackage)}
                  >
                    Save Package
                  </button>
                  <button 
                    className="btn btn-secondary btn-block"
                    onClick={() => handleStartTour(selectedPackage)}
                  >
                    <Play size={16} /> Start Virtual Tour
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Vista Principal ---
  return (
    <div className="packages-page animate-fade-in">
      <div className="packages-header">
        <div className="container text-center">
          <div className="badge badge-white mb-4">Curated Experiences</div>
          <h1 className="hero-title">Tour Packages</h1>
          <p className="hero-subtitle mx-auto">
            Discover our hand-picked itineraries. From weekend getaways to month-long adventures, everything is planned for you.
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
                  <Calendar size={14} /> {pkg.duration} Days
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
                    View Itinerary
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
