# AlgoInspect

AlgoInspect es una plataforma bilingüe para explorar algoritmos, observar su ejecución y comprender por separado su complejidad temporal, espacial y ciclomática.

## Fase 1

El repositorio contiene dos soluciones diferentes dentro de un monorepo:

- `AlgorithmCatalog.sln`: fuente oficial de algoritmos, README, escenarios, implementaciones y pruebas multilenguaje.
- `AlgoInspect.Web.sln`: API ASP.NET Core y aplicación web que consumen el catálogo.

Los proyectos compartidos no constituyen una tercera solución; son el contrato entre ambas.

## Inicio rápido

Requisitos: .NET 10 SDK, Node.js, npm y los navegadores de Playwright.

```bash
npm install
npm run build
npm run validate:catalog
npm run dev
```

Abrir `http://127.0.0.1:4398/`.

## Verificación

```bash
npm test
```

Este comando ejecuta las pruebas de las dos soluciones .NET y la aceptación E2E de la web servida por ASP.NET Core.

## Estructura

- `catalog`: fuente multilenguaje versionada.
- `src/Catalog`: dominio, casos de uso, proveedor de archivos y validador del catálogo.
- `src/Shared`: contratos compartidos.
- `src/Web`: host y API de la aplicación.
- `apps/web`: cliente web TypeScript/JavaScript y assets.
- `contracts/schemas`: contratos serializados independientes de la UI.
- `tests`: pruebas de catálogo, API y navegador.
- `docs`: visión, arquitectura, decisiones e historias.

La primera vertical verificable es Kahn en C#, JavaScript, TypeScript y Python. Los diez perfiles previstos están declarados, pero no se presentan como implementados hasta disponer de código y pruebas validadas.

## Forma de trabajo

Cada cambio funcional parte de una historia en `docs/user-stories`. El identificador debe aparecer en la rama, los commits y la pull request.
