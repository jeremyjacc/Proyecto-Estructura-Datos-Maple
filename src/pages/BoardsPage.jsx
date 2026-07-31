import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, Edit3, MapPin, Undo2, ArrowDown, ArrowUp,
  X, Check, Route, DollarSign, Calendar, ChevronDown, Layers
} from 'lucide-react';
import './BoardsPage.css';

const BOARD_EMOJIS = ['✈️', '🏖️', '🏔️', '🌸', '🎒', '🗺️', '🧳', '🌅', '🏯', '🌊'];

export default function BoardsPage() {
  const {
    boards, createBoard, deleteBoard,
    allCities, graph,
    addStopToBoard, removeStopFromBoard, moveStopInBoard,
    undoLastAction, addToPendingQueue, dequeueFromPending,
  } = useApp();
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeBoard, setActiveBoard] = useState(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardEmoji, setNewBoardEmoji] = useState('✈️');
  const [showAddStop, setShowAddStop] = useState(false);
  const [addDays, setAddDays] = useState(3);
  const [addBudget, setAddBudget] = useState(80);

  const boardList = boards.toArray();
  const board = activeBoard ? boards.toArray().find((b) => b.id === activeBoard) : null;

  // ─── Create Board ──────────────────────────────────────
  const handleCreate = () => {
    if (!newBoardName.trim()) return;
    const newBoard = createBoard(newBoardName.trim(), newBoardEmoji);
    setActiveBoard(newBoard.id);
    setNewBoardName('');
    setNewBoardEmoji('✈️');
    setShowCreateModal(false);
  };

  // ─── Board View ────────────────────────────────────────
  if (board) {
    const stops = board.itinerary.toArray();
    const pending = board.pendingQueue.toArray();
    const routeKeys = stops.map((s) => s.cityKey);
    const routeTotals = graph && routeKeys.length > 1
      ? graph.calculateRouteTotals(routeKeys) : null;

    return (
      <div className="page boards-page">
        <div className="container">
          {/* Board header */}
          <div className="board-header animate-fade-in">
            <button className="btn btn-ghost" onClick={() => setActiveBoard(null)}>← Mis Viajes</button>
            <div className="board-title-row">
              <span className="board-emoji-lg">{board.emoji}</span>
              <div>
                <h1 className="board-name">{board.name}</h1>
                <p className="board-meta">
                  {stops.length} paradas · {stops.reduce((s, st) => s + st.days, 0)} días ·
                  Undo: {board.undoStack.size()} acciones · Pendientes: {pending.length}
                </p>
              </div>
            </div>
          </div>

          {/* Route totals from Graph */}
          {routeTotals && (
            <div className="route-summary glass animate-slide-up">
              <div className="route-stat">
                <Route size={18} />
                <span>{routeTotals.totalDistance.toLocaleString()} km</span>
              </div>
              <div className="route-stat">
                <DollarSign size={18} />
                <span>${routeTotals.totalCost} transporte</span>
              </div>
              <div className="route-stat">
                <Calendar size={18} />
                <span>{stops.reduce((s, st) => s + st.days, 0)} días total</span>
              </div>
              <div className="route-stat">
                <DollarSign size={18} />
                <span>${stops.reduce((s, st) => s + st.budget * st.days, 0)} presupuesto total</span>
              </div>
            </div>
          )}

          <div className="board-layout">
            {/* ─── Itinerary (LinkedList) ────────────────── */}
            <div className="itinerary-section">
              <div className="section-header-row">
                <h2>📋 Itinerario</h2>
                <div className="section-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => undoLastAction(board.id)}
                    disabled={board.undoStack.isEmpty()}
                    id="undo-btn"
                  >
                    <Undo2 size={14} /> Deshacer
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddStop(!showAddStop)} id="add-stop-btn">
                    <Plus size={14} /> Agregar parada
                  </button>
                </div>
              </div>

              {/* Add stop form */}
              {showAddStop && (
                <div className="add-stop-form glass animate-fade-in">
                  <p className="form-label">Selecciona una ciudad:</p>
                  <div className="add-stop-grid">
                    {allCities.map((city) => {
                      const alreadyAdded = stops.some((s) => s.cityKey === city.key);
                      return (
                        <button
                          key={city.key}
                          className={`add-stop-option chip ${alreadyAdded ? 'disabled' : ''}`}
                          disabled={alreadyAdded}
                          onClick={() => {
                            addStopToBoard(board.id, city.key, addDays, addBudget);
                            setShowAddStop(false);
                          }}
                          id={`add-city-${city.key}`}
                        >
                          <MapPin size={12} /> {city.name}
                          {alreadyAdded && ' ✓'}
                        </button>
                      );
                    })}
                  </div>
                  <div className="add-stop-inputs">
                    <label>
                      Días: <input type="number" min="1" max="30" value={addDays} onChange={(e) => setAddDays(Number(e.target.value))} className="input input-sm" />
                    </label>
                    <label>
                      $/día: <input type="number" min="1" value={addBudget} onChange={(e) => setAddBudget(Number(e.target.value))} className="input input-sm" />
                    </label>
                  </div>
                </div>
              )}

              {/* Stop list — LinkedList visualized */}
              {stops.length === 0 ? (
                <div className="empty-itinerary glass">
                  <Layers size={32} />
                  <p>Tu itinerario está vacío</p>
                  <span>Agrega ciudades para empezar a planificar</span>
                </div>
              ) : (
                <div className="stops-list">
                  {stops.map((stop, i) => {
                    const city = allCities.find((c) => c.key === stop.cityKey);
                    const segment = routeTotals?.segments?.[i];
                    return (
                      <div key={`${stop.cityKey}-${i}`}>
                        <div className="stop-card glass animate-fade-in">
                          <div className="stop-index">{i + 1}</div>
                          <div className="stop-info">
                            <h4>{city?.name || stop.cityKey}</h4>
                            <span className="stop-country">{city?.country}</span>
                          </div>
                          <div className="stop-data">
                            <span className="badge badge-glass">{stop.days}d</span>
                            <span className="badge badge-amber">${stop.budget * stop.days}</span>
                          </div>
                          <div className="stop-actions">
                            <button className="btn-icon" onClick={() => moveStopInBoard(board.id, i, Math.max(0, i - 1))} disabled={i === 0} title="Mover arriba">
                              <ArrowUp size={14} />
                            </button>
                            <button className="btn-icon" onClick={() => moveStopInBoard(board.id, i, Math.min(stops.length - 1, i + 1))} disabled={i === stops.length - 1} title="Mover abajo">
                              <ArrowDown size={14} />
                            </button>
                            <button className="btn-icon" onClick={() => removeStopFromBoard(board.id, i)} title="Eliminar">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {/* Segment connector (Graph edge info) */}
                        {segment && segment.distance && (
                          <div className="segment-connector">
                            <div className="segment-line" />
                            <span className="segment-info">{segment.distance} km · ${segment.cost}</span>
                            <div className="segment-line" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ─── Pending Queue ─────────────────────────── */}
            <div className="pending-section">
              <h2>⏳ Cola de pendientes</h2>
              <p className="pending-desc">Ciudades que quieres visitar (FIFO)</p>

              <div className="pending-add">
                {allCities.slice(0, 8).map((city) => (
                  <button
                    key={city.key}
                    className="chip chip-sm"
                    onClick={() => addToPendingQueue(board.id, city.key)}
                    id={`queue-${city.key}`}
                  >
                    + {city.name}
                  </button>
                ))}
              </div>

              {pending.length > 0 && (
                <div className="pending-list">
                  {pending.map((item, i) => {
                    const city = allCities.find((c) => c.key === item.cityKey);
                    return (
                      <div key={`${item.cityKey}-${i}`} className="pending-item glass">
                        <span className="pending-pos">{i + 1}</span>
                        <span>{city?.name || item.cityKey}</span>
                        {i === 0 && <span className="badge badge-teal">Siguiente</span>}
                      </div>
                    );
                  })}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const item = dequeueFromPending(board.id);
                      if (item) addStopToBoard(board.id, item.cityKey, 3, 80);
                    }}
                    id="dequeue-btn"
                  >
                    <ChevronDown size={14} /> Despachar siguiente al itinerario
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Board Grid (DynamicArray) ─────────────────────────
  return (
    <div className="page boards-page">
      <div className="container">
        <div className="explore-header animate-fade-in">
          <h1 className="explore-title">Mis Travel Boards</h1>
          <p className="explore-subtitle">
            {boardList.length} {boardList.length === 1 ? 'tablero' : 'tableros'} creados
          </p>
        </div>

        <div className="boards-grid stagger">
          {/* Create new board card */}
          <button className="board-create-card glass" onClick={() => setShowCreateModal(true)} id="create-board-btn">
            <Plus size={32} />
            <span>Nuevo Travel Board</span>
          </button>

          {boardList.map((b) => {
            const stopCount = b.itinerary.size();
            return (
              <button key={b.id} className="board-card glass" onClick={() => setActiveBoard(b.id)} id={`board-${b.id}`}>
                <span className="board-emoji">{b.emoji}</span>
                <h3 className="board-card-name">{b.name}</h3>
                <div className="board-card-meta">
                  <span className="badge badge-glass"><MapPin size={12} /> {stopCount} paradas</span>
                </div>
                <button
                  className="board-delete-btn btn-icon"
                  onClick={(e) => { e.stopPropagation(); deleteBoard(b.id); }}
                  title="Eliminar tablero"
                >
                  <Trash2 size={14} />
                </button>
              </button>
            );
          })}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal glass animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nuevo Travel Board</h2>
                <button className="btn-icon" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Nombre del viaje</label>
                <input
                  type="text"
                  className="input"
                  placeholder="ej. Europa 2027"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                  id="board-name-input"
                  style={{ paddingLeft: 16 }}
                />
                <label className="form-label" style={{ marginTop: 16 }}>Emoji</label>
                <div className="emoji-picker">
                  {BOARD_EMOJIS.map((em) => (
                    <button key={em} className={`emoji-option ${newBoardEmoji === em ? 'active' : ''}`} onClick={() => setNewBoardEmoji(em)}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleCreate} disabled={!newBoardName.trim()} id="create-board-submit">
                  <Check size={16} /> Crear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
