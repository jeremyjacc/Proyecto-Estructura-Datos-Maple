/**
 * Tree — Árbol General (n-ario)
 * Propósito: Jerarquía de destinos (Mundo > Continente > País > Ciudad > Lugares).
 */
export class TreeNode {
  constructor(key, data, type) { this.key = key; this.data = data; this.type = type; this.children = []; }
  addChild(childNode) { this.children.push(childNode); }
  isLeaf() { return this.children.length === 0; }
}

export class Tree {
  constructor() { this.root = new TreeNode('world', { name: 'World' }, 'root'); }

  insert(parentKey, key, data, type) {
    const parent = this.find(parentKey);
    if (parent === null) return null;
    const newNode = new TreeNode(key, data, type);
    parent.addChild(newNode);
    return newNode;
  }

  find(key) { return this._findDFS(this.root, key); }

  findByName(query, type) {
    const results = []; const lq = query.toLowerCase();
    this.traverseDFS((node) => {
      const name = node.data.name || '';
      if (name.toLowerCase().includes(lq) && (type ? node.type === type : true)) results.push(node);
    });
    return results;
  }

  getChildren(key) { const node = this.find(key); return node ? node.children : []; }

  getPath(key) { const path = []; this._findPath(this.root, key, path); return path; }

  getNodesByType(type) {
    const results = [];
    this.traverseDFS((node) => { if (node.type === type) results.push(node); });
    return results;
  }

  traverseDFS(callback) { this._dfs(this.root, callback, 0); }

  traverseFrom(key, callback) {
    const node = this.find(key);
    if (node) this._dfs(node, callback, 0);
  }

  getParent(key) {
    const path = this.getPath(key);
    if (path.length >= 2) return path[path.length - 2];
    return null;
  }

  traverseBFS(callback) {
    const queue = [[this.root, 0]]; let front = 0;
    while (front < queue.length) {
      const [node, depth] = queue[front]; front++;
      callback(node, depth);
      for (const child of node.children) queue.push([child, depth + 1]);
    }
  }

  getNodesByLevel(targetLevel) {
    const results = [];
    this.traverseBFS((node, depth) => { if (depth === targetLevel) results.push(node); });
    return results;
  }

  countNodes() { let count = 0; this.traverseDFS(() => { count++; }); return count; }
  height() { return this._height(this.root); }

  _findDFS(node, key) {
    if (node.key === key) return node;
    for (const child of node.children) { const found = this._findDFS(child, key); if (found !== null) return found; }
    return null;
  }

  _findPath(node, key, path) {
    path.push(node);
    if (node.key === key) return true;
    for (const child of node.children) { if (this._findPath(child, key, path)) return true; }
    path.pop();
    return false;
  }

  _dfs(node, callback, depth) { callback(node, depth); for (const child of node.children) this._dfs(child, callback, depth + 1); }

  _height(node) {
    if (node.isLeaf()) return 0;
    let max = 0;
    for (const child of node.children) { const h = this._height(child); if (h > max) max = h; }
    return max + 1;
  }
}
