import { strict as assert } from "node:assert";
import test from "node:test";
import { binarySearch } from "../../implementations/typescript/binary-search.ts";

const cases: [string, number[], number, number][] = [
  ["empty | values=[] | target=7 | index=-1", [], 7, -1], ["single-found | values=[5] | target=5 | index=0", [5], 5, 0], ["single-missing | values=[5] | target=2 | index=-1", [5], 2, -1],
  ["first | values=[2,4,6,8,10] | target=2 | index=0", [2, 4, 6, 8, 10], 2, 0], ["middle | values=[2,4,6,8,10] | target=6 | index=2", [2, 4, 6, 8, 10], 6, 2], ["last | values=[2,4,6,8,10] | target=10 | index=4", [2, 4, 6, 8, 10], 10, 4],
  ["missing-between | values=[2,4,6,8,10] | target=7 | index=-1", [2, 4, 6, 8, 10], 7, -1], ["missing-outside | values=[-5,-1,0,3,9] | target=10 | index=-1", [-5, -1, 0, 3, 9], 10, -1],
  ["duplicates | values=[1,2,2,2,3] | target=2 | index=2", [1, 2, 2, 2, 3], 2, 2], ["negatives | values=[-10,-4,-1,0,7] | target=-4 | index=1", [-10, -4, -1, 0, 7], -4, 1], ["two-values | values=[4,9] | target=9 | index=1", [4, 9], 9, 1]
];
for (const [caseName, values, target, expectedIndex] of cases) test(caseName, () => {
  const index = binarySearch(values, target);
  assert.equal(index, expectedIndex); assert.equal(index >= 0 ? "found" : "not-found", expectedIndex >= 0 ? "found" : "not-found");
  if (index >= 0) assert.equal(values[index], target);
});
