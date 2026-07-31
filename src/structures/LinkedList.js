/**
 * LinkedList — Lista Enlazada Simple
 * Propósito: Itinerario del viaje. Cada nodo = una parada.
 */
export class ListNode {
  constructor(data) { this.data = data; this.next = null; }
}

export class LinkedList {
  constructor() { this.head = null; this._size = 0; }

  append(data) {
    const newNode = new ListNode(data);
    if (this.head === null) { this.head = newNode; }
    else { let c = this.head; while (c.next !== null) c = c.next; c.next = newNode; }
    this._size++;
    return newNode;
  }

  prepend(data) {
    const newNode = new ListNode(data);
    newNode.next = this.head;
    this.head = newNode;
    this._size++;
    return newNode;
  }

  insertAt(index, data) {
    if (index < 0 || index > this._size) throw new RangeError(`Index ${index} out of bounds for size ${this._size}`);
    if (index === 0) return this.prepend(data);
    const newNode = new ListNode(data);
    let current = this.head;
    for (let i = 0; i < index - 1; i++) current = current.next;
    newNode.next = current.next;
    current.next = newNode;
    this._size++;
    return newNode;
  }

  removeAt(index) {
    this._validateIndex(index);
    let removed;
    if (index === 0) { removed = this.head.data; this.head = this.head.next; }
    else {
      let current = this.head;
      for (let i = 0; i < index - 1; i++) current = current.next;
      removed = current.next.data;
      current.next = current.next.next;
    }
    this._size--;
    return removed;
  }

  removeBy(predicate) {
    if (this.head === null) return null;
    if (predicate(this.head.data)) { const r = this.head.data; this.head = this.head.next; this._size--; return r; }
    let current = this.head;
    while (current.next !== null) {
      if (predicate(current.next.data)) { const r = current.next.data; current.next = current.next.next; this._size--; return r; }
      current = current.next;
    }
    return null;
  }

  getAt(index) {
    this._validateIndex(index);
    let current = this.head;
    for (let i = 0; i < index; i++) current = current.next;
    return current.data;
  }

  find(predicate) {
    let current = this.head;
    while (current !== null) { if (predicate(current.data)) return current.data; current = current.next; }
    return null;
  }

  findIndex(predicate) {
    let current = this.head; let index = 0;
    while (current !== null) { if (predicate(current.data)) return index; current = current.next; index++; }
    return -1;
  }

  moveNode(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    this._validateIndex(fromIndex); this._validateIndex(toIndex);
    const data = this.removeAt(fromIndex);
    this.insertAt(toIndex, data);
  }

  updateAt(index, newData, merge = false) {
    this._validateIndex(index);
    let current = this.head;
    for (let i = 0; i < index; i++) current = current.next;
    if (merge && typeof current.data === 'object' && typeof newData === 'object') {
      current.data = { ...current.data, ...newData };
    } else { current.data = newData; }
  }

  size() { return this._size; }
  isEmpty() { return this._size === 0; }

  forEach(callback) {
    let current = this.head; let index = 0;
    while (current !== null) { callback(current.data, index); current = current.next; index++; }
  }

  toArray() {
    const result = []; let current = this.head;
    while (current !== null) { result.push(current.data); current = current.next; }
    return result;
  }

  clear() { this.head = null; this._size = 0; }

  _validateIndex(index) {
    if (index < 0 || index >= this._size) throw new RangeError(`Index ${index} out of bounds for size ${this._size}`);
  }
}
