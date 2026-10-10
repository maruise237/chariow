# Charte et moteur des e-books KAMTECH

- **Pourquoi** ces choix, et comment choisir pour un nouveau produit : `DIRECTION-ARTISTIQUE.md`.
- **Directions artistiques** (couleurs, polices, styles) : `da.js`.
- **Visuels** réutilisables (tableur, journal, téléphone, avant/après) : `visuels.js`.
- **Moteur** (source texte → PDF) : `moteur.js`.
- **Exemples** : `exemples/*.md`, avec un chapitre type par e-book, et leurs rendus dans `exemples/sortie/`.

## Écrire un e-book
1. Copier un exemple : `exemples/excel.md`.
2. Dans l'en-tête, régler `da:` (cabinet, atelier, marche ou studio), le titre, les atouts et le visuel de couverture.
3. Écrire le contenu en texte simple : `##` pour les titres, `-` pour les puces, `1.` pour les étapes, et les blocs `:::prompt`, `:::recap`, etc. (liste dans `DIRECTION-ARTISTIQUE.md`).
4. Générer :
```
NODE_PATH=$(npm root -g) node produits/charte/moteur.js produits/charte/exemples/excel.md
```

Le moteur produit dans `sortie/` :
- le PDF, avec signets et sommaire cliquable ;
- la vignette carrée pour la boutique et les pubs ;
- la miniature de 200 px pour vérifier la lisibilité ;
- une image de chaque page dans `sortie/png/`.

Il signale aussi ce qui ne respecte pas la charte : titre trop long, chapitre sans récap, paragraphe trop long.
