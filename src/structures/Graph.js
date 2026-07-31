/**
 * Graph — Grafo No Dirigido con Pesos (Lista de Adyacencia)
 * Propósito: Red independiente de conexiones entre ciudades.
 */
export class GraphNode {
  constructor(key, data) { this.key = key; this.data = data; this.edges = []; }
}

export class Graph {
  constructor() { this.nodes = new Map(); }

  addNode(key, data) {
    if (this.nodes.has(key)) throw new Error(`Node "${key}" already exists`);
    const node = new GraphNode(key, data); this.nodes.set(key, node); return node;
  }

  getNode(key) { return this.nodes.get(key) || null; }

  removeNode(key) {
    if (!this.nodes.has(key)) return false;
    this.nodes.forEach((node) => { node.edges = node.edges.filter((e) => e.node !== key); });
    this.nodes.delete(key); return true;
  }

  getAllNodes() { return Array.from(this.nodes.values()); }

  addEdge(key1, key2, weight = {}) {
    const node1 = this.nodes.get(key1); const node2 = this.nodes.get(key2);
    if (!node1 || !node2) throw new Error(`Cannot add edge: node not found`);
    if (this.hasEdge(key1, key2)) return;
    node1.edges.push({ node: key2, distance: weight.distance || 0, cost: weight.cost || 0 });
    node2.edges.push({ node: key1, distance: weight.distance || 0, cost: weight.cost || 0 });
  }

  removeEdge(key1, key2) {
    const n1 = this.nodes.get(key1); const n2 = this.nodes.get(key2);
    if (!n1 || !n2) return false;
    const l1 = n1.edges.length; const l2 = n2.edges.length;
    n1.edges = n1.edges.filter((e) => e.node !== key2);
    n2.edges = n2.edges.filter((e) => e.node !== key1);
    return n1.edges.length < l1 || n2.edges.length < l2;
  }

  hasEdge(key1, key2) {
    const node = this.nodes.get(key1);
    return node ? node.edges.some((e) => e.node === key2) : false;
  }

  getEdgeWeight(key1, key2) {
    const node = this.nodes.get(key1); if (!node) return null;
    const edge = node.edges.find((e) => e.node === key2);
    return edge ? { distance: edge.distance, cost: edge.cost } : null;
  }

  getNeighbors(key) { const node = this.nodes.get(key); return node ? [...node.edges] : []; }

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

  getNodeCount() { return this.nodes.size; }
  getEdgeCount() { let c = 0; this.nodes.forEach((n) => { c += n.edges.length; }); return c / 2; }
  isEmpty() { return this.nodes.size === 0; }
}
