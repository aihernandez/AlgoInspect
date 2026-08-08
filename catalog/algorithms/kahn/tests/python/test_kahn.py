from catalog.algorithms.kahn.implementations.python.kahn import Graph, kahn


def test_orders_a_chain() -> None:
    result = kahn(Graph(["A", "B", "C"], [("A", "B"), ("B", "C")]))

    assert result.status == "complete"
    assert result.order == ["A", "B", "C"]
