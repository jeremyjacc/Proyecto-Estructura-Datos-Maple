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
            Discover the world's most amazing destinations. Plan, book, and explore with confidence.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link"><Hash size={20} /></a>
            <a href="#" className="social-link"><Share2 size={20} /></a>
            <a href="#" className="social-link"><MessageCircle size={20} /></a>
            <a href="#" className="social-link"><Globe size={20} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-title">Explore</h4>
          <ul className="footer-list">
            <li><Link to="/explore">Destinations</Link></li>
            <li><Link to="/packages">Tour Packages</Link></li>
            <li><Link to="/boards">Saved Trips</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-title">Company</h4>
          <ul className="footer-list">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Travel Guides</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-title">Legal</h4>
          <ul className="footer-list">
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Cookie Policy</a></li>
          </ul>
        </div>

      </div>
      
      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} Travel Explorer. Academic Project.</p>
      </div>
    </footer>
  );
}
