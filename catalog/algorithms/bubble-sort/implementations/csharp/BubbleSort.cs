namespace AlgorithmAnalysis.BubbleSort;

public sealed record BubbleSortResult(
    IReadOnlyList<int> Values,
    int Comparisons,
    int Swaps,
    int Passes,
    bool TerminatedEarly);

public static class BubbleSortAlgorithm
{
    public static BubbleSortResult Execute(IList<int> values)
    {
        var comparisons = 0;
        var swaps = 0;
        var passes = 0;
        var terminatedEarly = false;

        for (int end = values.Count - 1; end > 0; end--)
        {
            var swapped = false;
            passes++;

            for (int index = 0; index < end; index++)
            {
                comparisons++;
                if (values[index] <= values[index + 1]) continue;

                (values[index], values[index + 1]) = (values[index + 1], values[index]);
                swaps++;
                swapped = true;
            }

            if (swapped) continue;
            terminatedEarly = true;
            break;
        }

        return new BubbleSortResult(values.ToArray(), comparisons, swaps, passes, terminatedEarly);
    }
}
