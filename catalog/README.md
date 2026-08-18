# Algorithm Catalog: contenido canónico

Estado: implementado para Kahn, Búsqueda binaria y Bubble Sort en la versión de contenido `1.0.0`.

Algorithm Catalog es la fuente canónica de documentación, escenarios, implementaciones y pruebas. `AlgorithmCatalog.sln` valida el contrato y la API publica el contenido sin una copia paralela en la web.

## Cobertura publicada

El catálogo declara diez perfiles planeados y publica cuatro por algoritmo: C#, JavaScript, TypeScript y Python. Las tres verticales comparten 11 escenarios cada una y una batería ejecutable por lenguaje. Los seis perfiles restantes no se presentan como disponibles.

## Estructura de cada algoritmo

```text
algorithms/<id>/
├── algorithm.json
├── README.md
├── scenarios.json
├── implementations/<language>/
└── tests/<language>/
```

El contrato completo se define en [`../docs/architecture/CONTENT_MODEL.md`](../docs/architecture/CONTENT_MODEL.md). La evidencia reproducible está en [`../docs/user-stories/phase-1/CANONICAL_EXPANSION_EVIDENCE.md`](../docs/user-stories/phase-1/CANONICAL_EXPANSION_EVIDENCE.md).
