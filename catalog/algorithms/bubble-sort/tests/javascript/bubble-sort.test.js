import assert from "node:assert/strict";
import test from "node:test";
import { bubbleSort } from "../../implementations/javascript/bubble-sort.js";

const cases = [
  ["empty | values=[]", [], [], 0,0,0,false], ["single | values=[5]", [5],[5],0,0,0,false], ["sorted | values=[1,2,3,4]", [1,2,3,4],[1,2,3,4],3,0,1,true], ["reverse | values=[4,3,2,1]", [4,3,2,1],[1,2,3,4],6,6,3,false], ["mixed | values=[5,1,4,2,8]", [5,1,4,2,8],[1,2,4,5,8],9,4,3,true],
  ["duplicates | values=[3,1,2,1,3]", [3,1,2,1,3],[1,1,2,3,3]], ["negatives | values=[-1,-3,2,0]", [-1,-3,2,0],[-3,-1,0,2]], ["sorted-duplicates | values=[1,1,2,2]", [1,1,2,2],[1,1,2,2],undefined,undefined,undefined,true], ["two-swapped | values=[2,1]", [2,1],[1,2],1,1,1,false], ["all-equal | values=[7,7,7]", [7,7,7],[7,7,7],2,0,1,true], ["zero-crossing | values=[0,3,-2,1,-1]", [0,3,-2,1,-1],[-2,-1,0,1,3]]
];
for (const [caseName, values, expected, comparisons, swaps, passes, terminatedEarly] of cases) test(caseName, () => {
  const input = [...values], result = bubbleSort(input); assert.deepEqual(result.values, expected); assert.deepEqual(input, expected);
  if (comparisons !== undefined) assert.equal(result.comparisons, comparisons); if (swaps !== undefined) assert.equal(result.swaps, swaps); if (passes !== undefined) assert.equal(result.passes, passes); if (terminatedEarly !== undefined) assert.equal(result.terminatedEarly, terminatedEarly);
});
