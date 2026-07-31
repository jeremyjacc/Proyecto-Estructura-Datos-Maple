/**
 * Queue — Cola (FIFO)
 * Propósito: Ciudades pendientes por visitar.
 */
export class Queue {
  constructor() { this._items = []; this._front = 0; }
  enqueue(item) { this._items.push(item); }
  dequeue() {
    if (this.isEmpty()) throw new Error('Cannot dequeue from empty queue');
    const item = this._items[this._front]; this._items[this._front] = undefined; this._front++;
    if (this._front > this._items.length / 2) this._compact();
    return item;
  }
  peek() { if (this.isEmpty()) throw new Error('Cannot peek empty queue'); return this._items[this._front]; }
  isEmpty() { return this._front >= this._items.length; }
  size() { return this._items.length - this._front; }
  contains(predicate) { for (let i = this._front; i < this._items.length; i++) { if (predicate(this._items[i])) return true; } return false; }
  clear() { this._items = []; this._front = 0; }
  toArray() { return this._items.slice(this._front); }
  _compact() { this._items = this._items.slice(this._front); this._front = 0; }
}
