# Tecnología propuesta para la fase 1

- Estado: propuesta pendiente de aprobación
- Alcance: construcción futura de Algorithm Catalog y AlgoInspect Web

Este documento distingue las tecnologías con las que se construirán las soluciones de los lenguajes en los que se documentarán algoritmos.

## Algorithm Catalog

- **C# y .NET** para dominio, casos de uso, validación y adaptadores de lectura.
- **Markdown** para explicaciones extensas.
- **YAML** para manifiestos legibles y versionados.
- **JSON** para escenarios, trazas y datos intercambiables.
- Archivos fuente nativos para cada lenguaje de algoritmo.

El catálogo se proyecta como una solución .NET de construcción y validación, pero sus implementaciones Java, JavaScript, TypeScript, Python, Rust, Ruby, C o C++ no se transformarán en proyectos C#.

## AlgoInspect Web

### Backend

- **C# y ASP.NET Core sobre .NET** para API, composición de dependencias y casos de uso del servidor.
- Análisis y puertos independientes de HTTP para mantener separadas las reglas del transporte.

### Frontend

- **TypeScript** como lenguaje principal de interacción.
- **HTML semántico y CSS** para estructura, adaptabilidad y accesibilidad.
- Un sistema de construcción de frontend se seleccionará al autorizar la implementación; no se fija una versión antes de comprobar requisitos.

### Edición y visualización

Monaco, Cytoscape, D3 y Mermaid son candidatos para edición, grafos, gráficas y diagramas. Se conservarán solo si una prueba de concepto autorizada demuestra que cada dependencia aporta una capacidad necesaria sin duplicar otra.

## Análisis por lenguaje

- **C#**: adaptador estático basado en el modelo sintáctico y semántico de Roslyn.
- **JavaScript y TypeScript**: adaptador basado en AST compatible con el ecosistema TypeScript.
- **Python**: adaptador basado en su AST.

Estos son adaptadores iniciales propuestos, no capacidades existentes. Los demás lenguajes se incorporarán detrás del mismo contrato de resultado después de validar reglas, evidencia y pruebas.

## Pruebas previstas

- pruebas unitarias de dominio, contratos y reglas de análisis;
- pruebas de contrato entre catálogo, API y cliente;
- pruebas de integración del proveedor de contenido;
- pruebas de interacción y accesibilidad de la web;
- pruebas de aceptación derivadas de las historias Given/When/Then.

La selección exacta de frameworks, versiones y comandos se documentará al autorizar la implementación para evitar decisiones prematuras o desactualizadas.
