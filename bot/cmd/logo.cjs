// Envoie le logo de la boutique. Usage : node bot/cmd/logo.cjs <fichier.png>
const path = require('path');
const { open, text, btn, shot, storeUrl } = require('../lib.cjs');
(async () => {
  const file = path.resolve(process.argv[2]);
  const { page, go, wait, close } = await open();
  await go(storeUrl('settings/general'));
  const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10000 }), btn(page, 'Choose file').click()]);
  await chooser.setFiles(file);
  await wait(3000);
  console.log('APRES_CHOIX', await text(page, 600)); // un modal de recadrage peut apparaître
  if (await page.locator('[role=dialog]').count()) {
    const b = page.locator('[role=dialog] button').last();
    console.log('MODAL_BOUTON', await b.innerText()); await b.click(); await wait(3000);
  }
  await page.locator('button[type=submit]', { hasText: 'Save' }).click();
  await wait(4000);
  console.log('APRES_SAVE', await text(page, 400));
  await shot(page, 'logo');
  await close();
})().catch((e) => { console.error('ERREUR', e.message); process.exit(1); });
