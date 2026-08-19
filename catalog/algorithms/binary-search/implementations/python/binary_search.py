from collections.abc import Sequence


def binary_search(values: Sequence[int], target: int) -> int:
    low = 0
    high = len(values) - 1

    while low <= high:
        middle = low + (high - low) // 2
        candidate = values[middle]

        if candidate == target:
            return middle
        if candidate < target:
            low = middle + 1
        else:
            high = middle - 1

    return -1
