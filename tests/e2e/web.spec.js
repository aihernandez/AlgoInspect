const { test, expect } = require("@playwright/test");

const url = process.env.WEB_URL || "http://127.0.0.1:4398/apps/web/index.html";

async function chooseAlgorithm(page, query, name) {
  await page.locator("#algorithmSearch").focus();
  await page.locator("#algorithmSearch").fill(query);
  await expect(page.locator("#algorithmMenu")).toBeVisible();
  await page.getByRole("option", { name }).click();
}

test("código y README comparten algoritmo sin alterar el visualizador", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(url, { waitUntil: "networkidle" });

  await expect(page).toHaveTitle(/Laboratorio visual de algoritmos/);
  await expect(page.locator("#editorTabList [role=tab]")).toHaveCount(3);
  await expect(page.locator("#codeTab")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#codeTabPanel")).toBeVisible();
  await expect(page.locator("#readmeTabPanel")).toBeHidden();
  await expect(page.locator("#stageCanvas svg")).toBeVisible();

  const coverage = await page.evaluate(() => {
    const ids = window.AlgorithmCatalog.algorithms.map((algorithm) => algorithm.id);
    const entries = window.AlgorithmReadmeContent.entries;
    return {
      catalog: ids.length,
      readmes: Object.keys(entries).length,
      missing: ids.filter((id) => !entries[id]),
      incomplete: ids.filter((id) => {
        const item = entries[id];
        return !item?.principle || !item?.history?.paragraphs?.length || !item?.mechanics?.length || !item?.useWhen?.length || !item?.avoidWhen?.length || !item?.references?.length;
      })
    };
  });
  expect(coverage).toEqual({ catalog: 21, readmes: 21, missing: [], incomplete: [] });

  await page.locator("#readmeTab").click();
  await expect(page.locator("#readmeTab")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#readmeTabPanel")).toBeVisible();
  await expect(page.locator("#codeTabPanel")).toBeHidden();
  await expect(page.locator("#algorithmReadme h2")).toHaveText("Búsqueda binaria");
  await expect(page.locator("#algorithmReadme")).toContainText("Una idea histórica, no un inventor único");
  await expect(page.locator(".readme-complexity tbody tr")).toHaveCount(3);
  await expect(page.locator(".readme-reference-list li")).toHaveCount(2);
  await expect(page.locator("#visualTitle")).toHaveText("Búsqueda binaria");

  await page.locator("#languageSelect").selectOption("python");
  await expect(page.locator("#codeTabFileName")).toHaveText(/\.py$/);
  await expect(page.locator("#algorithmReadme h2")).toHaveText("Búsqueda binaria");

  await chooseAlgorithm(page, "quick", /^Quick Sort/);
  await expect(page.locator("#readmeTabPanel")).toBeVisible();
  await expect(page.locator("#algorithmReadme h2")).toHaveText("Quick Sort");
  await expect(page.locator("#algorithmReadme")).toContainText("C. A. R. Hoare");
  await expect(page.locator(".readme-complexity tbody tr").nth(2)).toContainText("O(n²)");
  await expect(page.locator("#visualTitle")).toHaveText("Quick Sort");

  await page.locator("#readmeTab").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#codeTab")).toBeFocused();
  await expect(page.locator("#codeTabPanel")).toBeVisible();
  await expect(page.locator("#sourceFileName")).toHaveText(/\.py$/);
  await expect(page.locator("#stageCanvas svg")).toBeVisible();

  await page.locator("#codeTab").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#readmeTab")).toBeFocused();
  await expect(page.locator("#algorithmReadme h2")).toHaveText("Quick Sort");

  await page.locator("#algorithmSearch").focus();
  await page.locator("#algorithmSearch").fill("algoritmo propio");
  await page.keyboard.press("Enter");
  await expect(page.locator("#freeAnalysisView")).toBeVisible();
  await expect(page.locator("#algorithmReadme")).toContainText("README no disponible para código libre");

  const layout = await page.evaluate(() => {
    const source = document.querySelector("#sourcePanel").getBoundingClientRect();
    const visual = document.querySelector("#visualizationPanel").getBoundingClientRect();
    const panel = document.querySelector("#readmeTabPanel");
    return {
      sideBySide: source.right <= visual.left,
      readmeScrollable: panel.scrollHeight > panel.clientHeight,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  expect(layout.sideBySide).toBe(true);
  expect(layout.readmeScrollable).toBe(false);
  expect(layout.overflow).toBeLessThanOrEqual(1);
  expect(pageErrors).toEqual([]);
});

test("el README conserva dos pestañas y scroll interno en móvil", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: "networkidle" });

  await expect(page.locator("#editorTabList [role=tab]")).toHaveCount(3);
  await page.locator("#readmeTab").click();
  await expect(page.locator("#algorithmReadme h2")).toHaveText("Búsqueda binaria");
  const mobile = await page.evaluate(() => {
    const tabs = [...document.querySelectorAll("#editorTabList [role=tab]")].map((element) => element.getBoundingClientRect());
    const panel = document.querySelector("#readmeTabPanel");
    return {
      equalTabs: Math.abs(tabs[0].width - tabs[1].width) < 2,
      panelScrolls: panel.scrollHeight > panel.clientHeight,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  expect(mobile.equalTabs).toBe(true);
  expect(mobile.panelScrolls).toBe(true);
  expect(mobile.pageOverflow).toBeLessThanOrEqual(1);
  expect(pageErrors).toEqual([]);
});

test("los tabs se reordenan, dividen el panel y permiten cambiar la proporción", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(url, { waitUntil: "networkidle" });

  const splitBox = await page.locator("#documentSplit").boundingBox();
  await page.locator("#readmeTab").dragTo(page.locator("#documentSplit"), {
    targetPosition: { x: splitBox.width / 2, y: splitBox.height * 0.22 }
  });

  await expect(page.locator("#documentSplit")).toHaveClass(/is-split/);
  await expect(page.locator("#documentSplitResizer")).toBeVisible();
  await expect(page.locator("#mergeDocumentsButton")).toBeVisible();
  await expect(page.locator("#codeTabPanel")).toBeVisible();
  await expect(page.locator("#readmeTabPanel")).toBeVisible();
  await expect(page.locator("#documentSplit > :first-child")).toHaveId("readmeTabPanel");
  await expect(page.locator("#algorithmReadme h2")).toHaveText("Búsqueda binaria");
  const editorGeometry = await page.evaluate(() => {
    const frame = document.querySelector("#codeTabPanel .editor-frame");
    const editor = document.querySelector("#monacoEditor");
    return { frame: frame.clientHeight, editor: editor.clientHeight };
  });
  expect(editorGeometry.editor).toBeLessThanOrEqual(editorGeometry.frame + 1);
  const codeScroll = page.locator("#codeTabPanel .monaco-scrollable-element.editor-scrollable");
  const scrollTopBefore = await page.evaluate(() => window.monaco?.editor?.getEditors?.()[0]?.getScrollTop?.() || 0);
  const editorFrame = await page.locator("#codeTabPanel .editor-frame").boundingBox();
  await page.mouse.move(editorFrame.x + editorFrame.width / 2, editorFrame.y + editorFrame.height / 2);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => window.monaco?.editor?.getEditors?.()[0]?.getScrollTop?.() || 0)).toBeGreaterThan(scrollTopBefore);

  const layoutBefore = await page.locator("#documentSplit").evaluate((element) => ({
    top: element.children[0].getBoundingClientRect().height,
    bottom: element.children[2].getBoundingClientRect().height,
    ratio: document.querySelector("#documentSplitResizer").getAttribute("aria-valuenow")
  }));
  await page.locator("#documentSplitResizer").focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  const layoutAfter = await page.locator("#documentSplit").evaluate((element) => ({
    top: element.children[0].getBoundingClientRect().height,
    bottom: element.children[2].getBoundingClientRect().height,
    ratio: document.querySelector("#documentSplitResizer").getAttribute("aria-valuenow")
  }));
  expect(Number(layoutAfter.ratio)).toBeGreaterThan(Number(layoutBefore.ratio));
  expect(layoutAfter.top).toBeGreaterThan(layoutBefore.top);
  expect(layoutAfter.bottom).toBeLessThan(layoutBefore.bottom);

  await page.locator("#mergeDocumentsButton").click();
  await expect(page.locator("#documentSplit")).not.toHaveClass(/is-split/);
  await expect(page.locator("#readmeTabPanel")).toBeVisible();
  await expect(page.locator("#codeTabPanel")).toBeHidden();

  const readmeTabBox = await page.locator("#readmeTab").boundingBox();
  await page.locator("#codeTab").dragTo(page.locator("#readmeTab"), {
    targetPosition: { x: readmeTabBox.width - 4, y: readmeTabBox.height / 2 }
  });
  await expect(page.locator("#editorTabList [role=tab]").first()).toHaveId("readmeTab");
  await expect(page.locator("#editorTabList [role=tab]")).toContainText(["README.md", "BinarySearch.cs", "Pruebas"]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  expect(pageErrors).toEqual([]);
});

test("los documentos se acoplan en tres zonas y las acciones restauran el diseño", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(url, { waitUntil: "networkidle" });

  let splitBox = await page.locator("#documentSplit").boundingBox();
  await page.locator("#readmeTab").dragTo(page.locator("#documentSplit"), {
    targetPosition: { x: splitBox.width / 2, y: splitBox.height * 0.2 }
  });
  await expect(page.locator("#documentSplit")).toHaveClass(/is-split/);

  splitBox = await page.locator("#documentSplit").boundingBox();
  await page.locator("#testsTab").dragTo(page.locator("#documentSplit"), {
    targetPosition: { x: splitBox.width * 0.78, y: splitBox.height * 0.2 }
  });

  await expect(page.locator("#documentSplit")).toHaveClass(/is-triple/);
  await expect(page.locator("#documentSplitResizerVertical")).toBeVisible();
  await expect(page.locator("#documentSplitResizerBottom")).toBeVisible();
  await expect(page.locator("#readmeTabPanel")).toHaveCSS("grid-area", "top-left");
  await expect(page.locator("#testsTabPanel")).toHaveCSS("grid-area", "top-right");
  await expect(page.locator("#codeTabPanel")).toHaveCSS("grid-area", "bottom");

  await page.locator('[data-tab-actions="tests"]').click();
  await expect(page.locator("#tabActionsMenu")).toBeVisible();
  const menuBox = await page.locator("#tabActionsMenu").boundingBox();
  expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(1366);
  expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(768);
  await page.getByRole("menuitem", { name: /Volver a su posición/ }).click();
  await expect(page.locator("#testsTabPanel")).toHaveCSS("grid-area", "bottom");

  await page.locator('[data-tab-actions="code"]').click();
  await page.getByRole("menuitem", { name: /Volver a su posición/ }).click();
  await expect(page.locator("#codeTabPanel")).toHaveCSS("grid-area", "top-left");
  await expect(page.locator("#readmeTabPanel")).toHaveCSS("grid-area", "top-right");

  await page.locator('[data-tab-actions="readme"]').click();
  await page.getByRole("menuitem", { name: /Cerrar pestaña/ }).click();
  await expect(page.locator('[data-tab-shell="readme"]')).toBeHidden();
  await expect(page.locator("#readmeTabPanel")).toBeHidden();
  await expect(page.locator("#documentSplit")).not.toHaveClass(/is-triple/);

  await page.locator('[data-tab-actions="code"]').click();
  await page.getByRole("menuitem", { name: /Restablecer diseño/ }).click();
  await expect(page.locator("#documentSplit")).not.toHaveClass(/is-split/);
  await expect(page.locator("#editorTabList [role=tab]")).toHaveCount(3);
  await expect(page.locator("#editorTabList [role=tab]")).toContainText(["BinarySearch.cs", "README.md", "Pruebas"]);
  await expect(page.locator("#codeTabPanel")).toBeVisible();
  await expect(page.locator("#readmeTabPanel")).toBeHidden();
  await expect(page.locator("#testsTabPanel")).toBeHidden();
  expect(pageErrors).toEqual([]);
});
