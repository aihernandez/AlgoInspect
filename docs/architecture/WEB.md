# AlgoInspect Web

- Estado: tres verticales canónicas implementadas.
- Superficie: cliente HTML/CSS/JavaScript y API ASP.NET Core del mismo origen.

## Backend

ASP.NET Core aloja el cliente web y expone:

```text
GET /api/health
GET /api/health/ready
GET /api/health/live
GET /api/catalog
GET /api/algorithms/{id}
GET /api/algorithms/{id}/implementations/{language}
GET /api/algorithms/{id}/scenarios
```

La API utiliza los casos de uso de `AlgorithmCatalog.Application`; no filtra al cliente la estructura interna del sistema de archivos. Readiness lee y valida todas las verticales declaradas, mientras que liveness sólo confirma que el proceso puede responder.

## Cliente

El cliente consume exclusivamente la API del mismo origen. Monaco, D3, Cytoscape y Mermaid están fijados en `package-lock.json` y se copian a `public/vendor` durante `npm run build:web`; no se ejecuta JavaScript desde CDN.

Los archivos históricos `prototype-*` se conservan como referencia de diseño, pero el servidor los bloquea y el proyecto los excluye del artefacto publicado. No son fallback ni fuente alternativa.

## Frontera de internet

La aplicación agrega CSP, cabeceras defensivas, rate limit, compresión, caché de estáticos y logs HTTP sin cuerpos. El procesamiento de forwarded headers permanece deshabilitado hasta recibir IP explícitas de un proxy confiable.

La configuración operativa, las rutas de health check y las responsabilidades de TLS se documentan fuera de este repositorio.

## Límites actuales

- La superficie pública ofrece Kahn, Búsqueda binaria y Bubble Sort.
- No se ejecuta el código mostrado.
- No existe análisis libre real ni inferencia automática de Big O.
- No se persisten cuentas, código o actividad del visitante.
