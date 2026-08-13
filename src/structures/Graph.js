/**
 * 3. Graph — Grafo Dirigido con Pesos (Lista de Adyacencia)
 * Propósito: Red independiente de conexiones entre ciudades/paquetes.
 * 
 * Qué es: Una estructura no lineal que conecta "Vértices" (ciudades) mediante "Aristas" (rutas).
 * Grafo dirigido: Las conexiones tienen un sentido (Ej: Vuelo de A -> B, pero no necesariamente de B -> A).
 * Cómo se construye: Se agregan vértices (addNode) y luego se unen con aristas (addEdge) que tienen peso (distancia/costo).
 * Uso en la interfaz: Permite visualizar las rutas de vuelos directos en el mapa iterativo y calcular la red de paquetes.
 */
export class GraphNode {
  /** Vértice del grafo. Guarda la llave única, datos y sus aristas salientes. */
  constructor(key, data) { this.key = key; this.data = data; this.edges = []; }
}

export class Graph {
  constructor() { this.nodes = new Map(); }

  /** addNode: Agrega un Vértice (ciudad) al grafo. O(1) */
  addNode(key, data) {
    if (this.nodes.has(key)) throw new Error(`Node "${key}" already exists`);
    const node = new GraphNode(key, data); this.nodes.set(key, node); return node;
  }

  /** getNode: Obtiene un Vértice por su llave. O(1) */
  getNode(key) { return this.nodes.get(key) || null; }

  /** removeNode: Elimina un Vértice y todas las Aristas que apuntaban a él. O(V + E) */
  removeNode(key) {
    if (!this.nodes.has(key)) return false;
    this.nodes.forEach((node) => { node.edges = node.edges.filter((e) => e.node !== key); });
    this.nodes.delete(key); return true;
  }

  /** getAllNodes: Devuelve todos los Vértices para dibujar la red en la interfaz. O(V) */
  getAllNodes() { return Array.from(this.nodes.values()); }

  /** addEdge: Crea una Arista (conexión) dirigida desde key1 hacia key2 con peso. O(1) */
  addEdge(key1, key2, weight = {}) {
    const node1 = this.nodes.get(key1); const node2 = this.nodes.get(key2);
    if (!node1 || !node2) throw new Error(`Cannot add edge: node not found`);
    if (this.hasEdge(key1, key2)) return;
    node1.edges.push({ node: key2, distance: weight.distance || 0, cost: weight.cost || 0 });
  }

  /** removeEdge: Elimina la Arista de conexión entre key1 y key2. O(E) */
  removeEdge(key1, key2) {
    const n1 = this.nodes.get(key1);
    if (!n1) return false;
    const l1 = n1.edges.length;
    n1.edges = n1.edges.filter((e) => e.node !== key2);
    return n1.edges.length < l1;
  }

  /** hasEdge: Verifica si existe una ruta directa de key1 a key2. O(E) */
  hasEdge(key1, key2) {
    const node = this.nodes.get(key1);
    return node ? node.edges.some((e) => e.node === key2) : false;
  }

  /** getEdgeWeight: Obtiene el costo/distancia de un trayecto (Arista). O(E) */
  getEdgeWeight(key1, key2) {
    const node = this.nodes.get(key1); if (!node) return null;
    const edge = node.edges.find((e) => e.node === key2);
    return edge ? { distance: edge.distance, cost: edge.cost } : null;
  }

  /** getNeighbors: Devuelve las ciudades conectadas directamente desde un nodo. O(1) */
  getNeighbors(key) { const node = this.nodes.get(key); return node ? [...node.edges] : []; }

  /** traverseBFS: Recorrido a lo ancho. Útil para buscar conexiones por proximidad. O(V + E) */
  traverseBFS(startKey, callback) {
    const startNode = this.nodes.get(startKey); if (!startNode) return;
    const visited = new Set(); const queue = [[startKey, 0]]; let front = 0;
    visited.add(startKey);
    while (front < queue.length) {
      const [currentKey, depth] = queue[front]; front++;
      callback(this.nodes.get(currentKey), depth);
      for (const edge of this.nodes.get(currentKey).edges) {
        if (!visited.has(edge.node)) { visited.add(edge.node); queue.push([edge.node, depth + 1]); }
      }
    }
  }

  /** traverseDFS: Recorrido en profundidad. Explora un camino hasta el final antes de devolverse. O(V + E) */
  traverseDFS(startKey, callback) {
    const startNode = this.nodes.get(startKey); if (!startNode) return;
    const visited = new Set(); const stack = [startKey];
    while (stack.length > 0) {
      const currentKey = stack.pop();
      if (visited.has(currentKey)) continue; visited.add(currentKey);
      callback(this.nodes.get(currentKey));
      for (const edge of this.nodes.get(currentKey).edges) { if (!visited.has(edge.node)) stack.push(edge.node); }
    }
  }

  /** calculateRouteTotals: Suma el peso total (distancia/costo) de una ruta en la interfaz. O(Ruta) */
  calculateRouteTotals(route) {
    let totalDistance = 0; let totalCost = 0; const segments = [];
    for (let i = 0; i < route.length - 1; i++) {
      const weight = this.getEdgeWeight(route[i], route[i + 1]);
      if (weight) {
        totalDistance += weight.distance; totalCost += weight.cost;
        segments.push({ from: route[i], to: route[i + 1], distance: weight.distance, cost: weight.cost });
      } else {
        segments.push({ from: route[i], to: route[i + 1], distance: null, cost: null, connected: false });
      }
    }
    return { totalDistance, totalCost, segments };
  }

  /** getNodeCount: Cuenta los Vértices totales. O(1) */
  getNodeCount() { return this.nodes.size; }
  /** getEdgeCount: Cuenta las Aristas totales. O(V) */
  getEdgeCount() { let c = 0; this.nodes.forEach((n) => { c += n.edges.length; }); return c; }
  /** isEmpty: Retorna true si el Grafo no tiene ciudades. O(1) */
  isEmpty() { return this.nodes.size === 0; }
}
