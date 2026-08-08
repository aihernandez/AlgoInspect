using Xunit;
using AlgorithmAnalysis.Kahn;

public sealed class KahnTests
{
    public static IEnumerable<object[]> Scenarios()
    {
        yield return ["empty", new Graph([], []), "complete", []];
        yield return ["single", new Graph(["A"], []), "complete", ["A"]];
        yield return ["isolated", new Graph(["A", "B", "C"], []), "complete", ["A", "B", "C"]];
        yield return ["chain", new Graph(["A", "B", "C", "D"], [("A", "B"), ("B", "C"), ("C", "D")]), "complete", ["A", "B", "C", "D"]];
        yield return ["branching", new Graph(["A", "B", "C", "D", "E", "F"], [("A", "B"), ("A", "C"), ("B", "D"), ("C", "E"), ("D", "F"), ("E", "F")]), "complete", null];
        yield return ["disconnected", new Graph(["A", "B", "C", "D", "E"], [("A", "B"), ("C", "D")]), "complete", null];
        yield return ["self-loop", new Graph(["A"], [("A", "A")]), "cycle", []];
        yield return ["duplicate-edge", new Graph(["A", "B", "C"], [("A", "B"), ("A", "B"), ("B", "C")]), "complete", ["A", "B", "C"]];
        yield return ["dependencies", new Graph(["A", "B", "C", "D", "E", "F"], [("A", "C"), ("A", "D"), ("B", "D"), ("C", "E"), ("D", "E"), ("D", "F"), ("E", "F")]), "complete", null];
        yield return ["cycle", new Graph(["A", "B", "C", "D", "E", "F"], [("A", "B"), ("A", "E"), ("B", "C"), ("C", "D"), ("D", "C"), ("E", "F")]), "cycle", ["A", "B", "E", "F"]];
    }

    [Theory]
    [MemberData(nameof(Scenarios))]
    public void Executes_expected_scenario(string id, Graph graph, string expectedStatus, string[]? expectedOrder)
    {
        var result = KahnAlgorithm.Execute(graph);

        Assert.Equal(expectedStatus, result.Status);
        Assert.Equal(result.Order.Distinct().Count(), result.Order.Count);
        Assert.All(result.Order, vertex => Assert.Contains(vertex, graph.Vertices));

        if (expectedOrder is not null)
            Assert.Equal(expectedOrder, result.Order);
    }

    [Fact]
    public void Rejects_edge_with_unknown_vertex()
    {
        var graph = new Graph(["A"], [("A", "B")]);
        Assert.Throws<ArgumentException>(() => KahnAlgorithm.Execute(graph));
    }
}
