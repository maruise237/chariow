// Connexion au dashboard Chariow (via Axa Zara) et sauvegarde de la session.
// Usage : node bot/login.cjs
// Lit CHARIOW_BOT_EMAIL et CHARIOW_BOT_PASSWORD (ou CHARIOW_PASSWORD).
// Si un code de vérification est demandé, le script attend que le code soit écrit dans bot/code.txt.
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const EMAIL = process.env.CHARIOW_BOT_EMAIL;
const PASSWORD = process.env.CHARIOW_BOT_PASSWORD || process.env.CHARIOW_PASSWORD;
const SESSION = path.join(__dirname, '.session.json');
const CODE_FILE = path.join(__dirname, 'code.txt');
const SHOTS = path.join(__dirname, 'captures');

const settle = (page) => page.waitForLoadState('networkidle').catch(() => {});
const text = async (page) => (await page.innerText('body')).replace(/\s+/g, ' ').slice(0, 300);

(async () => {
  if (!EMAIL || !PASSWORD) {
    console.error('Erreur : CHARIOW_BOT_EMAIL et CHARIOW_BOT_PASSWORD sont requis.');
    process.exit(1);
  }
  fs.mkdirSync(SHOTS, { recursive: true });
  fs.rmSync(CODE_FILE, { force: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Étape 1 : email sur Chariow, qui redirige vers Axa Zara
  await page.goto('https://app.chariow.com/auth/login', { waitUntil: 'networkidle' });
  await page.fill('input[type=email]', EMAIL);
  await page.click('button[type=submit]');
  await page.waitForURL(/axazara\.com/, { timeout: 30000 });
  await settle(page);

  // Étape 2 : mot de passe Axa Zara
  await page.fill('input[type=password]', PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForTimeout(6000);
  await settle(page);

  // Étape 3 (optionnelle) : code de vérification
  if (/axazara\.com/.test(page.url())) {
    await page.screenshot({ path: path.join(SHOTS, 'verification.png') });
    console.log('CODE_REQUIS ' + page.url() + ' :: ' + (await text(page)));
    const t0 = Date.now();
    while (!fs.existsSync(CODE_FILE)) {
      if (Date.now() - t0 > 15 * 60e3) throw new Error('Pas de code reçu en 15 minutes.');
      await page.waitForTimeout(2000);
    }
    const code = fs.readFileSync(CODE_FILE, 'utf8').trim();
    fs.rmSync(CODE_FILE, { force: true });
    const boxes = page.locator('input:not([type=hidden]):not([type=email]):not([type=password])');
    const n = await boxes.count();
    if (n > 1) for (let i = 0; i < n && i < code.length; i++) await boxes.nth(i).fill(code[i]);
    else if (n === 1) await boxes.first().fill(code);
    else await page.keyboard.type(code);
    const submit = page.locator('button[type=submit]');
    if (await submit.count()) await submit.first().click().catch(() => {});
    await page.waitForTimeout(8000);
    await settle(page);
  }

  await page.screenshot({ path: path.join(SHOTS, 'login-result.png') });
  if (!page.url().startsWith('https://app.chariow.com') || page.url().includes('/auth/')) {
    console.error('LOGIN_FAILED ' + page.url() + ' :: ' + (await text(page)));
    await browser.close();
    process.exit(1);
  }
  await page.context().storageState({ path: SESSION });
  console.log('LOGGED_IN ' + page.url());
  await browser.close();
})().catch((e) => {
  console.error('ERROR ' + e.message);
  process.exit(1);
});
