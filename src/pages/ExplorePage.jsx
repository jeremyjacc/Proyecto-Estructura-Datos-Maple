import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  searchByText, linearSearch 
} from '../algorithms/searching.js';
import { 
  mergeSort, quickSort 
} from '../algorithms/sorting.js';
import { 
  Search, Filter, MapPin, Star, X, ChevronRight, 
  ArrowLeft, Compass, CloudSun, Utensils, Info,
  Camera, Landmark, History
} from 'lucide-react';
import './ExplorePage.css';

export default function ExplorePage() {
  const { 
    cities, tree, continents, 
    navigationHistory, pushToHistory, popFromHistory,
    boards, addCityToBoard, createBoard
  } = useAppContext();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL State
  const initialQuery = searchParams.get('q') || '';
  const initialNodeKey = searchParams.get('node') || 'world';
  const initialCity = searchParams.get('city') || '';
  
  // Local State
  const [query, setQuery] = useState(initialQuery);
  const [activeNodeKey, setActiveNodeKey] = useState(initialNodeKey);
  const [sortBy, setSortBy] = useState('name');
  
  // Selected City Details State
  const [selectedCityKey, setSelectedCityKey] = useState(initialCity);
  const [cityDetails, setCityDetails] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  // Actualizar la URL cuando cambia el estado
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (query) params.set('q', query); else params.delete('q');
    if (activeNodeKey && activeNodeKey !== 'world') params.set('node', activeNodeKey); else params.delete('node');
    if (selectedCityKey) params.set('city', selectedCityKey); else params.delete('city');
    setSearchParams(params, { replace: true });
  }, [query, activeNodeKey, selectedCityKey, setSearchParams]);

  // Sincronizar si la URL cambia externamente (ej. desde Navbar)
  useEffect(() => {
    const urlCity = searchParams.get('city') || '';
    if (urlCity !== selectedCityKey) {
      setSelectedCityKey(urlCity);
    }
  }, [searchParams.get('city')]);

  // Manejar la selección de ciudad y el historial
  useEffect(() => {
    if (selectedCityKey) {
      const details = cities.find(c => c.key === selectedCityKey);
      if (details) {
        setCityDetails(details);
        // Construir breadcrumbs (Continent > Country > City) usando el Tree
        setBreadcrumbs([
          { label: 'Mundo', key: 'world' },
          { label: details.continent, key: details.continent },
          { label: details.country, key: details.country },
          { label: details.name, key: details.key }
        ]);
        
        // Agregar al historial de navegación (Stack) si no es el actual
        pushToHistory(selectedCityKey);
      }
    } else {
      setCityDetails(null);
    }
  }, [selectedCityKey, cities]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtrado y Ordenamiento
  const filteredAndSortedCities = useMemo(() => {
    let result = [...cities];

    // 1. Filtrar usando el Tree (Mundo -> Continente -> País -> Ciudad)
    if (activeNodeKey !== 'world') {
      const validCityKeys = new Set();
      // Recorremos desde el nodo activo hacia abajo
      tree.traverseFrom(activeNodeKey, (node) => {
        if (node.type === 'city') validCityKeys.add(node.key);
      });
      result = result.filter(c => validCityKeys.has(c.key));
    }

    // 2. Filtrar por búsqueda de texto
    if (query.trim()) {
      result = searchByText(result, query.trim(), c => `${c.name} ${c.country} ${c.description || ''} ${c.continent || ''}`);
    }

    // 3. Ordenar
    if (sortBy === 'name') {
      result = mergeSort(result, 'name');
    } else if (sortBy === 'price_asc') {
      result = mergeSort(result, 'budgetPerDay');
    } else if (sortBy === 'price_desc') {
      result = mergeSort(result, 'budgetPerDay').reverse();
    } else if (sortBy === 'popularity') {
      // Usar quicksort para ordenar por número
      result = quickSort(result, 'popularity').reverse(); 
    }

    return result;
  }, [cities, tree, query, activeNodeKey, sortBy]);

  // Navegar atrás en el historial
  const handleBackHistory = () => {
    const previousCity = popFromHistory();
    if (previousCity) {
      setSelectedCityKey(previousCity);
    } else {
      setSelectedCityKey('');
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setActiveNodeKey('world');
  };

  const handleAddToTrip = () => {
    if (!cityDetails) return;
    setShowSaveModal(true);
  };

  const handleSaveToBoard = (boardId) => {
    if (!cityDetails) return;
    const success = addCityToBoard(boardId, cityDetails.key);
    if (success) {
      setShowSaveModal(false);
    } else {
      alert(`${cityDetails.name} is already in this trip.`);
    }
  };

  const handleCreateAndSave = (e) => {
    e.preventDefault();
    if (!newBoardName.trim() || !cityDetails) return;
    const newBoard = createBoard(newBoardName, 'Custom trip');
    addCityToBoard(newBoard.id, cityDetails.key);
    setNewBoardName('');
    setShowSaveModal(false);
  };

  const saveModalNode = showSaveModal && cityDetails && (
    <div className="modal-overlay animate-fade-in" onClick={() => setShowSaveModal(false)}>
      <div className="modal animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Guardar {cityDetails.name}</h2>
          <button className="btn-icon" onClick={() => setShowSaveModal(false)}><X size={20} /></button>
        </div>
        
        <div className="modal-body" style={{ paddingBottom: '24px' }}>
          <p className="text-muted text-sm mb-4">Elige un tablero de viaje para agregar este destino o crea uno nuevo.</p>
          
          {/* List of existing boards */}
          {boards.size() > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {Array.from({ length: boards.size() }).map((_, i) => {
                const board = boards.get(i);
                const alreadyAdded = board.cities.recorrer && board.cities.recorrer().includes(cityDetails.key);
                return (
                  <button 
                    key={board.id} 
                    className="btn btn-secondary" 
                    style={{ justifyContent: 'space-between', opacity: alreadyAdded ? 0.6 : 1 }}
                    onClick={() => handleSaveToBoard(board.id)}
                    disabled={alreadyAdded}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: 'var(--accent)', color: 'white', padding: '1px 5px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        [{i}]
                      </span>
                      <strong>{board.name}</strong>
                    </div>
                    <span className="text-sm">{alreadyAdded ? 'Añadido ✓' : 'Guardar aquí'}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Create new board form */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>O crea un tablero nuevo:</h4>
            <form onSubmit={handleCreateAndSave} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Nombre del tablero..." 
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Crear y Guardar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Vista de Detalle de Ciudad ---
  if (cityDetails) {
    return (
      <div className="city-detail-view animate-fade-in">
        {/* Navigation Bar */}
        <div className="detail-nav container">
          <button className="btn btn-ghost" onClick={handleBackHistory}>
            <ArrowLeft size={18} /> Volver
          </button>
          
          <div className="breadcrumbs hidden-mobile">
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={bc.key}>
                <span className="breadcrumb-item">{bc.label}</span>
                {idx < breadcrumbs.length - 1 && <ChevronRight size={14} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Hero Image */}
        <div className="detail-hero">
          <img src={cityDetails.image} alt={cityDetails.name} className="detail-hero-img" />
          <div className="detail-hero-content container">
            <div className="badge badge-white mb-4">
              <MapPin size={14} /> {cityDetails.country}, {cityDetails.continent}
            </div>
            <h1>{cityDetails.name}</h1>
            <p className="detail-hero-desc">{cityDetails.description}</p>
          </div>
        </div>

        {/* Content Container */}
        <div className="container detail-content">
          <div className="detail-grid">
            
            {/* Main Column */}
            <div className="detail-main">
              
              {/* Info Cards */}
              <div className="info-cards-grid">
                <div className="info-card glass">
                  <CloudSun className="info-icon" />
                  <h4>Clima</h4>
                  <p>{cityDetails.climate || 'Varies by season'}</p>
                </div>
                <div className="info-card glass">
                  <Utensils className="info-icon" />
                  <h4>Gastronomía</h4>
                  <p>{cityDetails.gastronomy || 'Local delicacies'}</p>
                </div>
                <div className="info-card glass">
                  <Info className="info-icon" />
                  <h4>Mejor Época</h4>
                  <p>{cityDetails.bestSeason}</p>
                </div>
              </div>

              {/* Landmarks */}
              {cityDetails.landmarks && cityDetails.landmarks.length > 0 && (
                <section className="detail-section">
                  <h3><Landmark size={20} /> Top Landmarks</h3>
                  <div className="landmarks-list">
                    {cityDetails.landmarks.map((l, i) => (
                      <div key={i} className="landmark-chip">
                        <Camera size={14} /> {l}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Attractions (Data from Tree) */}
              {cityDetails.attractions && cityDetails.attractions.length > 0 && (
                <section className="detail-section">
                  <h3>Popular Attractions</h3>
                  <div className="attractions-grid">
                    {cityDetails.attractions.map(attr => (
                      <div key={attr.key} className="attraction-card">
                        <div className="attr-header">
                          <h4>{attr.name}</h4>
                          <span className="attr-rating"><Star size={12} weight="fill"/> {attr.rating}</span>
                        </div>
                        <p>{attr.description}</p>
                        <span className="attr-price">{attr.price > 0 ? `$${attr.price}` : 'Free'}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>

            {/* Sidebar Column */}
            <div className="detail-sidebar">
              <div className="booking-card glass">
                <div className="booking-header">
                  <div>
                    <span className="price">${cityDetails.budgetPerDay}</span>
                    <span className="unit">/ day</span>
                  </div>
                  <div className="rating">
                    <Star size={14} weight="fill" /> {cityDetails.popularity / 20}
                  </div>
                </div>
                
                <div className="booking-details">
                  <div className="detail-row">
                    <span>Currency</span>
                    <strong>{cityDetails.currency}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Language</span>
                    <strong>{cityDetails.language}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Rec. Duration</span>
                    <strong>{cityDetails.recommendedDays} days</strong>
                  </div>
                </div>

                <button className="btn btn-primary btn-block btn-lg" onClick={handleAddToTrip}>
                  Add to My Trips
                </button>
              </div>
            </div>

          </div>
        </div>
        {saveModalNode}
      </div>
    );
  }

  // --- Vista Principal de Exploración ---
  return (
    <div className="explore-page animate-fade-in">
      <div className="explore-header bg-dark">
        <div className="container">
          <h1 className="hero-title">Inspiración de Viaje</h1>
          <p className="hero-subtitle">Encuentra tu próxima aventura usando nuestros filtros de destinos inteligentes.</p>
          
          <div className="search-bar-wrapper">
            <div className="search-bar">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Buscar destinos, países..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button className="clear-btn" onClick={handleClearSearch}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container explore-content">
        <div className="explore-layout">
          
          {/* Sidebar Filters - Tree Hierarchy Navigation */}
          <aside className="explore-sidebar">
            <div className="filter-group">
              <h3><Compass size={18} /> Destinos</h3>
              
              {activeNodeKey !== 'world' && (
                <button 
                  className="btn btn-ghost btn-sm mb-3" 
                  style={{ padding: '0 8px', color: 'var(--text-secondary)' }}
                  onClick={() => {
                    const parent = tree.getParent(activeNodeKey);
                    setActiveNodeKey(parent ? parent.key : 'world');
                  }}
                >
                  <ArrowLeft size={14} style={{ marginRight: 6 }} /> 
                  Volver a {tree.getParent(activeNodeKey) ? tree.getParent(activeNodeKey).data.name : 'Mundo'}
                </button>
              )}

              <div className="filter-options">
                <button 
                  className={`filter-btn ${activeNodeKey === 'world' ? 'active' : ''}`}
                  onClick={() => setActiveNodeKey('world')}
                >
                  🌍 Todos los destinos
                </button>
                {tree.getChildren(activeNodeKey).map(childNode => (
                  <button 
                    key={childNode.key}
                    className="filter-btn"
                    onClick={() => {
                      if (childNode.type === 'city') {
                        setSelectedCityKey(childNode.key);
                      } else {
                        setActiveNodeKey(childNode.key);
                      }
                    }}
                  >
                    {childNode.data.emoji && <span className="emoji">{childNode.data.emoji}</span>}
                    {childNode.data.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Results */}
          <main className="explore-results">
            <div className="results-header">
              <div className="results-count">
                Mostrando <strong>{filteredAndSortedCities.length}</strong> destinos
              </div>
              
              <div className="sort-dropdown">
                <Filter size={16} />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="select-input"
                >
                  <option value="name">Nombre (A-Z)</option>
                  <option value="popularity">Más Populares</option>
                  <option value="price_asc">Precio (Menor a Mayor)</option>
                  <option value="price_desc">Precio (Mayor a Menor)</option>
                </select>
              </div>
            </div>

            {filteredAndSortedCities.length > 0 ? (
              <>
                <h3 className="section-title mb-4">Destacados</h3>
                <div className="grid-cards grid-cards-3">
                  {filteredAndSortedCities.map((city, index) => (
                  <div 
                    key={city.key} 
                    className="destination-card animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedCityKey(city.key)}
                  >
                    <div className="card-img-wrapper">
                      <img src={city.image || `/images/${city.key}.png`} alt={city.name} />
                      <div className="card-badge">
                        <Star size={12} weight="fill" /> {city.popularity / 20}
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="card-header">
                        <h3>{city.name}</h3>
                        <span className="card-price">${city.budgetPerDay}<small>/day</small></span>
                      </div>
                      <p className="card-location"><MapPin size={14} /> {city.country}, {city.continent}</p>
                    </div>
                  </div>
                ))}
              </div>
              </>
            ) : (
              <div className="empty-state">
                <MapPin size={48} opacity={0.2} />
                <h3>No se encontraron destinos</h3>
                <p>Intenta ajustar tu búsqueda o filtros.</p>
                <button className="btn btn-secondary mt-4" onClick={handleClearSearch}>
                  Limpiar todos los filtros
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
      {saveModalNode}
    </div>
  );
}
