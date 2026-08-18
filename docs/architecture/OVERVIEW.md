# Arquitectura combinada propuesta para la fase 1

- Estado: propuesta arquitectónica; no autoriza implementación

## Dos soluciones

```text
AlgorithmCatalog.sln                    AlgoInspect.Web.sln
fuente de conocimiento                  aplicación consumidora
        │                                       │
        └──── contratos + catálogo versionado ──┘
```

Ambas se mantendrían inicialmente en el mismo espacio de trabajo para permitir cambios coordinados de contrato, catálogo y representación. Tendrían responsabilidades, compilación y pruebas independientes cuando se autorice su construcción.

## Estilo arquitectónico

La arquitectura combina:

- monolito modular: un despliegue inicial sin microservicios;
- Clean Architecture: dominio y aplicación no dependen de archivos, HTTP ni UI;
- Vertical Slice Architecture: cada caso de uso contiene su entrada, handler y resultado;
- puertos y adaptadores: `IAlgorithmCatalog` separa el consumo del almacenamiento físico.

La tecnología propuesta se documenta por separado en [`TECHNOLOGY_STACK.md`](TECHNOLOGY_STACK.md) para no confundir el lenguaje de construcción con los lenguajes del catálogo.

## Flujo objetivo

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
src/frontend
```

## Verticales propuestas

### Catálogo

1. Listar algoritmos y cobertura real.
2. Obtener una ficha canónica.
3. Obtener una implementación por lenguaje.
4. Obtener escenarios y trazas.

### Análisis

1. Validar la solicitud y reconocer lenguaje.
2. Construir el modelo sintáctico correspondiente.
3. Inferir contribuciones de tiempo, espacio y flujo de control.
4. Componer métricas, supuestos, confianza y evidencia.
5. Entregar resultados conocidos, estimados o desconocidos sin inventar certeza.

Cada vertical atravesará contrato, aplicación, adaptador y entrega, sin convertir una capa técnica en un módulo funcional gigante.

## Restricciones

- La UI no debe contener la fuente oficial de un algoritmo.
- Los lenguajes no C# permanecerán como archivos nativos; no se convertirán en `.csproj`.
- Un lenguaje planeado no equivale a una implementación terminada.
- La primera fase cargará y visualizará contenido determinista; no ejecutará código arbitrario del usuario.
