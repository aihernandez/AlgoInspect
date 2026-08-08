# Solución Algorithm Catalog

`AlgorithmCatalog.sln` mantiene la fuente oficial de conocimiento algorítmico.

## Proyectos

- `AlgorithmAnalysis.Contracts`: contratos serializados compartidos.
- `AlgorithmCatalog.Domain`: conceptos e invariantes, como identificadores seguros.
- `AlgorithmCatalog.Content`: incorpora README, escenarios, código y pruebas a la construcción del catálogo.
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

Primera vertical: C#, JavaScript, TypeScript y Python. La expansión comienza únicamente después de validar el contrato con Kahn y al menos otros dos tipos de algoritmo.
