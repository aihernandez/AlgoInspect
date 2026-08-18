(() => {
  "use strict";

  const catalog = window.AlgorithmCatalog;
  const traceLibrary = window.AlgorithmTraces;
  if (!catalog || !traceLibrary) return;

  const elements = {
    workspace: document.querySelector("#labWorkspace"),
    sourcePanel: document.querySelector("#sourcePanel"),
    visualizationPanel: document.querySelector("#visualizationPanel"),
    resizer: document.querySelector("#labPanelResizer"),
    menu: document.querySelector("#algorithmMenu"),
    catalog: document.querySelector("#algorithmCatalog"),
    catalogEmpty: document.querySelector("#catalogEmpty"),
    search: document.querySelector("#algorithmSearch"),
    freeCodeOption: document.querySelector("#freeCodeOption"),
    pickerModeLabel: document.querySelector("#pickerModeLabel"),
    language: document.querySelector("#languageSelect"),
    selectedCategory: document.querySelector("#selectedCategory"),
    selectedName: document.querySelector("#selectedAlgorithmName"),
    selectedSummary: document.querySelector("#selectedAlgorithmSummary"),
    fileName: document.querySelector("#sourceFileName"),
    sourceModeLabel: document.querySelector("#sourceModeLabel"),
    languageCoverage: document.querySelector("#languageCoverage"),
    monacoHost: document.querySelector("#monacoEditor"),
    fallbackEditor: document.querySelector("#fallbackEditor"),
    editorFrame: document.querySelector(".editor-frame"),
    editorLoading: document.querySelector("#editorLoading"),
    codeLineStatus: document.querySelector("#codeLineStatus"),
    codeStats: document.querySelector("#codeStats"),
    visualCategoryIcon: document.querySelector("#visualCategoryIcon"),
    visualTitle: document.querySelector("#visualTitle"),
    difficulty: document.querySelector("#difficultyBadge"),
    description: document.querySelector("#visualDescription"),
    timeCell: document.querySelector("#timeComplexityCell"),
    spaceCell: document.querySelector("#spaceComplexityCell"),
    time: document.querySelector("#timeComplexity"),
    space: document.querySelector("#spaceComplexity"),
    complexityPopover: document.querySelector("#complexityPopover"),
    complexityPopoverKind: document.querySelector("#complexityPopoverKind"),
    complexityPopoverNotation: document.querySelector("#complexityPopoverNotation"),
    complexityPopoverZone: document.querySelector("#complexityPopoverZone"),
    complexityPopoverDetail: document.querySelector("#complexityPopoverDetail"),
    complexityCases: document.querySelector("#complexityCases"),
    complexityMiniChart: document.querySelector("#complexityMiniChart"),
    complexityLegend: document.querySelector("#complexityLegend"),
    preset: document.querySelector("#presetSelect"),
    stage: document.querySelector("#visualStage"),
    stageResizer: document.querySelector("#visualStageResizer"),
    stageCanvas: document.querySelector("#stageCanvas"),
    zoomControls: document.querySelector("#diagramZoomControls"),
    zoomOut: document.querySelector("#diagramZoomOut"),
    zoomIn: document.querySelector("#diagramZoomIn"),
    zoomFit: document.querySelector("#diagramZoomFit"),
    zoomValue: document.querySelector("#diagramZoomValue"),
    visualHeader: document.querySelector(".visual-header"),
    visualOptions: document.querySelector(".visual-options"),
    playerPanel: document.querySelector(".player-panel"),
    executionDock: document.querySelector("#executionDock"),
    phase: document.querySelector("#phaseBadge"),
    stepTitle: document.querySelector("#stepTitle"),
    explanation: document.querySelector("#stepExplanation"),
    executionSteps: document.querySelector("#executionStepList"),
    executionProgress: document.querySelector("#executionProgress"),
    finalResult: document.querySelector(".final-result"),
    finalResultStatus: document.querySelector("#finalResultStatus"),
    finalResultText: document.querySelector("#finalResultText"),
    restart: document.querySelector("#restartButton"),
    restartTop: document.querySelector("#restartButtonTop"),
    previous: document.querySelector("#previousButton"),
    play: document.querySelector("#playButton"),
    next: document.querySelector("#nextButton"),
    counter: document.querySelector("#stepCounter"),
    operation: document.querySelector("#operationLabel"),
    timeline: document.querySelector("#timelineRange"),
    speed: document.querySelector("#speedSelect"),
    variables: document.querySelector("#variableGrid"),
    counters: document.querySelector("#counterGrid"),
    stateStep: document.querySelector("#stateStepBadge"),
    family: document.querySelector("#familyLabel"),
    invariant: document.querySelector("#invariantText"),
    knownVisualization: document.querySelector("#knownVisualization"),
    freeAnalysisView: document.querySelector("#freeAnalysisView"),
    freeAnalysisTitle: document.querySelector("#freeAnalysisTitle"),
    freeAnalysisStatus: document.querySelector("#freeAnalysisStatus"),
    freeScopeName: document.querySelector("#freeScopeName"),
    analyzeFree: document.querySelector("#analyzeFreeButton"),
    freeInputSize: document.querySelector("#freeInputSize"),
    freeInputValue: document.querySelector("#freeInputValue"),
    freeProbeSummary: document.querySelector("#freeProbeSummary"),
    freeTimeChart: document.querySelector("#freeTimeChart"),
    freeSpaceChart: document.querySelector("#freeSpaceChart"),
    technologyButton: document.querySelector("#technologyInfoButton"),
    technologyPopover: document.querySelector("#technologyPopover"),
    liveRegion: document.querySelector("#liveRegion"),
    toast: document.querySelector("#toast")
  };

  const categoryById = Object.fromEntries(catalog.categories.map((item) => [item.id, item]));
  const algorithmById = Object.fromEntries(catalog.algorithms.map((item) => [item.id, item]));
  const initialParameters = new URLSearchParams(window.location.search);
  const requestedAlgorithm = initialParameters.get("algorithm");
  const requestedLanguage = initialParameters.get("language");
  const requestedScenario = initialParameters.get("scenario");
  const initialAlgorithm = algorithmById[requestedAlgorithm] || catalog.algorithms[0];
  const initialLanguage = catalog.languages.some((language) => language.id === requestedLanguage)
    ? requestedLanguage
    : catalog.languages[0].id;
  const state = {
    mode: "known",
    algorithmId: initialAlgorithm.id,
    languageId: initialLanguage,
    query: "",
    menuOpen: false,
    menuIndex: -1,
    presetId: requestedScenario || initialAlgorithm.presets[0].id,
    trace: [],
    step: 0,
    furthestStep: 0,
    playing: false,
    timer: null,
    codeReference: null,
    editor: null,
    codeZoomSize: 9.5,
    codeZoomMode: "fit",
    editorDecorations: [],
    cytoscape: null,
    freeScenario: "all",
    freeInput: 6,
    freeCodeByLanguage: {},
    freeLabel: "",
    complexityKind: null,
    complexityScenario: "average",
    complexityHideTimer: null,
    diagramScale: 1,
    diagramPanX: 0,
    diagramPanY: 0
  };

  const diagramPointers = new Map();
  let diagramGesture = null;

  function diagramBaseScale() {
    return window.innerWidth <= 720 ? 1 : 0.75;
  }

  const categoryIcons = {
    search: '<svg viewBox="0 0 24 24" fill="none"><circle cx="10" cy="10" r="5.5" stroke="currentColor" stroke-width="1.7"/><path d="m14 14 5 5M4 19h5M4 5h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    sorting: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 4v16m0 0-3-3m3 3 3-3M18 20V4m0 0-3 3m3-3 3 3M11 8h3M11 12h3M11 16h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    graphs: '<svg viewBox="0 0 24 24" fill="none"><path d="m7 7 10 3M7 7l3 11m7-8-7 8" stroke="currentColor" stroke-width="1.5"/><circle cx="6" cy="6" r="3" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="10" r="3" stroke="currentColor" stroke-width="1.7"/><circle cx="10" cy="19" r="3" stroke="currentColor" stroke-width="1.7"/></svg>',
    recursion: '<svg viewBox="0 0 24 24" fill="none"><path d="M8 7H5V4M5.5 7.5A8 8 0 1 1 4 13M9 10h6v6H9z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    dynamic: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M4 10h16M10 4v16M15 10v10M10 15h10" stroke="currentColor" stroke-width="1.4"/></svg>'
  };

  const complexityProfiles = [
    { id: "constant", label: "O(1)", zone: "Constante", color: "#56b447", endY: 177, shape: () => 0, description: "El costo no aumenta al crecer la entrada." },
    { id: "loglog", label: "O(log log n)", zone: "Sublogarítmica", color: "#67c78a", endY: 160, shape: (t) => Math.log2(Math.log2(3 + 13 * t) + 1) / Math.log2(5) , description: "Crece aún más lentamente que una función logarítmica." },
    { id: "logarithmic", label: "O(log n)", zone: "Logarítmica", color: "#79b8ff", endY: 143, shape: (t) => Math.log2(1 + 15 * t) / 4, description: "Cada paso suele reducir una fracción importante del problema." },
    { id: "sqrt", label: "O(√n)", zone: "Sublineal", color: "#55b8d6", endY: 126, shape: (t) => Math.sqrt(t), description: "Crece más despacio que recorrer toda la entrada." },
    { id: "linear", label: "O(n)", zone: "Lineal", color: "#bc8cff", endY: 108, shape: (t) => t, description: "El costo crece aproximadamente al ritmo de la entrada." },
    { id: "nlogn", label: "O(n log n)", zone: "Lineal-logarítmica", color: "#e3a72f", endY: 87, shape: (t) => t * Math.log2(2 + 14 * t) / 4, description: "Combina un recorrido con divisiones o niveles logarítmicos." },
    { id: "quadratic", label: "O(n²)", zone: "Cuadrática o producto", color: "#f09a51", endY: 64, shape: (t) => t * t, description: "Dos dimensiones o recorridos anidados dominan el crecimiento." },
    { id: "exponential", label: "O(2ⁿ)", zone: "Exponencial", color: "#f47067", endY: 40, shape: (t) => (2 ** (6 * t) - 1) / 63, description: "Cada incremento puede multiplicar el espacio de posibilidades." },
    { id: "factorial", label: "O(n!)", zone: "Factorial", color: "#df6bb3", endY: 17, shape: (t) => t ** 5, description: "Explora permutaciones; el crecimiento se vuelve extremo muy pronto." }
  ];

  const complexityScenarioDefinitions = [
    { id: "best", label: "Mejor", color: "#56b447" },
    { id: "average", label: "Promedio", color: "#e3a72f" },
    { id: "worst", label: "Peor", color: "#f47067" }
  ];

  function selectedAlgorithm() {
    return algorithmById[state.algorithmId];
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { elements.toast.hidden = true; }, 2600);
  }

  function announce(message) {
    elements.liveRegion.textContent = message;
  }

  function renderLanguageOptions() {
    elements.language.innerHTML = catalog.languages.map((language) => `<option value="${language.id}">${language.label}</option>`).join("");
    elements.language.value = state.languageId;
  }

  function filteredAlgorithms() {
    const query = state.query.trim().toLocaleLowerCase("es");
    return catalog.algorithms.filter((algorithm) => {
      const haystack = `${algorithm.name} ${algorithm.englishName} ${algorithm.summary}`.toLocaleLowerCase("es");
      return !query || haystack.includes(query);
    });
  }

  function renderCatalog() {
    const algorithms = filteredAlgorithms();
    const groups = catalog.categories
      .map((category) => ({ category, algorithms: algorithms.filter((algorithm) => algorithm.category === category.id) }))
      .filter((group) => group.algorithms.length);
    elements.catalog.innerHTML = groups.map(({ category, algorithms: groupAlgorithms }) => `<section class="catalog-group" role="presentation" aria-labelledby="catalogGroup-${category.id}" style="--category-color:${category.color}">
      <div class="catalog-group-heading" id="catalogGroup-${category.id}"><span>${category.label}</span><small>${groupAlgorithms.length} algoritmo${groupAlgorithms.length === 1 ? "" : "s"}</small></div>
      <div class="catalog-group-items" role="presentation">
        ${groupAlgorithms.map((algorithm) => `<button id="algorithm-option-${algorithm.id}" class="algorithm-row ${state.mode === "known" && algorithm.id === state.algorithmId ? "is-selected" : ""}" type="button" role="option" tabindex="-1" aria-selected="${state.mode === "known" && algorithm.id === state.algorithmId}" data-algorithm="${algorithm.id}" style="--category-color:${category.color}">
          <i aria-hidden="true"></i>
          <span><strong>${algorithm.name}</strong><small>${algorithm.difficulty}</small></span>
          <span class="algorithm-complexity"><small><b>T</b><code>${algorithm.time}</code></small><small><b>E</b><code>${algorithm.space}</code></small></span>
        </button>`).join("")}
      </div>
    </section>`).join("");
    elements.catalogEmpty.hidden = algorithms.length > 0;
    elements.catalog.hidden = algorithms.length === 0;
    state.menuIndex = -1;
    updateMenuActiveOption();
  }

  function menuOptions() {
    return [...elements.catalog.querySelectorAll("[data-algorithm]")];
  }

  function updateMenuActiveOption() {
    const options = menuOptions();
    if (state.menuIndex >= options.length) state.menuIndex = options.length - 1;
    options.forEach((option, index) => option.classList.toggle("is-keyboard-active", index === state.menuIndex));
    if (state.menuIndex >= 0 && options[state.menuIndex]) {
      const option = options[state.menuIndex];
      if (!option.id) option.id = "algorithm-option-free";
      elements.search.setAttribute("aria-activedescendant", option.id);
      option.scrollIntoView({ block: "nearest" });
    } else {
      elements.search.removeAttribute("aria-activedescendant");
    }
  }

  function openAlgorithmMenu(query = "") {
    state.menuOpen = true;
    state.query = query;
    state.menuIndex = -1;
    renderCatalog();
    elements.menu.hidden = false;
    elements.search.setAttribute("aria-expanded", "true");
    if (!query.trim()) {
      const options = menuOptions();
      state.menuIndex = state.mode === "known"
        ? options.findIndex((option) => option.dataset.algorithm === state.algorithmId)
        : options.indexOf(elements.freeCodeOption);
      updateMenuActiveOption();
    }
  }

  function modeSearchValue() {
    if (state.mode === "free") return state.freeLabel || "Código libre";
    return selectedAlgorithm().name;
  }

  function closeAlgorithmMenu({ restoreValue = true } = {}) {
    if (!state.menuOpen) return;
    state.menuOpen = false;
    state.menuIndex = -1;
    elements.menu.hidden = true;
    elements.search.setAttribute("aria-expanded", "false");
    elements.search.removeAttribute("aria-activedescendant");
    if (restoreValue) elements.search.value = modeSearchValue();
  }

  function moveMenuSelection(direction) {
    const options = menuOptions();
    if (!options.length) return;
    state.menuIndex = state.menuIndex < 0
      ? direction > 0 ? 0 : options.length - 1
      : (state.menuIndex + direction + options.length) % options.length;
    updateMenuActiveOption();
  }

  function activateMenuSelection() {
    const options = menuOptions();
    const option = state.menuIndex >= 0 ? options[state.menuIndex] : null;
    if (option?.dataset.algorithm) selectAlgorithm(option.dataset.algorithm);
    else {
      const matches = filteredAlgorithms();
      if (matches.length === 1) selectAlgorithm(matches[0].id);
      else announce("No hay algoritmos publicados que coincidan. Modifica la búsqueda.");
    }
  }

  function renderPresetOptions() {
    const algorithm = selectedAlgorithm();
    if (!algorithm.presets.some((preset) => preset.id === state.presetId)) state.presetId = algorithm.presets[0].id;
    elements.preset.innerHTML = algorithm.presets.map((preset) => `<option value="${preset.id}">${preset.label}</option>`).join("");
    elements.preset.value = state.presetId;
  }

  function languageDefinition() {
    return catalog.languages.find((language) => language.id === state.languageId) || catalog.languages[0];
  }

  function freeCodeTemplate() {
    const language = languageDefinition();
    const comment = ["python", "ruby"].includes(language.id) ? "#" : "//";
    const label = state.freeLabel ? `: ${state.freeLabel}` : "";
    return `${comment} Código libre${label}\n${comment} Pega o escribe aquí el algoritmo que quieres analizar.\n`;
  }

  function updateCodeStats(code) {
    const value = code ?? (state.editor ? state.editor.getValue() : elements.fallbackEditor.value);
    const lines = value ? value.split("\n").length : 0;
    elements.codeStats.textContent = `${lines} línea${lines === 1 ? "" : "s"}`;
    if (state.mode === "free") elements.freeScopeName.textContent = lines ? `Contenido completo · ${lines} línea${lines === 1 ? "" : "s"}` : "Editor vacío";
  }

  function codeLineCount() {
    return state.codeReference?.code ? state.codeReference.code.split("\n").length : 0;
  }

  function applyCodeZoom(size, mode = "manual") {
    state.codeZoomSize = Math.max(8, Math.min(16, Math.round(size * 2) / 2));
    state.codeZoomMode = mode;
    const lineHeight = Math.max(11, Math.round(state.codeZoomSize * 1.45));
    elements.fallbackEditor.style.fontSize = `${state.codeZoomSize}px`;
    elements.fallbackEditor.style.lineHeight = `${lineHeight}px`;
    if (state.editor && window.monaco) state.editor.updateOptions({ fontSize: state.codeZoomSize, lineHeight });
  }

  function fitCodeToViewport() {
    const lines = Math.max(1, codeLineCount());
    const height = elements.editorFrame?.clientHeight || 420;
    const fittedSize = Math.max(8, Math.min(11, (height - 20) / (lines * 1.45)));
    applyCodeZoom(fittedSize, "fit");
  }

  function updateCodeReference({ resetFree = false } = {}) {
    if (state.mode === "free") {
      const language = languageDefinition();
      const code = !resetFree && state.freeCodeByLanguage[state.languageId] !== undefined
        ? state.freeCodeByLanguage[state.languageId]
        : freeCodeTemplate();
      state.freeCodeByLanguage[state.languageId] = code;
      state.codeReference = { code, lineMap: {}, fileName: `Algorithm.${language.extension}`, monacoLanguage: language.monaco };
    } else {
      state.codeReference = catalog.buildReference(state.algorithmId, state.languageId);
    }
    elements.fileName.textContent = state.codeReference.fileName;
    elements.fallbackEditor.value = state.codeReference.code;
    elements.fallbackEditor.readOnly = state.mode !== "free";
    updateCodeStats(state.codeReference.code);
    if (state.editor) {
      window.monaco.editor.setModelLanguage(state.editor.getModel(), state.codeReference.monacoLanguage);
      state.editor.setValue(state.codeReference.code);
      state.editor.updateOptions({ readOnly: state.mode !== "free" });
    }
    if (state.codeZoomMode === "fit") window.requestAnimationFrame(fitCodeToViewport);
    highlightCodeLine();
  }

  function categoryLabel(category) {
    return category.id === "dynamic" ? "Programación dinámica" : category.label;
  }

  function complexityProfileFor(notation) {
    const value = notation.toLocaleLowerCase("es").replaceAll(" ", "");
    if (value.includes("n!") || value.includes("factorial")) return complexityProfiles.find((profile) => profile.id === "factorial");
    if (value.includes("2ⁿ") || value.includes("2^n") || value.includes("b^d")) return complexityProfiles.find((profile) => profile.id === "exponential");
    if (value.includes("n²") || value.includes("n^2") || value.includes("ve") || value.includes("nw") || value.includes("nm")) return complexityProfiles.find((profile) => profile.id === "quadratic");
    if (value.includes("nlogn") || (value.includes("v+e") && value.includes("logv"))) return complexityProfiles.find((profile) => profile.id === "nlogn");
    if (value.includes("√n") || value.includes("sqrt")) return complexityProfiles.find((profile) => profile.id === "sqrt");
    if (value.includes("loglog")) return complexityProfiles.find((profile) => profile.id === "loglog");
    if (value.includes("log")) return complexityProfiles.find((profile) => profile.id === "logarithmic");
    if (value === "o(1)") return complexityProfiles.find((profile) => profile.id === "constant");
    return complexityProfiles.find((profile) => profile.id === "linear");
  }

  function complexityCasesFor(algorithm, kind) {
    return catalog.complexityScenarios?.[algorithm.id]?.[kind] || null;
  }

  function renderComplexityCases(cases, selectedScenario, notation, kindLabel) {
    elements.complexityCases.setAttribute("aria-label", cases ? `${kindLabel}: elegir mejor, promedio o peor escenario` : `${kindLabel}: misma referencia para todos los escenarios`);
    if (!cases) {
      elements.complexityCases.innerHTML = `<div class="complexity-case-single"><small>Todos los escenarios</small><code>${notation}</code></div>`;
      return;
    }
    elements.complexityCases.innerHTML = complexityScenarioDefinitions.map((scenario) => `<button class="complexity-case-button" type="button" data-complexity-case="${scenario.id}" aria-pressed="${scenario.id === selectedScenario}" aria-label="${scenario.label}: ${cases[scenario.id]}. Mostrar esta curva"><small>${scenario.label}</small><code>${cases[scenario.id]}</code></button>`).join("");
  }

  function renderComplexityMiniChart(activeProfile, notation, kindLabel) {
    const svgElement = elements.complexityMiniChart;
    svgElement.setAttribute("aria-label", `${kindLabel} ${notation}. Zona ${activeProfile.zone} dentro del mapa comparativo Big O.`);
    elements.complexityLegend.innerHTML = complexityProfiles.map((profile) => `<span class="${profile.id === activeProfile.id ? "is-active" : ""}" style="--profile-color:${profile.color}"><i aria-hidden="true"></i><code>${profile.label}</code></span>`).join("");
    if (!window.d3) {
      svgElement.innerHTML = '<text x="210" y="112" text-anchor="middle" fill="#b1bac4" font-size="11">Gráfica no disponible</text>';
      return;
    }

    const d3 = window.d3;
    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();
    const startX = 28;
    const endX = 390;
    const baseY = 177;

    [42, 87, 132, 177].forEach((y) => svg.append("line")
      .attr("class", "complexity-chart-grid")
      .attr("x1", startX).attr("x2", endX).attr("y1", y).attr("y2", y));
    svg.append("line").attr("class", "complexity-chart-axis").attr("x1", startX).attr("x2", endX + 2).attr("y1", baseY).attr("y2", baseY);
    svg.append("line").attr("class", "complexity-chart-axis").attr("x1", startX).attr("x2", startX).attr("y1", 15).attr("y2", baseY);
    svg.append("text").attr("class", "complexity-chart-axis-label").attr("x", startX).attr("y", 205).text("tamaño de entrada n →");
    svg.append("text").attr("class", "complexity-chart-axis-label").attr("x", -106).attr("y", 12).attr("transform", "rotate(-90)").text("crecimiento relativo →");

    complexityProfiles.forEach((profile) => {
      const points = Array.from({ length: 36 }, (_, index) => {
        const t = index / 35;
        return [startX + t * (endX - startX), baseY + (profile.endY - baseY) * profile.shape(t)];
      });
      const active = profile.id === activeProfile.id;
      svg.append("path")
        .datum(points)
        .attr("class", `complexity-chart-curve${active ? " is-active" : ""}`)
        .attr("stroke", profile.color)
        .attr("d", d3.line().x((point) => point[0]).y((point) => point[1]).curve(d3.curveMonotoneX));
      if (active) svg.append("circle")
        .attr("class", "complexity-chart-marker")
        .attr("cx", endX).attr("cy", profile.endY).attr("r", 4.5).attr("fill", profile.color);
    });

  }

  function showComplexityPopover(kind, requestedScenario = null) {
    if (state.mode !== "known") return;
    window.clearTimeout(state.complexityHideTimer);
    const algorithm = selectedAlgorithm();
    const isTime = kind === "time";
    const cases = complexityCasesFor(algorithm, kind);
    const keepScenario = state.complexityKind === kind && cases?.[state.complexityScenario];
    const selectedScenario = cases
      ? requestedScenario && cases[requestedScenario] ? requestedScenario : keepScenario ? state.complexityScenario : "average"
      : null;
    const notation = cases?.[selectedScenario] || (isTime ? algorithm.time : algorithm.space);
    const profile = complexityProfileFor(notation);
    const kindLabel = isTime ? "Tiempo" : "Espacio";
    const scenarioLabel = complexityScenarioDefinitions.find((scenario) => scenario.id === selectedScenario)?.label;
    const detail = cases
      ? `${scenarioLabel}: ${notation}. ${profile.description} Referencia del catálogo: ${isTime ? algorithm.timeDetail : algorithm.spaceDetail || algorithm.space}.`
      : `${algorithm.spaceDetail || `Memoria auxiliar de referencia ${algorithm.space}`}. ${profile.description}`;
    state.complexityKind = kind;
    state.complexityScenario = selectedScenario || "reference";
    elements.complexityPopover.dataset.kind = kind;
    elements.complexityPopover.style.setProperty("--complexity-color", profile.color);
    elements.complexityPopoverKind.textContent = `Complejidad de ${kindLabel.toLocaleLowerCase("es")}${scenarioLabel ? ` · ${scenarioLabel}` : ""}`;
    elements.complexityPopoverNotation.textContent = notation;
    elements.complexityPopoverZone.textContent = `Zona ${profile.zone}`;
    elements.complexityPopoverDetail.textContent = detail;
    elements.complexityPopover.hidden = false;
    elements.timeCell.setAttribute("aria-expanded", String(isTime));
    elements.spaceCell.setAttribute("aria-expanded", String(!isTime));
    renderComplexityCases(cases, selectedScenario, notation, kindLabel);
    renderComplexityMiniChart(profile, notation, kindLabel);
  }

  function hideComplexityPopover(delay = 0) {
    window.clearTimeout(state.complexityHideTimer);
    state.complexityHideTimer = window.setTimeout(() => {
      state.complexityKind = null;
      elements.complexityPopover.hidden = true;
      elements.timeCell.setAttribute("aria-expanded", "false");
      elements.spaceCell.setAttribute("aria-expanded", "false");
    }, delay);
  }

  function updateAlgorithmMeta() {
    const algorithm = selectedAlgorithm();
    const category = categoryById[algorithm.category];
    elements.selectedCategory.style.setProperty("--category-color", category.color);
    elements.selectedName.textContent = algorithm.name;
    elements.selectedSummary.textContent = algorithm.summary;
    elements.visualTitle.textContent = algorithm.name;
    elements.difficulty.textContent = algorithm.difficulty;
    elements.description.textContent = algorithm.description;
    elements.time.textContent = algorithm.time;
    elements.space.textContent = algorithm.space;
    elements.timeCell.title = `Ver gráfica de escenarios de tiempo ${algorithm.time}.`;
    elements.spaceCell.title = `Ver gráfica de escenarios de espacio ${algorithm.space}.`;
    elements.visualCategoryIcon.style.setProperty("--category-color", category.color);
    elements.visualCategoryIcon.innerHTML = categoryIcons[algorithm.category];
    elements.family.textContent = categoryLabel(category);
    elements.invariant.textContent = algorithm.invariant;
    if (state.complexityKind) showComplexityPopover(state.complexityKind);
  }

  function setHiddenInert(element, hidden) {
    element.hidden = hidden;
    element.inert = hidden;
  }

  function updateModePresentation() {
    const isFree = state.mode === "free";
    setHiddenInert(elements.knownVisualization, isFree);
    setHiddenInert(elements.freeAnalysisView, !isFree);
    elements.visualizationPanel.setAttribute("aria-labelledby", isFree ? "freeAnalysisTitle" : "visualTitle");
    elements.pickerModeLabel.textContent = isFree ? "Código libre" : "Reconocido";
    elements.languageCoverage.textContent = isFree ? "Editor habilitado" : `${catalog.languages.length} implementaciones canónicas`;
    elements.sourceModeLabel.textContent = isFree ? "Código editable · análisis simulado" : "Implementación canónica validada";
    if (isFree) {
      hideComplexityPopover();
      elements.selectedCategory.style.setProperty("--category-color", "#bc8cff");
      elements.selectedName.textContent = "Código libre";
      elements.selectedSummary.textContent = "Pega o edita un algoritmo no reconocido.";
      elements.codeLineStatus.textContent = "Código editable";
      elements.freeAnalysisView.dataset.scenario = state.freeScenario;
      window.requestAnimationFrame(renderFreeComplexityCharts);
    }
  }

  function stopPlayback() {
    state.playing = false;
    window.clearTimeout(state.timer);
    state.timer = null;
    elements.play.classList.remove("is-playing");
    elements.play.setAttribute("aria-pressed", "false");
    elements.play.setAttribute("aria-label", "Reproducir traza");
    elements.play.querySelector("span").textContent = "Reproducir";
  }

  function diagramPoint(clientX, clientY) {
    const rect = elements.stage.getBoundingClientRect();
    return {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2
    };
  }

  function clampDiagramView() {
    state.diagramScale = Math.max(0.5, Math.min(2, state.diagramScale));
    const rect = elements.stage.getBoundingClientRect();
    const renderedScale = state.diagramScale * diagramBaseScale();
    const minimumPanX = Math.min(64, rect.width * 0.16);
    const minimumPanY = Math.min(48, rect.height * 0.2);
    const limitX = Math.max(minimumPanX, rect.width * Math.abs(renderedScale - 1) / 2);
    const limitY = Math.max(minimumPanY, rect.height * Math.abs(renderedScale - 1) / 2);
    state.diagramPanX = Math.max(-limitX, Math.min(limitX, state.diagramPanX));
    state.diagramPanY = Math.max(-limitY, Math.min(limitY, state.diagramPanY));
  }

  function applyDiagramView(announceChange = false) {
    clampDiagramView();
    const renderedScale = state.diagramScale * diagramBaseScale();
    elements.stageCanvas.style.setProperty("--diagram-scale", renderedScale.toFixed(3));
    elements.stageCanvas.style.setProperty("--diagram-pan-x", `${state.diagramPanX.toFixed(1)}px`);
    elements.stageCanvas.style.setProperty("--diagram-pan-y", `${state.diagramPanY.toFixed(1)}px`);
    const percent = Math.round(state.diagramScale * 100);
    elements.zoomValue.value = `${percent}%`;
    elements.zoomValue.textContent = `${percent}%`;
    elements.zoomOut.disabled = state.diagramScale <= 0.501;
    elements.zoomIn.disabled = state.diagramScale >= 1.999;
    const fitted = Math.abs(state.diagramScale - 1) < 0.001 && Math.abs(state.diagramPanX) < 0.5 && Math.abs(state.diagramPanY) < 0.5;
    elements.zoomFit.disabled = fitted;
    elements.stage.classList.toggle("is-zoomed", !fitted);
    if (announceChange) announce(`Zoom del diagrama: ${percent} por ciento.`);
  }

  function setDiagramScale(requestedScale, origin = { x: 0, y: 0 }, announceChange = false) {
    const previousScale = state.diagramScale;
    const nextScale = Math.max(0.5, Math.min(2, requestedScale));
    const contentX = (origin.x - state.diagramPanX) / previousScale;
    const contentY = (origin.y - state.diagramPanY) / previousScale;
    state.diagramScale = nextScale;
    state.diagramPanX = origin.x - contentX * nextScale;
    state.diagramPanY = origin.y - contentY * nextScale;
    applyDiagramView(announceChange);
  }

  function resetDiagramView(announceChange = false) {
    state.diagramScale = 1;
    state.diagramPanX = 0;
    state.diagramPanY = 0;
    applyDiagramView();
    if (announceChange) announce("Diagrama ajustado y centrado al 100 por ciento.");
  }

  function startDiagramPinch() {
    const points = [...diagramPointers.values()].slice(0, 2);
    if (points.length < 2) return;
    const midpoint = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
    const distance = Math.max(1, Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y));
    diagramGesture = {
      type: "pinch",
      distance,
      scale: state.diagramScale,
      contentX: (midpoint.x - state.diagramPanX) / state.diagramScale,
      contentY: (midpoint.y - state.diagramPanY) / state.diagramScale
    };
  }

  function beginDiagramPan(pointer) {
    diagramGesture = {
      type: "pan",
      pointerId: pointer.id,
      x: pointer.x,
      y: pointer.y,
      panX: state.diagramPanX,
      panY: state.diagramPanY
    };
  }

  function finishDiagramPointer(event) {
    diagramPointers.delete(event.pointerId);
    if (elements.stage.hasPointerCapture(event.pointerId)) elements.stage.releasePointerCapture(event.pointerId);
    if (diagramPointers.size >= 2) startDiagramPinch();
    else if (diagramPointers.size === 1) beginDiagramPan([...diagramPointers.entries()].map(([id, point]) => ({ id, ...point }))[0]);
    else {
      diagramGesture = null;
      elements.stage.classList.remove("is-panning");
    }
  }

  function rebuildTrace(announceChange = false) {
    stopPlayback();
    resetDiagramView();
    state.trace = traceLibrary.buildTrace(state.algorithmId, state.presetId);
    state.step = 0;
    state.furthestStep = 0;
    elements.timeline.max = Math.max(0, state.trace.length - 1);
    elements.timeline.value = 0;
    renderExecutionSteps();
    renderStep();
    if (announceChange) announce(`${selectedAlgorithm().name}: traza de ${state.trace.length} pasos preparada.`);
  }

  function selectAlgorithm(algorithmId) {
    if (!algorithmById[algorithmId]) return;
    if (state.mode === "free" && state.editor) state.freeCodeByLanguage[state.languageId] = state.editor.getValue();
    state.mode = "known";
    state.algorithmId = algorithmId;
    const algorithm = selectedAlgorithm();
    if (!algorithm.presets.some((preset) => preset.id === state.presetId)) state.presetId = algorithm.presets[0].id;
    renderCatalog();
    renderPresetOptions();
    updateAlgorithmMeta();
    updateCodeReference();
    updateModePresentation();
    rebuildTrace(true);
    closeAlgorithmMenu({ restoreValue: false });
    elements.search.value = algorithm.name;
    updateCanonicalUrl();
    if (elements.stageCanvas.animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.stageCanvas.animate([
        { opacity: 0.64, filter: "blur(2px)", clipPath: "inset(0 5% 0 5%)" },
        { opacity: 1, filter: "blur(0)", clipPath: "inset(0 0 0 0)" }
      ], { duration: 360, easing: "cubic-bezier(.16, 1, .3, 1)" });
    }
  }

  function updateCanonicalUrl() {
    if (state.mode !== "known") return;
    const url = new URL(window.location.href);
    url.searchParams.set("algorithm", state.algorithmId);
    url.searchParams.set("language", state.languageId);
    url.searchParams.set("scenario", state.presetId);
    window.history.replaceState(null, "", url);
  }

  function switchToFreeMode(label = "") {
    stopPlayback();
    state.mode = "free";
    state.freeLabel = label;
    if (state.cytoscape) {
      state.cytoscape.destroy();
      state.cytoscape = null;
    }
    updateCodeReference({ resetFree: state.freeCodeByLanguage[state.languageId] === undefined });
    updateModePresentation();
    closeAlgorithmMenu({ restoreValue: false });
    elements.search.value = state.freeLabel || "Código libre";
    elements.freeAnalysisTitle.setAttribute("tabindex", "-1");
    elements.freeAnalysisTitle.focus({ preventScroll: true });
    announce("Modo código libre. La animación paso a paso se ocultó y se muestran ambas gráficas de complejidad.");
  }

  function formatValue(value) {
    if (Array.isArray(value)) return value.join(" → ") || "vacía";
    if (value === Infinity || value === "Infinity") return "∞";
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
  }

  function traceLineNumber(step) {
    return state.codeReference?.lineMap?.[step.lineKey] || state.codeReference?.lineMap?.setup || 1;
  }

  function stepValuesSummary(step, limit = 4) {
    const entries = Object.entries(step.variables || {});
    if (!entries.length) return "sin valores registrados";
    const visible = entries.slice(0, limit).map(([key, value]) => `${key}=${formatValue(value)}`);
    return `${visible.join(" · ")}${entries.length > limit ? ` · +${entries.length - limit}` : ""}`;
  }

  function renderExecutionSteps() {
    const fragment = document.createDocumentFragment();
    state.trace.forEach((step, index) => {
      const item = document.createElement("li");
      item.className = "execution-step-item";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "execution-step-button";
      button.dataset.executionStep = String(index);

      const marker = document.createElement("span");
      marker.className = "execution-step-marker";
      marker.setAttribute("aria-hidden", "true");

      const number = document.createElement("span");
      number.className = "execution-step-number";
      number.textContent = `#${index + 1}`;

      const copy = document.createElement("span");
      copy.className = "execution-step-copy";
      const title = document.createElement("strong");
      title.textContent = step.title;
      const values = document.createElement("small");
      values.textContent = stepValuesSummary(step);
      values.title = stepValuesSummary(step, Number.POSITIVE_INFINITY);
      copy.append(title, values);

      const line = document.createElement("code");
      line.className = "execution-step-line";
      line.textContent = `L${traceLineNumber(step)}`;

      button.append(marker, number, copy, line);
      item.append(button);
      fragment.append(item);
    });
    elements.executionSteps.replaceChildren(fragment);
    updateExecutionSteps();
  }

  function updateExecutionSteps() {
    let activeButton = null;
    elements.executionSteps.querySelectorAll("[data-execution-step]").forEach((button) => {
      const index = Number(button.dataset.executionStep);
      const item = button.closest(".execution-step-item");
      const active = index === state.step;
      const complete = index <= state.furthestStep;
      item.classList.toggle("is-active", active);
      item.classList.toggle("is-complete", complete);
      item.classList.toggle("is-pending", !complete);
      button.tabIndex = active ? 0 : -1;
      if (active) {
        button.setAttribute("aria-current", "step");
        activeButton = button;
      } else {
        button.removeAttribute("aria-current");
      }
    });
    activeButton?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function updateExecutionResult() {
    const finalStep = state.trace.at(-1);
    const finalIndex = Math.max(0, state.trace.length - 1);
    const reached = state.furthestStep >= finalIndex;
    elements.executionProgress.textContent = `${state.step + 1} / ${state.trace.length}`;
    elements.finalResult.classList.toggle("is-reached", reached);
    elements.finalResultStatus.textContent = reached ? "Alcanzado" : "En ejecución";
    elements.finalResultText.textContent = reached
      ? `${finalStep.title}: ${finalStep.message}`
      : `Faltan ${finalIndex - state.furthestStep} paso${finalIndex - state.furthestStep === 1 ? "" : "s"} para confirmar el resultado final.`;
  }

  function renderVariables(step) {
    const entries = Object.entries(step.variables).slice(0, 6);
    elements.variables.innerHTML = entries.map(([key, value]) => `<div class="variable-cell"><span>${key}</span><strong title="${formatValue(value)}">${formatValue(value)}</strong></div>`).join("");
  }

  function counterSelection(stepState) {
    if (stepState.kind === "hanoi") return [["moves", "Movimientos"], ["calls", "Llamadas"], ["writes", "Escrituras"]];
    if (stepState.kind === "graph" && stepState.algorithm === "kahn") return [["visits", "Nodos emitidos"], ["comparisons", "Aristas procesadas"], ["writes", "Grados reducidos"]];
    if (stepState.kind === "graph") return [["visits", "Visitas"], ["comparisons", "Inspecciones"], ["writes", "Altas/relajaciones"]];
    if (stepState.kind === "board") return [["comparisons", "Pruebas"], ["calls", "Llamadas"], ["writes", "Colocar/quitar"]];
    if (stepState.kind === "dp") return [["comparisons", "Comparaciones"], ["writes", "Celdas escritas"], ["calls", "Llamadas"]];
    return [["comparisons", "Comparaciones"], ["swaps", "Intercambios"], ["writes", "Escrituras"]];
  }

  function renderCounters(step) {
    elements.counters.classList.toggle("is-kahn", step.state.kind === "graph" && step.state.algorithm === "kahn");
    elements.counters.innerHTML = counterSelection(step.state).map(([key, label]) => `<div class="counter-cell"><span>${label}</span><strong>${step.counters[key] || 0}</strong></div>`).join("");
  }

  function highlightCodeLine() {
    if (!state.codeReference) return;
    if (state.mode === "free") {
      elements.codeLineStatus.textContent = "Código editable";
      if (state.editor) state.editorDecorations = state.editor.deltaDecorations(state.editorDecorations, []);
      return;
    }
    if (!state.trace.length) return;
    const step = state.trace[state.step];
    const line = traceLineNumber(step);
    elements.codeLineStatus.textContent = `Línea ${line} · ${step.lineKey}`;
    if (!state.editor || !window.monaco) return;
    state.editorDecorations = state.editor.deltaDecorations(state.editorDecorations, [{
      range: new window.monaco.Range(line, 1, line, 1),
      options: { isWholeLine: true, className: "active-code-line", linesDecorationsClassName: "active-code-gutter" }
    }]);
    state.editor.revealLineInCenterIfOutsideViewport(line, window.monaco.editor.ScrollType.Smooth);
  }

  function renderStep() {
    if (!state.trace.length) return;
    const step = state.trace[state.step];
    elements.phase.textContent = step.phase;
    elements.stepTitle.textContent = step.title;
    elements.explanation.textContent = step.message;
    elements.counter.textContent = `Paso ${state.step + 1} de ${state.trace.length}`;
    elements.operation.textContent = step.phase;
    elements.stateStep.textContent = `Paso ${state.step + 1}`;
    elements.timeline.value = state.step;
    elements.previous.disabled = state.step === 0;
    const traceIsFresh = state.step === 0 && state.furthestStep === 0;
    elements.restart.disabled = traceIsFresh;
    elements.restartTop.disabled = traceIsFresh;
    elements.next.disabled = state.step >= state.trace.length - 1;
    elements.play.disabled = state.trace.length <= 1;
    updateExecutionSteps();
    updateExecutionResult();
    renderVariables(step);
    renderCounters(step);
    renderVisualization(step.state);
    highlightCodeLine();
  }

  function goToStep(index, shouldAnnounce = false) {
    const nextIndex = Math.max(0, Math.min(state.trace.length - 1, Number(index)));
    state.step = nextIndex;
    state.furthestStep = Math.max(state.furthestStep, nextIndex);
    renderStep();
    if (shouldAnnounce) announce(`${elements.counter.textContent}: ${state.trace[state.step].title}.`);
  }

  function restartTrace() {
    stopPlayback();
    state.furthestStep = 0;
    goToStep(0, true);
  }

  function activateExecutionStep(index, focusStep = false) {
    stopPlayback();
    goToStep(index);
    const button = elements.executionSteps.querySelector(`[data-execution-step="${state.step}"]`);
    if (focusStep) button?.focus({ preventScroll: true });
    const line = traceLineNumber(state.trace[state.step]);
    announce(`Paso ${state.step + 1}: ${state.trace[state.step].title}. Línea ${line} resaltada y diagrama actualizado.`);
  }

  function schedulePlayback() {
    if (!state.playing) return;
    if (state.step >= state.trace.length - 1) {
      stopPlayback();
      announce(`${selectedAlgorithm().name}: traza completada.`);
      return;
    }
    state.timer = window.setTimeout(() => {
      goToStep(state.step + 1);
      schedulePlayback();
    }, Number(elements.speed.value));
  }

  function togglePlayback() {
    if (state.playing) {
      stopPlayback();
      announce("Reproducción pausada.");
      return;
    }
    if (state.step >= state.trace.length - 1) {
      state.furthestStep = 0;
      goToStep(0);
    }
    state.playing = true;
    elements.play.classList.add("is-playing");
    elements.play.setAttribute("aria-pressed", "true");
    elements.play.setAttribute("aria-label", "Pausar traza");
    elements.play.querySelector("span").textContent = "Pausar";
    announce("Reproducción iniciada.");
    schedulePlayback();
  }

  function ensureD3() {
    if (window.d3) return true;
    elements.stageCanvas.innerHTML = '<p style="color:#b1bac4;font-size:11px">No fue posible cargar el renderizador gráfico. Revisa la conexión y recarga la pantalla.</p>';
    return false;
  }

  function arrayClass(index, view) {
    if (index === view.found) return "array-cell is-found";
    if ((view.sorted || []).includes(index)) return "array-cell is-sorted";
    if (index === view.pivot) return "array-cell is-pivot";
    if ((view.compare || []).includes(index)) return "array-cell is-compare";
    if ((view.inactive || []).includes(index)) return "array-cell is-inactive";
    if ((view.active || []).includes(index)) return "array-cell is-active";
    return "array-cell";
  }

  function renderArray(view) {
    if (!ensureD3()) return;
    elements.stageCanvas.innerHTML = "";
    const d3 = window.d3;
    const compact = window.innerWidth <= 470;
    const canvasWidth = compact ? 420 : 680;
    const canvasHeight = compact ? 220 : 250;
    const svg = d3.select(elements.stageCanvas).append("svg").attr("viewBox", `0 0 ${canvasWidth} ${canvasHeight}`).attr("role", "img").attr("aria-label", "Arreglo y punteros del paso actual");
    const count = view.values.length;
    const gap = compact ? 4 : 8;
    const usableWidth = compact ? canvasWidth - 36 : 570;
    const cell = Math.min(60, Math.max(compact ? 30 : 38, (usableWidth - (count - 1) * gap) / count));
    const total = count * cell + (count - 1) * gap;
    const startX = (canvasWidth - total) / 2;
    const y = compact ? 72 : 92;

    const groups = svg.selectAll("g.array-item").data(view.values).join("g").attr("class", "array-item").attr("transform", (_, index) => `translate(${startX + index * (cell + gap)}, ${y})`);
    groups.append("rect").attr("class", (_, index) => arrayClass(index, view)).attr("width", cell).attr("height", 52).attr("rx", 8);
    groups.append("text").attr("class", "array-value").attr("x", cell / 2).attr("y", 32).attr("text-anchor", "middle").text((value) => value);
    groups.append("text").attr("class", "array-index").attr("x", cell / 2).attr("y", 72).attr("text-anchor", "middle").text((_, index) => index);

    if (view.target !== undefined) {
      const badge = svg.append("g").attr("transform", `translate(${compact ? 12 : 26}, ${compact ? 13 : 20})`);
      badge.append("rect").attr("class", "target-badge").attr("width", 126).attr("height", 34).attr("rx", 8);
      badge.append("text").attr("class", "target-text").attr("x", 63).attr("y", 22).attr("text-anchor", "middle").text(`objetivo = ${view.target}`);
    }

    const pointerEntries = Object.entries(view.pointers || {}).filter(([, index]) => Number.isFinite(index) && index >= 0 && index < count);
    pointerEntries.forEach(([label, index], pointerIndex) => {
      const x = startX + index * (cell + gap) + cell / 2;
      const pointerY = (compact ? 151 : 176) + (pointerIndex % 2) * 24;
      svg.append("line").attr("class", "pointer-line").attr("x1", x).attr("y1", y + 55).attr("x2", x).attr("y2", pointerY - 13);
      svg.append("text").attr("class", "pointer-text").attr("x", x).attr("y", pointerY).attr("text-anchor", "middle").text(`${label}=${index}`);
    });

    (view.ranges || []).forEach(([left, right], rangeIndex) => {
      const x1 = startX + left * (cell + gap);
      const x2 = startX + right * (cell + gap) + cell;
      const bracketY = compact ? 60 : 78;
      svg.append("path").attr("d", `M${x1},${bracketY} v-8 H${x2} v8`).attr("fill", "none").attr("stroke", rangeIndex ? "#bc8cff" : "#79b8ff").attr("stroke-width", 1.5);
    });
  }

  function graphElements(layoutKey, view) {
    const layout = traceLibrary.graphLayouts[layoutKey];
    const weighted = ["dijkstra", "bellman-ford"].includes(view.algorithm);
    const directed = ["topological-sort", "kahn", "bellman-ford"].includes(view.algorithm);
    const showsIndegree = view.algorithm === "kahn" && view.indegrees;
    return {
      nodes: layout.nodes.map((node) => ({
        data: {
          id: node.id,
          label: weighted
            ? `${node.id}\n${view.distances[node.id] === Infinity ? "∞" : view.distances[node.id] ?? "∞"}`
            : showsIndegree
              ? `${node.id}\nin:${view.indegrees[node.id]}`
              : node.id
        },
        position: { x: node.x, y: node.y },
        classes: [
          showsIndegree ? "indegree" : "",
          view.current === node.id ? "current" : "",
          view.visited.includes(node.id) ? "visited" : "",
          view.frontier.includes(node.id) ? "frontier" : "",
          (view.blocked || []).includes(node.id) ? "blocked" : ""
        ].filter(Boolean).join(" ")
      })),
      edges: layout.edges.map((edge, index) => ({
        data: { id: `e${index}`, source: edge.source, target: edge.target, weight: weighted ? edge.weight : "" },
        classes: [
          directed ? "directed" : "",
          view.activeEdge && ((view.activeEdge[0] === edge.source && view.activeEdge[1] === edge.target) || (!directed && view.activeEdge[0] === edge.target && view.activeEdge[1] === edge.source)) ? "active" : ""
        ].filter(Boolean).join(" ")
      }))
    };
  }

  function renderGraphFallback(view) {
    if (!ensureD3()) return;
    const layout = traceLibrary.graphLayouts[view.layout];
    const directed = ["topological-sort", "kahn", "bellman-ford"].includes(view.algorithm);
    elements.stageCanvas.innerHTML = "";
    const svg = window.d3.select(elements.stageCanvas).append("svg").attr("viewBox", "0 0 590 205").attr("role", "img").attr("aria-label", view.algorithm === "kahn" ? "Grafo dirigido de Kahn con grados de entrada" : "Grafo del paso actual");
    if (directed) {
      svg.append("defs").append("marker")
        .attr("id", "graphArrow")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 18)
        .attr("refY", 5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("fill", "context-stroke");
    }
    layout.edges.forEach((edge) => {
      const source = layout.nodes.find((node) => node.id === edge.source);
      const target = layout.nodes.find((node) => node.id === edge.target);
      const active = view.activeEdge && view.activeEdge[0] === edge.source && view.activeEdge[1] === edge.target;
      svg.append("line").attr("x1", source.x).attr("y1", source.y).attr("x2", target.x).attr("y2", target.y).attr("stroke", active ? "#e3a72f" : "#484f58").attr("stroke-width", active ? 4 : 2).attr("marker-end", directed ? "url(#graphArrow)" : null);
    });
    layout.nodes.forEach((node) => {
      const current = view.current === node.id;
      const visited = view.visited.includes(node.id);
      const frontier = view.frontier.includes(node.id);
      const blocked = (view.blocked || []).includes(node.id);
      const group = svg.append("g").attr("transform", `translate(${node.x},${node.y})`);
      group.append("circle").attr("r", 24).attr("fill", current ? "#17345b" : blocked ? "#422226" : visited ? "#1d3525" : frontier ? "#3a2e19" : "#1c2129").attr("stroke", current ? "#79b8ff" : blocked ? "#f47067" : visited ? "#56b447" : frontier ? "#e3a72f" : "#484f58").attr("stroke-width", 2);
      const label = group.append("text").attr("text-anchor", "middle").attr("fill", "#f0f6fc").attr("font-family", "var(--font-mono)").attr("font-size", view.algorithm === "kahn" ? 10 : 12);
      label.append("tspan").attr("x", 0).attr("dy", view.algorithm === "kahn" ? -2 : 4).text(node.id);
      if (view.algorithm === "kahn") label.append("tspan").attr("x", 0).attr("dy", 13).text(`in:${view.indegrees[node.id]}`);
    });
  }

  function renderGraph(view) {
    if (state.cytoscape) {
      state.cytoscape.destroy();
      state.cytoscape = null;
    }
    if (!window.cytoscape) {
      renderGraphFallback(view);
      return;
    }
    elements.stageCanvas.innerHTML = `<div id="cytoscapeStage" role="img" aria-label="${view.algorithm === "kahn" ? "Grafo dirigido de Kahn; cada nodo muestra su grado de entrada" : "Grafo del paso actual"}"></div>`;
    const data = graphElements(view.layout, view);
    state.cytoscape = window.cytoscape({
      container: document.querySelector("#cytoscapeStage"),
      elements: [...data.nodes, ...data.edges],
      layout: { name: "preset", fit: true, padding: 34 },
      userZoomingEnabled: false,
      userPanningEnabled: false,
      autoungrabify: true,
      boxSelectionEnabled: false,
      style: [
        { selector: "node", style: { width: 46, height: 46, "background-color": "#1c2129", "border-color": "#59636f", "border-width": 1.5, label: "data(label)", color: "#f0f6fc", "font-family": "Cascadia Code, Consolas, monospace", "font-size": 11, "font-weight": 650, "text-valign": "center", "text-halign": "center", "text-wrap": "wrap" } },
        { selector: "node.indegree", style: { width: 50, height: 50, "font-size": 10, "line-height": 1.15 } },
        { selector: "node.frontier", style: { "background-color": "#3a2e19", "border-color": "#e3a72f", "border-width": 2 } },
        { selector: "node.visited", style: { "background-color": "#1d3525", "border-color": "#56b447", "border-width": 2 } },
        { selector: "node.blocked", style: { "background-color": "#422226", "border-color": "#f47067", "border-width": 3 } },
        { selector: "node.current", style: { "background-color": "#17345b", "border-color": "#79b8ff", "border-width": 3 } },
        { selector: "edge", style: { width: 2, "line-color": "#484f58", "curve-style": "bezier", label: "data(weight)", color: "#b1bac4", "font-family": "Cascadia Code, Consolas, monospace", "font-size": 9, "text-background-color": "#0e1319", "text-background-opacity": 1, "text-background-padding": 3 } },
        { selector: "edge.directed", style: { "target-arrow-shape": "triangle", "target-arrow-color": "#59636f", "arrow-scale": 0.9 } },
        { selector: "edge.active", style: { width: 4, "line-color": "#e3a72f", "target-arrow-color": "#e3a72f", color: "#f0c96b" } }
      ]
    });
  }

  function renderHanoi(view) {
    if (!ensureD3()) return;
    elements.stageCanvas.innerHTML = "";
    const d3 = window.d3;
    const compact = window.innerWidth <= 470;
    const canvasWidth = compact ? 420 : 640;
    const svg = d3.select(elements.stageCanvas).append("svg").attr("viewBox", `0 0 ${canvasWidth} 240`).attr("role", "img").attr("aria-label", "Postes y discos de Torres de Hanoi");
    const positions = compact ? { A: 75, B: 210, C: 345 } : { A: 130, B: 320, C: 510 };
    Object.entries(positions).forEach(([rod, x]) => {
      svg.append("rect").attr("class", "hanoi-rod").attr("x", x - 5).attr("y", 42).attr("width", 10).attr("height", 150).attr("rx", 5);
      const baseWidth = compact ? 112 : 164;
      svg.append("rect").attr("class", "hanoi-base").attr("x", x - baseWidth / 2).attr("y", 190).attr("width", baseWidth).attr("height", 10).attr("rx", 5);
      svg.append("text").attr("class", "hanoi-label").attr("x", x).attr("y", 222).attr("text-anchor", "middle").text(`Poste ${rod}`);
      view.rods[rod].forEach((disk, index) => {
        const width = compact ? 30 + disk * 18 : 46 + disk * 25;
        const moving = view.moving && view.moving.disk === disk && view.moving.target === rod;
        svg.append("rect").attr("class", "hanoi-disk").attr("x", x - width / 2).attr("y", 168 - index * 25).attr("width", width).attr("height", 20).attr("rx", 7).attr("fill", moving ? "#17345b" : disk % 2 ? "#2a4160" : "#3a2e50").attr("stroke", moving ? "#79b8ff" : disk % 2 ? "#4c92f8" : "#bc8cff");
      });
    });
  }

  function renderBoard(view) {
    if (!ensureD3()) return;
    elements.stageCanvas.innerHTML = "";
    const d3 = window.d3;
    const compact = window.innerWidth <= 470;
    const canvasWidth = compact ? 420 : 640;
    const svg = d3.select(elements.stageCanvas).append("svg").attr("viewBox", `0 0 ${canvasWidth} 250`).attr("role", "img").attr("aria-label", `Tablero de ${view.size} por ${view.size}`);
    const cell = view.size === 5 ? 39 : 46;
    const total = cell * view.size;
    const startX = (canvasWidth - total) / 2;
    const startY = (220 - total) / 2 + 6;
    for (let row = 0; row < view.size; row += 1) {
      for (let column = 0; column < view.size; column += 1) {
        const active = view.active && view.active[0] === row && view.active[1] === column;
        const conflict = view.conflict && view.conflict[0] === row && view.conflict[1] === column;
        svg.append("rect").attr("x", startX + column * cell).attr("y", startY + row * cell).attr("width", cell).attr("height", cell).attr("class", `${(row + column) % 2 ? "board-cell-dark" : "board-cell-light"}${active ? " board-cell-active" : ""}${conflict ? " board-cell-conflict" : ""}`);
        if (view.board[row] === column) svg.append("text").attr("class", "queen-mark").attr("x", startX + column * cell + cell / 2).attr("y", startY + row * cell + cell * 0.69).attr("text-anchor", "middle").text("Q");
      }
    }
    svg.append("text").attr("class", "array-label").attr("x", 22).attr("y", 28).text(`${view.board.filter((value) => value >= 0).length}/${view.size} reinas colocadas`);
  }

  function renderDp(view) {
    if (!ensureD3()) return;
    elements.stageCanvas.innerHTML = "";
    const d3 = window.d3;
    const compact = window.innerWidth <= 470;
    const canvasWidth = compact ? 420 : 680;
    const svg = d3.select(elements.stageCanvas).append("svg").attr("viewBox", `0 0 ${canvasWidth} 250`).attr("role", "img").attr("aria-label", "Tabla de programación dinámica de Mochila 0/1");
    const rows = view.table.length;
    const columns = view.table[0].length;
    const cellW = Math.min(58, (compact ? 338 : 510) / columns);
    const cellH = Math.min(35, 175 / rows);
    const startX = (canvasWidth - columns * cellW) / 2 + (compact ? 10 : 18);
    const startY = 47;
    for (let column = 0; column < columns; column += 1) svg.append("text").attr("class", "dp-label").attr("x", startX + column * cellW + cellW / 2).attr("y", startY - 12).attr("text-anchor", "middle").text(column);
    for (let row = 0; row < rows; row += 1) {
      svg.append("text").attr("class", "dp-label").attr("x", startX - 18).attr("y", startY + row * cellH + cellH * 0.65).attr("text-anchor", "middle").text(row);
      for (let column = 0; column < columns; column += 1) {
        const active = view.active && view.active[0] === row && view.active[1] === column;
        const source = (view.sources || []).some(([sourceRow, sourceColumn]) => sourceRow === row && sourceColumn === column);
        svg.append("rect").attr("x", startX + column * cellW).attr("y", startY + row * cellH).attr("width", cellW).attr("height", cellH).attr("rx", 3).attr("class", active ? "dp-cell dp-cell-active" : source ? "dp-cell dp-cell-source" : "dp-cell");
        svg.append("text").attr("class", "dp-value").attr("x", startX + column * cellW + cellW / 2).attr("y", startY + row * cellH + cellH * 0.66).attr("text-anchor", "middle").text(view.table[row][column]);
      }
    }
    svg.append("text").attr("class", "dp-label").attr("x", 20).attr("y", 24).text(`capacidad W = ${view.capacity}`);
    svg.append("text").attr("class", "dp-label").attr("x", 20).attr("y", 42).text(`objetos: ${view.items.map((item) => `${item.weight}/${item.value}`).join(" · ")} (peso/valor)`);
  }

  function renderVisualization(view) {
    if (view.kind !== "graph" && state.cytoscape) {
      state.cytoscape.destroy();
      state.cytoscape = null;
    }
    if (view.kind === "array") renderArray(view);
    else if (view.kind === "graph") renderGraph(view);
    else if (view.kind === "hanoi") renderHanoi(view);
    else if (view.kind === "board") renderBoard(view);
    else if (view.kind === "dp") renderDp(view);
  }

  const freeProfiles = {
    time: [
      { scenario: "best", notation: "O(n)", color: "#56b447", cost: (n) => n },
      { scenario: "average", notation: "O(n log n)", color: "#e3a72f", cost: (n) => n * Math.log2(n + 1) },
      { scenario: "worst", notation: "O(n²)", color: "#f47067", cost: (n) => n * n }
    ],
    space: [
      { scenario: "best", notation: "O(1)", color: "#56b447", cost: () => 1 },
      { scenario: "average", notation: "O(log n)", color: "#e3a72f", cost: (n) => Math.log2(n + 1) },
      { scenario: "worst", notation: "O(n)", color: "#f47067", cost: (n) => n }
    ]
  };

  function renderFreeChart(svgElement, type) {
    if (!window.d3 || !svgElement) return;
    const d3 = window.d3;
    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();
    const width = 420;
    const height = window.innerWidth <= 720 ? 330 : 360;
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    const margin = { top: 20, right: 54, bottom: 36, left: 42 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const profiles = freeProfiles[type];
    const samples = d3.range(1, 10.01, 0.2);
    const maxCost = d3.max(profiles, (profile) => d3.max(samples, profile.cost));
    const x = d3.scaleLinear().domain([1, 10]).range([margin.left, margin.left + plotWidth]);
    const y = d3.scaleLinear().domain([0, maxCost * 1.08]).range([margin.top + plotHeight, margin.top]);

    [0.25, 0.5, 0.75, 1].forEach((ratio) => {
      const yPosition = margin.top + plotHeight * (1 - ratio);
      svg.append("line").attr("class", "free-grid-line").attr("x1", margin.left).attr("x2", margin.left + plotWidth).attr("y1", yPosition).attr("y2", yPosition);
    });
    svg.append("line").attr("class", "free-axis").attr("x1", margin.left).attr("x2", margin.left).attr("y1", margin.top).attr("y2", margin.top + plotHeight);
    svg.append("line").attr("class", "free-axis").attr("x1", margin.left).attr("x2", margin.left + plotWidth).attr("y1", margin.top + plotHeight).attr("y2", margin.top + plotHeight);
    svg.append("text").attr("class", "free-axis-label").attr("x", margin.left + plotWidth).attr("y", height - 7).attr("text-anchor", "end").text("tamaño de entrada n →");
    svg.append("text").attr("class", "free-axis-label").attr("x", 8).attr("y", 13).text(type === "time" ? "operaciones" : "memoria");

    const line = d3.line().x((value) => x(value)).y((value, index, values) => y(values.profile.cost(value))).curve(d3.curveMonotoneX);
    profiles.forEach((profile) => {
      const values = [...samples];
      values.profile = profile;
      svg.append("path").datum(values).attr("class", `free-curve is-${profile.scenario}`).attr("d", line);
      const labelY = y(profile.cost(10));
      svg.append("text").attr("class", `free-curve-label is-${profile.scenario}`).attr("x", margin.left + plotWidth + 7).attr("y", Math.max(12, Math.min(height - 28, labelY + 3))).text(profile.notation);
    });

    const probeX = x(state.freeInput);
    svg.append("line").attr("class", "free-probe-line").attr("x1", probeX).attr("x2", probeX).attr("y1", margin.top).attr("y2", margin.top + plotHeight);
    profiles.forEach((profile) => {
      svg.append("circle").attr("class", `free-probe-point is-${profile.scenario}`).attr("cx", probeX).attr("cy", y(profile.cost(state.freeInput))).attr("r", 5).attr("fill", profile.color);
    });
  }

  function renderFreeComplexityCharts() {
    if (state.mode !== "free") return;
    elements.freeAnalysisView.dataset.scenario = state.freeScenario;
    elements.freeInputValue.textContent = Number(state.freeInput).toFixed(1);
    renderFreeChart(elements.freeTimeChart, "time");
    renderFreeChart(elements.freeSpaceChart, "space");
    const n = Number(state.freeInput);
    elements.freeProbeSummary.textContent = `En n=${n.toFixed(1)}: tiempo relativo ${n.toFixed(1)} / ${(n * Math.log2(n + 1)).toFixed(1)} / ${(n * n).toFixed(1)}; espacio 1.0 / ${Math.log2(n + 1).toFixed(1)} / ${n.toFixed(1)}.`;
  }

  function initMonaco() {
    let completed = false;
    const showFallback = () => {
      if (completed) return;
      completed = true;
      elements.editorLoading.hidden = true;
      elements.monacoHost.style.display = "none";
      elements.fallbackEditor.style.display = "block";
    };

    const timeout = window.setTimeout(showFallback, 7000);
    if (!window.require) {
      showFallback();
      return;
    }
    window.require.config({ paths: { vs: "./public/vendor/monaco/vs" } });
    window.require(["vs/editor/editor.main"], () => {
      if (completed) return;
      completed = true;
      window.clearTimeout(timeout);
      const defineEditorTheme = () => {
        const light = document.documentElement.dataset.theme === "light";
        window.monaco.editor.defineTheme("algorithmLab", {
        base: light ? "vs" : "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "7f8b98" }, { token: "keyword", foreground: "ff7b72" },
          { token: "number", foreground: "79c0ff" }, { token: "string", foreground: "a5d6ff" },
          { token: "type", foreground: "d2a8ff" }
        ],
        colors: {
          "editor.background": light ? "#ffffff" : "#0f141a", "editor.foreground": light ? "#172033" : "#d7dde5", "editorLineNumber.foreground": light ? "#65738a" : "#8c96a1",
          "editorLineNumber.activeForeground": light ? "#43516a" : "#b1bac4", "editor.selectionBackground": light ? "#cfe5ff" : "#264f78", "editor.lineHighlightBackground": light ? "#f0f6ff" : "#141b23",
          "editorGutter.background": light ? "#ffffff" : "#0f141a", "scrollbarSlider.background": light ? "#aebdce99" : "#30363d99", "scrollbarSlider.hoverBackground": light ? "#8799adbb" : "#484f58bb"
        }
      });
      };
      defineEditorTheme();
      state.editor = window.monaco.editor.create(elements.monacoHost, {
        value: state.codeReference.code,
        language: state.codeReference.monacoLanguage,
        theme: "algorithmLab",
        readOnly: true,
        automaticLayout: true,
        minimap: { enabled: false },
        fontFamily: "Cascadia Code, SFMono-Regular, Consolas, monospace",
        fontSize: state.codeZoomSize,
        lineHeight: Math.max(11, Math.round(state.codeZoomSize * 1.45)),
        lineNumbersMinChars: 3,
        padding: { top: 10, bottom: 10 },
        scrollBeyondLastLine: false,
        renderLineHighlight: "all",
        overviewRulerBorder: false,
        scrollbar: { verticalScrollbarSize: 9, horizontalScrollbarSize: 9 },
        wordWrap: "on",
        mouseWheelZoom: true
      });
      state.editor.onDidChangeModelContent(() => {
        const code = state.editor.getValue();
        updateCodeStats(code);
        if (state.mode === "free") {
          state.freeCodeByLanguage[state.languageId] = code;
          elements.freeAnalysisStatus.textContent = "Cambios pendientes";
        }
      });
      elements.editorLoading.hidden = true;
      if (state.codeZoomMode === "fit") fitCodeToViewport();
      highlightCodeLine();
      document.addEventListener("algoinspect:themechange", () => {
        defineEditorTheme();
        window.monaco.editor.setTheme("algorithmLab");
      });
    }, showFallback);
  }

  function initResize() {
    const storageKey = "algorithmAnalysis.visualizer.splitRatio";
    const defaultRatio = 0.43;
    let ratio = defaultRatio;
    let resizing = false;
    try {
      const stored = Number(window.localStorage.getItem(storageKey));
      if (Number.isFinite(stored) && stored > 0 && stored < 1) ratio = stored;
    } catch { /* The current session can still resize. */ }

    function metrics() {
      const rect = elements.workspace.getBoundingClientRect();
      const styles = window.getComputedStyle(elements.workspace);
      const divider = elements.resizer.getBoundingClientRect().width || 18;
      const paddingLeft = Number.parseFloat(styles.paddingLeft);
      const available = Math.max(1, rect.width - paddingLeft - Number.parseFloat(styles.paddingRight) - divider);
      const minSource = Number.parseFloat(styles.getPropertyValue("--lab-source-min")) || 450;
      const minVisual = Number.parseFloat(styles.getPropertyValue("--lab-visual-min")) || 560;
      return { rect, contentLeft: rect.left + paddingLeft, available, minSource, maxSource: Math.max(minSource, available - minVisual) };
    }

    function setWidth(requested, persist = false) {
      if (window.getComputedStyle(elements.resizer).display === "none") return;
      const { available, minSource, maxSource } = metrics();
      const width = Math.max(minSource, Math.min(maxSource, requested));
      ratio = width / available;
      elements.workspace.style.setProperty("--lab-source-column", `${width}px`);
      const percent = Math.round(ratio * 100);
      elements.resizer.setAttribute("aria-valuemin", String(Math.round(minSource / available * 100)));
      elements.resizer.setAttribute("aria-valuemax", String(Math.round(maxSource / available * 100)));
      elements.resizer.setAttribute("aria-valuenow", String(percent));
      elements.resizer.setAttribute("aria-valuetext", `${percent}% editor, ${100 - percent}% visualización`);
      if (persist) {
        try { window.localStorage.setItem(storageKey, ratio.toFixed(4)); } catch { /* no-op */ }
      }
      if (state.cytoscape) state.cytoscape.resize().fit(undefined, 34);
      applyDiagramView();
    }

    function applyRatio() {
      if (window.getComputedStyle(elements.resizer).display === "none") return;
      const { available } = metrics();
      setWidth(available * ratio);
    }

    function finish(event) {
      if (!resizing) return;
      resizing = false;
      document.body.classList.remove("is-lab-resizing");
      if (event && elements.resizer.hasPointerCapture(event.pointerId)) elements.resizer.releasePointerCapture(event.pointerId);
      setWidth(elements.sourcePanel.getBoundingClientRect().width, true);
      announce(elements.resizer.getAttribute("aria-valuetext"));
    }

    elements.resizer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      resizing = true;
      elements.resizer.setPointerCapture(event.pointerId);
      document.body.classList.add("is-lab-resizing");
      event.preventDefault();
    });
    elements.resizer.addEventListener("pointermove", (event) => {
      if (!resizing) return;
      const { contentLeft } = metrics();
      setWidth(event.clientX - contentLeft);
    });
    elements.resizer.addEventListener("pointerup", finish);
    elements.resizer.addEventListener("pointercancel", finish);
    elements.resizer.addEventListener("dblclick", () => {
      ratio = defaultRatio;
      applyRatio();
      setWidth(elements.sourcePanel.getBoundingClientRect().width, true);
      announce("Distribución restablecida a 43% y 57%.");
    });
    elements.resizer.addEventListener("keydown", (event) => {
      const { minSource, maxSource } = metrics();
      const step = event.shiftKey ? 64 : 24;
      let width = elements.sourcePanel.getBoundingClientRect().width;
      if (event.key === "ArrowLeft") width -= step;
      else if (event.key === "ArrowRight") width += step;
      else if (event.key === "Home") width = minSource;
      else if (event.key === "End") width = maxSource;
      else return;
      event.preventDefault();
      setWidth(width, true);
      announce(elements.resizer.getAttribute("aria-valuetext"));
    });
    new ResizeObserver(applyRatio).observe(elements.workspace);
    applyRatio();
  }

  function initStageResize() {
    const storageKey = "algorithmAnalysis.visualizer.stageRatio";
    const defaultRatio = 0.62;
    const minStageHeight = 200;
    const minDockHeight = 232;
    let ratio = defaultRatio;
    let resizing = false;
    let startY = 0;
    let startHeight = 0;

    try {
      const stored = Number(window.localStorage.getItem(storageKey));
      if (Number.isFinite(stored) && stored > 0 && stored < 1) ratio = stored;
    } catch { /* The current session can still resize. */ }

    function enabled() {
      return !elements.knownVisualization.hidden && window.getComputedStyle(elements.stageResizer).display !== "none";
    }

    function metrics() {
      const totalHeight = elements.knownVisualization.getBoundingClientRect().height;
      const fixedHeight = elements.visualHeader.getBoundingClientRect().height
        + elements.visualOptions.getBoundingClientRect().height
        + elements.stageResizer.getBoundingClientRect().height
        + elements.playerPanel.getBoundingClientRect().height;
      const available = Math.max(1, totalHeight - fixedHeight);
      const minimum = Math.min(minStageHeight, available);
      const maximum = Math.max(minimum, available - minDockHeight);
      return { available, minimum, maximum };
    }

    function setHeight(requested, persist = false) {
      if (!enabled()) return;
      const { available, minimum, maximum } = metrics();
      const height = Math.max(minimum, Math.min(maximum, requested));
      const dockHeight = Math.max(0, available - height);
      ratio = height / available;
      elements.knownVisualization.style.setProperty("--visual-stage-row", `${height}px`);
      elements.stageResizer.setAttribute("aria-valuemin", String(Math.round(minimum)));
      elements.stageResizer.setAttribute("aria-valuemax", String(Math.round(maximum)));
      elements.stageResizer.setAttribute("aria-valuenow", String(Math.round(height)));
      elements.stageResizer.setAttribute("aria-valuetext", `Diagrama ${Math.round(height)} píxeles; ejecución ${Math.round(dockHeight)} píxeles`);
      if (persist) {
        try { window.localStorage.setItem(storageKey, ratio.toFixed(4)); } catch { /* no-op */ }
      }
      if (state.cytoscape) state.cytoscape.resize().fit(undefined, 34);
      applyDiagramView();
    }

    function applyRatio() {
      if (!enabled()) return;
      const { available } = metrics();
      setHeight(available * ratio);
    }

    function finish(event) {
      if (!resizing) return;
      resizing = false;
      document.body.classList.remove("is-stage-resizing");
      if (event && elements.stageResizer.hasPointerCapture(event.pointerId)) elements.stageResizer.releasePointerCapture(event.pointerId);
      setHeight(elements.stage.getBoundingClientRect().height, true);
      announce(elements.stageResizer.getAttribute("aria-valuetext"));
    }

    elements.stageResizer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !enabled()) return;
      resizing = true;
      startY = event.clientY;
      startHeight = elements.stage.getBoundingClientRect().height;
      elements.stageResizer.setPointerCapture(event.pointerId);
      document.body.classList.add("is-stage-resizing");
      event.preventDefault();
    });
    elements.stageResizer.addEventListener("pointermove", (event) => {
      if (!resizing) return;
      setHeight(startHeight + event.clientY - startY);
    });
    elements.stageResizer.addEventListener("pointerup", finish);
    elements.stageResizer.addEventListener("pointercancel", finish);
    elements.stageResizer.addEventListener("dblclick", () => {
      ratio = defaultRatio;
      applyRatio();
      setHeight(elements.stage.getBoundingClientRect().height, true);
      announce("Altura del diagrama restablecida.");
    });
    elements.stageResizer.addEventListener("keydown", (event) => {
      const { minimum, maximum } = metrics();
      const step = event.shiftKey ? 48 : 20;
      let height = elements.stage.getBoundingClientRect().height;
      if (event.key === "ArrowUp") height -= step;
      else if (event.key === "ArrowDown") height += step;
      else if (event.key === "Home") height = minimum;
      else if (event.key === "End") height = maximum;
      else return;
      event.preventDefault();
      setHeight(height, true);
      announce(elements.stageResizer.getAttribute("aria-valuetext"));
    });
    new ResizeObserver(applyRatio).observe(elements.knownVisualization);
    applyRatio();
  }

  elements.catalog.addEventListener("click", (event) => {
    const button = event.target.closest("[data-algorithm]");
    if (!button) return;
    selectAlgorithm(button.dataset.algorithm);
  });

  elements.catalog.addEventListener("pointermove", (event) => {
    const button = event.target.closest("[data-algorithm]");
    if (!button) return;
    state.menuIndex = menuOptions().indexOf(button);
    updateMenuActiveOption();
  });

  elements.freeCodeOption.addEventListener("click", () => switchToFreeMode(state.query.trim()));

  elements.search.addEventListener("focus", () => {
    elements.search.select();
    openAlgorithmMenu("");
  });

  elements.search.addEventListener("input", () => {
    state.query = elements.search.value;
    if (!state.menuOpen) openAlgorithmMenu(state.query);
    else renderCatalog();
  });

  elements.search.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!state.menuOpen) openAlgorithmMenu("");
      moveMenuSelection(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter" && state.menuOpen) {
      event.preventDefault();
      activateMenuSelection();
    } else if (event.key === "Escape" && state.menuOpen) {
      event.preventDefault();
      event.stopPropagation();
      closeAlgorithmMenu();
    } else if (event.key === "Tab") {
      closeAlgorithmMenu();
    }
  });

  elements.language.addEventListener("change", () => {
    if (state.mode === "free" && state.editor) state.freeCodeByLanguage[state.languageId] = state.editor.getValue();
    state.languageId = elements.language.value;
    updateCodeReference({ resetFree: state.mode === "free" && state.freeCodeByLanguage[state.languageId] === undefined });
    if (state.mode === "known") renderExecutionSteps();
    const languageLabel = languageDefinition().label;
    updateCanonicalUrl();
    announce(state.mode === "free" ? `Editor libre configurado para ${languageLabel}.` : `${selectedAlgorithm().name} mostrado con la implementación canónica ${languageLabel}.`);
  });

  elements.preset.addEventListener("change", () => {
    state.presetId = elements.preset.value;
    updateCanonicalUrl();
    rebuildTrace(true);
    window.dispatchEvent(new CustomEvent("algoinspect:scenario-changed", { detail: { scenarioId: state.presetId } }));
  });

  window.addEventListener("algoinspect:scenario-select", (event) => {
    const scenarioId = event.detail?.scenarioId;
    if (!scenarioId || state.mode !== "known" || !selectedAlgorithm().presets.some((preset) => preset.id === scenarioId)) return;
    state.presetId = scenarioId;
    elements.preset.value = scenarioId;
    updateCanonicalUrl();
    rebuildTrace(true);
    window.dispatchEvent(new CustomEvent("algoinspect:scenario-changed", { detail: { scenarioId } }));
    elements.preset.focus({ preventScroll: true });
    announce(`Escenario ${elements.preset.selectedOptions[0]?.textContent || scenarioId} seleccionado.`);
  });

  elements.restart.addEventListener("click", restartTrace);
  elements.restartTop.addEventListener("click", restartTrace);
  elements.previous.addEventListener("click", () => { stopPlayback(); goToStep(state.step - 1, true); });
  elements.next.addEventListener("click", () => { stopPlayback(); goToStep(state.step + 1, true); });
  elements.play.addEventListener("click", togglePlayback);
  elements.timeline.addEventListener("input", () => { stopPlayback(); goToStep(elements.timeline.value); });
  elements.timeline.addEventListener("change", () => announce(`${elements.counter.textContent}: ${state.trace[state.step].title}.`));
  elements.speed.addEventListener("change", () => {
    if (state.playing) {
      window.clearTimeout(state.timer);
      schedulePlayback();
    }
  });

  elements.executionSteps.addEventListener("click", (event) => {
    const button = event.target.closest("[data-execution-step]");
    if (!button) return;
    activateExecutionStep(Number(button.dataset.executionStep));
  });

  elements.executionSteps.addEventListener("keydown", (event) => {
    const button = event.target.closest("[data-execution-step]");
    if (!button) return;
    const current = Number(button.dataset.executionStep);
    let target = null;
    if (["ArrowDown", "ArrowRight"].includes(event.key)) target = current + 1;
    else if (["ArrowUp", "ArrowLeft"].includes(event.key)) target = current - 1;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = state.trace.length - 1;
    if (target === null) return;
    event.preventDefault();
    activateExecutionStep(target, true);
  });

  elements.executionSteps.addEventListener("wheel", stopPlayback, { passive: true });
  elements.executionSteps.addEventListener("touchstart", stopPlayback, { passive: true });

  [elements.timeCell, elements.spaceCell].forEach((cell) => {
    const kind = cell.dataset.complexityKind;
    cell.addEventListener("pointerenter", () => showComplexityPopover(kind));
    cell.addEventListener("pointerleave", () => hideComplexityPopover(140));
    cell.addEventListener("focus", () => showComplexityPopover(kind));
    cell.addEventListener("blur", () => hideComplexityPopover(100));
    cell.addEventListener("click", () => showComplexityPopover(kind));
    cell.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        showComplexityPopover(kind);
        window.requestAnimationFrame(() => elements.complexityCases.querySelector('[aria-pressed="true"]')?.focus());
      } else if (event.key === "Escape") {
        event.preventDefault();
        hideComplexityPopover();
        cell.focus();
      }
    });
  });

  elements.complexityPopover.addEventListener("pointerenter", () => window.clearTimeout(state.complexityHideTimer));
  elements.complexityPopover.addEventListener("pointerleave", () => hideComplexityPopover(120));
  elements.complexityPopover.addEventListener("focusin", () => window.clearTimeout(state.complexityHideTimer));
  elements.complexityPopover.addEventListener("focusout", (event) => {
    if (!event.relatedTarget?.closest?.(".complexity-badges")) hideComplexityPopover(100);
  });
  elements.complexityPopover.addEventListener("keydown", (event) => {
    const caseButton = event.target.closest?.("[data-complexity-case]");
    if (caseButton && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      const buttons = [...elements.complexityCases.querySelectorAll("[data-complexity-case]")];
      const direction = event.key === "ArrowRight" ? 1 : -1;
      buttons[(buttons.indexOf(caseButton) + direction + buttons.length) % buttons.length].focus();
      return;
    }
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    const trigger = state.complexityKind === "space" ? elements.spaceCell : elements.timeCell;
    trigger.focus();
    hideComplexityPopover();
  });

  function activateComplexityCase(event) {
    const button = event.target.closest("[data-complexity-case]");
    if (!button || !state.complexityKind || button.dataset.complexityCase === state.complexityScenario) return;
    const scenario = button.dataset.complexityCase;
    const restoreFocus = event.type === "focusin";
    showComplexityPopover(state.complexityKind, scenario);
    if (restoreFocus) window.requestAnimationFrame(() => elements.complexityCases.querySelector(`[data-complexity-case="${scenario}"]`)?.focus());
  }

  elements.complexityCases.addEventListener("pointerover", activateComplexityCase);
  elements.complexityCases.addEventListener("focusin", activateComplexityCase);
  elements.complexityCases.addEventListener("click", activateComplexityCase);

  elements.freeAnalysisView.querySelectorAll("[data-free-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      state.freeScenario = button.dataset.freeScenario;
      elements.freeAnalysisView.querySelectorAll("[data-free-scenario]").forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle("is-active", active);
        candidate.setAttribute("aria-pressed", String(active));
      });
      renderFreeComplexityCharts();
    });
  });

  elements.freeInputSize.addEventListener("input", () => {
    state.freeInput = Number(elements.freeInputSize.value);
    renderFreeComplexityCharts();
  });

  elements.analyzeFree.addEventListener("click", () => {
    elements.analyzeFree.disabled = true;
    elements.freeAnalysisStatus.textContent = "Simulando…";
    elements.analyzeFree.querySelector("span").textContent = "Analizando…";
    window.setTimeout(() => {
      elements.analyzeFree.disabled = false;
      elements.freeAnalysisStatus.textContent = "Resultado ilustrativo";
      elements.analyzeFree.querySelector("span").textContent = "Repetir simulación";
      renderFreeComplexityCharts();
      showToast("Se actualizaron las curvas ilustrativas; todavía no se infieren del código.");
      announce("Simulación completada. Las clasificaciones no provienen aún de un analizador real.");
    }, 650);
  });

  elements.fallbackEditor.addEventListener("input", () => {
    updateCodeStats(elements.fallbackEditor.value);
    if (state.mode === "free") {
      state.freeCodeByLanguage[state.languageId] = elements.fallbackEditor.value;
      elements.freeAnalysisStatus.textContent = "Cambios pendientes";
    }
  });

  elements.editorFrame.addEventListener("wheel", (event) => {
    if (!(event.ctrlKey || event.metaKey) || (state.editor && !elements.fallbackEditor.contains(event.target))) return;
    event.preventDefault();
    applyCodeZoom(state.codeZoomSize + (event.deltaY < 0 ? 0.5 : -0.5));
  }, { passive: false });

  document.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.key !== "0" || !elements.editorFrame.contains(document.activeElement)) return;
    event.preventDefault();
    fitCodeToViewport();
  });

  elements.zoomOut.addEventListener("click", () => setDiagramScale(Math.round((state.diagramScale - 0.25) * 4) / 4, { x: 0, y: 0 }, true));
  elements.zoomIn.addEventListener("click", () => setDiagramScale(Math.round((state.diagramScale + 0.25) * 4) / 4, { x: 0, y: 0 }, true));
  elements.zoomFit.addEventListener("click", () => resetDiagramView(true));

  elements.stage.addEventListener("wheel", (event) => {
    if (event.target.closest?.(".diagram-zoom-controls")) return;
    event.preventDefault();
    const origin = diagramPoint(event.clientX, event.clientY);
    const factor = Math.exp(-event.deltaY * 0.0014);
    setDiagramScale(state.diagramScale * factor, origin);
  }, { passive: false });

  elements.stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest?.(".diagram-zoom-controls") || (event.pointerType === "mouse" && event.button !== 0)) return;
    const point = diagramPoint(event.clientX, event.clientY);
    diagramPointers.set(event.pointerId, point);
    elements.stage.setPointerCapture(event.pointerId);
    elements.stage.classList.add("is-panning");
    elements.stage.focus({ preventScroll: true });
    if (diagramPointers.size >= 2) startDiagramPinch();
    else beginDiagramPan({ id: event.pointerId, ...point });
    event.preventDefault();
  });

  elements.stage.addEventListener("pointermove", (event) => {
    if (!diagramPointers.has(event.pointerId)) return;
    const point = diagramPoint(event.clientX, event.clientY);
    diagramPointers.set(event.pointerId, point);
    if (diagramPointers.size >= 2) {
      if (diagramGesture?.type !== "pinch") startDiagramPinch();
      const points = [...diagramPointers.values()].slice(0, 2);
      const midpoint = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
      const distance = Math.max(1, Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y));
      state.diagramScale = diagramGesture.scale * distance / diagramGesture.distance;
      state.diagramPanX = midpoint.x - diagramGesture.contentX * state.diagramScale;
      state.diagramPanY = midpoint.y - diagramGesture.contentY * state.diagramScale;
      applyDiagramView();
    } else if (diagramGesture?.type === "pan" && diagramGesture.pointerId === event.pointerId) {
      state.diagramPanX = diagramGesture.panX + point.x - diagramGesture.x;
      state.diagramPanY = diagramGesture.panY + point.y - diagramGesture.y;
      applyDiagramView();
    }
    event.preventDefault();
  });

  elements.stage.addEventListener("pointerup", finishDiagramPointer);
  elements.stage.addEventListener("pointercancel", finishDiagramPointer);
  elements.stage.addEventListener("dblclick", (event) => {
    if (event.target.closest?.(".diagram-zoom-controls")) return;
    event.preventDefault();
    resetDiagramView(true);
  });

  elements.stage.addEventListener("keydown", (event) => {
    if (event.target.closest?.(".diagram-zoom-controls")) return;
    if (event.shiftKey && event.key === "ArrowLeft") { event.preventDefault(); state.diagramPanX -= 24; applyDiagramView(); announce("Diagrama desplazado a la izquierda."); }
    else if (event.shiftKey && event.key === "ArrowRight") { event.preventDefault(); state.diagramPanX += 24; applyDiagramView(); announce("Diagrama desplazado a la derecha."); }
    else if (event.shiftKey && event.key === "ArrowUp") { event.preventDefault(); state.diagramPanY -= 24; applyDiagramView(); announce("Diagrama desplazado hacia arriba."); }
    else if (event.shiftKey && event.key === "ArrowDown") { event.preventDefault(); state.diagramPanY += 24; applyDiagramView(); announce("Diagrama desplazado hacia abajo."); }
    else if (!event.ctrlKey && !event.metaKey && ["+", "="].includes(event.key)) { event.preventDefault(); setDiagramScale(state.diagramScale + 0.25, { x: 0, y: 0 }, true); }
    else if (!event.ctrlKey && !event.metaKey && ["-", "_"].includes(event.key)) { event.preventDefault(); setDiagramScale(state.diagramScale - 0.25, { x: 0, y: 0 }, true); }
    else if (!event.ctrlKey && !event.metaKey && event.key === "0") { event.preventDefault(); resetDiagramView(true); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); stopPlayback(); goToStep(state.step - 1, true); }
    else if (event.key === "ArrowRight") { event.preventDefault(); stopPlayback(); goToStep(state.step + 1, true); }
    else if (event.key === " " || event.key === "Enter") { event.preventDefault(); togglePlayback(); }
    else if (event.key === "Home") { event.preventDefault(); stopPlayback(); goToStep(0, true); }
    else if (event.key === "End") { event.preventDefault(); stopPlayback(); goToStep(state.trace.length - 1, true); }
  });

  elements.technologyButton.addEventListener("click", () => {
    const open = elements.technologyPopover.hidden;
    elements.technologyPopover.hidden = !open;
    elements.technologyButton.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (event) => {
    if (state.menuOpen && !event.target.closest(".algorithm-picker")) closeAlgorithmMenu();
    if (!elements.complexityPopover.hidden && !event.target.closest(".complexity-badges")) hideComplexityPopover();
    if (!elements.technologyPopover.hidden && !event.target.closest("#technologyPopover") && !event.target.closest("#technologyInfoButton")) {
      elements.technologyPopover.hidden = true;
      elements.technologyButton.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
      event.preventDefault();
      elements.search.focus();
      return;
    }
    if (event.key === "Escape") {
      if (state.menuOpen) {
        event.preventDefault();
        closeAlgorithmMenu();
        elements.search.focus();
        return;
      }
      stopPlayback();
      hideComplexityPopover();
      elements.technologyPopover.hidden = true;
      elements.technologyButton.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("resize", () => {
    if (state.cytoscape) state.cytoscape.resize().fit(undefined, 34);
    applyDiagramView();
    if (state.codeZoomMode === "fit") fitCodeToViewport();
    if (state.mode === "free") renderFreeComplexityCharts();
  });

  renderLanguageOptions();
  renderCatalog();
  renderPresetOptions();
  updateAlgorithmMeta();
  updateCodeReference();
  updateModePresentation();
  elements.search.value = selectedAlgorithm().name;
  updateCanonicalUrl();
  rebuildTrace();
  initMonaco();
  initResize();
  initStageResize();
})();
