// Ouvre chaque page de vente concurrente (Playwright) et relève : achats affichés,
// avis, prix barré / prix actuel, compte à rebours.
// Usage : node veille/enrich.cjs   (après analyze.mjs, qui produit data/pubs.json)
// Sortie : veille/data/pages.json, relu automatiquement par analyze.mjs.
// Les prix s'affichent en $US depuis ce serveur : conversion avec USD_XAF (défaut 570).
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const DATA = path.join(__dirname, 'data');
const OUT = path.join(DATA, 'pages.json');
const USD_XAF = Number(process.env.USD_XAF || 570);
const CONCURRENCY = 4;

// "1K+ Achats" -> 1000, "234 Sales" -> 234
const nombre = (s) => {
  const m = /^([\d.,]+)\s*([KM])?/i.exec(s);
  if (!m) return null;
  const n = Number(m[1].replace(',', '.'));
  return Math.round(n * ({ K: 1e3, M: 1e6 }[(m[2] || '').toUpperCase()] || 1));
};

function lire(t, url) {
  const achats = /([\d.,]+\s*[KM]?\+?)\s*(Achats|Sales|Ventes)/i.exec(t);
  const avis = /(\d+)%\s*\((\d+)\s*(Avis|Ratings)\)/i.exec(t);
  // Les montants qui précèdent le bouton d'achat : [prix barré, prix actuel] ou [prix]
  const zone = t.slice(0, t.search(/Acheter maintenant|Buy now|Télécharger maintenant|Download now|S'inscrire|Réserver/i) + 1 || undefined);
  const montants = [...zone.matchAll(/([\d\s.]+,\d{2}|\d[\d\s.]*)\s*\$US/g)].map((m) => Number(m[1].replace(/[\s.]/g, '').replace(',', '.')));
  const prixUsd = montants.at(-1) ?? null;
  const gratuit = /Gratuit|Free/i.test(zone.slice(-200)) && !montants.length;
  return {
    url,
    achats: achats ? nombre(achats[1]) : null,
    achatsTexte: achats?.[1].trim() || null,
    avisPct: avis ? Number(avis[1]) : null,
    avis: avis ? Number(avis[2]) : null,
    prixXaf: gratuit ? 0 : prixUsd != null ? Math.round((prixUsd * USD_XAF) / 50) * 50 : null,
    prixBarreXaf: montants.length > 1 ? Math.round((montants.at(-2) * USD_XAF) / 50) * 50 : null,
    compteARebours: /L'offre se termine|Offer ends/i.test(t),
    titre: t.slice(0, 400).replace(/^.*?Mes achats\s*(United States\(\$\)\s*)?/, '').slice(0, 120),
  };
}

(async () => {
  const liens = [...new Set(JSON.parse(fs.readFileSync(path.join(DATA, 'pubs.json'), 'utf8')).map((p) => p.lien))];
  const deja = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  const todo = liens.filter((l) => !deja[l] || deja[l].erreur || process.env.FORCE);
  console.log(`${liens.length} pages, ${todo.length} à visiter`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ locale: 'fr-FR', timezoneId: 'Africa/Douala' });
  let i = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    const page = await ctx.newPage();
    while (i < todo.length) {
      const url = todo[i++];
      try {
        // networkidle n'arrive jamais sur certaines pages (pixels, chat) : on attend le DOM puis 6 s.
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
        const t = (await page.innerText('body')).replace(/\s+/g, ' ');
        deja[url] = lire(t, url);
        const d = deja[url];
        console.log(`OK   ${String(d.achatsTexte ?? '-').padEnd(6)} ${String(d.prixXaf ?? '?').padStart(7)} F  ${url}`);
      } catch (e) {
        deja[url] = { url, erreur: e.message.split('\n')[0] };
        console.log(`FAIL ${url} : ${deja[url].erreur}`);
      }
    }
  }));
  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify(deja, null, 1));
  console.log(`-> ${path.relative(process.cwd(), OUT)}`);
})();
