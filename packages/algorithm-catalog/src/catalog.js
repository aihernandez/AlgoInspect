(() => {
  "use strict";

  const categories = [
    { id: "search", label: "Búsqueda", color: "#79b8ff" },
    { id: "sorting", label: "Ordenamiento", color: "#bc8cff" },
    { id: "graphs", label: "Grafos", color: "#56b447" },
    { id: "recursion", label: "Recursión", color: "#e3a72f" },
    { id: "dynamic", label: "Programación dinámica", shortLabel: "DP", color: "#f47067" }
  ];

  const languages = [
    { id: "csharp", label: "C#", monaco: "csharp", extension: "cs", family: "brace" },
    { id: "java", label: "Java", monaco: "java", extension: "java", family: "brace" },
    { id: "javascript", label: "JavaScript", monaco: "javascript", extension: "js", family: "brace" },
    { id: "node", label: "Node.js", monaco: "javascript", extension: "js", family: "brace" },
    { id: "typescript", label: "TypeScript", monaco: "typescript", extension: "ts", family: "brace" },
    { id: "python", label: "Python", monaco: "python", extension: "py", family: "python" },
    { id: "rust", label: "Rust", monaco: "rust", extension: "rs", family: "brace" },
    { id: "ruby", label: "Ruby", monaco: "ruby", extension: "rb", family: "ruby" },
    { id: "c", label: "C", monaco: "c", extension: "c", family: "brace" },
    { id: "cpp", label: "C++", monaco: "cpp", extension: "cpp", family: "brace" }
  ];

  const commonPresets = {
    ordered: [
      { id: "middle", label: "Objetivo en el centro" },
      { id: "edge", label: "Objetivo en un extremo" },
      { id: "missing", label: "Objetivo ausente" }
    ],
    sort: [
      { id: "mixed", label: "Valores mezclados" },
      { id: "nearly", label: "Casi ordenado" },
      { id: "reverse", label: "Orden inverso" }
    ],
    graph: [
      { id: "connected", label: "Grafo conectado" },
      { id: "branching", label: "Varias ramas" }
    ]
  };

  const algorithms = [
    {
      id: "linear-search", slug: "LinearSearch", name: "Búsqueda lineal", englishName: "Linear Search",
      category: "search", difficulty: "Inicial", summary: "Revisa cada elemento hasta encontrar el objetivo.",
      description: "Avanza de izquierda a derecha y termina cuando el valor coincide o se agota la entrada.",
      invariant: "Todos los índices anteriores al cursor ya fueron descartados.",
      time: "O(n)", timeDetail: "Mejor O(1) · promedio/peor O(n)", space: "O(1)",
      presets: commonPresets.ordered,
      pseudo: [
        ["setup", "function linearSearch(values, target)"],
        ["loop", "for index from 0 to length(values) - 1"],
        ["compare", "if values[index] equals target"],
        ["found", "return index"],
        ["advance", "continue with the next index"],
        ["done", "return -1"]
      ]
    },
    {
      id: "binary-search", slug: "BinarySearch", name: "Búsqueda binaria", englishName: "Binary Search",
      category: "search", difficulty: "Inicial", summary: "Divide en dos un arreglo ordenado.",
      description: "Compara con el punto medio y descarta la mitad que no puede contener el objetivo.",
      invariant: "Si el objetivo existe, permanece dentro del intervalo marcado.",
      time: "O(log n)", timeDetail: "Mejor O(1) · promedio/peor O(log n)", space: "O(1)",
      presets: commonPresets.ordered,
      pseudo: [
        ["setup", "function binarySearch(values, target)"],
        ["setup", "low = 0; high = length(values) - 1"],
        ["loop", "while low is less than or equal to high"],
        ["inspect", "mid = floor((low + high) / 2)"],
        ["compare", "compare values[mid] with target"],
        ["found", "if equal, return mid"],
        ["update", "if smaller, low = mid + 1"],
        ["update", "otherwise, high = mid - 1"],
        ["done", "return -1"]
      ]
    },
    {
      id: "jump-search", slug: "JumpSearch", name: "Jump Search", englishName: "Jump Search",
      category: "search", difficulty: "Intermedio", summary: "Salta bloques y después revisa un tramo corto.",
      description: "Avanza en bloques de tamaño √n sobre datos ordenados y realiza una búsqueda lineal dentro del bloque candidato.",
      invariant: "Los bloques anteriores ya contienen únicamente valores menores que el objetivo.",
      time: "O(√n)", timeDetail: "Mejor O(1) · promedio/peor O(√n)", space: "O(1)",
      presets: commonPresets.ordered,
      pseudo: [
        ["setup", "function jumpSearch(values, target)"],
        ["block", "step = floor(sqrt(length(values)))"],
        ["jump", "jump while the block end is smaller than target"],
        ["scan", "scan linearly inside the candidate block"],
        ["compare", "compare the current value with target"],
        ["found", "return the matching index"],
        ["done", "return -1"]
      ]
    },
    {
      id: "interpolation-search", slug: "InterpolationSearch", name: "Búsqueda por interpolación", englishName: "Interpolation Search",
      category: "search", difficulty: "Avanzado", summary: "Estima la posición por la distribución de los valores.",
      description: "Calcula una posición probable dentro de un arreglo ordenado y aproximadamente uniforme antes de reducir el intervalo.",
      invariant: "Si el objetivo existe, permanece dentro del intervalo cuyos extremos todavía lo acotan.",
      time: "O(log log n)", timeDetail: "Promedio O(log log n) con distribución uniforme · peor O(n)", space: "O(1)",
      presets: commonPresets.ordered,
      pseudo: [
        ["setup", "function interpolationSearch(values, target)"],
        ["loop", "while target remains between values[low] and values[high]"],
        ["estimate", "estimate position from the value distribution"],
        ["compare", "compare values[position] with target"],
        ["found", "if equal, return position"],
        ["update", "move low or high around the estimated position"],
        ["done", "return -1"]
      ]
    },
    {
      id: "bubble-sort", slug: "BubbleSort", name: "Bubble Sort", englishName: "Bubble Sort",
      category: "sorting", difficulty: "Inicial", summary: "Intercambia pares adyacentes fuera de orden.",
      description: "Cada pasada empuja el mayor valor pendiente hacia el extremo derecho.",
      invariant: "El sufijo marcado queda ordenado después de cada pasada.",
      time: "O(n²)", timeDetail: "Mejor O(n) · promedio/peor O(n²)", space: "O(1)",
      presets: commonPresets.sort,
      pseudo: [
        ["setup", "function bubbleSort(values)"],
        ["loop", "for end from length(values) - 1 down to 1"],
        ["loop", "for index from 0 to end - 1"],
        ["compare", "compare values[index] and values[index + 1]"],
        ["swap", "if left is greater, swap both values"],
        ["mark", "mark end as sorted"],
        ["done", "return values"]
      ]
    },
    {
      id: "insertion-sort", slug: "InsertionSort", name: "Insertion Sort", englishName: "Insertion Sort",
      category: "sorting", difficulty: "Inicial", summary: "Inserta cada valor dentro del prefijo ordenado.",
      description: "Reserva una clave, desplaza valores mayores y la coloca en su posición estable.",
      invariant: "El prefijo anterior al cursor siempre permanece ordenado.",
      time: "O(n²)", timeDetail: "Mejor O(n) · promedio/peor O(n²)", space: "O(1)",
      presets: commonPresets.sort,
      pseudo: [
        ["setup", "function insertionSort(values)"],
        ["loop", "for index from 1 to length(values) - 1"],
        ["select", "key = values[index]; position = index - 1"],
        ["compare", "while position >= 0 and values[position] > key"],
        ["shift", "shift values[position] one place right"],
        ["insert", "place key at position + 1"],
        ["done", "return values"]
      ]
    },
    {
      id: "selection-sort", slug: "SelectionSort", name: "Selection Sort", englishName: "Selection Sort",
      category: "sorting", difficulty: "Inicial", summary: "Selecciona el mínimo restante para cada posición.",
      description: "Busca el menor valor del sufijo pendiente y lo coloca al final del prefijo ya ordenado.",
      invariant: "El prefijo contiene los valores mínimos en su posición definitiva.",
      time: "O(n²)", timeDetail: "Mejor/promedio/peor O(n²)", space: "O(1)",
      presets: commonPresets.sort,
      pseudo: [
        ["setup", "function selectionSort(values)"],
        ["loop", "for each position in the array"],
        ["select", "assume the current position contains the minimum"],
        ["compare", "scan the remaining suffix for a smaller value"],
        ["minimum", "remember the index of each new minimum"],
        ["swap", "swap the minimum into the current position"],
        ["done", "return values"]
      ]
    },
    {
      id: "merge-sort", slug: "MergeSort", name: "Merge Sort", englishName: "Merge Sort",
      category: "sorting", difficulty: "Intermedio", summary: "Divide, ordena y combina mitades.",
      description: "Descompone la entrada hasta unidades y reconstruye el resultado con mezclas ordenadas.",
      invariant: "Cada segmento que regresa de merge está completamente ordenado.",
      time: "O(n log n)", timeDetail: "Mejor/promedio/peor O(n log n)", space: "O(n)",
      presets: commonPresets.sort,
      pseudo: [
        ["setup", "function mergeSort(values, left, right)"],
        ["base", "if left >= right, return"],
        ["split", "mid = floor((left + right) / 2)"],
        ["recurse", "mergeSort(values, left, mid)"],
        ["recurse", "mergeSort(values, mid + 1, right)"],
        ["merge", "merge both ordered halves into auxiliary storage"],
        ["copy", "copy the merged range back into values"],
        ["done", "return values"]
      ]
    },
    {
      id: "quick-sort", slug: "QuickSort", name: "Quick Sort", englishName: "Quick Sort",
      category: "sorting", difficulty: "Intermedio", summary: "Particiona alrededor de un pivote.",
      description: "Coloca menores y mayores a cada lado del pivote y repite en ambos subarreglos.",
      invariant: "Tras particionar, el pivote queda en su posición final.",
      time: "O(n log n)", timeDetail: "Mejor/promedio O(n log n) · peor O(n²)", space: "O(log n)",
      presets: commonPresets.sort,
      pseudo: [
        ["setup", "function quickSort(values, low, high)"],
        ["base", "if low >= high, return"],
        ["pivot", "choose values[high] as pivot"],
        ["loop", "scan from low to high - 1"],
        ["compare", "compare the current value with pivot"],
        ["swap", "move smaller values to the left partition"],
        ["partition", "place pivot between both partitions"],
        ["recurse", "sort left and right partitions"],
        ["done", "return values"]
      ]
    },
    {
      id: "heap-sort", slug: "HeapSort", name: "Heap Sort", englishName: "Heap Sort",
      category: "sorting", difficulty: "Avanzado", summary: "Ordena mediante un montículo máximo.",
      description: "Construye un max-heap, mueve la raíz al final y restaura la propiedad del montículo en el prefijo restante.",
      invariant: "El sufijo extraído está ordenado y el prefijo conserva la propiedad de max-heap.",
      time: "O(n log n)", timeDetail: "Mejor/promedio/peor O(n log n)", space: "O(1)",
      presets: commonPresets.sort,
      pseudo: [
        ["setup", "function heapSort(values)"],
        ["build", "build a max heap from the input"],
        ["compare", "compare parent with its children"],
        ["heapify", "swap with the largest child and continue downward"],
        ["extract", "swap the root with the end of the active heap"],
        ["mark", "mark the extracted maximum as sorted"],
        ["done", "return values"]
      ]
    },
    {
      id: "bfs", slug: "BreadthFirstSearch", name: "Breadth-First Search", englishName: "BFS",
      category: "graphs", difficulty: "Intermedio", summary: "Explora un grafo por niveles con una cola.",
      description: "Visita primero todos los vecinos cercanos antes de avanzar al siguiente nivel.",
      invariant: "La cola contiene la frontera en orden de distancia no decreciente.",
      time: "O(V + E)", timeDetail: "Con lista de adyacencia O(V + E)", space: "O(V)",
      presets: commonPresets.graph,
      pseudo: [
        ["setup", "function breadthFirstSearch(graph, start)"],
        ["enqueue", "enqueue start and mark it visited"],
        ["loop", "while the queue is not empty"],
        ["visit", "current = dequeue front"],
        ["inspect", "for each neighbor of current"],
        ["discover", "if unseen, mark visited and enqueue neighbor"],
        ["done", "return visit order"]
      ]
    },
    {
      id: "dfs", slug: "DepthFirstSearch", name: "Depth-First Search", englishName: "DFS",
      category: "graphs", difficulty: "Intermedio", summary: "Profundiza una rama antes de retroceder.",
      description: "Usa una pila explícita para recorrer cada rama hasta que no quedan vecinos nuevos.",
      invariant: "La pila representa la ruta pendiente de exploración.",
      time: "O(V + E)", timeDetail: "Con lista de adyacencia O(V + E)", space: "O(V)",
      presets: commonPresets.graph,
      pseudo: [
        ["setup", "function depthFirstSearch(graph, start)"],
        ["push", "push start on the stack"],
        ["loop", "while the stack is not empty"],
        ["visit", "current = pop top"],
        ["skip", "skip current if it was already visited"],
        ["inspect", "inspect each neighbor of current"],
        ["discover", "mark current and push its unseen neighbors"],
        ["done", "return visit order"]
      ]
    },
    {
      id: "dijkstra", slug: "Dijkstra", name: "Dijkstra", englishName: "Dijkstra",
      category: "graphs", difficulty: "Avanzado", summary: "Encuentra rutas mínimas con pesos no negativos.",
      description: "Extrae el nodo tentativo más cercano y relaja las distancias de sus aristas.",
      invariant: "La distancia de cada nodo extraído es definitiva con pesos no negativos.",
      time: "O((V+E) log V)", timeDetail: "Con lista de adyacencia y heap binario", space: "O(V)",
      presets: [
        { id: "weighted", label: "Grafo ponderado" },
        { id: "alternate", label: "Ruta alternativa" }
      ],
      pseudo: [
        ["setup", "function dijkstra(graph, source)"],
        ["distance", "set source distance to 0; every other distance to infinity"],
        ["queue", "insert source into the priority queue"],
        ["extract", "extract the node with minimum tentative distance"],
        ["inspect", "inspect each outgoing weighted edge"],
        ["relax", "if the new route is shorter, update distance and predecessor"],
        ["done", "return distances and predecessors"]
      ]
    },
    {
      id: "topological-sort", slug: "TopologicalSort", name: "Ordenamiento topológico", englishName: "Topological Sort",
      category: "graphs", difficulty: "Intermedio", summary: "Ordena un DAG respetando sus dependencias.",
      description: "Procesa primero los vértices sin dependencias pendientes y reduce el grado de entrada de sus sucesores.",
      invariant: "Cada nodo emitido aparece después de todos sus predecesores ya resueltos.",
      time: "O(V + E)", timeDetail: "Con lista de adyacencia O(V + E)", space: "O(V)",
      parameters: "graph",
      presets: commonPresets.graph,
      pseudo: [
        ["setup", "function topologicalSort(graph)"],
        ["degree", "compute the incoming degree of every vertex"],
        ["queue", "enqueue every vertex with incoming degree zero"],
        ["extract", "remove one ready vertex and append it to the order"],
        ["update", "decrease the incoming degree of each successor"],
        ["enqueue", "enqueue successors that become ready"],
        ["done", "return the order or report a cycle"]
      ]
    },
    {
      id: "kahn", slug: "KahnsAlgorithm", name: "Algoritmo de Kahn", englishName: "Kahn's Algorithm",
      category: "graphs", difficulty: "Intermedio", summary: "Ordena dependencias usando grados de entrada y una cola.",
      description: "Emite los vértices con grado de entrada cero, libera sus sucesores y detecta un ciclo si quedan nodos bloqueados.",
      invariant: "La cola contiene exactamente los vértices no emitidos cuyo grado de entrada es cero.",
      time: "O(V + E)", timeDetail: "Calcula cada grado una vez y procesa cada arista una vez", space: "O(V)",
      parameters: "graph",
      presets: [
        { id: "empty", label: "Grafo vacío" },
        { id: "single", label: "Un vértice aislado" },
        { id: "isolated", label: "Vértices aislados" },
        { id: "chain", label: "Cadena lineal" },
        { id: "branching", label: "Varias ramas" },
        { id: "disconnected", label: "Componentes desconectados" },
        { id: "self-loop", label: "Auto ciclo" },
        { id: "duplicate-edge", label: "Arista duplicada" },
        { id: "dependencies", label: "DAG · varias fuentes" },
        { id: "cycle", label: "Dependencias con ciclo" }
      ],
      pseudo: [
        ["setup", "function kahn(graph)"],
        ["degree", "compute the incoming degree of every vertex"],
        ["queue", "enqueue every vertex with incoming degree zero"],
        ["extract", "remove one ready vertex from the queue"],
        ["emit", "append the ready vertex to the topological order"],
        ["update", "decrease the incoming degree of each successor"],
        ["enqueue", "enqueue successors that become ready"],
        ["cycle", "if fewer than V vertices were emitted, report a cycle"],
        ["done", "return the complete topological order"]
      ]
    },
    {
      id: "bellman-ford", slug: "BellmanFord", name: "Bellman-Ford", englishName: "Bellman-Ford",
      category: "graphs", difficulty: "Avanzado", summary: "Relaja todas las aristas y admite pesos negativos.",
      description: "Repite la relajación de cada arista hasta V−1 veces y ejecuta una pasada final para detectar ciclos negativos.",
      invariant: "Tras la pasada k, cada distancia cubre caminos de como máximo k aristas.",
      time: "O(VE)", timeDetail: "Mejor O(E) con parada temprana · promedio/peor O(VE)", space: "O(V)",
      parameters: "graph, source",
      presets: [
        { id: "weighted", label: "Grafo ponderado" },
        { id: "alternate", label: "Ruta alternativa" }
      ],
      pseudo: [
        ["setup", "function bellmanFord(graph, source)"],
        ["distance", "set source distance to 0; every other distance to infinity"],
        ["loop", "repeat V - 1 relaxation passes"],
        ["inspect", "inspect every directed edge"],
        ["relax", "update the destination when the route is shorter"],
        ["early", "stop when a complete pass makes no change"],
        ["cycle", "run one final pass to detect a negative cycle"],
        ["done", "return distances and predecessors"]
      ]
    },
    {
      id: "hanoi", slug: "TowersOfHanoi", name: "Torres de Hanoi", englishName: "Towers of Hanoi",
      category: "recursion", difficulty: "Intermedio", summary: "Mueve discos con una recurrencia exponencial.",
      description: "Traslada una torre usando un poste auxiliar sin colocar un disco grande sobre uno menor.",
      invariant: "Cada poste conserva los discos ordenados de mayor a menor.",
      time: "O(2ⁿ)", timeDetail: "Exactamente 2ⁿ - 1 movimientos", space: "O(n)",
      presets: [
        { id: "three", label: "3 discos · 7 movimientos" },
        { id: "four", label: "4 discos · 15 movimientos" }
      ],
      pseudo: [
        ["setup", "function hanoi(disks, source, auxiliary, target)"],
        ["base", "if disks equals 1, move source to target"],
        ["recurse", "move disks - 1 from source to auxiliary"],
        ["move", "move the largest remaining disk to target"],
        ["recurse", "move disks - 1 from auxiliary to target"],
        ["done", "all disks are now on target"]
      ]
    },
    {
      id: "n-queens", slug: "NQueens", name: "N-Reinas", englishName: "N-Queens",
      category: "recursion", difficulty: "Avanzado", summary: "Explora posiciones válidas con backtracking.",
      description: "Coloca una reina por fila y deshace decisiones que bloquean las filas restantes.",
      invariant: "Las reinas colocadas no comparten columna ni diagonal.",
      time: "O(n!)", timeDetail: "Cota pedagógica del árbol de búsqueda", space: "O(n)",
      presets: [
        { id: "four", label: "Tablero 4 × 4" },
        { id: "five", label: "Tablero 5 × 5" }
      ],
      pseudo: [
        ["setup", "function solve(row, board)"],
        ["base", "if row equals size, return true"],
        ["loop", "for each column in the current row"],
        ["check", "check column and both diagonals"],
        ["place", "place a queen when the cell is safe"],
        ["recurse", "solve the next row"],
        ["backtrack", "remove the queen if that branch fails"],
        ["done", "return whether a solution was found"]
      ]
    },
    {
      id: "knapsack", slug: "Knapsack01", name: "Mochila 0/1", englishName: "0/1 Knapsack",
      category: "dynamic", difficulty: "Avanzado", summary: "Construye una tabla de valor por capacidad.",
      description: "Compara excluir o incluir cada objeto sin superar la capacidad disponible.",
      invariant: "Cada celda contiene el mejor valor usando solo los objetos ya procesados.",
      time: "O(nW)", timeDetail: "n objetos por W capacidades", space: "O(nW)",
      presets: [
        { id: "small", label: "3 objetos · capacidad 5" },
        { id: "balanced", label: "4 objetos · capacidad 7" }
      ],
      pseudo: [
        ["setup", "function knapsack(items, capacity)"],
        ["table", "create a table with n + 1 rows and capacity + 1 columns"],
        ["loop", "for each item and each capacity"],
        ["exclude", "start with the value obtained by excluding the item"],
        ["include", "if it fits, compare with including its value"],
        ["write", "store the larger result in the current cell"],
        ["done", "return table[n][capacity]"]
      ]
    },
    {
      id: "fibonacci-dp", slug: "FibonacciTabulation", name: "Fibonacci por tabulación", englishName: "Fibonacci Tabulation",
      category: "dynamic", difficulty: "Inicial", summary: "Construye la secuencia desde sus dos casos base.",
      description: "Calcula cada término una sola vez usando los dos resultados anteriores y evita el árbol recursivo exponencial.",
      invariant: "Antes de calcular i, todos los términos desde 0 hasta i−1 son definitivos.",
      time: "O(n)", timeDetail: "Un cálculo por término · mejor/promedio/peor O(n)", space: "O(n)",
      parameters: "n",
      presets: [
        { id: "six", label: "F(6)" },
        { id: "eight", label: "F(8)" }
      ],
      pseudo: [
        ["setup", "function fibonacciTabulation(n)"],
        ["base", "store F(0) = 0 and F(1) = 1"],
        ["loop", "for index from 2 through n"],
        ["combine", "F(index) = F(index - 1) + F(index - 2)"],
        ["write", "store the new term"],
        ["done", "return F(n)"]
      ]
    },
    {
      id: "lis", slug: "LongestIncreasingSubsequence", name: "Subsecuencia creciente más larga", englishName: "Longest Increasing Subsequence",
      category: "dynamic", difficulty: "Avanzado", summary: "Extiende la mejor subsecuencia que termina en cada posición.",
      description: "Compara cada valor con sus predecesores y conserva la mayor longitud creciente que puede terminar ahí.",
      invariant: "dp[i] representa la mejor subsecuencia creciente cuyo último elemento es values[i].",
      time: "O(n²)", timeDetail: "Versión pedagógica con dos recorridos anidados O(n²)", space: "O(n)",
      parameters: "values",
      presets: [
        { id: "mixed", label: "Secuencia mezclada" },
        { id: "rising", label: "Casi creciente" }
      ],
      pseudo: [
        ["setup", "function longestIncreasingSubsequence(values)"],
        ["table", "initialize every dp position with length 1"],
        ["loop", "for each current index"],
        ["compare", "compare current value with every predecessor"],
        ["extend", "extend a smaller predecessor when it improves dp[current]"],
        ["best", "update the best length found"],
        ["done", "return the best length"]
      ]
    }
  ];

  const complexityScenarios = Object.freeze({
    "linear-search": { time: { best: "O(1)", average: "O(n)", worst: "O(n)" } },
    "binary-search": { time: { best: "O(1)", average: "O(log n)", worst: "O(log n)" } },
    "jump-search": { time: { best: "O(1)", average: "O(√n)", worst: "O(√n)" } },
    "interpolation-search": { time: { best: "O(1)", average: "O(log log n)", worst: "O(n)" } },
    "bubble-sort": { time: { best: "O(n)", average: "O(n²)", worst: "O(n²)" } },
    "insertion-sort": { time: { best: "O(n)", average: "O(n²)", worst: "O(n²)" } },
    "selection-sort": { time: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" } },
    "merge-sort": { time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" } },
    "quick-sort": {
      time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
      space: { best: "O(log n)", average: "O(log n)", worst: "O(n)" }
    },
    "heap-sort": { time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" } },
    bfs: { time: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" } },
    dfs: { time: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" } },
    dijkstra: { time: { best: "O((V+E) log V)", average: "O((V+E) log V)", worst: "O((V+E) log V)" } },
    "topological-sort": { time: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" } },
    kahn: { time: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" } },
    "bellman-ford": { time: { best: "O(E)", average: "O(VE)", worst: "O(VE)" } },
    hanoi: { time: { best: "O(2ⁿ)", average: "O(2ⁿ)", worst: "O(2ⁿ)" } },
    "n-queens": { time: { best: "O(n²)", average: "O(n!)", worst: "O(n!)" } },
    knapsack: { time: { best: "O(nW)", average: "O(nW)", worst: "O(nW)" } },
    "fibonacci-dp": { time: { best: "O(n)", average: "O(n)", worst: "O(n)" } },
    lis: { time: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" } }
  });

  function parameterList(algorithm, language) {
    const graph = algorithm.category === "graphs";
    const sort = algorithm.category === "sorting";
    const search = algorithm.category === "search";
    const args = algorithm.parameters || (graph ? "graph, start" : sort ? "values" : search ? "values, target" : algorithm.id === "hanoi" ? "disks, source, auxiliary, target" : algorithm.id === "n-queens" ? "row, board" : "items, capacity");
    if (language.id === "typescript") return args.replace("values", "values: number[]").replace("target", "target: number").replace(/^n$/, "n: number");
    if (language.id === "csharp") return args.replace("values", "int[] values").replace("target", "int target").replace(/^n$/, "int n");
    if (language.id === "java") return args.replace("values", "int[] values").replace("target", "int target").replace(/^n$/, "int n");
    if (language.id === "rust") return args.replace("values", "values: &mut [i32]").replace("target", "target: i32").replace(/^n$/, "n: usize");
    if (language.id === "c") return args.replace("values", "int values[]").replace("target", "int target").replace(/^n$/, "int n");
    if (language.id === "cpp") return args.replace("values", "vector<int>& values").replace("target", "int target").replace(/^n$/, "int n");
    return args;
  }

  function functionName(algorithm, language) {
    if (["csharp", "java"].includes(language.id)) return algorithm.slug;
    return algorithm.slug.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
  }

  function buildReference(algorithmId, languageId) {
    const algorithm = algorithms.find((item) => item.id === algorithmId) || algorithms[1];
    const language = languages.find((item) => item.id === languageId) || languages[0];
    const name = functionName(algorithm, language);
    const args = parameterList(algorithm, language);
    const lineMap = {};
    const lines = [];

    const push = (text, key) => {
      lines.push(text);
      if (key && !lineMap[key]) lineMap[key] = lines.length;
    };

    if (language.family === "python") {
      push(`# Python · ${algorithm.englishName}`);
      push(`# Pseudocódigo envuelto en sintaxis Python; no es una implementación ejecutable.`);
      push(`def ${name}(${args}):`, "setup");
      algorithm.pseudo.slice(1).forEach(([key, text]) => push(`    # ${text}`, key));
      push(`    raise NotImplementedError("Conectar al analizador en una fase posterior")`, "done");
    } else if (language.family === "ruby") {
      push(`# Ruby · ${algorithm.englishName}`);
      push(`# Pseudocódigo envuelto en sintaxis Ruby; no es una implementación ejecutable.`);
      push(`def ${name}(${args})`, "setup");
      algorithm.pseudo.slice(1).forEach(([key, text]) => push(`  # ${text}`, key));
      push(`  raise NotImplementedError, "Conectar al analizador después"`, "done");
      push("end");
    } else {
      const signature = language.id === "javascript" || language.id === "node"
        ? `function ${name}(${args})`
        : language.id === "typescript"
          ? `function ${name}(${args}): unknown`
          : language.id === "rust"
            ? `fn ${name}(${args})`
            : language.id === "csharp"
              ? `static object? ${name}(${args})`
              : language.id === "java"
                ? `static Object ${name}(${args})`
                : language.id === "c"
                  ? `void* ${name}(${args}, int length)`
                  : `auto ${name}(${args})`;
      push(`// ${language.label} · ${algorithm.englishName}`);
      push(`// Pseudocódigo envuelto en sintaxis ${language.label}; no es una implementación ejecutable.`);
      push(`${signature} {`, "setup");
      algorithm.pseudo.slice(1).forEach(([key, text]) => push(`  // ${text}`, key));
      if (language.id === "rust") push(`  unimplemented!("Conectar al analizador en una fase posterior");`, "done");
      else if (["javascript", "node", "typescript"].includes(language.id)) push(`  throw new Error("Conectar al analizador en una fase posterior");`, "done");
      else push("  return default;", "done");
      push("}");
    }

    return {
      code: lines.join("\n"),
      lineMap,
      fileName: `${algorithm.slug}.${language.extension}`,
      monacoLanguage: language.monaco
    };
  }

  window.AlgorithmCatalog = Object.freeze({ categories, languages, algorithms, complexityScenarios, buildReference });
})();
