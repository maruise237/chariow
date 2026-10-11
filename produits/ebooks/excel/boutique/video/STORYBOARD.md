# Pub vidéo Facebook : Excel sans formules

## Ce qu'on a appris du concurrent

Source : Radar KAMTECH, Success Academy, « De Débutant à Expert Excel ».

- **Chiffres :** 7 000 F, 1K+ achats, 254 jours de diffusion, 6 variantes.
- **Fiche Meta :** pub n° 1946105399583073.
- **Pièces du dossier :** la transcription est dans `analyse/concurrent-transcription.txt`, les planches dans `analyse/concurrent-planche*.png`.

### Ce qu'on reprend (le pattern)

- de vraies démos à l'écran, pas de stock vidéo ;
- de grosses touches clavier en surimpression (`Ctrl` + `A`, `Alt` + `F1`) ;
- des bulles d'instruction courtes et très contrastées ;
- un bonus offert dans l'offre, puis un appel à l'action final.

### Ce qu'on fait mieux

| Concurrent | Nous |
|---|---|
| 1 min 46 | 44 s, accroche dans les 3 premières secondes |
| Accroche plate : « Maîtriser Excel et libérer tout son potentiel » | Un fait choquant et vrai : 427 500 000 F au lieu de 15 000 F (tests T12/T13, `preuves/tests-ia.md`) |
| Liste de chapitres (« nous commencerons par les bases ») | Une méthode en 3 gestes, montrée |
| Images d'autres créateurs (filigrane « Naël » visible) | Nos propres captures LibreOffice, toutes vérifiées |
| Vouvoiement, ton catalogue | Tutoiement, comme le livre |
| Pas de prix | Prix et prix barré affichés |

## Voix off (MiniMax Speech 2.8 HD via treg, voix `French_CasualMan`, vitesse 1,08)

| Fichier | Départ | Durée | Texte |
|---|---|---|---|
| s1.mp3 | 0,00 | 9,24 | J'ai demandé une formule Excel à ChatGPT. Résultat : 427 millions de francs. Le vrai chiffre ? 15 000. Et Excel n'a affiché aucune erreur. |
| s2.mp3 | 9,55 | 6,02 | L'IA peut écrire tes formules à ta place. Mais il faut savoir lui parler, et vérifier en 30 secondes. |
| s3.mp3 | 15,95 | 7,12 | Tu écris ta demande en français. L'IA te donne la formule. Tu la colles, et tu contrôles le résultat de tête. |
| s4.mp3 | 23,45 | 7,75 | Stock, tontine, Mobile Money, paie : tu reçois aussi 7 modèles Excel, déjà en francs, prêts à remplir. |
| s5.mp3 | 31,55 | 3,00 | 35 prompts testés, avec les captures des vrais résultats. |
| s6.mp3 | 34,95 | 7,90 | Excel sans apprendre les formules : 2 500 francs au lieu de 10 000. Clique sur En savoir plus. |

Le minutage mot à mot (Whisper) est dans `audio/mots.json`. Les mots y sont parfois mal reconnus : c'est le texte de la colonne de droite qui fait foi.

La musique, `audio/musique.mp3`, est générée par Lyria 3 Clip via treg : Afro-pop / amapiano léger, 30,8 s, instrumental. Elle est bouclée.

## Scènes (1080 × 1920, 30 i/s ; variante 4:5 en 1080 × 1350)

- **A. 0 à 9,5 s : l'accroche.**
  - La capture `err427.png` montre 427 500 000 dans la cellule, qui pulse en rouge (buzz d'erreur sur « 427 »).
  - Sur « Le vrai chiffre ? 15 000 », un whoosh fait passer à la capture `somme-si-ens` : une flèche pointe 15 000 et une coche verte apparaît (ding).
  - Sur « aucune erreur », l'étiquette « Aucun message d'erreur » apparaît.
- **B. 9,5 à 15,9 s : il faut savoir lui parler.**
  - La bulle de chat tape le vrai prompt 2.2 (bruit de clavier).
  - Une puce chrono « 30 s » s'affiche.
- **C. 15,9 à 23,4 s : la méthode en 3 gestes.**
  - ① « Tu écris en français », avec la bulle du prompt.
  - ② « L'IA donne la formule » : la vraie réponse de gpt-5-mini, en police mono.
  - ③ « Tu colles et tu vérifies », avec les touches `Ctrl` + `V`, puis la capture et le calcul de tête 6 000 + 9 000 = 15 000 ✔.
- **D. 23,4 à 31,5 s : les modèles.**
  - Coupe sur chaque mot : stock (flèche sur COMMANDER), tontine, Mobile Money, paie.
  - Puis le badge « + 7 modèles Excel offerts ».
- **E. 31,5 à 34,9 s : la preuve.**
  - Les vraies pages du PDF défilent.
  - Les compteurs affichent « 35 prompts testés », « 7 modèles », « Captures réelles ».
- **F. 34,9 à 44,5 s : l'offre.**
  - La boîte produit entre à l'écran.
  - 10 000 F est barré, puis le tampon 2 500 F tombe (bruit de caisse).
  - Le bouton « En savoir plus » pulse, avec une flèche vers le bas.
  - Logo KAMTECH.

Sous-titres incrustés : 2 à 4 mots par écran, le mot en cours en vert citron `#C8F05A`. En 9:16, ils restent hors des zones masquées par l'interface Reels : les 14 % du haut et les 35 % du bas.
