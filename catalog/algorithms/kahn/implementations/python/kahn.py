from collections import deque
from dataclasses import dataclass


@dataclass(frozen=True)
class Graph:
    vertices: list[str]
    edges: list[tuple[str, str]]


@dataclass(frozen=True)
class KahnResult:
    status: str
    order: list[str]
    blocked: list[str]


def kahn(graph: Graph) -> KahnResult:
    indegree = {vertex: 0 for vertex in graph.vertices}
    outgoing = {vertex: [] for vertex in graph.vertices}

    for source, target in graph.edges:
        if source not in indegree or target not in indegree:
            raise ValueError("Cada arista debe referenciar vértices existentes")

        indegree[target] += 1
        outgoing[source].append(target)

    pending = deque(vertex for vertex in graph.vertices if indegree[vertex] == 0)
    order: list[str] = []

    while pending:
        current = pending.popleft()
        order.append(current)

        for successor in outgoing[current]:
            indegree[successor] -= 1
            if indegree[successor] == 0:
                pending.append(successor)

    emitted = set(order)
    blocked = [vertex for vertex in graph.vertices if vertex not in emitted]
    status = "complete" if not blocked else "cycle"
    return KahnResult(status, order, blocked)
