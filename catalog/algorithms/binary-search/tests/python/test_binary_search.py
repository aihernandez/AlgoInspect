import importlib.util
from pathlib import Path
import pytest

ROOT = Path(__file__).parents[2]
SPEC = importlib.util.spec_from_file_location("binary_search", ROOT / "implementations/python/binary_search.py")
MODULE = importlib.util.module_from_spec(SPEC); assert SPEC.loader; SPEC.loader.exec_module(MODULE)

@pytest.mark.parametrize("case_name,values,target,expected_index", [
    ("empty | values=[] | target=7 | index=-1", [], 7, -1), ("single-found | values=[5] | target=5 | index=0", [5], 5, 0), ("single-missing | values=[5] | target=2 | index=-1", [5], 2, -1),
    ("first | values=[2,4,6,8,10] | target=2 | index=0", [2,4,6,8,10], 2, 0), ("middle | values=[2,4,6,8,10] | target=6 | index=2", [2,4,6,8,10], 6, 2), ("last | values=[2,4,6,8,10] | target=10 | index=4", [2,4,6,8,10], 10, 4),
    ("missing-between | values=[2,4,6,8,10] | target=7 | index=-1", [2,4,6,8,10], 7, -1), ("missing-outside | values=[-5,-1,0,3,9] | target=10 | index=-1", [-5,-1,0,3,9], 10, -1),
    ("duplicates | values=[1,2,2,2,3] | target=2 | index=2", [1,2,2,2,3], 2, 2), ("negatives | values=[-10,-4,-1,0,7] | target=-4 | index=1", [-10,-4,-1,0,7], -4, 1), ("two-values | values=[4,9] | target=9 | index=1", [4,9], 9, 1)
], ids=lambda value: value if isinstance(value, str) else None)
def test_binary_search_returns_expected_index(case_name, values, target, expected_index):
    index = MODULE.binary_search(values, target)
    assert index == expected_index, case_name
    assert ("found" if index >= 0 else "not-found") == ("found" if expected_index >= 0 else "not-found"), case_name
    if index >= 0: assert values[index] == target, case_name
