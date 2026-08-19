const { test, expect } = require("@playwright/test");

async function openCanonicalLab(page, path = "/") {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(path, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.documentElement.dataset.catalogReady === "true");
  return pageErrors;
}

test("la API publica tres algoritmos bajo una sola versión canónica", async ({ request }) => {
  const catalogResponse = await request.get("/api/catalog", {
    headers: { "X-AlgoInspect-Schema-Version": "1.0" }
  });
  expect(catalogResponse.ok()).toBe(true);
  const catalog = await catalogResponse.json();
  expect(catalog.schemaVersion).toBe("1.0");
  expect(catalog.contentVersion).toBe("1.0.0");
  expect(catalog.algorithms).toHaveLength(3);
  for (const algorithmId of ["kahn", "binary-search", "bubble-sort"]) {
    expect(catalog.algorithms).toContainEqual(expect.objectContaining({
      id: algorithmId,
      contentVersion: "1.0.0",
      availableLanguages: ["csharp", "javascript", "typescript", "python"]
    }));
  }

  const scenariosResponse = await request.get("/api/algorithms/kahn/scenarios");
  expect(scenariosResponse.ok()).toBe(true);
  const scenarios = await scenariosResponse.json();
  expect(scenarios.contentVersion).toBe("1.0.0");
  expect(scenarios.scenarios).toHaveLength(11);
  expect(scenarios.scenarios.at(-1)).toEqual(expect.objectContaining({
    id: "unknown-vertex",
    expected: { status: "invalid", diagnostic: "unknown-vertex" }
  }));
});

test("código, README, pruebas y traza proceden de la API sin prototype", async ({ page }) => {
  const requested = [];
  page.on("request", (request) => requested.push(new URL(request.url()).pathname));
  const pageErrors = await openCanonicalLab(page);

  await expect(page).toHaveTitle(/Laboratorio visual de algoritmos/);
  await expect(page.locator("#selectedAlgorithmName")).toHaveText("Algoritmo de Kahn");
  await expect(page.locator("#languageSelect option")).toHaveCount(4);
  await expect(page.locator("#languageCoverage")).toHaveText("4 implementaciones canónicas");
  await expect(page.locator("#fallbackEditor")).toHaveValue(/public static class KahnAlgorithm/);
  await expect(page.locator("#sourceModeLabel")).toHaveText("Implementación canónica validada");

  await page.locator("#readmeTab").click();
  await expect(page.locator("#algorithmReadme h1")).toHaveText("Algoritmo de Kahn");
  await expect(page.locator("#algorithmReadme")).toContainText("A. B. Kahn");

  await page.locator("#testsTab").click();
  await expect(page.locator("#algorithmTests")).toContainText("API · v1.0.0");
  await expect(page.locator("#algorithmTests .tests-summary strong").first()).toHaveText("11");
  await expect(page.locator("#algorithmTests .tests-table tbody tr")).toHaveCount(11);
  await expect(page.locator("#algorithmTests")).toContainText("kahn-csharp");

  const canonical = await page.evaluate(() => ({
    id: window.AlgoInspectCanonical.algorithmId,
    version: window.AlgoInspectCanonical.contentVersion,
    scenarios: window.AlgoInspectCanonical.scenarios.length,
    algorithms: window.AlgorithmCatalog.algorithms.length,
    scriptSources: [...document.scripts].map((script) => script.src)
  }));
  expect(canonical).toEqual(expect.objectContaining({ id: "kahn", version: "1.0.0", scenarios: 11, algorithms: 3 }));
  expect(canonical.scriptSources.some((source) => source.includes("prototype-"))).toBe(false);
  expect(requested.some((path) => path.includes("prototype-"))).toBe(false);
  expect(requested).toEqual(expect.arrayContaining([
    "/api/catalog",
    "/api/algorithms/kahn",
    "/api/algorithms/kahn/scenarios",
    "/api/algorithms/kahn/implementations/csharp",
    "/api/algorithms/kahn/implementations/javascript",
    "/api/algorithms/kahn/implementations/typescript",
    "/api/algorithms/kahn/implementations/python"
  ]));
  expect(pageErrors).toEqual([]);
});

test("lenguaje, escenario, URL, código, pruebas y traza permanecen sincronizados", async ({ page }) => {
  const pageErrors = await openCanonicalLab(page, "/?algorithm=kahn&language=python&scenario=cycle");

  await expect(page.locator("#languageSelect")).toHaveValue("python");
  await expect(page.locator("#presetSelect")).toHaveValue("cycle");
  await expect(page.locator("#sourceFileName")).toHaveText("kahn.py");
  await expect(page.locator("#fallbackEditor")).toHaveValue(/def kahn\(graph: Graph\)/);

  await page.locator("#testsTab").click();
  await expect(page.locator("#algorithmTests")).toContainText("kahn-python");
  await expect(page.locator("#algorithmTests .test-code-block")).toContainText("def test_kahn_returns_expected_result");

  await page.locator("#timelineRange").evaluate((element) => {
    element.value = element.max;
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#stepTitle")).toHaveText("No existe un orden topológico");
  await expect(page.locator("#stepExplanation")).toContainText("4 de 6");
  await expect(page).toHaveURL(/algorithm=kahn/);
  await expect(page).toHaveURL(/language=python/);
  await expect(page).toHaveURL(/scenario=cycle/);

  await page.locator("#presetSelect").selectOption("unknown-vertex");
  await expect(page.locator("#stepTitle")).toHaveText("Entrada canónica inválida");
  await expect(page.locator("#stepExplanation")).toContainText("A → B");
  await expect(page).toHaveURL(/scenario=unknown-vertex/);
  expect(pageErrors).toEqual([]);
});

test("el modo claro se aplica, se anuncia y permanece al recargar", async ({ page }) => {
  const pageErrors = await openCanonicalLab(page);

  await expect(page.locator("#themeToggle")).toHaveAttribute("aria-label", "Activar modo claro");
  await page.locator("#themeToggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("#themeToggle")).toHaveAttribute("aria-label", "Activar modo oscuro");
  await expect(page.locator("#themeToggle")).toHaveAttribute("aria-pressed", "true");

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => document.documentElement.dataset.catalogReady === "true");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".player-panel")).toHaveCSS("background-color", "rgb(248, 250, 252)");
  await expect(page.locator("#executionDock")).toHaveCSS("background-color", "rgb(248, 250, 252)");
  await expect(page.locator(".brand-lockup-light")).toBeVisible();

  await page.locator("#readmeTab").click();
  await expect(page.locator(".readme-markdown-table th").first()).toHaveCSS("background-color", "rgb(237, 243, 249)");
  await expect(page.locator(".readme-markdown-table td").first()).toHaveCSS("color", "rgb(48, 64, 87)");
  await page.locator("#testsTab").click();
  await expect(page.locator(".test-code-block")).toHaveCSS("background-color", "rgb(248, 250, 252)");
  await expect(page.locator(".test-code-block")).toHaveCSS("color", "rgb(23, 32, 51)");

  await page.locator("#timeComplexityCell").click();
  await expect(page.locator("#complexityPopover")).toBeVisible();
  await expect(page.locator("#complexityPopover")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator("#complexityMiniChart")).toHaveCSS("background-color", "rgb(248, 250, 252)");
  await page.locator("#timeComplexityCell").click();
  await page.locator("#algorithmSearch").click();
  await expect(page.locator("#algorithmMenu")).toBeVisible();
  await expect(page.locator("#algorithmMenu")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator(".catalog-group-heading").first()).toHaveCSS("background-color", "rgb(238, 243, 248)");
  await page.keyboard.press("Escape");

  await page.locator("#themeToggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".brand-lockup-dark")).toBeVisible();
  await expect(page.locator(".brand-lockup-light")).toBeHidden();
  expect(pageErrors).toEqual([]);
});

test("el buscador presenta las tres verticales publicadas", async ({ page }) => {
  const pageErrors = await openCanonicalLab(page);
  await page.locator("#algorithmSearch").focus();
  await page.locator("#algorithmSearch").fill("bubble");
  await expect(page.getByRole("option", { name: /Ordenamiento burbuja/ })).toHaveCount(1);
  await page.locator("#algorithmSearch").fill("kahn");
  await expect(page.getByRole("option", { name: /Algoritmo de Kahn/ })).toHaveCount(1);
  expect(pageErrors).toEqual([]);
});

test("Binary Search sincroniza código, README, pruebas y traza canónicos", async ({ page }) => {
  const pageErrors = await openCanonicalLab(page, "/?algorithm=binary-search&language=javascript&scenario=duplicates");
  await expect(page.locator("#selectedAlgorithmName")).toHaveText("Búsqueda binaria");
  await expect(page.locator("#sourceFileName")).toHaveText("binary-search.js");
  await expect(page.locator("#fallbackEditor")).toHaveValue(/function binarySearch/);
  await page.locator("#readmeTab").click();
  await expect(page.locator("#algorithmReadme h1")).toHaveText("Búsqueda binaria");
  await page.locator("#testsTab").click();
  await expect(page.locator("#algorithmTests .tests-table tbody tr")).toHaveCount(11);
  await expect(page.locator("#algorithmTests")).toContainText("binary-search-javascript");
  await page.locator('[data-scenario-id="middle"]').click();
  await expect(page.locator("#presetSelect")).toHaveValue("middle");
  await expect(page.locator('[data-scenario-id="middle"]')).toHaveClass(/is-selected/);
  await expect(page).toHaveURL(/scenario=middle/);
  await page.locator("#timelineRange").evaluate((element) => {
    element.value = element.max;
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#stepTitle")).toHaveText("Objetivo encontrado");
  await expect(page.locator("#stepExplanation")).toContainText("índice 2");
  await page.locator("#codeTab").click();
  await expect(page.locator("#codeZoomControls")).toHaveCount(0);
  await page.locator("#monacoEditor").hover();
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -120);
  await page.keyboard.up("Control");
  expect(pageErrors).toEqual([]);
});

test("Bubble Sort demuestra terminación temprana desde escenarios canónicos", async ({ page }) => {
  const pageErrors = await openCanonicalLab(page, "/?algorithm=bubble-sort&language=python&scenario=sorted");
  await expect(page.locator("#selectedAlgorithmName")).toHaveText("Ordenamiento burbuja");
  await expect(page.locator("#sourceFileName")).toHaveText("bubble_sort.py");
  await expect(page.locator("#fallbackEditor")).toHaveValue(/def bubble_sort/);
  await page.locator("#testsTab").click();
  await expect(page.locator("#algorithmTests .tests-table tbody tr")).toHaveCount(11);
  await expect(page.locator("#algorithmTests")).toContainText("bubble-sort-python");
  await page.locator("#timelineRange").evaluate((element) => {
    element.value = Math.max(0, Number(element.max) - 1);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#stepTitle")).toHaveText("Terminar anticipadamente");
  expect(pageErrors).toEqual([]);
});

test("el menú accesible mueve documentos a las tres zonas sin arrastre", async ({ page }) => {
  const pageErrors = await openCanonicalLab(page);
  await page.locator('[data-tab-actions="code"]').click();
  await page.getByRole("menuitem", { name: /Mover arriba a la derecha/ }).click();
  await expect(page.locator("#documentSplit")).toHaveClass(/is-triple/);
  await expect(page.locator("#codeTabPanel")).toHaveCSS("grid-area", "top-right");

  await page.locator('[data-tab-actions="tests"]').click();
  await page.getByRole("menuitem", { name: /Mover abajo/ }).click();
  await expect(page.locator("#testsTabPanel")).toHaveCSS("grid-area", "bottom");

  await page.locator('[data-tab-actions="readme"]').click();
  await page.getByRole("menuitem", { name: /Mover arriba a la izquierda/ }).click();
  await expect(page.locator("#readmeTabPanel")).toHaveCSS("grid-area", "top-left");

  await page.locator("#readmeTab").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#codeTab")).toBeFocused();
  expect(pageErrors).toEqual([]);
});

test("la vertical permanece utilizable en pantalla estrecha", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const pageErrors = await openCanonicalLab(page);
  await page.locator("#readmeTab").click();
  await expect(page.locator("#algorithmReadme h1")).toHaveText("Algoritmo de Kahn");
  const geometry = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    readable: document.querySelector("#readmeTabPanel").clientWidth >= 300,
    reducedMotionDeclared: [...document.styleSheets].some((sheet) => {
      try { return [...sheet.cssRules].some((rule) => rule.media?.mediaText?.includes("prefers-reduced-motion")); } catch { return false; }
    })
  }));
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  expect(geometry.readable).toBe(true);
  expect(geometry.reducedMotionDeclared).toBe(true);
  expect(pageErrors).toEqual([]);
});

test("un catálogo inconsistente muestra recuperación explícita y permite reintentar", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/catalog", async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({
        status: 503,
        contentType: "application/problem+json",
        body: JSON.stringify({ code: "catalog-inconsistent", detail: "Contenido inválido" })
      });
    } else {
      await route.continue();
    }
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#catalogBootstrapError")).toBeVisible();
  await expect(page.locator("#catalogBootstrapErrorTitle")).toHaveText("Catálogo temporalmente inválido");
  await expect(page.locator("#catalogBootstrapError")).toBeFocused();
  await page.locator("#catalogBootstrapRetry").click();
  await page.waitForFunction(() => document.documentElement.dataset.catalogReady === "true");
  await expect(page.locator("#catalogBootstrapError")).toBeHidden();
  await expect(page.locator("#selectedAlgorithmName")).toHaveText("Algoritmo de Kahn");
});

test("una versión incompatible se distingue de un fallo recuperable", async ({ page }) => {
  await page.route("**/api/algorithms/kahn", (route) => route.fulfill({
    status: 409,
    contentType: "application/problem+json",
    body: JSON.stringify({ code: "schema-version-incompatible", detail: "Versión incompatible" })
  }));
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#catalogBootstrapErrorTitle")).toHaveText("Contrato incompatible");
  await expect(page.locator("#catalogBootstrapRetry")).toBeHidden();
});
