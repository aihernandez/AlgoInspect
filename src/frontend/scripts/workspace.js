(() => {
  "use strict";

  const catalog = window.AlgorithmCatalog;
  const content = window.AlgorithmReadmeContent;
  if (!catalog || !content) return;

  const elements = {
    sourcePanel: document.querySelector("#sourcePanel"),
    documentSplit: document.querySelector("#documentSplit"),
    splitResizer: document.querySelector("#documentSplitResizer"),
    splitResizerBottom: document.querySelector("#documentSplitResizerBottom"),
    splitResizerVertical: document.querySelector("#documentSplitResizerVertical"),
    mergeButton: document.querySelector("#mergeDocumentsButton"),
    selectedName: document.querySelector("#selectedAlgorithmName"),
    sourceFileName: document.querySelector("#sourceFileName"),
    codeTabFileName: document.querySelector("#codeTabFileName"),
    tabList: document.querySelector("#editorTabList"),
    codeTab: document.querySelector("#codeTab"),
    readmeTab: document.querySelector("#readmeTab"),
    testsTab: document.querySelector("#testsTab"),
    tabMenu: document.querySelector("#tabActionsMenu"),
    tabMenuToggles: [...document.querySelectorAll("[data-tab-actions]")],
    codePanel: document.querySelector("#codeTabPanel"),
    readmePanel: document.querySelector("#readmeTabPanel"),
    testsPanel: document.querySelector("#testsTabPanel"),
    readme: document.querySelector("#algorithmReadme"),
    tests: document.querySelector("#algorithmTests"),
    languageSelect: document.querySelector("#languageSelect"),
    liveRegion: document.querySelector("#liveRegion")
  };

  if (Object.values(elements).some((element) => !element)) return;

  // Las tres pestañas son permanentes: retirar la acción de cierre del menú.
  elements.tabMenu.querySelector('[data-tab-command="close"]')?.remove();

  const algorithmByName = new Map(catalog.algorithms.map((algorithm) => [algorithm.name, algorithm]));
  const theoryById = new Map((window.TheoryContent?.algorithms || []).map((algorithm) => [algorithm.id, algorithm]));
  const categoryById = new Map(catalog.categories.map((category) => [category.id, category]));
  const originalTabOrder = Object.freeze(["code", "readme", "tests"]);
  let activeTab = "code";
  let renderedAlgorithmId = null;
  let splitActive = false;
  let splitCount = 2;
  let splitTop = "code";
  let splitRatio = 50;
  let tripleRatios = [50, 58, 42];
  let tabOrder = [...originalTabOrder];
  let closedTabs = new Set();
  let draggedTab = null;
  let tabMenuTarget = null;
  let splitPointer = null;
  let readmeRequestId = 0;
  let testsRequestId = 0;
  const markdownCache = new Map();

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safeUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : "#";
    } catch {
      return "#";
    }
  }

  function inlineMarkdown(value) {
    let text = escapeHtml(value);
    const codeSpans = [];
    text = text.replace(/`([^`]+)`/g, (_, code) => {
      codeSpans.push(`<code>${code}</code>`);
      return `\u0000${codeSpans.length - 1}\u0000`;
    });
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) => `<a href="${escapeHtml(safeUrl(url))}" target="_blank" rel="noreferrer noopener">${label}</a>`);
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return text.replace(/\u0000(\d+)\u0000/g, (_, index) => codeSpans[Number(index)]);
  }

  function markdownCodeBlock(language, source) {
    if (language.toLowerCase() === "mermaid") {
      return `<div class="readme-mermaid mermaid" role="img" aria-label="Diagrama del flujo del algoritmo">${escapeHtml(source)}</div>`;
    }
    return `<pre><code class="language-${escapeHtml(language || "text")}">${escapeHtml(source)}</code></pre>`;
  }

  function markdownToHtml(markdown) {
    const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
    const html = [];
    let paragraph = [];
    let listType = null;
    let inCode = false;
    let codeLanguage = "";
    let codeLines = [];
    const closeList = () => { if (listType) { html.push(`</${listType}>`); listType = null; } };
    const flushParagraph = () => { if (paragraph.length) { html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`); paragraph = []; } };
    const isTableSeparator = (line) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
    const tableCells = (line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (inCode) {
        if (/^\s*```/.test(line)) { html.push(markdownCodeBlock(codeLanguage, codeLines.join("\n"))); inCode = false; codeLines = []; codeLanguage = ""; }
        else codeLines.push(line);
        continue;
      }
      const fence = line.match(/^\s*```\s*([\w-]*)\s*$/);
      if (fence) { flushParagraph(); closeList(); inCode = true; codeLanguage = fence[1] || "text"; continue; }
      if (!line.trim()) { flushParagraph(); closeList(); continue; }
      const heading = line.match(/^\s*(#{1,3})\s+(.+?)\s*#*\s*$/);
      if (heading) { flushParagraph(); closeList(); const level = heading[1].length; html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`); continue; }
      if (line.trim().startsWith(">")) { flushParagraph(); closeList(); html.push(`<blockquote>${inlineMarkdown(line.replace(/^\s*>\s?/, ""))}</blockquote>`); continue; }
      if (index + 1 < lines.length && line.includes("|") && isTableSeparator(lines[index + 1])) {
        flushParagraph(); closeList(); const headers = tableCells(line); index += 1; const rows = [];
        while (index + 1 < lines.length && lines[index + 1].includes("|") && lines[index + 1].trim()) { index += 1; rows.push(tableCells(lines[index])); }
        html.push(`<table class="readme-markdown-table"><thead><tr>${headers.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((_, cellIndex) => `<td>${inlineMarkdown(row[cellIndex] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table>`); continue;
      }
      const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (unordered || ordered) { flushParagraph(); const nextType = ordered ? "ol" : "ul"; if (listType !== nextType) { closeList(); html.push(`<${nextType}>`); listType = nextType; } html.push(`<li>${inlineMarkdown((ordered || unordered)[1])}</li>`); continue; }
      closeList(); paragraph.push(line.trim());
    }
    if (inCode) html.push(markdownCodeBlock(codeLanguage || "text", codeLines.join("\n")));
    flushParagraph(); closeList();
    return html.join("\n");
  }

  async function renderMermaidDiagrams(container) {
    const diagrams = [...container.querySelectorAll(".readme-mermaid")];
    if (!diagrams.length) return;
    if (!window.mermaid) {
      diagrams.forEach((diagram) => {
        const source = diagram.textContent;
        const fallback = document.createElement("pre");
        const code = document.createElement("code");
        code.className = "language-mermaid";
        code.textContent = source;
        fallback.appendChild(code);
        diagram.replaceWith(fallback);
      });
      return;
    }
    try {
      window.mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "dark" });
      for (const [index, diagram] of diagrams.entries()) {
        const source = diagram.textContent.trim();
        const rendered = await window.mermaid.render(`readme-mermaid-${Date.now()}-${index}`, source);
        diagram.innerHTML = rendered.svg;
        if (typeof rendered.bindFunctions === "function") rendered.bindFunctions(diagram);
      }
    } catch (error) {
      diagrams.forEach((diagram) => {
        if (diagram.querySelector("svg")) return;
        diagram.classList.add("is-fallback");
        diagram.textContent = `No se pudo renderizar el diagrama Mermaid: ${error.message}`;
      });
    }
  }

  function loadMarkdown(path) {
    if (!markdownCache.has(path)) {
      markdownCache.set(path, fetch(path).then((response) => { if (!response.ok) throw new Error(`No se pudo cargar ${path}`); return response.text(); }));
    }
    return markdownCache.get(path);
  }

  const jsonCache = new Map();

  function loadJson(path) {
    if (!jsonCache.has(path)) {
      jsonCache.set(path, fetch(path).then((response) => { if (!response.ok) throw new Error(`No se pudo cargar ${path}`); return response.json(); }));
    }
    return jsonCache.get(path);
  }

  function testCall(algorithmId, language, scenario) {
    if (algorithmId === "binary-search") {
      const values = JSON.stringify(scenario.values);
      if (language === "csharp") return `BinarySearchAlgorithm.Find(${values}, ${scenario.target});`;
      if (language === "python") return `binary_search(${values}, ${scenario.target})`;
      return `binarySearch(${values}, ${scenario.target});`;
    }
    if (algorithmId === "bubble-sort") {
      const values = JSON.stringify(scenario.values);
      if (language === "csharp") return `BubbleSortAlgorithm.Execute(${values});`;
      if (language === "python") return `bubble_sort(${values})`;
      return `bubbleSort(${values});`;
    }
    const vertices = JSON.stringify(scenario.vertices);
    const edges = JSON.stringify(scenario.edges);
    if (language === "csharp") return `Kahn(new Graph(\n    vertices: ${vertices},\n    edges: ${edges}\n));`;
    if (language === "python") return `kahn({\n    "vertices": ${vertices},\n    "edges": ${edges}\n})`;
    if (language === "java") return `kahn(new Graph(\n    List.of(${scenario.vertices.map((vertex) => `"${vertex}"`).join(", ")}),\n    List.of(${scenario.edges.map(([source, target]) => `new Edge("${source}", "${target}")`).join(", ")})\n));`;
    if (language === "rust") return `kahn(Graph {\n    vertices: vec![${scenario.vertices.map((vertex) => `"${vertex}"`).join(", ")}],\n    edges: vec![${scenario.edges.map(([source, target]) => `("${source}", "${target}")`).join(", ")}]\n});`;
    return `kahn({\n  vertices: ${vertices},\n  edges: ${edges}\n});`;
  }

  function expectedSummary(algorithmId, scenario) {
    if (algorithmId === "binary-search") {
      return scenario.expected.index >= 0 ? `Índice ${scenario.expected.index}` : "Devuelve -1";
    }
    if (algorithmId === "bubble-sort") {
      const metrics = [
        scenario.expected.comparisons === undefined ? null : `${scenario.expected.comparisons} comparaciones`,
        scenario.expected.swaps === undefined ? null : `${scenario.expected.swaps} intercambios`,
        scenario.expected.terminatedEarly === true ? "salida temprana" : null
      ].filter(Boolean).join(" · ");
      return `${scenario.expected.values.join(" → ")}${metrics ? ` · ${metrics}` : ""}`;
    }
    return scenario.expected.status === "invalid"
      ? `Diagnóstico ${scenario.expected.diagnostic}`
      : scenario.expected.order
        ? scenario.expected.order.join(" → ")
        : scenario.expected.blocked?.length
          ? `Bloquea ${scenario.expected.blocked.join(" y ")}`
          : "Emite todos los vértices";
  }

  async function renderTests() {
    const requestId = ++testsRequestId;
    const algorithm = currentAlgorithm();
    if (!algorithm) {
      elements.tests.innerHTML = `<div class="readme-empty"><div><h2>Pruebas no disponibles</h2><p>Este tab se habilitará cuando el algoritmo tenga escenarios estructurados.</p></div></div>`;
      return;
    }
    elements.tests.innerHTML = `<p class="readme-loading">Cargando escenarios…</p>`;
    try {
      const canonical = await window.AlgoInspectCatalogClient.getScenarios(algorithm.id);
      const document = canonical.scenarios;
      const language = elements.languageSelect.value || "javascript";
      const selectedScenarioId = globalThis.document.querySelector("#presetSelect")?.value;
      const scenarioRows = document.map((scenario) => `<tr class="tests-scenario-row${scenario.id === selectedScenarioId ? " is-selected" : ""}" data-scenario-id="${escapeHtml(scenario.id)}" tabindex="0" role="button" aria-selected="${scenario.id === selectedScenarioId}" title="Seleccionar este escenario"><td><code>${escapeHtml(scenario.id)}</code></td><td><pre class="tests-parameters">${escapeHtml(testCall(algorithm.id, language, scenario))}</pre></td><td>${escapeHtml(scenario.expected.status)}</td><td>${escapeHtml(expectedSummary(algorithm.id, scenario))}</td></tr>`).join("");
      const apiImplementation = await window.AlgoInspectCatalogClient.getImplementation(algorithm.id, language);
      if (requestId !== testsRequestId || language !== elements.languageSelect.value) return;
      const testSource = apiImplementation.tests;
      const sourceLabel = `API · v${canonical.contentVersion}`;
      elements.tests.innerHTML = `
        <h2>Pruebas de ${escapeHtml(algorithm.name)}</h2>
        <p>La batería unitaria declara sus casos, entradas y expectativas directamente en el archivo de prueba del lenguaje seleccionado.</p>
        <p class="tests-purpose"><strong>¿Qué es este tab?</strong> Muestra una batería revisable y sus resultados esperados. La tabla presenta las entradas publicadas por el catálogo para reproducirlas en la visualización; no ejecuta código en el navegador.</p>
        <div class="tests-summary"><div><small>Escenarios</small><strong>${document.length}</strong></div><div><small>Lenguaje</small><strong>${escapeHtml(language)}</strong></div><div><small>Fuente</small><strong>${sourceLabel}</strong></div></div>
        <h3>Batería unitaria (${escapeHtml(language)})</h3>
        <pre class="test-code-block">${escapeHtml(testSource)}</pre>
        <p class="tests-note">El perfil <code>${escapeHtml(apiImplementation.validationProfile)}</code> ejecuta la batería mostrada mediante <code>npm run validate:algorithms</code>.</p>
        <h3>Suite de escenarios</h3>
        <table class="tests-table"><thead><tr><th>Escenario</th><th>Parámetros enviados</th><th>Estado esperado</th><th>Validación</th></tr></thead><tbody>${scenarioRows}</tbody></table>`;
    } catch (error) {
      if (requestId !== testsRequestId) return;
      elements.tests.innerHTML = `<div class="readme-error" role="alert"><p>No se pudieron cargar las pruebas: ${escapeHtml(error.message)}</p><button type="button" data-retry-tests>Reintentar</button></div>`;
    }
  }

  function syncScenarioSelection(scenarioId) {
    elements.tests.querySelectorAll("[data-scenario-id]").forEach((row) => {
      const selected = row.dataset.scenarioId === scenarioId;
      row.classList.toggle("is-selected", selected);
      row.setAttribute("aria-selected", String(selected));
    });
  }

  window.addEventListener("algoinspect:scenario-changed", (event) => {
    if (event.detail?.scenarioId) syncScenarioSelection(event.detail.scenarioId);
  });

  function listMarkup(items, ordered = false) {
    const tag = ordered ? "ol" : "ul";
    return `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
  }

  function currentAlgorithm() {
    return algorithmByName.get(elements.selectedName.textContent.trim()) || null;
  }

  function normalizedTheory(algorithm) {
    const entry = content.entries[algorithm.id];
    const extended = theoryById.get(algorithm.id);
    const history = extended?.history || entry.history;
    const references = (extended?.references || entry.references).map((reference) => ({
      label: reference.label,
      meta: reference.meta || [reference.organization, reference.year].filter(Boolean).join(" · "),
      url: reference.url,
      note: reference.note || ""
    }));

    return {
      principle: extended?.definition || entry.principle,
      requirements: extended?.requirements || entry.requirements,
      mechanics: extended?.mechanics || entry.mechanics,
      useWhen: extended?.useWhen || entry.useWhen,
      avoidWhen: extended?.avoidWhen || entry.avoidWhen,
      history,
      references,
      invariant: extended?.invariant?.statement || algorithm.invariant,
      complexity: extended?.complexity || null,
      detail: entry.problem ? {
        problem: entry.problem,
        family: entry.family,
        paradigm: entry.paradigm,
        inputs: entry.inputs,
        outputs: entry.outputs,
        assumptions: entry.assumptions,
        context: entry.context,
        visualization: entry.visualization,
        solution: entry.solution,
        pseudocode: entry.pseudocode,
        correctness: entry.correctness,
        edgeCases: entry.edgeCases,
        consequences: entry.consequences,
        alternatives: entry.alternatives,
        implementation: entry.implementation,
        tests: entry.tests,
        scenarioTests: entry.scenarioTests,
        scenarioTestsAll: entry.scenarioTestsAll || entry.scenarioTests,
        realApplications: entry.realApplications,
        commonErrors: entry.commonErrors
      } : null
    };
  }

  function complexityRows(algorithm, theory) {
    const scenarios = catalog.complexityScenarios[algorithm.id]?.time || {};
    const best = theory.complexity?.best?.value || scenarios.best || algorithm.time;
    const average = theory.complexity?.average?.value || scenarios.average || algorithm.time;
    const worst = theory.complexity?.worst?.value || scenarios.worst || algorithm.time;
    const space = theory.complexity?.space?.value || algorithm.space;

    return [
      ["Mejor", best, space, theory.complexity?.best?.why || "Entrada o decisiones especialmente favorables."],
      ["Promedio", average, space, theory.complexity?.average?.why || "Comportamiento esperado bajo los supuestos del algoritmo."],
      ["Peor", worst, space, theory.complexity?.worst?.why || "Entrada que obliga a realizar el máximo trabajo catalogado."]
    ];
  }

  function renderKahnDetail(detail) {
    if (!detail) return "";
    const assumptions = `<div class="readme-grid"><div><h4>Explícitos</h4>${listMarkup(detail.assumptions.explicit)}</div><div><h4>Implícitos</h4>${listMarkup(detail.assumptions.implicit)}</div></div>`;
    const edgeCases = `<div class="readme-complexity-wrap"><table class="readme-complexity"><thead><tr><th>Caso</th><th>Estado</th><th>Lectura</th></tr></thead><tbody>${detail.edgeCases.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(item.detail)}</td></tr>`).join("")}</tbody></table></div>`;
    const alternatives = `<div class="readme-complexity-wrap"><table class="readme-complexity"><thead><tr><th>Alternativa</th><th>Complejidad</th><th>Cuándo usarla</th></tr></thead><tbody>${detail.alternatives.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.complexity)}</td><td>${escapeHtml(item.detail)}</td></tr>`).join("")}</tbody></table></div>`;
    const errors = `<div class="readme-complexity-wrap"><table class="readme-complexity"><thead><tr><th>Error común</th><th>Presente</th><th>Evidencia</th></tr></thead><tbody>${detail.commonErrors.map((item) => `<tr><td>${escapeHtml(item.error)}</td><td>${escapeHtml(item.present)}</td><td>${escapeHtml(item.evidence)}</td></tr>`).join("")}</tbody></table></div>`;
    const scenarioTests = detail.scenarioTestsAll.map((test) => `<article class="readme-test-case"><h4>${escapeHtml(test.scenario)}</h4><dl><dt>Entrada</dt><dd>${escapeHtml(test.input)}</dd><dt>Resultado esperado</dt><dd>${escapeHtml(test.expected)}</dd><dt>Pasos observables</dt><dd>${escapeHtml(test.steps)}</dd><dt>Resultado en la interfaz</dt><dd>${escapeHtml(test.observed)}</dd><dt>Estado</dt><dd><strong>${escapeHtml(test.status)}</strong></dd></dl></article>`).join("");
    return `
      <section class="readme-section readme-section-rich" aria-labelledby="readmeProblem">
        <h3 id="readmeProblem">Problema</h3><p>${escapeHtml(detail.problem)}</p>
        <div class="readme-badges"><span>Familia: ${escapeHtml(detail.family)}</span><span>Paradigma: ${escapeHtml(detail.paradigm)}</span></div>
      </section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeInputs"><h3 id="readmeInputs">Entradas</h3>${listMarkup(detail.inputs)}</section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeOutputs"><h3 id="readmeOutputs">Salidas</h3>${listMarkup(detail.outputs)}</section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeAssumptions"><h3 id="readmeAssumptions">Assumptions</h3>${assumptions}</section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeContext"><h3 id="readmeContext">Contexto</h3>${listMarkup(detail.context)}</section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeVisualization"><h3 id="readmeVisualization">Visualización</h3>${listMarkup(detail.visualization)}</section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeSolution"><h3 id="readmeSolution">Solución</h3>${listMarkup(detail.solution, true)}<h4>Pseudocódigo</h4><pre class="readme-pseudocode"><code>${escapeHtml(detail.pseudocode)}</code></pre></section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeCorrectness"><h3 id="readmeCorrectness">Correctitud</h3>${listMarkup(detail.correctness)}</section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeConsequences"><h3 id="readmeConsequences">Consecuencias</h3><div class="readme-grid"><div><h4>Ventajas</h4>${listMarkup(detail.consequences.advantages)}</div><div><h4>Desventajas</h4>${listMarkup(detail.consequences.disadvantages)}</div></div><h4>Trade-offs</h4>${listMarkup(detail.consequences.tradeoffs)}</section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeAlternatives"><h3 id="readmeAlternatives">Alternativas</h3>${alternatives}</section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeImplementation"><h3 id="readmeImplementation">Implementación</h3>${listMarkup(detail.implementation)}</section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeTests"><h3 id="readmeTests">Pruebas</h3>${listMarkup(detail.tests)}</section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeScenarioTests"><h3 id="readmeScenarioTests">Pruebas del escenario ejecutable</h3><p>Estas pruebas corresponden exactamente a todos los presets que la interfaz puede ejecutar paso a paso.</p><div class="readme-test-cases">${scenarioTests}</div></section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeApplications"><h3 id="readmeApplications">Aplicaciones reales</h3>${listMarkup(detail.realApplications)}</section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeEdgeCases"><h3 id="readmeEdgeCases">Casos límite</h3>${edgeCases}</section>
      <section class="readme-section readme-section-rich" aria-labelledby="readmeErrors"><h3 id="readmeErrors">Errores comunes</h3>${errors}</section>`;
  }

  async function renderKnownReadme(algorithm, requestId) {
    const markdownPath = content.entries[algorithm.id]?.markdownPath;
    if (markdownPath) {
      elements.readme.innerHTML = `<p class="readme-loading">Cargando README Markdown…</p>`;
      try {
        const apiDocument = await window.AlgoInspectCatalogClient.getAlgorithm(algorithm.id);
        const markdown = apiDocument.readme;
        if (requestId !== readmeRequestId) return;
        elements.readme.innerHTML = markdownToHtml(markdown);
        await renderMermaidDiagrams(elements.readme);
      } catch (error) {
        if (requestId !== readmeRequestId) return;
        elements.readme.innerHTML = `<div class="readme-error" role="alert"><p>No se pudo cargar la documentación Markdown: ${escapeHtml(error.message)}</p><button type="button" data-retry-readme>Reintentar</button></div>`;
      }
      return;
    }
    const theory = normalizedTheory(algorithm);
    const category = categoryById.get(algorithm.category);
    const rows = complexityRows(algorithm, theory);
    const historyParagraphs = theory.history.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    const references = theory.references.map((reference) => `<li><a href="${escapeHtml(safeUrl(reference.url))}" target="_blank" rel="noreferrer noopener">${escapeHtml(reference.label)}</a><span>${escapeHtml(reference.meta)}${reference.note ? ` · ${escapeHtml(reference.note)}` : ""}</span></li>`).join("");
    const richDetail = renderKahnDetail(theory.detail);

    elements.readme.innerHTML = `
      <header class="readme-heading">
        <h2>${escapeHtml(algorithm.name)}</h2>
        <p>${escapeHtml(algorithm.description)}</p>
        <ul class="readme-badges" aria-label="Metadatos del algoritmo">
          <li>${escapeHtml(category?.label || algorithm.category)}</li>
          <li>${escapeHtml(algorithm.difficulty)}</li>
          <li>Tiempo ${escapeHtml(algorithm.time)}</li>
          <li>Espacio ${escapeHtml(algorithm.space)}</li>
        </ul>
      </header>

      <section class="readme-section" aria-labelledby="readmeIdea">
        <h3 id="readmeIdea">Idea principal</h3>
        <p>${escapeHtml(theory.principle)}</p>
        <div class="readme-note">
          <strong>Invariante que sostiene la ejecución</strong>
          ${escapeHtml(theory.invariant)}
        </div>
      </section>

      <section class="readme-section" aria-labelledby="readmeMechanics">
        <h3 id="readmeMechanics">Cómo funciona</h3>
        ${listMarkup(theory.mechanics, true)}
        <h4>Precondiciones y contrato</h4>
        ${listMarkup(theory.requirements)}
      </section>

      <section class="readme-section" aria-labelledby="readmeComplexity">
        <h3 id="readmeComplexity">Complejidad</h3>
        <div class="readme-complexity-wrap">
          <table class="readme-complexity">
            <thead><tr><th>Escenario</th><th>Tiempo</th><th>Espacio</th><th>Lectura</th></tr></thead>
            <tbody>${rows.map((row) => `<tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>
        <p class="readme-complexity-note">${escapeHtml(theory.complexity?.note || algorithm.timeDetail)} La columna de espacio usa la cota auxiliar de esta implementación de referencia.</p>
      </section>

      <section class="readme-section" aria-labelledby="readmeDecision">
        <h3 id="readmeDecision">Decisión de uso</h3>
        <div class="readme-grid">
          <div><h4>Cuándo usarlo</h4>${listMarkup(theory.useWhen)}</div>
          <div><h4>Cuándo elegir otra alternativa</h4>${listMarkup(theory.avoidWhen)}</div>
        </div>
      </section>

      <section class="readme-section" aria-labelledby="readmeHistory">
        <h3 id="readmeHistory">${escapeHtml(theory.history.title)}</h3>
        ${historyParagraphs}
      </section>

      ${richDetail}

      <section class="readme-section" aria-labelledby="readmeReferences">
        <h3 id="readmeReferences">Referencias para continuar</h3>
        <ul class="readme-reference-list">${references}</ul>
      </section>`;
  }

  function renderFreeReadme() {
    elements.readme.innerHTML = `
      <div class="readme-empty">
        <div>
          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M10 7h19l9 9v25H10V7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M29 7v10h9M16 24h16M16 30h13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <h2>README no disponible para código libre</h2>
          <p>La teoría y la historia se muestran únicamente cuando el código corresponde a un algoritmo reconocido del catálogo. Puedes volver al buscador y elegir uno sin perder el contenido pegado.</p>
        </div>
      </div>`;
  }

  async function renderReadme() {
    const requestId = ++readmeRequestId;
    void renderTests();
    const algorithm = currentAlgorithm();
    const nextId = algorithm?.id || "free";
    if (nextId === renderedAlgorithmId) return;
    renderedAlgorithmId = nextId;
    if (algorithm && content.entries[algorithm.id]) await renderKnownReadme(algorithm, requestId);
    else renderFreeReadme();
    elements.readmePanel.scrollTop = 0;
  }

  function syncFileName() {
    const fileName = elements.sourceFileName.textContent.trim() || "código";
    elements.codeTabFileName.textContent = fileName;
    elements.codeTab.title = `${fileName} · Arrastra para cambiar su posición`;
  }

  function tabElement(tabName) {
    if (tabName === "readme") return elements.readmeTab;
    if (tabName === "tests") return elements.testsTab;
    return elements.codeTab;
  }

  function tabShell(tabName) {
    return tabElement(tabName).closest("[data-tab-shell]");
  }

  function tabNameFromElement(tab) {
    if (tab === elements.readmeTab) return "readme";
    if (tab === elements.testsTab) return "tests";
    return "code";
  }

  function tabLabel(tabName) {
    if (tabName === "readme") return "README";
    if (tabName === "tests") return "Pruebas";
    return "Código";
  }

  function panelElement(tabName) {
    if (tabName === "readme") return elements.readmePanel;
    if (tabName === "tests") return elements.testsPanel;
    return elements.codePanel;
  }

  function openTabs() {
    return tabOrder.filter((tabName) => !closedTabs.has(tabName));
  }

  function normalizeDocumentState() {
    let open = openTabs();
    if (!open.length) {
      closedTabs.delete("code");
      open = openTabs();
    }
    if (!open.includes(activeTab)) activeTab = open[0];
    if (!open.includes(splitTop)) splitTop = open[0];
    if (splitActive && open.length < 2) splitActive = false;
    if (splitCount === 3 && open.length < 3) splitCount = 2;
  }

  function dockedTabs() {
    normalizeDocumentState();
    const open = openTabs();
    if (!splitActive) return [activeTab];
    if (splitCount === 3) return open.slice(0, 3);
    const top = open.includes(splitTop) ? splitTop : open[0];
    return [top, open.find((tabName) => tabName !== top)].filter(Boolean);
  }

  function renderTabOrder() {
    tabOrder.forEach((tabName) => {
      const shell = tabShell(tabName);
      shell.hidden = closedTabs.has(tabName);
      elements.tabList.appendChild(shell);
    });
  }

  function setSplitRatio(nextRatio) {
    splitRatio = Math.max(20, Math.min(80, Number(nextRatio) || 50));
    if (splitActive && splitCount === 2) elements.documentSplit.style.gridTemplateRows = `minmax(0, ${splitRatio}fr) var(--document-divider-size) minmax(0, ${100 - splitRatio}fr)`;
    elements.splitResizer.setAttribute("aria-valuenow", String(Math.round(splitRatio)));
    elements.splitResizer.setAttribute("aria-valuetext", `Documento superior ${Math.round(splitRatio)} por ciento; documento inferior ${Math.round(100 - splitRatio)} por ciento`);
  }

  function setTripleRatios(first, second) {
    const columns = Math.max(20, Math.min(80, Number(first) || 50));
    const rows = Math.max(20, Math.min(80, Number(second) || 50));
    tripleRatios = [columns, rows, 100 - rows];
    if (splitActive && splitCount === 3) {
      elements.documentSplit.style.gridTemplateColumns = `minmax(0, ${columns}fr) var(--document-divider-size) minmax(0, ${100 - columns}fr)`;
      elements.documentSplit.style.gridTemplateRows = `minmax(0, ${rows}fr) var(--document-divider-size) minmax(0, ${100 - rows}fr)`;
    }
    elements.splitResizerVertical.setAttribute("aria-valuenow", String(Math.round(columns)));
    elements.splitResizerVertical.setAttribute("aria-valuetext", `Columna izquierda ${Math.round(columns)} por ciento; columna derecha ${Math.round(100 - columns)} por ciento`);
    elements.splitResizerBottom.setAttribute("aria-valuenow", String(Math.round(rows)));
    elements.splitResizerBottom.setAttribute("aria-valuetext", `Fila superior ${Math.round(rows)} por ciento; fila inferior ${Math.round(100 - rows)} por ciento`);
  }

  function renderDocumentLayout() {
    normalizeDocumentState();
    renderTabOrder();
    elements.documentSplit.classList.toggle("is-split", splitActive);
    elements.documentSplit.classList.toggle("is-triple", splitActive && splitCount === 3);
    elements.documentSplit.classList.toggle("layout-row-bottom", splitActive && splitCount === 3);
    elements.documentSplit.classList.remove("layout-row-top");
    elements.documentSplit.style.gridTemplateRows = "";
    elements.documentSplit.style.gridTemplateColumns = "";
    [...elements.documentSplit.children].forEach((child) => elements.documentSplit.removeChild(child));

    if (splitActive) {
      if (splitCount === 3) {
        const [first, second, third] = openTabs();
        [first, second, third].forEach((tabName, index) => {
          const panel = panelElement(tabName);
          panel.style.gridArea = index === 0 ? "top-left" : index === 1 ? "top-right" : "bottom";
        });
        elements.documentSplit.appendChild(panelElement(first));
        elements.documentSplit.appendChild(elements.splitResizerVertical);
        elements.documentSplit.appendChild(panelElement(second));
        elements.documentSplit.appendChild(elements.splitResizerBottom);
        elements.documentSplit.appendChild(panelElement(third));
      } else {
        const visibleTabs = dockedTabs();
        visibleTabs.forEach((tabName, index) => {
          const panel = panelElement(tabName);
          panel.style.gridArea = "";
          elements.documentSplit.appendChild(panel);
          if (index === 0) elements.documentSplit.appendChild(elements.splitResizer);
        });
      }
      if (splitCount === 3) setTripleRatios(tripleRatios[0], tripleRatios[1]);
      else setSplitRatio(splitRatio);
      return;
    }

    elements.documentSplit.appendChild(elements.codePanel);
    elements.documentSplit.appendChild(elements.splitResizer);
    elements.documentSplit.appendChild(elements.readmePanel);
    elements.documentSplit.appendChild(elements.splitResizerBottom);
    elements.documentSplit.appendChild(elements.testsPanel);
    [elements.codePanel, elements.readmePanel, elements.testsPanel].forEach((panel) => { panel.style.gridArea = ""; });
    elements.splitResizer.classList.remove("is-dragging");
    elements.splitResizerBottom.classList.remove("is-dragging");
    elements.splitResizerVertical.classList.remove("is-dragging");
  }

  function syncDocumentVisibility() {
    const visible = new Set(dockedTabs());
    originalTabOrder.forEach((tabName) => {
      const panel = panelElement(tabName);
      const shouldHide = closedTabs.has(tabName) || !visible.has(tabName);
      panel.hidden = shouldHide;
      panel.inert = shouldHide;
      panel.setAttribute("role", "region");
    });
  }

  function syncTabState() {
    originalTabOrder.forEach((tabName) => {
      const tab = tabElement(tabName);
      const selected = !closedTabs.has(tabName) && activeTab === tabName;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-pressed", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
  }

  function setSplit(nextActive, topTab = splitTop, { announce = true, count = splitCount } = {}) {
    const open = openTabs();
    splitActive = Boolean(nextActive);
    const allowTriple = count === 3 && open.length >= 3 && window.matchMedia("(min-width: 721px)").matches;
    splitCount = splitActive ? (allowTriple ? 3 : 2) : 2;
    if (open.includes(topTab)) splitTop = topTab;
    renderDocumentLayout();
    syncDocumentVisibility();
    if (splitActive) {
      activeTab = splitTop;
      renderReadme();
      if (announce) elements.liveRegion.textContent = splitCount === 3
        ? "Diseño dividido: panel superior izquierdo, panel superior derecho y panel inferior."
        : `Panel dividido: ${tabLabel(splitTop)} arriba y el otro documento abajo.`;
    } else if (announce) {
      elements.liveRegion.textContent = "Panel unificado en una sola pestaña.";
    }
    syncTabState();
    if (!splitActive) window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  }

  function setActiveTab(tabName, { focus = false, announce = true } = {}) {
    if (!openTabs().includes(tabName)) return;
    if (splitActive && !dockedTabs().includes(tabName)) setSplit(false, activeTab, { announce: false });
    activeTab = tabName;
    const readmeActive = activeTab === "readme";
    if (readmeActive || activeTab === "tests") renderReadme();

    syncTabState();
    syncDocumentVisibility();
    elements.sourcePanel.classList.toggle("is-readme-active", readmeActive);

    if (focus) tabElement(activeTab).focus();
    if (announce) elements.liveRegion.textContent = `${tabLabel(activeTab)} visible.`;
    if (!readmeActive && activeTab !== "tests") window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  }

  elements.codeTab.addEventListener("click", () => setActiveTab("code"));
  elements.readmeTab.addEventListener("click", () => setActiveTab("readme"));
  elements.testsTab.addEventListener("click", () => setActiveTab("tests"));

  function closeTabMenu({ restoreFocus = false } = {}) {
    const target = tabMenuTarget;
    elements.tabMenu.hidden = true;
    elements.tabMenuToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
    tabMenuTarget = null;
    if (restoreFocus && target) elements.tabMenuToggles.find((toggle) => toggle.dataset.tabActions === target)?.focus();
  }

  function openTabMenu(tabName, toggle) {
    if (tabMenuTarget === tabName && !elements.tabMenu.hidden) {
      closeTabMenu({ restoreFocus: true });
      return;
    }
    tabMenuTarget = tabName;
    elements.tabMenu.hidden = false;
    elements.tabMenuToggles.forEach((item) => item.setAttribute("aria-expanded", String(item === toggle)));
    const rect = toggle.getBoundingClientRect();
    const menuRect = elements.tabMenu.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - menuRect.width - 8, rect.right - menuRect.width));
    elements.tabMenu.style.left = `${left}px`;
    elements.tabMenu.style.top = `${Math.min(window.innerHeight - menuRect.height - 8, rect.bottom + 5)}px`;
    elements.tabMenu.querySelector("[role=menuitem]")?.focus();
  }

  function closeDocumentTab(tabName) {
    const open = openTabs();
    if (open.length <= 1) {
      elements.liveRegion.textContent = "Debe permanecer al menos una pestaña abierta.";
      return;
    }
    closedTabs.add(tabName);
    normalizeDocumentState();
    renderDocumentLayout();
    syncDocumentVisibility();
    syncTabState();
    tabElement(activeTab).focus();
    elements.liveRegion.textContent = `${tabLabel(tabName)} cerrada. Usa Restablecer diseño para recuperarla.`;
  }

  function restoreTabPosition(tabName) {
    closedTabs.delete(tabName);
    const without = tabOrder.filter((name) => name !== tabName);
    const originalIndex = originalTabOrder.indexOf(tabName);
    let insertAt = 0;
    originalTabOrder.slice(0, originalIndex).forEach((name) => {
      const currentIndex = without.indexOf(name);
      if (currentIndex >= 0) insertAt = Math.max(insertAt, currentIndex + 1);
    });
    without.splice(insertAt, 0, tabName);
    tabOrder = without;
    activeTab = tabName;
    renderDocumentLayout();
    syncDocumentVisibility();
    syncTabState();
    tabElement(tabName).focus();
    elements.liveRegion.textContent = `${tabLabel(tabName)} volvió a su posición original.`;
  }

  function resetDocumentWorkspace() {
    closedTabs = new Set();
    tabOrder = [...originalTabOrder];
    splitActive = false;
    splitCount = 2;
    splitTop = "code";
    splitRatio = 50;
    tripleRatios = [50, 58, 42];
    activeTab = "code";
    renderDocumentLayout();
    setSplitRatio(50);
    setTripleRatios(50, 58);
    syncDocumentVisibility();
    syncTabState();
    elements.codeTab.focus();
    window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    elements.liveRegion.textContent = "Diseño restablecido: todas las pestañas están abiertas en su orden original.";
  }

  function moveDocumentToZone(tabName, zone) {
    closedTabs.delete(tabName);
    const targetIndex = zone === "upper-left" ? 0 : zone === "upper-right" ? 1 : 2;
    moveTabToDockIndex(tabName, targetIndex);
    setSplit(true, openTabs()[0], { announce: false, count: 3 });
    activeTab = tabName;
    syncDocumentVisibility();
    syncTabState();
    tabElement(tabName).focus();
    const label = zone === "upper-left" ? "arriba a la izquierda" : zone === "upper-right" ? "arriba a la derecha" : "abajo";
    elements.liveRegion.textContent = splitCount === 3
      ? `${tabLabel(tabName)} colocada ${label}.`
      : `${tabLabel(tabName)} colocada en el diseño apilado disponible para este ancho.`;
  }

  elements.tabMenuToggles.forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      openTabMenu(toggle.dataset.tabActions, toggle);
    });
  });

  elements.tabMenu.addEventListener("click", (event) => {
    const command = event.target.closest("[data-tab-command]")?.dataset.tabCommand;
    const target = tabMenuTarget;
    if (!command || !target) return;
    closeTabMenu();
    if (command === "restore") restoreTabPosition(target);
    else if (command === "move-upper-left") moveDocumentToZone(target, "upper-left");
    else if (command === "move-upper-right") moveDocumentToZone(target, "upper-right");
    else if (command === "move-lower") moveDocumentToZone(target, "lower");
    else if (command === "reset") resetDocumentWorkspace();
  });

  elements.tabMenu.addEventListener("keydown", (event) => {
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = [...elements.tabMenu.querySelectorAll("[role=menuitem]")];
    const currentIndex = Math.max(0, items.indexOf(document.activeElement));
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (currentIndex + (event.key === "ArrowUp" ? -1 : 1) + items.length) % items.length;
    items[nextIndex].focus();
  });

  document.addEventListener("pointerdown", (event) => {
    if (!elements.tabMenu.hidden && !elements.tabMenu.contains(event.target) && !event.target.closest("[data-tab-actions]")) closeTabMenu();
  });

  function clearDragState() {
    [elements.codeTab, elements.readmeTab, elements.testsTab].forEach((tab) => {
      tab.classList.remove("is-dragging", "is-drop-before", "is-drop-after");
      tab.setAttribute("aria-grabbed", "false");
    });
    elements.documentSplit.classList.remove("is-drag-over-upper", "is-drag-over-lower", "is-drag-over-upper-left", "is-drag-over-upper-right");
    draggedTab = null;
  }

  function reorderTabs(dragged, target, before) {
    if (!dragged || !target || dragged === target) return;
    tabOrder = tabOrder.filter((tabName) => tabName !== dragged);
    const targetIndex = tabOrder.indexOf(target);
    tabOrder.splice(Math.max(0, targetIndex + (before ? 0 : 1)), 0, dragged);
    renderTabOrder();
  }

  function moveTabToDockIndex(tabName, targetIndex) {
    const open = openTabs().filter((name) => name !== tabName);
    open.splice(Math.max(0, Math.min(targetIndex, open.length)), 0, tabName);
    tabOrder = [...open, ...tabOrder.filter((name) => closedTabs.has(name))];
  }

  function arrangeTwoPanelDrop(tabName, zone) {
    const visible = dockedTabs();
    const other = visible.find((name) => name !== tabName) || openTabs().find((name) => name !== tabName);
    if (zone === "upper") {
      moveTabToDockIndex(tabName, 0);
      moveTabToDockIndex(other, 1);
      splitTop = tabName;
    } else {
      moveTabToDockIndex(other, 0);
      moveTabToDockIndex(tabName, 1);
      splitTop = other;
    }
  }

  const dragOverlayClasses = ["is-drag-over-upper", "is-drag-over-lower", "is-drag-over-upper-left", "is-drag-over-upper-right"];

  function showDropZone(zone) {
    elements.documentSplit.classList.remove(...dragOverlayClasses);
    elements.documentSplit.classList.add(`is-drag-over-${zone}`);
  }

  function resolveDropZone(event, useThreeZones) {
    const rect = elements.documentSplit.getBoundingClientRect();
    const inUpperRow = event.clientY < rect.top + rect.height * 0.58;
    if (!useThreeZones) return inUpperRow ? "upper" : "lower";
    if (!inUpperRow) return "lower";
    return event.clientX < rect.left + rect.width / 2 ? "upper-left" : "upper-right";
  }

  [elements.codeTab, elements.readmeTab, elements.testsTab].forEach((tab) => {
    tab.addEventListener("dragstart", (event) => {
      draggedTab = tabNameFromElement(tab);
      closeTabMenu();
      tab.classList.add("is-dragging");
      tab.setAttribute("aria-grabbed", "true");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("application/x-algorithm-tab", draggedTab);
      event.dataTransfer.setData("text/plain", draggedTab);
      elements.liveRegion.textContent = "Pestaña arrastrada. Suelta arriba o abajo; con tres documentos, la fila superior también admite izquierda y derecha.";
    });

    tab.addEventListener("dragover", (event) => {
      if (!draggedTab) return;
      event.preventDefault();
      const target = tabNameFromElement(tab);
      if (target === draggedTab) return;
      const before = event.clientX < tab.getBoundingClientRect().left + tab.getBoundingClientRect().width / 2;
      [elements.codeTab, elements.readmeTab, elements.testsTab].forEach((item) => item.classList.remove("is-drop-before", "is-drop-after"));
      tab.classList.add(before ? "is-drop-before" : "is-drop-after");
      event.dataTransfer.dropEffect = "move";
    });

    tab.addEventListener("drop", (event) => {
      if (!draggedTab) return;
      event.preventDefault();
      const target = tabNameFromElement(tab);
      const before = event.clientX < tab.getBoundingClientRect().left + tab.getBoundingClientRect().width / 2;
      const movedTab = draggedTab;
      reorderTabs(movedTab, target, before);
      if (splitActive) {
        renderDocumentLayout();
        syncDocumentVisibility();
      } else setActiveTab(movedTab, { announce: false });
      elements.liveRegion.textContent = `${tabLabel(movedTab)} reordenada.`;
      clearDragState();
    });
  });

  elements.tabList.addEventListener("dragover", (event) => {
    if (!draggedTab) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });

  elements.tabList.addEventListener("drop", (event) => {
    if (!draggedTab) return;
    event.preventDefault();
    const movedTab = draggedTab;
    if (splitActive) {
      renderDocumentLayout();
      syncDocumentVisibility();
    } else setActiveTab(movedTab, { announce: false });
    elements.liveRegion.textContent = `${tabLabel(movedTab)} permanece en la barra de documentos.`;
    clearDragState();
  });

  elements.documentSplit.addEventListener("dragover", (event) => {
    if (!draggedTab) return;
    event.preventDefault();
    const hiddenThird = splitActive && splitCount === 2 && !dockedTabs().includes(draggedTab) && openTabs().length >= 3;
    const useThreeZones = window.matchMedia("(min-width: 721px)").matches && (splitCount === 3 || hiddenThird);
    showDropZone(resolveDropZone(event, useThreeZones));
    event.dataTransfer.dropEffect = "move";
  });

  elements.documentSplit.addEventListener("dragleave", (event) => {
    if (!event.relatedTarget || !elements.documentSplit.contains(event.relatedTarget)) elements.documentSplit.classList.remove(...dragOverlayClasses);
  });

  elements.documentSplit.addEventListener("drop", (event) => {
    if (!draggedTab) return;
    event.preventDefault();
    const movedTab = draggedTab;
    const hiddenThird = splitActive && splitCount === 2 && !dockedTabs().includes(movedTab) && openTabs().length >= 3;
    const useThreeZones = window.matchMedia("(min-width: 721px)").matches && (splitCount === 3 || hiddenThird);
    const zone = resolveDropZone(event, useThreeZones);
    if (useThreeZones) {
      const targetIndex = zone === "upper-left" ? 0 : zone === "upper-right" ? 1 : 2;
      moveTabToDockIndex(movedTab, targetIndex);
      setSplit(true, movedTab, { announce: false, count: 3 });
    } else {
      arrangeTwoPanelDrop(movedTab, zone);
      setSplit(true, splitTop, { announce: false, count: 2 });
    }
    activeTab = movedTab;
    syncTabState();
    syncDocumentVisibility();
    elements.liveRegion.textContent = `${tabLabel(movedTab)} colocada ${zone === "upper-left" ? "arriba a la izquierda" : zone === "upper-right" ? "arriba a la derecha" : zone === "upper" ? "arriba" : "abajo"}.`;
    clearDragState();
  });

  elements.codeTab.addEventListener("dragend", clearDragState);
  elements.readmeTab.addEventListener("dragend", clearDragState);
  elements.testsTab.addEventListener("dragend", clearDragState);

  elements.mergeButton.addEventListener("click", () => setSplit(false, splitTop));
  elements.languageSelect.addEventListener("change", () => renderTests());
  elements.tests.addEventListener("click", (event) => {
    if (event.target.closest("[data-retry-tests]")) renderTests();
    const scenarioRow = event.target.closest("[data-scenario-id]");
    if (scenarioRow) {
      window.dispatchEvent(new CustomEvent("algoinspect:scenario-select", {
        detail: { scenarioId: scenarioRow.dataset.scenarioId }
      }));
    }
  });
  elements.tests.addEventListener("keydown", (event) => {
    const scenarioRow = event.target.closest("[data-scenario-id]");
    if (!scenarioRow || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    scenarioRow.click();
  });
  elements.readme.addEventListener("click", (event) => {
    if (event.target.closest("[data-retry-readme]")) {
      renderedAlgorithmId = null;
      renderReadme();
    }
  });

  function finishSplitPointer() {
    if (!splitPointer) return;
    splitPointer = null;
    elements.splitResizer.classList.remove("is-dragging");
    elements.splitResizerBottom.classList.remove("is-dragging");
    elements.splitResizerVertical.classList.remove("is-dragging");
  }

  elements.splitResizer.addEventListener("pointerdown", (event) => {
    if (!splitActive || splitCount !== 2 || event.target.closest("button")) return;
    splitPointer = { id: event.pointerId, resizer: "top" };
    elements.splitResizer.classList.add("is-dragging");
    elements.splitResizer.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  elements.splitResizer.addEventListener("pointermove", (event) => {
    if (!splitPointer || splitPointer.id !== event.pointerId || splitPointer.resizer !== "top") return;
    const rect = elements.documentSplit.getBoundingClientRect();
    setSplitRatio(((event.clientY - rect.top) / rect.height) * 100);
  });
  elements.splitResizer.addEventListener("pointerup", finishSplitPointer);
  elements.splitResizer.addEventListener("pointercancel", finishSplitPointer);
  elements.splitResizer.addEventListener("dblclick", () => setSplitRatio(50));
  elements.splitResizer.addEventListener("keydown", (event) => {
    if (!splitActive) return;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      setSplitRatio(splitRatio - 5);
    } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      setSplitRatio(splitRatio + 5);
    } else if (event.key === "Home") {
      event.preventDefault();
      setSplitRatio(20);
    } else if (event.key === "End") {
      event.preventDefault();
      setSplitRatio(80);
    }
  });

  elements.splitResizerBottom.addEventListener("pointerdown", (event) => {
    if (!splitActive || splitCount !== 3) return;
    splitPointer = { id: event.pointerId, resizer: "bottom" };
    elements.splitResizerBottom.classList.add("is-dragging");
    elements.splitResizerBottom.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  elements.splitResizerBottom.addEventListener("pointermove", (event) => {
    if (!splitPointer || splitPointer.id !== event.pointerId || splitPointer.resizer !== "bottom") return;
    const rect = elements.documentSplit.getBoundingClientRect();
    setTripleRatios(tripleRatios[0], ((event.clientY - rect.top) / rect.height) * 100);
  });
  elements.splitResizerBottom.addEventListener("pointerup", finishSplitPointer);
  elements.splitResizerBottom.addEventListener("pointercancel", finishSplitPointer);
  elements.splitResizerBottom.addEventListener("dblclick", () => setTripleRatios(tripleRatios[0], 58));
  elements.splitResizerBottom.addEventListener("keydown", (event) => {
    if (!splitActive || splitCount !== 3) return;
    if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) event.preventDefault();
    if (event.key === "ArrowUp") setTripleRatios(tripleRatios[0], tripleRatios[1] - 5);
    else if (event.key === "ArrowDown") setTripleRatios(tripleRatios[0], tripleRatios[1] + 5);
    else if (event.key === "Home") setTripleRatios(tripleRatios[0], 20);
    else if (event.key === "End") setTripleRatios(tripleRatios[0], 80);
  });

  elements.splitResizerVertical.addEventListener("pointerdown", (event) => {
    if (!splitActive || splitCount !== 3) return;
    splitPointer = { id: event.pointerId, resizer: "vertical" };
    elements.splitResizerVertical.classList.add("is-dragging");
    elements.splitResizerVertical.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  elements.splitResizerVertical.addEventListener("pointermove", (event) => {
    if (!splitPointer || splitPointer.id !== event.pointerId || splitPointer.resizer !== "vertical") return;
    const rect = elements.documentSplit.getBoundingClientRect();
    setTripleRatios(((event.clientX - rect.left) / rect.width) * 100, tripleRatios[1]);
  });
  elements.splitResizerVertical.addEventListener("pointerup", finishSplitPointer);
  elements.splitResizerVertical.addEventListener("pointercancel", finishSplitPointer);
  elements.splitResizerVertical.addEventListener("dblclick", () => setTripleRatios(50, tripleRatios[1]));
  elements.splitResizerVertical.addEventListener("keydown", (event) => {
    if (!splitActive || splitCount !== 3) return;
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) event.preventDefault();
    if (event.key === "ArrowLeft") setTripleRatios(tripleRatios[0] - 5, tripleRatios[1]);
    else if (event.key === "ArrowRight") setTripleRatios(tripleRatios[0] + 5, tripleRatios[1]);
    else if (event.key === "Home") setTripleRatios(20, tripleRatios[1]);
    else if (event.key === "End") setTripleRatios(80, tripleRatios[1]);
  });

  elements.tabList.addEventListener("keydown", (event) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key) || !event.target.matches("[data-document-tab]")) return;
    event.preventDefault();
    const open = openTabs();
    const currentIndex = open.indexOf(activeTab);
    const next = event.key === "Home" ? open[0] : event.key === "End" ? open[open.length - 1] : open[(currentIndex + (event.key === "ArrowLeft" ? -1 : 1) + open.length) % open.length];
    setActiveTab(next, { focus: true });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.tabMenu.hidden) {
      event.preventDefault();
      closeTabMenu({ restoreFocus: true });
      return;
    }
    if (event.key === "Escape" && splitActive && elements.documentSplit.contains(document.activeElement)) {
      event.preventDefault();
      setSplit(false, splitTop);
      return;
    }
    if (!event.ctrlKey || !["PageUp", "PageDown"].includes(event.key) || !elements.sourcePanel.contains(document.activeElement)) return;
    event.preventDefault();
    const open = openTabs();
    const currentIndex = Math.max(0, open.indexOf(activeTab));
    const direction = event.key === "PageUp" ? -1 : 1;
    setActiveTab(open[(currentIndex + direction + open.length) % open.length], { focus: true });
  });

  window.addEventListener("resize", () => {
    if (!elements.tabMenu.hidden) closeTabMenu();
    if (splitActive && splitCount === 3 && window.innerWidth <= 720) {
      splitCount = 2;
      splitTop = openTabs()[0];
      renderDocumentLayout();
      syncDocumentVisibility();
      syncTabState();
      elements.liveRegion.textContent = "En este ancho, el diseño se adapta a dos paneles apilados.";
    }
  });

  const observer = new MutationObserver(() => {
    renderedAlgorithmId = null;
    syncFileName();
    renderReadme();
  });
  observer.observe(elements.selectedName, { childList: true, characterData: true, subtree: true });
  observer.observe(elements.sourceFileName, { childList: true, characterData: true, subtree: true });

  const missingEntries = catalog.algorithms.filter((algorithm) => !content.entries[algorithm.id]);
  if (missingEntries.length) console.warn("README sin contenido:", missingEntries.map((algorithm) => algorithm.id));

  syncFileName();
  renderReadme();
  renderDocumentLayout();
  syncDocumentVisibility();
  setSplitRatio(50);
  setActiveTab("code", { announce: false });
})();
