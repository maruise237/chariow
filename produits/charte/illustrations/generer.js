// Générateur d'illustrations KAMTECH (Open Peeps via react-peeps).
// Usage : NODE_PATH=$(npm root -g) node generer.js [id ...]
const fs = require('fs');
const path = require('path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Peep = require('react-peeps').default;
const { chromium } = require('playwright');

const TRAIT = '#16181D';
const SENTINELLE = '#ABCDEF';           // remplacée par var(--peau, ...)
const PEAU_DEFAUT = '#B9814F';
const MARGE = 0.02;
const SORTIE = path.join(__dirname, '..', 'assets', 'illustrations');
const CONTROLE = path.join(__dirname, 'controle');

const personnages = JSON.parse(fs.readFileSync(path.join(__dirname, 'personnages.json'), 'utf8'));
const filtre = process.argv.slice(2);
const liste = filtre.length ? personnages.filter(p => filtre.includes(p.id)) : personnages;

function rendre(p) {
  return renderToStaticMarkup(React.createElement(Peep, {
    body: p.body, hair: p.hair, face: p.face,
    facialHair: p.facialHair || 'None', accessory: p.accessory || 'None',
    strokeColor: TRAIT, backgroundColor: SENTINELLE,
  }));
}

const r2 = n => Math.round(n * 100) / 100;

(async () => {
  fs.mkdirSync(SORTIE, { recursive: true });
  fs.mkdirSync(CONTROLE, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
  const resultats = [];

  for (const p of liste) {
    const brut = rendre(p);
    // Mesure : svg à l'échelle 1:1 (1 unité = 1 px), débordement visible.
    await page.setContent(`<body style="margin:0">${brut.replace('<svg ', '<svg width="850" height="1200" style="overflow:visible;position:absolute;left:300px;top:300px" ')}</body>`);
    const boite = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const o = svg.getBoundingClientRect();
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      svg.querySelectorAll('path,rect,circle,ellipse,polygon,polyline,line').forEach(el => {
        if (el.closest('defs,clipPath,mask')) return;
        const b = el.getBoundingClientRect();
        if (!b.width && !b.height) return;
        x0 = Math.min(x0, b.left - o.left); y0 = Math.min(y0, b.top - o.top);
        x1 = Math.max(x1, b.right - o.left); y1 = Math.max(y1, b.bottom - o.top);
      });
      return { x0, y0, x1, y1 };
    });
    const w = boite.x1 - boite.x0, h = boite.y1 - boite.y0;
    const mx = w * MARGE, my = h * MARGE;
    const vb = [r2(boite.x0 - mx), r2(boite.y0 - my), r2(w + 2 * mx), r2(h + 2 * my)];

    let svg = brut.replace(/^<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" role="img" aria-label="${p.id}">`);
    const nbSentinelle = (svg.match(new RegExp(SENTINELLE, 'gi')) || []).length;
    svg = svg.replace(new RegExp(SENTINELLE, 'gi'), `var(--peau, ${PEAU_DEFAUT})`);
    const fichier = path.join(SORTIE, p.id + '.svg');
    fs.writeFileSync(fichier, svg + '\n');

    // Capture de contrôle (fond crème, 400 px de large).
    const pw = 400, ph = Math.round(pw * vb[3] / vb[2]);
    await page.setViewportSize({ width: pw, height: ph });
    await page.setContent(`<body style="margin:0;background:#FAF8F2"><img style="display:block;width:${pw}px" src="data:image/svg+xml;base64,${Buffer.from(svg.replace(/var\(--peau, ([^)]+)\)/g, '$1')).toString('base64')}"></body>`);
    await page.screenshot({ path: path.join(CONTROLE, p.id + '.png') });
    resultats.push({ id: p.id, vb, octets: Buffer.byteLength(svg), nbSentinelle });
    console.log(`${p.id}: ${Buffer.byteLength(svg)} o, viewBox ${vb.join(' ')}, remplissages peau: ${nbSentinelle}`);
  }

  // Planche : tous les personnages côte à côte (hauteur commune).
  const tous = personnages.filter(p => fs.existsSync(path.join(SORTIE, p.id + '.svg')));
  const H = 420;
  const cellules = tous.map(p => {
    const s = fs.readFileSync(path.join(SORTIE, p.id + '.svg'), 'utf8').replace(/var\(--peau, ([^)]+)\)/g, '$1');
    return `<div style="text-align:center;font:12px sans-serif;color:#16181D"><img style="height:${H}px;display:block;margin:0 auto" src="data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}">${p.id}</div>`;
  });
  await page.setViewportSize({ width: 1800, height: 500 });
  await page.setContent(`<body style="margin:0;background:#FAF8F2"><div style="display:flex;gap:24px;align-items:flex-end;padding:24px;width:max-content">${cellules.join('')}</div></body>`);
  await page.screenshot({ path: path.join(CONTROLE, 'planche.png'), fullPage: true });
  await browser.close();
  console.log('Planche : ' + path.join(CONTROLE, 'planche.png'));
})().catch(e => { console.error(e); process.exit(1); });
