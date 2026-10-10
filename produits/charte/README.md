# Charte des e-books KAMTECH

Gabarit commun aux 3 e-books. La structure suit le modèle Canva de Chariow, avec nos couleurs et une couverture plus travaillée.

Format : 203 × 254 mm (portrait 4:5, comme le modèle Chariow). C'est lisible sur téléphone.

## Structure d'un e-book
1. **Couverture.** Fond dégradé de la couleur du produit. Grand titre serif avec un mot en accent. Au centre, un visuel « avant/après IA » : une question à l'IA, le résultat, la réponse. En bas, 3 atouts et la signature.
2. **Avertissement.** Bande foncée, usage personnel, interdiction de partage WhatsApp/Telegram.
3. **Sommaire.**
4. **Comment lire cet e-book.** Sections numérotées séparées par des filets, étapes avec flèches.
5. **Ouverture de chapitre.** Grand numéro en contour, panneau arrondi foncé, « Tu vas savoir : », pilule de durée de lecture et bonus lié.
6. **Pages de contenu.** Composants : prompt à copier (encadré foncé), résultat attendu, erreur fréquente (rouge), astuce.
7. **À propos de l'auteur.** Bande couleur accent, renvoi vers le produit suivant.
8. **4e de couverture.** Couleurs Easy Store, logos Easy Store et KAMTECH.

## Couleurs
| | Primaire | Foncé | Accent | Fond |
|---|---|---|---|---|
| Marque Easy Store | #001DA1 | | #1080FF | |
| Excel avec l'IA | #12924A | #06331C | #C8F05A | #F1F7F0 |
| Comptable 2.0 | #1F3FD1 | #00104F | #E8B84A | #F5F3EC |
| Comptes de boutique | #F0641E | #4A1806 | #FFC93C | #FFF5EA |

Polices (libres, OFL) : Fraunces 700 pour les titres, Outfit pour le texte.

## Générer
```
NODE_PATH=$(npm root -g) node produits/charte/generer.js [excel|compta|boutique]
```
Les sorties vont dans `apercu/` : le PDF, le HTML et le PNG de chaque page. Les contenus et les couleurs sont dans `produits.js`. Les titres sont provisoires (E2, C1, CA1) en attendant ton choix.
