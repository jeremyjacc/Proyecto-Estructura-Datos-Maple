import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Hash, Share2, MessageCircle, Globe } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <Plane size={24} weight="fill" />
            <span>Travel Explorer</span>
          </Link>
          <p className="footer-desc">
            Descubre los destinos más increíbles del mundo. Planifica, reserva y explora con confianza.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link"><Hash size={20} /></a>
            <a href="#" className="social-link"><Share2 size={20} /></a>
            <a href="#" className="social-link"><MessageCircle size={20} /></a>
            <a href="#" className="social-link"><Globe size={20} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-title">Explorar</h4>
          <ul className="footer-list">
            <li><Link to="/explore">Destinos</Link></li>
            <li><Link to="/packages">Paquetes de Viaje</Link></li>
            <li><Link to="/boards">Mis Viajes Guardados</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-title">Compañía</h4>
          <ul className="footer-list">
            <li><a href="#">Sobre Nosotros</a></li>
            <li><a href="#">Empleos</a></li>
            <li><a href="#">Guías de Viaje</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-title">Legal</h4>
          <ul className="footer-list">
            <li><a href="#">Términos de Servicio</a></li>
            <li><a href="#">Política de Privacidad</a></li>
            <li><a href="#">Política de Cookies</a></li>
          </ul>
        </div>

      </div>
      
      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} Travel Explorer. Proyecto Académico.</p>
      </div>
    </footer>
  );
}
