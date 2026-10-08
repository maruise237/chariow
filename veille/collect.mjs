// Collecte des pubs Meta (bibliothèque publicitaire) via l'API ScrapeCreators.
// Usage : SCRAPECREATORS_API_KEY=... node veille/collect.mjs --query mychariow --countries CM,CI,SN --pages 3
// Chaque page brute est sauvegardée dans veille/data/raw/<query>_<pays>_p<n>.json,
// puis `node veille/analyze.mjs` construit le rapport.
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).join(' ').split('--').filter(Boolean).map((s) => {
    const [k, ...v] = s.trim().split(/\s+/);
    return [k, v.join(' ')];
  }),
);
const QUERY = args.query || 'mychariow';
const COUNTRIES = (args.countries || 'CM,CI,SN,BJ').split(',');
const PAGES = Number(args.pages || 2);
const KEY = process.env.SCRAPECREATORS_API_KEY;
const RAW = path.join(import.meta.dirname, 'data', 'raw');

if (!KEY) {
  console.error('Erreur : définis SCRAPECREATORS_API_KEY (scrapecreators.com, 100 crédits offerts).');
  process.exit(1);
}
fs.mkdirSync(RAW, { recursive: true });

for (const country of COUNTRIES) {
  let cursor;
  for (let p = 1; p <= PAGES; p++) {
    const url = new URL('https://api.scrapecreators.com/v1/facebook/adLibrary/search/ads');
    url.search = new URLSearchParams({ query: QUERY, country, trim: 'true', ...(cursor && { cursor }) });
    const res = await fetch(url, { headers: { 'x-api-key': KEY } });
    if (!res.ok) {
      console.error(`FAIL ${country} p${p} : HTTP ${res.status}`);
      break;
    }
    const body = await res.json();
    const file = path.join(RAW, `${QUERY.replace(/\W+/g, '-')}_${country}_p${p}.json`);
    fs.writeFileSync(file, JSON.stringify(body));
    console.log(`OK   ${country} p${p} : ${body.searchResults?.length ?? 0} pubs -> ${path.basename(file)}`);
    cursor = body.cursor;
    if (!cursor || !body.searchResults?.length) break;
  }
}
