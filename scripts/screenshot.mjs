// Captures desktop + mobile screenshots of a running preview server.
// Usage: node scripts/screenshot.mjs [url] [outDir]
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const url = process.argv[2] ?? 'http://localhost:4321/Serg4Cano-Landing-Page/';
const out = process.argv[3] ?? '.impeccable/review';
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
for (const [name, width, height] of [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  // Pull lazy images in before the full-page capture
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    scrollTo(0, 0);
  });
  await page.evaluate(() =>
    Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r))))),
  );
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  await page.screenshot({ path: `${out}/${name}-fold.png` });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`${name}: horizontal overflow ${overflow}px`);
}
await browser.close();
