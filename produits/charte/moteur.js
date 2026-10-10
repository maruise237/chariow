// Moteur des e-books KAMTECH : source texte (.md) → PDF mis en page.
// Usage : node produits/charte/moteur.js <source.md> [<source.md>...]
// Sortie : à côté de la source, dans sortie/ : <nom>.pdf, <nom>.html, png/ (pages), vignettes.
//
// Le moteur ne fige pas la mise en page : il choisit chaque gabarit selon la DA du produit
// (da.js) et le type de bloc écrit dans la source. Voir DIRECTION-ARTISTIQUE.md.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { MARQUE, DA, POLICES } = require('./da');
const { visuel, CSS: CSS_VISUELS } = require('./visuels');

const ASSETS = path.join(__dirname, 'assets');
const polices = () => POLICES.replace(/\.\.\/assets\//g, `file://${ASSETS}/`);

// ---------- Lecture de la source ----------

const echap = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Typographie française (Lexique des règles typographiques de l'Imprimerie nationale) :
// espace fine insécable avant ; ! ? et dans les guillemets, insécable avant : et entre un nombre
// et son unité, apostrophe courbe, milliers séparés par une fine. Jamais appliqué au code.
const FINE = ' ', INSEC = ' ';
function typo(s) {
  let t = s
    .replace(/'/g, '’')
    .replace(/\.\.\./g, '…')
    .replace(/«\s*/g, '«' + FINE).replace(/\s*»/g, FINE + '»')
    .replace(/\s+([;!?])/g, FINE + '$1')
    .replace(/([\wÀ-ÿ»)])([!?])/g, '$1' + FINE + '$2')
    .replace(/\s+:(?=\s|$)/g, INSEC + ':')
    .replace(/(\d) (?=\d{3}(?!\d))/g, '$1' + FINE)
    .replace(/(\d)\s+(F|FCFA|%|min|h|Mo|pages|ans|jours)(?=[\s.,;:!?)]|$)/g, '$1' + INSEC + '$2')
    .replace(/(\d)\s+(?=[\d]{3}\b)/g, '$1' + FINE);
  return t;
}
const fmt = s => echap(s).split(/(`[^`]+`)/).map(part => part.startsWith('`') && part.endsWith('`') && part.length > 1
  ? `<code>${part.slice(1, -1)}</code>`
  : typo(part).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<em>$1</em>')).join('');
// Titres : pas de mot ni de ponctuation seuls sur la dernière ligne
const titre = s => fmt(s).replace(/ (\S+)$/, INSEC + '$1');

function clesValeurs(lignes) {
  const o = {};
  for (const l of lignes) {
    const m = l.match(/^(\w+)\s*:\s*(.*)$/);
    if (m) o[m[1]] = m[2].trim();
  }
  return o;
}

function lire(source) {
  const txt = fs.readFileSync(source, 'utf8').replace(/\r/g, '');
  const m = txt.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error('En-tête --- manquant');
  const meta = clesValeurs(m[1].split('\n'));
  const lignes = txt.slice(m[0].length).split('\n');
  const blocs = [];
  let para = [];
  const finPara = () => { if (para.length) { blocs.push({ t: 'p', x: para.join(' ') }); para = []; } };

  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i];
    const dir = l.match(/^:::(\w[\w-]*)\s*(.*)$/);
    if (dir) {
      finPara();
      const corps = [];
      while (++i < lignes.length && lignes[i].trim() !== ':::') corps.push(lignes[i]);
      blocs.push({ t: dir[1], arg: dir[2].trim(), lignes: corps, kv: clesValeurs(corps) });
      continue;
    }
    if (!l.trim()) { finPara(); continue; }
    let r;
    if ((r = l.match(/^(#{1,3})\s+(.*)$/))) { finPara(); blocs.push({ t: 'h' + r[1].length, x: r[2] }); continue; }
    if ((r = l.match(/^\s*[-•]\s+(.*)$/))) {
      finPara();
      const der = blocs[blocs.length - 1];
      if (der && der.t === 'ul') der.items.push(r[1]); else blocs.push({ t: 'ul', items: [r[1]] });
      continue;
    }
    if ((r = l.match(/^\s*\d+[.)]\s+(.*)$/))) {
      finPara();
      const der = blocs[blocs.length - 1];
      if (der && der.t === 'ol') der.items.push(r[1]); else blocs.push({ t: 'ol', items: [r[1]] });
      continue;
    }
    if (l.startsWith('|')) {
      finPara();
      const cells = l.split('|').slice(1, -1).map(c => c.trim());
      if (cells.every(c => /^:?-+:?$/.test(c))) continue;
      const der = blocs[blocs.length - 1];
      if (der && der.t === 'table') der.rows.push(cells); else blocs.push({ t: 'table', rows: [cells] });
      continue;
    }
    if ((r = l.match(/^>\s?(.*)$/))) { finPara(); blocs.push({ t: 'citation', x: r[1] }); continue; }
    para.push(l.trim());
  }
  finPara();
  return { meta, blocs };
}

// ---------- Contrôle des règles de la charte ----------

function controler({ meta, blocs }) {
  const alertes = [];
  const mots = s => s.replace(/[*`]/g, '').split(/\s+/).filter(Boolean).length;
  if (mots(meta.titreCouv || meta.titre) > 7) alertes.push(`Titre de couverture de ${mots(meta.titreCouv || meta.titre)} mots : viser 7 au plus pour la vignette.`);
  if (!DA[meta.da]) alertes.push(`DA inconnue « ${meta.da} ». Choix : ${Object.keys(DA).join(', ')}.`);
  let chap = null, aRecap = true;
  const finChap = () => { if (chap && !aRecap) alertes.push(`Chapitre ${chap} sans bloc :::recap (structure intro, contenu, récap).`); };
  for (const b of blocs) {
    if (b.t === 'chapitre') { finChap(); chap = b.arg; aRecap = false; }
    if (b.t === 'recap') aRecap = true;
    if (b.t === 'p' && mots(b.x) > 75) alertes.push(`Paragraphe de ${mots(b.x)} mots (chap. ${chap || 'intro'}) : couper, viser 60 au plus sur téléphone.`);
  }
  finChap();
  return alertes;
}

// ---------- Rendu ----------

const ico = {
  check: '<svg viewBox="0 0 24 24" width="1em" height="1em"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M7 12.5l3.2 3.2L17 9" stroke="var(--surIco,#fff)" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  alerte: '<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 2L1 21h22z" fill="currentColor"/><path d="M12 9v5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="17.3" r="1.4" fill="#fff"/></svg>',
  ampoule: '<svg viewBox="0 0 24 24" width="1em" height="1em"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M12 6a4 4 0 00-2.4 7.2V15h4.8v-1.8A4 4 0 0012 6zM10 17h4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
  case: '<svg viewBox="0 0 24 24" width="1em" height="1em"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
};

const logo = (clair = false) => `<span class="logo${clair ? ' clair' : ''}"><i></i>${MARQUE.nom}</span>`;
const titreRiche = s => titre(s); // *mot* → <em>mot</em> : le mot mis en accent

function couverture(m, da) {
  const atouts = (m.atouts || '').split('|').map(s => s.trim()).filter(Boolean);
  const bas = `<div class="couv-bas">
      <ul class="atouts">${atouts.map(a => `<li>${ico.check}<span>${fmt(a)}</span></li>`).join('')}</ul>
      <div class="signature">${logo(true)}<span>${m.edition || ''}</span></div>
    </div>`;
  if (da.couverture === 'typo') {
    const mots = (m.motsCles || '').split('|').map(s => s.trim()).filter(Boolean);
    return `<section class="plein couv couv-typo motif-${da.motif}">
      <header class="couv-haut"><span class="collection">${fmt(m.collection || '')}</span><span class="surtitre-ligne">${fmt(m.surtitre || '')}</span></header>
      <div class="couv-titre"><h1>${titreRiche(m.titreCouv || m.titre)}</h1><p class="sous-titre">${fmt(m.sousTitre || '')}</p></div>
      ${mots.length ? `<p class="mots-cles">${mots.map(fmt).join('<i>·</i>')}</p>` : ''}
      ${bas}
    </section>`;
  }
  return `<section class="plein couv couv-scene motif-${da.motif}">
    <header class="couv-haut">${logo(true)}<span class="pastille">${fmt(m.collection || '')}</span></header>
    <div class="couv-titre">
      <p class="surtitre">${fmt(m.surtitre || '')}</p>
      <h1>${titreRiche(m.titreCouv || m.titre)}</h1>
      <p class="sous-titre">${fmt(m.sousTitre || '')}</p>
    </div>
    <div class="couv-visuel"><div class="zoom">${visuel(m.visuel)}</div></div>
    ${bas.replace(logo(true), `<span class="par">Un e-book ${MARQUE.nom}</span>`)}
  </section>`;
}

function licence(m) {
  const contenu = (m.contenu || '').split('|').map(s => s.trim()).filter(Boolean);
  return `<section class="plein page-licence">
    <div class="bande">${ico.alerte}<span>Usage strictement personnel</span></div>
    <div class="marges">
      <p>Cet e-book <b>« ${fmt(m.titre)} »</b> et ses fichiers bonus te sont vendus pour ton usage personnel. Il contient :</p>
      <ul class="liste">${contenu.map(c => `<li>${fmt(c)}</li>`).join('')}</ul>
      <p class="fort"><em>Toute revente, copie, partage dans un groupe WhatsApp ou Telegram, ou distribution gratuite ou payante est strictement interdite.</em></p>
      <p>Chaque exemplaire est lié à un achat. En utilisant cet e-book, tu acceptes ces conditions.</p>
      <p class="fort">© ${(m.edition || '').split(' ').pop()} ${MARQUE.nom}. Tous droits réservés.</p>
    </div>
    <div class="logo-bas">${logo()}</div>
  </section>`;
}

function sommaire(chapitres, pages) {
  return `<section class="plein page-sommaire">
    <div class="marges">
      <h1 class="h-page">Sommaire</h1>
      <ol class="toc">${chapitres.map(c => `<li><a href="#ch${c.arg}"><span class="toc-n">${c.arg}</span><span class="toc-t">${fmt(c.kv.titre)}</span><span class="toc-p">${pages[c.arg] || ''}</span></a></li>`).join('')}</ol>
    </div>
  </section>`;
}

function ouverture(b, variante, marqueur) {
  const k = b.kv;
  const meta = `<div class="ouv-meta">${k.duree ? `<span class="pilule">Lecture : ${fmt(k.duree)}</span>` : ''}${k.bonus ? `<span class="bonus">Bonus lié : <b>${fmt(k.bonus)}</b></span>` : ''}</div>`;
  const vis = k.visuel ? `<div class="ouv-visuel">${visuel(k.visuel)}</div>` : '';
  const id = `id="ch${b.arg}"`;
  const marq = marqueur ? `<span class="marqueur">@@CH${b.arg}@@</span>` : '';
  if (variante === 'scinde') {
    return `<section ${id} class="plein ouv ouv-scinde">${marq}
      <div class="col-num"><span>${b.arg}</span></div>
      <div class="col-texte">
        <p class="kicker">Chapitre ${b.arg}</p>
        <h1>${titre(k.titre)}</h1>
        <p class="objectif">${fmt(k.objectif || '')}</p>
        <p class="intro">${fmt(k.intro || '')}</p>
        ${vis}${meta}
      </div>
    </section>`;
  }
  if (variante === 'panneau') {
    return `<section ${id} class="plein ouv ouv-panneau">${marq}
      <div class="ouv-haut"><span class="num-contour">${b.arg}</span>${vis}</div>
      <div class="panneau">
        <p class="kicker">Chapitre ${b.arg}</p>
        <h1>${titre(k.titre)}</h1>
        <p class="objectif">Tu vas savoir : ${fmt(k.objectif || '')}</p>
        <p class="intro">${fmt(k.intro || '')}</p>
        ${meta}
      </div>
    </section>`;
  }
  return `<section ${id} class="plein ouv ouv-plein">${marq}
    <span class="num-geant">${b.arg}</span>
    <div class="ouv-plein-texte">
      <p class="kicker">Chapitre ${b.arg}</p>
      <h1>${titre(k.titre)}</h1>
      <p class="objectif">Tu vas savoir : ${fmt(k.objectif || '')}</p>
      <p class="intro">${fmt(k.intro || '')}</p>
    </div>
    ${vis}${meta}
  </section>`;
}

function pause(b) {
  const k = b.kv;
  return `<section class="plein pause">
    ${k.chiffre ? `<p class="pause-chiffre">${fmt(k.chiffre)}</p>` : ''}
    <p class="pause-texte">${fmt(k.texte || '')}</p>
    ${k.source ? `<p class="pause-source">${fmt(k.source)}</p>` : ''}
  </section>`;
}

function bloc(b) {
  const texte = () => b.lignes.filter(l => l.trim()).map(fmt).join('<br>');
  const items = () => b.lignes.map(l => l.match(/^\s*[-•]\s+(.*)$/)).filter(Boolean).map(r => r[1]);
  switch (b.t) {
    case 'p': return `<p>${fmt(b.x)}</p>`;
    case 'h1': return `<h1 class="h-section">${titre(b.x)}</h1>`;
    case 'h2': return `<h2>${titre(b.x)}</h2>`;
    case 'h3': return `<h3>${fmt(b.x)}</h3>`;
    case 'ul': return `<ul class="puces">${b.items.map(i => `<li>${fmt(i)}</li>`).join('')}</ul>`;
    case 'ol': return `<ol class="etapes">${b.items.map((i, n) => `<li><span class="n">${n + 1}</span><span>${fmt(i)}</span></li>`).join('')}</ol>`;
    case 'citation': return `<blockquote>${fmt(b.x)}</blockquote>`;
    case 'table': return `<table class="tab"><tr>${b.rows[0].map(c => `<th>${fmt(c)}</th>`).join('')}</tr>${b.rows.slice(1).map(r => `<tr>${r.map(c => `<td>${fmt(c)}</td>`).join('')}</tr>`).join('')}</table>`;
    case 'prompt': return `<div class="prompt"><div class="prompt-tete"><span>À copier</span><span>${fmt(b.arg)}</span></div><p>${texte()}</p></div>`;
    case 'resultat': {
      const [titre, opt] = b.arg.split('|').map(s => s.trim());
      return `<div class="resultat"><span class="resultat-label">${fmt(titre || 'Résultat')}</span><div class="resultat-corps${opt === 'mono' ? ' mono' : ''}">${opt === 'mono' ? b.lignes.filter(l => l.trim()).map(echap).join('<br>') : texte()}</div></div>`;
    }
    case 'erreur': return `<div class="encart erreur">${ico.alerte}<div><b>Erreur fréquente.</b> ${texte()}</div></div>`;
    case 'astuce': return `<div class="encart astuce">${ico.ampoule}<div><b>Astuce.</b> ${texte()}</div></div>`;
    case 'chiffre': return `<div class="chiffre"><span class="chiffre-v">${fmt(b.kv.valeur || b.arg)}</span><span class="chiffre-l">${fmt(b.kv.legende || '')}</span></div>`;
    case 'avantapres': return `<div class="aa"><div class="aa-av"><span>Avant</span><p>${fmt(b.kv.avant || '')}</p></div><div class="aa-ap"><span>Avec l'IA</span><p>${fmt(b.kv.apres || '')}</p></div></div>`;
    case 'recap': return `<div class="recap"><p class="recap-t">À retenir</p><ul>${items().map(i => `<li>${ico.check}<span>${fmt(i)}</span></li>`).join('')}</ul></div>`;
    case 'exercice': return `<div class="exercice"><p class="ex-t">À toi de jouer${b.arg ? ` · ${fmt(b.arg)}` : ''}</p><p>${texte()}</p></div>`;
    case 'checklist': return `<div class="checklist">${b.arg ? `<p class="ck-t">${fmt(b.arg)}</p>` : ''}<ul>${items().map(i => `<li>${ico.case}<span>${fmt(i)}</span></li>`).join('')}</ul></div>`;
    default: throw new Error(`Bloc inconnu :::${b.t}`);
  }
}

function auteur(m) {
  return `<section class="plein page-auteur">
    <div class="bande-accent"><h1>À propos de l'auteur</h1></div>
    <div class="marges centre">
      <p>Cet e-book a été conçu par <b>${MARQUE.nom}</b>, au Cameroun.</p>
      <p>${MARQUE.nom} écrit des guides pour utiliser l'intelligence artificielle dans le travail de tous les jours en Afrique francophone. Chaque méthode est testée sur téléphone, avec des montants en FCFA.</p>
      ${m.suite ? `<p class="suite">${fmt(m.suite)}</p>` : ''}
      <p class="lien">${MARQUE.boutique}</p>
    </div>
    <div class="logo-bas">${logo()}</div>
  </section>`;
}

function dos(m, da) {
  return `<section class="plein dos motif-${da.motif}">
    <div class="dos-centre">${logo(true)}<p>${fmt(m.titre)}</p></div>
    <p class="dos-bas">${MARQUE.boutique}<br>${m.edition || ''}</p>
  </section>`;
}

function document(src, pages = {}, marqueurs = false) {
  const { meta, blocs } = src;
  const da = DA[meta.da];
  const chapitres = blocs.filter(b => b.t === 'chapitre');
  const corps = [];
  let flux = [], nChap = 0;
  const vider = () => { if (flux.length) { corps.push(`<div class="flux">${flux.join('\n')}</div>`); flux = []; } };
  for (const b of blocs) {
    if (b.t === 'chapitre') {
      vider();
      // Variante choisie par la DA, en alternance pour le rythme ; la source peut l'imposer (variante: ...)
      const v = b.kv.variante || da.ouvertures[nChap++ % da.ouvertures.length];
      corps.push(ouverture(b, v, marqueurs));
    } else if (b.t === 'pause') { vider(); corps.push(pause(b)); }
    else flux.push(bloc(b));
  }
  vider();
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${echap(meta.titre)}</title>
    <style>${polices()}${css(meta, da)}${CSS_VISUELS}</style></head><body>
    ${couverture(meta, da)}${licence(meta)}${sommaire(chapitres, pages)}
    ${corps.join('\n')}
    ${auteur(meta)}${dos(meta, da)}
  </body></html>`;
}

// ---------- Styles ----------

function css(m, da) {
  const c = da.couleurs, t = da.titres, F = MARQUE.format;
  const motifs = {
    grille: `background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:6mm 6mm`,
    filets: `background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 3.2mm)`,
    pagne: `background-image:url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><g fill='none' stroke='rgba(255,201,60,.16)' stroke-width='2'><path d='M24 4L44 24L24 44L4 24Z'/><circle cx='24' cy='24' r='6'/><path d='M0 0L8 8M48 0L40 8M0 48L8 40M48 48L40 40'/></g></svg>`)}");background-size:14mm 14mm`,
  };
  return `
  @page{size:${F.l} ${F.h};margin:0}
  @page texte{margin:13mm 13mm 16mm;background:${c.papier};
    @bottom-left{content:"${echap(m.court || m.titre)}";font:600 7pt Outfit;color:#8A8F98}
    @bottom-right{content:counter(page);font:800 8pt Outfit;color:${c.fonce}}}
  :root{--p:${c.primaire};--f:${c.fonce};--a:${c.accent};--surA:${c.surAccent};--fond:${c.fond};--papier:${c.papier};
    --encre:${MARQUE.encre};--erreur:${MARQUE.erreur};--titre:'${t.famille}';--c:${da.corps}pt}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${MARQUE.texte},sans-serif;color:var(--encre);-webkit-print-color-adjust:exact;print-color-adjust:exact}
  h1,h2,h3,.titre{text-wrap:balance}
  .flux p,.flux li{text-wrap:pretty;hyphens:auto}
  h1,h2,.titre{font-family:var(--titre),serif;font-weight:${t.graisse};letter-spacing:${t.interlettre};text-transform:${t.casse};line-height:1.04}
  em{font-style:italic}
  code{font-family:'JetBrains Mono',monospace;font-size:.86em;background:rgba(0,0,0,.06);padding:0 .25em;border-radius:.2em}
  .plein{width:${F.l};height:${F.h};position:relative;overflow:hidden;break-after:page;background:var(--fond)}
  .marges{padding:14mm 13mm 0}
  ${Object.entries(motifs).map(([k, v]) => `.motif-${k}::before{content:"";position:absolute;inset:0;${v}}`).join('\n  ')}
  .plein>*{position:relative}
  .marqueur{position:absolute!important;top:0;left:0;font-size:2px;color:transparent}

  /* Logo provisoire KAMTECH (texte) */
  .logo{display:inline-flex;align-items:center;gap:1.6mm;font-family:'Archivo Black';font-size:10pt;letter-spacing:.14em;color:${MARQUE.signature}}
  .logo i{width:3.2mm;height:3.2mm;background:var(--a);transform:rotate(45deg);border-radius:.6mm}
  .logo.clair{color:#fff}
  .logo-bas{position:absolute!important;left:0;right:0;bottom:11mm;text-align:center}

  /* Couverture « scène » : le résultat montré */
  .couv{display:flex;flex-direction:column;color:#fff;padding:10mm 11mm 9mm;background:radial-gradient(120% 80% at 85% 0%,var(--p) 0%,var(--f) 62%)}
  .couv-haut{display:flex;justify-content:space-between;align-items:center}
  .pastille{border:1.2px solid var(--a);color:var(--a);border-radius:99px;padding:1mm 3mm;font-weight:600;font-size:6.5pt;letter-spacing:.08em;text-transform:uppercase}
  .couv-titre{margin-top:8mm}
  .surtitre{display:inline-block;background:var(--a);color:var(--surA);font-weight:800;font-size:7pt;letter-spacing:.08em;text-transform:uppercase;padding:1mm 2.6mm;border-radius:1.2mm;margin-bottom:3.5mm}
  .couv h1{font-size:${m.tailleTitre || 34}pt;line-height:.98}
  .couv h1 em{color:var(--a)}
  .sous-titre{font-size:10pt;line-height:1.4;margin-top:3.5mm;max-width:112mm;opacity:.92}
  .couv-visuel{flex:1;display:flex;align-items:center;justify-content:center;padding:3mm 0}
  .couv-bas{flex:none}
  .atouts{list-style:none;display:flex;gap:2mm;flex-wrap:wrap;margin-bottom:4mm}
  .atouts li{display:flex;align-items:center;gap:1.4mm;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:99px;padding:1.3mm 2.8mm 1.3mm 1.6mm;font-size:7.5pt;font-weight:600}
  .atouts svg{color:var(--a);font-size:9pt;--surIco:var(--surA)}
  .signature{display:flex;justify-content:space-between;align-items:center;font-size:7.5pt;opacity:.85}
  .par{font-size:7.5pt;opacity:.8;letter-spacing:.04em}

  /* Couverture « typo » : le titre est l'image (premium) */
  .couv-typo{background:var(--f);padding:11mm 12mm 9mm}
  .couv-typo .couv-haut{border-bottom:1px solid rgba(255,255,255,.25);padding-bottom:3mm;font-size:7pt;letter-spacing:.14em;text-transform:uppercase}
  .couv-typo .collection{color:var(--a);font-weight:800}
  .couv-typo .couv-titre{margin-top:auto}
  .couv-typo h1{font-size:${m.tailleTitre || 52}pt;line-height:.92}
  .couv-typo h1 em{display:block;font-size:2.1em;line-height:.9;color:transparent;-webkit-text-stroke:1.4px var(--a);font-style:normal}
  .couv-typo .sous-titre{border-left:2px solid var(--a);padding-left:3.5mm;margin-top:6mm}
  .mots-cles{margin:9mm 0 6mm;font-size:7pt;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.7)}
  .mots-cles i{color:var(--a);margin:0 2mm;font-style:normal}

  /* Licence, sommaire, auteur */
  .page-licence{background:var(--fond)}
  .bande{margin-top:16mm;background:var(--f);color:#fff;display:flex;align-items:center;justify-content:center;gap:2mm;padding:3.5mm;font-family:var(--titre);font-size:12pt;text-transform:uppercase;letter-spacing:.02em}
  .bande svg{color:var(--a)}
  .page-licence p,.page-auteur p{font-size:calc(var(--c)*.78);line-height:1.45;margin-bottom:3.5mm}
  .liste{margin:0 0 4mm 6mm;font-weight:600;font-size:calc(var(--c)*.78);line-height:1.55}
  .fort{font-weight:600}
  .h-page{font-size:26pt;margin-bottom:7mm;color:var(--f)}
  .toc{list-style:none}
  .toc a{display:flex;align-items:baseline;gap:3mm;padding:3mm 0;border-bottom:1px solid rgba(0,0,0,.13);color:inherit;text-decoration:none}
  .toc-n{font-family:var(--titre);font-size:14pt;color:var(--p);width:9mm;flex:none}
  .toc-t{flex:1;font-size:calc(var(--c)*.78);font-weight:600;line-height:1.3}
  .toc-p{font-size:9pt;opacity:.6}
  .bande-accent{margin-top:16mm;background:var(--a);text-align:center;padding:3mm}
  .bande-accent h1{font-size:18pt;color:var(--surA)}
  .centre{text-align:center;padding-top:14mm}
  .maj{font-weight:800;text-transform:uppercase;letter-spacing:.06em;margin-top:5mm}
  .suite{margin-top:6mm}
  .lien{font-weight:800;color:var(--p);font-size:11pt;margin-top:8mm}

  /* Ouvertures de chapitre */
  .ouv .kicker{font-size:7.5pt;font-weight:800;letter-spacing:.12em;text-transform:uppercase;opacity:.75;margin-bottom:1.5mm}
  .ouv h1{font-size:25pt;margin-bottom:4mm}
  .ouv .objectif{font-weight:600;font-size:calc(var(--c)*.82);line-height:1.4;margin-bottom:3mm}
  .ouv .intro{font-size:calc(var(--c)*.72);line-height:1.45}
  .ouv-meta{display:flex;align-items:center;gap:3mm;font-size:8pt}
  .pilule{background:var(--a);color:var(--surA);font-weight:800;padding:2mm 4mm;border-radius:99px;white-space:nowrap}
  .ouv-visuel{display:flex;justify-content:center;zoom:.8}
  /* plein */
  .ouv-plein{background:var(--f);color:#fff;padding:12mm}
  .num-geant{position:absolute!important;right:-3mm;top:-2mm;font-family:var(--titre);font-size:150pt;line-height:1;color:transparent;-webkit-text-stroke:1.5px var(--a);opacity:.9}
  .ouv-plein-texte{margin-top:40mm}
  .ouv-plein .objectif{color:var(--a)}
  .ouv-plein .ouv-visuel{position:absolute!important;left:0;right:0;bottom:30mm}
  .ouv-plein .ouv-meta{position:absolute!important;left:12mm;right:12mm;bottom:12mm}
  /* panneau */
  .ouv-haut{height:66mm;display:flex;align-items:center;justify-content:space-between;padding:0 11mm}
  .num-contour{font-family:var(--titre);font-size:96pt;line-height:1;color:transparent;-webkit-text-stroke:1.5px var(--p)}
  .ouv-panneau .ouv-visuel{zoom:.75}
  .panneau{position:absolute!important;left:0;right:0;bottom:0;top:68mm;background:var(--f);color:#fff;border-radius:15mm 15mm 0 0;padding:11mm 12mm 0}
  .panneau .objectif{color:var(--a)}
  .panneau .ouv-meta{position:absolute;left:12mm;right:12mm;bottom:12mm}
  /* scindé (éditorial) */
  .ouv-scinde{display:flex;background:var(--papier)}
  .col-num{width:38mm;background:var(--f);display:flex;align-items:flex-end;justify-content:center;padding-bottom:12mm}
  .col-num span{font-family:var(--titre);font-size:70pt;color:var(--a);writing-mode:vertical-rl;transform:rotate(180deg);line-height:1}
  .col-texte{flex:1;padding:22mm 11mm 12mm 9mm;display:flex;flex-direction:column}
  .ouv-scinde .kicker{color:var(--p);opacity:1}
  .ouv-scinde h1{color:var(--f);font-size:23pt}
  .ouv-scinde .objectif{border-top:1.5px solid var(--a);padding-top:3mm;color:var(--f)}
  .ouv-scinde .ouv-visuel{margin:auto 0 6mm;zoom:.62}
  .ouv-scinde .ouv-meta{margin-top:auto;flex-wrap:wrap}

  /* Page respiration */
  .pause{background:var(--a);color:var(--surA);display:flex;flex-direction:column;justify-content:center;padding:0 14mm}
  .pause-chiffre{font-family:var(--titre);font-size:72pt;line-height:1;margin-bottom:5mm;letter-spacing:-.03em}
  .pause-texte{font-family:var(--titre);font-size:19pt;line-height:1.2}
  .pause-source{margin-top:5mm;font-size:9pt;font-weight:600;opacity:.75}

  /* Texte courant (pagination automatique) */
  .flux{page:texte;font-size:var(--c);line-height:${da.interligne}}
  .flux p{margin-bottom:.75em}
  .flux b{font-weight:600}
  .h-section{font-size:1.9em;color:var(--f);margin-bottom:.6em}
  .flux h2{font-size:1.45em;color:var(--f);margin:1.2em 0 .5em;break-after:avoid}
  .flux h2:first-child{margin-top:0}
  .flux h3{font-weight:800;font-size:1.05em;margin:1em 0 .3em;break-after:avoid}
  .puces{list-style:none;margin-bottom:.8em}
  .puces li{padding-left:1.1em;position:relative;margin-bottom:.3em}
  .puces li::before{content:"";position:absolute;left:.15em;top:.55em;width:.42em;height:.42em;background:var(--p);border-radius:50%}
  .etapes{list-style:none;margin-bottom:.8em}
  .etapes li{display:flex;gap:.55em;margin-bottom:.45em;break-inside:avoid}
  .etapes .n{flex:none;width:1.45em;height:1.45em;border-radius:50%;background:var(--f);color:#fff;font-weight:800;font-size:.85em;display:flex;align-items:center;justify-content:center;margin-top:.12em}
  blockquote{font-family:var(--titre);font-size:1.3em;line-height:1.25;color:var(--f);border-left:3px solid var(--a);padding-left:.7em;margin:.8em 0}
  .tab{width:100%;border-collapse:collapse;font-size:.85em;margin-bottom:1em;break-inside:avoid}
  .tab th{background:var(--f);color:#fff;text-align:left;padding:.4em .5em}
  .tab td{border-bottom:1px solid #E3E5E9;padding:.4em .5em}
  .prompt,.resultat,.encart,.chiffre,.aa,.recap,.exercice,.checklist{break-inside:avoid;margin:0 0 .9em}
  .prompt{background:var(--f);color:#fff;border-radius:3mm;padding:.8em 1em}
  .prompt-tete{display:flex;justify-content:space-between;font-size:.62em;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--a);margin-bottom:.5em}
  .prompt p{margin:0;font-size:.95em}
  .resultat{border:1.5px solid var(--p);border-radius:3mm;background:#fff;overflow:hidden}
  .resultat-label{display:block;background:var(--p);color:#fff;font-size:.62em;font-weight:800;letter-spacing:.1em;padding:.4em 1.6em;text-transform:uppercase}
  .resultat-corps{padding:.7em 1em;font-size:.95em}
  .resultat-corps.mono{font-family:'JetBrains Mono',monospace;font-size:.82em}
  .encart{display:flex;gap:.6em;border-radius:3mm;padding:.8em 1em;font-size:.9em;line-height:1.4}
  .encart svg{flex:none;font-size:1.25em;margin-top:.05em}
  .erreur{background:#FFE9E4}.erreur svg{color:var(--erreur)}
  .astuce{background:var(--fond)}.astuce svg{color:var(--p)}
  .chiffre{display:flex;align-items:center;gap:.8em;border-top:2px solid var(--f);border-bottom:2px solid var(--f);padding:.6em 0}
  .chiffre-v{font-family:var(--titre);font-size:2.6em;line-height:1;color:var(--p);white-space:nowrap}
  .chiffre-l{font-size:.95em;font-weight:600}
  .aa{display:grid;grid-template-columns:1fr 1fr;gap:2mm}
  .aa>div{border-radius:3mm;padding:.7em .8em;font-size:.88em}
  .aa span{display:block;font-size:.7em;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:.3em}
  .aa p{margin:0}
  .aa-av{background:#F1F1F3;color:#555}
  .aa-ap{background:var(--fond);border:1.5px solid var(--p)}.aa-ap span{color:var(--p)}
  .recap{background:var(--f);color:#fff;border-radius:3mm;padding:.9em 1em}
  .recap-t{font-family:var(--titre);font-size:1.25em;color:var(--a);margin-bottom:.4em!important}
  .recap ul{list-style:none}
  .recap li{display:flex;gap:.5em;margin-bottom:.35em;font-size:.92em}
  .recap svg{flex:none;color:var(--a);margin-top:.18em;--surIco:var(--surA)}
  .exercice{border:2px dashed var(--p);border-radius:3mm;padding:.8em 1em}
  .ex-t,.ck-t{font-weight:800;color:var(--p);text-transform:uppercase;letter-spacing:.08em;font-size:.72em;margin-bottom:.4em!important}
  .exercice p:last-child{margin:0}
  .checklist{background:#fff;border:1.5px solid #E3E5E9;border-radius:3mm;padding:.8em 1em}
  .checklist ul{list-style:none}
  .checklist li{display:flex;gap:.55em;margin-bottom:.35em}
  .checklist svg{flex:none;color:var(--p);margin-top:.2em}

  /* 4e de couverture */
  .dos{background:var(--f);color:#fff}
  .dos-centre{position:absolute!important;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4mm}
  .dos-centre .logo{font-size:20pt}
  .dos-centre .logo i{width:6mm;height:6mm}
  .dos-centre p{font-size:9pt;opacity:.7;max-width:90mm;text-align:center}
  .dos-bas{position:absolute!important;bottom:11mm;left:0;right:0;text-align:center;font-size:8pt;opacity:.8;line-height:1.5}
  `;
}

// Vignette carrée (boutique Chariow, pubs) tirée des mêmes données que la couverture
function vignetteHtml(m, da) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${polices()}${css(m, da)}${CSS_VISUELS}
    body{width:1080px;height:1080px;overflow:hidden}
    .vig{width:1080px;height:1080px;display:flex;color:#fff;padding:70px;gap:40px;background:radial-gradient(120% 80% at 85% 0%,var(--p) 0%,var(--f) 62%);position:relative;align-items:center}
    .vig.typo{background:var(--f)}
    .vig .g{flex:1.1;position:relative}
    .vig h1{font-size:${(m.tailleVignette || 92)}px;line-height:.95}
    .vig h1 em{color:var(--a)}
    .vig.typo h1 em{display:block;font-size:2em;color:transparent;-webkit-text-stroke:3px var(--a);font-style:normal}
    .vig .s{display:inline-block;background:var(--a);color:var(--surA);font:800 22px Outfit;letter-spacing:.08em;text-transform:uppercase;padding:8px 18px;border-radius:8px;margin-bottom:28px}
    .vig .d{flex:1;zoom:1.75;position:relative}
    .vig .logo{position:absolute;left:70px;bottom:56px;font-size:24px}
  </style></head><body>
  <div class="vig ${da.couverture === 'typo' ? 'typo' : ''} motif-${da.motif}">
    <div class="g"><p class="s">${fmt(m.surtitre || '')}</p><h1>${fmt(m.titreVignette || m.titreCouv || m.titre)}</h1></div>
    ${da.couverture === 'typo' ? '' : `<div class="d">${visuel(m.visuel)}</div>`}
    ${logo(true)}
  </div></body></html>`;
}

// ---------- Génération ----------

async function rendre(nav, html, fichierHtml, fichierPdf) {
  fs.writeFileSync(fichierHtml, html);
  const page = await nav.newPage();
  await page.goto('file://' + fichierHtml);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: fichierPdf, preferCSSPageSize: true, printBackground: true, outline: true, tagged: true });
  await page.close();
}

async function generer(source) {
  const src = lire(source);
  const nom = path.basename(source, '.md');
  const sortie = path.join(path.dirname(source), 'sortie');
  fs.mkdirSync(path.join(sortie, 'png'), { recursive: true });

  const alertes = controler(src);
  alertes.forEach(a => console.log(`  ⚠ ${a}`));

  const da = DA[src.meta.da];
  const fHtml = path.join(sortie, `${nom}.html`), fPdf = path.join(sortie, `${nom}.pdf`);
  const nav = await chromium.launch();

  // Passe 1 : on repère sur quelle page tombe chaque chapitre, pour le sommaire
  await rendre(nav, document(src, {}, true), fHtml, fPdf);
  const txt = execFileSync('pdftotext', ['-layout', fPdf, '-'], { encoding: 'utf8' }).split('\f');
  const pages = {};
  txt.forEach((t, i) => { for (const m of t.matchAll(/@@CH(\w+)@@/g)) pages[m[1]] = i + 1; });
  // Passe 2 : version finale
  await rendre(nav, document(src, pages, false), fHtml, fPdf);
  const nb = execFileSync('pdfinfo', [fPdf], { encoding: 'utf8' }).match(/Pages:\s+(\d+)/)[1];

  // Aperçus PNG de chaque page + test de la couverture en miniature (200 px, comme sur la boutique)
  execFileSync('pdftoppm', ['-r', '60', '-png', fPdf, path.join(sortie, 'png', nom)]);
  execFileSync('pdftoppm', ['-r', '35', '-png', '-f', '1', '-l', '1', '-scale-to-x', '200', '-scale-to-y', '-1', fPdf, path.join(sortie, `${nom}-miniature-200px`)]);
  const pv = await nav.newPage({ viewport: { width: 1080, height: 1080 } });
  const fVig = path.join(sortie, `${nom}-vignette.html`);
  fs.writeFileSync(fVig, vignetteHtml(src.meta, da));
  await pv.goto('file://' + fVig);
  await pv.evaluate(() => document.fonts.ready);
  await pv.screenshot({ path: path.join(sortie, `${nom}-vignette-carree.png`) });
  await nav.close();
  fs.unlinkSync(fVig);
  console.log(`${nom} : ${nb} pages, DA ${da.nom}, ${alertes.length} alerte(s)`);
}

(async () => {
  const sources = process.argv.slice(2);
  if (!sources.length) { console.log('Usage : node moteur.js <source.md> ...'); process.exit(1); }
  for (const s of sources) await generer(path.resolve(s));
})();
