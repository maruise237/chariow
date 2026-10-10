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
  boutique: 'kamtech.mychariow.com', // boutique Chariow KAMTECH (vide = pas de lien imprimé)
  logo: 'logo-kamtech.png',          // logo de la boutique Chariow KAMTECH
  signature: '#1C1E21',     // noir du logo KAMTECH
  texte: 'Literata',        // texte courant, commun à tous les e-books : dessinée pour la lecture sur Android
  util: 'Hanken Grotesk',   // tableaux, légendes, étiquettes, prompts : sans-serif utilitaire, chiffres tabulaires
  mono: 'JetBrains Mono',   // formules uniquement
  encre: '#16181D',
  erreur: '#D63B1F',
  format: { l: '148mm', h: '185mm' },   // portrait 4:5, largeur A5 : lisible sur téléphone sans zoom
};

const DA = {
  // Pro, premium, livre de référence : sobre, éditorial, beaucoup de blanc.
  cabinet: {
    nom: 'Cabinet',
    titres: { famille: 'Zodiak', graisse: 700, casse: 'none', interlettre: '-0.01em' },
    couleurs: { primaire: '#1F3FD1', fonce: '#00104F', accent: '#E8B84A', surAccent: '#1A1405', fond: '#FAF8F2', papier: '#FFFFFF' },
    corps: 15.5, interligne: 1.5,       // ≈ 15 px à l'écran d'un téléphone de 393 px (calcul dans DIRECTION-ARTISTIQUE.md) : lecteurs pros, aussi sur PC
    couverture: 'scene',   // l'écriture au journal : comme les autres couvertures, on montre l'objet du lecteur
    ouvertures: ['scinde'],
    motif: 'filets',
  },
  // Outil, action, apprenants motivés : énergique, grille de tableur, contraste fort.
  atelier: {
    nom: 'Atelier',
    titres: { famille: 'Cabinet Grotesk', graisse: 800, casse: 'none', interlettre: '-0.02em' },
    couleurs: { primaire: '#12924A', fonce: '#06331C', accent: '#C8F05A', surAccent: '#06331C', fond: '#F4F8F2', papier: '#FFFFFF' },
    corps: 17, interligne: 1.45,       // ≈ 16 px à l'écran d'un téléphone de 393 px
    couverture: 'scene',
    ouvertures: ['plein', 'panneau'],
    motif: 'grille',
  },
  // Grand public, petit prix, lecture sur téléphone : chaleureux, gros caractères, une idée par écran.
  marche: {
    nom: 'Marché',
    titres: { famille: 'Bricolage Grotesque', graisse: 800, casse: 'none', interlettre: '-0.02em' },
    couleurs: { primaire: '#E85A16', fonce: '#4A1806', accent: '#FFC93C', surAccent: '#3A1404', fond: '#FFF6EC', papier: '#FFFFFF' },
    corps: 18, interligne: 1.45,      // ≈ 17 px à l'écran d'un téléphone de 393 px, une idée par écran
    couverture: 'scene',
    ouvertures: ['panneau', 'plein'],
    motif: 'pagne',
  },
  // Créatifs, vidéo, réseaux sociaux (réservé au futur e-book montage vidéo) : sombre, brut, néon.
  studio: {
    nom: 'Studio',
    titres: { famille: 'Supreme', graisse: 800, casse: 'uppercase', interlettre: '-0.01em' },
    couleurs: { primaire: '#7B5CFF', fonce: '#0E0B1A', accent: '#FF3D7F', surAccent: '#FFFFFF', fond: '#F4F2FF', papier: '#FFFFFF' },
    corps: 17, interligne: 1.45,
    couverture: 'typo',
    ouvertures: ['plein'],
    motif: 'grille',
  },
};

const ff = (fam, fichier, graisse, style = 'normal') => `@font-face{font-family:'${fam}';font-weight:${graisse};font-style:${style};src:url(../assets/fonts/${fichier}.woff2)}`;
const POLICES = [
  ff('Literata', 'literata-latin-400-normal', 400), ff('Literata', 'literata-latin-400-italic', 400, 'italic'),
  ff('Literata', 'literata-latin-600-normal', 600), ff('Literata', 'literata-latin-700-normal', 700),
  ff('Hanken Grotesk', 'hanken-grotesk-latin-400-normal', 400), ff('Hanken Grotesk', 'hanken-grotesk-latin-600-normal', 600),
  ff('Hanken Grotesk', 'hanken-grotesk-latin-800-normal', 800),
  ff('JetBrains Mono', 'jetbrains-mono-latin-500-normal', 500),
  ff('Zodiak', 'Zodiak-Bold', 700), ff('Zodiak', 'Zodiak-BoldItalic', 700, 'italic'), ff('Zodiak', 'Zodiak-Extrabold', 800),
  ff('Cabinet Grotesk', 'CabinetGrotesk-Bold', 700), ff('Cabinet Grotesk', 'CabinetGrotesk-Extrabold', 800),
  ff('Bricolage Grotesque', 'bricolage-grotesque-latin-600-normal', 600), ff('Bricolage Grotesque', 'bricolage-grotesque-latin-800-normal', 800),
  ff('Supreme', 'Supreme-Extrabold', 800),
].join('\n');

module.exports = { MARQUE, DA, POLICES };
