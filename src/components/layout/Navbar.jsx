import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Map, Briefcase, Menu, X, Plane, Search } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/', icon: <Compass size={18} /> },
    { name: 'Destinations', path: '/explore', icon: <Map size={18} /> },
    { name: 'Packages', path: '/packages', icon: <Plane size={18} /> },
    { name: 'Saved Trips', path: '/boards', icon: <Briefcase size={18} /> },
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
          </ul>
        </nav>

        {/* Actions */}
        <div className="navbar-actions desktop-actions">
          <div className="search-pill">
            <Search size={16} />
            <span>Search destinations...</span>
          </div>
          <Link to="/explore" className="btn btn-primary btn-sm">
            Book Now
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
              Book Now
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
