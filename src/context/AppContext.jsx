/**
 * AppContext — Estado global de Maple
 *
 * Provee acceso a:
 *   - tree (Tree): jerarquía de destinos
 *   - graph (Graph): red de conexiones entre ciudades
 *   - allCities: lista plana de ciudades (para búsqueda/sort)
 *   - continents: lista de continentes
 *   - boards (DynamicArray): colección de Travel Boards del usuario
 *   - Funciones CRUD para boards
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadAllData } from '../utils/dataLoader.js';
import { DynamicArray } from '../structures/DynamicArray.js';
import { LinkedList } from '../structures/LinkedList.js';
import { Stack } from '../structures/Stack.js';
import { Queue } from '../structures/Queue.js';

const AppContext = createContext(null);

// localStorage keys
const STORAGE_KEY = 'maple_boards';

function saveBoardsToStorage(boards) {
  const data = boards.toArray().map((board) => ({
    ...board,
    itinerary: board.itinerary.toArray(),
    undoStack: board.undoStack.toArray(),
    pendingQueue: board.pendingQueue.toArray(),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadBoardsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);
    const boards = new DynamicArray();

    for (const boardData of data) {
      const itinerary = new LinkedList();
      for (const stop of (boardData.itinerary || [])) itinerary.append(stop);

      const undoStack = new Stack();
      for (const action of (boardData.undoStack || [])) undoStack.push(action);

      const pendingQueue = new Queue();
      for (const item of (boardData.pendingQueue || [])) pendingQueue.enqueue(item);

      boards.push({
        id: boardData.id,
        name: boardData.name,
        description: boardData.description || '',
        createdAt: boardData.createdAt,
        emoji: boardData.emoji || '✈️',
        itinerary,
        undoStack,
        pendingQueue,
      });
    }
    return boards;
  } catch {
    return null;
  }
}

let boardIdCounter = Date.now();

export function AppProvider({ children }) {
  const [tree, setTree] = useState(null);
  const [graph, setGraph] = useState(null);
  const [allCities, setAllCities] = useState([]);
  const [continents, setContinents] = useState([]);
  const [boards, setBoards] = useState(() => loadBoardsFromStorage() || new DynamicArray());
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar
  useEffect(() => {
    loadAllData().then((data) => {
      setTree(data.tree);
      setGraph(data.graph);
      setAllCities(data.allCities);
      setContinents(data.continents);
      setLoading(false);
    });
  }, []);

  // Persistir boards en localStorage
  useEffect(() => {
    if (!loading) saveBoardsToStorage(boards);
  }, [boards, loading]);

  // ─── CRUD para Boards ──────────────────────────────────

  const createBoard = useCallback((name, emoji = '✈️', description = '') => {
    const newBoard = {
      id: `board-${boardIdCounter++}`,
      name,
      description,
      emoji,
      createdAt: new Date().toISOString(),
      itinerary: new LinkedList(),
      undoStack: new Stack(),
      pendingQueue: new Queue(),
    };
    const updated = new DynamicArray();
    boards.forEach((b) => updated.push(b));
    updated.push(newBoard);
    setBoards(updated);
    return newBoard;
  }, [boards]);

  const deleteBoard = useCallback((boardId) => {
    const updated = new DynamicArray();
    boards.forEach((b) => { if (b.id !== boardId) updated.push(b); });
    setBoards(updated);
  }, [boards]);

  const updateBoard = useCallback((boardId, updates) => {
    const updated = new DynamicArray();
    boards.forEach((b) => {
      if (b.id === boardId) updated.push({ ...b, ...updates });
      else updated.push(b);
    });
    setBoards(updated);
  }, [boards]);

  const getBoardById = useCallback((boardId) => {
    let found = null;
    boards.forEach((b) => { if (b.id === boardId) found = b; });
    return found;
  }, [boards]);

  // ─── Itinerary operations ──────────────────────────────

  const addStopToBoard = useCallback((boardId, cityKey, days, budget) => {
    const board = getBoardById(boardId);
    if (!board) return;

    const stop = { cityKey, days, budget, addedAt: Date.now() };
    board.itinerary.append(stop);
    board.undoStack.push({ type: 'ADD', data: { ...stop }, index: board.itinerary.size() - 1, timestamp: Date.now() });

    // Force re-render
    const updated = new DynamicArray();
    boards.forEach((b) => updated.push(b));
    setBoards(updated);
  }, [boards, getBoardById]);

  const removeStopFromBoard = useCallback((boardId, index) => {
    const board = getBoardById(boardId);
    if (!board) return;

    const removed = board.itinerary.removeAt(index);
    board.undoStack.push({ type: 'REMOVE', data: removed, index, timestamp: Date.now() });

    const updated = new DynamicArray();
    boards.forEach((b) => updated.push(b));
    setBoards(updated);
  }, [boards, getBoardById]);

  const moveStopInBoard = useCallback((boardId, fromIndex, toIndex) => {
    const board = getBoardById(boardId);
    if (!board) return;

    board.itinerary.moveNode(fromIndex, toIndex);
    board.undoStack.push({ type: 'MOVE', data: { fromIndex, toIndex }, timestamp: Date.now() });

    const updated = new DynamicArray();
    boards.forEach((b) => updated.push(b));
    setBoards(updated);
  }, [boards, getBoardById]);

  const undoLastAction = useCallback((boardId) => {
    const board = getBoardById(boardId);
    if (!board || board.undoStack.isEmpty()) return null;

    const action = board.undoStack.pop();

    switch (action.type) {
      case 'ADD':
        board.itinerary.removeAt(action.index);
        break;
      case 'REMOVE':
        board.itinerary.insertAt(action.index, action.data);
        break;
      case 'MOVE':
        board.itinerary.moveNode(action.data.toIndex, action.data.fromIndex);
        break;
      default: break;
    }

    const updated = new DynamicArray();
    boards.forEach((b) => updated.push(b));
    setBoards(updated);
    return action;
  }, [boards, getBoardById]);

  // ─── Queue operations ──────────────────────────────────

  const addToPendingQueue = useCallback((boardId, cityKey) => {
    const board = getBoardById(boardId);
    if (!board) return;
    board.pendingQueue.enqueue({ cityKey, addedAt: Date.now() });

    const updated = new DynamicArray();
    boards.forEach((b) => updated.push(b));
    setBoards(updated);
  }, [boards, getBoardById]);

  const dequeueFromPending = useCallback((boardId) => {
    const board = getBoardById(boardId);
    if (!board || board.pendingQueue.isEmpty()) return null;

    const item = board.pendingQueue.dequeue();
    const updated = new DynamicArray();
    boards.forEach((b) => updated.push(b));
    setBoards(updated);
    return item;
  }, [boards, getBoardById]);

  const value = {
    // Data
    tree, graph, allCities, continents, loading,
    // Boards CRUD
    boards, createBoard, deleteBoard, updateBoard, getBoardById,
    // Itinerary ops
    addStopToBoard, removeStopFromBoard, moveStopInBoard, undoLastAction,
    // Queue ops
    addToPendingQueue, dequeueFromPending,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
