(() => {
  "use strict";

  const algorithms = [
    {
      id: "binary-search",
      name: "Búsqueda binaria",
      englishName: "Binary Search",
      category: "Búsqueda",
      difficulty: "Inicial",
      presetId: "edge",
      definition: "Localiza un valor en una colección ordenada descartando, en cada comparación, la mitad que ya no puede contenerlo.",
      reason: "Convierte una búsqueda potencialmente lineal en una secuencia de reducciones: después de k pasos queda, como máximo, n / 2ᵏ de la entrada original.",
      objectives: [
        "Reconocer por qué el orden de la entrada es una precondición, no una optimización opcional.",
        "Mantener un intervalo candidato correcto al mover low y high.",
        "Distinguir el caso de encontrar cualquier coincidencia de las variantes lower bound y upper bound.",
        "Relacionar cada reducción del intervalo con O(log n)."
      ],
      quick: {
        what: "Busca en un arreglo ordenado dividiendo el intervalo a la mitad.",
        use: "Datos ordenados, acceso por índice y muchas consultas sobre la misma colección.",
        complexity: "Mejor O(1) · promedio y peor O(log n) · espacio iterativo O(1).",
        key: "Si el objetivo existe, siempre permanece dentro de [low, high].",
        caution: "Sin orden o sin actualizar los límites de forma estricta, la respuesta deja de ser válida."
      },
      requirements: [
        "La colección debe estar ordenada con el mismo criterio usado por la comparación.",
        "Conviene tener acceso aleatorio eficiente; en una lista enlazada localizar el medio cuesta recorrido lineal.",
        "Debe estar definido qué se espera cuando hay duplicados: cualquier coincidencia, primera o última posición.",
        "Los límites deben representar siempre el mismo convenio: intervalo cerrado [low, high] o semiabierto [low, high)."
      ],
      mechanics: [
        "Inicializa low al primer índice y high al último.",
        "Calcula mid dentro del intervalo candidato.",
        "Compara values[mid] con el objetivo.",
        "Si son iguales, termina; si el valor medio es menor, descarta la mitad izquierda; si es mayor, descarta la derecha.",
        "Repite hasta encontrar el objetivo o vaciar el intervalo."
      ],
      steps: [
        { lineKey: "setup", occurrence: 0, title: "Preparar el intervalo", short: "Todo el arreglo ordenado es candidato.", detail: "low empieza en 0 y high en n − 1. Todavía no se ha descartado ninguna posición." },
        { lineKey: "inspect", occurrence: 0, title: "Elegir el medio", short: "Calcula un índice dentro del intervalo activo.", detail: "Usar low + floor((high − low) / 2) evita que low + high desborde en enteros de tamaño fijo." },
        { lineKey: "compare", occurrence: 0, title: "Comparar", short: "El valor medio decide qué mitad sobrevive.", detail: "La comparación no solo prueba una posición: gracias al orden, también elimina un bloque completo." },
        { lineKey: "update", occurrence: 0, title: "Descartar la mitad", short: "Mueve uno de los límites más allá de mid.", detail: "mid ya fue comparado; usar mid otra vez puede impedir que el intervalo disminuya y provocar un ciclo infinito." },
        { lineKey: "inspect", occurrence: 1, title: "Repetir con menos datos", short: "El intervalo candidato ya es más pequeño.", detail: "Cada repetición conserva como máximo la mitad de las posiciones del paso anterior." },
        { lineKey: "found", occurrence: 0, title: "Confirmar el resultado", short: "La coincidencia devuelve su índice.", detail: "Si low supera high, la terminación alternativa demuestra que el objetivo no pertenece a la colección." }
      ],
      complexity: {
        best: { value: "O(1)", why: "El primer elemento medio coincide con el objetivo.", example: "Buscar 24 en [3, 7, 12, 18, 24, 31, 42, 55, 63]." },
        average: { value: "O(log n)", why: "En cada comparación sobrevive aproximadamente la mitad del intervalo.", example: "El objetivo aparece en una posición que requiere varias reducciones." },
        worst: { value: "O(log n)", why: "Se reduce hasta una sola posición o hasta vaciar el intervalo.", example: "El objetivo está en un extremo o no existe." },
        space: { value: "O(1) iterativa", detail: "La versión iterativa conserva unos cuantos índices. Una versión recursiva usa O(log n) marcos de pila." },
        note: "La notación presupone comparaciones O(1) y acceso directo al elemento medio."
      },
      invariant: {
        statement: "Si el objetivo está en la colección, permanece dentro del intervalo cerrado [low, high].",
        initialization: "Antes de la primera comparación, [0, n − 1] contiene todas las posiciones posibles.",
        maintenance: "La comparación con values[mid] y el orden permiten eliminar solo posiciones que no pueden contener el objetivo.",
        termination: "Si hay igualdad se devuelve mid; si low > high, no queda ninguna posición posible y la ausencia es correcta."
      },
      useWhen: [
        "Realizas muchas búsquedas sobre datos que ya están ordenados.",
        "La estructura permite consultar cualquier índice en tiempo constante.",
        "Buscas el punto de cambio de un predicado monótono, no necesariamente un valor literal.",
        "Necesitas límites inferior o superior dentro de un rango ordenado."
      ],
      avoidWhen: [
        "Los datos cambian tanto que mantenerlos ordenados cuesta más que buscar linealmente.",
        "La entrada es pequeña y la simplicidad de un recorrido lineal importa más.",
        "Trabajas con una lista enlazada sin acceso aleatorio.",
        "Necesitas búsquedas exactas O(1) promedio y puedes sostener un índice hash."
      ],
      applications: ["Autocompletado por prefijo sobre índices ordenados", "Búsqueda de versiones o marcas de tiempo", "Primer valor que cumple un umbral", "Consultas lower bound / upper bound"],
      mistakes: [
        { title: "Intervalos mezclados", detail: "Inicializar como intervalo cerrado y actualizar como semiabierto introduce errores de una posición." },
        { title: "Medio vulnerable a desbordamiento", detail: "En enteros acotados, (low + high) / 2 puede desbordar; calcula desde low." },
        { title: "No avanzar después de mid", detail: "low = mid o high = mid puede conservar exactamente el mismo intervalo." },
        { title: "Ignorar duplicados", detail: "La versión básica no promete la primera ni la última coincidencia." },
        { title: "Buscar en datos no ordenados", detail: "La comparación deja de justificar el descarte de una mitad."
        }
      ],
      variants: [
        { name: "Lower bound", use: "Encuentra la primera posición cuyo valor no es menor que el objetivo." },
        { name: "Upper bound", use: "Encuentra la primera posición estrictamente mayor que el objetivo." },
        { name: "Búsqueda sobre respuesta", use: "Busca el menor valor para el que un predicado monótono se vuelve verdadero." },
        { name: "Búsqueda por interpolación", use: "Puede aprovechar una distribución casi uniforme, aunque su peor caso es lineal." }
      ],
      history: {
        title: "Una idea histórica, no un inventor único",
        paragraphs: [
          "La bisección como técnica de búsqueda es anterior al software moderno. Por eso esta guía no la atribuye a una sola persona como si existiera una publicación fundacional equivalente a las de Quick Sort o Kahn.",
          "La referencia técnica usada aquí es el Dictionary of Algorithms and Data Structures de NIST. Para una ficha histórica futura conviene documentar por separado antecedentes matemáticos, primeras descripciones para computadoras y primeras implementaciones correctas para todos los tamaños."
        ]
      },
      references: [
        { label: "Binary search", organization: "NIST Dictionary of Algorithms and Data Structures", year: "2022", url: "https://www.nist.gov/dads/HTML/binarySearch.html", note: "Definición, O(log n) y cálculo seguro del punto medio." },
        { label: "Divide and conquer", organization: "NIST Dictionary of Algorithms and Data Structures", year: "2010", url: "https://www.nist.gov/dads/HTML/divideAndConquer.html", note: "Contexto de la técnica algorítmica." }
      ],
      codeNotes: [
        "PRECONDICIÓN: values debe estar ordenado con el mismo comparador.",
        "INVARIANTE: si target existe, permanece entre low y high.",
        "MEJOR CASO: el primer mid coincide, O(1).",
        "PROMEDIO Y PEOR: el intervalo se divide hasta agotarse, O(log n).",
        "ESPACIO: O(1) en la variante iterativa; O(log n) si se usa recursión.",
        "CUIDADO: define el contrato para duplicados y usa límites coherentes."
      ]
    },
    {
      id: "quick-sort",
      name: "Quick Sort",
      englishName: "Quicksort",
      category: "Ordenamiento",
      difficulty: "Intermedio",
      presetId: "mixed",
      definition: "Ordena dividiendo la entrada alrededor de un pivote: los valores menores quedan a un lado, los mayores al otro y ambos subarreglos se ordenan recursivamente.",
      reason: "Su partición puede hacerse en el mismo arreglo y su acceso local a memoria suele ofrecer muy buen rendimiento práctico cuando los pivotes producen divisiones razonables.",
      objectives: [
        "Separar claramente la operación de partición de las llamadas recursivas.",
        "Explicar por qué un pivote equilibrado produce O(n log n).",
        "Reconocer cómo una política de pivote deficiente conduce a O(n²).",
        "Distinguir memoria auxiliar del arreglo y memoria de la pila recursiva."
      ],
      quick: {
        what: "Particiona alrededor de un pivote y ordena recursivamente ambos lados.",
        use: "Arreglos en memoria, ordenamiento general y una implementación con buen pivote.",
        complexity: "Mejor/promedio O(n log n) · peor O(n²) · pila promedio O(log n).",
        key: "Después de particionar, el pivote queda en su posición final.",
        caution: "Pivotes repetidamente extremos convierten la recursión en una cadena de profundidad n."
      },
      requirements: [
        "Debe existir una relación de comparación consistente y transitiva.",
        "La política de pivote y el esquema de partición deben estar definidos juntos.",
        "La implementación debe controlar profundidad de recursión y entradas con muchos duplicados.",
        "Si se exige estabilidad, la variante in-place habitual no satisface ese contrato."
      ],
      mechanics: [
        "Elige un pivote para el rango activo.",
        "Recorre el rango y construye regiones según su relación con el pivote.",
        "Coloca el pivote entre las particiones; esa posición ya es definitiva.",
        "Repite el proceso en los subarreglos izquierdo y derecho.",
        "Detén la recursión en rangos vacíos o unitarios."
      ],
      steps: [
        { lineKey: "setup", occurrence: 0, title: "Delimitar el rango", short: "La primera llamada cubre toda la entrada.", detail: "Cada llamada posterior trabaja sobre un intervalo independiente del arreglo." },
        { lineKey: "pivot", occurrence: 0, title: "Elegir el pivote", short: "Este ejemplo toma el último valor.", detail: "La política es fácil de entender, pero no es robusta frente a entradas ya ordenadas." },
        { lineKey: "compare", occurrence: 0, title: "Recorrer y comparar", short: "Cada valor se clasifica respecto del pivote.", detail: "Una partición visita el rango una vez, por eso su trabajo local es lineal." },
        { lineKey: "swap", occurrence: 0, title: "Extender una partición", short: "Los valores menores avanzan a la izquierda.", detail: "El límite separa la región ya clasificada de la región todavía no inspeccionada." },
        { lineKey: "partition", occurrence: 0, title: "Fijar el pivote", short: "El pivote llega a su posición final.", detail: "Después de este intercambio, ninguna llamada recursiva vuelve a incluir esa posición." },
        { lineKey: "base", occurrence: 0, title: "Resolver subproblemas", short: "Los rangos unitarios son casos base.", detail: "Con particiones equilibradas, la altura esperada del árbol de llamadas es log n." },
        { lineKey: "done", occurrence: 0, title: "Completar el orden", short: "Todos los pivotes y casos base quedaron fijos.", detail: "El arreglo entero queda ordenado sin una fase de combinación adicional."
        }
      ],
      complexity: {
        best: { value: "O(n log n)", why: "Cada pivote separa el rango en partes casi iguales.", example: "La profundidad es log n y cada nivel procesa en total n elementos." },
        average: { value: "O(n log n)", why: "Pivotes razonablemente distribuidos mantienen una altura logarítmica esperada.", example: "Datos mezclados con pivote aleatorio o mediana aproximada." },
        worst: { value: "O(n²)", why: "Cada pivote deja una partición de tamaño n − 1 y otra vacía.", example: "Entrada ordenada usando siempre el último elemento como pivote." },
        space: { value: "O(log n) promedio", detail: "La pila recursiva es logarítmica con divisiones equilibradas y puede crecer a O(n) en el peor caso." },
        note: "Las cotas dependen de la estrategia de pivote, del esquema de partición y del tratamiento de duplicados."
      },
      invariant: {
        statement: "Durante la partición, los elementos ya clasificados a la izquierda cumplen la relación definida respecto del pivote; al terminar, el pivote ocupa su posición final.",
        initialization: "Antes del recorrido, la región de menores está vacía y todos los elementos salvo el pivote están pendientes.",
        maintenance: "Cada comparación extiende la región correcta o deja el elemento en la región todavía mayor que el pivote.",
        termination: "El intercambio final coloca el pivote entre ambas regiones; ordenar recursivamente cada lado completa el arreglo."
      },
      useWhen: [
        "Ordenas arreglos en memoria y el acceso local importa.",
        "Puedes usar pivote aleatorio, mediana de tres o una defensa como introsort.",
        "No necesitas preservar el orden original de elementos equivalentes.",
        "Buscas una implementación general con excelente comportamiento promedio."
      ],
      avoidWhen: [
        "Necesitas una garantía estricta O(n log n) sin estrategia de respaldo.",
        "La estabilidad es parte del contrato del producto.",
        "Los datos viven fuera de memoria y conviene un patrón secuencial de lectura.",
        "No puedes aceptar profundidad de pila dependiente de la entrada."
      ],
      applications: ["Ordenamiento general en memoria", "Partición para Quickselect", "Motores que usan introsort como defensa", "Clasificación de registros cuando la estabilidad no es requisito"],
      mistakes: [
        { title: "Confundir esquemas de partición", detail: "Lomuto y Hoare usan límites y retornos distintos; mezclar sus reglas rompe la recursión." },
        { title: "Pivote determinista frágil", detail: "Elegir siempre un extremo expone entradas ordenadas o adversariales." },
        { title: "Duplicados mal tratados", detail: "Muchos valores iguales pueden producir particiones pobres; una partición en tres vías ayuda." },
        { title: "Rangos recursivos incorrectos", detail: "Volver a incluir la posición final del pivote impide reducir el problema." },
        { title: "Declarar espacio O(1)", detail: "Aunque la partición sea in-place, la pila recursiva también cuenta como memoria auxiliar."
        }
      ],
      variants: [
        { name: "Pivote aleatorio", use: "Reduce la posibilidad de que el orden original determine siempre divisiones malas." },
        { name: "Mediana de tres", use: "Aproxima un pivote central con pocas comparaciones adicionales." },
        { name: "Partición en tres vías", use: "Agrupa menores, iguales y mayores; es útil con muchos duplicados." },
        { name: "Introsort", use: "Cambia a heapsort cuando la recursión revela un comportamiento peligroso." }
      ],
      history: {
        title: "C. A. R. Hoare y el diseño para memoria de acceso aleatorio",
        paragraphs: [
          "C. A. R. Hoare publicó Quicksort en The Computer Journal en 1962. El artículo presentó el método como una nueva forma de ordenar en almacenamiento de acceso aleatorio y destacó velocidad, economía de espacio y facilidad de programación.",
          "El algoritmo permanece relevante porque su idea central —particionar y resolver subproblemas— admite muchas políticas de pivote, optimizaciones de bucles y estrategias de respaldo."
        ]
      },
      references: [
        { label: "Quicksort", organization: "The Computer Journal · Oxford Academic", year: "1962", url: "https://academic.oup.com/comjnl/article/5/1/10/395338", note: "Publicación original de C. A. R. Hoare." },
        { label: "Quicksort", organization: "NIST Dictionary of Algorithms and Data Structures", year: "2023", url: "https://www.nist.gov/dads/HTML/quicksort.html", note: "Definición, variantes y comportamiento típico/peor." }
      ],
      codeNotes: [
        "IDEA: particionar primero; no hay una fase posterior de mezcla.",
        "INVARIANTE: al cerrar la partición, el pivote queda en posición final.",
        "MEJOR/PROMEDIO: divisiones equilibradas producen O(n log n).",
        "PEOR: pivotes extremos repetidos producen O(n²) y pila O(n).",
        "ESPACIO: la partición es in-place, pero la pila cuenta como memoria auxiliar.",
        "CUIDADO: no mezcles reglas de Lomuto y Hoare; define cómo tratar duplicados."
      ]
    },
    {
      id: "kahn",
      name: "Algoritmo de Kahn",
      englishName: "Kahn's Algorithm",
      category: "Grafos",
      difficulty: "Intermedio",
      presetId: "dependencies",
      definition: "Construye un orden topológico emitiendo repetidamente vértices sin dependencias pendientes y eliminando sus aristas salientes.",
      reason: "Hace visible qué tareas están listas ahora y detecta un ciclo si el proceso se detiene antes de emitir todos los vértices.",
      objectives: [
        "Calcular y actualizar correctamente el grado de entrada de cada vértice.",
        "Interpretar la cola como el conjunto de tareas actualmente habilitadas.",
        "Demostrar por qué el orden emitido respeta todas las dependencias.",
        "Detectar un ciclo comparando vértices emitidos con el total."
      ],
      quick: {
        what: "Ordena un DAG usando grados de entrada y una cola de vértices listos.",
        use: "Dependencias, prerrequisitos, pipelines de compilación y planificación.",
        complexity: "Tiempo O(V + E) en todos los escenarios · espacio O(V).",
        key: "La cola contiene exactamente los vértices no emitidos con grado de entrada cero.",
        caution: "Un resultado parcial no es un orden válido completo: indica un ciclo o datos incompletos."
      },
      requirements: [
        "El problema debe modelarse como un grafo dirigido: u → v significa que u debe aparecer antes que v.",
        "Todos los vértices, incluso aislados, deben existir en la estructura de entrada.",
        "Las aristas paralelas deben contarse y eliminarse de forma coherente.",
        "Un orden topológico completo solo existe si el grafo es acíclico."
      ],
      mechanics: [
        "Cuenta las aristas entrantes de cada vértice.",
        "Agrega a la cola todos los vértices cuyo grado de entrada es cero.",
        "Extrae un vértice listo y agrégalo al orden.",
        "Elimina conceptualmente cada arista saliente y reduce el grado de su destino.",
        "Cuando un sucesor llega a cero, agrégalo a la cola.",
        "Al final, si se emitieron menos de V vértices, existe al menos un ciclo."
      ],
      steps: [
        { lineKey: "degree", occurrence: 0, title: "Contar dependencias", short: "Cada arista incrementa el grado de su destino.", detail: "Esta pasada inicial permite saber qué vértices pueden ejecutarse sin esperar a otro." },
        { lineKey: "queue", occurrence: 0, title: "Preparar la cola", short: "Entran todos los vértices con grado cero.", detail: "Puede haber varias opciones correctas; el orden topológico no siempre es único." },
        { lineKey: "extract", occurrence: 0, title: "Extraer un vértice listo", short: "El frente de la cola ya no tiene predecesores pendientes.", detail: "Elegirlo es seguro porque ninguna arista no resuelta exige que otro vértice aparezca antes." },
        { lineKey: "emit", occurrence: 0, title: "Agregarlo al orden", short: "El vértice ocupa la siguiente posición válida.", detail: "El prefijo emitido respeta todas las dependencias entre sus elementos." },
        { lineKey: "update", occurrence: 0, title: "Resolver una arista", short: "Disminuye el grado del sucesor.", detail: "Cada arista se procesa una sola vez, cuando se emite su origen." },
        { lineKey: "enqueue", occurrence: 0, title: "Habilitar un sucesor", short: "Al llegar a cero, el sucesor entra a la cola.", detail: "Ese vértice ya tiene todas sus dependencias representadas en el prefijo emitido." },
        { lineKey: "cycle", occurrence: 0, title: "Verificar ciclos", short: "Compara emitidos con el número total de vértices.", detail: "Si quedan vértices, sus grados positivos se sostienen mutuamente y no existe un orden topológico completo." },
        { lineKey: "done", occurrence: 0, title: "Entregar el orden", short: "Todos los vértices fueron emitidos.", detail: "Cada arista u → v queda orientada de una posición anterior a una posterior del resultado."
        }
      ],
      complexity: {
        best: { value: "O(V + E)", why: "Leer el grafo y calcular todos los grados ya requiere visitar vértices y aristas.", example: "Un grafo sin aristas coloca todos los vértices en la cola, pero aún registra V elementos." },
        average: { value: "O(V + E)", why: "Cada vértice entra y sale de la cola una vez; cada arista reduce un grado una vez.", example: "Un DAG de dependencias con varias ramas." },
        worst: { value: "O(V + E)", why: "Incluso al detectar un ciclo se construyen los grados y se inspecciona la representación completa.", example: "Un grafo grande con un ciclo en una región final." },
        space: { value: "O(V)", detail: "Se conservan grados, cola y orden. La lista de adyacencia de entrada ocupa O(V + E), pero normalmente no se cuenta como memoria auxiliar." },
        note: "La cota supone una representación por listas de adyacencia. Con una matriz, recorrer sucesores puede elevar el costo a O(V²)."
      },
      invariant: {
        statement: "La cola contiene exactamente los vértices no emitidos cuyo grado de entrada restante es cero.",
        initialization: "Después de contar todas las aristas, se encolan todos y solo los vértices sin predecesores.",
        maintenance: "Al emitir u se eliminan sus aristas; cada sucesor entra solo cuando la última dependencia pendiente desaparece.",
        termination: "Si se emiten V vértices, el orden es válido. Si la cola se vacía antes, los vértices restantes pertenecen o dependen de un ciclo."
      },
      useWhen: [
        "Necesitas ordenar tareas con prerrequisitos.",
        "Quieres conocer simultáneamente qué trabajos están listos para ejecutarse.",
        "Necesitas detectar ciclos como parte del mismo recorrido.",
        "Quieres priorizar entre varios vértices listos usando una cola o heap."
      ],
      avoidWhen: [
        "El grafo es no dirigido o las aristas no representan precedencia.",
        "Necesitas mantener el orden ante actualizaciones continuas; puede convenir un algoritmo topológico incremental.",
        "Solo necesitas detectar un ciclo y no el orden; un DFS dedicado puede ser más directo.",
        "Esperas un único resultado canónico sin especificar cómo desempatar vértices listos."
      ],
      applications: ["Pipelines de compilación", "Planificación de cursos", "Migraciones de base de datos", "Resolución de dependencias", "Ejecución de DAGs de datos"],
      mistakes: [
        { title: "Invertir el significado de la arista", detail: "Si u depende de v, la arista para el orden suele ser v → u." },
        { title: "Olvidar vértices aislados", detail: "No aparecerán al iterar aristas, pero deben formar parte del resultado." },
        { title: "Encolar dos veces", detail: "Un sucesor debe entrar exactamente cuando su grado cambia a cero." },
        { title: "Confundir parcial con completo", detail: "Si emitidos < V, el prefijo no debe presentarse como solución final." },
        { title: "Prometer un orden único", detail: "Diferentes políticas de cola pueden producir órdenes distintos y todos ser válidos."
        }
      ],
      variants: [
        { name: "Cola de prioridad", use: "Produce el orden lexicográficamente menor entre las opciones disponibles, con costo adicional." },
        { name: "Capas topológicas", use: "Procesa simultáneamente todos los vértices listos y obtiene niveles de ejecución." },
        { name: "DFS con postorden", use: "Alternativa clásica para obtener un orden y detectar ciclos mediante colores." },
        { name: "Ordenamiento incremental", use: "Mantiene un orden cuando el grafo cambia, evitando recomputar desde cero en ciertos escenarios." }
      ],
      history: {
        title: "Arthur B. Kahn y las redes grandes",
        paragraphs: [
          "A. B. Kahn publicó “Topological sorting of large networks” en Communications of the ACM en noviembre de 1962. El trabajo presentó un método general de ordenamiento topológico orientado a redes mayores que las manejadas por procedimientos previos.",
          "El artículo sitúa el problema en análisis de redes como PERT y señala que el método surgió como subproducto de una necesidad de Westinghouse en Baltimore. La cola de vértices sin predecesores pendientes hace explícita esa relación con planificación."
        ]
      },
      references: [
        { label: "Topological sorting of large networks", organization: "Communications of the ACM", year: "1962", url: "https://dl.acm.org/doi/10.1145/368996.369025", note: "Publicación original de A. B. Kahn, DOI 10.1145/368996.369025." },
        { label: "Topological sort", organization: "NIST Dictionary of Algorithms and Data Structures", year: "2022", url: "https://www.nist.gov/dads/HTML/topologicalSort.html", note: "Definición y relación con orden parcial y DAG." },
        { label: "Topological order", organization: "NIST Dictionary of Algorithms and Data Structures", year: "2004", url: "https://www.nist.gov/dads/HTML/topologicalOrder.html", note: "Propiedad formal de un orden topológico." }
      ],
      codeNotes: [
        "MODELO: una arista u -> v significa que u debe ocurrir antes que v.",
        "INVARIANTE: la cola contiene no emitidos con indegree igual a cero.",
        "TIEMPO: O(V + E) con listas de adyacencia; cada arista se procesa una vez.",
        "ESPACIO AUXILIAR: O(V) para grados, cola y orden.",
        "CICLO: si orden.length es menor que V, no existe orden topológico completo.",
        "CUIDADO: incluye vértices aislados y define cómo desempatar varios nodos listos."
      ]
    }
  ];

  window.TheoryContent = Object.freeze({ algorithms });
})();
