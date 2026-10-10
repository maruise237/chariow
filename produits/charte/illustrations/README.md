# Illustrations KAMTECH (Open Peeps)

Personnages SVG pour les e-books, générés à partir d'Open Peeps.

## Source et licence

- Illustrations : Open Peeps de Pablo Stanley, domaine public CC0, https://www.openpeeps.com/
- Rendu : paquet npm `react-peeps` 0.1.10 (licence MIT), avec react et react-dom 17.0.2.

## Générer

```
cd produits/charte/illustrations
npm install
NODE_PATH=$(npm root -g) node generer.js          # tous les personnages
NODE_PATH=$(npm root -g) node generer.js assis-bantu   # un seul (par id)
```

Nécessite Playwright installé globalement (Chromium sert à mesurer la boîte englobante réelle).
Sorties :
- `../assets/illustrations/<id>.svg` : versionnés. Pas de width/height : la taille se règle en CSS. Le viewBox est serré sur le dessin (+2 % de marge).
- `controle/<id>.png` et `controle/planche.png` : captures de contrôle (non versionnées).

## Couleurs

Trait `#16181D`. Le remplissage « peau » est écrit `var(--peau, #B9814F)` : pour changer la teinte, définir `--peau` en CSS (si le SVG est inclus en ligne ; avec `<img>`, la variable n'est pas héritée, c'est la valeur par défaut qui s'applique). Attention : sur certains vêtements (pulls, t-shirts) le même remplissage sert aussi aux motifs ou au vêtement.

## Ajouter un personnage

1. Ajouter un objet dans `personnages.json` : `{ "id", "body", "hair", "face", "facialHair", "accessory" }` (`facialHair` et `accessory` : `"None"` si vide).
2. Les noms valides sont les fichiers de `node_modules/react-peeps/lib/peeps/` : `pose/bust`, `pose/sitting`, `pose/standing` (body), `hair`, `face`, `facialHair`, `accessories`.
3. Relancer `node generer.js`, vérifier `controle/planche.png`.
