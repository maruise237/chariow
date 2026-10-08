// Remplit des champs (par libellé) sur une page du dashboard, puis enregistre si --save.
// Usage : node bot/cmd/remplir.cjs <chemin> "Libellé=valeur" ... [--save]
//   ex : node bot/cmd/remplir.cjs settings/seo "Title=KAMTECH" "Description=..." --save
// Sans --save : remplit et affiche l'état sans enregistrer (essai à blanc).
const { open, text, shot, storeUrl } = require('../lib.cjs');
(async () => {
  const [route, ...rest] = process.argv.slice(2);
  const save = rest.includes('--save');
  const { page, go, wait, close } = await open();
  await go(route.startsWith('http') ? route : storeUrl(route));
  for (const kv of rest.filter((a) => a !== '--save')) {
    const i = kv.indexOf('=');
    const label = kv.slice(0, i), value = kv.slice(i + 1);
    const f = page.getByLabel(label, { exact: true }).first();
    await f.fill(value);
    console.log('OK', label, '->', (await f.inputValue()).slice(0, 60));
  }
  if (save) {
    await page.locator('button[type=submit]').last().click();
    await wait(3000);
  }
  console.log(save ? 'ENREGISTRE' : 'ESSAI (non enregistré)', await text(page, 300));
  await shot(page, 'remplir');
  await close();
})().catch((e) => { console.error('ERREUR', e.message); process.exit(1); });
