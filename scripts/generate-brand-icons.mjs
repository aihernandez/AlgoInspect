import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(projectRoot, "src", "frontend", "public", "assets", "brand", "algo-inspect-app-icon.svg");
const outputDir = path.join(projectRoot, "src", "frontend", "public", "assets", "icons");
const svg = await readFile(sourcePath, "utf8");
const encodedSvg = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const outputs = [
  [16, "icon-16.png"],
  [32, "icon-32.png"],
  [48, "icon-48.png"],
  [64, "icon-64.png"],
  [128, "icon-128.png"],
  [180, "apple-touch-icon.png"],
  [192, "icon-192.png"],
  [256, "icon-256.png"],
  [512, "icon-512.png"],
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const [size, filename] of outputs) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`
      <style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden}img{display:block;width:100%;height:100%}</style>
      <img src="${encodedSvg}" alt="">
    `);
    await page.locator("img").screenshot({ path: path.join(outputDir, filename), omitBackground: true });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`Generated ${outputs.length} AlgoInspect icons in ${outputDir}`);
