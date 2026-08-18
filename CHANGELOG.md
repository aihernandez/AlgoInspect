# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el versionado sigue [Versionado Semántico](https://semver.org/lang/es/).

## [Sin publicar]

### Añadido

- Verificación multiplataforma: `scripts/validate-algorithms.mjs` sustituye a los
  scripts de PowerShell y permite validar el catálogo en Linux, macOS y Windows.
- Matriz de integración continua en `ubuntu-latest` y `windows-latest`.
- Análisis estático de seguridad con CodeQL para C# y JavaScript/TypeScript.
- Prueba de humo del contenedor: la imagen debe arrancar y responder en
  `/api/health` antes de considerarse válida.
- Escaneo de vulnerabilidades de la imagen con Trivy.
- Configuración explícita de la ubicación del contenido mediante
  `Content:CatalogRoot` y `Content:WebRoot`.
- Licencia MIT, `CODEOWNERS`, Dependabot, código de conducta, política de
  seguridad y plantillas de issue y pull request.
- Telemetría opcional de servidor hacia Sentry, desactivada por defecto y
  gobernada por `Telemetry:Enabled`. Sin habilitarla, la aplicación no realiza
  ningún envío externo.

### Cambiado

- Los proyectos de prueba en C# del catálogo se incorporan a
  `AlgorithmCatalog.sln`. Antes no pertenecían a ninguna solución, así que las
  implementaciones canónicas se editaban sin IntelliSense, sin depuración y sin
  explorador de pruebas. El catálogo no cambia de ubicación.

- Reorganización del código: la aplicación de navegador pasa de `apps/web` a
  `src/frontend` (sin la carpeta `src` interna) y los seis proyectos .NET pasan
  de `src/{Catalog,Shared,Web}` a `src/backend`. Los nombres de proyecto y los
  espacios de nombres no cambian.

- La integración continua ejecuta la matriz canónica completa
  (`validate:algorithms`) en lugar de validar únicamente Kahn.
- `RepositoryRoot` resuelve las rutas relativas contra el content root en lugar
  del directorio de trabajo actual.

### Eliminado

- Proyecto `AlgorithmCatalog.Content`, que no era referenciado por ningún otro
  proyecto y cuya única clase estaba vacía.
- Datos del prototipo (`apps/web/src/data/prototype-*.js`), sin referencias
  vivas desde la aplicación.
- Middleware que bloqueaba rutas del prototipo, innecesario tras su eliminación.
