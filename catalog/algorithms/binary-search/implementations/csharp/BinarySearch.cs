namespace AlgorithmAnalysis.BinarySearch;

public static class BinarySearchAlgorithm
{
    public static int Find(IReadOnlyList<int> values, int target)
    {
        var low = 0;
        var high = values.Count - 1;

        while (low <= high)
        {
            int middle = low + ((high - low) / 2);
            int candidate = values[middle];

            if (candidate == target)
            {
                return middle;
            }

            if (candidate < target)
            {
                low = middle + 1;
            }
            else
            {
                high = middle - 1;
            }
        }

        return -1;
    }
}
