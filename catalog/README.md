# Algorithm Catalog

Fuente versionada de documentación, escenarios, implementaciones y pruebas de algoritmos. Esta carpeta pertenece a la solución `AlgorithmCatalog.sln`; no contiene elementos de interfaz.

## Cobertura

El catálogo declara diez perfiles de lenguaje. La primera vertical verificable es Kahn con implementaciones en C#, JavaScript, TypeScript y Python. Un lenguaje declarado no se presenta como implementado hasta que aparezca en `algorithm.json` y sus archivos pasen la validación.

## Estructura de cada algoritmo

```text
algorithms/<id>/
├── algorithm.json
├── README.md
├── scenarios.json
├── implementations/<language>/
└── tests/<language>/
```

Ejecutar `dotnet run --project src/Catalog/AlgorithmCatalog.Validation -- catalog` para validar el contenido.
