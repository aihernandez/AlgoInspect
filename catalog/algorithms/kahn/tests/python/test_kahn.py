import pytest

from catalog.algorithms.kahn.implementations.python.kahn import Graph, kahn


@pytest.mark.parametrize(
    ("case_name", "vertices", "edges", "expected"),
    [
        pytest.param("empty | vertices=[] | edges=[] | complete", [], [], {"status": "complete", "order": [], "blocked": []}),
        pytest.param("single | vertices=[A] | edges=[] | complete", ["A"], [], {"status": "complete", "order": ["A"], "blocked": []}),
        pytest.param("isolated | vertices=[A,B,C] | edges=[] | complete", ["A", "B", "C"], [], {"status": "complete", "order": ["A", "B", "C"], "blocked": []}),
        pytest.param("chain | vertices=[A,B,C,D] | edges=[A->B,B->C,C->D] | complete", ["A", "B", "C", "D"], [("A", "B"), ("B", "C"), ("C", "D")], {"status": "complete", "order": ["A", "B", "C", "D"], "blocked": []}),
        pytest.param("branching | vertices=[A,B,C,D,E,F] | converging DAG | complete", ["A", "B", "C", "D", "E", "F"], [("A", "B"), ("A", "C"), ("B", "D"), ("C", "E"), ("D", "F"), ("E", "F")], {"status": "complete", "emitsAll": True, "blocked": []}),
        pytest.param("disconnected | vertices=[A,B,C,D,E] | edges=[A->B,C->D] | complete", ["A", "B", "C", "D", "E"], [("A", "B"), ("C", "D")], {"status": "complete", "emitsAll": True, "blocked": []}),
        pytest.param("self-loop | vertices=[A] | edges=[A->A] | cycle", ["A"], [("A", "A")], {"status": "cycle", "order": [], "blocked": ["A"]}),
        pytest.param("duplicate-edge | vertices=[A,B,C] | edges=[A->B,A->B,B->C] | complete", ["A", "B", "C"], [("A", "B"), ("A", "B"), ("B", "C")], {"status": "complete", "order": ["A", "B", "C"], "blocked": []}),
        pytest.param("dependencies | vertices=[A,B,C,D,E,F] | multiple sources | complete", ["A", "B", "C", "D", "E", "F"], [("A", "C"), ("A", "D"), ("B", "D"), ("C", "E"), ("D", "E"), ("D", "F"), ("E", "F")], {"status": "complete", "emitsAll": True, "blocked": []}),
        pytest.param("cycle | vertices=[A,B,C,D,E,F] | edges contain C<->D | cycle", ["A", "B", "C", "D", "E", "F"], [("A", "B"), ("A", "E"), ("B", "C"), ("C", "D"), ("D", "C"), ("E", "F")], {"status": "cycle", "order": ["A", "B", "E", "F"], "blocked": ["C", "D"]}),
    ],
    ids=lambda case: case if isinstance(case, str) else None,
)
def test_kahn_returns_expected_result(case_name, vertices, edges, expected) -> None:
    result = kahn(Graph(vertices, edges))
    assert result.status == expected["status"], case_name
    assert len(set(result.order)) == len(result.order), case_name
    assert all(vertex in vertices for vertex in result.order), case_name
    if len(result.order) == len(vertices):
        positions = {vertex: index for index, vertex in enumerate(result.order)}
        for source, target in edges:
            assert positions[source] < positions[target], case_name
    if "order" in expected:
        assert result.order == expected["order"], case_name
    if "blocked" in expected:
        assert result.blocked == expected["blocked"], case_name
    if expected.get("emitsAll"):
        assert len(result.order) == len(vertices), case_name


def test_kahn_rejects_unknown_vertex() -> None:
    with pytest.raises(ValueError, match="vértices existentes"):
        kahn(Graph(["A"], [("A", "B")]))
