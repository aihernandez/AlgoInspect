using AlgorithmAnalysis.Kahn;
using Xunit;

public sealed class KahnTests
{
    public static TheoryData<string, string[], (string, string)[], string, string[]?, string[], bool> Cases => new()
    {
        { "empty | vertices=[] | edges=[]", [], [], "complete", [], [], false },
        { "single | vertices=[A] | edges=[]", ["A"], [], "complete", ["A"], [], false },
        { "isolated | vertices=[A,B,C] | edges=[]", ["A", "B", "C"], [], "complete", ["A", "B", "C"], [], false },
        { "chain | vertices=[A,B,C,D] | edges=[A->B,B->C,C->D]", ["A", "B", "C", "D"], [("A", "B"), ("B", "C"), ("C", "D")], "complete", ["A", "B", "C", "D"], [], false },
        { "branching | vertices=[A,B,C,D,E,F] | converging DAG", ["A", "B", "C", "D", "E", "F"], [("A", "B"), ("A", "C"), ("B", "D"), ("C", "E"), ("D", "F"), ("E", "F")], "complete", null, [], true },
        { "disconnected | vertices=[A,B,C,D,E] | edges=[A->B,C->D]", ["A", "B", "C", "D", "E"], [("A", "B"), ("C", "D")], "complete", null, [], true },
        { "self-loop | vertices=[A] | edges=[A->A]", ["A"], [("A", "A")], "cycle", [], ["A"], false },
        { "duplicate-edge | vertices=[A,B,C] | edges=[A->B,A->B,B->C]", ["A", "B", "C"], [("A", "B"), ("A", "B"), ("B", "C")], "complete", ["A", "B", "C"], [], false },
        { "dependencies | vertices=[A,B,C,D,E,F] | multiple sources", ["A", "B", "C", "D", "E", "F"], [("A", "C"), ("A", "D"), ("B", "D"), ("C", "E"), ("D", "E"), ("D", "F"), ("E", "F")], "complete", null, [], true },
        { "cycle | vertices=[A,B,C,D,E,F] | edges contain C<->D", ["A", "B", "C", "D", "E", "F"], [("A", "B"), ("A", "E"), ("B", "C"), ("C", "D"), ("D", "C"), ("E", "F")], "cycle", ["A", "B", "E", "F"], ["C", "D"], false },
    };

    [Theory]
    [MemberData(nameof(Cases))]
    public void Execute_returns_expected_result(
        string caseName, string[] vertices, (string, string)[] edges, string expectedStatus,
        string[]? expectedOrder, string[] expectedBlocked, bool emitsAll)
    {
        KahnResult result = KahnAlgorithm.Execute(new Graph(vertices, edges));

        Assert.Equal(expectedStatus, result.Status);
        Assert.Equal(result.Order.Distinct().Count(), result.Order.Count);
        Assert.All(result.Order, vertex => Assert.Contains(vertex, vertices));
        if (result.Order.Count == vertices.Length)
        {
            var positions = result.Order.Select((vertex, index) => (vertex, index)).ToDictionary(item => item.vertex, item => item.index);
            Assert.All(edges, edge => Assert.True(positions[edge.Item1] < positions[edge.Item2], caseName));
        }
        if (expectedOrder is not null) Assert.Equal(expectedOrder, result.Order);
        Assert.Equal(expectedBlocked, result.Blocked);
        if (emitsAll) Assert.Equal(vertices.Length, result.Order.Count);
    }

    [Fact]
    public void Execute_rejects_unknown_vertex()
    {
        ArgumentException exception = Assert.Throws<ArgumentException>(() => KahnAlgorithm.Execute(new Graph(["A"], [("A", "B")])));
        Assert.Contains("vértices existentes", exception.Message, StringComparison.Ordinal);
    }
}
