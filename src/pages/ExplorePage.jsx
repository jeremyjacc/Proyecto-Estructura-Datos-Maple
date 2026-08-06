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
  Camera, Landmark
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
  const initialContinent = searchParams.get('continent') || '';
  const initialCity = searchParams.get('city') || '';
  
  // Local State
  const [query, setQuery] = useState(initialQuery);
  const [activeContinent, setActiveContinent] = useState(initialContinent);
  const [sortBy, setSortBy] = useState('name');
  
  // Selected City Details State
  const [selectedCityKey, setSelectedCityKey] = useState(initialCity);
  const [cityDetails, setCityDetails] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Actualizar la URL cuando cambia el estado
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (activeContinent) params.set('continent', activeContinent);
    if (selectedCityKey) params.set('city', selectedCityKey);
    setSearchParams(params);
  }, [query, activeContinent, selectedCityKey, setSearchParams]);

  // Manejar la selección de ciudad y el historial
  useEffect(() => {
    if (selectedCityKey) {
      const details = cities.find(c => c.key === selectedCityKey);
      if (details) {
        setCityDetails(details);
        // Construir breadcrumbs (Continent > Country > City) usando el Tree
        setBreadcrumbs([
          { label: 'World', key: 'world' },
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

    // 1. Filtrar por continente (usando Linear Search simplificado)
    if (activeContinent) {
      const continentName = continents.find(c => c.key === activeContinent)?.name;
      if (continentName) {
        // En lugar de usar linearSearch que espera llave/valor exacto, hacemos un filter
        result = result.filter(c => c.continent === continentName);
      }
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
  }, [cities, continents, query, activeContinent, sortBy]);

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
    setActiveContinent('');
  };

  const handleAddToTrip = () => {
    if (!cityDetails) return;
    let targetBoardId;
    if (boards.size() === 0) {
      const newBoard = createBoard("My First Trip", "Automatically created trip board");
      targetBoardId = newBoard.id;
    } else {
      targetBoardId = boards.get(0).id;
    }
    const success = addCityToBoard(targetBoardId, cityDetails.key);
    if (success) {
      alert(`Added ${cityDetails.name} to your trip: ${boards.size() === 0 ? "My First Trip" : boards.get(0).name}`);
    } else {
      alert(`${cityDetails.name} is already in your trip.`);
    }
  };

  // --- Vista de Detalle de Ciudad ---
  if (cityDetails) {
    return (
      <div className="city-detail-view animate-fade-in">
        {/* Navigation Bar */}
        <div className="detail-nav container">
          <button className="btn btn-ghost" onClick={handleBackHistory}>
            <ArrowLeft size={18} /> Back
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
                  <h4>Climate</h4>
                  <p>{cityDetails.climate || 'Varies by season'}</p>
                </div>
                <div className="info-card glass">
                  <Utensils className="info-icon" />
                  <h4>Gastronomy</h4>
                  <p>{cityDetails.gastronomy || 'Local delicacies'}</p>
                </div>
                <div className="info-card glass">
                  <Info className="info-icon" />
                  <h4>Best Season</h4>
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
      </div>
    );
  }

  // --- Vista Principal de Exploración ---
  return (
    <div className="explore-page animate-fade-in">
      <div className="explore-header bg-dark">
        <div className="container">
          <h1>Explore Destinations</h1>
          <p>Find your next adventure from our curated list of amazing places.</p>
          
          <div className="search-bar-wrapper">
            <div className="search-bar">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Search cities, countries, or description..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button className="clear-btn" onClick={() => setQuery('')}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container explore-content">
        <div className="explore-layout">
          
          {/* Sidebar Filters */}
          <aside className="explore-sidebar">
            <div className="filter-group">
              <h3><Compass size={18} /> Continents</h3>
              <div className="filter-options">
                <button 
                  className={`filter-btn ${activeContinent === '' ? 'active' : ''}`}
                  onClick={() => setActiveContinent('')}
                >
                  All Destinations
                </button>
                {continents.map(c => (
                  <button 
                    key={c.key}
                    className={`filter-btn ${activeContinent === c.key ? 'active' : ''}`}
                    onClick={() => setActiveContinent(c.key)}
                  >
                    <span className="emoji">{c.emoji}</span> {c.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Results */}
          <main className="explore-results">
            <div className="results-header">
              <div className="results-count">
                Showing <strong>{filteredAndSortedCities.length}</strong> destinations
              </div>
              
              <div className="sort-dropdown">
                <Filter size={16} />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="select-input"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="popularity">Most Popular</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                </select>
              </div>
            </div>

            {filteredAndSortedCities.length > 0 ? (
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
            ) : (
              <div className="empty-state">
                <MapPin size={48} opacity={0.2} />
                <h3>No destinations found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
                <button className="btn btn-secondary mt-4" onClick={handleClearSearch}>
                  Clear Search
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
