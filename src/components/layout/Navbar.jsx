import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Map, Briefcase, Menu, X, Plane, Search, History } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { navigationHistory, cities } = useAppContext();
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historyRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar history si hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [historyRef]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Inicio', path: '/', icon: <Compass size={18} /> },
    { name: 'Destinos', path: '/explore', icon: <Map size={18} /> },
    { name: 'Paquetes', path: '/packages', icon: <Plane size={18} /> },
    { name: 'Mis Viajes', path: '/boards', icon: <Briefcase size={18} /> },
  ];

  const isHome = location.pathname === '/';

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''} ${isHome && !isScrolled ? 'transparent' : ''}`}>
      <div className="navbar-container container">
        
        <Link to="/" className="navbar-brand">
          <div className="logo-icon">
            <Plane size={24} weight="fill" />
          </div>
          <span className="logo-text">Travel Explorer</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-nav desktop-nav">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.path} className="nav-item">
                <Link 
                  to={link.path} 
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            
            {/* History Dropdown */}
            <li className="nav-item" ref={historyRef} style={{ position: 'relative' }}>
              <button 
                className="nav-link" 
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}
              >
                <History size={16} /> Historial
              </button>

              {isHistoryOpen && (
                <div className="history-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '12px',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  width: '280px',
                  padding: '16px',
                  zIndex: 100,
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  textAlign: 'left'
                }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                    Pila de Navegación
                  </h4>
                  <div className="history-stack" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {navigationHistory.toArray().length > 0 ? (
                      [...navigationHistory.toArray()].reverse().map((cityKey, idx) => {
                        const city = cities.find(c => c.key === cityKey);
                        return (
                          <div 
                            key={`${cityKey}-${idx}`} 
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px',
                              background: idx === 0 ? 'var(--accent-light)' : 'var(--bg-secondary)',
                              borderLeft: idx === 0 ? '3px solid var(--accent)' : 'none',
                              borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onClick={() => {
                              navigate(`/explore?city=${cityKey}`);
                              setIsHistoryOpen(false);
                            }}
                            onMouseOver={(e) => {
                              if (idx !== 0) e.currentTarget.style.background = 'var(--border-default)';
                            }}
                            onMouseOut={(e) => {
                              if (idx !== 0) e.currentTarget.style.background = 'var(--bg-secondary)';
                            }}
                          >
                            <span style={{ 
                              fontSize: '0.75rem', fontWeight: 700, color: idx === 0 ? 'var(--accent)' : 'var(--text-muted)',
                              background: 'white', padding: '2px 6px', borderRadius: '12px', minWidth: '24px', textAlign: 'center'
                            }}>
                              {navigationHistory.toArray().length - idx}
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                              {city ? city.name : cityKey}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                        El historial está vacío.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </li>
          </ul>
        </nav>

        {/* Actions */}
        <div className="navbar-actions desktop-actions">
          <div className="search-pill">
            <Search size={16} />
            <span>Buscar destinos...</span>
          </div>
          <Link to="/explore" className="btn btn-primary btn-sm">
            Reservar Ahora
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          <ul className="mobile-nav-list">
            {navLinks.map((link) => (
              <li key={link.path} className="mobile-nav-item">
                <Link 
                  to={link.path} 
                  className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mobile-nav-actions">
            <Link to="/explore" className="btn btn-primary btn-block">
              Reservar Ahora
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
