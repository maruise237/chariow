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

const logo = (clair = false) => `<span class="logo${clair ? ' clair' : ''}"><img src="file://${ASSETS}/${MARQUE.logo}" alt="">${MARQUE.nom}</span>`;
const titreRiche = s => titre(s); // *mot* → <em>mot</em> : le mot mis en accent

function couverture(m, da) {
  // Pas de badge au-dessus du titre, pas de pastilles à coches : les atouts tiennent sur une ligne de texte.
  const atouts = (m.atouts || '').split('|').map(s => s.trim()).filter(Boolean);
  const bas = `<div class="couv-bas"><p class="atouts">${atouts.map(fmt).join('<i>/</i>')}</p>
      <div class="signature">${logo(true)}<span>${fmt(m.edition || '')}</span></div></div>`;
  if (da.couverture === 'typo') {
    const mots = (m.motsCles || '').split('|').map(s => s.trim()).filter(Boolean);
    return `<section class="plein couv couv-typo motif-${da.motif}">
      <header class="couv-haut"><span class="collection">${fmt(m.collection || '')}</span><span>${fmt(m.surtitre || '')}</span></header>
      <div class="couv-titre"><h1>${titreRiche(m.titreCouv || m.titre)}</h1><p class="sous-titre">${fmt(m.sousTitre || '')}</p></div>
      ${mots.length ? `<p class="mots-cles">${mots.map(fmt).join('<i>·</i>')}</p>` : ''}
      ${bas}
    </section>`;
  }
  return `<section class="plein couv couv-scene couv-${m.produit || ''}">
    <header class="couv-haut">${logo(true)}<span class="collection">${fmt(m.collection || '')}</span></header>
    <div class="couv-titre">
      <h1>${titreRiche(m.titreCouv || m.titre)}</h1>
      <p class="sous-titre">${fmt(m.sousTitre || '')}</p>
    </div>
    <div class="couv-visuel motif-${da.motif}">${visuel(m.visuelCouv || m.visuel)}</div>
    ${bas}
  </section>`;
}

// Les droits d'usage tiennent en 3 lignes : ils vont en bas du sommaire, pas sur une page à part.
function licence(m) {
  return `<div class="licence">${ico.alerte}<p><b>Usage personnel.</b> Cet e-book et ses bonus sont liés à ton achat : ne les partage pas (WhatsApp, Telegram, revente). © ${(m.edition || '').split(' ').pop()} ${MARQUE.nom}.</p></div>`;
}

function sommaire(m, chapitres, pages) {
  return `<section class="plein page-sommaire">
    <div class="marges">
      <h1 class="h-page">Sommaire</h1>
      <ol class="toc">${chapitres.map(c => `<li><a href="#ch${c.arg}"><span class="toc-n">${c.arg}</span><span class="toc-t">${fmt(c.kv.titre)}</span><span class="toc-p">${pages[c.arg] || ''}</span></a></li>`).join('')}</ol>
    </div>
    ${licence(m)}
  </section>`;
}

// Personnages Open Peeps (CC0) pré-générés dans assets/illustrations (voir illustrations/README.md).
// Inclus en ligne pour que la teinte --peau suive la DA. Trait noir : jamais sur un fond foncé.
function illustration(id, classe = 'illu') {
  const f = path.join(ASSETS, 'illustrations', `${id.trim()}.svg`);
  if (!fs.existsSync(f)) throw new Error(`Illustration inconnue : ${id}`);
  return fs.readFileSync(f, 'utf8').replace(/^<\?xml[^>]*>\s*/, '').replace('<svg', `<svg class="${classe}" aria-hidden="true"`);
}

function ouverture(b, variante, marqueur) {
  // Le numéro plein sert d'étiquette : pas de petit label « CHAPITRE » au-dessus du titre.
  const k = b.kv;
  const infos = [k.duree && `Lecture : ${fmt(k.duree)}`, k.bonus && `Bonus lié : <b>${fmt(k.bonus)}</b>`].filter(Boolean);
  const meta = infos.length ? `<p class="ouv-meta">${infos.join('<i>/</i>')}</p>` : '';
  const vis = k.visuel ? `<div class="ouv-visuel">${visuel(k.visuel)}</div>`
    : k.illustration ? `<div class="ouv-visuel">${illustration(k.illustration)}</div>` : '';
  const id = `id="ch${b.arg}"`;
  const marq = marqueur ? `<span class="marqueur">@@CH${b.arg}@@</span>` : '';
  const obj = k.objectif ? `<p class="objectif">Tu vas savoir ${fmt(k.objectif.replace(/^\s*[A-ZÀ-Ý]/, c => c.toLowerCase()))}</p>` : '';
  if (variante === 'scinde') {
    return `<section ${id} class="plein ouv ouv-scinde">${marq}
      <div class="col-num"><span>${b.arg}</span></div>
      <div class="col-texte">
        <h1>${titre(k.titre)}</h1>${obj}
        <p class="intro">${fmt(k.intro || '')}</p>
        ${vis}${meta}
      </div>
    </section>`;
  }
  if (variante === 'panneau') {
    return `<section ${id} class="plein ouv ouv-panneau">${marq}
      <div class="ouv-haut">${vis || `<span class="num-seul">${b.arg}</span>`}</div>
      <div class="panneau">
        <h1><span class="num">${b.arg}</span>${titre(k.titre)}</h1>${obj}
        <p class="intro">${fmt(k.intro || '')}</p>
        ${meta}
      </div>
    </section>`;
  }
  return `<section ${id} class="plein ouv ouv-plein">${marq}
    <p class="num-plein">${b.arg}</p>
    <h1>${titre(k.titre)}</h1>${obj}
    <p class="intro">${fmt(k.intro || '')}</p>
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

// Capture réelle annotée : l'image (capture du tableur, de l'IA...) + des repères numérotés avec flèche.
// Source :
//   :::capture ../preuves/sortie/somme-si/capture.png | Légende facultative
//   1: 40,12 g | La formule, en français, avec « ; »
//   2: 78,64 b | Le résultat calculé : 16 000
//   :::
// x,y = point visé, en % de la largeur et de la hauteur de l'image ; la lettre dit d'où vient la flèche
// (g gauche, d droite, h haut, b bas), suivie si besoin de la longueur de la flèche (« g4 », 9 par défaut). Le texte de chaque repère se lit sous l'image.
let DOSSIER = process.cwd();
function taillePng(f) {
  const b = fs.readFileSync(f);
  return { l: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
function capture(b) {
  const [fichier, legende] = b.arg.split('|').map(t => t.trim());
  const chemin = path.resolve(DOSSIER, fichier);
  if (!fs.existsSync(chemin)) throw new Error(`Capture introuvable : ${chemin}`);
  const { l, h } = taillePng(chemin);
  const reps = b.lignes.map(x => x.match(/^\s*(\d+)\s*:\s*([\d.]+)\s*,\s*([\d.]+)\s*([gdhb])?(\d+)?\s*\|\s*(.+)$/)).filter(Boolean)
    .map(r => ({ n: r[1], x: +r[2] / 100 * l, y: +r[3] / 100 * h, dir: r[4] || 'g', lg: r[5] ? +r[5] : 9, t: r[6] }));
  const u = Math.max(l, h) / 100;            // unité : 1 % du plus grand côté
  const R = 2.6 * u;                          // rayon du repère
  const dirs = { g: [-1, 0], d: [1, 0], h: [0, -1], b: [0, 1] };
  const svg = reps.map(r => {
    const [dx, dy] = dirs[r.dir], L = r.lg * u;              // longueur de la flèche (9 par défaut, « g4 » = 4)
    const cx = r.x + dx * (L + R), cy = r.y + dy * (L + R);   // centre du repère numéroté
    const x1 = r.x + dx * L, y1 = r.y + dy * L;               // départ de la flèche (bord du repère)
    return `<line x1="${x1}" y1="${y1}" x2="${r.x - dx * u * .4}" y2="${r.y - dy * u * .4}" class="cap-fl" stroke-width="${u * .55}" marker-end="url(#pointe)"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" class="cap-rep" stroke-width="${u * .35}"/>
      <text x="${cx}" y="${cy}" font-size="${R * 1.15}" class="cap-n">${r.n}</text>`;
  }).join('');
  const haut = reps.some(r => r.dir === 'h') ? ' cap-haut' : '';   // repères au-dessus : on réserve la place
  return `<figure class="capture${haut}">
    <div class="cap-img"><img src="file://${chemin}" alt="">
      <svg viewBox="0 0 ${l} ${h}"><defs><marker id="pointe" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="cap-pointe"/></marker></defs>${svg}</svg>
    </div>
    ${reps.length || legende ? `<figcaption>${reps.map(r => `<span class="leg"><i class="rep">${r.n}</i><span>${fmt(r.t)}</span></span>`).join('')}${legende ? `<span class="cap-leg">${fmt(legende)}</span>` : ''}</figcaption>` : ''}
  </figure>`;
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
    case 'table': {
      // Colonnes de montants détectées : alignées à droite ; ligne « Total » soulignée par un filet
      const corps = b.rows.slice(1), estNb = c => /^[−+\-]?\s?[\d][\d\s.,]*\s?(F|FCFA|%)?$/.test(c);
      const num = b.rows[0].map((_, j) => corps.some(r => r[j]) && corps.every(r => !r[j] || estNb(r[j])));
      const cl = (j, extra = '') => (num[j] ? ' class="n"' : '') + extra;
      return `<table class="tab"><tr>${b.rows[0].map((c, j) => `<th${cl(j)}>${fmt(c)}</th>`).join('')}</tr>${corps.map(r =>
        `<tr${r.some(c => /^totaux?$/i.test(c)) ? ' class="tot"' : ''}>${r.map((c, j) => `<td${cl(j)}>${fmt(c)}</td>`).join('')}</tr>`).join('')}</table>`;
    }
    case 'visuel': return `<div class="visuel-flux">${visuel(b.arg)}</div>`;
    case 'capture': return capture(b);
    case 'illustration': { const [id, leg] = b.arg.split('|').map(t => t.trim());
      return `<figure class="illu-flux">${illustration(id)}${leg ? `<figcaption>${fmt(leg)}</figcaption>` : ''}</figure>`; }
    case 'prompt': return `<div class="prompt"><div class="prompt-tete"><span>À copier</span><span>${fmt(b.arg)}</span></div><p>${texte()}</p></div>`;
    case 'resultat': {
      const [titre, opt] = b.arg.split('|').map(s => s.trim());
      return `<div class="resultat"><span class="resultat-label">${fmt(titre || 'Résultat')}</span><div class="resultat-corps${opt === 'mono' ? ' mono' : ''}">${opt === 'mono' ? b.lignes.filter(l => l.trim()).map(l => echap(l).replace(/([;,(])/g, '$1<wbr>')).join('<br>') : texte()}</div></div>`;
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

function dos(m, da) {
  // Dernière page : qui a écrit le livre, la suite conseillée et l'adresse de la boutique (l'ancienne page « auteur »)
  return `<section class="plein dos motif-${da.motif}">
    <div class="dos-centre">${logo(true)}
      <p>Guides testés sur téléphone, avec des montants en FCFA. Conçus au Cameroun.</p>
      ${m.suite ? `<p class="suite">${fmt(m.suite)}</p>` : ''}
    </div>
    <p class="dos-bas">${MARQUE.boutique ? `<b>${MARQUE.boutique}</b><br>` : ''}${m.edition || ''}</p>
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
      let v = b.kv.variante || da.ouvertures[nChap++ % da.ouvertures.length];
      if (b.kv.illustration && !b.kv.visuel && v === 'plein') v = 'panneau';
      corps.push(ouverture(b, v, marqueurs));
    } else if (b.t === 'pause') { vider(); corps.push(pause(b)); }
    else flux.push(bloc(b));
  }
  vider();
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${echap(meta.titre)}</title>
    <style>${polices()}${css(meta, da)}${CSS_VISUELS}</style></head><body>
    ${couverture(meta, da)}${chapitres.length ? sommaire(meta, chapitres, pages) : ''}
    ${corps.join('\n')}
    ${dos(meta, da)}
  </body></html>`;
  return fines(html);
}

// Aucune de nos polices n'a le glyphe U+202F (espace fine insécable) : on le remplace par une
// insécable en corps réduit, sinon le navigateur irait le chercher dans une autre police.
function fines(html) {
  const i = html.indexOf('</style>');
  return html.slice(0, i) + html.slice(i).replace(/\u202F/g, '<span class="fi">\u00A0</span>');
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
  @page texte{margin:12mm 10mm 15mm;background:${c.papier};
    @bottom-left{content:"${echap(m.court || m.titre)}";font:600 7pt "Hanken Grotesk";color:#8A8F98}
    @bottom-right{content:counter(page);font:800 8pt "Hanken Grotesk";color:${c.fonce}}}
  :root{--p:${c.primaire};--f:${c.fonce};--a:${c.accent};--surA:${c.surAccent};--fond:${c.fond};--papier:${c.papier};
    --encre:${MARQUE.encre};--erreur:${MARQUE.erreur};--titre:'${t.famille}';--texte:'${MARQUE.texte}';--util:'${MARQUE.util}';--mono:'${MARQUE.mono}';--c:${da.corps}pt}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:var(--texte),serif;color:var(--encre);-webkit-print-color-adjust:exact;print-color-adjust:exact}
  h1,h2,h3,.titre{text-wrap:balance}
  .flux p,.flux li{text-wrap:pretty;hyphens:auto}
  h1,h2,.titre{font-family:var(--titre),serif;font-weight:${t.graisse};letter-spacing:${t.interlettre};text-transform:${t.casse};line-height:1.04}
  em{font-style:italic}
  code{font-family:var(--mono,'JetBrains Mono'),monospace;font-size:.86em;background:rgba(0,0,0,.06);padding:0 .25em;border-radius:.2em}
  .plein{width:${F.l};height:${F.h};position:relative;overflow:hidden;break-after:page;background:var(--fond)}
  .marges{padding:14mm 13mm 0}
  ${Object.entries(motifs).map(([k, v]) => `.motif-${k}::before{content:"";position:absolute;inset:0;${v}}`).join('\n  ')}
  .plein>*{position:relative}
  /* Le sans-serif utilitaire pour tout ce qui n'est pas de la lecture suivie */
  .prompt,.tab,.resultat-label,.ex-t,.ck-t,.aa span,.ouv-meta,.atouts,.couv-haut,.signature,figcaption,.toc,.chiffre-l,.bande,.mots-cles,.jn,.jn-tete,.encart b,.recap-t,.v-aa figcaption{font-family:var(--util),sans-serif}
  .fi{font-size:.6em;letter-spacing:0}
  .marqueur{position:absolute!important;top:0;left:0;font-size:2px;color:transparent}

  /* Logo provisoire KAMTECH (texte) */
  .logo{display:inline-flex;align-items:center;gap:1.6mm;font-family:var(--util);font-weight:800;font-size:10pt;letter-spacing:.16em;color:${MARQUE.signature}}
  .logo img{height:1.6em;width:auto;border-radius:.3em}
  .logo.clair{color:#fff}
  .logo-bas{position:absolute!important;left:0;right:0;bottom:11mm;text-align:center}

  /* Couverture « scène » : aplat, titre, objet réel du lecteur. Pas de halo, pas de pastilles. */
  .couv{display:flex;flex-direction:column;color:#fff;padding:10mm 11mm 9mm;background:var(--f)}
  .couv-haut{display:flex;justify-content:space-between;align-items:center;font-size:7pt;letter-spacing:.12em;text-transform:uppercase}
  .collection{color:var(--a);font-weight:800}
  .couv-titre{margin-top:11mm}
  .couv h1{font-size:${m.tailleTitre || 36}pt;line-height:.98}
  .couv h1 em{color:var(--a);font-style:${t.italique === false ? 'normal' : 'italic'}}
  .sous-titre{font-size:10.5pt;line-height:1.4;margin-top:4mm;max-width:108mm;opacity:.9}
  .couv-visuel{flex:1;display:flex;align-items:center;justify-content:center;margin:5mm -11mm 4mm;padding:6mm 11mm;position:relative}
  .couv-visuel::before{opacity:.9}
  .couv-visuel>*{position:relative}
  .couv-excel .couv-visuel{align-items:flex-end;justify-content:flex-start;margin:6mm -11mm 4mm 0;padding:0}
  .couv-excel .v-excel{width:100mm;zoom:1.38;color:var(--encre)}
  .couv-boutique .v-recu{zoom:1.45}
  .couv-compta .couv-visuel{align-items:flex-end;justify-content:flex-start;margin:6mm -11mm 4mm 0;padding:0}
  .couv-compta .v-journal{width:108mm;zoom:1.22;padding:4mm 5mm 3mm;border-top:3px solid var(--a)}
  .couv-compta figcaption{color:#fff;font-size:6pt;flex-direction:row;gap:5mm;margin:3mm -5mm -3mm;padding:2.5mm 5mm 0;background:var(--f)}
  .couv-compta figcaption .leg{flex:1}
  .couv-compta .rep{background:var(--a);color:var(--surA)}
  .couv-compta .couv-titre h1{font-size:44pt}
  .couv-excel figcaption{color:#fff;opacity:.9;font-size:6pt;padding-left:1mm}
  .couv-excel .rep{background:var(--a);color:var(--surA)}
  .couv-excel figcaption{flex-direction:row;gap:6mm}
  .couv-excel figcaption .leg{flex:1}
  .couv-bas{flex:none;border-top:1px solid rgba(255,255,255,.22);padding-top:3mm}
  .atouts{font-size:8pt;font-weight:600;margin-bottom:2.5mm}
  .atouts i,.ouv-meta i{font-style:normal;color:var(--a);margin:0 .6em}
  .signature{display:flex;justify-content:space-between;align-items:center;font-size:7.5pt;opacity:.85}

  /* Couverture « typo » : le titre est l'image (premium) */
  .couv-typo{padding:11mm 12mm 9mm}
  .couv-typo .couv-haut{border-bottom:1px solid rgba(255,255,255,.25);padding-bottom:3mm}
  .couv-typo .couv-titre{margin-top:auto}
  .couv-typo h1{font-size:${m.tailleTitre || 50}pt;line-height:.92}
  .couv-typo h1 em{display:block;font-size:2.3em;line-height:.85;color:var(--a);font-style:normal}
  .couv-typo .sous-titre{margin-top:6mm}
  .mots-cles{margin:9mm 0 5mm;font-size:7pt;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.7)}
  .mots-cles i{color:var(--a);margin:0 2mm;font-style:normal}

  /* Licence, sommaire, auteur */
  .licence{position:absolute!important;left:13mm;right:13mm;bottom:11mm;display:flex;gap:2.5mm;align-items:flex-start;font-family:var(--util);font-size:8pt;line-height:1.4;color:#5A5F68;border-top:1px solid rgba(0,0,0,.12);padding-top:3mm}
  .licence svg{flex:none;width:4mm;height:4mm;color:var(--erreur)}
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

  /* Ouvertures de chapitre : numéro plein, pas d'outline, pas de pilule */
  .ouv h1{font-size:25pt;margin-bottom:4mm}
  .ouv .objectif{font-weight:600;font-size:calc(var(--c)*.82);line-height:1.4;margin-bottom:3mm}
  .ouv .intro{font-size:calc(var(--c)*.84);line-height:1.45}
  .ouv-meta{font-size:7.5pt;opacity:.85}
  .ouv-visuel{display:flex;justify-content:center}
  .illu{display:block;height:100%;max-height:62mm;width:auto;max-width:100%;--peau:#B9814F}
  .ouv-haut:has(.illu){align-items:flex-end}
  .ouv-haut .illu{height:64mm}
  .ouv-scinde .illu{max-height:52mm}
  .illu-flux{display:flex;flex-direction:column;align-items:center;margin:5mm 0;break-inside:avoid}
  .illu-flux .illu{height:46mm}
  .illu-flux figcaption{text-align:center;color:#6A6F78}
  /* plein */
  .ouv-plein{background:var(--f);color:#fff;padding:12mm;display:flex;flex-direction:column}
  .num-plein{font-family:var(--titre);font-size:64pt;line-height:.9;color:var(--a);margin-bottom:6mm}
  .ouv-plein .objectif{color:var(--a)}
  .ouv-plein .ouv-visuel{margin:auto 0 6mm;color:#fff}
  .ouv-plein .ouv-meta{margin-top:auto;border-top:1px solid rgba(255,255,255,.22);padding-top:3mm}
  .ouv-plein .ouv-visuel + .ouv-meta{margin-top:0}
  /* panneau */
  .ouv-haut{height:70mm;display:flex;align-items:center;justify-content:center;padding:0 12mm;color:var(--f)}
  .ouv-haut .v-aa p{font-size:44pt}
  .num-seul{font-family:var(--titre);font-size:96pt;line-height:1;color:var(--p)}
  .panneau{position:absolute!important;left:0;right:0;bottom:0;top:72mm;background:var(--f);color:#fff;border-radius:7mm 7mm 0 0;padding:11mm 12mm 0}
  .panneau h1 .num{display:block;color:var(--a);font-size:.8em;margin-bottom:1mm}
  .panneau .objectif{color:var(--a)}
  .panneau .ouv-meta{position:absolute;left:12mm;right:12mm;bottom:11mm;border-top:1px solid rgba(255,255,255,.22);padding-top:3mm}
  /* scindé (éditorial) */
  .ouv-scinde{display:flex;background:var(--papier)}
  .col-num{width:36mm;background:var(--f);display:flex;align-items:flex-end;justify-content:center;padding-bottom:12mm}
  .col-num span{font-family:var(--titre);font-size:70pt;color:var(--a);writing-mode:vertical-rl;transform:rotate(180deg);line-height:1}
  .col-texte{flex:1;padding:24mm 11mm 12mm 9mm;display:flex;flex-direction:column}
  .ouv-scinde h1{color:var(--f);font-size:24pt}
  .ouv-scinde .objectif{border-top:1.5px solid var(--a);padding-top:3mm;color:var(--f)}
  .ouv-scinde .ouv-visuel{margin:auto 0 6mm}
  .ouv-scinde .ouv-meta{margin-top:auto;border-top:1px solid #ddd;padding-top:3mm}

  /* Page respiration */
  /* Captures annotées : l'image réelle, un cadre fin, des repères et flèches d'une seule couleur vive */
  .capture{margin:5mm 0 6mm;break-inside:avoid}
  .cap-img{position:relative}
  .cap-img img{display:block;width:100%;height:auto;border:1px solid #CFCFCF;border-radius:1.5mm;background:#fff}
  .cap-haut{padding-top:9%}
  .cap-img svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
  .cap-fl{stroke:var(--erreur);stroke-linecap:round}
  .cap-pointe{fill:var(--erreur)}
  .cap-rep{fill:var(--erreur);stroke:#fff}
  .cap-n{fill:#fff;font-family:var(--util);font-weight:800;text-anchor:middle;dominant-baseline:central}
  .capture .rep{background:var(--erreur)}
  .capture figcaption{font-size:.78em}
  .cap-leg{color:#6A6F78;font-style:italic}
  .pause{background:var(--a);color:var(--surA);display:flex;flex-direction:column;justify-content:center;padding:0 14mm}
  .pause-chiffre{font-family:var(--titre);font-size:72pt;line-height:1;margin-bottom:5mm;letter-spacing:-.03em}
  .pause-texte{font-family:var(--titre);font-size:19pt;line-height:1.2}
  .pause-source{margin-top:5mm;font-size:9pt;font-weight:600;opacity:.75}

  /* Texte courant (pagination automatique) */
  .flux{page:texte;font-size:var(--c);line-height:${da.interligne}}
  .flux p{margin-bottom:.75em}
  .flux b{font-weight:600}
  .h-section{font-size:1.9em;color:var(--f);margin-bottom:.6em}
  .flux h2{font-size:1.45em;color:var(--f);margin:1em 0 .45em;break-after:avoid}
  .flux h2:first-child{margin-top:0}
  .flux h3{font-weight:800;font-size:1.05em;margin:1em 0 .3em;break-after:avoid}
  .puces{list-style:none;margin-bottom:.8em}
  .puces li{padding-left:1.1em;position:relative;margin-bottom:.3em}
  .puces li::before{content:"";position:absolute;left:.15em;top:.55em;width:.42em;height:.42em;background:var(--p);border-radius:50%}
  .etapes{list-style:none;margin-bottom:.8em}
  .etapes li{display:flex;gap:.55em;margin-bottom:.45em;break-inside:avoid}
  .etapes .n{flex:none;width:1.45em;height:1.45em;border-radius:50%;background:var(--f);color:#fff;font-weight:800;font-size:.85em;display:flex;align-items:center;justify-content:center;margin-top:.12em}
  blockquote{font-family:var(--titre);font-size:1.3em;line-height:1.25;color:var(--f);border-left:3px solid var(--a);padding-left:.7em;margin:.8em 0}
  /* Tableaux : aucune grille, filets horizontaux fins, chiffres tabulaires alignés à droite */
  .tab{width:100%;border-collapse:collapse;font-size:.85em;margin:.4em 0 1.1em;break-inside:avoid;font-variant-numeric:tabular-nums lining-nums}
  .tab th{text-align:left;font-size:.78em;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--f);padding:.5em .6em .45em;border-bottom:1.5px solid var(--f);vertical-align:bottom}
  .tab td{border-bottom:1px solid rgba(0,0,0,.1);padding:.6em .6em;vertical-align:top}
  .tab .n{text-align:right;white-space:nowrap}
  .tab tr.tot td{border-top:1.5px solid var(--f);border-bottom:none;font-weight:800}
  .tab td:first-child,.tab th:first-child{padding-left:0}
  .tab td:last-child,.tab th:last-child{padding-right:0}
  .prompt,.resultat,.encart,.chiffre,.aa,.recap,.exercice,.checklist,.visuel-flux{break-inside:avoid;margin:0 0 .9em}
  .visuel-flux{margin:.4em 0 1.1em}
  .prompt{background:var(--f);color:#fff;border-radius:3mm;padding:.8em 1em}
  .prompt-tete{display:flex;justify-content:space-between;font-size:.62em;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--a);margin-bottom:.5em}
  .prompt p{margin:0;font-size:.95em}
  .resultat{border:1.5px solid var(--p);border-radius:3mm;background:#fff;overflow:hidden}
  .resultat-label{display:block;background:var(--p);color:#fff;font-size:.62em;font-weight:800;letter-spacing:.1em;padding:.4em 1.6em;text-transform:uppercase}
  .resultat-corps{padding:.7em 1em;font-size:.95em}
  .resultat-corps.mono{font-family:var(--mono,'JetBrains Mono'),monospace;font-size:.82em;overflow-wrap:anywhere;line-height:1.45}
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
  .dos-centre .logo img{height:1.8em}
  .dos-centre p{font-family:var(--util);font-size:10pt;opacity:.8;max-width:100mm;text-align:center;line-height:1.45}
  .dos-centre .suite{opacity:1;margin-top:6mm;font-size:11pt}
  .dos-bas{position:absolute!important;bottom:11mm;left:0;right:0;text-align:center;font-family:var(--util);font-size:9pt;opacity:.85;line-height:1.5}
  .dos-bas b{font-size:11pt;color:var(--a)}
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
    .vig .s{display:inline-block;background:var(--a);color:var(--surA);font:800 22px 'Hanken Grotesk';letter-spacing:.08em;text-transform:uppercase;padding:8px 18px;border-radius:8px;margin-bottom:28px}
    .vig .d{flex:1;zoom:1.75;position:relative}
    .vig .d .v-journal{zoom:.85}
    .vig .d figcaption{display:none}
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
  DOSSIER = path.dirname(source);
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

  for (const f of fs.readdirSync(path.join(sortie, 'png'))) if (f.startsWith(nom + '-')) fs.unlinkSync(path.join(sortie, 'png', f));
  // Aperçus PNG de chaque page + test de la couverture en miniature (200 px, comme sur la boutique)
  execFileSync('pdftoppm', ['-r', '60', '-png', fPdf, path.join(sortie, 'png', nom)]);
  execFileSync('pdftoppm', ['-r', '35', '-png', '-f', '1', '-l', '1', '-scale-to-x', '200', '-scale-to-y', '-1', fPdf, path.join(sortie, `${nom}-miniature-200px`)]);
  const pv = await nav.newPage({ viewport: { width: 1080, height: 1080 } });
  const fVig = path.join(sortie, `${nom}-vignette.html`);
  fs.writeFileSync(fVig, fines(vignetteHtml(src.meta, da)));
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
