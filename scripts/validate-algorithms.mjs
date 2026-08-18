#!/usr/bin/env node
// Ejecuta la matriz canónica: cada algoritmo del catálogo contra su suite en
// cada lenguaje implementado. Sustituye a validate-algorithms.ps1 y
// validate-kahn.ps1 para que la verificación funcione en cualquier plataforma.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

/** Convierte un identificador del catálogo a las convenciones de cada lenguaje. */
const naming = {
  pascal: (id) => id.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join(""),
  snake: (id) => id.replaceAll("-", "_"),
};

function parseArguments(argv) {
  const options = { algorithm: null, demonstrateFailure: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--demonstrate-failure") {
      options.demonstrateFailure = true;
    } else if (argument === "--algorithm") {
      options.algorithm = argv[index + 1];
      index += 1;
      if (!options.algorithm) {
        fail("--algorithm requiere un identificador, por ejemplo: --algorithm kahn");
      }
    } else {
      fail(`Argumento no reconocido: ${argument}`);
    }
  }

  return options;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

/** Node expone `python` o `python3` según la plataforma. Se elige el disponible. */
function resolvePython() {
  for (const candidate of ["python", "python3"]) {
    const probe = spawnSync(candidate, ["--version"], { stdio: "ignore", shell: false });
    if (probe.status === 0) {
      return candidate;
    }
  }

  fail("No se encontró python ni python3 en el PATH. La matriz canónica los necesita para el perfil Python.");
  return null;
}

function readAlgorithms() {
  const catalogPath = join(repoRoot, "catalog", "catalog.json");
  if (!existsSync(catalogPath)) {
    fail(`No se encontró ${catalogPath}.`);
  }

  return JSON.parse(readFileSync(catalogPath, "utf8")).algorithms;
}

/** Perfiles ejecutables de un algoritmo, uno por lenguaje implementado. */
function buildProfiles(algorithmId, python) {
  const root = join(repoRoot, "catalog", "algorithms", algorithmId);
  const tests = (language, file) => join(root, "tests", language, file);

  return [
    {
      id: `${algorithmId}-csharp`,
      file: tests("csharp", `${naming.pascal(algorithmId)}.CSharp.Tests.csproj`),
      command: (file) => ["dotnet", ["test", file, "--nologo"]],
    },
    {
      id: `${algorithmId}-javascript`,
      file: tests("javascript", `${algorithmId}.test.js`),
      command: (file) => [process.execPath, ["--no-warnings", file]],
    },
    {
      id: `${algorithmId}-typescript`,
      file: tests("typescript", `${algorithmId}.test.ts`),
      command: (file) => [process.execPath, ["--no-warnings", "--experimental-strip-types", file]],
    },
    {
      id: `${algorithmId}-python`,
      file: tests("python", `test_${naming.snake(algorithmId)}.py`),
      command: (file) => [python, ["-m", "pytest", file, "-q"]],
    },
  ];
}

function runProfile(profile) {
  if (!existsSync(profile.file)) {
    fail(`[${profile.id}] no existe el archivo de pruebas esperado: ${profile.file}`);
  }

  console.log(`[${profile.id}] ejecutando`);
  const [executable, args] = profile.command(profile.file);
  const result = spawnSync(executable, args, { stdio: "inherit", shell: false });

  if (result.error) {
    fail(`[${profile.id}] no se pudo ejecutar '${executable}': ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`[${profile.id}] falló con código ${result.status}`);
  }

  console.log(`[${profile.id}] aprobado`);
}

/**
 * Ejecuta una mutación deliberada del catálogo y exige que la matriz la detecte.
 * Una verificación que nunca ha fallado no demuestra nada.
 */
function demonstrateFailure() {
  const script = join(repoRoot, "scripts", "demonstrate-kahn-failure.mjs");
  const result = spawnSync(process.execPath, ["--no-warnings", script], { stdio: "inherit", shell: false });

  if (result.status === 0) {
    fail("La demostración fallida no fue detectada.");
  }

  console.log("Fallo deliberado detectado y localizado: kahn/javascript/chain");
}

const options = parseArguments(process.argv.slice(2));

if (options.demonstrateFailure) {
  demonstrateFailure();
  process.exit(0);
}

const algorithms = readAlgorithms();

if (options.algorithm && !algorithms.includes(options.algorithm)) {
  fail(`'${options.algorithm}' no está en catalog.json. Disponibles: ${algorithms.join(", ")}`);
}

const selected = options.algorithm ? [options.algorithm] : algorithms;
const python = resolvePython();
let profileCount = 0;

for (const algorithmId of selected) {
  for (const profile of buildProfiles(algorithmId, python)) {
    runProfile(profile);
    profileCount += 1;
  }
}

console.log(
  `Matriz canónica aprobada: ${profileCount} perfiles sobre ${selected.length} ` +
    `algoritmo${selected.length === 1 ? "" : "s"}.`,
);
