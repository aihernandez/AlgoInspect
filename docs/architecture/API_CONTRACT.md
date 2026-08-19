# Contrato entre Algorithm Catalog y AlgoInspect Web

- Estado: contrato de lectura `1.0` implementado; análisis planificado

## Principio

La aplicación web consume contratos; no conoce la disposición física de README, implementaciones o pruebas.

## Operaciones de consulta

```text
GET /api/catalog
GET /api/algorithms/{algorithmId}
GET /api/algorithms/{algorithmId}/implementations/{language}
GET /api/algorithms/{algorithmId}/scenarios
POST /api/analysis # planificado, fuera de la primera vertical
```

## Catálogo

`GET /api/catalog` devuelve:

- versión del esquema;
- versión del contenido;
- idiomas de interfaz disponibles;
- perfiles de lenguaje planeados;
- algoritmos disponibles;
- cobertura real por lenguaje.

## Documento de algoritmo

`GET /api/algorithms/{algorithmId}` devuelve:

- metadatos;
- README estructurado o Markdown;
- complejidad por caso;
- supuestos;
- implementaciones disponibles;
- escenarios disponibles;
- procedencia y versión.

## Implementación

La respuesta de una implementación incluye:

- algoritmo;
- lenguaje;
- nombre de archivo;
- código fuente;
- versión mínima del lenguaje;
- prueba asociada cuando exista;
- diferencias semánticas documentadas.

## Análisis

`POST /api/analysis` recibe el lenguaje, código, punto de entrada, variables de tamaño y caso solicitado. Devuelve el modelo definido en [`ANALYSIS_MODEL.md`](ANALYSIS_MODEL.md): métricas separadas, confianza, supuestos, evidencia y diagnósticos.

Este endpoint pertenece a AlgoInspect Web; no convierte el código proporcionado por la persona en contenido del catálogo ni autoriza su ejecución.

## Errores

| Situación | Respuesta esperada |
|---|---|
| Identificador inválido | `400` con diagnóstico seguro |
| Algoritmo inexistente | `404` |
| Lenguaje no implementado | `404` diferenciable de algoritmo inexistente |
| Catálogo inconsistente | `503` sin exponer rutas internas |
| Versión incompatible | `409` o negociación explícita de versión |
| Código o solicitud inválida | `422` con diagnósticos localizados |
| Lenguaje de análisis no soportado | `422` diferenciable de sintaxis inválida |

## Versionado

Los contratos utilizan `schemaVersion`. Los cambios aditivos mantienen compatibilidad; eliminar o cambiar el significado de un campo requiere una nueva versión mayor.

## Estado de implementación

Catálogo, detalle, escenarios e implementación están activos para Kahn, Búsqueda binaria y Bubble Sort. `POST /api/analysis` permanece fuera de alcance y no debe interpretarse como disponible.
