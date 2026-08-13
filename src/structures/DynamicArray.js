/**
 * DynamicArray — Arreglo Dinámico
 * 
 * Qué es: Una estructura que almacena elementos contiguamente y
 * ajusta
 * su tamaño automáticamente.
 * Cómo crece: Cuando se llena (size == capacity), 
 * crea un nuevo arreglo del doble de tamaño 
 * (GROWTH_FACTOR = 2) y copia los elementos existentes.
 * Por qué sirve para Boards: Permite listar, agregar y 
 * acceder a los "Travel Boards" del usuario muy rápidamente, manteniendo su orden.
 */
const INITIAL_CAPACITY = 4;
const GROWTH_FACTOR = 2;

export class DynamicArray {
  constructor() {
    this._capacity = INITIAL_CAPACITY;
    this._size = 0;
    this._data = new Array(this._capacity);
  }

  /**
   * get() - Acceso a un elemento
   * Complejidad: O(1) - Acceso directo e instantáneo por posición (índice).
   */
  get(index) { this._validateIndex(index); return this._data[index]; }

  /**
   * set() - Modifica un elemento
   * Complejidad: O(1) - Reemplaza el valor en la posición indicada instantáneamente.
   */
  set(index, value) { this._validateIndex(index); this._data[index] = value; }

  /**
   * Inserción al final (push)
   * Complejidad: O(1) amortizado. Rápido, aunque ocasionalmente toma O(n) si el arreglo necesita crecer.
   */
  push(element) {
    if (this._size === this._capacity) this._resize(this._capacity * GROWTH_FACTOR);
    this._data[this._size] = element;
    this._size++;
  }

  /**
   * Inserción en cualquier posición (insertAt)
   * Complejidad: O(n) - Lento porque requiere desplazar los elementos
   *  hacia la derecha para hacer espacio.
   */
  insertAt(index, element) {
    if (index < 0 || index > this._size) throw new RangeError(`Index ${index} out of bounds for size ${this._size}`);
    if (this._size === this._capacity) this._resize(this._capacity * GROWTH_FACTOR);
    for (let i = this._size; i > index; i--) this._data[i] = this._data[i - 1];
    this._data[index] = element;
    this._size++;
  }

  /**
   * pop() - Elimina el último elemento
   * Complejidad: O(1) - Simplemente reduce el tamaño y limpia la referencia.
   */
  pop() {
    if (this._size === 0) throw new Error('Cannot pop from empty array');
    this._size--;
    const removed = this._data[this._size];
    this._data[this._size] = undefined;
    return removed;
  }

  /**
   * removeAt() - Elimina en una posición específica
   * Complejidad: O(n) - Requiere desplazar elementos hacia la izquierda para llenar el hueco.
   */
  removeAt(index) {
    this._validateIndex(index);
    const removed = this._data[index];
    for (let i = index; i < this._size - 1; i++) this._data[i] = this._data[i + 1];
    this._size--;
    this._data[this._size] = undefined;
    return removed;
  }

  /**
   * indexOf() - Busca la posición de un elemento
   * Complejidad: O(n) - En el peor caso, revisa todos los elementos uno por uno.
   */
  indexOf(element, comparator) {
    for (let i = 0; i < this._size; i++) {
      if (comparator) { if (comparator(this._data[i], element) === 0) return i; }
      else { if (this._data[i] === element) return i; }
    }
    return -1;
  }

  /**
   * contains() - Verifica si existe un elemento
   * Complejidad: O(n) - Delega en indexOf.
   */
  contains(element, comparator) { return this.indexOf(element, comparator) !== -1; }

  /** size() - Retorna cantidad actual de elementos. Complejidad: O(1) */
  size() { return this._size; }

  /** capacity() - Retorna tamaño máximo actual antes de crecer. Complejidad: O(1) */
  capacity() { return this._capacity; }

  /** isEmpty() - Retorna true si no hay elementos. Complejidad: O(1) */
  isEmpty() { return this._size === 0; }

  /**
   * forEach() - Itera sobre todos los elementos
   * Complejidad: O(n) - Visita cada elemento una vez.
   */
  forEach(callback) { for (let i = 0; i < this._size; i++) callback(this._data[i], i); }

  /**
   * toArray() - Convierte a un arreglo nativo de JS
   * Complejidad: O(n) - Copia todos los elementos a un nuevo arreglo.
   */
  toArray() {
    const result = [];
    for (let i = 0; i < this._size; i++) result.push(this._data[i]);
    return result;
  }

  /**
   * clear() - Vacía todo el arreglo
   * Complejidad: O(1) - Simplemente reinicia variables y crea un nuevo espacio vacío.
   */
  clear() { this._data = new Array(INITIAL_CAPACITY); this._capacity = INITIAL_CAPACITY; this._size = 0; }

  /**
   * _resize() - Método interno para crecer la capacidad
   * Complejidad: O(n) - Debe copiar todos los elementos al nuevo espacio.
   */
  _resize(newCapacity) {
    const newData = new Array(newCapacity);
    for (let i = 0; i < this._size; i++) newData[i] = this._data[i];
    this._data = newData;
    this._capacity = newCapacity;
  }

  /**
   * _validateIndex() - Revisa si el índice es válido
   * Complejidad: O(1) - Simple comparación matemática.
   */
  _validateIndex(index) {
    if (index < 0 || index >= this._size) throw new RangeError(`Index ${index} out of bounds for size ${this._size}`);
  }
}
