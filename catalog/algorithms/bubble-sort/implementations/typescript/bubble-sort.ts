export type BubbleSortResult = {
  values: number[];
  comparisons: number;
  swaps: number;
  passes: number;
  terminatedEarly: boolean;
};

export function bubbleSort(values: number[]): BubbleSortResult {
  let comparisons = 0;
  let swaps = 0;
  let passes = 0;
  let terminatedEarly = false;

  for (let end = values.length - 1; end > 0; end -= 1) {
    let swapped = false;
    passes += 1;

    for (let index = 0; index < end; index += 1) {
      comparisons += 1;
      if (values[index] <= values[index + 1]) continue;
      [values[index], values[index + 1]] = [values[index + 1], values[index]];
      swaps += 1;
      swapped = true;
    }

    if (swapped) continue;
    terminatedEarly = true;
    break;
  }

  return { values, comparisons, swaps, passes, terminatedEarly };
}
