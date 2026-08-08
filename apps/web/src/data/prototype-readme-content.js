(() => {
  "use strict";

  const entries = {
    "linear-search": {
      principle: "Recorrer la colección en orden y comparar cada elemento con el objetivo hasta encontrarlo o agotar la entrada.",
      requirements: ["No exige que los datos estén ordenados.", "La igualdad debe estar definida para el tipo de dato buscado."],
      mechanics: ["Comienza en el primer elemento.", "Compara el valor actual con el objetivo.", "Si coincide, devuelve su posición; si no, avanza uno.", "Devuelve ausencia al terminar el recorrido."],
      useWhen: ["La colección es pequeña o no está ordenada.", "Solo se hará una búsqueda y ordenar costaría más.", "Los datos llegan como flujo o lista sin acceso aleatorio."],
      avoidWhen: ["Hay muchas consultas sobre una colección estable que puede indexarse.", "La latencia exige descartar grandes regiones en cada paso."],
      history: { title: "Una técnica elemental sin autor único", paragraphs: ["La búsqueda secuencial precede a la computación electrónica: es la forma directa de revisar una lista. Por esa razón no existe una publicación universalmente aceptada como su invención.", "En informática quedó formalizada como algoritmo básico de acceso a datos; sigue siendo la referencia contra la que se comparan índices y búsquedas estructuradas."] },
      references: [{ label: "Sequential search", meta: "NIST Dictionary of Algorithms and Data Structures", url: "https://xlinux.nist.gov/dads/HTML/sequentialSearch.html" }]
    },
    "binary-search": {
      principle: "Usar el orden para eliminar la mitad del intervalo candidato después de cada comparación.",
      requirements: ["Colección ordenada con el mismo comparador.", "Acceso eficiente a la posición media.", "Convención clara para límites y duplicados."],
      mechanics: ["Marca los extremos del intervalo candidato.", "Inspecciona su punto medio.", "Conserva únicamente la mitad que todavía puede contener el objetivo.", "Termina al encontrarlo o vaciar el intervalo."],
      useWhen: ["La entrada está ordenada y habrá consultas repetidas.", "El acceso por índice es O(1)."],
      avoidWhen: ["Los datos cambian tanto que mantener el orden domina el costo.", "La estructura solo permite recorrido secuencial."],
      history: { title: "De la bisección a las tablas en memoria", paragraphs: ["Dividir un intervalo por la mitad es una idea matemática antigua. Su formulación para búsqueda en tablas apareció con las primeras computadoras de programa almacenado.", "La historia también recuerda que detalles como límites inclusivos y duplicados hacen difícil una implementación completamente correcta, aunque la idea central sea compacta."] },
      references: [{ label: "Binary search", meta: "NIST Dictionary of Algorithms and Data Structures", url: "https://xlinux.nist.gov/dads/HTML/binarySearch.html" }]
    },
    "jump-search": {
      principle: "Saltar por bloques sobre datos ordenados y hacer una búsqueda lineal solo dentro del bloque que puede contener el objetivo.",
      requirements: ["Colección ordenada.", "Acceso aleatorio a los extremos de bloque.", "Un tamaño de salto; √n equilibra saltos y escaneo en el modelo clásico."],
      mechanics: ["Calcula el tamaño de bloque.", "Compara el objetivo con el final de cada bloque.", "Detiene los saltos al sobrepasar o acotar el objetivo.", "Escanea linealmente el bloque candidato."],
      useWhen: ["Se busca un compromiso simple entre búsqueda lineal y binaria.", "Saltar es barato, pero la estructura no favorece muchas comparaciones intermedias."],
      avoidWhen: ["La búsqueda binaria está disponible y el acceso aleatorio es uniforme.", "La entrada no está ordenada."],
      history: { title: "Una estrategia de búsqueda por bloques", paragraphs: ["Jump Search pertenece a la familia de búsquedas por bloques. No se atribuye de forma estable a un único inventor; su análisis clásico elige bloques de tamaño cercano a √n para balancear dos costos.", "Es valioso didácticamente porque hace visible un diseño híbrido: primero localiza una región y después cambia a un método más simple."] },
      references: [{ label: "Jump search", meta: "NIST Dictionary of Algorithms and Data Structures", url: "https://xlinux.nist.gov/dads/HTML/jumpSearch.html" }]
    },
    "interpolation-search": {
      principle: "Estimar la posición del objetivo a partir de su valor y de los valores que delimitan el intervalo, en lugar de elegir siempre el centro.",
      requirements: ["Datos ordenados y numéricos o interpolables.", "Distribución aproximadamente uniforme para obtener el promedio esperado.", "Protección cuando los extremos contienen el mismo valor."],
      mechanics: ["Mantiene un intervalo cuyos valores acotan el objetivo.", "Estima la posición proporcional del objetivo.", "Compara en esa posición.", "Actualiza uno de los extremos y repite."],
      useWhen: ["Los valores están ordenados y se distribuyen de manera cercana a uniforme.", "Cada acceso es costoso y una buena estimación reduce sondeos."],
      avoidWhen: ["La distribución tiene huecos o sesgos fuertes.", "No puede garantizarse el orden ni evitar divisiones degeneradas."],
      history: { title: "Peterson y el acceso aleatorio", paragraphs: ["W. Wesley Peterson describió en 1957 técnicas de direccionamiento para almacenamiento de acceso aleatorio que dieron origen a la búsqueda por interpolación.", "Trabajos posteriores separaron con claridad su excelente comportamiento promedio bajo distribuciones uniformes de su peor caso lineal."] },
      references: [{ label: "Addressing for random-access storage", meta: "W. W. Peterson · IBM Journal of Research and Development · 1957", url: "https://doi.org/10.1147/rd.12.0130" }]
    },
    "bubble-sort": {
      principle: "Comparar vecinos e intercambiarlos cuando están fuera de orden; cada pasada deja un extremo en su posición definitiva.",
      requirements: ["Comparador consistente.", "Estructura mutable para realizar intercambios en el lugar."],
      mechanics: ["Recorre pares adyacentes.", "Intercambia cada inversión local.", "Reduce el límite de la siguiente pasada.", "Puede terminar antes si una pasada no cambia nada."],
      useWhen: ["Se enseña el efecto de comparaciones e intercambios.", "La entrada es mínima y la claridad importa más que el rendimiento."],
      avoidWhen: ["La colección crece o el costo de escribir/intercambiar es alto.", "Se requiere un ordenamiento de producción competitivo."],
      history: { title: "Un nombre popular, una atribución discutida", paragraphs: ["Las técnicas de intercambio adyacente aparecieron en la literatura temprana de ordenamiento. El nombre Bubble Sort alude a cómo los valores mayores ascienden hacia un extremo.", "No existe un inventor único aceptado; hoy se conserva sobre todo por su valor pedagógico y como ejemplo de crecimiento cuadrático."] },
      references: [{ label: "Bubble sort", meta: "NIST Dictionary of Algorithms and Data Structures", url: "https://xlinux.nist.gov/dads/HTML/bubblesort.html" }]
    },
    "insertion-sort": {
      principle: "Construir un prefijo ordenado insertando cada nuevo elemento en la posición que le corresponde.",
      requirements: ["Comparador consistente.", "Posibilidad de desplazar elementos dentro de la secuencia."],
      mechanics: ["Toma el siguiente elemento como clave.", "Desplaza a la derecha los elementos mayores del prefijo.", "Inserta la clave en el hueco.", "Amplía el prefijo ordenado."],
      useWhen: ["La entrada es pequeña o está casi ordenada.", "Se ordenan lotes cortos dentro de un algoritmo híbrido.", "Se necesita estabilidad con una implementación directa."],
      avoidWhen: ["Hay muchas inversiones en una entrada grande.", "Mover elementos es particularmente costoso."],
      history: { title: "La analogía de ordenar una mano", paragraphs: ["Insertar cada elemento en una parte ya ordenada es una técnica anterior a las computadoras, comparable con ordenar cartas en la mano.", "No tiene un inventor único documentado. En algoritmos modernos aún aparece como fase base para particiones pequeñas por su baja sobrecarga."] },
      references: [{ label: "Insertion sort", meta: "NIST Dictionary of Algorithms and Data Structures", url: "https://xlinux.nist.gov/dads/HTML/insertionSort.html" }]
    },
    "selection-sort": {
      principle: "Seleccionar repetidamente el mínimo de la región pendiente y colocarlo en la siguiente posición definitiva.",
      requirements: ["Comparador consistente.", "Estructura mutable si se intercambia en el lugar."],
      mechanics: ["Separa un prefijo final y un sufijo pendiente.", "Busca el mínimo del sufijo.", "Lo intercambia con la primera posición pendiente.", "Avanza la frontera."],
      useWhen: ["Las escrituras son mucho más costosas que las comparaciones.", "Se necesita una implementación muy pequeña y predecible."],
      avoidWhen: ["Se requiere estabilidad sin modificaciones adicionales.", "El número cuadrático de comparaciones es inaceptable."],
      history: { title: "Selección directa sin autor único", paragraphs: ["Elegir el menor elemento restante es una de las formas más antiguas de describir el ordenamiento manual.", "Su importancia actual está en mostrar que dos algoritmos con O(n²) pueden tener perfiles distintos: Selection Sort hace pocas escrituras, aunque no evita comparaciones."] },
      references: [{ label: "Selection sort", meta: "NIST Dictionary of Algorithms and Data Structures", url: "https://xlinux.nist.gov/dads/HTML/selectionSort.html" }]
    },
    "merge-sort": {
      principle: "Dividir la entrada, ordenar las partes y fusionarlas aprovechando que ambas ya están ordenadas.",
      requirements: ["Comparador consistente.", "Memoria auxiliar para la fusión en la variante sobre arreglos.", "Criterio de desempate si se requiere estabilidad."],
      mechanics: ["Divide hasta obtener casos triviales.", "Ordena recursivamente cada mitad.", "Compara los frentes de ambas mitades.", "Copia el menor y consume los elementos restantes."],
      useWhen: ["Se necesita O(n log n) garantizado y estabilidad.", "Se ordenan listas enlazadas o datos externos por bloques."],
      avoidWhen: ["La memoria auxiliar O(n) es una restricción fuerte.", "Las entradas son diminutas y la recursión agrega sobrecarga."],
      history: { title: "Von Neumann y el ordenamiento para computadoras", paragraphs: ["Merge Sort se asocia con John von Neumann y el trabajo de programación de mediados de la década de 1940.", "Su patrón dividir–resolver–fusionar se volvió un ejemplo central de divide y vencerás y resultó especialmente natural para ordenar información almacenada de forma secuencial."] },
      references: [{ label: "Merge sort", meta: "NIST Dictionary of Algorithms and Data Structures", url: "https://xlinux.nist.gov/dads/HTML/mergeSort.html" }]
    },
    "quick-sort": {
      principle: "Particionar alrededor de un pivote y resolver de forma independiente las regiones que quedan a cada lado.",
      requirements: ["Comparador consistente.", "Una política de pivote y partición definida.", "Control de profundidad si el peor caso es un riesgo."],
      mechanics: ["Elige un pivote.", "Reorganiza para separar menores y mayores.", "Fija la frontera de partición.", "Repite sobre los subarreglos no triviales."],
      useWhen: ["Se ordenan arreglos en memoria y se valora localidad de caché.", "Puede aleatorizarse o elegirse bien el pivote."],
      avoidWhen: ["Se exige estabilidad directa.", "Debe garantizarse O(n log n) sin introspección o límite de profundidad."],
      history: { title: "C. A. R. Hoare y Quicksort", paragraphs: ["C. A. R. Hoare desarrolló Quicksort alrededor de 1959 y publicó el algoritmo en Communications of the ACM en 1961/1962.", "El diseño convirtió la partición en la operación decisiva y se volvió una de las familias de ordenamiento interno más influyentes."] },
      references: [{ label: "Quicksort", meta: "C. A. R. Hoare · The Computer Journal · 1962", url: "https://doi.org/10.1093/comjnl/5.1.10" }]
    },
    "heap-sort": {
      principle: "Organizar la entrada como heap, extraer repetidamente el máximo y reconstruir la propiedad del heap.",
      requirements: ["Acceso por índice para representar el árbol implícito.", "Comparador consistente.", "Índices de hijos calculados con el mismo origen."],
      mechanics: ["Construye un max-heap.", "Intercambia la raíz con el final pendiente.", "Reduce la región activa.", "Restaura el heap desde la raíz."],
      useWhen: ["Se requiere O(n log n) en peor caso con O(1) auxiliar.", "La estabilidad no es necesaria."],
      avoidWhen: ["Se necesita estabilidad.", "La localidad de memoria y el rendimiento promedio favorecen otra estrategia."],
      history: { title: "Williams y el heap binario", paragraphs: ["J. W. J. Williams publicó en 1964 el algoritmo 232, Heapsort, junto con la estructura de heap binario usada para mantener el extremo prioritario.", "Ese mismo año Robert W. Floyd presentó una construcción de heap más eficiente, base de implementaciones posteriores."] },
      references: [{ label: "Algorithm 232: Heapsort", meta: "J. W. J. Williams · Communications of the ACM · 1964", url: "https://doi.org/10.1145/512274.512284" }]
    },
    "bfs": {
      principle: "Explorar un grafo por capas usando una cola: primero todos los vértices a distancia uno, después a distancia dos y así sucesivamente.",
      requirements: ["Representación del grafo y conjunto de visitados.", "Cola FIFO.", "Definir si el grafo es dirigido y si hay componentes desconectados."],
      mechanics: ["Marca y encola el origen.", "Extrae el frente de la cola.", "Descubre y encola vecinos no visitados.", "Repite hasta vaciar la cola."],
      useWhen: ["Se buscan distancias mínimas en grafos no ponderados.", "Se necesita explorar por niveles o encontrar el camino con menos aristas."],
      avoidWhen: ["Las aristas tienen pesos distintos.", "El ancho del grafo provoca una frontera que no cabe en memoria."],
      history: { title: "De laberintos a redes", paragraphs: ["Las exploraciones por capas aparecen en trabajos tempranos de laberintos y conexión de redes, incluidos los de Edward F. Moore y C. Y. Lee a finales de los años cincuenta y principios de los sesenta.", "Más que una invención aislada, BFS consolidó el patrón de cola que garantiza distancias mínimas por número de aristas."] },
      references: [{ label: "Breadth-first search", meta: "NIST Dictionary of Algorithms and Data Structures", url: "https://xlinux.nist.gov/dads/HTML/breadthFirstSearch.html" }]
    },
    "dfs": {
      principle: "Avanzar por una rama hasta no poder continuar y después retroceder para explorar alternativas pendientes.",
      requirements: ["Representación del grafo y conjunto de visitados.", "Pila explícita o pila de llamadas.", "Límite de recursión adecuado."],
      mechanics: ["Marca el vértice actual.", "Elige un vecino no visitado.", "Profundiza desde ese vecino.", "Retrocede cuando no quedan opciones."],
      useWhen: ["Se detectan ciclos, componentes, puentes o dependencias.", "La estructura de entrada y salida temporal importa."],
      avoidWhen: ["Se necesita el camino con menos aristas.", "La profundidad puede desbordar la pila y no se usa versión iterativa."],
      history: { title: "De Trémaux al análisis lineal de grafos", paragraphs: ["La idea de recorrer un laberinto profundizando y retrocediendo se relaciona con el método de Charles Pierre Trémaux del siglo XIX.", "En informática, Robert Tarjan sistematizó en 1972 varios usos de Depth-First Search para estructuras de grafos y demostró algoritmos lineales basados en sus tiempos de descubrimiento."] },
      references: [{ label: "Depth-First Search and Linear Graph Algorithms", meta: "Robert Tarjan · SIAM Journal on Computing · 1972", url: "https://doi.org/10.1137/0201010" }]
    },
    "dijkstra": {
      principle: "Confirmar repetidamente el vértice no visitado con menor distancia provisional y relajar sus aristas salientes.",
      requirements: ["Pesos de arista no negativos.", "Cola de prioridad para la cota habitual.", "Valor de infinito y suma de pesos sin desbordamiento."],
      mechanics: ["Inicializa el origen en cero y el resto en infinito.", "Extrae la menor distancia provisional.", "Relaja cada arista saliente.", "Finaliza cuando se confirman los destinos requeridos."],
      useWhen: ["Se calculan caminos mínimos con pesos no negativos.", "Se necesita un árbol de distancias desde un origen."],
      avoidWhen: ["Existen aristas negativas.", "Todos los pesos son iguales y BFS resulta más simple."],
      history: { title: "La nota de Dijkstra de 1959", paragraphs: ["Edsger W. Dijkstra describió el método en “A Note on Two Problems in Connexion with Graphs”, publicado en Numerische Mathematik en 1959.", "El artículo resolvía tanto el camino mínimo desde un origen como la construcción de un árbol de expansión mínimo; la restricción de pesos no negativos es esencial para cerrar vértices de forma codiciosa."] },
      references: [{ label: "A Note on Two Problems in Connexion with Graphs", meta: "E. W. Dijkstra · Numerische Mathematik · 1959", url: "https://doi.org/10.1007/BF01386390" }]
    },
    "topological-sort": {
      principle: "Producir un orden lineal que coloque cada dependencia antes de aquello que depende de ella.",
      requirements: ["Grafo dirigido acíclico para obtener un orden completo.", "Significado inequívoco de la dirección de cada arista."],
      mechanics: ["Identifica una estructura que respete precedencias.", "Emite vértices sin dependencias pendientes o usa tiempos de salida DFS.", "Elimina conceptualmente sus restricciones.", "Detecta ciclo si no puede emitir todos los vértices."],
      useWhen: ["Se ordenan tareas, cursos, builds o migraciones con dependencias.", "Se requiere detectar si una relación de precedencia es viable."],
      avoidWhen: ["El grafo contiene ciclos que forman parte válida del modelo.", "Se necesita un orden total único: un DAG puede admitir varios."],
      history: { title: "Orden parcial y planificación", paragraphs: ["El problema nace de extender relaciones de precedencia parciales a una secuencia lineal. Cobró importancia práctica con planificación de proyectos, compilación y redes de actividades.", "Existen dos familias clásicas: eliminar vértices sin predecesores pendientes y ordenar por tiempos de salida de DFS."] },
      references: [{ label: "Topological sort", meta: "NIST Dictionary of Algorithms and Data Structures", url: "https://xlinux.nist.gov/dads/HTML/topologicalSort.html" }]
    },
    "kahn": {
      markdownPath: "../../catalog/algorithms/kahn/README.md",
      problem: "Dado un grafo dirigido de dependencias, producir un orden en el que cada vértice aparezca después de todos sus predecesores. Si las dependencias forman un ciclo, no existe un orden topológico completo y debe informarse el bloqueo.",
      family: "Ordenamiento topológico de grafos dirigidos",
      paradigm: "Procesamiento incremental con estrategia greedy",
      inputs: [
        "Grafo dirigido G = (V, E).",
        "Vértices con identificadores únicos.",
        "Aristas orientadas desde la dependencia hacia el elemento dependiente.",
        "Opcionalmente, una política de desempate entre varios vértices listos."
      ],
      outputs: [
        "Una lista order con un orden topológico válido cuando el grafo es acíclico.",
        "Un resultado parcial y los vértices bloqueados cuando no se pueden emitir todos.",
        "Un diagnóstico de ciclo cuando order.length es menor que |V|.",
        "No modifica el grafo de entrada; mantiene mapas de grado y adyacencia para la ejecución."
      ],
      assumptions: {
        explicit: [
          "El grafo es dirigido.",
          "El grado de entrada se calcula para todos los vértices.",
          "Los nodos aislados también forman parte de V y pueden iniciar la cola.",
          "Una arista u → v significa que u debe aparecer antes que v."
        ],
        implicit: [
          "Los identificadores de nodos son únicos.",
          "Cada extremo de arista existe en el conjunto de vértices.",
          "La estructura de adyacencia es finita y cabe en memoria.",
          "La cola FIFO es un desempate válido; no implica que el orden sea único."
        ]
      },
      context: [
        "Se utiliza para planificar tareas, compilaciones, cursos, migraciones y módulos con dependencias.",
        "En esta aplicación se ejecuta como una traza educativa sobre diez presets válidos, aislados, ramificados, desconectados y cíclicos.",
        "La ejecución es síncrona, determinista para un layout y no realiza I/O, red ni acceso a base de datos.",
        "En producción, el costo afecta memoria y latencia cuando V y E crecen; la traza debe limitarse a grafos pequeños."
      ],
      visualization: [
        "El diagrama muestra cada vértice y arista dirigida.",
        "El grado de entrada aparece como dependencias pendientes.",
        "La cola resalta los vértices listos para emitirse.",
        "El nodo actual y la arista activa se muestran durante la actualización.",
        "El orden parcial aparece en la zona de resultado.",
        "Los nodos restantes se marcan como bloqueados cuando la cola queda vacía."
      ],
      solution: [
        "Inicializa incoming[v] = 0 y outgoing[v] = [] para cada vértice.",
        "Recorre cada arista u → v, incrementa incoming[v] y agrega v a outgoing[u].",
        "Encola todos los vértices cuyo grado de entrada es cero.",
        "Extrae un vértice, lo agrega a order y lo marca como emitido.",
        "Decrementa el grado de entrada de cada sucesor; cuando llega a cero, lo encola.",
        "Repite hasta vaciar la cola.",
        "Si se emitieron |V| vértices, devuelve un orden completo; de lo contrario informa un ciclo."
      ],
      pseudocode: `procedure Kahn(graph):
    for each vertex v in graph.vertices:
        indegree[v] = 0
        outgoing[v] = []

    for each directed edge (u, v) in graph.edges:
        indegree[v] = indegree[v] + 1
        append v to outgoing[u]

    queue = all vertices v where indegree[v] == 0
    order = []

    while queue is not empty:
        current = dequeue(queue)
        append current to order

        for each successor in outgoing[current]:
            indegree[successor] = indegree[successor] - 1
            if indegree[successor] == 0:
                enqueue(queue, successor)

    if length(order) != number of graph.vertices:
        return { status: "cycle", order: order }

    return { status: "complete", order: order }`,
      correctness: [
        "Un vértice solo entra en la cola cuando ya fueron emitidos todos sus predecesores.",
        "Por lo tanto, cada vértice agregado a order aparece después de sus dependencias.",
        "En un DAG siempre existe al menos un vértice de grado de entrada cero; eliminarlo conserva otro DAG.",
        "Por inducción, un DAG permite emitir todos sus vértices.",
        "Si la cola se vacía y quedan vértices, los restantes no pueden liberarse por dependencias circulares; el orden completo es imposible."
      ],
      edgeCases: [
        { name: "Grafo vacío", status: "No cubierto por los presets", detail: "Debe devolver un orden vacío sin error." },
        { name: "Vértice aislado", status: "Cubierto conceptualmente", detail: "Tiene grado cero y entra a la cola inicial." },
        { name: "Varias fuentes", status: "Cubierto", detail: "La cola FIFO elige una fuente válida; puede existir más de un orden correcto." },
        { name: "Ciclo", status: "Cubierto", detail: "El preset cycle deja vértices bloqueados y reporta que no se emitieron todos." },
        { name: "Arista duplicada", status: "No cubierto", detail: "Se cuenta dos veces y requiere una política explícita." },
        { name: "Extremo de arista inexistente", status: "No cubierto", detail: "Debe producir un diagnóstico de entrada inválida." }
      ],
      consequences: {
        advantages: ["Complejidad lineal O(V + E).", "Detecta ciclos durante el mismo proceso.", "Hace visibles las dependencias pendientes.", "Permite políticas de desempate entre tareas listas."],
        disadvantages: ["Necesita memoria para grados y adyacencias.", "No devuelve un orden completo si hay ciclos.", "La FIFO no produce necesariamente el orden lexicográficamente menor.", "La visualización completa no escala a grafos grandes."],
        tradeoffs: [
          "FIFO ofrece simplicidad y una traza clara, pero no minimiza el orden.",
          "Guardar snapshots facilita aprender, pero usa más memoria que el algoritmo puro.",
          "Validar todas las aristas mejora los diagnósticos, con un costo lineal adicional pequeño."
        ]
      },
      alternatives: [
        { name: "Orden topológico por DFS", complexity: "O(V + E), espacio O(V)", detail: "Usa colores o estados de visita y tiempos de salida; es útil cuando ya existe una infraestructura DFS." },
        { name: "Kahn con min-heap", complexity: "O((V + E) log V)", detail: "Produce el orden lexicográficamente menor, a cambio de más costo." },
        { name: "Recalcular grados repetidamente", complexity: "O(V · E) o peor", detail: "Es más simple como borrador, pero no es adecuada para producción." }
      ],
      implementation: [
        "La implementación de la aplicación está en kahnTrace(preset) dentro del paquete algorithm-catalog.",
        "graphLayouts proporciona nodos y aristas para los diez escenarios Kahn del catálogo.",
        "recorder conserva variables, estado, contadores y pasos para el panel de ejecución.",
        "El núcleo usa mapas incoming/outgoing y una cola JavaScript con shift().",
        "La implementación actual es una traza determinista de demostración, no un analizador de repositorios arbitrarios."
      ],
      tests: [
        "Unitaria: cada arista u → v debe respetar la posición de u antes de v en un DAG.",
        "Unitarias: grafo vacío, nodo aislado, múltiples fuentes y ciclo.",
        "Propiedad: el resultado contiene cada vértice una sola vez cuando no hay ciclo.",
        "Propiedad: ningún vértice emitido conserva un predecesor no emitido.",
        "Entrada inválida: IDs duplicados, aristas duplicadas y referencias inexistentes.",
        "Benchmark: comparar memoria y tiempo de snapshots contra una implementación sin visualización."
      ],
      scenarioTests: [
        {
          scenario: "DAG · varias fuentes (preset: dependencies)",
          input: "V = {A, B, C, D, E, F}; E = {A→C, A→D, B→D, C→E, D→E, D→F, E→F}.",
          expected: "Orden completo válido: A → B → C → D → E → F; no se detecta ciclo.",
          steps: "Calcular grados: A:0, B:0, C:1, D:2, E:2, F:2; preparar cola A y B; emitir A y B; habilitar C y D; emitir C y D; habilitar E; emitir E; habilitar F; emitir F.",
          observed: "La traza ejecuta los pasos degree, queue, extract, emit, update y enqueue hasta emitir 6/6 vértices.",
          status: "Cubierto por la interfaz"
        },
        {
          scenario: "Dependencias con ciclo (preset: cycle)",
          input: "V = {A, B, C, D, E, F}; E = {A→B, A→E, B→C, C→D, D→C, E→F}.",
          expected: "Orden parcial A → B → E → F; diagnóstico de ciclo; quedan bloqueados C y D.",
          steps: "Calcular grados: A:0, B:1, C:2, D:1, E:1, F:1; emitir A y habilitar B/E; emitir B y reducir C; emitir E y habilitar F; emitir F; verificar C y D no emitidos.",
          observed: "La traza ejecuta degree, queue, extract, emit, update y enqueue hasta Detectar un ciclo con emitidos 4/6.",
          status: "Cubierto por la interfaz"
        }
      ],
      scenarioTestsAll: [
        { scenario: "Grafo vacío (preset: empty)", input: "V = {}; E = {}.", expected: "Orden vacío; 0/0 vértices emitidos; no se detecta ciclo.", steps: "Calcular grados sin vértices; preparar una cola vacía; confirmar que no quedan vértices bloqueados.", observed: "La traza termina en Orden topológico completo con order vacío.", status: "Cubierto por la interfaz" },
        { scenario: "Un vértice aislado (preset: single)", input: "V = {A}; E = {}.", expected: "Orden A; 1/1 vértices emitidos.", steps: "Grado A:0; encolar A; extraer A; emitir A; confirmar que no hay ciclos.", observed: "La cola contiene A y la traza finaliza con A como orden completo.", status: "Cubierto por la interfaz" },
        { scenario: "Vértices aislados (preset: isolated)", input: "V = {A, B, C}; E = {}.", expected: "Orden A → B → C; cualquier permutación sería válida.", steps: "Todos los grados son cero; la cola inicial contiene A, B y C; se emiten en orden FIFO.", observed: "La traza emite 3/3 vértices sin actualizar aristas.", status: "Cubierto por la interfaz" },
        { scenario: "Cadena lineal (preset: chain)", input: "V = {A, B, C, D}; E = {A→B, B→C, C→D}.", expected: "Orden A → B → C → D.", steps: "Solo A inicia listo; cada emisión libera exactamente al siguiente vértice.", observed: "La cola mantiene un único candidato en cada etapa y termina con 4/4.", status: "Cubierto por la interfaz" },
        { scenario: "Varias ramas (preset: branching)", input: "V = {A, B, C, D, E, F}; E = {A→B, A→C, B→D, C→E, D→F, E→F}.", expected: "Orden A → B → C → D → E → F; cada dependencia apunta hacia adelante.", steps: "A libera B y C; B y C liberan D y E; D y E liberan F.", observed: "La traza alterna dos ramas y muestra la cola con varios nodos listos.", status: "Cubierto por la interfaz" },
        { scenario: "Componentes desconectados (preset: disconnected)", input: "V = {A, B, C, D, E}; E = {A→B, C→D}; E está aislado.", expected: "Orden FIFO A → C → E → B → D; también son válidos otros órdenes que respeten las aristas.", steps: "La cola inicial contiene A, C y E; A libera B y C libera D; E permanece independiente.", observed: "La traza procesa dos componentes y un nodo aislado en un solo orden válido.", status: "Cubierto por la interfaz" },
        { scenario: "Auto ciclo (preset: self-loop)", input: "V = {A}; E = {A→A}.", expected: "No hay orden completo; A queda bloqueado y se detecta ciclo.", steps: "Grado A:1; la cola inicial queda vacía; no se emite ningún vértice.", observed: "La traza finaliza con Detectar un ciclo y emitidos 0/1.", status: "Cubierto por la interfaz" },
        { scenario: "Arista duplicada (preset: duplicate-edge)", input: "V = {A, B, C}; E = {A→B, A→B, B→C}.", expected: "Orden A → B → C; la arista paralela se cuenta dos veces y se libera B después de dos decrementos.", steps: "A tiene grado cero; sus dos aristas reducen el grado de B de 2 a 0; B libera C.", observed: "La traza procesa dos actualizaciones A→B y encola B solo al llegar a cero.", status: "Cubierto por la interfaz" },
        { scenario: "DAG · varias fuentes (preset: dependencies)", input: "V = {A, B, C, D, E, F}; E = {A→C, A→D, B→D, C→E, D→E, D→F, E→F}.", expected: "Orden A → B → C → D → E → F; no se detecta ciclo.", steps: "La cola comienza con A y B; cada emisión reduce grados y habilita C, D, E y F.", observed: "La traza emite 6/6 vértices y muestra Orden topológico completo.", status: "Cubierto por la interfaz" },
        { scenario: "Dependencias con ciclo (preset: cycle)", input: "V = {A, B, C, D, E, F}; E = {A→B, A→E, B→C, C→D, D→C, E→F}.", expected: "Orden parcial A → B → E → F; C y D quedan bloqueados por el ciclo C ↔ D.", steps: "A habilita B y E; B reduce C pero no lo libera; E libera F; F se emite; la cola queda vacía con C y D pendientes.", observed: "La traza termina en Detectar un ciclo con emitidos 4/6.", status: "Cubierto por la interfaz" }
      ],
      realApplications: [
        "Orden de compilación de módulos y proyectos.",
        "Instalación y resolución de paquetes con dependencias.",
        "Planificación de tareas y pipelines de datos.",
        "Orden de migraciones de base de datos.",
        "Programación de cursos con prerrequisitos.",
        "Ejecución de etapas de un workflow cuando las dependencias se liberan."
      ],
      commonErrors: [
        { error: "Invertir el sentido de las aristas", present: "Riesgo de entrada", evidence: "La convención debe ser dependencia → dependiente." },
        { error: "Olvidar nodos aislados", present: "No observado en la traza", evidence: "Se calculan grados para todos los nodos del layout." },
        { error: "No comparar emitidos con V", present: "No", evidence: "La traza conserva emitidos y bloqueados." },
        { error: "Suponer que existe un único orden", present: "Riesgo documental", evidence: "Varias fuentes pueden producir órdenes diferentes y todos ser válidos." },
        { error: "Procesar una arista sin validar sus extremos", present: "No cubierto", evidence: "Los layouts actuales son controlados." }
      ],
      principle: "Mantener una cola de vértices con grado de entrada cero, emitirlos y liberar progresivamente a sus sucesores.",
      requirements: ["Grafo dirigido.", "Grado de entrada calculado para todos los vértices.", "Procesar también vértices aislados."],
      mechanics: ["Calcula los grados de entrada.", "Encola todos los ceros.", "Emite uno y decrementa a sus sucesores.", "Si no se emiten todos, existe un ciclo."],
      useWhen: ["Se quiere un orden topológico incremental y detección explícita de ciclos.", "Interesa controlar el desempate entre varias tareas listas."],
      avoidWhen: ["La relación no es dirigida.", "Se necesita conservar ciclos como unidades en vez de rechazarlos."],
      history: { title: "Arthur B. Kahn y las redes grandes", paragraphs: ["A. B. Kahn publicó “Topological sorting of large networks” en Communications of the ACM en 1962.", "El trabajo estaba motivado por redes de planificación y convirtió el conjunto de nodos sin predecesores en el frente operativo del algoritmo."] },
      references: [{ label: "Topological sorting of large networks", meta: "A. B. Kahn · Communications of the ACM · 1962", url: "https://doi.org/10.1145/368996.369025" }]
    },
    "bellman-ford": {
      principle: "Relajar todas las aristas repetidamente; después de k rondas quedan resueltos los caminos óptimos que usan como máximo k aristas.",
      requirements: ["Grafo ponderado dirigido o aristas duplicadas en ambos sentidos.", "Aritmética segura al sumar desde infinito.", "Una ronda adicional para detectar ciclos negativos alcanzables."],
      mechanics: ["Inicializa el origen en cero.", "Recorre todas las aristas y mejora destinos.", "Repite V−1 veces o termina si nada cambia.", "Prueba una ronda extra para detectar ciclo negativo."],
      useWhen: ["Hay pesos negativos y se requieren caminos mínimos desde un origen.", "Debe detectarse un ciclo de peso negativo alcanzable."],
      avoidWhen: ["Los pesos son no negativos y Dijkstra ofrece mejor escala.", "El producto V·E es demasiado grande."],
      history: { title: "Ford, Bellman y la relajación repetida", paragraphs: ["Lester R. Ford trató procesos de etiquetado y caminos en su reporte “Network Flow Theory” de 1956. Richard Bellman publicó “On a Routing Problem” en 1958 usando programación dinámica.", "El nombre Bellman–Ford reúne esas contribuciones; algunas historias también reconocen formulaciones independientes de Alfonso Shimbel."] },
      references: [{ label: "On a Routing Problem", meta: "Richard Bellman · Quarterly of Applied Mathematics · 1958", url: "https://doi.org/10.1090/qam/102435" }, { label: "Network Flow Theory", meta: "L. R. Ford Jr. · RAND P-923 · 1956", url: "https://www.rand.org/pubs/papers/P923.html" }]
    },
    "hanoi": {
      principle: "Mover n discos resolviendo dos veces el mismo problema con n−1 discos alrededor de un único movimiento del disco mayor.",
      requirements: ["Nunca colocar un disco grande sobre uno pequeño.", "Mover un solo disco por operación.", "Un caso base explícito."],
      mechanics: ["Mueve n−1 discos al auxiliar.", "Mueve el disco mayor al destino.", "Mueve los n−1 discos del auxiliar al destino.", "Detiene la recursión en un disco."],
      useWhen: ["Se enseña recursión, recurrencias y árboles de llamadas.", "Se modelan problemas con dos subproblemas idénticos y una operación central."],
      avoidWhen: ["Se espera escalabilidad: los movimientos crecen como 2ⁿ−1.", "Solo interesa ejecutar grandes n, no estudiar la estructura."],
      history: { title: "Édouard Lucas y el rompecabezas de 1883", paragraphs: ["El matemático francés Édouard Lucas comercializó el rompecabezas en 1883 bajo el seudónimo N. Claus de Siam.", "La leyenda de un templo y 64 discos popularizó una consecuencia matemática precisa: incluso al ritmo de un movimiento por segundo, 2⁶⁴−1 movimientos exceden cualquier horizonte humano."] },
      references: [{ label: "Tower of Hanoi", meta: "NIST Dictionary of Algorithms and Data Structures", url: "https://xlinux.nist.gov/dads/HTML/towersOfHanoi.html" }]
    },
    "n-queens": {
      principle: "Construir una solución fila por fila, descartar posiciones en conflicto y retroceder cuando una decisión no puede completarse.",
      requirements: ["Control de columnas y diagonales ocupadas.", "Una política de enumeración: primera solución o todas.", "Restaurar el estado al retroceder."],
      mechanics: ["Elige la siguiente fila.", "Prueba una columna segura.", "Marca columna y diagonales.", "Continúa o deshace la marca si la rama falla."],
      useWhen: ["Se enseña backtracking y poda de restricciones.", "Se enumeran configuraciones válidas de tamaño moderado."],
      avoidWhen: ["n es grande y se requiere conteo o solución a escala sin técnicas especializadas.", "No se aprovechan podas ni simetrías."],
      history: { title: "De ocho reinas a N reinas", paragraphs: ["Max Bezzel publicó el problema de las ocho reinas en 1848. Franz Nauck presentó soluciones y extendió el planteamiento al tablero n×n alrededor de 1850.", "El problema se convirtió en un banco de pruebas clásico para búsqueda exhaustiva, simetrías, programación con restricciones y análisis combinatorio."] },
      references: [{ label: "A New Approach to Solving the N-Queens Problem", meta: "NASA Technical Memorandum · revisión histórica y algorítmica · 2020", url: "https://ntrs.nasa.gov/citations/20200003161" }]
    },
    "knapsack": {
      principle: "Comparar para cada objeto y capacidad la mejor solución que lo excluye contra la que lo incluye una sola vez.",
      requirements: ["Pesos enteros no negativos para la tabla indexada por capacidad.", "Cada objeto puede elegirse como máximo una vez.", "Distinguir valor, peso y capacidad."],
      mechanics: ["Crea estados por prefijo de objetos y capacidad.", "Copia el valor sin usar el objeto.", "Si cabe, calcula el valor al incluirlo.", "Conserva el máximo y reconstruye decisiones si se necesita."],
      useWhen: ["La capacidad W es moderada y entera.", "Se requieren decisiones exactas de selección con límite de capacidad."],
      avoidWhen: ["W es enorme aunque el número de bits de entrada sea pequeño.", "Los objetos pueden fraccionarse; allí aplica una estrategia codiciosa distinta."],
      history: { title: "Un problema clásico de optimización discreta", paragraphs: ["El problema representa decisiones de carga y presupuesto estudiadas durante el desarrollo de investigación de operaciones y programación dinámica en el siglo XX.", "No se atribuye a un único inventor. Su algoritmo O(nW) es pseudopolinomial: depende del valor numérico de la capacidad, no solo del tamaño en bits de la entrada."] },
      references: [{ label: "Knapsack problem", meta: "NIST Dictionary of Algorithms and Data Structures", url: "https://xlinux.nist.gov/dads/HTML/knapsackProblem.html" }]
    },
    "fibonacci-dp": {
      principle: "Guardar resultados anteriores para calcular cada término una sola vez, en lugar de repetir el mismo árbol recursivo.",
      requirements: ["Definir F(0) y F(1).", "Tipo numérico capaz de representar el resultado.", "Decidir si se conserva toda la tabla o solo dos estados."],
      mechanics: ["Inicializa los casos base.", "Avanza desde 2 hasta n.", "Suma los dos resultados previos.", "Guarda o rota el estado y devuelve F(n)."],
      useWhen: ["Se introduce programación dinámica y eliminación de subproblemas repetidos.", "Se requieren términos consecutivos o una tabla reutilizable."],
      avoidWhen: ["n es gigantesco y conviene fast doubling o exponenciación matricial.", "La aritmética fija desborda y no se controla."],
      history: { title: "De Liber Abaci a la programación dinámica", paragraphs: ["Leonardo de Pisa, conocido como Fibonacci, difundió en Europa la sucesión mediante el problema de reproducción de conejos en Liber Abaci, publicado en 1202.", "La tabulación no es obra de Fibonacci: es una formulación moderna de programación dinámica que usa la recurrencia como ejemplo mínimo de memoización y estado acumulado."] },
      references: [{ label: "Fibonacci biography", meta: "MacTutor History of Mathematics · University of St Andrews", url: "https://mathshistory.st-andrews.ac.uk/Biographies/Fibonacci/" }]
    },
    "lis": {
      principle: "Para cada posición, conservar la mejor subsecuencia creciente que termina allí y extenderla desde posiciones anteriores compatibles.",
      requirements: ["Definir si creciente significa estricta o no decreciente.", "Conservar predecesores si se necesita reconstruir la secuencia, no solo su longitud."],
      mechanics: ["Inicializa cada posición con longitud uno.", "Compara cada valor con los anteriores.", "Extiende desde un anterior menor cuando mejora la longitud.", "Toma el máximo global y reconstruye si corresponde."],
      useWhen: ["Se quiere una solución O(n²) directa y explicable.", "La entrada es moderada o se necesita reconstrucción sencilla."],
      avoidWhen: ["n es grande y la variante O(n log n) es necesaria.", "Se confunde subsecuencia con subarreglo contiguo."],
      history: { title: "Schensted y las subsecuencias crecientes", paragraphs: ["Craige Schensted publicó en 1961 “Longest Increasing and Decreasing Subsequences”, conectando estas subsecuencias con tableaux de Young.", "El prototipo muestra la formulación dinámica O(n²). La conocida técnica O(n log n) de colas mínimas es otra implementación y requiere una reconstrucción diferente."] },
      references: [{ label: "Longest Increasing and Decreasing Subsequences", meta: "Craige Schensted · Canadian Journal of Mathematics · 1961", url: "https://doi.org/10.4153/CJM-1961-015-3" }]
    }
  };

  window.AlgorithmReadmeContent = Object.freeze({ entries: Object.freeze(entries) });
})();
