import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Briefcase, Plus, MapPin, Calendar, 
  Trash2, Package, ChevronRight, X 
} from 'lucide-react';
import './BoardsPage.css';

export default function BoardsPage() {
  const { 
    boards, createBoard, deleteBoard, 
    savedPackages, removeSavedPackage, cities
  } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      createBoard(newBoardName, newBoardDesc);
      setNewBoardName('');
      setNewBoardDesc('');
      setIsModalOpen(false);
    }
  };

  // Convertir estructuras a arrays para renderizar
  const boardsArray = [];
  for (let i = 0; i < boards.size(); i++) {
    boardsArray.push(boards.get(i));
  }

  const packagesArray = savedPackages.toArray();

  return (
    <div className="boards-page animate-fade-in">
      <div className="boards-header bg-dark">
        <div className="container">
          <h1>My Saved Trips</h1>
          <p>Manage your custom travel boards and saved tour packages.</p>
        </div>
      </div>

      <div className="container boards-content">
        
        {/* Custom Travel Boards (DynamicArray) */}
        <section className="boards-section">
          <div className="section-header-flex">
            <div>
              <h2 className="section-title">My Travel Boards</h2>
              <p className="section-subtitle">Custom itineraries you are planning</p>
            </div>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> New Board
            </button>
          </div>

          {boardsArray.length > 0 ? (
            <div className="grid-cards grid-cards-3 stagger">
              {boardsArray.map(board => (
                <div key={board.id} className="board-card glass">
                  <div className="board-header">
                    <h3>{board.name}</h3>
                    <button 
                      className="btn-icon btn-sm text-rose" 
                      onClick={() => deleteBoard(board.id)}
                      title="Delete Board"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="board-desc">{board.description || 'No description'}</p>
                  
                  <div className="board-footer">
                    <div className="board-meta">
                      <MapPin size={14} /> 
                      <span>{board.cities.size()} cities</span>
                    </div>
                    <button className="btn btn-secondary btn-sm">
                      Open Board <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass">
              <Briefcase size={48} opacity={0.2} />
              <h3>No Travel Boards Yet</h3>
              <p>Create a board to start planning your custom itinerary.</p>
              <button className="btn btn-primary mt-4" onClick={() => setIsModalOpen(true)}>
                Create First Board
              </button>
            </div>
          )}
        </section>

        <hr className="section-divider" />

        {/* Saved Tour Packages (LinkedList) */}
        <section className="boards-section">
          <div className="section-header-flex">
            <div>
              <h2 className="section-title">Saved Tour Packages</h2>
              <p className="section-subtitle">Ready-made itineraries you liked</p>
            </div>
            <Link to="/packages" className="btn btn-secondary">
              Browse Packages
            </Link>
          </div>

          {packagesArray.length > 0 ? (
            <div className="grid-cards grid-cards-2 stagger">
              {packagesArray.map(pkg => (
                <div key={pkg.id} className="saved-package-card glass">
                  <div className="saved-pkg-img">
                    <img src={pkg.image || `/images/${pkg.image}.png`} alt={pkg.name} />
                  </div>
                  <div className="saved-pkg-content">
                    <div className="d-flex justify-between align-start mb-2">
                      <h4>{pkg.name}</h4>
                      <button 
                        className="btn-icon btn-sm text-rose"
                        onClick={() => removeSavedPackage(pkg.id)}
                        title="Remove from saved"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <p className="text-sm text-muted mb-3 truncate">
                      {pkg.cities.map(c => cities.find(city => city.key === c)?.name || c).join(' → ')}
                    </p>
                    
                    <div className="d-flex gap-3 text-sm font-bold text-primary mb-3">
                      <span><Calendar size={14} className="mr-1 inline"/> {pkg.duration} Days</span>
                      <span>${pkg.price}</span>
                    </div>

                    <Link to={`/packages`} className="btn btn-secondary btn-block btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass">
              <Package size={48} opacity={0.2} />
              <h3>No Saved Packages</h3>
              <p>You haven't saved any tour packages yet.</p>
              <Link to="/packages" className="btn btn-primary mt-4">
                Explore Packages
              </Link>
            </div>
          )}
        </section>

      </div>

      {/* Modal Crear Board */}
      {isModalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Travel Board</h2>
              <button className="btn-icon btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBoard}>
              <div className="modal-body">
                <div className="form-group mb-4">
                  <label className="form-label">Board Name</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="e.g., Summer in Europe 2024" 
                    value={newBoardName}
                    onChange={e => setNewBoardName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea 
                    className="input" 
                    placeholder="What is this trip about?" 
                    value={newBoardDesc}
                    onChange={e => setNewBoardDesc(e.target.value)}
                    rows="3"
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!newBoardName.trim()}>
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
