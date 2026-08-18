using AlgorithmAnalysis.BinarySearch;
using Xunit;

public sealed class BinarySearchTests
{
    public static TheoryData<string, int[], int, int> Cases => new()
    {
        { "empty", [], 7, -1 },
        { "single-found", [5], 5, 0 },
        { "single-missing", [5], 2, -1 },
        { "first", [2, 4, 6, 8, 10], 2, 0 },
        { "middle", [2, 4, 6, 8, 10], 6, 2 },
        { "last", [2, 4, 6, 8, 10], 10, 4 },
        { "missing-between", [2, 4, 6, 8, 10], 7, -1 },
        { "missing-outside", [-5, -1, 0, 3, 9], 10, -1 },
        { "duplicates", [1, 2, 2, 2, 3], 2, 2 },
        { "negatives", [-10, -4, -1, 0, 7], -4, 1 },
        { "two-values", [4, 9], 9, 1 }
    };
    [Theory] [MemberData(nameof(Cases))]
    public void Find_returns_expected_index(string caseName, int[] values, int target, int expectedIndex)
    {
        int index = BinarySearchAlgorithm.Find(values, target);
        Assert.Equal(expectedIndex, index);
        if (index >= 0) Assert.Equal(target, values[index]);
    }
}
