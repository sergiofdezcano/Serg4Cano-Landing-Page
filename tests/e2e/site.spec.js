import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

const sections = ['#top', '#videos', '#shorts', '#directos', '#recomendaciones', '#descuentos', '#contacto'];

test('renders every main section', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle(/Serg4Cano/);
  for (const id of sections) await expect(page.locator(id)).toBeVisible();
  await expect(page.locator('#videos .queue li')).not.toHaveCount(0);
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

test('hero links to the six social profiles', async ({ page }) => {
  const profile = JSON.parse(readFileSync(new URL('../../src/data/profile.json', import.meta.url), 'utf8'));
  const expected = ['youtube', 'kick', 'twitch', 'instagram', 'x', 'discord'].map((id) =>
    profile.socials.find((s) => s.id === id),
  );
  await page.goto('./');
  const links = page.locator('#top ul.hero__socials > li > a');
  await expect(links).toHaveCount(6);
  for (const [i, s] of expected.entries()) {
    await expect(links.nth(i)).toHaveAttribute('href', s.url);
    await expect(links.nth(i)).toHaveAccessibleName(`${s.label}: ${s.handle}`);
  }
  await expect(page.locator('#top a[href*="tiktok.com"]')).toHaveCount(0);
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

test('a video from the list plays on the stage without leaving the page', async ({ page }) => {
  await page.goto('./');
  const second = page.locator('#videos .queue a').nth(1);
  const id = await second.getAttribute('data-id');
  const title = await second.getAttribute('data-title');
  await second.click();
  await expect(page).toHaveURL(/\/Serg4Cano-Landing-Page\/?$/);
  await expect(page.locator('#videos .player iframe')).toHaveAttribute('src', new RegExp(`/embed/${id}\\?`));
  await expect(second).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('[data-stage-link]')).toHaveText(title);
});

test('shorts arrows reflect where the rail is', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./');
  await expect(page.locator('.rail-btn[data-dir="-1"]')).toBeDisabled();
  await expect(page.locator('.rail-btn[data-dir="1"]')).toBeEnabled();
});

test('the stream schedule downloads as a weekly calendar', async ({ page, request }) => {
  await page.goto('./');
  const href = await page.locator('#directos a[download]').getAttribute('href');
  const res = await request.get(href);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type'] ?? '').toMatch(/text\/calendar/);
  const body = await res.text();
  expect(body).toContain('BEGIN:VCALENDAR');
  expect(body).toMatch(/RRULE:FREQ=WEEKLY;BYDAY=/);
});

test('visitors outside Spain see the next stream in their own time', async ({ browser }) => {
  const context = await browser.newContext({ timezoneId: 'America/Mexico_City' });
  const page = await context.newPage();
  await page.goto('./');
  // During a stream the strip shows the live state instead
  if (await page.locator('.strip[data-live]').count()) return context.close();
  await expect(page.locator('.strip__local')).toBeVisible();
  await expect(page.locator('.strip__local')).toContainText('En tu hora (Mexico City)');
  await context.close();
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

test('política de privacidad de Stream Autopilot', async ({ page }) => {
  await page.goto('./privacidad/');
  await expect(page).toHaveTitle(/Política de privacidad/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Política de privacidad/);
  await expect(page.locator('main')).toContainText('Stream Autopilot');
  await expect(page.locator('main')).toContainText('YouTube API Services');
  await expect(page.locator('a[href="https://www.youtube.com/t/terms"]')).toHaveCount(1);
  await expect(page.locator('a[href="https://policies.google.com/privacy"]')).toHaveCount(1);
  await expect(page.locator('a[href="https://myaccount.google.com/permissions"]')).toHaveCount(1);
  await expect(page.locator('a[href^="mailto:serg4cano@gmail.com"]')).toHaveCount(1);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
