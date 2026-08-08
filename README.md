# AlgoInspect

AlgoInspect es una herramienta web bilingüe para explorar algoritmos, observar su ejecución y comprender por separado su complejidad temporal, espacial y ciclomática.

## Estado

El repositorio contiene la fase 1: el laboratorio web. El análisis de código arbitrario todavía no forma parte del producto; las visualizaciones actuales utilizan contenido y trazas deterministas.

## Inicio rápido

Requisitos: Node.js, npm, Python y los navegadores de Playwright.

```bash
npm install
npm run build
npm run dev
```

Abrir `http://127.0.0.1:4398/apps/web/index.html`.

## Verificación

```bash
npm test
```

## Estructura

- `apps/web`: interfaz web canónica.
- `packages/algorithm-catalog`: contenido, implementaciones, escenarios y trazas deterministas.
- `packages/analysis-contracts`: contratos que separarán el motor de sus clientes.
- `docs`: visión, roadmap, arquitectura, decisiones e historias de usuario.
- `tests/e2e`: criterios de aceptación automatizados de la aplicación web.

La historia anterior a esta línea base se preserva fuera del repositorio activo en `AlgorithmAnalysis-archive-2026-08-08`.

## Forma de trabajo

Cada cambio funcional debe partir de una historia en `docs/user-stories`, usar su identificador en la rama y en los commits, y satisfacer sus escenarios Given/When/Then.
