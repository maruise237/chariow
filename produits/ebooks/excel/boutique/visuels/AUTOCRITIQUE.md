# Autocritique des visuels (passes successives)

Chiffres vérifiés : 8 chapitres, 227 pages, 35 prompts, 7 modèles, 77 tests ChatGPT, 2 500 F, 427 500 000 au lieu de 15 000. Les chiffres « 84 tests » et « 58 formules » ont été retirés (consigne du superviseur).

## Vignette 1200 × 1200
- Passe 1 : titre à 228 px trop haut, la feuille de calcul entrait en collision avec le pied de page (logo illisible). Corrigé : titre 212 px, feuille rognée à la ligne 4, pied dégagé.
- Passe 2 : le repère « 1 » de la couverture restait sans légende dans la barre de formule. Masqué par un aplat blanc. Pastille « EXCEL + IA » de l’ancienne vignette et dégradé radial supprimés (anti-slop de la charte).
- Passe 3 (200 px) : « Excel sans formules » se lit sans effort, la feuille reste identifiable comme un tableur. Le pied de page (logo, 227 pages) est illisible à 200 px, c’est voulu (secondaire).

## Bannière 1620 × 600
- Passe 1 : le bloc de texte avait un fond uni qui découpait la grille en rectangle visible. Corrigé : grille masquée au centre par un masque horizontal, texte posé directement.
- Passe 2 : texte contenu dans environ 880 px au centre (1 067 px suffisent pour un recadrage 16:9), marges verticales de 180 px.
- Passe 3 : contraste mesuré (blanc cassé sur #06331C ≥ 10:1, lettres de colonnes #A9C4B3 sur #0B4526 environ 6:1). Reste perfectible : un recadrage plus étroit que 16:9 couperait la ligne « 227 pages · 35 prompts… ».

## Image de partage 1200 × 627
- Passe 1 : le titre sur une ligne passait sous la couverture. Corrigé par une largeur de 580 px.
- Passe 2 : coupure « apprendre les / formules » peu élégante, remplacée par « Excel sans / apprendre / les formules ».
- Passe 3 : couverture réelle à droite avec filet d’ombre fin, prix en aplat accent (un seul, utilisé comme étiquette de prix), texte ≥ 25 px.

## Mockups (4 × 1080 × 1350)
- Passe 1 : cadre de téléphone en CSS (rapport 9:19,4, coins 92 px, boutons latéraux, ombre double discrète). Pages du PDF rendues à 200 dpi, défilement continu comme dans un lecteur PDF.
- Passe 2 : les pages 1 et 2 du PDF s’impriment à 2/3 de la page (voir point ouvert) : rognées au contenu. Colonne « .xlsx » redondante supprimée sur le mockup modèle, titre « à remplir » (veuve) remplacé.
- Passe 3 : le texte des pages est lisible à 1080 px de large (corps environ 11 px dans le cadre), la pastille « n / 129 » du lecteur chevauche parfois une ligne du livre. Reste perfectible : le mockup modèle montre la vraie capture du modèle Stock mais l’écran « liste de fichiers » est une interface dessinée.

## Affiche 1080 × 1080 (427 500 000 au lieu de 15 000)
- Passe 1 : hiérarchie nette (chiffre en accent, « au lieu de 15 000 » en blanc, preuve, pied). Espace fine avant « : » ajoutée.
- Passe 2 : légende « Aucun message d’erreur » placée sous la capture, source du fait (chapitre 2).
- Passe 3 (360 px) : le chiffre et le prix restent lisibles, la formule de la capture ne l’est plus (normal). Reste perfectible : la capture a une marge blanche à droite.

## Affiche 1080 × 1350 (77 tests réels sur ChatGPT)
- Passe 1 : « 77 » seul en haut à gauche laissait un grand vide à droite et en bas. Texte placé à droite du chiffre, chiffre agrandi.
- Passe 2 : « tableur. » seul sur une ligne, corrigé par text-wrap: balance. Contenu descendu pour réduire le vide.
- Passe 3 (360 px) : la hiérarchie 77, texte, preuve, prix tient. Reste perfectible : un vide d’environ 130 px sous la légende de la capture.

## Story 1080 × 1920 (35 prompts prêts à copier)
- Passe 1 : téléphone à l’échelle .8, trop petit. Passage à .9, colonne de texte réduite à 380 px.
- Passe 2 : zone sûre contrôlée : tout est entre y = 270 et y = 1 667 (250 px libres en haut et en bas).
- Passe 3 (360 px) : titre, prix et téléphone lisibles. Fond accent #C8F05A avec texte vert foncé (contraste supérieur à 10:1). Reste perfectible : le texte des pages dans le téléphone est illustratif, non lisible à 360 px.

## Slop écarté
Pas de dégradé, de halo, d’étoile, d’emoji, de badge, de carte inclinée ni de reflet. Open Peeps non utilisés (aucun visuel ne les justifiait).

## Passe supplémentaire : nouveau PDF de 227 pages
Le PDF corrigé (227 pages) a remplacé l’ancien : pages utilisées re-rendues à 200 dpi (couverture p.1, sommaire p.2, p.54 et p.55 pour le prompt 2.2, p.57 et p.58 pour la capture annotée et l’erreur 427 500 000). Anciennes images supprimées de `src/img`. « 129 » remplacé par « 227 » partout (vérifié par recherche dans les sources), pastilles « n / 227 » avec le vrai numéro de page.
- Pastille du lecteur : elle chevauchait des lignes du livre. Déplacée dans la barre de l’application (à droite du nom du fichier). La barre d’accueil du téléphone ne barre plus une ligne de texte (défilement décalé de 23 px).
- Mockup prompt et story : ils enchaînent maintenant p.54 (bas), p.55 et p.56, pages contiguës réelles, au lieu d’une page quasi vide.
- Mockup modèle : l’interface « liste de fichiers » inventée est supprimée. Il montre la vraie capture du modèle Stock, la légende « Modèle Stock, inclus », une phrase déduite de la capture (COMMANDER quand le reste passe sous le seuil) et la liste des 7 modèles (noms du livre). Aucun cadre d’interface dessiné. Reste perfectible : pas d’appareil, donc moins « mockup » que les trois autres.
- Affiche 427 500 000 : la marge blanche à droite de la capture porte maintenant une annotation rouge « ← aucune alerte » (fait établi par le livre). Reste perfectible : l’annotation est ajoutée sur la capture, à signaler comme dans le livre (repères annotés).
- Affiche 77 : vide de 130 px sous la légende réparti en deux marges égales (140 px au-dessus et au-dessous de la capture).
- Partage : couverture remplacée par la version pleine page du nouveau PDF (une image manquante a été repérée au rendu et corrigée).
- Note : la couverture imprimée dit encore « 35 prompts testés / 7 modèles Excel / Captures réelles ». Cohérent avec les visuels, rien à changer côté visuels.
- Poids : tous les PNG font entre 54 et 275 Ko, bien sous 2 Mo.
