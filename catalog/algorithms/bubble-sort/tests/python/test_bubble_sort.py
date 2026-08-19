import importlib.util
from pathlib import Path
import pytest
ROOT = Path(__file__).parents[2]
SPEC = importlib.util.spec_from_file_location("bubble_sort", ROOT / "implementations/python/bubble_sort.py")
MODULE = importlib.util.module_from_spec(SPEC); assert SPEC.loader; SPEC.loader.exec_module(MODULE)

@pytest.mark.parametrize("case_name,values,expected", [
    ("empty | values=[] | sorted=[]", [], []), ("single | values=[5] | sorted=[5]", [5],[5]), ("sorted | values=[1,2,3,4]", [1,2,3,4],[1,2,3,4]), ("reverse | values=[4,3,2,1]", [4,3,2,1],[1,2,3,4]), ("mixed | values=[5,1,4,2,8]", [5,1,4,2,8],[1,2,4,5,8]),
    ("duplicates | values=[3,1,2,1,3]", [3,1,2,1,3],[1,1,2,3,3]), ("negatives | values=[-1,-3,2,0]", [-1,-3,2,0],[-3,-1,0,2]), ("sorted-duplicates | values=[1,1,2,2]", [1,1,2,2],[1,1,2,2]), ("two-swapped | values=[2,1]", [2,1],[1,2]), ("all-equal | values=[7,7,7]", [7,7,7],[7,7,7]), ("zero-crossing | values=[0,3,-2,1,-1]", [0,3,-2,1,-1],[-2,-1,0,1,3])
], ids=lambda value: value if isinstance(value, str) else None)
def test_bubble_sort_sorts_in_place(case_name, values, expected):
    input_values = values.copy(); result = MODULE.bubble_sort(input_values)
    assert result.values == expected, case_name
    assert input_values == expected, case_name
