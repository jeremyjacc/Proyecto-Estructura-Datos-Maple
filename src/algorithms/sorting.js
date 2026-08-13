/**
 * Sorting — MergeSort (estable) + QuickSort (rápido)
 */
const defaultComparator = (a, b) => { if (a < b) return -1; if (a > b) return 1; return 0; };

/**
 * Función auxiliar para MergeSort.
 * Mezcla dos arreglos que ya están ordenados (left y right) en un solo arreglo ordenado.
 */
function merge(left, right, comparator) {
  const result = []; let i = 0; let j = 0;
  while (i < left.length && j < right.length) {
    if (comparator(left[i], right[j]) <= 0) { result.push(left[i]); i++; }
    else { result.push(right[j]); j++; }
  }
  while (i < left.length) { result.push(left[i]); i++; }
  while (j < right.length) { result.push(right[j]); j++; }
  return result;
}

/**
 * Merge Sort (Ordenamiento por Mezcla) - Complejidad: O(n log n) -EL CUASI LINEAL
 * Lógica: "Divide y Vencerás". Parte el arreglo en mitades hasta tener elementos individuales, 
 * luego los vuelve a juntar (merge) en orden.
 * Es ESTABLE (respeta el orden original si dos valores son iguales).
 * Uso en Interfaz: En ExplorePage.jsx para ordenar por "Nombre (A-Z)" y "Precio".
 */
export function mergeSort(array, comparator = defaultComparator) {
  if (array.length <= 1) return [...array];

  const comp = typeof comparator === 'string'
    ? (a, b) => { if (a[comparator] < b[comparator]) return -1; if (a[comparator] > b[comparator]) return 1; return 0; }
    : comparator;

  const mid = Math.floor(array.length / 2);
  const sortedLeft = mergeSort(array.slice(0, mid), comp);
  const sortedRight = mergeSort(array.slice(mid), comp);
  return merge(sortedLeft, sortedRight, comp);
}

/**
 * Quick Sort (Ordenamiento Rápido) - Complejidad Promedio: O(n log n)
 * Lógica: Elige un elemento "pivote" (el del centro). Manda todos los menores a su izquierda 
 * y los mayores a su derecha. Luego repite el proceso recursivamente.
 * Es INESTABLE (no garantiza respetar el orden previo en caso de empates).
 * Uso en Interfaz: En ExplorePage.jsx para ordenar por "Más Populares".
 */
export function quickSort(array, comparator = defaultComparator) {
  if (array.length <= 1) return [...array];

  const comp = typeof comparator === 'string'
    ? (a, b) => { if (a[comparator] < b[comparator]) return -1; if (a[comparator] > b[comparator]) return 1; return 0; }
    : comparator;

  const pivot = array[Math.floor(array.length / 2)];
  const less = []; const equal = []; const greater = [];
  for (let i = 0; i < array.length; i++) {
    const c = comp(array[i], pivot);
    if (c < 0) less.push(array[i]); else if (c > 0) greater.push(array[i]); else equal.push(array[i]);
  }
  return [...quickSort(less, comp), ...equal, ...quickSort(greater, comp)];
}
