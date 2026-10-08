// Connexion au dashboard Chariow avec le compte bot.
// Usage : node bot/login.cjs [code-recu-par-email]
// Lit CHARIOW_BOT_EMAIL et CHARIOW_BOT_PASSWORD ; enregistre la session dans bot/.session.json
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const EMAIL = process.env.CHARIOW_BOT_EMAIL;
const PASSWORD = process.env.CHARIOW_BOT_PASSWORD;
const CODE = process.argv[2];
const SESSION = path.join(__dirname, '.session.json');
const SHOTS = path.join(__dirname, 'captures');

(async () => {
  if (!EMAIL) {
    console.error('Erreur : CHARIOW_BOT_EMAIL manquant.');
    process.exit(1);
  }
  require('fs').mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://app.chariow.com/auth/login', { waitUntil: 'networkidle' });
  await page.fill('input[type=email]', EMAIL);
  await page.click('button[type=submit]');
  await page.waitForLoadState('networkidle');

  // Étape 2 : mot de passe ou code, selon ce que Chariow demande
  const password = page.locator('input[type=password]');
  const code = page.locator('input[autocomplete=one-time-code], input[inputmode=numeric], input[name*=code i], input[name*=otp i]');

  if (await password.count()) {
    if (!PASSWORD) throw new Error('Chariow demande un mot de passe : CHARIOW_BOT_PASSWORD manquant.');
    await password.first().fill(PASSWORD);
    await page.click('button[type=submit]');
    await page.waitForLoadState('networkidle');
  }

  if (await code.count()) {
    if (!CODE) {
      await page.screenshot({ path: path.join(SHOTS, 'login-code.png') });
      console.log('CODE_REQUIS : Chariow a envoyé un code par email. Relance avec : node bot/login.cjs <code>');
      await browser.close();
      process.exit(2);
    }
    const n = await code.count();
    if (n > 1) {
      // Une case par chiffre
      for (let i = 0; i < n && i < CODE.length; i++) await code.nth(i).fill(CODE[i]);
    } else {
      await code.first().fill(CODE);
    }
    const submit = page.locator('button[type=submit]');
    if (await submit.count()) await submit.first().click();
    await page.waitForLoadState('networkidle');
  }

  await page.screenshot({ path: path.join(SHOTS, 'login-result.png') });
  if (page.url().includes('/auth/')) {
    console.error('Échec : toujours sur ' + page.url() + ' (voir bot/captures/login-result.png)');
    await browser.close();
    process.exit(1);
  }

  await page.context().storageState({ path: SESSION });
  console.log('Connecté : ' + page.url());
  await browser.close();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
