// Outils communs du bot Chariow : session, navigation, dumps compacts, menus déroulants.
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const SESSION = path.join(__dirname, '.session.json');
const SHOTS = path.join(__dirname, 'captures');
const APP = 'https://app.chariow.com';
const STORE = process.env.CHARIOW_STORE || 'store_icq378ahk7ls'; // KAMTECH

const storeUrl = (p = 'home', store = STORE) => `${APP}/stores/${store}/${p.replace(/^\//, '')}`;

async function open({ headless = true } = {}) {
  if (!fs.existsSync(SESSION)) throw new Error('Pas de session : lancer node bot/login.cjs');
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch({ headless });
  const ctx = await browser.newContext({ storageState: SESSION, viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const wait = (ms = 1500) => page.waitForTimeout(ms);
  const go = async (url) => {
    await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
    await wait(2000);
    if (page.url().includes('/auth/')) throw new Error('SESSION_EXPIREE : relancer node bot/login.cjs');
  };
  const close = async () => { await ctx.storageState({ path: SESSION }).catch(() => {}); await browser.close(); };
  return { browser, ctx, page, wait, go, close };
}

// Texte du modal ouvert, sinon du contenu principal (sans la barre latérale).
async function text(page, max = 2000) {
  const d = page.locator('[role=dialog]');
  let t = (await d.count()) ? await d.last().innerText() : await page.innerText('body');
  t = t.replace(/\n+/g, ' | ');
  const cut = t.indexOf('Collapse sidebar | '); // retire l'en-tête et la barre latérale, identiques partout
  return (cut >= 0 ? t.slice(cut + 19) : t).slice(0, max);
}

// Liste compacte des champs/boutons visibles (dans le modal s'il y en a un).
async function fields(page) {
  const scope = (await page.locator('[role=dialog]').count()) ? '[role=dialog] ' : '';
  return page.$$eval(`${scope}input, ${scope}textarea, ${scope}select, ${scope}button, ${scope}[contenteditable=true]`, (es) =>
    es.filter((e) => (e.offsetParent !== null || e.type === 'checkbox') && !e.closest('nav, aside, header')).map((e) => {
      const lab = e.id && document.querySelector(`label[for="${e.id}"]`);
      return [e.tagName.toLowerCase(), e.type || '', lab ? lab.innerText.trim() : '', e.placeholder || '', e.value && e.type !== 'button' ? e.value.slice(0, 30) : '',
        (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40), e.getAttribute('aria-haspopup') || ''].join('|');
    }).filter((x) => x.replace(/\|/g, '').trim()));
}

// Menus déroulants Chariow (Mantine Menu) : bouton #X-target ouvre #X-dropdown avec un champ Search et des [role=menuitem].
async function pickMenu(page, target, query, match) {
  const t = typeof target === 'string' ? page.locator(target) : target;
  await t.click();
  await page.waitForTimeout(800);
  const id = await t.getAttribute('aria-controls');
  const dd = page.locator(`#${id}`);
  const search = dd.locator('input');
  if (query && (await search.count())) { await search.first().fill(query); await page.waitForTimeout(800); }
  await dd.locator('[role=menuitem]').filter({ hasText: match || query }).first().click();
  await page.waitForTimeout(800);
}

const btn = (page, label, scope = page) => scope.locator('button', { hasText: label }).last();
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });

module.exports = { open, text, fields, pickMenu, btn, shot, storeUrl, APP, STORE, SESSION, SHOTS };
