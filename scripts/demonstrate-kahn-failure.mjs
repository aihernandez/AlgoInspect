import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { kahn } from "../catalog/algorithms/kahn/implementations/javascript/kahn.js";

const scenariosUrl = new URL("../catalog/algorithms/kahn/scenarios.json", import.meta.url);
const { scenarios } = JSON.parse(await readFile(scenariosUrl, "utf8"));
const chain = scenarios.find((scenario) => scenario.id === "chain");
const result = kahn({ vertices: chain.vertices, edges: chain.edges });

assert.equal(
  result.status,
  "cycle",
  `[kahn][javascript][chain] causa: se esperaba deliberadamente cycle, se obtuvo ${result.status}`);
