# Solución AlgoInspect Web

`AlgoInspect.Web.sln` contiene la aplicación consumidora del catálogo.

## Backend

ASP.NET Core aloja el cliente web y expone:

```text
GET /api/health
GET /api/catalog
GET /api/algorithms/{id}
GET /api/algorithms/{id}/implementations/{language}
```

La API utiliza los casos de uso de `AlgorithmCatalog.Application`; no conoce la estructura interna de los manifiestos.

## Cliente

`apps/web` mantiene Monaco, D3, Cytoscape, Mermaid y la interacción del laboratorio. `catalog-client.js` consulta la API del mismo origen. El fallback estático existe únicamente para revisar la maqueta sin ASP.NET Core.

Los archivos `prototype-*.js` son datos de compatibilidad de la maqueta y no son la fuente canónica. Deben reducirse a medida que los algoritmos migren a `catalog/algorithms`.

## Próxima vertical

La web debe reemplazar progresivamente cada lectura de datos embebidos por respuestas del API, comenzando con Kahn. La presentación y la reproducción permanecen en el navegador; la carga y validación del contenido pertenecen a .NET.
