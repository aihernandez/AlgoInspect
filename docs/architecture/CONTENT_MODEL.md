# Modelo documental de un algoritmo

- Estado: aprobado e implementado para Kahn, Búsqueda binaria y Bubble Sort `1.0.0`

## Unidad de contenido

Cada algoritmo se identifica mediante un `algorithmId` estable y mantiene documentación, escenarios e implementaciones bajo la misma versión lógica.

```text
algorithms/<algorithm-id>/
├── algorithm.json
├── README.md
├── scenarios.json
├── implementations/
│   └── <language>/
│       └── source files
└── tests/
    └── <language>/
        └── test files
```

## Manifiesto obligatorio

`algorithm.json` debe declarar:

- identificador y versión;
- nombres en español e inglés;
- categoría, paradigma y dificultad;
- entradas, salidas y precondiciones;
- complejidad temporal por caso;
- complejidad espacial auxiliar;
- supuestos utilizados;
- lenguajes realmente disponibles;
- rutas del README, escenarios, implementaciones y pruebas;
- referencias y procedencia.

## README obligatorio

El README debe cubrir:

1. Problema.
2. Principio del algoritmo.
3. Entradas, salidas y precondiciones.
4. Solución paso a paso.
5. Invariante y argumento de correctitud.
6. Complejidad temporal y espacial por separado.
7. Casos límite y errores comunes.
8. Alternativas y trade-offs.
9. Aplicaciones reales.
10. Historia y referencias verificables.

## Implementaciones

Todas las implementaciones de un algoritmo deben compartir el mismo contrato lógico de entrada y salida. Las diferencias sintácticas o propias del runtime deben documentarse sin cambiar silenciosamente el significado.

Cada implementación debe identificar:

- lenguaje y versión mínima;
- archivo de entrada;
- función o tipo principal;
- representación de la entrada;
- resultado esperado;
- prueba asociada;
- limitaciones específicas.

## Escenarios

Cada escenario debe declarar:

- identificador estable;
- descripción bilingüe;
- entrada serializable;
- resultado esperado;
- caso de complejidad representado;
- snapshots o eventos esperados cuando exista visualización;
- diagnósticos esperados para entradas inválidas o ciclos.

## Reglas de consistencia

- Ningún lenguaje aparece como disponible sin implementación y prueba.
- Toda ruta declarada debe existir.
- Los escenarios son compartidos entre lenguajes salvo excepción documentada.
- README y manifiesto no pueden declarar complejidades contradictorias.
- Las referencias deben incluir título, autor u organización y URL.
- Un cambio incompatible incrementa la versión del contenido.
