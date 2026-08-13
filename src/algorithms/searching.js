/**
 * Searching — Lineal (parcial) + Binaria (exacta)
 */
/**
 * Búsqueda Lineal (Linear Search) - Complejidad: O(n)
 * Busca exhaustivamente en el arreglo. No requiere que los datos estén ordenados.
 */
export function linearSearch(array, predicate) {
  const results = [];
  for (let i = 0; i < array.length; i++) { if (predicate(array[i])) results.push(array[i]); }
  return results;
}

/**
 * Búsqueda Lineal Única - Complejidad: O(n)
 * Igual que linearSearch, pero se detiene al encontrar el primer elemento que coincide.
 */
export function linearSearchFirst(array, predicate) {
  for (let i = 0; i < array.length; i++) { if (predicate(array[i])) return array[i]; }
  return null;
}

/**
 * Búsqueda Binaria (Binary Search) - Complejidad: O(log n)
 * REQUISITO: El arreglo debe estar ORDENADO previamente (por ejemplo, con MergeSort).
 * Lógica: "Divide y Vencerás" (descarta la mitad de las opciones en cada paso).
 * Nota: En la interfaz actual no se consume, pero es parte vital de nuestra librería de algoritmos.
 */
export function binarySearch(sortedArray, target, comparator) {
  const compare = comparator || ((a, b) => { if (a < b) return -1; if (a > b) return 1; return 0; });
  let left = 0; let right = sortedArray.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const c = compare(sortedArray[mid], target);
    if (c === 0) return mid; else if (c < 0) left = mid + 1; else right = mid - 1;
  }
  return -1;
}

/**
 * searchByText - Función Helper para la Interfaz (ExplorePage.jsx)
 * Envuelve a linearSearch (O(n)) para filtrar ciudades basándose en texto parcial (ej. escribir "Par").
 */
export function searchByText(array, query, getField) {
  if (!query || query.trim() === '') return [...array];
  const lowerQuery = query.toLowerCase().trim();
  return linearSearch(array, (element) => {
    const fieldValue = getField ? getField(element) : (element.name || '');
    return fieldValue.toLowerCase().includes(lowerQuery);
  });
}
