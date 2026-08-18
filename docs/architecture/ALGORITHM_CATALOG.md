# Solución propuesta: Algorithm Catalog

- Estado: diseño documental; no implementada mediante estas historias

`AlgorithmCatalog.sln` será la vista de construcción de la fuente oficial de conocimiento algorítmico cuando se autorice su implementación.

## Proyectos previstos

- `AlgorithmAnalysis.Contracts`: contratos serializados compartidos.
- `AlgorithmCatalog.Domain`: conceptos e invariantes, como identificadores seguros.
- `AlgorithmCatalog.Application`: puerto del catálogo y verticales de consulta.
- `AlgorithmCatalog.Infrastructure.FileSystem`: lectura segura desde el repositorio.
- `AlgorithmCatalog.Validation`: validación ejecutable de manifiestos y archivos.
- `AlgorithmCatalog.Tests`: pruebas deterministas del contenido y sus fronteras.

## Contenido

Cada algoritmo contiene:

- `algorithm.json` con identidad, clasificación, complejidad y archivos disponibles;
- `README.md` con teoría, solución, historia y referencias;
- `scenarios.json` con casos verificables;
- `implementations/<language>` con código nativo;
- `tests/<language>` con evidencia de comportamiento.

## Lenguajes

Perfiles previstos: C#, Java, JavaScript, Node.js, TypeScript, Python, Rust, Ruby, C y C++.

Primera cobertura propuesta: C#, JavaScript, TypeScript y Python. La expansión comenzará únicamente después de validar documentalmente el contrato con Kahn, búsqueda binaria y Bubble Sort.
