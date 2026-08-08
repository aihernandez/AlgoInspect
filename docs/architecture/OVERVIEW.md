# Arquitectura combinada de la fase 1

## Dos soluciones

```text
AlgorithmCatalog.sln                    AlgoInspect.Web.sln
fuente de conocimiento                  aplicación consumidora
        │                                       │
        └──── contratos + catálogo versionado ──┘
```

Ambas viven en el mismo repositorio para permitir cambios atómicos de contrato, catálogo y representación. Tienen responsabilidades, compilación y pruebas independientes.

## Estilo arquitectónico

La arquitectura combina:

- monolito modular: un despliegue inicial sin microservicios;
- Clean Architecture: dominio y aplicación no dependen de archivos, HTTP ni UI;
- Vertical Slice Architecture: cada caso de uso contiene su entrada, handler y resultado;
- puertos y adaptadores: `IAlgorithmCatalog` separa el consumo del almacenamiento físico.

## Flujo

```text
catalog/algorithms
        │
        ▼
FileSystemAlgorithmCatalog
        │
        ▼
ListAlgorithms / GetAlgorithm / GetImplementation
        │
        ▼
ASP.NET Core Minimal API
        │
        ▼
apps/web
```

## Restricciones

- La UI no contiene la fuente oficial de un algoritmo.
- Los lenguajes no C# permanecen como archivos nativos; no se convierten en `.csproj`.
- Un lenguaje planeado no equivale a una implementación terminada.
- La primera fase carga y visualiza contenido determinista; todavía no ejecuta código arbitrario del usuario.
