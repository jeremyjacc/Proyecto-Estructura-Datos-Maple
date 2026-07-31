import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { searchByText } from '../algorithms/searching.js';
import { mergeSort, quickSort } from '../algorithms/sorting.js';
import { Search, SortAsc, Star, DollarSign, Calendar, MapPin, ArrowRight, ChevronRight } from 'lucide-react';
import './ExplorePage.css';

const SORT_OPTIONS = [
  { key: 'name', label: 'Nombre (A-Z)', icon: SortAsc },
  { key: 'budget-asc', label: 'Presupuesto ↑', icon: DollarSign },
  { key: 'budget-desc', label: 'Presupuesto ↓', icon: DollarSign },
  { key: 'days', label: 'Días recomendados', icon: Calendar },
];

export default function ExplorePage() {
  const { allCities, continents, tree, loading } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cityKey } = useParams();

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const activeContinent = searchParams.get('continent') || 'all';

  // If a cityKey is present, show city detail
  if (cityKey) {
    return <CityDetail cityKey={cityKey} />;
  }

  // ─── FILTER: by continent ──────────────────────────────
  const filtered = useMemo(() => {
    let cities = allCities;

    if (activeContinent !== 'all') {
      cities = cities.filter(
        (c) => c.continent.toLowerCase() === continents.find((cont) => cont.key === activeContinent)?.name.toLowerCase()
      );
    }

    // SEARCH: using our custom linearSearch (searchByText)
    if (query.trim()) {
      cities = searchByText(cities, query, (c) => `${c.name} ${c.country}`);
    }

    return cities;
  }, [allCities, activeContinent, query, continents]);

  // ─── SORT: using our custom mergeSort/quickSort ────────
  const sorted = useMemo(() => {
    switch (sortBy) {
      case 'name':
        return quickSort(filtered, (a, b) => a.name.localeCompare(b.name));
      case 'budget-asc':
        return mergeSort(filtered, (a, b) => a.budgetPerDay - b.budgetPerDay);
      case 'budget-desc':
        return mergeSort(filtered, (a, b) => b.budgetPerDay - a.budgetPerDay);
      case 'days':
        return mergeSort(filtered, (a, b) => a.recommendedDays - b.recommendedDays);
      default:
        return filtered;
    }
  }, [filtered, sortBy]);

  if (loading) {
    return <div className="page"><div className="container loading-state"><div className="loading-spinner" /><p>Cargando destinos...</p></div></div>;
  }

  return (
    <div className="page explore-page">
      <div className="container">
        {/* ─── Header ──────────────────────────────────── */}
        <div className="explore-header animate-fade-in">
          <h1 className="explore-title">Explorar Destinos</h1>
          <p className="explore-subtitle">
            {sorted.length} {sorted.length === 1 ? 'ciudad' : 'ciudades'} disponibles
          </p>
        </div>

        {/* ─── Controls ────────────────────────────────── */}
        <div className="explore-controls">
          {/* Search bar — uses linearSearch internally */}
          <div className="input-wrapper explore-search">
            <Search size={18} />
            <input
              type="text"
              className="input"
              placeholder="Buscar ciudades o países..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              id="search-input"
            />
          </div>

          {/* Continent filter chips */}
          <div className="explore-filters">
            <button
              className={`chip ${activeContinent === 'all' ? 'active' : ''}`}
              onClick={() => setSearchParams({})}
              id="filter-all"
            >
              🌎 Todos
            </button>
            {continents.map((cont) => (
              <button
                key={cont.key}
                className={`chip ${activeContinent === cont.key ? 'active' : ''}`}
                onClick={() => setSearchParams({ continent: cont.key })}
                id={`filter-${cont.key}`}
              >
                {cont.emoji} {cont.name}
              </button>
            ))}
          </div>

          {/* Sort — uses mergeSort or quickSort */}
          <div className="explore-sort">
            <span className="sort-label">Ordenar:</span>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`chip ${sortBy === opt.key ? 'active' : ''}`}
                onClick={() => setSortBy(opt.key)}
                id={`sort-${opt.key}`}
              >
                <opt.icon size={14} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Breadcrumbs from Tree ───────────────────── */}
        {activeContinent !== 'all' && tree && (
          <div className="breadcrumbs">
            <button onClick={() => setSearchParams({})} className="breadcrumb-item">
              🌍 Mundo
            </button>
            <ChevronRight size={14} />
            <span className="breadcrumb-item active">
              {continents.find((c) => c.key === activeContinent)?.emoji}{' '}
              {continents.find((c) => c.key === activeContinent)?.name}
            </span>
          </div>
        )}

        {/* ─── City Grid ───────────────────────────────── */}
        {sorted.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron ciudades</p>
            <button className="btn btn-secondary" onClick={() => { setQuery(''); setSearchParams({}); }}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="city-grid stagger">
            {sorted.map((city) => (
              <button
                key={city.key}
                className="city-card glass"
                onClick={() => navigate(`/explore/${city.key}`)}
                id={`city-${city.key}`}
              >
                <div className="city-card-gradient" />
                <div className="city-card-content">
                  <div className="city-card-top">
                    <span className="city-country">{city.country}</span>
                    <span className="city-continent">{city.continent}</span>
                  </div>
                  <h3 className="city-name">{city.name}</h3>
                  <p className="city-desc">{city.description}</p>
                  <div className="city-meta">
                    <span className="badge badge-amber">
                      <DollarSign size={12} />${city.budgetPerDay}/día
                    </span>
                    <span className="badge badge-glass">
                      <Calendar size={12} />{city.recommendedDays} días
                    </span>
                  </div>
                  <div className="city-details-link">
                    <span>Ver detalles</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── CityDetail Sub-component ──────────────────────────── */
function CityDetail({ cityKey }) {
  const { tree, allCities, graph, boards } = useApp();
  const navigate = useNavigate();

  const city = allCities.find((c) => c.key === cityKey);
  if (!city) {
    return <div className="page"><div className="container"><p>Ciudad no encontrada.</p></div></div>;
  }

  // Get breadcrumb path from Tree
  const path = tree ? tree.getPath(cityKey) : [];

  // Get neighbors from Graph
  const neighbors = graph ? graph.getNeighbors(cityKey) : [];

  return (
    <div className="page city-detail-page">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs animate-fade-in">
          <button onClick={() => navigate('/explore')} className="breadcrumb-item">
            🌍 Mundo
          </button>
          {path.slice(1, -1).map((node) => (
            <span key={node.key}>
              <ChevronRight size={14} />
              <span className="breadcrumb-item">{node.data.name}</span>
            </span>
          ))}
          <ChevronRight size={14} />
          <span className="breadcrumb-item active">{city.name}</span>
        </div>

        {/* City Header */}
        <div className="city-detail-header animate-slide-up">
          <div className="city-detail-gradient" />
          <div className="city-detail-info">
            <span className="city-detail-country">{city.country} · {city.continent}</span>
            <h1 className="city-detail-name">{city.name}</h1>
            <p className="city-detail-desc">{city.description}</p>
            <div className="city-detail-badges">
              <span className="badge badge-amber"><DollarSign size={12} />${city.budgetPerDay}/día</span>
              <span className="badge badge-teal"><Calendar size={12} />{city.recommendedDays} días recomendados</span>
              <span className="badge badge-glass">💱 {city.currency}</span>
              <span className="badge badge-glass">🗣️ {city.language}</span>
              <span className="badge badge-glass">🌤️ {city.bestSeason}</span>
            </div>
          </div>
        </div>

        {/* Attractions */}
        <section className="detail-section">
          <h2 className="detail-section-title">🏛️ Atracciones</h2>
          <div className="detail-grid stagger">
            {city.attractions.map((item) => (
              <div key={item.key} className="place-card glass">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <div className="place-meta">
                  <span className="rating"><Star size={14} /> {item.rating}</span>
                  <span className="badge badge-glass">{item.price === 0 ? 'Gratis' : `$${item.price}`}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hotels */}
        <section className="detail-section">
          <h2 className="detail-section-title">🏨 Hoteles</h2>
          <div className="detail-grid stagger">
            {city.hotels.map((item) => (
              <div key={item.key} className="place-card glass">
                <div className="place-card-head">
                  <h4>{item.name}</h4>
                  <span className={`badge ${item.category === 'Lujo' ? 'badge-amber' : 'badge-glass'}`}>{item.category}</span>
                </div>
                <p>{item.description}</p>
                <div className="place-meta">
                  <span className="rating"><Star size={14} /> {item.rating}</span>
                  <span className="badge badge-teal">${item.pricePerNight}/noche</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Restaurants */}
        <section className="detail-section">
          <h2 className="detail-section-title">🍽️ Restaurantes</h2>
          <div className="detail-grid stagger">
            {city.restaurants.map((item) => (
              <div key={item.key} className="place-card glass">
                <div className="place-card-head">
                  <h4>{item.name}</h4>
                  <span className="badge badge-glass">{item.cuisine}</span>
                </div>
                <p>{item.description}</p>
                <div className="place-meta">
                  <span className="rating"><Star size={14} /> {item.rating}</span>
                  <span className="badge badge-glass">${item.pricePerPerson}/persona</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Connections from Graph */}
        {neighbors.length > 0 && (
          <section className="detail-section">
            <h2 className="detail-section-title">🗺️ Conexiones directas</h2>
            <p className="detail-section-sub">Ciudades conectadas en el grafo de rutas</p>
            <div className="connections-grid stagger">
              {neighbors.map((edge) => {
                const neighborCity = allCities.find((c) => c.key === edge.node);
                if (!neighborCity) return null;
                return (
                  <button
                    key={edge.node}
                    className="connection-card glass"
                    onClick={() => navigate(`/explore/${edge.node}`)}
                    id={`connection-${edge.node}`}
                  >
                    <div className="connection-info">
                      <h4>{neighborCity.name}</h4>
                      <span className="connection-country">{neighborCity.country}</span>
                    </div>
                    <div className="connection-data">
                      <span className="badge badge-amber">{edge.distance} km</span>
                      <span className="badge badge-teal">${edge.cost}</span>
                    </div>
                    <ArrowRight size={16} className="connection-arrow" />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <button className="btn btn-secondary" onClick={() => navigate('/explore')} style={{ marginTop: 24 }}>
          ← Volver a explorar
        </button>
      </div>
    </div>
  );
}
