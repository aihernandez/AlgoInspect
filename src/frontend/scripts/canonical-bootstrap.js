(() => {
  "use strict";

  const client = window.AlgoInspectCatalogClient;
  const status = document.querySelector("#catalogBootstrapStatus");
  const errorPanel = document.querySelector("#catalogBootstrapError");
  const errorTitle = document.querySelector("#catalogBootstrapErrorTitle");
  const errorDetail = document.querySelector("#catalogBootstrapErrorDetail");
  const retryButton = document.querySelector("#catalogBootstrapRetry");
  const themeToggle = document.querySelector("#themeToggle");

  function readStoredTheme() {
    try {
      return localStorage.getItem("algoinspect-theme") === "light" ? "light" : "dark";
    } catch {
      return document.documentElement.dataset.theme === "light" ? "light" : "dark";
    }
  }

  function setTheme(theme, { persist = true } = {}) {
    const nextTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    themeToggle?.setAttribute("aria-pressed", String(nextTheme === "light"));
    themeToggle?.setAttribute("aria-label", nextTheme === "light" ? "Activar modo oscuro" : "Activar modo claro");
    themeToggle?.setAttribute("title", nextTheme === "light" ? "Activar modo oscuro" : "Activar modo claro");
    if (persist) {
      try { localStorage.setItem("algoinspect-theme", nextTheme); } catch { /* El modo sigue activo durante esta sesiÃ³n. */ }
    }
    document.dispatchEvent(new CustomEvent("algoinspect:themechange", { detail: { theme: nextTheme } }));
  }

  window.AlgoInspectTheme = Object.freeze({
    get current() { return document.documentElement.dataset.theme || "dark"; },
    set: setTheme
  });
  // La lectura se repite aquí porque algunos navegadores todavía no exponen
  // localStorage durante el script preventivo del <head>.
  setTheme(readStoredTheme(), { persist: false });
  themeToggle?.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light"));

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadScript(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = path;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`No se pudo cargar ${path}.`));
      document.body.append(script);
    });
  }

  function displayError(error) {
    const messages = {
      "algorithm-not-found": ["Algoritmo no publicado", "El catálogo respondió, pero una vertical canónica declarada no está disponible."],
      "language-not-supported": ["Cobertura incompleta", "Una implementación declarada no está disponible."],
      "schema-version-incompatible": ["Contrato incompatible", "Actualiza la aplicación para leer esta versión del catálogo."],
      "catalog-inconsistent": ["Catálogo temporalmente inválido", "El servidor rechazó contenido inconsistente para no mostrar datos parciales."],
      "network-error": ["No se pudo cargar el catálogo", "Comprueba la conexión con la API e intenta nuevamente."]
    };
    const [title, detail] = messages[error.code] || ["No se pudo preparar el catálogo", error.message || "Ocurrió un error de carga."];
    status.hidden = true;
    errorTitle.textContent = title;
    errorDetail.textContent = detail;
    retryButton.hidden = error.retryable === false;
    errorPanel.hidden = false;
    errorPanel.focus();
  }

  function assertCanonicalConsistency(catalog, detail, scenarios, implementations) {
    const versions = new Set([
      catalog.contentVersion,
      detail.contentVersion,
      scenarios.contentVersion,
      ...implementations.map((implementation) => implementation.contentVersion)
    ]);
    if (versions.size !== 1 || scenarios.algorithmId !== detail.algorithm.id) {
      throw new client.CatalogClientError("Las respuestas no pertenecen a la misma versión de contenido.", {
        code: "schema-version-incompatible",
        status: 409,
        retryable: false
      });
    }
  }

  function deriveLineMap(source, algorithmId) {
    const lines = source.split(/\r?\n/);
    const first = (pattern) => Math.max(1, lines.findIndex((line) => pattern.test(line)) + 1);
    const last = (pattern) => {
      const index = lines.findLastIndex((line) => pattern.test(line));
      return Math.max(1, index + 1);
    };
    if (algorithmId === "binary-search") return {
      setup: first(/Find\(|function\s+binarySearch|def\s+binary_search/),
      inspect: first(/middle\s*=|int middle|const middle/),
      compare: first(/candidate\s*==|candidate\s*===/),
      found: first(/return middle/),
      update: first(/low\s*=\s*middle|high\s*=\s*middle/),
      done: last(/return\s+-1/)
    };
    if (algorithmId === "bubble-sort") return {
      setup: first(/Execute\(|function\s+bubbleSort|def\s+bubble_sort/),
      outer: first(/for \(int end|for \(let end|for end in range/),
      compare: first(/values\[index\]\s*<=/),
      swap: first(/\(values\[index\]|\[values\[index\]|values\[index\], values\[index \+ 1\]/),
      early: first(/terminatedEarly\s*=\s*true|terminated_early\s*=\s*True/),
      done: last(/return\s+/)
    };
    return {
      setup: first(/Execute\(|function\s+kahn|def\s+kahn/),
      degree: first(/indegree\s*=|indegree\s*=\s*new|var\s+indegree/),
      queue: first(/new Queue|const queue|pending\s*=\s*deque/),
      extract: first(/Dequeue\(|\.shift\(|popleft\(/),
      emit: first(/order\.(Add|push|append)/),
      update: first(/indegree\[successor\]--|remainingDependencies|indegree\[successor\]\s*-=\s*1/),
      enqueue: first(/queue\.(Enqueue|push)|pending\.append/),
      cycle: first(/blocked\s*=|const blocked|var blocked/),
      done: last(/return\s+/)
    };
  }

  function createLayout(scenario) {
    const validVertices = new Set(scenario.vertices);
    const count = scenario.vertices.length;
    const radiusX = count <= 2 ? 150 : 215;
    const radiusY = count <= 2 ? 0 : 76;
    const nodes = scenario.vertices.map((id, index) => {
      if (count === 1) return { id, x: 295, y: 100 };
      const angle = -Math.PI + (2 * Math.PI * index) / Math.max(1, count);
      return { id, x: 295 + radiusX * Math.cos(angle), y: 100 + radiusY * Math.sin(angle) };
    });
    const edges = scenario.edges
      .filter(([source, target]) => validVertices.has(source) && validVertices.has(target))
      .map(([source, target]) => ({ source, target, weight: 1 }));
    return { nodes, edges };
  }

  function recorder(initialState, initialVariables = {}) {
    const steps = [];
    const counters = { comparisons: 0, swaps: 0, writes: 0, visits: 0, calls: 0, moves: 0 };
    return {
      counters,
      add(title, message, phase, lineKey, state, variables = {}) {
        steps.push({
          title,
          message,
          phase,
          lineKey,
          state: clone(state ?? initialState),
          variables: clone({ ...initialVariables, ...variables }),
          counters: clone(counters)
        });
      },
      steps
    };
  }

  function createTraceLibrary(records) {
    const kahnRecord = records.find((record) => record.detail.algorithm.id === "kahn");
    const scenarios = kahnRecord?.scenarios || [];
    const scenariosByAlgorithm = new Map(records.map((record) => [record.detail.algorithm.id, record.scenarios]));
    const scenarioById = new Map(scenarios.map((scenario) => [scenario.id, scenario]));
    const graphLayouts = Object.fromEntries(
      scenarios.map((scenario) => [`kahn-${scenario.id}`, createLayout(scenario)]));

    function buildKahnTrace(scenarioId) {
      const scenario = scenarioById.get(scenarioId) || scenarios[0];
      const layoutKey = `kahn-${scenario.id}`;
      const nodes = [...scenario.vertices];
      const incoming = Object.fromEntries(nodes.map((node) => [node, 0]));
      const outgoing = Object.fromEntries(nodes.map((node) => [node, []]));
      const invalidEdge = scenario.edges.find(([source, target]) => !(source in incoming) || !(target in incoming));
      const state = {
        kind: "graph",
        layout: layoutKey,
        algorithm: "kahn",
        algorithmId: "kahn",
        scenarioId: scenario.id,
        contentVersion: window.AlgoInspectCanonical.contentVersion,
        current: null,
        visited: [],
        frontier: [],
        activeEdge: null,
        distances: {},
        indegrees: incoming,
        blocked: []
      };

      if (invalidEdge) {
        const trace = recorder(state);
        trace.add(
          "Entrada canónica inválida",
          `La arista ${invalidEdge[0]} → ${invalidEdge[1]} referencia un vértice no declarado.`,
          "Validación",
          "setup",
          state,
          { diagnóstico: scenario.expected.diagnostic, escenario: scenario.id });
        return trace.steps;
      }

      scenario.edges.forEach(([source, target]) => {
        incoming[target] += 1;
        outgoing[source].push(target);
      });
      const queue = nodes.filter((node) => incoming[node] === 0);
      const order = [];
      state.frontier = queue;
      const variables = () => ({
        actual: state.current || "—",
        cola: queue.join(" → ") || "vacía",
        orden: order.join(" → ") || "vacío",
        emitidos: `${order.length}/${nodes.length}`
      });
      const trace = recorder(state, variables());
      trace.add(
        "Calcular grados de entrada",
        nodes.length ? nodes.map((node) => `${node}:${incoming[node]}`).join(" · ") : "El grafo no contiene vértices.",
        "Preparación", "degree", state, variables());
      trace.add(
        "Preparar la cola",
        queue.length ? `Listos: ${queue.join(" y ")}.` : "No hay vértices con grado de entrada cero.",
        "Preparación", "queue", state, variables());

      while (queue.length) {
        const current = queue.shift();
        state.current = current;
        trace.add("Extraer un nodo listo", `${current} sale del frente de la cola.`, "Selección", "extract", state, variables());
        order.push(current);
        trace.counters.visits += 1;
        trace.add("Agregar al orden", `${current} queda emitido en la posición ${order.length}.`, "Emisión", "emit", state, variables());

        outgoing[current].forEach((target) => {
          state.activeEdge = [current, target];
          incoming[target] -= 1;
          trace.counters.comparisons += 1;
          trace.counters.writes += 1;
          trace.add("Eliminar una dependencia", `${current} → ${target} reduce el grado de ${target} a ${incoming[target]}.`, "Actualización", "update", state, variables());
          if (incoming[target] === 0) {
            queue.push(target);
            trace.add("Habilitar un sucesor", `${target} entra al final de la cola.`, "Descubrimiento", "enqueue", state, variables());
          }
        });
        state.activeEdge = null;
        state.current = null;
      }

      const blocked = nodes.filter((node) => !order.includes(node));
      state.blocked = blocked;
      if (blocked.length) {
        trace.add("Detectar un ciclo", `${blocked.join(" y ")} conservan dependencias pendientes.`, "Verificación", "cycle", state, variables());
        trace.add("No existe un orden topológico", `Kahn emitió ${order.length} de ${nodes.length} nodos.`, "Resultado", "cycle", state, variables());
      } else {
        trace.add("Confirmar que no hay ciclos", `Se emitieron los ${nodes.length} nodos.`, "Verificación", "cycle", state, variables());
        trace.add("Orden topológico completo", order.join(" → ") || "Orden vacío válido", "Resultado", "done", state, variables());
      }
      return trace.steps;
    }

    function buildBinarySearchTrace(scenarioId) {
      const binaryScenarios = scenariosByAlgorithm.get("binary-search") || [];
      const scenario = binaryScenarios.find((item) => item.id === scenarioId) || binaryScenarios[0];
      if (!scenario) return [];
      const state = {
        kind: "array", values: [...scenario.values], target: scenario.target,
        active: [], inactive: [], compare: [], found: -1, pointers: {}, ranges: []
      };
      let low = 0;
      let high = scenario.values.length - 1;
      const trace = recorder(state);
      const variables = () => ({ low, high, objetivo: scenario.target, resultado: state.found >= 0 ? state.found : "pendiente" });
      const refreshInterval = () => {
        state.active = scenario.values.map((_, index) => index).filter((index) => index >= low && index <= high);
        state.inactive = scenario.values.map((_, index) => index).filter((index) => index < low || index > high);
        state.ranges = low <= high ? [[low, high]] : [];
        state.pointers = { low, high };
      };
      refreshInterval();
      trace.add("Preparar el intervalo", scenario.values.length ? `Buscar ${scenario.target} entre los índices ${low} y ${high}.` : "El arreglo está vacío.", "Preparación", "setup", state, variables());

      while (low <= high) {
        const middle = low + Math.floor((high - low) / 2);
        const candidate = scenario.values[middle];
        state.compare = [middle];
        state.pointers = { low, middle, high };
        trace.counters.comparisons += 1;
        trace.add("Inspeccionar el punto medio", `Índice ${middle}: ${candidate}.`, "Comparación", "inspect", state, { ...variables(), middle, candidato: candidate });
        if (candidate === scenario.target) {
          state.found = middle;
          trace.add("Objetivo encontrado", `${scenario.target} está en el índice ${middle}.`, "Resultado", "found", state, { ...variables(), middle, candidato: candidate });
          return trace.steps;
        }
        if (candidate < scenario.target) {
          low = middle + 1;
          trace.add("Descartar la mitad inferior", `${candidate} es menor que ${scenario.target}; low avanza a ${low}.`, "Reducción", "update", state, variables());
        } else {
          high = middle - 1;
          trace.add("Descartar la mitad superior", `${candidate} es mayor que ${scenario.target}; high retrocede a ${high}.`, "Reducción", "update", state, variables());
        }
        state.compare = [];
        refreshInterval();
      }
      trace.add("Objetivo ausente", `El intervalo quedó vacío; ${scenario.target} no está en el arreglo.`, "Resultado", "done", state, { ...variables(), resultado: -1 });
      return trace.steps;
    }

    function buildBubbleSortTrace(scenarioId) {
      const bubbleScenarios = scenariosByAlgorithm.get("bubble-sort") || [];
      const scenario = bubbleScenarios.find((item) => item.id === scenarioId) || bubbleScenarios[0];
      if (!scenario) return [];
      const values = [...scenario.values];
      const state = { kind: "array", values, active: [], inactive: [], compare: [], sorted: [], pointers: {}, ranges: [] };
      const trace = recorder(state);
      let passes = 0;
      const variables = () => ({ pasada: passes, comparaciones: trace.counters.comparisons, intercambios: trace.counters.swaps });
      trace.add("Preparar el arreglo", values.length ? `${values.length} valores listos para ordenar.` : "La colección vacía ya está ordenada.", "Preparación", "setup", state, variables());

      for (let end = values.length - 1; end > 0; end -= 1) {
        let swapped = false;
        passes += 1;
        state.active = values.map((_, index) => index).filter((index) => index <= end);
        state.sorted = values.map((_, index) => index).filter((index) => index > end);
        state.ranges = [[0, end]];
        trace.add("Iniciar una pasada", `Pasada ${passes}; el límite activo es ${end}.`, "Pasada", "outer", state, variables());

        for (let index = 0; index < end; index += 1) {
          state.compare = [index, index + 1];
          state.pointers = { left: index, right: index + 1 };
          trace.counters.comparisons += 1;
          trace.add("Comparar vecinos", `Comparar ${values[index]} y ${values[index + 1]}.`, "Comparación", "compare", state, variables());
          if (values[index] <= values[index + 1]) continue;
          [values[index], values[index + 1]] = [values[index + 1], values[index]];
          swapped = true;
          trace.counters.swaps += 1;
          trace.counters.writes += 2;
          trace.add("Intercambiar la inversión", `El par queda como ${values[index]}, ${values[index + 1]}.`, "Intercambio", "swap", state, variables());
        }
        state.compare = [];
        state.pointers = {};
        state.sorted = values.map((_, index) => index).filter((index) => index >= end);
        if (!swapped) {
          state.sorted = values.map((_, index) => index);
          trace.add("Terminar anticipadamente", "La pasada no hizo intercambios; todo el arreglo está ordenado.", "Verificación", "early", state, variables());
          trace.add("Arreglo ordenado", values.join(" · ") || "Colección vacía", "Resultado", "done", state, variables());
          return trace.steps;
        }
      }
      state.sorted = values.map((_, index) => index);
      trace.add("Arreglo ordenado", values.join(" · ") || "Colección vacía", "Resultado", "done", state, variables());
      return trace.steps;
    }

    function buildTrace(algorithmId, scenarioId) {
      if (algorithmId === "kahn") return buildKahnTrace(scenarioId);
      if (algorithmId === "binary-search") return buildBinarySearchTrace(scenarioId);
      if (algorithmId === "bubble-sort") return buildBubbleSortTrace(scenarioId);
      return [];
    }

    return Object.freeze({ buildTrace, graphLayouts });
  }

  function createCatalogAdapter(catalogDocument, records) {
    const available = new Set(records.flatMap((record) => record.detail.algorithm.availableLanguages));
    const languages = catalogDocument.languages
      .filter((language) => available.has(language.id))
      .map((language) => ({
        id: language.id,
        label: language.displayName,
        monaco: language.id === "csharp" ? "csharp" : language.id,
        extension: language.fileExtension,
        family: language.id === "python" ? "python" : "brace"
      }));
    const implementationByKey = new Map(records.flatMap((record) =>
      record.implementations.map((item) => [`${record.detail.algorithm.id}:${item.language}`, item])));
    const detailsById = new Map(records.map((record) => [record.detail.algorithm.id, record.detail]));
    const descriptions = {
      kahn: {
        slug: "Kahn", parameters: "graph",
        time: "Cada vértice y cada arista se procesan una cantidad constante de veces.",
        space: "Incluye grados de entrada, lista de adyacencia, cola y resultado."
      },
      "binary-search": {
        slug: "Binary Search", parameters: "values, target",
        time: "Cada comparación descarta al menos la mitad del intervalo pendiente.",
        space: "La variante iterativa conserva únicamente límites, punto medio y candidato."
      },
      "bubble-sort": {
        slug: "Bubble Sort", parameters: "values",
        time: "La salida temprana es lineal; entradas generales requieren pasadas anidadas.",
        space: "Los intercambios ocurren sobre la colección de entrada con variables constantes."
      }
    };
    const algorithms = records.map(({ detail, scenarios }) => {
      const description = descriptions[detail.algorithm.id];
      return {
        id: detail.algorithm.id,
        contentVersion: detail.contentVersion,
        slug: description.slug,
        name: detail.algorithm.name,
        englishName: detail.algorithm.englishName,
        category: detail.algorithm.category,
        difficulty: detail.difficulty,
        summary: detail.algorithm.summary,
        description: detail.algorithm.summary,
        invariant: detail.invariant,
        time: detail.complexity.worst,
        timeDetail: description.time,
        space: detail.complexity.space,
        spaceDetail: description.space,
        parameters: description.parameters,
        presets: scenarios.map((scenario) => ({ id: scenario.id, label: scenario.description.es }))
      };
    });
    const complexityScenarios = Object.fromEntries(records.map(({ detail }) => [detail.algorithm.id, {
      time: { best: detail.complexity.best, average: detail.complexity.average, worst: detail.complexity.worst }
    }]));

    return Object.freeze({
      categories: [
        { id: "graphs", label: "Grafos", color: "#56b447" },
        { id: "search", label: "Búsqueda", color: "#79b8ff" },
        { id: "sorting", label: "Ordenamiento", color: "#e3a72f" }
      ],
      languages,
      algorithms,
      complexityScenarios,
      buildReference(algorithmId, languageId) {
        const implementation = implementationByKey.get(`${algorithmId}:${languageId}`);
        if (!implementation || !detailsById.has(algorithmId)) {
          throw new Error("La implementación solicitada no forma parte de la cobertura canónica.");
        }
        return {
          code: implementation.source,
          lineMap: deriveLineMap(implementation.source, algorithmId),
          fileName: implementation.fileName,
          monacoLanguage: languages.find((language) => language.id === languageId)?.monaco || "plaintext"
        };
      }
    });
  }

  async function bootstrap({ refresh = false } = {}) {
    status.hidden = false;
    errorPanel.hidden = true;
    try {
      const catalog = await client.getCatalog({ refresh });
      if (!catalog.algorithms.length) {
        throw new client.CatalogClientError("No hay algoritmos publicados.", { code: "algorithm-not-found", status: 404, retryable: false });
      }
      const records = await Promise.all(catalog.algorithms.map(async (summary) => {
        const [detail, scenarioDocument] = await Promise.all([
          client.getAlgorithm(summary.id, { refresh }),
          client.getScenarios(summary.id, { refresh })
        ]);
        const implementations = await Promise.all(detail.algorithm.availableLanguages.map(
          (language) => client.getImplementation(summary.id, language, { refresh })));
        assertCanonicalConsistency(catalog, detail, scenarioDocument, implementations);
        return { detail, scenarios: scenarioDocument.scenarios, implementations };
      }));
      const initial = records[0];

      window.AlgoInspectCanonical = Object.freeze({
        schemaVersion: initial.detail.schemaVersion,
        contentVersion: catalog.contentVersion,
        algorithmId: initial.detail.algorithm.id,
        scenarios: initial.scenarios,
        implementations: Object.freeze(initial.implementations),
        algorithms: Object.freeze(Object.fromEntries(records.map((record) => [record.detail.algorithm.id, Object.freeze({
          scenarios: record.scenarios,
          implementations: record.implementations
        })])))
      });
      window.AlgorithmCatalog = createCatalogAdapter(catalog, records);
      window.AlgorithmTraces = createTraceLibrary(records);
      window.AlgorithmReadmeContent = Object.freeze({ entries: Object.fromEntries(records.map(
        (record) => [record.detail.algorithm.id, { markdownPath: `api:${record.detail.algorithm.id}` }])) });
      window.TheoryContent = Object.freeze({ algorithms: [] });

      await loadScript("./scripts/visualizer.js");
      await loadScript("./scripts/workspace.js?v=20260811-tests-table");
      status.hidden = true;
      document.querySelector("#labWorkspace")?.setAttribute("aria-busy", "false");
      document.documentElement.dataset.catalogReady = "true";
    } catch (error) {
      displayError(error);
    }
  }

  retryButton.addEventListener("click", () => {
    client.clear();
    bootstrap({ refresh: true });
  });
  bootstrap();
})();
