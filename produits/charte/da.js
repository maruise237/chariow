// Directions artistiques (DA) des e-books KAMTECH.
//
// Trois couches :
// 1. MARQUE : ce qui ne change jamais (logo, police du texte, forme des encadrés de la méthode,
//    pages licence, auteur et 4e de couverture). C'est ce qui fait reconnaître un e-book KAMTECH.
// 2. DA : choisie selon le public, le prix et l'usage du livre (voir DIRECTION-ARTISTIQUE.md).
//    Elle fixe couleurs, police des titres, densité, style de couverture et d'ouvertures.
// 3. Le contenu : chaque bloc (prompt, étapes, chiffre-choc...) a sa mise en page, la DA ne fait que la teinter.

const MARQUE = {
  nom: 'KAMTECH',
  boutique: 'esaysto.mychariow.shop',
  signature: '#111318',     // encre de la marque (logo, 4e de couverture)
  texte: 'Outfit',          // police du texte, commune à tous les e-books
  encre: '#16181D',
  erreur: '#D63B1F',
  format: { l: '148mm', h: '185mm' },   // portrait 4:5, largeur A5 : lisible sur téléphone sans zoom
};

const DA = {
  // Pro, premium, livre de référence : sobre, éditorial, beaucoup de blanc.
  cabinet: {
    nom: 'Cabinet',
    titres: { famille: 'DM Serif Display', graisse: 400, casse: 'none', interlettre: '-0.01em' },
    couleurs: { primaire: '#1F3FD1', fonce: '#00104F', accent: '#E8B84A', surAccent: '#1A1405', fond: '#FAF8F2', papier: '#FFFFFF' },
    corps: 14, interligne: 1.5,       // ~48 car./ligne, ~13 px sur téléphone : lecteurs pros, souvent aussi sur PC
    couverture: 'typo',
    ouvertures: ['scinde'],
    motif: 'filets',
  },
  // Outil, action, apprenants motivés : énergique, grille de tableur, contraste fort.
  atelier: {
    nom: 'Atelier',
    titres: { famille: 'Space Grotesk', graisse: 700, casse: 'none', interlettre: '-0.02em' },
    couleurs: { primaire: '#12924A', fonce: '#06331C', accent: '#C8F05A', surAccent: '#06331C', fond: '#F4F8F2', papier: '#FFFFFF' },
    corps: 15.5, interligne: 1.45,     // ~44 car./ligne, ~15 px sur téléphone
    couverture: 'scene',
    ouvertures: ['plein', 'panneau'],
    motif: 'grille',
  },
  // Grand public, petit prix, lecture sur téléphone : chaleureux, gros caractères, une idée par écran.
  marche: {
    nom: 'Marché',
    titres: { famille: 'Bricolage Grotesque', graisse: 800, casse: 'none', interlettre: '-0.02em' },
    couleurs: { primaire: '#E85A16', fonce: '#4A1806', accent: '#FFC93C', surAccent: '#3A1404', fond: '#FFF6EC', papier: '#FFFFFF' },
    corps: 17, interligne: 1.4,       // ~40 car./ligne, 16 px sur téléphone, une idée par écran
    couverture: 'scene',
    ouvertures: ['panneau', 'plein'],
    motif: 'pagne',
  },
  // Créatifs, vidéo, réseaux sociaux (réservé au futur e-book montage vidéo) : sombre, brut, néon.
  studio: {
    nom: 'Studio',
    titres: { famille: 'Archivo Black', graisse: 400, casse: 'uppercase', interlettre: '-0.01em' },
    couleurs: { primaire: '#7B5CFF', fonce: '#0E0B1A', accent: '#FF3D7F', surAccent: '#FFFFFF', fond: '#F4F2FF', papier: '#FFFFFF' },
    corps: 15.5, interligne: 1.45,
    couverture: 'typo',
    ouvertures: ['plein'],
    motif: 'grille',
  },
};

const POLICES = `
  @font-face{font-family:Outfit;font-weight:300;src:url(../assets/fonts/outfit-latin-300-normal.woff2)}
  @font-face{font-family:Outfit;font-weight:400;src:url(../assets/fonts/outfit-latin-400-normal.woff2)}
  @font-face{font-family:Outfit;font-weight:600;src:url(../assets/fonts/outfit-latin-600-normal.woff2)}
  @font-face{font-family:Outfit;font-weight:800;src:url(../assets/fonts/outfit-latin-800-normal.woff2)}
  @font-face{font-family:Fraunces;font-weight:700;src:url(../assets/fonts/fraunces-latin-700-normal.woff2)}
  @font-face{font-family:Fraunces;font-weight:700;font-style:italic;src:url(../assets/fonts/fraunces-latin-700-italic.woff2)}
  @font-face{font-family:Fraunces;font-weight:400;font-style:italic;src:url(../assets/fonts/fraunces-latin-400-italic.woff2)}
  @font-face{font-family:'DM Serif Display';font-weight:400;src:url(../assets/fonts/dm-serif-display-latin-400-normal.woff2)}
  @font-face{font-family:'Space Grotesk';font-weight:700;src:url(../assets/fonts/space-grotesk-latin-700-normal.woff2)}
  @font-face{font-family:'Bricolage Grotesque';font-weight:800;src:url(../assets/fonts/bricolage-grotesque-latin-800-normal.woff2)}
  @font-face{font-family:'Archivo Black';font-weight:400;src:url(../assets/fonts/archivo-black-latin-400-normal.woff2)}
  @font-face{font-family:'JetBrains Mono';font-weight:500;src:url(../assets/fonts/jetbrains-mono-latin-500-normal.woff2)}
`;

module.exports = { MARQUE, DA, POLICES };
