/**
 * Searching — Lineal (parcial) + Binaria (exacta)
 */
export function linearSearch(array, predicate) {
  const results = [];
  for (let i = 0; i < array.length; i++) { if (predicate(array[i])) results.push(array[i]); }
  return results;
}

export function linearSearchFirst(array, predicate) {
  for (let i = 0; i < array.length; i++) { if (predicate(array[i])) return array[i]; }
  return null;
}

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

export function searchByText(array, query, getField) {
  if (!query || query.trim() === '') return [...array];
  const lowerQuery = query.toLowerCase().trim();
  return linearSearch(array, (element) => {
    const fieldValue = getField(element);
    return fieldValue.toLowerCase().includes(lowerQuery);
  });
}
