import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vendorRoot = path.join(repositoryRoot, "src", "frontend", "public", "vendor");

const assets = [
  ["node_modules/d3/dist/d3.min.js", "d3/d3.min.js"],
  ["node_modules/cytoscape/dist/cytoscape.min.js", "cytoscape/cytoscape.min.js"],
  ["node_modules/mermaid/dist/mermaid.min.js", "mermaid/mermaid.min.js"],
  ["node_modules/monaco-editor/min/vs", "monaco/vs"],
];

await rm(vendorRoot, { recursive: true, force: true });
await mkdir(vendorRoot, { recursive: true });

for (const [source, destination] of assets) {
  const resolvedDestination = path.join(vendorRoot, destination);
  await mkdir(path.dirname(resolvedDestination), { recursive: true });
  await cp(path.join(repositoryRoot, source), resolvedDestination, {
    recursive: true,
    force: true,
  });
}

console.log(`Vendored ${assets.length} browser dependencies in ${vendorRoot}`);
