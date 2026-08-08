import assert from "node:assert/strict";
import { kahn } from "../../implementations/javascript/kahn.js";
import scenariosDocument from "../../scenarios.json" with { type: "json" };

for (const scenario of scenariosDocument.scenarios) {
  const result = kahn({
    vertices: scenario.vertices,
    edges: scenario.edges
  });

  assert.equal(result.status, scenario.expected.status, scenario.id);
  assert.equal(new Set(result.order).size, result.order.length, scenario.id);
  assert.ok(result.order.every((vertex) => scenario.vertices.includes(vertex)), scenario.id);

  if (scenario.expected.order) assert.deepEqual(result.order, scenario.expected.order, scenario.id);
  if (scenario.expected.blocked) assert.deepEqual(result.blocked, scenario.expected.blocked, scenario.id);
}
