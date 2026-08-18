import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publishRoot = path.join(repositoryRoot, "artifacts", "publish");
const expectedParent = path.join(repositoryRoot, "artifacts");

if (path.dirname(publishRoot) !== expectedParent) {
  throw new Error("La salida de publicación no está dentro de artifacts.");
}

await rm(publishRoot, { recursive: true, force: true });
console.log(`Cleaned publish output ${publishRoot}`);
