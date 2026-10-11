# Pub vidéo v3 : « Les formules Excel, ça te bloque ? »

Une version qui repart de zéro par rapport à la v2. Elle ne réutilise que la musique (`../audio/musique.mp3`, non régénérée) et les bruitages (`../audio/sfx`).

## Ce que dit la recherche, et ce qu'on en fait

| Constat (sources web, octobre 2026) | Dans la v3 |
|---|---|
| L'essentiel se joue dans les 3 premières secondes, avec du texte dès la 1re image | Image 0 : « LES FORMULES EXCEL » et une vraie formule qui tremble, puis « ça te bloque ? » à 1,4 s |
| Structure accroche → problème → démo → preuve → appel à l'action, avec un plan toutes les 2 à 3 s | 5 scènes et 14 changements de plan en 30 s |
| Montrer le bénéfice au lieu de le raconter | Les 3 gestes sont montrés : demande tapée, formule de l'IA, Ctrl + V, résultat vérifié |
| Texte gros, centré, animé, hors des zones d'interface Reels | Tout le texte utile tient entre 14 % et 65 % de la hauteur. En bas, une frise décorative seulement. |
| Durée : 15 à 30 s dans le fil d'actualité | 30 s |
| Pour la voix, une baisse de la musique d'environ 6 à 12 dB | Ducking par compression sidechain, mixage à −14 LUFS |

## Typographie

- **Archivo Black** en majuscules pour l'impact : titres, chiffres, prix.
- **Fraunces italique** pour l'émotion, avec un seul accent par écran (« ça te bloque ? », « de les apprendre. », « offerts »).
- **Outfit** pour la lecture : étiquettes et contenu des tableaux.
- **JetBrains Mono** pour les formules.

## Voix off (MiniMax Speech 2.8 HD, French_CasualMan, vitesse 1,08)

| Fichier | Départ | Texte |
|---|---|---|
| v1 | 0,15 | Les formules Excel, ça te bloque ? |
| v2 | 2,55 | Bonne nouvelle : tu n'as plus besoin de les apprendre. |
| v3 | 5,40 | Tu écris ta demande en français. L'IA te donne la formule. Tu la colles, et tu vérifies d'un coup d'œil. |
| v4 | 13,05 | Le guide te donne trente-cinq demandes prêtes à copier, et sept modèles Excel offerts : stock, tontine, Mobile Money, paie. |
| v5 | 21,75 | Excel sans apprendre les formules. Deux mille cinq cents francs, au lieu de dix mille. Clique sur En savoir plus. |

## Données affichées : toutes réelles

- **La démo** reprend le test `preuves/sortie/somme-si-ens` : la formule de l'IA et un total de 15 000 F, égal à 6 000 + 9 000.
- **La demande** affichée est la dernière phrase du vrai prompt 2.2.
- **Les modèles** reprennent les tests c7 :
  - stock : Savon, reste 9 → COMMANDER ;
  - tontine : Awa, reste 20 000 ;
  - Mobile Money : solde Orange Money 134 600 ;
  - paie : net à payer 214 500.
- **Les tableaux** sont redessinés pour être lisibles sur mobile. Les valeurs sont celles des captures.

## Fabrication

```
bash mixer.sh                                            # audio/mix.m4a
NODE_PATH=$(npm root -g) node rendre-video.cjs tout      # sortie/pub-excel-v3-9x16.mp4 et -4x5.mp4
NODE_PATH=$(npm root -g) node rendre-video.cjs miniature
```
