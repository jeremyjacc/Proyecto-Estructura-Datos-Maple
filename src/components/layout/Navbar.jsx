import { NavLink } from 'react-router-dom';
import { Compass, Map, FolderHeart, Leaf } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <NavLink to="/" className="navbar-brand" id="nav-home">
          <Leaf size={22} className="brand-icon" />
          <span className="brand-text">Maple</span>
        </NavLink>

        <div className="navbar-links">
          <NavLink to="/" end className="nav-link" id="nav-link-home">
            <Compass size={18} />
            <span>Descubrir</span>
          </NavLink>
          <NavLink to="/explore" className="nav-link" id="nav-link-explore">
            <Map size={18} />
            <span>Explorar</span>
          </NavLink>
          <NavLink to="/boards" className="nav-link" id="nav-link-boards">
            <FolderHeart size={18} />
            <span>Mis Viajes</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
