// Rendu reproductible des visuels : HTML (src/*.html) -> PNG (Playwright, polices locales via @font-face dans src/base.css).
// Usage : NODE_PATH=$(npm root -g) node rendre.cjs [nom ...]   (sans argument : tout rendre)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, 'src');

// nom du fichier de sortie, source HTML, dimensions
const VISUELS = [
  ['vignette-1200', 'vignette', 1200, 1200],
  ['vignette-v2-1200', 'vignette-v2', 1200, 1200],
  ['vignette-v3-1200', 'vignette-v3', 1200, 1200],
  ['vignette-livre-1200', 'vignette-livre', 1200, 1200],
  ['seo-1200x1200', 'vignette-v3', 1200, 1200],
  ['banniere-1620x600', 'banniere', 1620, 600],
  ['partage-1200x627', 'partage', 1200, 627],
  ['mockup-couverture', 'mockup-couverture', 1080, 1350],
  ['mockup-capture', 'mockup-capture', 1080, 1350],
  ['mockup-prompt', 'mockup-prompt', 1080, 1350],
  ['mockup-modele', 'mockup-modele', 1080, 1350],
  ['affiche-1080x1080', 'affiche-erreur', 1080, 1080],
  ['affiche-1080x1350', 'affiche-77', 1080, 1350],
  ['story-1080x1920', 'story', 1080, 1920],
];

// Gabarits : {f} = espace fine insécable (U+202F absente de nos polices : on la simule en corps réduit)
const STATUS = `<div class="island"></div><div class="status"><span>14:07</span><span class="ic"><span class="sig"><i style="height:5px"></i><i style="height:8px"></i><i style="height:11px"></i><i style="height:14px"></i></span><span class="bat"><i></i></span></span></div>`;
const habiller = h => h.replace(/\{f\}/g, '<span class="f">&nbsp;</span>').replace(/\{\{statusbar\}\}/g, STATUS);

(async () => {
  const noms = process.argv.slice(2);
  const nav = await chromium.launch();
  for (const [sortie, source, w, h, hash = ''] of VISUELS) {
    if (noms.length && !noms.includes(sortie)) continue;
    const html = habiller(fs.readFileSync(path.join(SRC, source + '.html'), 'utf8'));
    const tmp = path.join(SRC, `.${source}.rendu.html`);       // copie habillée, à côté pour que les chemins relatifs marchent
    fs.writeFileSync(tmp, html);
    const page = await nav.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await page.goto('file://' + tmp + hash);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(__dirname, sortie + '.png') });
    await page.close();
    fs.unlinkSync(tmp);
    console.log('OK', sortie + '.png', `${w}x${h}`);
  }
  await nav.close();
})();
