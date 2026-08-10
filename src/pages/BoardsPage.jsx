import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import {
  Briefcase, Plus, MapPin, Calendar,
  Trash2, Package, ChevronRight, X,
  Search, Edit2, Users, Baby, Eye, EyeOff,
  RotateCcw, Zap, GitBranch, Link2
} from 'lucide-react';
import { Queue } from '../structures/Queue.js';
import PackageNetworkExplorer from '../components/graph/PackageNetworkExplorer';
import './BoardsPage.css';

// ─── LinkedList Visualizer ────────────────────────────────────────────────
function LinkedListVisualizer({ savedPackages, onNodeClick }) {
  const nodos = savedPackages.recorrerNodos ? savedPackages.recorrerNodos() : [];
  if (nodos.length === 0) {
    return <p className="ll-empty-msg">La lista está vacía. Guarda paquetes para ver la estructura.</p>;
  }
  return (
    <div className="ll-visualizer">
      <div className="ll-nodes-row">
        {nodos.map((nodo, idx) => (
          <React.Fragment key={nodo.valor.id}>
            <div
              className="ll-node"
              onClick={() => onNodeClick && onNodeClick(nodo.valor)}
              title={`Haz clic para ver ${nodo.valor.name}`}
            >
              <div className="ll-node-circle">
                <span className="ll-node-num">{idx + 1}</span>
              </div>
              <div className="ll-node-label">{nodo.valor.name}</div>
            </div>
            {nodo.siguiente !== null && (
              <div className="ll-arrow">
                <div className="ll-arrow-line" />
                <span className="ll-arrow-head">›</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

const COUNTRY_CODES = {
  'Francia': 'FR',
  'Reino Unido': 'UK',
  'España': 'ES',
  'Italia': 'IT',
  'Estados Unidos': 'US',
  'Grecia': 'GR',
  'Japón': 'JP',
  'Corea del Sur': 'KR',
  'Colombia': 'CO',
  'Ecuador': 'EC',
  'México': 'MX',
  'Marruecos': 'MA',
  'Australia': 'AU'
};

// ─── Direct Flights Network ────────────────────────────────────────────────────────
function DirectFlightsNetwork({ graph, cities }) {
  const [cityToSelect, setCityToSelect] = useState('');
  const [addedCities, setAddedCities] = useState([]);

  const getCityLabel = (key) => {
    const city = cities.find(c => c.key === key);
    if (!city) return key;
    const cc = COUNTRY_CODES[city.country] || city.country.substring(0, 2).toUpperCase();
    return `${city.name} (${cc})`;
  };

  const handleAddCity = () => {
    if (cityToSelect && !addedCities.includes(cityToSelect)) {
      setAddedCities([...addedCities, cityToSelect]);
    }
    setCityToSelect('');
  };

  const handleClear = () => {
    setAddedCities([]);
  };

  // Calcula aristas reales existentes en el grafo entre las ciudades agregadas
  const edgesToDraw = [];
  const seenEdges = new Set();
  
  addedCities.forEach(cityKey => {
    const node = graph.getNode(cityKey);
    if (node) {
      node.edges.forEach(edge => {
        // Si el destino también está en las ciudades agregadas
        if (addedCities.includes(edge.node)) {
          // Evitar dibujar A->B y B->A como dos líneas separadas (creamos un id único)
          const edgeId = [cityKey, edge.node].sort().join('--');
          if (!seenEdges.has(edgeId)) {
            seenEdges.add(edgeId);
            edgesToDraw.push({ from: cityKey, to: edge.node });
          }
        }
      });
    }
  });

  return (
    <div className="graph-builder" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
      <div className="graph-toolbar" style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select 
            className="select-input" 
            value={cityToSelect} 
            onChange={(e) => setCityToSelect(e.target.value)}
            style={{ minWidth: '220px', padding: '8px 12px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
          >
            <option value="">[ Buscar ciudad ▼ ]</option>
            {cities.map(city => (
              <option key={city.key} value={city.key} disabled={addedCities.includes(city.key)}>
                {getCityLabel(city.key)}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handleAddCity} disabled={!cityToSelect}>
            <Plus size={16} style={{ marginRight: '4px' }} /> Agregar
          </button>
          {addedCities.length > 0 && (
            <button className="btn btn-ghost text-rose" onClick={handleClear}>
              <RotateCcw size={16} style={{ marginRight: '4px' }} /> Limpiar Lienzo
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'var(--bg-tertiary)', minHeight: '450px' }}>
        {addedCities.length === 0 ? (
          <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <MapPin size={48} opacity={0.2} />
            <h3 style={{ marginTop: '16px' }}>Lienzo vacío</h3>
            <p>Agrega ciudades para construir tu red de vuelos directos.</p>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            {/* SVG para las aristas */}
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              {edgesToDraw.map((edge, i) => {
                const total = addedCities.length;
                const iFrom = addedCities.indexOf(edge.from);
                const iTo = addedCities.indexOf(edge.to);
                
                const angleFrom = (2 * Math.PI * iFrom) / Math.max(total, 1) - Math.PI / 2;
                const angleTo = (2 * Math.PI * iTo) / Math.max(total, 1) - Math.PI / 2;
                
                const radius = total === 1 ? 0 : 160;

                return (
                  <line 
                    key={`edge-${i}`}
                    x1={`calc(50% + ${Math.cos(angleFrom) * radius}px)`}
                    y1={`calc(50% + ${Math.sin(angleFrom) * radius}px)`}
                    x2={`calc(50% + ${Math.cos(angleTo) * radius}px)`}
                    y2={`calc(50% + ${Math.sin(angleTo) * radius}px)`}
                    stroke="var(--accent)"
                    strokeWidth="3"
                    opacity="0.6"
                  />
                );
              })}
            </svg>
            
            {/* Nodos (Ciudades) */}
            {addedCities.map((cityKey, i) => {
              const total = addedCities.length;
              const angle = (2 * Math.PI * i) / Math.max(total, 1) - Math.PI / 2;
              const radius = total === 1 ? 0 : 160;

              return (
                <div key={cityKey} style={{
                  position: 'absolute', top: '50%', left: '50%', 
                  transform: `translate(calc(-50% + ${Math.cos(angle) * radius}px), calc(-50% + ${Math.sin(angle) * radius}px))`,
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'var(--accent)', border: '4px solid var(--bg-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 2
                }}>
                  📍
                  <div style={{ position: 'absolute', top: '100%', marginTop: '8px', whiteSpace: 'nowrap', fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-primary)', textShadow: '0 1px 4px var(--bg-tertiary)' }}>
                    {getCityLabel(cityKey)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function BoardsPage() {
  const {
    boards, createBoard, updateBoard, deleteBoard,
    savedPackages, removeSavedPackage, modificarPaquete, cities,
    graph, tourPackages
  } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoardIndex, setEditingBoardIndex] = useState(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStructure, setShowStructure] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [editAdultos, setEditAdultos] = useState(2);
  const [editNinos, setEditNinos] = useState(0);
  const [editError, setEditError] = useState('');

  // States para la funcionalidad FIFO de Checkout (Comprar Viaje)
  const [checkoutQueue, setCheckoutQueue] = useState(null);
  const [checkoutTick, setCheckoutTick] = useState(0);
  const [ticket, setTicket] = useState(null);
  const [pkgToBuy, setPkgToBuy] = useState(null);

  const handleBuyPackage = (pkg) => {
    const q = new Queue();
    q.enqueue({ id: 1, name: '🛂 Pasaporte' });
    q.enqueue({ id: 2, name: '📄 Antecedentes' });
    q.enqueue({ id: 3, name: '🏨 Hospedaje' });
    q.enqueue({ id: 4, name: '🛡️ Seguro' });
    setCheckoutQueue(q);
    setTicket(null);
    setCheckoutTick(0);
    setPkgToBuy(pkg);
  };

  const handleFulfillRequirement = () => {
    if (!checkoutQueue || checkoutQueue.isEmpty()) return;
    checkoutQueue.dequeue();
    
    if (checkoutQueue.isEmpty()) {
      setTicket({
        id: `TKT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        pkgName: pkgToBuy?.name || 'Viaje',
        status: 'En revisión',
        message: 'Tu solicitud será revisada en aproximadamente 10 minutos.'
      });
      setCheckoutQueue(null);
    } else {
      setCheckoutTick(prev => prev + 1);
    }
  };
  const [nodePopup, setNodePopup] = useState(null);
  const [currentPkgIndex, setCurrentPkgIndex] = useState(0);
  const [viewBoard, setViewBoard] = useState(null);

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      if (editingBoardIndex !== null) {
        updateBoard(editingBoardIndex, newBoardName, newBoardDesc);
      } else {
        createBoard(newBoardName, newBoardDesc);
      }
      setNewBoardName(''); setNewBoardDesc(''); setIsModalOpen(false); setEditingBoardIndex(null);
    }
  };

  const handleOpenEditBoard = (index) => {
    // Demostración explícita del uso de get() para obtener los datos del arreglo
    const board = boards.get(index);
    if (board) {
      setEditingBoardIndex(index);
      setNewBoardName(board.name);
      setNewBoardDesc(board.description || '');
      setIsModalOpen(true);
    }
  };
  
  const handleOpenNewBoard = () => {
    setEditingBoardIndex(null);
    setNewBoardName('');
    setNewBoardDesc('');
    setIsModalOpen(true);
  };

  // LinkedList: recorrer() para renderizar
  const allPackages = savedPackages.recorrer ? savedPackages.recorrer() : [];
  const displayedPackages = searchQuery.trim()
    ? (savedPackages.buscarPorTexto ? savedPackages.buscarPorTexto(searchQuery) : allPackages)
    : allPackages;

  // Carrusel: asegurar que el índice no se salga de rango tras eliminación
  const safeIndex = displayedPackages.length > 0 ? Math.min(currentPkgIndex, displayedPackages.length - 1) : 0;
  const currentPkg = displayedPackages[safeIndex] || null;

  const goPrev = () => setCurrentPkgIndex(i => Math.max(0, i - 1));
  const goNext = () => setCurrentPkgIndex(i => Math.min(displayedPackages.length - 1, i + 1));

  // LinkedList: eliminar()
  const handleEliminar = (id) => removeSavedPackage(id);

  // LinkedList: abrir modal modificar()
  const handleOpenEdit = (pkg) => {
    setEditingPkg(pkg);
    setEditAdultos(pkg.adultos ?? 2);
    setEditNinos(pkg.ninos ?? 0);
    setEditError('');
  };

  // LinkedList: ejecutar modificar()
  const handleModificar = (e) => {
    e.preventDefault();
    if (!editingPkg) return;
    const resultado = modificarPaquete(editingPkg.id, parseInt(editAdultos), parseInt(editNinos));
    if (resultado.exito) { setEditingPkg(null); }
    else { setEditError(resultado.mensaje); }
  };

  const calcPreview = () => {
    if (!editingPkg) return 0;
    const pa = editingPkg.precioAdulto || editingPkg.price || 0;
    const pn = editingPkg.precioNino || Math.round(pa * 0.7);
    return (parseInt(editAdultos) || 0) * pa + (parseInt(editNinos) || 0) * pn;
  };

  const boardsArray = [];
  for (let i = 0; i < boards.size(); i++) boardsArray.push(boards.get(i));

  return (
    <div className="boards-page animate-fade-in">
      <div className="boards-header bg-dark">
        <div className="container">
          <h1>Mis Viajes</h1>
          <p>Gestiona tus tableros de viaje, paquetes guardados y rutas personalizadas.</p>
        </div>
      </div>

      <div className="container boards-content">

        {/* ── Travel Boards (DynamicArray) ─── */}
        <section className="boards-section">
          <div className="section-header-flex">
            <div>
              <h2 className="section-title">My Travel Boards</h2>
              <p className="section-subtitle">Custom itineraries you are planning</p>
            </div>
            <button className="btn btn-primary" onClick={handleOpenNewBoard}><Plus size={18} /> New Board</button>
          </div>
          {boardsArray.length > 0 ? (
            <div className="grid-cards grid-cards-3 stagger">
              {boardsArray.map((board, index) => (
                <div key={board.id} className="board-card glass">
                  <div className="board-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        background: 'var(--accent)', color: 'white', padding: '2px 6px', 
                        borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' 
                      }}>
                        [{index}]
                      </span> 
                      {board.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-icon btn-sm text-accent" onClick={() => handleOpenEditBoard(index)}><Edit2 size={16} /></button>
                      <button className="btn-icon btn-sm text-rose" onClick={() => deleteBoard(index)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <p className="board-desc">{board.description || 'Sin descripción'}</p>
                  
                  {board.cities.size && board.cities.size() > 0 ? (
                    <ul style={{ margin: '0 0 20px 0', padding: '0 0 0 24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {board.cities.toArray().map((c, i) => {
                        const cityName = cities.find(city => city.key === c)?.name || c;
                        return <li key={i}>{cityName}</li>;
                      })}
                    </ul>
                  ) : (
                    <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>No hay ciudades</p>
                  )}

                  <div className="board-footer">
                    <div className="board-meta"><MapPin size={14} /><span>{board.cities.size ? board.cities.size() : 0} ciudades</span></div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setViewBoard(board)}
                    >
                      Abrir Tablero <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass">
              <Briefcase size={48} opacity={0.2} />
              <h3>Aún no tienes tableros</h3>
              <p>Crea un tablero para comenzar a planificar tu itinerario personalizado.</p>
              <button className="btn btn-primary mt-4" onClick={handleOpenNewBoard}>Crear Primer Tablero</button>
            </div>
          )}
        </section>

        <hr className="section-divider" />

        {/* ── Package Network Explorer ─── */}
        <section className="boards-section">
          <div className="section-header-flex">
            <div>
              <h2 className="section-title">🌍 Explora nuestras Rutas</h2>
              <p className="section-subtitle">
                Visualiza los destinos y la distancia de cada trayecto en nuestros paquetes turísticos a través de este mapa interactivo.
              </p>
            </div>
          </div>
          <PackageNetworkExplorer tourPackages={tourPackages} cities={cities} />
        </section>

        <hr className="section-divider" />

        {/* ── Saved Tour Packages: LinkedList real ─── */}
        <section className="boards-section">
          <div className="section-header-flex">
            <div>
              <h2 className="section-title">Paquetes de Viaje Guardados</h2>
              <p className="section-subtitle">Tus destinos y paquetes favoritos listos para reservar.</p>
            </div>
            <div className="d-flex gap-2">
              <button className={`btn btn-sm ${showStructure ? 'btn-accent-active' : 'btn-secondary'}`} onClick={() => setShowStructure(!showStructure)}>
                {showStructure ? <EyeOff size={16} /> : <Eye size={16} />}
                {showStructure ? 'Ocultar Estructura' : 'Ver Estructura'}
              </button>
              <Link to="/packages" className="btn btn-secondary">Explorar Paquetes</Link>
            </div>
          </div>

          {showStructure && (
            <div className="ll-structure-panel animate-slide-up">
              <div className="ll-structure-header" style={{ justifyContent: 'flex-end' }}>
                <span className="ll-hint">Haz clic en un nodo para inspeccionarlo</span>
              </div>
              <LinkedListVisualizer savedPackages={savedPackages} onNodeClick={setNodePopup} />
            </div>
          )}

          {nodePopup && (
            <div className="ll-node-popup animate-fade-in">
              <div className="ll-popup-header">
                <strong>{nodePopup.name}</strong>
                <button className="btn-icon btn-sm" onClick={() => setNodePopup(null)}><X size={16} /></button>
              </div>
              <div className="ll-popup-body">
                <div className="ll-popup-row"><span>Adultos</span><strong>{nodePopup.adultos ?? 2}</strong></div>
                <div className="ll-popup-row"><span>Niños</span><strong>{nodePopup.ninos ?? 0}</strong></div>
                <div className="ll-popup-row"><span>Precio/adulto</span><strong>${nodePopup.precioAdulto || nodePopup.price}</strong></div>
                <div className="ll-popup-row"><span>Total</span><strong>${nodePopup.total || nodePopup.price}</strong></div>
                <div className="ll-popup-row"><span>Capacidad</span><strong>{nodePopup.capacidadMaxima ?? '—'} máx</strong></div>
              </div>
            </div>
          )}

          {/* Search via buscarPorTexto() */}
          <div className="ll-search-bar">
            <Search size={18} className="ll-search-icon" />
            <input type="text" placeholder="Buscar paquetes por nombre o destino..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="ll-search-input" />
            {searchQuery && <button className="clear-btn" onClick={() => setSearchQuery('')}><X size={16} /></button>}
          </div>
          {searchQuery && (
            <p className="ll-search-info">
              Se encontraron <strong>{displayedPackages.length}</strong> resultado{displayedPackages.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Carrusel: una tarjeta a la vez, navegada con Prev/Next */}
          {displayedPackages.length > 0 && currentPkg ? (
            <div className="pkg-carousel">
              {/* Indicadores de posición */}
              <div className="pkg-carousel-nav">
                <button
                  className="btn btn-secondary btn-sm pkg-nav-btn"
                  onClick={goPrev}
                  disabled={safeIndex === 0}
                >
                  ← Anterior
                </button>
                <span className="pkg-carousel-counter">
                  {safeIndex + 1} / {displayedPackages.length}
                </span>
                <button
                  className="btn btn-secondary btn-sm pkg-nav-btn"
                  onClick={goNext}
                  disabled={safeIndex === displayedPackages.length - 1}
                >
                  Siguiente →
                </button>
              </div>

              {/* Tarjeta única */}
              <div className="pkg-single-card glass">
                <div className="pkg-card-img">
                  <img src={currentPkg.image || `/images/${currentPkg.image}.png`} alt={currentPkg.name} />
                  <div className="pkg-card-img-overlay">
                    <span className="pkg-card-duration">
                      <Calendar size={14} /> {currentPkg.duration} días
                    </span>
                  </div>
                </div>

                <div className="pkg-card-body">
                  {/* Header */}
                  <div className="pkg-card-header">
                    <div>
                      <h3 className="pkg-card-title">{currentPkg.name}</h3>
                      <p className="pkg-card-route">
                        {(currentPkg.cities || []).map(c => cities.find(city => city.key === c)?.name || c).join(' → ')}
                      </p>
                    </div>
                    <div className="pkg-card-actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleOpenEdit(currentPkg)}
                        title="Editar viajeros"
                      >
                        <Edit2 size={15} /> Editar viajeros
                      </button>
                      <button
                        className="btn btn-sm btn-ghost text-rose"
                        onClick={() => { handleEliminar(currentPkg.id); setCurrentPkgIndex(i => Math.max(0, i - 1)); }}
                        title="Eliminar"
                      >
                        <Trash2 size={15} /> Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="pkg-info-grid">
                    <div className="pkg-info-item">
                      <span className="pkg-info-label">Adultos</span>
                      <span className="pkg-info-value"><Users size={15} /> {currentPkg.adultos ?? 2}</span>
                    </div>
                    <div className="pkg-info-item">
                      <span className="pkg-info-label">Niños</span>
                      <span className="pkg-info-value"><Baby size={15} /> {currentPkg.ninos ?? 0}</span>
                    </div>
                    <div className="pkg-info-item">
                      <span className="pkg-info-label">Precio / adulto</span>
                      <span className="pkg-info-value">${currentPkg.precioAdulto ?? currentPkg.price}</span>
                    </div>
                    <div className="pkg-info-item">
                      <span className="pkg-info-label">Capacidad</span>
                      <span className="pkg-info-value">{currentPkg.capacidadMaxima ?? 10} máx</span>
                    </div>
                  </div>

                  {/* Total price */}
                  <div className="pkg-card-total">
                    <span className="pkg-card-total-label">Total</span>
                    <span className="pkg-card-total-amount">${(currentPkg.total ?? currentPkg.price).toLocaleString()}</span>
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-accent flex-1"
                      onClick={() => handleBuyPackage(currentPkg)}
                      style={{ padding: '12px', flex: 1, textAlign: 'center', justifyContent: 'center' }}
                    >
                      Comprar Viaje
                    </button>
                    <Link to="/packages" state={{ selectedPackageId: currentPkg.id }} className="btn btn-primary flex-1" style={{ padding: '12px', flex: 1, textAlign: 'center', justifyContent: 'center' }}>
                      Ver Itinerario
                    </Link>
                  </div>
                </div>
              </div>

              {/* Dot indicators */}
              {displayedPackages.length > 1 && (
                <div className="pkg-dots">
                  {displayedPackages.map((_, i) => (
                    <button
                      key={i}
                      className={`pkg-dot${i === safeIndex ? ' active' : ''}`}
                      onClick={() => setCurrentPkgIndex(i)}
                      aria-label={`Go to package ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state glass">
              <Package size={48} opacity={0.2} />
              <h3>{searchQuery ? 'No results found' : 'No Saved Packages'}</h3>
              <p>{searchQuery ? 'Try a different search term.' : "You haven't saved any tour packages yet."}</p>
              {!searchQuery && <Link to="/packages" className="btn btn-primary mt-4">Explore Packages</Link>}
            </div>
          )}
        </section>
      </div>

      {/* Modal: Create/Edit Board */}
      {isModalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBoardIndex !== null ? `Editar Tablero [${editingBoardIndex}]` : 'Nuevo Tablero de Viaje'}</h2>
              <button className="btn-icon btn-sm" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateBoard}>
              <div className="modal-body">
                <div className="form-group mb-4">
                  <label className="form-label">Nombre del tablero</label>
                  <input type="text" className="input" placeholder="Ej. Eurotrip 2026" value={newBoardName} onChange={e => setNewBoardName(e.target.value)} autoFocus required />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción (Opcional)</label>
                  <textarea className="input" placeholder="¿De qué trata este viaje?" value={newBoardDesc} onChange={e => setNewBoardDesc(e.target.value)} rows="3" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={!newBoardName.trim()}>
                  {editingBoardIndex !== null ? 'Guardar Cambios' : 'Crear Tablero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Package — modificar() sobre el nodo */}
      {editingPkg && (
        <div className="modal-overlay animate-fade-in" onClick={() => setEditingPkg(null)}>
          <div className="modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Travelers — {editingPkg.name}</h2>
              <button className="btn-icon btn-sm" onClick={() => setEditingPkg(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleModificar}>
              <div className="modal-body">
                <div className="edit-pkg-info glass">
                  <div className="edit-info-row"><span>Package</span><strong>{editingPkg.name}</strong></div>
                  <div className="edit-info-row"><span>Price / adult</span><strong>${editingPkg.precioAdulto ?? editingPkg.price}</strong></div>
                  <div className="edit-info-row"><span>Price / child</span><strong>${editingPkg.precioNino ?? Math.round((editingPkg.precioAdulto || editingPkg.price) * 0.7)}</strong></div>
                  <div className="edit-info-row"><span>Max capacity</span><strong>{editingPkg.capacidadMaxima ?? 10} persons</strong></div>
                </div>
                <div className="d-flex gap-4 mt-4">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label"><Users size={16} /> Adults</label>
                    <input type="number" className="input" min="1" max={editingPkg.capacidadMaxima ?? 10} value={editAdultos} onChange={e => { setEditAdultos(e.target.value); setEditError(''); }} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label"><Baby size={16} /> Children</label>
                    <input type="number" className="input" min="0" max={editingPkg.capacidadMaxima ?? 10} value={editNinos} onChange={e => { setEditNinos(e.target.value); setEditError(''); }} />
                  </div>
                </div>
                <div className="edit-total-preview">
                  New Total: <strong>${calcPreview().toLocaleString()}</strong>
                  <span className="text-muted text-sm"> ({parseInt(editAdultos) || 0} + {parseInt(editNinos) || 0} = {(parseInt(editAdultos) || 0) + (parseInt(editNinos) || 0)} travelers)</span>
                </div>
                {editError && <div className="edit-error">{editError}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditingPkg(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Board */}
      {viewBoard && (
        <div className="modal-overlay animate-fade-in" onClick={() => setViewBoard(null)}>
          <div className="modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ marginBottom: '4px' }}>{viewBoard.name}</h2>
                <p className="text-muted text-sm" style={{ margin: 0 }}>{viewBoard.description || 'No description'}</p>
              </div>
              <button className="btn-icon" onClick={() => setViewBoard(null)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '0 20px 20px 20px' }}>
              <div className="d-flex align-center gap-2 mb-3" style={{ background: 'var(--accent-light)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                <MapPin size={16} className="text-accent" />
                <strong className="text-accent" style={{ fontSize: '0.9rem' }}>
                  {viewBoard.cities.size ? viewBoard.cities.size() : 0} destinations in this trip
                </strong>
              </div>
              
              {viewBoard.cities.size && viewBoard.cities.size() > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {viewBoard.cities.recorrer().map((cityKey, idx) => {
                    const cityData = cities.find(c => c.key === cityKey);
                    return (
                      <div key={idx} className="glass d-flex align-center gap-2" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 'bold', color: 'white', fontSize: '0.8rem'
                        }}>
                          {idx + 1}
                        </div>
                        {cityData && cityData.image ? (
                          <img src={cityData.image} alt={cityData.name} style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MapPin size={14} opacity={0.5} />
                          </div>
                        )}
                        <div>
                          <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{cityData ? cityData.name : cityKey}</h4>
                          <span className="text-sm text-muted" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <MapPin size={10} /> {cityData ? `${cityData.country}, ${cityData.continent}` : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state glass" style={{ padding: '40px 20px' }}>
                  <MapPin size={32} opacity={0.2} style={{ marginBottom: '12px' }} />
                  <h4 style={{ margin: '0 0 8px 0' }}>El tablero está vacío</h4>
                  <p className="text-sm text-muted">Ve a Explorar para agregar destinos a este tablero.</p>
                  <Link to="/explore" className="btn btn-secondary btn-sm mt-3">Explorar Destinos</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Queue Modal (FIFO) */}
      {(checkoutQueue || ticket) && (
        <div className="modal-overlay animate-fade-in" onClick={() => { setCheckoutQueue(null); setTicket(null); }}>
          <div className="modal animate-slide-up" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Solicitud de Compra</h2>
              <button className="btn-icon btn-sm" onClick={() => { setCheckoutQueue(null); setTicket(null); }}><X size={18} /></button>
            </div>
            <div className="modal-body text-center">
              {ticket ? (
                <div className="ticket-success">
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
                  <h3 className="text-emerald mb-2">Solicitud Generada</h3>
                  <div className="glass p-3 mb-3 text-left" style={{ borderRadius: 'var(--radius-md)' }}>
                    <p className="mb-2"><strong>Ticket ID:</strong> {ticket.id}</p>
                    <p className="mb-2"><strong>Viaje:</strong> {ticket.pkgName}</p>
                    <p className="mb-0"><strong>Estado:</strong> <span className="badge badge-accent" style={{ marginLeft: '8px' }}>{ticket.status}</span></p>
                  </div>
                  <p className="text-muted text-sm">{ticket.message}</p>
                  <button className="btn btn-primary mt-4 btn-block" onClick={() => setTicket(null)}>Aceptar</button>
                </div>
              ) : (
                <div className="checkout-queue-process">
                  <p className="mb-4 text-muted">Por favor completa los siguientes requisitos obligatorios.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    
                    {checkoutQueue.toArray().map((req, i) => {
                      const isFront = i === 0;
                      return (
                        <div key={req.id} className={`glass d-flex align-center justify-between p-3`} style={{ 
                          borderRadius: 'var(--radius-md)', 
                          border: isFront ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                          opacity: isFront ? 1 : 0.6,
                          background: isFront ? 'var(--bg-secondary)' : 'var(--bg-tertiary)'
                        }}>
                          <span style={{ fontWeight: isFront ? 'bold' : 'normal', fontSize: '1.1rem' }}>{req.name}</span>
                          <span className="badge" style={{ background: isFront ? 'var(--accent)' : 'var(--bg-tertiary)', color: isFront ? '#fff' : 'var(--text-muted)' }}>
                            {isFront ? '← ACTIVO' : '← bloqueado'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="d-flex justify-between align-center" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                    <span className="text-sm font-bold text-muted">Requisito {5 - checkoutQueue.size()} de 4</span>
                    <button className="btn btn-accent" onClick={handleFulfillRequirement}>
                      Cumplido: {checkoutQueue.peek().name}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

