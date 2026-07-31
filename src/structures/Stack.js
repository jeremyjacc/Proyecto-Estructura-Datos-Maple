/**
 * Stack — Pila (LIFO)
 * Propósito: Historial Undo por cada Board.
 */
export class Stack {
  constructor() { this._items = []; }
  push(item) { this._items.push(item); }
  pop() { if (this.isEmpty()) throw new Error('Cannot pop from empty stack'); return this._items.pop(); }
  peek() { if (this.isEmpty()) throw new Error('Cannot peek empty stack'); return this._items[this._items.length - 1]; }
  isEmpty() { return this._items.length === 0; }
  size() { return this._items.length; }
  clear() { this._items = []; }
  toArray() { return [...this._items]; }
}
