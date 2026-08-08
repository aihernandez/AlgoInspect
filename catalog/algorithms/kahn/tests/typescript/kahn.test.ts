import { strict as assert } from "node:assert";
import { kahn } from "../../implementations/typescript/kahn";

const result = kahn({
  vertices: ["A", "B", "C"],
  edges: [["A", "B"], ["B", "C"]],
});

assert.equal(result.status, "complete");
assert.deepEqual(result.order, ["A", "B", "C"]);
