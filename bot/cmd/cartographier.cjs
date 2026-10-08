// Parcourt toutes les pages de la boutique et écrit un dump compact par page dans bot/captures/carte/.
// Usage : node bot/cmd/cartographier.cjs [profondeur=2]
// Sert à (re)générer la carte quand l'interface change ; résumer ensuite dans bot/CARTE.md.
const fs = require('fs');
const path = require('path');
const { open, text, fields, storeUrl, STORE, SHOTS } = require('../lib.cjs');
const OUT = path.join(SHOTS, 'carte');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const depth = +(process.argv[2] || 2);
  const { page, go, close } = await open();
  const base = storeUrl('').replace(/\/$/, '');
  const seen = new Set();
  let queue = [storeUrl('home'), storeUrl('settings')];
  for (let d = 0; d <= depth && queue.length; d++) {
    const next = [];
    for (const url of queue) {
      const key = url.split(/[?#]/)[0];
      if (seen.has(key) || /\/(sales|customers|products)\/[a-zA-Z0-9]+_/.test(key)) continue; // pas les fiches individuelles
      seen.add(key);
      try { await go(url); } catch (e) { console.log('ERR', url, e.message); continue; }
      const f = (await fields(page)).filter((x) => !/^button\|button\|\|\|\|\|/.test(x));
      const t = await text(page, 1500);
      const name = key.replace(base, '').replace(/^\//, '').replace(/\//g, '__') || 'root';
      fs.writeFileSync(path.join(OUT, name + '.txt'), `URL ${page.url()}\nTEXTE ${t}\nCHAMPS\n${f.join('\n')}\n`);
      console.log(name.padEnd(40), t.slice(0, 110));
      const links = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
      for (const l of links) if (l.startsWith(base) && !seen.has(l.split(/[?#]/)[0])) next.push(l);
    }
    queue = [...new Set(next)];
  }
  console.log('PAGES', seen.size, '->', OUT, 'boutique', STORE);
  await close();
})().catch((e) => { console.error('ERREUR', e.message); process.exit(1); });
