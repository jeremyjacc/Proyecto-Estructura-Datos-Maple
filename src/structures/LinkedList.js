/**
 * ListaEnlazada — Singly Linked List (Lista Enlazada Simple)
 * Propósito: Almacenar y administrar paquetes turísticos guardados.
 *
 * Estructura:
 *   Nodo { valor, siguiente }
 *   ListaEnlazada { cabeza }
 *
 * Operaciones académicas:
 *   agregar(valor)     → inserta nuevo Nodo al final
 *   buscar(id)         → recorre desde cabeza con siguiente
 *   modificar(id, ...) → actualiza actual.valor directamente
 *   eliminar(id)       → religa referencias siguiente
 *   recorrer()         → traversal completo desde cabeza
 */

export class Nodo {
  constructor(valor) {
    this.valor = valor;       // datos del paquete / reserva
    this.siguiente = null;    // referencia al siguiente nodo
  }
}

export class ListaEnlazada {
  constructor() {
    this.cabeza = null;       // primer nodo de la lista
    this._tamanio = 0;
  }

  // ─── AGREGAR ─────────────────────────────────────────────
  // Crea un nuevo Nodo y lo agrega al final de la lista.
  agregar(valor) {
    const nuevoNodo = new Nodo(valor);
    if (this.cabeza === null) {
      this.cabeza = nuevoNodo;
    } else {
      let actual = this.cabeza;
      while (actual.siguiente !== null) {
        actual = actual.siguiente;
      }
      actual.siguiente = nuevoNodo;
    }
    this._tamanio++;
    return nuevoNodo;
  }

  // ─── BUSCAR ──────────────────────────────────────────────
  // Recorre desde cabeza usando siguiente. Retorna el NODO completo.
  buscar(id) {
    let actual = this.cabeza;
    while (actual !== null) {
      if (actual.valor.id === id) return actual;
      actual = actual.siguiente;
    }
    return null;
  }

  // Búsqueda por texto (nombre del paquete o ciudades)
  buscarPorTexto(texto) {
    const textoBuscar = texto.toLowerCase();
    const resultados = [];
    let actual = this.cabeza;
    while (actual !== null) {
      const nombre = (actual.valor.name || '').toLowerCase();
      const destinos = (actual.valor.cities || []).join(' ').toLowerCase();
      if (nombre.includes(textoBuscar) || destinos.includes(textoBuscar)) {
        resultados.push(actual.valor);
      }
      actual = actual.siguiente;
    }
    return resultados;
  }

  // ─── MODIFICAR ───────────────────────────────────────────
  // Localiza el nodo por id y modifica actual.valor.* directamente.
  // El nodo y sus referencias siguiente permanecen intactos.
  modificar(id, adultos, ninos) {
    const nodo = this.buscar(id);
    if (!nodo) return { exito: false, mensaje: 'Paquete no encontrado.' };

    const totalPersonas = adultos + ninos;
    const capacidadMaxima = nodo.valor.capacidadMaxima || 99;

    if (totalPersonas > capacidadMaxima) {
      return {
        exito: false,
        mensaje: `The selected number of travelers (${totalPersonas}) exceeds the maximum capacity of this package (${capacidadMaxima}).`
      };
    }

    // Modificar directamente el valor del nodo existente
    const precioAdulto = nodo.valor.precioAdulto || nodo.valor.price || 0;
    const precioNino = nodo.valor.precioNino || Math.round(precioAdulto * 0.7);
    nodo.valor.adultos = adultos;
    nodo.valor.ninos = ninos;
    nodo.valor.total = (adultos * precioAdulto) + (ninos * precioNino);

    return { exito: true };
  }

  // ─── ELIMINAR ────────────────────────────────────────────
  // Religa la referencia siguiente del nodo anterior.
  // Actualiza cabeza si el nodo a eliminar es el primero.
  eliminar(id) {
    if (this.cabeza === null) return false;

    if (this.cabeza.valor.id === id) {
      this.cabeza = this.cabeza.siguiente;
      this._tamanio--;
      return true;
    }

    let actual = this.cabeza;
    while (actual.siguiente !== null) {
      if (actual.siguiente.valor.id === id) {
        actual.siguiente = actual.siguiente.siguiente; // religar
        this._tamanio--;
        return true;
      }
      actual = actual.siguiente;
    }
    return false;
  }

  // ─── RECORRER ────────────────────────────────────────────
  // Traversal completo desde cabeza hasta el fin.
  // Devuelve array de valores para renderizar la interfaz.
  recorrer() {
    const resultado = [];
    let actual = this.cabeza;
    while (actual !== null) {
      resultado.push(actual.valor);
      actual = actual.siguiente;
    }
    return resultado;
  }

  // Recorrer retornando nodos completos (para visualización de estructura)
  recorrerNodos() {
    const nodos = [];
    let actual = this.cabeza;
    while (actual !== null) {
      nodos.push(actual);
      actual = actual.siguiente;
    }
    return nodos;
  }

  // ─── Utilidades ──────────────────────────────────────────
  tamanio() { return this._tamanio; }
  estaVacia() { return this._tamanio === 0; }

  // ─── Aliases de compatibilidad con el resto del proyecto ─
  size() { return this._tamanio; }
  isEmpty() { return this._tamanio === 0; }
  append(valor) { return this.agregar(valor); }
  prepend(valor) {
    const nuevoNodo = new Nodo(valor);
    nuevoNodo.siguiente = this.cabeza;
    this.cabeza = nuevoNodo;
    this._tamanio++;
    return nuevoNodo;
  }
  find(predicado) {
    let actual = this.cabeza;
    while (actual !== null) {
      if (predicado(actual.valor)) return actual.valor;
      actual = actual.siguiente;
    }
    return null;
  }
  removeBy(predicado) {
    if (this.cabeza === null) return null;
    if (predicado(this.cabeza.valor)) {
      const r = this.cabeza.valor;
      this.cabeza = this.cabeza.siguiente;
      this._tamanio--;
      return r;
    }
    let actual = this.cabeza;
    while (actual.siguiente !== null) {
      if (predicado(actual.siguiente.valor)) {
        const r = actual.siguiente.valor;
        actual.siguiente = actual.siguiente.siguiente;
        this._tamanio--;
        return r;
      }
      actual = actual.siguiente;
    }
    return null;
  }
  toArray() { return this.recorrer(); }
  clear() { this.cabeza = null; this._tamanio = 0; }
  forEach(callback) {
    let actual = this.cabeza; let index = 0;
    while (actual !== null) { callback(actual.valor, index); actual = actual.siguiente; index++; }
  }
  getAt(index) {
    let actual = this.cabeza;
    for (let i = 0; i < index; i++) {
      if (!actual) throw new RangeError(`Index ${index} out of bounds`);
      actual = actual.siguiente;
    }
    return actual ? actual.valor : null;
  }
  get head() { return this.cabeza ? { data: this.cabeza.valor, next: this.cabeza.siguiente } : null; }
}

// Aliases para compatibilidad con imports existentes en el proyecto
export const LinkedList = ListaEnlazada;
export const ListNode = Nodo;
