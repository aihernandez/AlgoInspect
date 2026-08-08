# Contribuir

## Flujo por historia

1. Seleccionar una historia aprobada en `docs/user-stories`.
2. Crear una rama `feature/<ID>-descripcion`.
3. Implementar únicamente el alcance de la historia.
4. Ejecutar `npm run validate:catalog`, `npm run build` y `npm test`.
5. Usar el ID en cada commit: `feat(US-WEB-001): descripción`.
6. Enlazar la pull request con la historia o issue correspondiente.

## Commits

Usamos Conventional Commits con el identificador de historia cuando aplique:

```text
feat(US-WEB-001): sincroniza la selección del catálogo
fix(US-WEB-004): conserva el panel al reordenar pestañas
docs: documenta la arquitectura de la fase web
```

Los cambios de infraestructura que no implementan una historia pueden usar `chore`, `build`, `test` o `docs` sin identificador funcional.

## Definición de terminado

- Los escenarios Given/When/Then están cubiertos.
- No hay errores de consola no justificados.
- La experiencia funciona con teclado y en móvil.
- La documentación y los contratos afectados están actualizados.
- Cada solución .NET compila y pasa sus pruebas de manera independiente.
- El catálogo valida todos los archivos declarados en sus manifiestos.
- La compilación y todas las pruebas pasan.
