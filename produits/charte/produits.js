// Contenu et couleurs de chaque e-book pour la charte.
// Les titres sont ceux recommandés dans TITRES.md (E2, C1, CA1), à remplacer par le choix final.

const tableur = (lignes, formule, total) => `
  <div class="carte tableur">
    <div class="fx"><span>fx</span><code>${formule}</code></div>
    <table>
      <tr class="col"><td></td><td>A</td><td>B</td><td>C</td><td>D</td></tr>
      <tr class="tete"><td>1</td><td>Date</td><td>Produit</td><td>Qté</td><td>Total FCFA</td></tr>
      ${lignes.map((l, i) => `<tr><td>${i + 2}</td>${l.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
      <tr class="tot"><td>${lignes.length + 2}</td><td colspan="3">Total « Savon »</td><td>${total}</td></tr>
    </table>
  </div>`;

const journal = (titre) => `
  <div class="carte journal">
    <div class="j-tete">${titre}</div>
    <table>
      <tr class="tete"><td>Compte</td><td>Libellé</td><td>Débit</td><td>Crédit</td></tr>
      <tr><td>601</td><td>Achats de marchandises</td><td>500 000</td><td></td></tr>
      <tr><td>4452</td><td>TVA récupérable sur achats</td><td>96 250</td><td></td></tr>
      <tr><td>401</td><td>Fournisseurs</td><td></td><td>596 250</td></tr>
      <tr class="tot"><td></td><td>Totaux</td><td>596 250</td><td>596 250</td></tr>
    </table>
  </div>`;

const ventes = [
  ['02/10', 'Savon', '12', '6 000'],
  ['02/10', 'Huile 1 L', '5', '7 500'],
  ['03/10', 'Savon', '20', '10 000'],
  ['03/10', 'Riz 5 kg', '3', '13 500'],
];

module.exports = {
  excel: {
    court: 'Excel avec l\'IA',
    titreCourt: 'Excel sans apprendre les formules',
    collection: 'E-book + bonus',
    surtitre: 'Excel + Intelligence artificielle',
    titreCouv: 'Excel <em>sans apprendre</em> les formules',
    sousTitre: 'Tu dis ce que tu veux en français, l\'IA écrit la formule à ta place. De débutant à pro en 7 jours.',
    atouts: ['100 prompts prêts', '20 modèles en FCFA', 'PC et téléphone'],
    annee: 2026,
    dateEdition: 'Octobre 2026',
    theme: { primaire: '#12924A', fonce: '#06331C', accent: '#C8F05A', surAccent: '#06331C', fond: '#F1F7F0', motif: '#E2EFDF' },
    hautVisuel: 132,
    visuel: `<div class="scene">
      <div class="bulle moi"><small>TOI</small>Fais le total des ventes de savon, colonne D.</div>
      ${tableur(ventes, '=SOMME.SI.ENS(D2:D5;B2:B5;"Savon")', '16 000')}
      <div class="bulle ia"><small>L'IA</small>Formule en français, avec des « ; ». Prête à coller.</div>
    </div>`,
    contenuPack: ['L\'e-book PDF (environ 70 pages)', '100 prompts Excel en français', '20 modèles Excel et Google Sheets en FCFA', 'La fiche mémo des 15 formules'],
    sommaire: [
      ['00', 'Régler ton IA pour Excel', 6], ['01', 'L\'essentiel d\'Excel en 1 heure', 12],
      ['02', 'Les 15 formules qui font 90 % du travail', 18], ['03', 'Nettoyer une liste en 10 minutes', 30],
      ['04', 'Tableaux croisés et graphiques', 36], ['05', 'Ton tableau de bord en 30 minutes', 44],
      ['06', 'Automatiser sans coder', 52], ['07', '5 projets réels', 58], ['✓', 'La routine du pro', 68],
    ],
    modeEmploi: [
      { titre: 'Ce que tu vas savoir faire', texte: 'Écrire n\'importe quelle formule sans l\'apprendre par cœur, nettoyer une liste, faire un tableau de bord et automatiser les tâches répétitives, sur PC comme sur téléphone.' },
      { titre: 'Ce qu\'il te faut', etapes: ['Excel, Excel mobile ou Google Sheets (gratuit).', 'Une IA gratuite : ChatGPT, Claude ou Gemini.', 'Les fichiers bonus livrés avec cet e-book.'] },
      { titre: 'Comment lire cet e-book', etapes: ['Un chapitre par jour : en 7 jours, tu as fini.', 'Les encadrés noirs sont des prompts : copie-les tels quels.', 'Les encadrés « résultat » montrent ce que l\'IA doit te rendre.', 'Les encadrés rouges listent les erreurs fréquentes. Lis-les avant de valider.'] },
    ],
    chapitre: {
      num: '02', titre: 'Les 15 formules qui font 90 % du travail', titreCourt: 'Les 15 formules',
      objectif: 'obtenir de l\'IA la bonne formule du premier coup, et la débloquer quand elle affiche une erreur.',
      intro: 'SOMME, SI, RECHERCHEV, SOMME.SI.ENS... Pour chacune : le prompt à copier, la formule obtenue et l\'erreur que font presque tous les débutants.',
      duree: '25 min', bonus: 'fiche mémo des 15 formules',
      visuel: `<div class="carte mini"><div class="fx"><span>fx</span><code>=SOMME.SI.ENS(...)</code></div><div class="mini-err">#NOM? <span>→</span> 16 000</div></div>`,
    },
    contenu: {
      page: 21, titre: 'SOMME.SI.ENS : le total d\'un seul produit',
      intro: 'Tu veux savoir combien t\'a rapporté un produit précis dans une longue liste de ventes. Ne cherche pas la formule : décris ton tableau à l\'IA.',
      promptNum: 'Prompt 2.6',
      prompt: 'J\'utilise Excel en français. Colonne B = produit, colonne D = montant en FCFA, lignes 2 à 200. Écris la formule qui fait le total des ventes de « Savon ». Utilise les noms de fonctions en français et le point-virgule.',
      resultatLabel: 'Ce que l\'IA doit te rendre',
      resultat: '=SOMME.SI.ENS(D2:D200;B2:B200;"Savon")', mono: true,
      erreur: 'L\'IA répond <code>SUMIFS(D2:D200,B2:B200,"Savon")</code>. En Excel français, ça affiche #NOM?. Rappelle-lui : « noms français et point-virgule ».',
      astuce: 'Écris le nom du produit dans la cellule F1 et remplace "Savon" par F1 : la même formule marche pour tous tes produits.',
    },
    suite: 'Après Excel, découvre <b>Comptable 2.0</b> si tu travailles en comptabilité.',
    cssEnPlus: '',
  },

  compta: {
    court: 'Comptable 2.0',
    titreCourt: 'Comptable 2.0 : le SYSCOHADA avec l\'IA',
    collection: 'Édition professionnelle',
    surtitre: 'SYSCOHADA révisé + IA',
    titreCouv: 'Comptable <em>2.0</em>',
    tailleTitre: 68,
    sousTitre: 'Le SYSCOHADA avec l\'IA : saisie, rapprochement, clôture et états financiers, plus vite et sans perdre le contrôle.',
    atouts: ['150 prompts SYSCOHADA', 'Modèles Excel', 'Grille de contrôle'],
    annee: 2026,
    dateEdition: 'Octobre 2026',
    theme: { primaire: '#1F3FD1', fonce: '#00104F', accent: '#E8B84A', surAccent: '#1A1405', fond: '#F5F3EC', motif: '#ECE7D8' },
    hautVisuel: 122,
    visuel: `<div class="scene">
      <div class="bulle moi"><small>TOI</small>Facture fournisseur : 500 000 F HT, TVA 19,25 %. Passe l'écriture.</div>
      ${journal('Journal des achats · Mode SYSCOHADA')}
      <div class="bulle ia"><small>L'IA</small>Écriture équilibrée : débit = crédit.</div>
    </div>`,
    contenuPack: ['L\'e-book PDF (environ 90 pages)', '150 prompts SYSCOHADA prêts à copier', 'Modèles Excel : rapprochement, amortissements, immobilisations, balance', 'La checklist de clôture'],
    sommaire: [
      ['00', 'Le mode SYSCOHADA et la confidentialité', 6], ['01', 'Les écritures courantes', 14],
      ['02', 'Des pièces à la saisie', 24], ['03', 'Le rapprochement bancaire', 32],
      ['04', 'Les travaux de clôture', 40], ['05', 'Les états financiers', 50],
      ['06', 'Analyse et rapport au dirigeant', 60], ['07', 'La fiscalité', 68],
      ['08', 'Communication et organisation', 76], ['09', 'Les limites de l\'IA', 82],
    ],
    modeEmploi: [
      { titre: 'À qui s\'adresse cet e-book', texte: 'Aux comptables, assistants comptables et cabinets qui travaillent en SYSCOHADA révisé et veulent confier à l\'IA le travail répétitif, sans jamais lui confier la signature.' },
      { titre: 'Ce qu\'il te faut', etapes: ['Une IA : ChatGPT, Claude ou Gemini (version gratuite pour commencer).', 'Excel ou ton logiciel comptable habituel.', 'Le prompt maître du chapitre 0, à installer une seule fois.'] },
      { titre: 'Les règles de cet e-book', etapes: ['Tu anonymises toujours les données clients avant de les donner à l\'IA.', 'Tu vérifies chaque écriture avec la grille en 7 points.', 'Pour la fiscalité, le texte en vigueur (CGI, loi de finances) a toujours raison contre l\'IA.'] },
    ],
    chapitre: {
      num: '01', titre: 'Les écritures courantes', titreCourt: 'Les écritures courantes',
      objectif: 'faire proposer à l\'IA l\'écriture compte par compte, puis la valider en moins d\'une minute.',
      intro: 'Achats, ventes, TVA, frais, paie, emprunts, puis les cas difficiles : avoirs, acomptes, opérations en devises. Chaque cas a son prompt et son contrôle.',
      duree: '35 min', bonus: '150 prompts SYSCOHADA',
      visuel: `<div class="carte mini"><div class="j-tete">601 · 4452 · 401</div><div class="mini-err ok">Débit = Crédit ✓</div></div>`,
    },
    contenu: {
      page: 16, titre: 'La facture d\'achat avec TVA',
      intro: 'Le cas le plus courant, et celui où l\'IA se trompe le plus souvent de plan comptable. Le mode SYSCOHADA règle le problème.',
      promptNum: 'Prompt 1.3',
      prompt: 'Mode SYSCOHADA. Facture fournisseur F-0231 : marchandises 500 000 F HT, TVA 19,25 %, payable à 30 jours. Donne l\'écriture au journal des achats en tableau : compte, intitulé exact, débit, crédit. Vérifie que débit = crédit.',
      resultatLabel: 'Écriture attendue',
      resultat: '<table><tr><td class="c">601</td><td>Achats de marchandises</td><td class="n">D 500 000</td></tr><tr><td class="c">4452</td><td>TVA récupérable sur achats</td><td class="n">D 96 250</td></tr><tr><td class="c">401</td><td>Fournisseurs</td><td class="n">C 596 250</td></tr></table>',
      erreur: 'Sans le mode SYSCOHADA, l\'IA utilise le plan comptable français : 607 et 44566. L\'écriture semble juste, mais les comptes sont faux.',
      astuce: 'Demande toujours « l\'intitulé exact du compte » : un intitulé inventé trahit un compte inventé.',
    },
    suite: 'Pour aller plus loin sur les tableaux, découvre <b>Excel sans apprendre les formules</b>.',
    cssEnPlus: '',
  },

  boutique: {
    court: 'Comptes de boutique',
    titreCourt: 'Où part l\'argent de ta boutique ?',
    collection: 'Spécial commerçants',
    surtitre: 'Boutique + IA · zéro jargon',
    titreCouv: 'Où part l\'argent de <em>ta boutique</em> ?',
    tailleTitre: 48,
    sousTitre: 'Sache chaque soir combien tu as vraiment gagné, avec ton téléphone et l\'IA.',
    atouts: ['Modèle Google Sheets', '10 messages de relance', '10 minutes par jour'],
    annee: 2026,
    dateEdition: 'Octobre 2026',
    theme: { primaire: '#F0641E', fonce: '#4A1806', accent: '#FFC93C', surAccent: '#3A1404', fond: '#FFF5EA', motif: '#FCE6CF' },
    hautVisuel: 118,
    visuel: `<div class="scene tel-scene">
      <div class="tel"><div class="tel-ecran">
        <div class="tel-tete">Mon assistant boutique</div>
        <div class="bulle moi">Ventes : 85 000. Achats : 52 000. Transport : 3 500. Mama Rose a pris 6 000 à crédit.</div>
        <div class="bulle ia">Bénéfice du jour : 29 500 F. En caisse : 23 500 F. Mama Rose te doit 6 000 F.</div>
      </div></div>
      <div class="carte stat"><small>Aujourd'hui</small><b>+29 500 F</b><span>bénéfice réel</span></div>
    </div>`,
    contenuPack: ['L\'e-book PDF (environ 35 pages)', 'Le modèle Google Sheets « Cahier de caisse intelligent »', '30 prompts pour commerçants et 10 messages de relance', 'La fiche de la routine à imprimer'],
    sommaire: [
      ['00', 'Pourquoi ta boutique vend, mais l\'argent disparaît', 5], ['01', 'Deux poches, deux portefeuilles', 8],
      ['02', 'Le cahier de caisse intelligent', 12], ['03', 'Récupérer l\'argent qu\'on te doit', 17],
      ['04', 'Stock et prix', 21], ['05', 'Le bilan du mois en 1 message', 26],
      ['06', 'Impôts et papiers, sans stress', 30], ['07', 'La routine des 10 minutes', 33],
    ],
    modeEmploi: [
      { titre: 'Pour qui', texte: 'Pour toi qui as une boutique, un comptoir au marché ou une page de vente en ligne, et qui vends bien mais ne sais jamais où part l\'argent.' },
      { titre: 'Ce qu\'il te faut', etapes: ['Ton téléphone. Pas besoin d\'ordinateur.', 'ChatGPT, Claude ou Gemini, gratuit.', 'Le modèle Google Sheets offert avec cet e-book.'] },
      { titre: 'Comment l\'utiliser', etapes: ['Lis un chapitre par soir, il fait 4 pages.', 'Copie les messages encadrés en noir et envoie-les à l\'IA.', 'Fais la routine des 10 minutes chaque soir pendant un mois.'] },
    ],
    chapitre: {
      num: '04', titre: 'Stock et prix', titreCourt: 'Stock et prix',
      objectif: 'calculer ton vrai bénéfice par article et fixer un prix qui rapporte.',
      intro: 'Beaucoup de commerçants pensent gagner 50 F par article et gagnent en réalité 9 F. Le transport et les pertes mangent la marge sans faire de bruit.',
      duree: '15 min', bonus: 'modèle « Cahier de caisse intelligent »',
      visuel: `<div class="carte mini"><div class="j-tete">Savon · prix de vente 500 F</div><div class="mini-err">50 F <span>→</span> 9 F</div></div>`,
    },
    contenu: {
      page: 22, titre: 'Ton vrai bénéfice par article',
      intro: 'Le prix d\'achat ne suffit pas. Il faut ajouter le transport et retirer les articles cassés ou perdus. L\'IA fait le calcul pour toi.',
      promptNum: 'Message 4.2',
      prompt: 'J\'achète un carton de 24 savons à 9 600 F. Transport : 1 200 F. 2 savons arrivent cassés. Je vends le savon à 500 F. Calcule mon vrai bénéfice par savon et dis-moi si mon prix est bon.',
      resultatLabel: 'Réponse de l\'IA',
      resultat: 'Coût réel : 10 800 F ÷ 22 savons = 491 F<br>Bénéfice : 500 − 491 = <b>9 F par savon</b>',
      erreur: 'Diviser par 24 au lieu de 22. On croit gagner 50 F par savon, alors qu\'on en gagne 9.',
      astuce: 'Pour garder 20 % de marge, ton savon doit se vendre au moins 590 F. Ou achète par 2 cartons pour payer moins de transport.',
    },
    suite: 'Tu veux aller plus loin avec ton tableau ? Découvre <b>Excel sans apprendre les formules</b>.',
    cssEnPlus: '',
  },
};

// Styles des visuels (communs aux trois)
const visuelsCss = `
  .scene{position:relative;width:100%;display:flex;flex-direction:column;align-items:center;gap:0}
  .scene .bulle.moi{align-self:flex-end;margin-right:4mm;margin-bottom:-5mm;z-index:3;transform:rotate(2deg)}
  .scene .bulle.ia{align-self:flex-start;margin-left:4mm;margin-top:-6mm;z-index:3;transform:rotate(-2deg)}
  .tableur,.journal{width:150mm;transform:rotate(-1.5deg)}
  .fx{display:flex;gap:3mm;align-items:center;background:#F3F4F6;border-bottom:1px solid #D9DCE1;padding:2.6mm 4mm}
  .fx span{font-style:italic;font-weight:800;color:var(--p)}
  .fx code{font-family:'DejaVu Sans Mono',monospace;font-size:10pt;color:#0B5C2E;background:#fff;border:1.5px solid var(--p);border-radius:1.5mm;padding:1mm 2.5mm}
  .carte table{width:100%;border-collapse:collapse;font-size:10pt}
  .carte td{border:1px solid #E3E5E9;padding:1.8mm 2.5mm}
  .tableur .col td{background:#F7F8FA;color:#7A808A;text-align:center;font-size:8.5pt;padding:1mm}
  .tableur td:first-child{background:#F7F8FA;color:#7A808A;text-align:center;width:7mm;font-size:8.5pt}
  .tableur td:last-child,.journal td:nth-child(3),.journal td:nth-child(4){text-align:right;font-variant-numeric:tabular-nums}
  .carte .tete td{font-weight:800}
  .carte .tot td{background:var(--a);font-weight:800;color:var(--f)}
  .j-tete{background:var(--f);color:#fff;font-weight:800;font-size:10pt;letter-spacing:.04em;padding:2.8mm 4mm}
  .journal td:first-child{font-weight:800;color:var(--p);width:14mm}
  .mini{width:78mm}
  .mini-err{white-space:nowrap;font-family:Fraunces,serif;font-size:26pt;padding:5mm 6mm;color:#D63B1F}
  .mini-err span{color:var(--encre);margin:0 2mm}
  .mini-err.ok{color:var(--p)}
  .tel-scene{flex-direction:row;justify-content:center;align-items:center;gap:0}
  .tel{width:70mm;height:98mm;background:#111;border-radius:11mm;padding:3mm;box-shadow:0 8mm 18mm rgba(0,0,0,.45);transform:rotate(-4deg)}
  .tel-ecran{background:#EFE7DC;border-radius:8.5mm;height:100%;padding:0 3.5mm;display:flex;flex-direction:column;gap:4mm;overflow:hidden}
  .tel-tete{background:var(--f);color:#fff;font-weight:600;font-size:9.5pt;margin:0 -3.5mm;padding:7mm 4mm 3mm}
  .tel .bulle{font-size:9.6pt;max-width:none;box-shadow:0 1mm 3mm rgba(0,0,0,.12)}
  .tel .bulle.moi{margin-left:6mm}
  .tel .bulle.ia{margin-right:5mm}
  .stat{padding:5mm 7mm;transform:rotate(3deg) translate(-8mm,14mm);display:flex;flex-direction:column}
  .stat small{font-size:9pt;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7A808A}
  .stat b{font-family:Fraunces,serif;font-size:28pt;color:#12924A;line-height:1.1}
  .stat span{font-size:10pt}
  code{font-family:'DejaVu Sans Mono',monospace;font-size:.88em}
`;
for (const p of Object.values(module.exports)) p.cssEnPlus = visuelsCss + p.cssEnPlus;
