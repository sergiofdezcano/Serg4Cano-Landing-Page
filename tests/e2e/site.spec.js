import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sections = ['#top', '#videos', '#shorts', '#directos', '#recomendaciones', '#descuentos', '#contacto'];

test('renders every main section', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle(/Serg4Cano/);
  for (const id of sections) await expect(page.locator(id)).toBeVisible();
  await expect(page.locator('#videos .grid li')).not.toHaveCount(0);
  await expect(page.locator('#shorts .short')).not.toHaveCount(0);
});

test('nav only links to sections that exist', async ({ page }) => {
  await page.goto('./');
  for (const href of await page.locator('.nav__links a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))) {
    await expect(page.locator(href)).toHaveCount(1);
  }
});

test('descuentos muestra ofertas de Steam', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.nav__links a[href="#descuentos"]')).toHaveText('Descuentos');
  const section = page.locator('#descuentos');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(/Descuentos y ofertas/);
  await expect(section.getByRole('heading', { level: 3, name: 'Ofertas en Steam' })).toBeVisible();
  const cards = section.locator('.offer');
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(1);
  expect(count).toBeLessThanOrEqual(6);
  for (const card of await cards.all()) {
    const link = card.locator('a');
    await expect(link).toHaveAttribute('href', /^https:\/\/store\.steampowered\.com\/app\/\d+\/$/);
    await expect(link).toHaveAttribute('rel', 'noopener');
    await expect(card).toContainText(/-\d+%/);
    await expect(card.locator('img')).toHaveAttribute('alt', /\S/);
    await expect(card.locator('s')).toContainText('€');
  }
  await expect(section).toContainText(/Actualizado el .+\. Precios de Steam España; pueden cambiar\./);
});

test('countdown shows a time or live state', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.strip__state')).toHaveText(/Próximo directo en|En horario de directo/);
});

test('play button swaps in the YouTube player', async ({ page }) => {
  await page.goto('./');
  await page.locator('.player__play').click();
  await expect(page.locator('.player iframe')).toHaveAttribute('src', /youtube-nocookie\.com\/embed\//);
});

test('no horizontal scroll on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('./');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('no accessibility violations (WCAG A/AA)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} nodes`)).toEqual([]);
});

test('all internal assets resolve', async ({ page, request }) => {
  await page.goto('./');
  const urls = await page.evaluate(() =>
    [...document.querySelectorAll('img[src], link[href], script[src]')]
      .map((el) => el.src || el.href)
      .filter((u) => u.startsWith(location.origin)),
  );
  for (const url of urls) expect((await request.get(url)).status(), url).toBe(200);
});
