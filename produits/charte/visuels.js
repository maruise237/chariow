// Bibliothèque de visuels réutilisables (couvertures, ouvertures de chapitre).
// Un visuel est appelé par son nom depuis le fichier source : `visuel: tableur`.
// Règle : un visuel montre le RÉSULTAT que le lecteur obtiendra, jamais une décoration.

const ventes = [
  ['02/10', 'Savon', '12', '6 000'],
  ['02/10', 'Huile 1 L', '5', '7 500'],
  ['03/10', 'Savon', '20', '10 000'],
  ['03/10', 'Riz 5 kg', '3', '13 500'],
];

const V = {
  tableur: () => `<div class="scene">
    <div class="bulle moi"><small>TOI</small>Fais le total des ventes de savon, colonne D.</div>
    <div class="carte tableur">
      <div class="fx"><span>fx</span><code>=SOMME.SI.ENS(D2:D5;B2:B5;"Savon")</code></div>
      <table>
        <tr class="col"><td></td><td>A</td><td>B</td><td>C</td><td>D</td></tr>
        <tr class="tete"><td>1</td><td>Date</td><td>Produit</td><td>Qté</td><td>Total FCFA</td></tr>
        ${ventes.map((l, i) => `<tr><td>${i + 2}</td>${l.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
        <tr class="tot"><td>6</td><td colspan="3">Total « Savon »</td><td>16 000</td></tr>
      </table>
    </div>
    <div class="bulle ia"><small>L'IA</small>Formule en français, avec des « ; ». Prête à coller.</div>
  </div>`,

  journal: () => `<div class="scene">
    <div class="bulle moi"><small>TOI</small>Facture fournisseur : 500 000 F HT, TVA 19,25 %. Passe l'écriture.</div>
    <div class="carte journal">
      <div class="j-tete">Journal des achats · Mode SYSCOHADA</div>
      <table>
        <tr class="tete"><td>Compte</td><td>Libellé</td><td>Débit</td><td>Crédit</td></tr>
        <tr><td>601</td><td>Achats de marchandises</td><td>500 000</td><td></td></tr>
        <tr><td>4452</td><td>TVA récupérable sur achats</td><td>96 250</td><td></td></tr>
        <tr><td>401</td><td>Fournisseurs</td><td></td><td>596 250</td></tr>
        <tr class="tot"><td></td><td>Totaux</td><td>596 250</td><td>596 250</td></tr>
      </table>
    </div>
    <div class="bulle ia"><small>L'IA</small>Écriture équilibrée : débit = crédit.</div>
  </div>`,

  telephone: () => `<div class="scene tel-scene">
    <div class="tel"><div class="tel-ecran">
      <div class="tel-tete">Mon assistant boutique</div>
      <div class="bulle moi">Ventes : 85 000. Achats : 52 000. Transport : 3 500. Mama Rose a pris 6 000 à crédit.</div>
      <div class="bulle ia">Bénéfice du jour : 29 500 F. En caisse : 23 500 F. Mama Rose te doit 6 000 F.</div>
    </div></div>
    <div class="carte stat"><small>Aujourd'hui</small><b>+29 500 F</b><span>bénéfice réel</span></div>
  </div>`,

  // Petites cartes pour les ouvertures de chapitre : un avant → après en un coup d'œil
  avantApres: (avant, apres, titre = '') => `<div class="carte mini">
    ${titre ? `<div class="j-tete">${titre}</div>` : ''}
    <div class="mini-aa"><s>${avant}</s><span>→</span><b>${apres}</b></div>
  </div>`,
};

// Appel depuis la source : "tableur" ou "avantApres: #NOM? | 16 000 | =SOMME.SI.ENS(...)"
function visuel(spec) {
  if (!spec) return '';
  const [nom, reste] = spec.split(/:\s*/, 2).length > 1 ? [spec.slice(0, spec.indexOf(':')).trim(), spec.slice(spec.indexOf(':') + 1)] : [spec.trim(), ''];
  const f = V[nom];
  if (!f) throw new Error(`Visuel inconnu : ${nom}`);
  return f(...(reste ? reste.split('|').map(s => s.trim()) : []));
}

const CSS = `
  .scene{position:relative;width:100%;display:flex;flex-direction:column;align-items:center}
  .scene .bulle.moi{align-self:flex-end;margin-right:2mm;margin-bottom:-4mm;z-index:3;transform:rotate(2deg)}
  .scene .bulle.ia{align-self:flex-start;margin-left:2mm;margin-top:-5mm;z-index:3;transform:rotate(-2deg)}
  .carte{background:#fff;color:var(--encre);border-radius:3mm;box-shadow:0 4mm 10mm rgba(0,0,0,.3);overflow:hidden}
  .bulle{border-radius:3mm;padding:2.2mm 3mm;font-size:8pt;line-height:1.35;box-shadow:0 2mm 6mm rgba(0,0,0,.22);max-width:62mm;font-family:Outfit}
  .bulle.moi{background:#fff;color:var(--encre);border-bottom-right-radius:.8mm}
  .bulle.ia{background:var(--a);color:var(--surA);border-bottom-left-radius:.8mm;font-weight:600}
  .bulle small{display:block;font-size:6pt;font-weight:800;letter-spacing:.08em;opacity:.7;margin-bottom:.6mm}
  .tableur,.journal{width:112mm;transform:rotate(-1.5deg);font-size:7.5pt}
  .fx{display:flex;gap:2mm;align-items:center;background:#F3F4F6;border-bottom:1px solid #D9DCE1;padding:1.8mm 3mm}
  .fx span{font-style:italic;font-weight:800;color:var(--p)}
  .fx code{font-family:'JetBrains Mono',monospace;font-size:7.2pt;color:var(--f);background:#fff;border:1.2px solid var(--p);border-radius:1mm;padding:.6mm 1.8mm}
  .carte table{width:100%;border-collapse:collapse}
  .carte td{border:1px solid #E3E5E9;padding:1.3mm 1.8mm}
  .tableur .col td{background:#F7F8FA;color:#7A808A;text-align:center;font-size:6.5pt;padding:.7mm}
  .tableur td:first-child{background:#F7F8FA;color:#7A808A;text-align:center;width:5mm;font-size:6.5pt}
  .tableur td:last-child,.journal td:nth-child(3),.journal td:nth-child(4){text-align:right;font-variant-numeric:tabular-nums}
  .carte .tete td{font-weight:800}
  .carte .tot td{background:var(--a);font-weight:800;color:var(--f)}
  .j-tete{background:var(--f);color:#fff;font-weight:800;font-size:7.5pt;letter-spacing:.04em;padding:2mm 3mm}
  .journal td:first-child{font-weight:800;color:var(--p);width:10mm}
  .mini{width:62mm;transform:rotate(-3deg)}
  .mini-aa{display:flex;align-items:baseline;gap:2.5mm;padding:4mm 5mm;font-family:var(--titre);font-size:19pt;white-space:nowrap}
  .mini-aa s{color:var(--erreur);text-decoration-thickness:2px}
  .mini-aa b{color:var(--p);font-weight:inherit}
  .mini-aa span{font-size:13pt;opacity:.6}
  .tel-scene{flex-direction:row;justify-content:center;align-items:center}
  .tel{width:54mm;height:76mm;background:#111;border-radius:8mm;padding:2.2mm;box-shadow:0 6mm 14mm rgba(0,0,0,.45);transform:rotate(-4deg)}
  .tel-ecran{background:#EFE7DC;border-radius:6mm;height:100%;padding:0 2.5mm;display:flex;flex-direction:column;gap:3mm;overflow:hidden}
  .tel-tete{background:var(--f);color:#fff;font-weight:600;font-size:7pt;margin:0 -2.5mm;padding:5mm 3mm 2mm}
  .tel .bulle{font-size:7.2pt;max-width:none;box-shadow:0 1mm 2mm rgba(0,0,0,.12)}
  .tel .bulle.moi{margin-left:4mm}
  .tel .bulle.ia{margin-right:3mm}
  .stat{padding:3.5mm 5mm;transform:rotate(3deg) translate(-6mm,10mm);display:flex;flex-direction:column}
  .stat small{font-size:6.5pt;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7A808A}
  .stat b{font-family:var(--titre);font-size:20pt;color:#12924A;line-height:1.1}
  .stat span{font-size:7.5pt}
`;

module.exports = { visuel, CSS };
