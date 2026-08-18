import { strict as assert } from "node:assert";
import test from "node:test";
import { kahn, type Graph } from "../../implementations/typescript/kahn.ts";

type Expected = { status: "complete" | "cycle"; order?: string[]; blocked?: string[]; emitsAll?: boolean };
type Edge = [string, string];

test("empty | vertices=[] | edges=[] | complete", () => assertScenario([], [], { status: "complete", order: [], blocked: [] }));
test("single | vertices=[A] | edges=[] | complete", () => assertScenario(["A"], [], { status: "complete", order: ["A"], blocked: [] }));
test("isolated | vertices=[A,B,C] | edges=[] | complete", () => assertScenario(["A", "B", "C"], [], { status: "complete", order: ["A", "B", "C"], blocked: [] }));
test("chain | vertices=[A,B,C,D] | edges=[A->B,B->C,C->D] | complete", () => assertScenario(["A", "B", "C", "D"], [["A", "B"], ["B", "C"], ["C", "D"]], { status: "complete", order: ["A", "B", "C", "D"], blocked: [] }));
test("branching | vertices=[A,B,C,D,E,F] | converging DAG | complete", () => assertScenario(["A", "B", "C", "D", "E", "F"], [["A", "B"], ["A", "C"], ["B", "D"], ["C", "E"], ["D", "F"], ["E", "F"]], { status: "complete", emitsAll: true, blocked: [] }));
test("disconnected | vertices=[A,B,C,D,E] | edges=[A->B,C->D] | complete", () => assertScenario(["A", "B", "C", "D", "E"], [["A", "B"], ["C", "D"]], { status: "complete", emitsAll: true, blocked: [] }));
test("self-loop | vertices=[A] | edges=[A->A] | cycle", () => assertScenario(["A"], [["A", "A"]], { status: "cycle", order: [], blocked: ["A"] }));
test("duplicate-edge | vertices=[A,B,C] | edges=[A->B,A->B,B->C] | complete", () => assertScenario(["A", "B", "C"], [["A", "B"], ["A", "B"], ["B", "C"]], { status: "complete", order: ["A", "B", "C"], blocked: [] }));
test("dependencies | vertices=[A,B,C,D,E,F] | multiple sources | complete", () => assertScenario(["A", "B", "C", "D", "E", "F"], [["A", "C"], ["A", "D"], ["B", "D"], ["C", "E"], ["D", "E"], ["D", "F"], ["E", "F"]], { status: "complete", emitsAll: true, blocked: [] }));
test("cycle | vertices=[A,B,C,D,E,F] | edges contain C<->D | cycle", () => assertScenario(["A", "B", "C", "D", "E", "F"], [["A", "B"], ["A", "E"], ["B", "C"], ["C", "D"], ["D", "C"], ["E", "F"]], { status: "cycle", order: ["A", "B", "E", "F"], blocked: ["C", "D"] }));
test("unknown-vertex | vertices=[A] | edges=[A->B] | invalid", () => assert.throws(() => kahn({ vertices: ["A"], edges: [["A", "B"]] }), /vértices existentes/));

function assertScenario(vertices: string[], edges: Edge[], expected: Expected): void {
  const result = kahn({ vertices, edges } satisfies Graph);
  assert.equal(result.status, expected.status);
  assert.equal(new Set(result.order).size, result.order.length);
  assert.ok(result.order.every((vertex) => vertices.includes(vertex)));
  if (result.order.length === vertices.length) {
    const positions = new Map(result.order.map((vertex, index) => [vertex, index]));
    for (const [source, target] of edges) assert.ok(positions.get(source)! < positions.get(target)!);
  }
  if (expected.order) assert.deepEqual(result.order, expected.order);
  if (expected.blocked) assert.deepEqual(result.blocked, expected.blocked);
  if (expected.emitsAll) assert.equal(result.order.length, vertices.length);
}
