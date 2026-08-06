import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Search, MapPin, Calendar, Users, 
  ChevronRight, Star, ArrowRight, ShieldCheck, 
  Globe2, Clock
} from 'lucide-react';
import './HomePage.css';

export default function HomePage() {
  const { cities, continents, tourPackages, loading } = useAppContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Obtener top destinos (simulado usando popularidad o rating manual)
  // En la implementación real usaríamos los algoritmos de ordenamiento del DynamicArray
  const topDestinations = cities
    .filter(c => ['paris', 'tokio', 'roma', 'barcelona'].includes(c.key))
    .slice(0, 4);

  const featuredPackages = tourPackages.slice(0, 3);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading amazing destinations...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <img src="/images/hero-banner.png" alt="Breathtaking landscape" className="hero-img" />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="container hero-content animate-slide-up">
          <div className="badge badge-white mb-4">
            <Globe2 size={14} /> Discover the extraordinary
          </div>
          <h1 className="hero-title">
            Explore the world's<br/>most beautiful places
          </h1>
          <p className="hero-subtitle">
            Find your next adventure with our curated selection of exclusive destinations and tour packages.
          </p>

          <form className="hero-search glass" onSubmit={handleSearch}>
            <div className="search-input-group">
              <MapPin className="search-icon" size={20} />
              <div className="search-field">
                <label>Location</label>
                <input 
                  type="text" 
                  placeholder="Where do you want to go?" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="search-divider"></div>
            <div className="search-input-group hidden-mobile">
              <Calendar className="search-icon" size={20} />
              <div className="search-field">
                <label>Date</label>
                <input type="text" placeholder="Add dates" />
              </div>
            </div>
            <div className="search-divider hidden-mobile"></div>
            <div className="search-input-group hidden-mobile">
              <Users className="search-icon" size={20} />
              <div className="search-field">
                <label>Guests</label>
                <input type="text" placeholder="Add guests" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-search">
              <Search size={20} />
              <span>Search</span>
            </button>
          </form>
        </div>
      </section>

      {/* Stats / Trust Section */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-grid stagger">
            <div className="trust-item">
              <div className="trust-icon"><ShieldCheck size={28} /></div>
              <div>
                <h3>Safe Travels</h3>
                <p>Verified destinations and guides</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><Globe2 size={28} /></div>
              <div>
                <h3>50+ Destinations</h3>
                <p>Explore all continents</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><Star size={28} /></div>
              <div>
                <h3>12k+ Travelers</h3>
                <p>Top rated experiences</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><Clock size={28} /></div>
              <div>
                <h3>24/7 Support</h3>
                <p>We are here to help anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Destinations Section */}
      <section className="section top-destinations">
        <div className="container">
          <div className="section-header-flex">
            <div>
              <h2 className="section-title">Trending Destinations</h2>
              <p className="section-subtitle">Most popular choices for travelers this month</p>
            </div>
            <Link to="/explore" className="btn btn-secondary">
              View all <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid-cards grid-cards-4 stagger">
            {topDestinations.map(city => (
              <Link to={`/explore?city=${city.key}`} key={city.key} className="destination-card">
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
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Explore by Continent */}
      <section className="section explore-continents bg-tertiary">
        <div className="container">
          <div className="section-header center">
            <h2 className="section-title">Explore by Continent</h2>
            <p className="section-subtitle">Find your next destination by exploring different parts of the world</p>
          </div>

          <div className="continent-grid stagger">
            {continents.map(continent => (
              <Link 
                to={`/explore?continent=${continent.key}`} 
                key={continent.key} 
                className="continent-card"
              >
                <img src={continent.image || `/images/${continent.key}.png`} alt={continent.name} />
                <div className="continent-overlay">
                  <h3>{continent.emoji} {continent.name}</h3>
                  <span className="btn-circle"><ArrowRight size={16} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tour Packages */}
      <section className="section featured-packages">
        <div className="container">
          <div className="section-header-flex">
            <div>
              <h2 className="section-title">Curated Tour Packages</h2>
              <p className="section-subtitle">Complete travel itineraries planned by experts</p>
            </div>
            <Link to="/packages" className="btn btn-secondary">
              View all packages <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid-cards grid-cards-3 stagger">
            {featuredPackages.map(pkg => (
              <div key={pkg.id} className="package-card glass">
                <div className="package-img">
                  <img src={pkg.image || `/images/${pkg.image}.png`} alt={pkg.name} />
                  <div className="package-duration">
                    <Calendar size={14} /> {pkg.duration} Days
                  </div>
                </div>
                <div className="package-content">
                  <h3 className="package-title">{pkg.name}</h3>
                  <p className="package-route">
                    {pkg.cities.map(c => cities.find(city => city.key === c)?.name).join(' → ')}
                  </p>
                  <p className="package-desc truncate">{pkg.description}</p>
                  <div className="package-footer">
                    <div className="package-price">
                      <span className="label">From</span>
                      <span className="amount">${pkg.price}</span>
                    </div>
                    <Link to={`/packages`} className="btn btn-primary btn-sm">
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box glass">
            <div className="cta-content">
              <h2>Ready to start your journey?</h2>
              <p>Create your custom travel board, save your favorite destinations, and plan your perfect itinerary today.</p>
              <div className="cta-buttons">
                <Link to="/explore" className="btn btn-primary btn-lg">Start Exploring</Link>
                <Link to="/boards" className="btn btn-outline btn-lg" style={{borderColor: 'var(--accent)', color: 'var(--accent)'}}>My Saved Trips</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
