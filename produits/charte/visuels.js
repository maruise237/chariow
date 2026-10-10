// Bibliothèque de visuels (couvertures, ouvertures, pages).
// Règles (voir DIRECTION-ARTISTIQUE.md, section anti-slop) :
// - un visuel montre un objet réel du lecteur (tableur, journal, ticket de caisse), posé à plat ;
// - réplique fidèle ou schéma franc, jamais une imitation approximative ;
// - pas d'inclinaison, pas d'ombre portée décorative, pas de bulles de chat génériques ;
// - les explications passent par des repères numérotés reliés à une légende.

const nb = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Réplique d'Excel (version française) : zone de nom, barre de formule, en-têtes, cellule active.
function excel({ formule = '=SOMME.SI.ENS(D2:D5;B2:B5;"Savon")', reperes = true, legende = true } = {}) {
  const lignes = [
    ['02/10', 'Savon', 12, 6000], ['02/10', 'Huile 1 L', 5, 7500],
    ['03/10', 'Savon', 20, 10000], ['03/10', 'Riz 5 kg', 3, 13500],
  ];
  return `<figure class="v-excel">
    <div class="xl">
      <div class="xl-barre"><span class="xl-nom">D6</span><span class="xl-fx">fx</span><span class="xl-formule">${formule}${reperes ? '<i class="rep">1</i>' : ''}</span></div>
      <table class="xl-grille">
        <tr class="xl-cols"><th></th><th>A</th><th>B</th><th>C</th><th class="act">D</th><th>E</th></tr>
        <tr><th>1</th><td class="b">Date</td><td class="b">Produit</td><td class="b n">Qté</td><td class="b n">Total FCFA</td><td></td></tr>
        ${lignes.map((l, i) => `<tr><th>${i + 2}</th><td>${l[0]}</td><td>${l[1]}</td><td class="n">${l[2]}</td><td class="n">${nb(l[3])}</td><td></td></tr>`).join('')}
        <tr><th class="act">6</th><td></td><td></td><td class="n">Savon</td><td class="n cel">16 000${reperes ? '<i class="rep">2</i>' : ''}<span class="poignee"></span></td><td></td></tr>
      </table>
    </div>
    ${legende ? `<figcaption><span class="leg"><i class="rep">1</i><span>La formule écrite par l’IA, avec les noms français et les « ; ».</span><span><i class="rep">2</i>Le résultat : 16 000 F de savon vendus.</span></figcaption>` : ''}
  </figure>`;
}

// Écriture au journal, présentation professionnelle : comptes crédités décalés, totaux sous filet.
function journal({ titre = 'Journal des achats', date = '12/10/2026', piece = 'F-0231' } = {}) {
  return `<figure class="v-journal">
    <div class="jn-tete"><span>${titre}</span><span>${date} · pièce ${piece}</span></div>
    <table class="jn">
      <tr><th>Compte</th><th>Intitulé</th><th class="n">Débit</th><th class="n">Crédit</th></tr>
      <tr><td>601</td><td>Achats de marchandises</td><td class="n">500 000</td><td></td></tr>
      <tr><td>4452</td><td>TVA récupérable sur achats</td><td class="n">96 250</td><td></td></tr>
      <tr class="cr"><td>401</td><td>Fournisseurs</td><td></td><td class="n">596 250</td></tr>
      <tr class="tot"><td></td><td>Totaux</td><td class="n">596 250</td><td class="n">596 250</td></tr>
    </table>
    <p class="jn-lib">Facture ${piece}, marchandises, TVA 19,25 %</p>
  </figure>`;
}

// Ticket de caisse du jour : l'objet que le commerçant connaît.
function recu() {
  const l = [['Ventes', '85 000'], ['Achats', '− 52 000'], ['Transport', '− 3 500']];
  return `<figure class="v-recu"><div class="recu">
    <p class="recu-t">Bilan du jour</p><p class="recu-d">Mardi 14 octobre</p>
    ${l.map(([a, b]) => `<p class="recu-l"><span>${a}</span><span>${b.replace(' ', ' ')} F</span></p>`).join('')}
    <p class="recu-l tot"><span>Bénéfice</span><span>29 500 F</span></p>
    <p class="recu-l pt"><span>Dont crédit Mama Rose</span><span>6 000 F</span></p>
    <p class="recu-l pt"><span>En caisse ce soir</span><span>23 500 F</span></p>
  </div></figure>`;
}

// Avant → après en une ligne typographique (pas de carte)
function avantApres(avant, apres, legende = '') {
  return `<figure class="v-aa"><p><s>${avant}</s><svg class="fl" viewBox="0 0 24 12" width="1em" height=".5em"><path d="M1 6h20m-5-5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><b>${apres}</b></p>${legende ? `<figcaption>${legende}</figcaption>` : ''}</figure>`;
}

const V = { excel, journal, recu, avantApres, tableur: excel };

// Appel depuis la source : "excel" ou "avantApres: 50 F | 9 F | Savon vendu 500 F"
function visuel(spec) {
  if (!spec) return '';
  const i = spec.indexOf(':');
  const nom = (i < 0 ? spec : spec.slice(0, i)).trim();
  const args = i < 0 ? [] : spec.slice(i + 1).split('|').map(s => s.trim());
  if (!V[nom]) throw new Error(`Visuel inconnu : ${nom}`);
  return V[nom](...args);
}

const CSS = `
  figure{margin:0}
  .rep{display:inline-flex;align-items:center;justify-content:center;width:1.5em;height:1.5em;border-radius:50%;background:var(--f);color:#fff;font:800 .62em/1 var(--texte);font-style:normal;margin-left:.5em;vertical-align:middle;flex:none}
  figcaption{display:flex;flex-direction:column;gap:1.2mm;margin-top:2.5mm;font-size:.8em;line-height:1.35}
  figcaption .leg{display:flex;gap:.5em;align-items:flex-start}
  figcaption .rep{margin:0;font-size:.75em}

  /* Excel : couleurs et proportions de l'interface réelle */
  .v-excel .xl{background:#fff;border:1px solid #C8C8C8;font-family:'Liberation Sans',Arial,sans-serif;font-size:8pt;color:#222}
  .xl-barre{display:flex;align-items:center;border-bottom:1px solid #D4D4D4;height:7mm}
  .xl-nom{width:14mm;padding:0 2mm;border-right:1px solid #D4D4D4;height:100%;display:flex;align-items:center}
  .xl-fx{padding:0 2.5mm;font-style:italic;color:#666;border-right:1px solid #D4D4D4;height:100%;display:flex;align-items:center}
  .xl-formule{padding:0 2.5mm;display:flex;align-items:center;font-family:'Liberation Sans',Arial;white-space:nowrap}
  .xl-grille{border-collapse:collapse;width:100%;table-layout:fixed}
  .xl-grille th{background:#F3F3F3;color:#555;font-weight:400;border:1px solid #D4D4D4;height:5.2mm;font-size:7pt}
  .xl-grille tr th:first-child{width:7mm}
  .xl-grille th.act{background:#D3F0E0;color:#107C41;font-weight:700;border-bottom:2px solid #107C41}
  .xl-grille tr th.act:first-child{border-bottom:1px solid #D4D4D4;border-right:2px solid #107C41}
  .xl-grille td{border:1px solid #E1E1E1;height:5.2mm;padding:0 1.5mm;white-space:nowrap;overflow:visible}
  .xl-grille td.n{text-align:right}
  .xl-grille td.b{font-weight:700}
  .xl-grille td.cel{outline:2px solid #107C41;outline-offset:-1px;position:relative;font-weight:700}
  .poignee{position:absolute;right:-1.3mm;bottom:-1.3mm;width:1.8mm;height:1.8mm;background:#107C41;border:1px solid #fff}
  .xl-grille .rep{position:absolute;left:calc(100% + 2.5mm);top:50%;transform:translateY(-50%);margin:0}

  /* Journal comptable */
  .v-journal{background:#fff;border-top:2px solid var(--f);font-size:8.5pt}
  .visuel-flux .v-journal{font-size:.72em}
  .jn-tete{display:flex;justify-content:space-between;padding:2mm 0 1.5mm;font-size:.85em;color:#555}
  .jn-tete span:first-child{font-weight:800;color:var(--f);text-transform:uppercase;letter-spacing:.08em}
  .jn{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
  .jn th{font-size:.78em;font-weight:800;text-transform:uppercase;letter-spacing:.06em;text-align:left;color:#555;padding:1.2mm 1.5mm;border-bottom:1px solid var(--f)}
  .jn td{padding:1.6mm 1.5mm;border-bottom:1px solid #E6E6E6}
  .jn .n{text-align:right}
  .jn td:first-child{font-weight:700;color:var(--p);width:11mm}
  .jn tr.cr td:nth-child(2){padding-left:7mm}
  .jn tr.tot td{border-top:1.5px solid var(--f);border-bottom:none;font-weight:800}
  .jn-lib{font-size:.85em;font-style:italic;color:#555;padding-top:1.5mm}

  /* Ticket de caisse */
  .recu{background:#FFFDF8;color:#222;width:58mm;padding:5mm 5mm 7mm;font-family:'JetBrains Mono',monospace;font-size:7.6pt;line-height:1.5;
    -webkit-mask:linear-gradient(#000 0 0) top/100% calc(100% - 2.4mm) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/3.2mm 2.4mm repeat-x;
    mask:linear-gradient(#000 0 0) top/100% calc(100% - 2.4mm) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/3.2mm 2.4mm repeat-x}
  .recu-t{text-align:center;font-weight:500;text-transform:uppercase;letter-spacing:.12em}
  .recu-d{text-align:center;color:#777;margin-bottom:2.5mm;padding-bottom:2mm;border-bottom:1px dashed #999}
  .recu-l{display:flex;justify-content:space-between}
  .recu-l.tot{border-top:1px dashed #999;margin-top:1.5mm;padding-top:1.5mm;font-size:1.25em}
  .recu-l.pt{color:#666}

  /* Avant → après */
  .v-aa p{font-family:var(--titre);font-size:30pt;line-height:1;white-space:nowrap}
  .v-aa s{color:var(--erreur);text-decoration-thickness:3px;opacity:.8}
  .v-aa .fl{font-size:.7em;margin:0 .25em;opacity:.55;vertical-align:middle}
  .v-aa b{color:inherit;font-weight:inherit}
  .v-aa figcaption{font-size:9pt;opacity:.8;margin-top:1.5mm}
`;

module.exports = { visuel, CSS };
