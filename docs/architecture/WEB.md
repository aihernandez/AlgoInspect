# Arquitectura de la fase web

## Decisión

La fase 1 continúa como una aplicación estática en HTML, CSS y JavaScript. Se reorganiza por responsabilidades sin introducir todavía un framework, backend o base de datos.

## Componentes

```text
apps/web/index.html
        │
        ├── apps/web/src/scripts       interfaz y estado del laboratorio
        ├── apps/web/src/styles        diseño y distribución
        ├── packages/algorithm-catalog contenido y trazas deterministas
        └── packages/analysis-contracts contratos futuros del motor
```

## Fronteras

- La interfaz representa estado y coordina interacción.
- El catálogo describe algoritmos, lenguajes y contenido educativo.
- Las trazas producen estados finitos conocidos para el visualizador.
- Los contratos definen la forma estable de una solicitud y un resultado de análisis.
- El navegador no ejecuta código arbitrario del usuario en esta fase.

## Evolución

Cuando se construya el motor real, la web consumirá el mismo resultado JSON que la CLI, los skills, VS Code y CI/CD. La interfaz no debe incorporar analizadores específicos por lenguaje.

## Pruebas

Playwright valida el flujo completo sobre `apps/web/index.html`. Los artefactos de prueba se escriben en `test-results` y no forman parte del repositorio.
