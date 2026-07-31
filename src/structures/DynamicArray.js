/**
 * DynamicArray — Arreglo Dinámico
 * Propósito: Colección de Travel Boards del usuario.
 */
const INITIAL_CAPACITY = 4;
const GROWTH_FACTOR = 2;

export class DynamicArray {
  constructor() {
    this._capacity = INITIAL_CAPACITY;
    this._size = 0;
    this._data = new Array(this._capacity);
  }

  get(index) { this._validateIndex(index); return this._data[index]; }
  set(index, value) { this._validateIndex(index); this._data[index] = value; }

  push(element) {
    if (this._size === this._capacity) this._resize(this._capacity * GROWTH_FACTOR);
    this._data[this._size] = element;
    this._size++;
  }

  insertAt(index, element) {
    if (index < 0 || index > this._size) throw new RangeError(`Index ${index} out of bounds for size ${this._size}`);
    if (this._size === this._capacity) this._resize(this._capacity * GROWTH_FACTOR);
    for (let i = this._size; i > index; i--) this._data[i] = this._data[i - 1];
    this._data[index] = element;
    this._size++;
  }

  pop() {
    if (this._size === 0) throw new Error('Cannot pop from empty array');
    this._size--;
    const removed = this._data[this._size];
    this._data[this._size] = undefined;
    return removed;
  }

  removeAt(index) {
    this._validateIndex(index);
    const removed = this._data[index];
    for (let i = index; i < this._size - 1; i++) this._data[i] = this._data[i + 1];
    this._size--;
    this._data[this._size] = undefined;
    return removed;
  }

  indexOf(element, comparator) {
    for (let i = 0; i < this._size; i++) {
      if (comparator) { if (comparator(this._data[i], element) === 0) return i; }
      else { if (this._data[i] === element) return i; }
    }
    return -1;
  }

  contains(element, comparator) { return this.indexOf(element, comparator) !== -1; }
  size() { return this._size; }
  capacity() { return this._capacity; }
  isEmpty() { return this._size === 0; }

  forEach(callback) { for (let i = 0; i < this._size; i++) callback(this._data[i], i); }

  toArray() {
    const result = [];
    for (let i = 0; i < this._size; i++) result.push(this._data[i]);
    return result;
  }

  clear() { this._data = new Array(INITIAL_CAPACITY); this._capacity = INITIAL_CAPACITY; this._size = 0; }

  _resize(newCapacity) {
    const newData = new Array(newCapacity);
    for (let i = 0; i < this._size; i++) newData[i] = this._data[i];
    this._data = newData;
    this._capacity = newCapacity;
  }

  _validateIndex(index) {
    if (index < 0 || index >= this._size) throw new RangeError(`Index ${index} out of bounds for size ${this._size}`);
  }
}
