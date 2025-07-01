// generateThumbnails.cjs
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const modelDir = path.join(__dirname, "public", "models");
const outputDir = path.join(__dirname, "public", "assets", "thumbnails");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateThumbnails() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const files = fs.readdirSync(modelDir).filter((file) => file.endsWith(".glb"));

  for (const file of files) {
    const baseName = path.parse(file).name;
    const screenshotPath = path.join(outputDir, `${baseName}.png`);

    if (fs.existsSync(screenshotPath)) {
      console.log(`⏩ Skipping ${file} — thumbnail already exists.`);
      continue;
    }

    console.log(`🖼 Rendering thumbnail for: ${file}`);
    const modelPath = `/models/${file}`;

    try {
      await page.goto(`http://localhost:5173/thumbnailRenderer.html?model=${modelPath}`, {
        waitUntil: "networkidle0",
      });

      await page.setViewport({ width: 512, height: 512 });

      await page.waitForFunction(() => window.__screenshotReady === true, { timeout: 5000 });

      await page.screenshot({ path: screenshotPath, omitBackground: true });
      console.log(`✓ Saved: ${screenshotPath}`);
    } catch (err) {
      console.error(`✗ Failed to render ${file}`, err);
    }
  }

  await browser.close();
}

generateThumbnails();
