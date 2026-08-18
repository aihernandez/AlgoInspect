# Modelo propuesto de análisis y evidencia

Estado: propuesta pendiente de aprobación. Este documento no autoriza implementación.

## Propósito

Definir una salida común para que el catálogo y la herramienta web expliquen un análisis sin mezclar métricas ni presentar inferencias como certezas.

## Entrada conceptual

Una solicitud de análisis contendrá, como mínimo:

- lenguaje y versión cuando sea relevante;
- código fuente o referencia a una implementación del catálogo;
- función o punto de entrada que se desea analizar;
- variables que representan el tamaño de la entrada;
- escenario o caso esperado: mejor, promedio o peor;
- opciones del analizador y versión del contrato.

## Resultado conceptual

El resultado separará:

- `timeComplexity`: complejidad temporal y caso al que corresponde;
- `spaceComplexity`: espacio auxiliar y supuestos de memoria;
- `cyclomaticComplexity`: complejidad de control por función o unidad;
- `recognizedAlgorithm`: coincidencia con un algoritmo conocido, si existe;
- `assumptions`: condiciones necesarias para sostener el resultado;
- `evidence`: rangos de líneas, construcciones y relaciones que justifican cada conclusión;
- `confidence`: nivel de confianza y motivo;
- `diagnostics`: ambigüedades, elementos no soportados y errores recuperables;
- `contractVersion`: versión del esquema utilizado.

Las métricas temporal, espacial y ciclomática no se resumirán en un único valor porque describen propiedades distintas.

## Grados de conclusión

- `known`: el analizador reconoce una regla y existe evidencia suficiente.
- `estimated`: existe una inferencia razonable, pero depende de supuestos explícitos.
- `unknown`: no hay evidencia suficiente; la interfaz debe comunicarlo sin inventar una complejidad.

## Evidencia mínima

Cada métrica inferida incluirá:

- ubicación en el código;
- regla aplicada, por ejemplo ciclo, recursión, ramificación o estructura auxiliar;
- contribución local;
- forma en que se compone con otras contribuciones;
- supuestos que podrían cambiar el resultado.

## Estrategia por lenguaje

La arquitectura permitirá adaptadores por lenguaje detrás de un contrato común. La primera validación propuesta cubre C#, JavaScript/TypeScript y Python. Los demás lenguajes planificados se incorporarán después de validar el contrato, sin fingir paridad antes de disponer de reglas y pruebas.

## Límites de fase 1

- El análisis inicial será estático y explicable.
- No se ejecutará código arbitrario no confiable.
- No se garantizará una respuesta exacta cuando el comportamiento dependa de datos, reflexión, concurrencia, servicios externos o características no soportadas.
- El catálogo puede aportar resultados conocidos, pero la web debe distinguirlos de un análisis calculado sobre código proporcionado por la persona usuaria.
