from dataclasses import dataclass


@dataclass(frozen=True)
class BubbleSortResult:
    values: list[int]
    comparisons: int
    swaps: int
    passes: int
    terminated_early: bool


def bubble_sort(values: list[int]) -> BubbleSortResult:
    comparisons = 0
    swaps = 0
    passes = 0
    terminated_early = False

    for end in range(len(values) - 1, 0, -1):
        swapped = False
        passes += 1

        for index in range(end):
            comparisons += 1
            if values[index] <= values[index + 1]:
                continue
            values[index], values[index + 1] = values[index + 1], values[index]
            swaps += 1
            swapped = True

        if swapped:
            continue
        terminated_early = True
        break

    return BubbleSortResult(values.copy(), comparisons, swaps, passes, terminated_early)
