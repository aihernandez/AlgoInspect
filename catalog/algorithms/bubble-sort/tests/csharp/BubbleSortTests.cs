using AlgorithmAnalysis.BubbleSort;
using Xunit;

public sealed class BubbleSortTests
{
    public static TheoryData<string, int[], int[]> Cases => new()
    {
        { "empty", [], [] },
        { "single", [5], [5] },
        { "sorted", [1, 2, 3, 4], [1, 2, 3, 4] },
        { "reverse", [4, 3, 2, 1], [1, 2, 3, 4] },
        { "mixed", [5, 1, 4, 2, 8], [1, 2, 4, 5, 8] },
        { "duplicates", [3, 1, 2, 1, 3], [1, 1, 2, 3, 3] },
        { "negatives", [-1, -3, 2, 0], [-3, -1, 0, 2] },
        { "sorted-duplicates", [1, 1, 2, 2], [1, 1, 2, 2] },
        { "two-swapped", [2, 1], [1, 2] },
        { "all-equal", [7, 7, 7], [7, 7, 7] },
        { "zero-crossing", [0, 3, -2, 1, -1], [-2, -1, 0, 1, 3] }
    };

    [Theory]
    [MemberData(nameof(Cases))]
    public void Execute_sorts_in_place(string caseName, int[] input, int[] expected)
    {
        BubbleSortResult result = BubbleSortAlgorithm.Execute(input);

        Assert.Equal(expected, result.Values);
        Assert.Equal(expected, input);
    }
}
