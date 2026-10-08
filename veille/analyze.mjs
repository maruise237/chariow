// Analyse des pubs collectées : regroupe par produit, calcule un score "gagnant",
// détecte la niche, le prix affiché et l'accroche.
// Usage : node veille/analyze.mjs
// Sorties : veille/data/produits.csv, veille/data/pubs.json, veille/RAPPORT.md
import fs from 'node:fs';
import path from 'node:path';

const DIR = import.meta.dirname;
const RAW = path.join(DIR, 'data', 'raw');
const NOW = Date.now() / 1000;

// Une pub qui tourne longtemps et en plusieurs variantes = une pub rentable.
// Poids : 1 point par jour de diffusion (plafonné à 120), 15 par variante, 10 par pays,
// + les achats affichés sur la page de vente (relevés par enrich.cjs) : 1 point pour 5 achats, max 200.
const score = (p) => Math.min(p.joursMax, 120) + 15 * p.variantes + 10 * p.pays.length + Math.min(p.achats || 0, 1000) / 5;
const PAGES = path.join(DIR, 'data', 'pages.json');
const pages = fs.existsSync(PAGES) ? JSON.parse(fs.readFileSync(PAGES, 'utf8')) : {};

// Ordre = priorité : les niches les plus spécifiques d'abord.
// Pas de « chariow » ici : le mot est dans le lien de presque toutes les pubs.
const NICHES = [
  ['Spiritualité / Religion', /spirituel|prière|délivrance|prophét|bible|enoch|église|chrétien|islam|coran|psaume/i],
  ['Cuisine / Recettes', /cuisine|recettes?\b/i],
  ['Langues', /anglais|english|toeic|ielts|français sans faute|orthographe/i],
  ['Musique / Créatif', /solfège|musique|piano|guitare|affiche|canva|graphis/i],
  ['Couple / Famille / Santé', /couple|mariage|sexe|enfant|santé|minceur|grossesse/i],
  ['Métiers & artisanat', /menuis|couture|soudure|électricit|maçon|plomb|mécanicien|mécanique auto|coiffure|pâtisserie|plans? de maison|btp/i],
  ['Publicité Facebook / Marketing', /campagne publicitaire|publicité|facebook ads|meta ads|andromeda|marketing digital|tiktok/i],
  ['IA / Tech / Bureautique', /\b(IA|AI)\b|intelligence artificielle|chatgpt|claude|gemini|prompt|coder|développeur|excel|word|smartphone|n8n|informatique/],
  ['Finances perso', /dépenses|budget|épargne|finances? perso/i],
  ['Éducation / Examens', /examen|\bbac\b|concours|épreuve|maths|comptab|statistique/i],
  ['Développement perso / Lecture', /lois|pouvoir|confiance|estime de soi|mindset|livres?\b|lecture/i],
  ['Business en ligne', /boutique|vendre en ligne|revenus? en ligne|argent en ligne|produits? digita|business|entrepren/i],
];
const niche = (t) => NICHES.find(([, re]) => re.test(t))?.[0] || 'Autre';

// Prix en FCFA trouvés dans le texte : on garde le plus petit (prix promo).
const prix = (t) => {
  const vals = [...t.matchAll(/(\d{1,3}(?:[ . ]\d{3})+|\d{3,6})\s*(?:F\s?CFA|FCFA|fcfa|F\b|francs)/g)]
    .map((m) => Number(m[1].replace(/\D/g, '')))
    .filter((v) => v >= 100 && v <= 500000);
  return vals.length ? Math.min(...vals) : null;
};

const accroche = (t) => t.split('\n').map((l) => l.trim()).find((l) => l.length > 8)?.slice(0, 140) || '';

// 1. Charger et dédoublonner les pubs (une même pub apparaît dans plusieurs pays).
const pubs = new Map();
for (const f of fs.readdirSync(RAW).filter((f) => f.endsWith('.json'))) {
  const country = f.split('_')[1];
  for (const a of JSON.parse(fs.readFileSync(path.join(RAW, f), 'utf8')).searchResults || []) {
    const s = a.snapshot || {};
    const link = (s.link_url || '').replace(/\/checkout$/, '').replace(/\?.*$/, '');
    if (!link) continue;
    const prev = pubs.get(a.ad_archive_id);
    if (prev) {
      prev.pays.add(country);
      continue;
    }
    const text = [s.title, s.body?.text, s.link_description].filter(Boolean).join('\n');
    pubs.set(a.ad_archive_id, {
      id: a.ad_archive_id,
      page: (a.page_name || '').trim(),
      likes: s.page_like_count ?? null,
      lien: link,
      boutique: new URL(link).hostname,
      debut: a.start_date_string?.slice(0, 10),
      jours: Math.round((NOW - a.start_date) / 86400),
      actif: a.is_active,
      format: s.display_format,
      cta: s.cta_text,
      collation: a.collation_count || 1,
      pays: new Set([country]),
      texte: text,
      url: a.url,
    });
  }
}

// 2. Regrouper par produit (même lien de destination).
const produits = new Map();
for (const p of pubs.values()) {
  const g = produits.get(p.lien) || { lien: p.lien, boutique: p.boutique, page: p.page, likes: p.likes, pubs: [] };
  g.pubs.push(p);
  produits.set(p.lien, g);
}
const rows = [...produits.values()].map((g) => {
  const texte = g.pubs.map((p) => p.texte).join('\n');
  const r = {
    ...g,
    titre: g.pubs.map((p) => p.texte.split('\n')[0]).sort((a, b) => b.length - a.length)[0].slice(0, 90),
    niche: niche(texte),
    prix: pages[g.lien]?.prixXaf ?? prix(texte),
    achats: pages[g.lien]?.achats ?? null,
    achatsTexte: pages[g.lien]?.achatsTexte ?? '',
    avis: pages[g.lien]?.avis ?? null,
    compteARebours: pages[g.lien]?.compteARebours ?? null,
    variantes: g.pubs.reduce((n, p) => n + p.collation, 0),
    joursMax: Math.max(...g.pubs.map((p) => p.jours)),
    pays: [...new Set(g.pubs.flatMap((p) => [...p.pays]))],
    formats: [...new Set(g.pubs.map((p) => p.format))],
    accroche: accroche(g.pubs[0].texte),
    pubUrl: g.pubs[0].url,
  };
  r.score = Math.round(score(r));
  return r;
}).sort((a, b) => b.score - a.score);

// 3. Agrégats par niche.
const niches = {};
for (const r of rows) {
  const n = (niches[r.niche] ||= { produits: 0, score: 0, prix: [], achats: 0 });
  n.produits++;
  n.achats += r.achats || 0;
  n.score += r.score;
  if (r.prix) n.prix.push(r.prix);
}
const median = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);

// 4. Sorties.
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
const cols = ['score', 'niche', 'titre', 'prix', 'achatsTexte', 'avis', 'joursMax', 'variantes', 'pays', 'formats', 'page', 'likes', 'lien', 'accroche', 'pubUrl'];
fs.writeFileSync(
  path.join(DIR, 'data', 'produits.csv'),
  [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(Array.isArray(r[c]) ? r[c].join(' ') : r[c])).join(','))].join('\n'),
);
fs.writeFileSync(
  path.join(DIR, 'data', 'pubs.json'),
  JSON.stringify([...pubs.values()].map((p) => ({ ...p, pays: [...p.pays] })), null, 1),
);

const fcfa = (v) => (v ? `${v.toLocaleString('fr-FR')} F` : '?');
const md = [];
md.push(`# Rapport de veille pubs : produits digitaux Chariow`);
md.push(`\nGénéré le ${new Date().toISOString().slice(0, 10)} · ${pubs.size} pubs uniques · ${rows.length} produits · ${new Set(rows.map((r) => r.boutique)).size} boutiques concurrentes\n`);
md.push(`Score = jours de diffusion (max 120) + 15 × variantes + 10 × pays + achats affichés ÷ 5 (max 200). Une pub qui tourne longtemps, en plusieurs versions et dans plusieurs pays est presque toujours rentable ; les achats affichés sur la page de vente le confirment.\n`);
md.push(`## Niches les plus poussées en pub\n`);
md.push(`| Niche | Produits | Score cumulé | Prix médian | Achats affichés (cumul) |`);
md.push(`|---|---|---|---|---|`);
for (const [n, v] of Object.entries(niches).sort((a, b) => b[1].score - a[1].score)) {
  md.push(`| ${n} | ${v.produits} | ${Math.round(v.score)} | ${fcfa(median(v.prix))} | ${v.achats.toLocaleString('fr-FR')}+ |`);
}
md.push(`\n## Top 25 produits gagnants\n`);
md.push(`| # | Score | Niche | Produit | Prix | Achats | Jours | Var. | Pays | Lien |`);
md.push(`|---|---|---|---|---|---|---|---|---|---|`);
rows.slice(0, 25).forEach((r, i) => {
  md.push(`| ${i + 1} | ${r.score} | ${r.niche} | ${r.titre.replace(/\|/g, '/')} | ${fcfa(r.prix)} | ${r.achatsTexte || '-'} | ${r.joursMax} | ${r.variantes} | ${r.pays.join(' ')} | [page](${r.lien}) · [pub](${r.pubUrl}) |`);
});
md.push(`\n## Accroches à étudier (top 15)\n`);
rows.slice(0, 15).forEach((r) => md.push(`- **${r.page}** (${r.niche}) : « ${r.accroche.replace(/\n/g, ' ')} »`));
md.push(`\n## Prix observés\n`);
const allPrix = rows.map((r) => r.prix).filter(Boolean);
md.push(`- ${allPrix.length} produits avec prix détecté · médiane ${fcfa(median(allPrix))} · min ${fcfa(Math.min(...allPrix))} · max ${fcfa(Math.max(...allPrix))}`);
md.push(`- Moins de 2 000 F : ${allPrix.filter((v) => v < 2000).length} · 2 000 à 5 000 F : ${allPrix.filter((v) => v >= 2000 && v <= 5000).length} · plus de 5 000 F : ${allPrix.filter((v) => v > 5000).length}`);
fs.writeFileSync(path.join(DIR, 'RAPPORT.md'), md.join('\n') + '\n');

console.log(`${pubs.size} pubs, ${rows.length} produits -> veille/RAPPORT.md, veille/data/produits.csv`);
console.table(rows.slice(0, 12).map((r) => ({ score: r.score, niche: r.niche, prix: r.prix, achats: r.achatsTexte, jours: r.joursMax, var: r.variantes, titre: r.titre.slice(0, 50) })));

// 5. Export d'un scan compact pour le tableau de bord (Radar KAMTECH) : un document par collecte.
const idOf = (lien) => lien.replace(/^https?:\/\//, '').replace(/[^A-Za-z0-9_\-.~:@+]+/g, '-').replace(/-+$/, '').slice(0, 180);
const scan = {
  date: new Date().toISOString().slice(0, 10),
  requete: 'mychariow',
  pays: [...new Set(rows.flatMap((r) => r.pays))].filter((p) => p !== 'ALL').sort(),
  pubs: pubs.size,
  boutiques: new Set(rows.map((r) => r.boutique)).size,
  produits: rows.map((r) => ({
    id: idOf(r.lien),
    titre: r.titre.trim(),
    page: r.page,
    niche: r.niche,
    prix: r.prix,
    achats: r.achats,
    achatsTexte: r.achatsTexte || null,
    avis: r.avis,
    jours: r.joursMax,
    variantes: r.variantes,
    pays: r.pays.filter((p) => p !== 'ALL'),
    formats: r.formats,
    rebours: r.compteARebours,
    score: r.score,
    accroche: r.accroche,
    lien: r.lien,
    pub: r.pubUrl,
  })),
};
fs.writeFileSync(path.join(DIR, 'data', 'scan.json'), JSON.stringify(scan));
