// Affiche une page du dashboard en version compacte (texte + champs) et fait une capture.
// Usage : node bot/cmd/voir.cjs <chemin-boutique|url> [nom-capture]
//   ex : node bot/cmd/voir.cjs settings/general
const { open, text, fields, shot, storeUrl } = require('../lib.cjs');
(async () => {
  const arg = process.argv[2] || 'home';
  const { page, go, close } = await open();
  await go(arg.startsWith('http') ? arg : storeUrl(arg));
  console.log('URL', page.url());
  console.log('TEXTE', await text(page, +process.env.MAX || 1500));
  console.log('CHAMPS\n' + (await fields(page)).join('\n'));
  await shot(page, process.argv[3] || 'voir');
  await close();
})().catch((e) => { console.error('ERREUR', e.message); process.exit(1); });
