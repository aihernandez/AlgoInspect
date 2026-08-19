export type Graph = {
  vertices: string[];
  edges: Array<readonly [source: string, target: string]>;
};

export type KahnResult = {
  status: "complete" | "cycle";
  order: string[];
  blocked: string[];
};

export function kahn(graph: Graph): KahnResult {
  const indegree = new Map(graph.vertices.map((vertex) => [vertex, 0]));
  const outgoing = new Map(graph.vertices.map((vertex) => [vertex, [] as string[]]));

  for (const [source, target] of graph.edges) {
    if (!indegree.has(source) || !indegree.has(target)) {
      throw new Error("Cada arista debe referenciar vértices existentes");
    }

    indegree.set(target, indegree.get(target)! + 1);
    outgoing.get(source)!.push(target);
  }

  const queue = graph.vertices.filter((vertex) => indegree.get(vertex) === 0);
  const order: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    for (const successor of outgoing.get(current)!) {
      const remainingDependencies = indegree.get(successor)! - 1;
      indegree.set(successor, remainingDependencies);
      if (remainingDependencies === 0) {
        queue.push(successor);
      }
    }
  }

  const emitted = new Set(order);
  const blocked = graph.vertices.filter((vertex) => !emitted.has(vertex));
  return { status: blocked.length === 0 ? "complete" : "cycle", order, blocked };
}
