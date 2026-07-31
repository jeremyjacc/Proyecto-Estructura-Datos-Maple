/**
 * Sorting — MergeSort (estable) + QuickSort (rápido)
 */
const defaultComparator = (a, b) => { if (a < b) return -1; if (a > b) return 1; return 0; };

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

export function mergeSort(array, comparator = defaultComparator) {
  if (array.length <= 1) return [...array];
  const mid = Math.floor(array.length / 2);
  const sortedLeft = mergeSort(array.slice(0, mid), comparator);
  const sortedRight = mergeSort(array.slice(mid), comparator);
  return merge(sortedLeft, sortedRight, comparator);
}

export function quickSort(array, comparator = defaultComparator) {
  if (array.length <= 1) return [...array];
  const pivot = array[Math.floor(array.length / 2)];
  const less = []; const equal = []; const greater = [];
  for (let i = 0; i < array.length; i++) {
    const c = comparator(array[i], pivot);
    if (c < 0) less.push(array[i]); else if (c > 0) greater.push(array[i]); else equal.push(array[i]);
  }
  return [...quickSort(less, comparator), ...equal, ...quickSort(greater, comparator)];
}
