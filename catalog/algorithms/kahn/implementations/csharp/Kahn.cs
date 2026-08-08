namespace AlgorithmAnalysis.Kahn;

public sealed record Graph(IReadOnlyList<string> Vertices, IReadOnlyList<(string Source, string Target)> Edges);
public sealed record KahnResult(string Status, IReadOnlyList<string> Order, IReadOnlyList<string> Blocked);

public static class KahnAlgorithm
{
    public static KahnResult Execute(Graph graph)
    {
        var indegree = graph.Vertices.ToDictionary(vertex => vertex, _ => 0);
        var outgoing = graph.Vertices.ToDictionary(vertex => vertex, _ => new List<string>());

        foreach (var (source, target) in graph.Edges)
        {
            if (!indegree.ContainsKey(source) || !indegree.ContainsKey(target))
                throw new ArgumentException("Cada arista debe referenciar vértices existentes.", nameof(graph));

            indegree[target]++;
            outgoing[source].Add(target);
        }

        var queue = new Queue<string>(graph.Vertices.Where(vertex => indegree[vertex] == 0));
        var order = new List<string>();

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            order.Add(current);

            foreach (var successor in outgoing[current])
            {
                indegree[successor]--;
                if (indegree[successor] == 0) queue.Enqueue(successor);
            }
        }

        var blocked = graph.Vertices.Where(vertex => !order.Contains(vertex)).ToArray();
        return new KahnResult(blocked.Length == 0 ? "complete" : "cycle", order, blocked);
    }
}
