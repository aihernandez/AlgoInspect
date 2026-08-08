export function kahn(graph) {
  const indegree = Object.fromEntries(graph.vertices.map((vertex) => [vertex, 0]));
  const outgoing = Object.fromEntries(graph.vertices.map((vertex) => [vertex, []]));

  for (const [source, target] of graph.edges) {
    if (!(source in indegree) || !(target in indegree)) throw new Error("Cada arista debe referenciar vértices existentes");
    indegree[target] += 1;
    outgoing[source].push(target);
  }

  const queue = graph.vertices.filter((vertex) => indegree[vertex] === 0);
  const order = [];

  while (queue.length) {
    const current = queue.shift();
    order.push(current);
    for (const successor of outgoing[current]) {
      indegree[successor] -= 1;
      if (indegree[successor] === 0) queue.push(successor);
    }
  }

  const blocked = graph.vertices.filter((vertex) => !order.includes(vertex));
  return {
    status: blocked.length ? "cycle" : "complete",
    order,
    blocked
  };
}
