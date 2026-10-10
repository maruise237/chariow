// Génère l'aperçu de la charte des e-books (PDF + PNG par page).
// Usage : node produits/charte/generer.js [excel|compta|boutique]
// Sortie : produits/charte/apercu/<produit>.pdf et apercu/png/<produit>-NN.png
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const produits = require('./produits');

const ICI = __dirname;
const SORTIE = path.join(ICI, 'apercu');

// Couleurs de la marque Easy Store (logo de la boutique esaystor)
const MARQUE = { profond: '#001DA1', vif: '#1080FF' };

const ico = {
  check: '<svg viewBox="0 0 24 24" width="1em" height="1em"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  fleche: '<svg viewBox="0 0 24 24" width="1em" height="1em"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M7 12h9m-3.5-4l4 4-4 4" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  alerte: '<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 2L1 21h22z" fill="currentColor"/><path d="M12 9v5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="17.3" r="1.4" fill="#fff"/></svg>',
  ampoule: '<svg viewBox="0 0 24 24" width="1em" height="1em"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M12 6a4 4 0 00-2.4 7.2V15h4.8v-1.8A4 4 0 0012 6zM10 17h4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
};

// Motif organique de fond (comme le modèle Chariow), teinté par produit
function motif(couleur, opacite = 1) {
  return `<svg class="motif" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" style="opacity:${opacite}">
    <g fill="${couleur}">
      <path d="M-60 120C80 40 260 90 300 240s-60 300-200 330S-120 460-140 330-200 200-60 120z"/>
      <path d="M520-80c140 10 330 90 320 230s-170 160-300 120S360 120 380 40 400-90 520-80z"/>
      <path d="M260 430c120-60 290-20 330 120s-40 330-190 360-260-60-280-180 20-240 140-300z"/>
      <path d="M640 520c90-20 200 60 190 170s-90 190-180 170-110-110-100-200 0-120 90-140z"/>
      <path d="M-40 800c110-40 250 0 290 100s-40 170-170 170-200-60-220-140 0-100 100-130z"/>
    </g></svg>`;
}

function pied(p, n) {
  return `<footer class="pied"><span>${p.court}</span><span class="num">${n}</span><img src="../assets/logo-easystore.png" alt=""></footer>`;
}

// ---------- Pages ----------

function couverture(p) {
  return `<section class="page couv">
    ${motif('rgba(255,255,255,.06)')}
    <div class="couv-grille"></div>
    <header class="couv-haut">
      <img class="logo" src="../assets/logo-easystore-blanc.png" alt="Easy Store">
      <span class="pastille">${p.collection}</span>
    </header>
    <div class="couv-titre">
      <p class="surtitre">${p.surtitre}</p>
      <h1>${p.titreCouv}</h1>
      <p class="sous-titre">${p.sousTitre}</p>
    </div>
    <div class="couv-visuel">${p.visuel}</div>
    <div class="couv-bas">
      <ul class="atouts">${p.atouts.map(a => `<li>${ico.check}<span>${a}</span></li>`).join('')}</ul>
      <p class="signature">Un e-book <b>KAMTECH</b> · esaysto.mychariow.shop</p>
    </div>
  </section>`;
}

function avertissement(p) {
  return `<section class="page clair">
    ${motif('var(--motif)')}
    <div class="bande-noire">${ico.alerte}<span>AVERTISSEMENT · USAGE STRICTEMENT PERSONNEL</span></div>
    <div class="corps avert">
      <p>Cet e-book <b>« ${p.titreCourt} »</b> et ses fichiers bonus te sont vendus pour ton usage personnel.</p>
      <p>Il contient :</p>
      <ul class="puces-gras">${p.contenuPack.map(c => `<li>${c}</li>`).join('')}</ul>
      <p class="fort"><i>Toute revente, copie, partage dans un groupe WhatsApp ou Telegram, ou distribution gratuite ou payante de cet e-book est strictement interdite.</i></p>
      <p>Chaque exemplaire est lié à un achat. En utilisant cet e-book, tu acceptes ces conditions.</p>
      <p class="fort">© ${p.annee} KAMTECH · Easy Store. Tous droits réservés.</p>
    </div>
    <img class="logo-bas" src="../assets/logo-easystore.png" alt="Easy Store">
  </section>`;
}

function sommaire(p) {
  return `<section class="page clair">
    ${motif('var(--motif)')}
    <div class="corps">
      <h1 class="h-page">Sommaire</h1>
      <ol class="toc">${p.sommaire.map((s, i) => `<li><span class="toc-n">${s[0]}</span><span class="toc-t">${s[1]}</span><span class="toc-p">${s[2]}</span></li>`).join('')}</ol>
    </div>
    ${pied(p, 3)}
  </section>`;
}

function modeEmploi(p) {
  return `<section class="page clair">
    ${motif('var(--motif)')}
    <div class="corps">
      <h1 class="h-page">Comment lire<br>cet e-book</h1>
      ${p.modeEmploi.map((b, i) => `
        ${i ? '<hr>' : ''}
        <h2 class="h-num">${i + 1}. ${b.titre}</h2>
        ${b.texte ? `<p>${b.texte}</p>` : ''}
        ${b.etapes ? `<ul class="etapes">${b.etapes.map(e => `<li>${ico.fleche}<span>${e}</span></li>`).join('')}</ul>` : ''}
      `).join('')}
    </div>
    ${pied(p, 4)}
  </section>`;
}

function ouvertureChapitre(p) {
  const c = p.chapitre;
  return `<section class="page clair ouverture">
    ${motif('var(--motif)')}
    <div class="ouv-haut">
      <span class="ouv-num">${c.num}</span>
      <div class="ouv-carte">${c.visuel}</div>
    </div>
    <div class="panneau">
      <p class="panneau-kicker">Chapitre ${c.num}</p>
      <h1>${c.titre}</h1>
      <p class="panneau-accent">Tu vas savoir : ${c.objectif}</p>
      <p>${c.intro}</p>
      <div class="cta">
        <span class="cta-pilule">Lecture : ${c.duree}</span>
        <span class="cta-bande">Bonus lié : <b>${c.bonus}</b></span>
      </div>
    </div>
  </section>`;
}

function pageContenu(p) {
  const c = p.contenu;
  return `<section class="page clair">
    ${motif('var(--motif)')}
    <div class="corps">
      <p class="fil">Chapitre ${p.chapitre.num} · ${p.chapitre.titreCourt}</p>
      <h1 class="h-page petit">${c.titre}</h1>
      <p>${c.intro}</p>
      <div class="prompt">
        <div class="prompt-tete"><span>PROMPT À COPIER</span><span class="prompt-n">${c.promptNum}</span></div>
        <p>${c.prompt}</p>
      </div>
      <div class="resultat">
        <span class="resultat-label">${c.resultatLabel}</span>
        <div class="resultat-code${c.mono ? ' mono' : ''}">${c.resultat}</div>
      </div>
      <div class="encart erreur">${ico.alerte}<div><b>Erreur fréquente.</b> ${c.erreur}</div></div>
      <div class="encart astuce">${ico.ampoule}<div><b>Astuce.</b> ${c.astuce}</div></div>
    </div>
    ${pied(p, c.page)}
  </section>`;
}

function aPropos(p) {
  return `<section class="page blanc">
    <div class="bande-accent"><h1>À propos de l'auteur</h1></div>
    <div class="corps centre">
      <p>Cet e-book a été conçu par <b>KAMTECH</b>, au Cameroun.</p>
      <p class="maj">Notre mission ?</p>
      <p>Mettre l'intelligence artificielle au service de ceux qui travaillent en Afrique francophone : employés, comptables, commerçants. Des méthodes simples, testées sur téléphone, avec des exemples en FCFA.</p>
      <p>${p.suite}</p>
      <p class="suivre">Retrouve nos autres e-books</p>
      <p class="lien">esaysto.mychariow.shop</p>
      <p class="lien-fb">Facebook : Easy Store</p>
    </div>
    <img class="logo-bas" src="../assets/logo-easystore.png" alt="Easy Store">
  </section>`;
}

function quatrieme(p) {
  return `<section class="page dos">
    ${motif('rgba(255,255,255,.07)')}
    <div class="dos-centre">
      <img src="../assets/logo-easystore-blanc.png" alt="Easy Store">
      <span class="sep"></span>
      <span class="kamtech">KAMTECH</span>
    </div>
    <p class="dos-bas">Une création <b>KAMTECH</b> · Cameroun<br><b>${p.dateEdition}</b></p>
  </section>`;
}

// ---------- Styles ----------

function css(p) {
  const t = p.theme;
  return `
  @font-face{font-family:Fraunces;font-weight:700;src:url(../assets/fonts/fraunces-latin-700-normal.woff2)}
  @font-face{font-family:Fraunces;font-weight:700;font-style:italic;src:url(../assets/fonts/fraunces-latin-700-italic.woff2)}
  @font-face{font-family:Outfit;font-weight:400;src:url(../assets/fonts/outfit-latin-400-normal.woff2)}
  @font-face{font-family:Outfit;font-weight:600;src:url(../assets/fonts/outfit-latin-600-normal.woff2)}
  @font-face{font-family:Outfit;font-weight:800;src:url(../assets/fonts/outfit-latin-800-normal.woff2)}
  @page{size:203.2mm 254mm;margin:0}
  :root{--p:${t.primaire};--f:${t.fonce};--a:${t.accent};--fond:${t.fond};--motif:${t.motif};--encre:#16181D;--m1:${MARQUE.profond};--m2:${MARQUE.vif}}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Outfit,sans-serif;color:var(--encre);-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{width:203.2mm;height:254mm;position:relative;overflow:hidden;page-break-after:always}
  .motif{position:absolute;inset:0;width:100%;height:100%;z-index:0}
  .page>*:not(.motif){position:relative;z-index:1}
  .clair{background:var(--fond)}
  .blanc{background:#fff}
  h1,.serif{font-family:Fraunces,serif;font-weight:700;letter-spacing:-.01em;line-height:1.02}
  p{font-size:14pt;line-height:1.45;margin-bottom:4.5mm}
  b{font-weight:600}

  /* Couverture */
  .couv{display:flex;flex-direction:column;background:radial-gradient(120% 80% at 85% 0%, ${t.primaire} 0%, ${t.fonce} 62%);color:#fff;padding:14mm 15mm}
  .couv-grille{position:absolute!important;inset:0;background-image:radial-gradient(rgba(255,255,255,.13) 1px,transparent 1.4px);background-size:7mm 7mm;mask-image:linear-gradient(180deg,#000 0%,transparent 55%);-webkit-mask-image:linear-gradient(180deg,#000,transparent 55%)}
  .couv-haut{display:flex;justify-content:space-between;align-items:center}
  .couv-haut .logo{height:13mm}
  .pastille{border:1.5px solid var(--a);color:var(--a);border-radius:99px;padding:1.6mm 4.5mm;font-weight:600;font-size:10pt;letter-spacing:.06em;text-transform:uppercase}
  .couv-titre{margin-top:12mm}
  .surtitre{display:inline-block;background:var(--a);color:${t.surAccent};font-weight:800;font-size:10.5pt;letter-spacing:.08em;text-transform:uppercase;padding:1.5mm 4mm;border-radius:2mm;margin-bottom:5mm}
  .couv h1{font-size:${p.tailleTitre || 50}pt;line-height:.98}
  .couv h1 em{font-style:italic;color:var(--a)}
  .sous-titre{font-size:14.5pt;margin-top:5mm;max-width:150mm;opacity:.92}
  .couv-visuel{flex:1;display:flex;align-items:center;justify-content:center;padding:6mm 0}
  .couv-bas{flex:none}
  .atouts{list-style:none;display:flex;gap:3mm;flex-wrap:wrap;margin-bottom:6mm}
  .atouts li{display:flex;align-items:center;gap:2mm;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:99px;padding:2mm 4mm 2mm 2.5mm;font-size:10.5pt;font-weight:600;color:#fff}
  .atouts svg{color:var(--a);font-size:13pt}
  .atouts svg path{stroke:${t.surAccent}}
  .signature{font-size:10pt;opacity:.75;margin:0}

  /* Cartes de visuel (couverture et chapitres) */
  .carte{background:#fff;color:var(--encre);border-radius:4mm;box-shadow:0 6mm 14mm rgba(0,0,0,.35);overflow:hidden;font-size:10pt}
  .bulle{border-radius:4mm;padding:3mm 4mm;font-size:10.5pt;line-height:1.35;box-shadow:0 3mm 8mm rgba(0,0,0,.25);max-width:80mm}
  .bulle.moi{background:#fff;color:var(--encre);border-bottom-right-radius:1mm}
  .bulle.ia{background:var(--a);color:${t.surAccent};border-bottom-left-radius:1mm;font-weight:600}
  .bulle small{display:block;font-size:8pt;font-weight:800;letter-spacing:.08em;opacity:.7;margin-bottom:1mm}

  /* Bande avertissement / à propos */
  .bande-noire{margin-top:22mm;background:var(--f);color:#fff;display:flex;align-items:center;justify-content:center;gap:3mm;padding:5mm;font-family:Fraunces,serif;font-size:17pt;font-weight:700}
  .bande-noire svg{color:var(--a);font-size:18pt}
  .bande-noire svg path:last-child,.bande-noire svg circle{fill:${t.surAccent}}
  .corps{padding:16mm 17mm 0}
  .avert p{font-size:14.5pt}
  .puces-gras{margin:0 0 5mm 8mm;font-weight:600;font-size:14.5pt;line-height:1.6}
  .fort{font-weight:600}
  .logo-bas{position:absolute!important;bottom:16mm;left:50%;transform:translateX(-50%);height:18mm}

  /* Pages de texte */
  .h-page{font-size:36pt;margin-bottom:9mm}
  .h-page.petit{font-size:27pt;margin-bottom:6mm}
  .h-num{font-size:16.5pt;font-weight:800;margin-bottom:3mm}
  hr{border:0;border-top:1.2px solid var(--encre);margin:6mm 0 6mm -4mm;opacity:.85}
  .etapes{list-style:none}
  .etapes li{display:flex;gap:3mm;align-items:flex-start;font-size:14pt;line-height:1.4;margin-bottom:2.5mm}
  .etapes svg{flex:none;color:var(--f);font-size:13pt;margin-top:.6mm}
  .fil{font-size:10pt;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--p);margin-bottom:3mm}
  .toc{list-style:none}
  .toc li{display:flex;align-items:baseline;gap:4mm;padding:4.6mm 0;border-bottom:1px solid rgba(0,0,0,.14)}
  .toc-n{font-family:Fraunces,serif;font-size:20pt;color:var(--p);width:12mm;flex:none}
  .toc-t{flex:1;font-size:14pt;font-weight:600}
  .toc-p{font-size:11pt;opacity:.6}
  .pied{position:absolute!important;left:17mm;right:17mm;bottom:9mm;display:flex;align-items:center;justify-content:space-between;font-size:9pt;opacity:.75}
  .pied img{height:7mm}
  .pied .num{font-weight:800}

  /* Prompt, résultat, encarts */
  .prompt{background:var(--f);color:#fff;border-radius:4mm;padding:4mm 5mm;margin:2mm 0 4mm}
  .prompt-tete{display:flex;justify-content:space-between;font-size:9pt;font-weight:800;letter-spacing:.1em;color:var(--a);margin-bottom:2mm}
  .prompt p{font-size:13pt;margin:0}
  .resultat{border:1.5px solid var(--p);border-radius:4mm;background:#fff;margin-bottom:4mm;overflow:hidden}
  .resultat-label{display:block;background:var(--p);color:#fff;font-size:9pt;font-weight:800;letter-spacing:.08em;padding:1.5mm 5mm;text-transform:uppercase}
  .resultat-code{padding:3.5mm 5mm;font-size:13pt;line-height:1.45}
  .resultat-code.mono{font-family:'DejaVu Sans Mono',monospace;font-size:12pt}
  .resultat-code table{width:100%;border-collapse:collapse}.resultat-code td{padding:1mm 0;border-bottom:1px solid #eee}.resultat-code td.n{text-align:right;font-variant-numeric:tabular-nums;width:28mm}.resultat-code td.c{font-weight:800;color:var(--p);width:16mm}
  .encart{display:flex;gap:3mm;border-radius:4mm;padding:4mm 5mm;margin-bottom:4mm;font-size:13pt;line-height:1.4}
  .encart svg{flex:none;font-size:14pt;margin-top:.3mm}
  .erreur{background:#FFE9E4}.erreur svg{color:#D63B1F}
  .astuce{background:#fff}.astuce svg{color:var(--p)}

  /* Ouverture de chapitre (panneau arrondi comme le modèle) */
  .ouv-haut{height:105mm;display:flex;align-items:center;justify-content:space-between;padding:0 16mm}
  .ouv-num{font-family:Fraunces,serif;font-size:150pt;line-height:1;color:transparent;-webkit-text-stroke:2px var(--p)}
  .ouv-carte{transform:rotate(-3deg)}
  .panneau{position:absolute!important;left:0;right:0;bottom:0;top:110mm;background:var(--f);color:#fff;border-radius:22mm 22mm 0 0;padding:16mm 16mm 0}
  .panneau-kicker{font-size:11pt;font-weight:800;letter-spacing:.1em;text-transform:uppercase;opacity:.7;margin-bottom:2mm}
  .panneau h1{font-size:38pt;margin-bottom:6mm}
  .panneau-accent{color:var(--a);font-weight:600;font-size:15.5pt}
  .cta{position:absolute;left:16mm;right:0;bottom:16mm;display:flex;align-items:center}
  .cta-pilule{background:var(--a);color:${t.surAccent};font-weight:800;font-size:13pt;padding:4mm 7mm;border-radius:99px;position:relative;z-index:2;white-space:nowrap}
  .cta-bande{background:#fff;color:var(--encre);flex:1;padding:4mm 6mm 4mm 12mm;margin-left:-8mm;font-size:11.5pt}

  /* À propos */
  .bande-accent{margin-top:22mm;background:var(--a);text-align:center;padding:4mm}
  .bande-accent h1{font-size:28pt;color:${t.surAccent}}
  .centre{text-align:center;padding-top:20mm}.centre p{font-size:15pt}
  .maj{font-weight:800;text-transform:uppercase;margin:6mm 0 1mm}
  .suivre{margin-top:12mm}
  .lien{color:var(--m2);font-weight:600;font-size:15pt}
  .lien-fb{font-weight:600}

  /* 4e de couverture : couleurs de la marque */
  .dos{background:linear-gradient(160deg,${MARQUE.vif} -20%,${MARQUE.profond} 55%,#000A4A 100%);color:#fff}
  .dos-centre{position:absolute!important;inset:0;display:flex;align-items:center;justify-content:center;gap:9mm}
  .dos-centre img{height:30mm}
  .dos-centre .sep{width:1px;height:28mm;background:rgba(255,255,255,.5)}
  .dos-centre .kamtech{font-family:Fraunces,serif;font-size:30pt;font-weight:700;letter-spacing:.04em}
  .dos-bas{position:absolute!important;bottom:16mm;left:0;right:0;text-align:center;font-size:11.5pt}
  ${p.cssEnPlus || ''}
  `;
}

function html(p) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${p.titreCourt}</title><style>${css(p)}</style></head><body>
  ${couverture(p)}
  ${avertissement(p)}
  ${sommaire(p)}
  ${modeEmploi(p)}
  ${ouvertureChapitre(p)}
  ${pageContenu(p)}
  ${aPropos(p)}
  ${quatrieme(p)}
  </body></html>`;
}

(async () => {
  const cles = process.argv[2] ? [process.argv[2]] : Object.keys(produits);
  fs.mkdirSync(path.join(SORTIE, 'png'), { recursive: true });
  const nav = await chromium.launch();
  for (const cle of cles) {
    const p = produits[cle];
    const fichier = path.join(SORTIE, `${cle}.html`);
    fs.writeFileSync(fichier, html(p));
    const page = await nav.newPage({ viewport: { width: 768, height: 960 }, deviceScaleFactor: 1 });
    await page.goto('file://' + fichier);
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: path.join(SORTIE, `${cle}.pdf`), preferCSSPageSize: true, printBackground: true });
    const pages = await page.$$('section.page');
    for (let i = 0; i < pages.length; i++) {
      await pages[i].screenshot({ path: path.join(SORTIE, 'png', `${cle}-${String(i + 1).padStart(2, '0')}.png`) });
    }
    await page.close();
    console.log(`${cle} : ${pages.length} pages`);
  }
  await nav.close();
})();
