import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadAllData } from '../utils/dataLoader.js';
import { DynamicArray } from '../structures/DynamicArray.js';
import { LinkedList } from '../structures/LinkedList.js';
import { Stack } from '../structures/Stack.js';
import { Queue } from '../structures/Queue.js';
import { Tree } from '../structures/Tree.js';
import { Graph } from '../structures/Graph.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Datos principales (estáticos)
  const [tree, setTree] = useState(new Tree());
  const [graph, setGraph] = useState(new Graph());
  const [cities, setCities] = useState([]);
  const [continents, setContinents] = useState([]);
  const [tourPackages, setTourPackages] = useState([]);
  
  // Estado de carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estructuras de datos dinámicas para el usuario
  // 1. Array Dinámico: Mis viajes guardados (Travel Boards custom)
  const [boards, setBoards] = useState(new DynamicArray());
  
  // 2. LinkedList: Paquetes turísticos guardados
  const [savedPackages, setSavedPackages] = useState(new LinkedList());
  
  // 3. Stack: Historial de navegación de ciudades
  const [navigationHistory, setNavigationHistory] = useState(new Stack());
  
  // 4. Queue: Cola de recorrido para un Tour Package activo
  const [activeTourQueue, setActiveTourQueue] = useState(new Queue());

  // Carga inicial de datos
  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        const data = await loadAllData();
        setTree(data.tree);
        setGraph(data.graph);
        setCities(data.allCities);
        setContinents(data.continents);
        setTourPackages(data.tourPackages);
        
        // Cargar datos del usuario desde localStorage
        loadUserData();
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("No se pudieron cargar los datos de destinos.");
      } finally {
        setLoading(false);
      }
    }
    
    initData();
  }, []);

  // Funciones de localStorage
  const loadUserData = () => {
    try {
      const savedBoardsJSON = localStorage.getItem('travelExplorer_boards');
      if (savedBoardsJSON) {
        const parsedBoards = JSON.parse(savedBoardsJSON);
        const newArray = new DynamicArray();
        parsedBoards.forEach(b => {
          const restoredCities = new LinkedList();
          if (b.cities && b.cities.head !== undefined) {
            let curr = b.cities.head;
            while (curr) { restoredCities.append(curr.data); curr = curr.next; }
          }
          b.cities = restoredCities;

          const restoredPending = new Queue();
          if (b.pendingCities && Array.isArray(b.pendingCities._items)) {
            b.pendingCities._items.forEach(item => { 
              if (item !== null && item !== undefined) restoredPending.enqueue(item); 
            });
          }
          b.pendingCities = restoredPending;

          const restoredHistory = new Stack();
          if (b.actionHistory && Array.isArray(b.actionHistory._items)) {
            b.actionHistory._items.forEach(item => restoredHistory.push(item));
          }
          b.actionHistory = restoredHistory;

          newArray.push(b);
        });
        setBoards(newArray);
      }

      const savedPackagesJSON = localStorage.getItem('travelExplorer_packages');
      if (savedPackagesJSON) {
        const parsedPackages = JSON.parse(savedPackagesJSON);
        const newList = new LinkedList();
        parsedPackages.forEach(p => newList.append(p));
        setSavedPackages(newList);
      }
    } catch (e) {
      console.error("Error al leer de localStorage:", e);
    }
  };

  const saveBoardsToStorage = (newBoards) => {
    const arrayToSave = [];
    for (let i = 0; i < newBoards.size(); i++) {
      arrayToSave.push(newBoards.get(i));
    }
    localStorage.setItem('travelExplorer_boards', JSON.stringify(arrayToSave));
  };

  const savePackagesToStorage = (newList) => {
    localStorage.setItem('travelExplorer_packages', JSON.stringify(newList.toArray()));
  };

  // --- Métodos para Travel Boards (Dynamic Array) ---
  const createBoard = (name, description, theme = 'default') => {
    const newBoard = {
      id: Date.now().toString(),
      name,
      description,
      theme,
      createdAt: new Date().toISOString(),
      cities: new LinkedList(), 
      pendingCities: new Queue(), 
      actionHistory: new Stack() 
    };
    
    const newBoards = new DynamicArray();
    for (let i = 0; i < boards.size(); i++) {
      newBoards.push(boards.get(i));
    }
    newBoards.push(newBoard);
    
    setBoards(newBoards);
    saveBoardsToStorage(newBoards);
    return newBoard;
  };

  const deleteBoard = (boardId) => {
    const newBoards = new DynamicArray();
    let deleted = false;
    
    for (let i = 0; i < boards.size(); i++) {
      const board = boards.get(i);
      if (board.id !== boardId) {
        newBoards.push(board);
      } else {
        deleted = true;
      }
    }
    
    if (deleted) {
      setBoards(newBoards);
      saveBoardsToStorage(newBoards);
    }
    return deleted;
  };

  const addCityToBoard = (boardId, cityKey) => {
    let updated = false;
    const newBoards = new DynamicArray();
    
    for (let i = 0; i < boards.size(); i++) {
      const board = boards.get(i);
      if (board.id === boardId) {
        // Evitar duplicados simples (esto es O(N) en la lista)
        if (!board.cities.find(c => c === cityKey)) {
          board.cities.append(cityKey);
          board.pendingCities.enqueue(cityKey);
          updated = true;
        }
      }
      newBoards.push(board);
    }
    
    if (updated) {
      setBoards(newBoards);
      saveBoardsToStorage(newBoards);
    }
    return updated;
  };

  // --- Métodos para Tour Packages (LinkedList) ---
  const savePackage = (pkg) => {
    const newList = new LinkedList();
    savedPackages.toArray().forEach(p => newList.append(p));
    
    // Evitar duplicados
    const exists = newList.toArray().some(p => p.id === pkg.id);
    if (!exists) {
      newList.append({ ...pkg, savedAt: new Date().toISOString() });
      setSavedPackages(newList);
      savePackagesToStorage(newList);
    }
  };

  const removeSavedPackage = (pkgId) => {
    const newList = new LinkedList();
    savedPackages.toArray().forEach(p => {
      if (p.id !== pkgId) newList.append(p);
    });
    setSavedPackages(newList);
    savePackagesToStorage(newList);
  };

  // --- Métodos para Historial de Navegación (Stack) ---
  const pushToHistory = (cityKey) => {
    const newStack = new Stack();
    // Clonar stack actual
    const tempArray = [];
    while (!navigationHistory.isEmpty()) {
      tempArray.push(navigationHistory.pop());
    }
    // Restaurar en orden
    for (let i = tempArray.length - 1; i >= 0; i--) {
      newStack.push(tempArray[i]);
      navigationHistory.push(tempArray[i]); // Restaurar el original por si acaso
    }
    
    // Evitar apilar la misma ciudad consecutivamente
    if (newStack.isEmpty() || newStack.peek() !== cityKey) {
      newStack.push(cityKey);
      setNavigationHistory(newStack);
    }
  };

  const popFromHistory = () => {
    if (navigationHistory.isEmpty()) return null;
    
    const newStack = new Stack();
    const tempArray = [];
    while (!navigationHistory.isEmpty()) {
      tempArray.push(navigationHistory.pop());
    }
    
    // El elemento a descartar (ciudad actual)
    const current = tempArray[0];
    
    // El elemento anterior (al que queremos ir)
    const previous = tempArray.length > 1 ? tempArray[1] : null;
    
    // Reconstruir el stack sin el elemento actual
    for (let i = tempArray.length - 1; i > 0; i--) {
      newStack.push(tempArray[i]);
    }
    
    setNavigationHistory(newStack);
    return previous;
  };

  const clearHistory = () => {
    setNavigationHistory(new Stack());
  };

  // --- Métodos para Tour Activo (Queue) ---
  const startTour = (citiesArray) => {
    const newQueue = new Queue();
    citiesArray.forEach(city => newQueue.enqueue(city));
    setActiveTourQueue(newQueue);
  };

  const nextTourCity = () => {
    if (activeTourQueue.isEmpty()) return null;
    
    const newQueue = new Queue();
    const current = activeTourQueue.dequeue();
    
    while (!activeTourQueue.isEmpty()) {
      newQueue.enqueue(activeTourQueue.dequeue());
    }
    
    setActiveTourQueue(newQueue);
    return current;
  };

  const endTour = () => {
    setActiveTourQueue(new Queue());
  };

  const contextValue = {
    // Datos y Estado
    tree,
    graph,
    cities,
    continents,
    tourPackages,
    loading,
    error,
    
    // Travel Boards
    boards,
    createBoard,
    deleteBoard,
    addCityToBoard,
    
    // Saved Packages
    savedPackages,
    savePackage,
    removeSavedPackage,
    
    // Navigation History
    navigationHistory,
    pushToHistory,
    popFromHistory,
    clearHistory,
    
    // Active Tour
    activeTourQueue,
    startTour,
    nextTourCity,
    endTour
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
