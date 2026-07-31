import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { MapPin, ArrowRight, Sparkles } from 'lucide-react';
import './HomePage.css';

/** Featured cities to highlight on the hero section */
const FEATURED_KEYS = ['barcelona', 'tokio', 'marrakech', 'cdmx'];

export default function HomePage() {
  const { continents, allCities, loading } = useApp();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="page">
        <div className="container loading-state">
          <div className="loading-spinner" />
          <p>Cargando destinos...</p>
        </div>
      </div>
    );
  }

  const featured = FEATURED_KEYS
    .map((key) => allCities.find((c) => c.key === key))
    .filter(Boolean);

  return (
    <div className="page home-page">
      {/* ─── Hero Section ────────────────────────────────── */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content animate-fade-in">
            <div className="hero-badge badge badge-amber">
              <Sparkles size={14} />
              <span>Planifica tu próxima aventura</span>
            </div>
            <h1 className="hero-title">
              Descubre el mundo,<br />
              <span className="hero-accent">un viaje a la vez.</span>
            </h1>
            <p className="hero-subtitle">
              Maple te ayuda a explorar destinos, organizar itinerarios
              y visualizar cada detalle de tu próximo viaje — todo en un solo lugar.
            </p>
            <div className="hero-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/explore')}
                id="hero-explore-btn"
              >
                <MapPin size={18} />
                Explorar destinos
                <ArrowRight size={16} />
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/boards')}
                id="hero-boards-btn"
              >
                Mis Travel Boards
              </button>
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="hero-glow hero-glow-amber" />
        <div className="hero-glow hero-glow-teal" />
      </section>

      {/* ─── Featured Destinations ───────────────────────── */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Destinos destacados</h2>
            <p>Ciudades que nuestros viajeros más recomiendan</p>
          </div>

          <div className="featured-grid stagger">
            {featured.map((city) => (
              <button
                key={city.key}
                className="featured-card glass"
                onClick={() => navigate(`/explore/${city.key}`)}
                id={`featured-${city.key}`}
              >
                <div className="featured-gradient" />
                <div className="featured-info">
                  <span className="featured-country">{city.country}</span>
                  <h3 className="featured-name">{city.name}</h3>
                  <div className="featured-meta">
                    <span className="badge badge-glass">
                      ${city.budgetPerDay}/día
                    </span>
                    <span className="badge badge-glass">
                      {city.recommendedDays} días
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Continents ─────────────────────────────────── */}
      <section className="continents-section">
        <div className="container">
          <div className="section-header">
            <h2>Explora por continente</h2>
            <p>Elige un continente y descubre sus ciudades</p>
          </div>

          <div className="continents-grid stagger">
            {continents.map((cont) => (
              <button
                key={cont.key}
                className="continent-card glass"
                onClick={() => navigate(`/explore?continent=${cont.key}`)}
                id={`continent-${cont.key}`}
              >
                <span className="continent-emoji">{cont.emoji}</span>
                <h3>{cont.name}</h3>
                <p className="continent-desc">{cont.description}</p>
                <span className="continent-arrow">
                  <ArrowRight size={16} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{allCities.length}</span>
              <span className="stat-label">Ciudades</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{continents.length}</span>
              <span className="stat-label">Continentes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {allCities.reduce((sum, c) => sum + (c.attractions?.length || 0), 0)}
              </span>
              <span className="stat-label">Atracciones</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">6</span>
              <span className="stat-label">Estructuras de datos</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
