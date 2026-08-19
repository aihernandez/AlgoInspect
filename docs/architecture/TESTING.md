# Convención de pruebas unitarias

## Regla del proyecto

Las pruebas unitarias declaran sus entradas y resultados esperados en el archivo de prueba. No leen `scenarios.json` durante la ejecución.

`scenarios.json` sigue siendo el contrato de contenido para catálogo, API, interfaz y trazas. Las pruebas unitarias verifican la implementación de manera independiente para que una revisión pueda identificar el caso, sus argumentos y su expectativa sin abrir otro archivo.

## Forma de cada caso

- Cada caso tiene un nombre corto y estable como primer argumento: `empty`, `reverse` o `unknown-vertex`.
- Las entradas se escriben literalmente junto con el resultado esperado.
- Cada fila se ejecuta y se informa como un caso independiente.
- No se empaquetan varios casos en una misma línea ni se recorre un JSON con un `for` para ocultar los valores.
- Se conservan las aserciones de contrato relevantes: resultado, mutación in-place, orden topológico, estado de ciclo o error.

## C# y xUnit

Para tipos simples se usa `TheoryData` con `MemberData`. El primer parámetro es `caseName`; los arreglos se escriben directamente porque el tipo de `TheoryData` ya permite inferir `int[]`.

```csharp
public static TheoryData<string, int[], int[]> Cases => new()
{
    { "empty", [], [] },
    { "single", [5], [5] },
    { "sorted", [1, 2, 3, 4], [1, 2, 3, 4] }
};

[Theory]
[MemberData(nameof(Cases))]
public void Execute_sorts_in_place(string caseName, int[] input, int[] expected)
{
    BubbleSortResult result = BubbleSortAlgorithm.Execute(input);

    Assert.Equal(expected, result.Values);
    Assert.Equal(expected, input);
}
```

No se usa un helper como `Values(...)` si un arreglo literal expresa los datos. `InlineData` queda reservado para valores constantes simples; no puede transportar de forma directa un grafo o colecciones complejas en atributos de C#.

## Ejemplos canónicos

| Algoritmo | Argumentos visibles | Contrato mínimo |
|---|---|---|
| Kahn | `caseName`, vértices, aristas, estado, orden y bloqueados | Orden topológico válido; ciclo o vértice desconocido tratados explícitamente. |
| Búsqueda binaria | `caseName`, arreglo ordenado, objetivo, índice esperado | Índice exacto o `-1`; si existe, el índice apunta al objetivo. |
| Bubble Sort | `caseName`, arreglo de entrada, arreglo ordenado esperado | Resultado ordenado e igual al arreglo mutado. |

## JavaScript, TypeScript y Python

Los equivalentes usan su runner nativo: `node:test` en JavaScript/TypeScript y parametrización explícita de `pytest` en Python. El nombre visible de cada prueba incluye el caso y los argumentos esenciales. Los datos se declaran en el archivo de prueba, nunca se cargan desde `scenarios.json`.

## Validación

Antes de entregar un cambio, ejecutar el perfil del lenguaje afectado. La matriz completa se ejecuta con:

```powershell
npm run validate:algorithms
```

Si el SDK de .NET requerido no está instalado localmente, registrar esa limitación y ejecutar los perfiles disponibles; la CI debe ejecutar la matriz completa.
