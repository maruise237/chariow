# Brief commun aux rédacteurs de chapitres (e-book « Excel sans apprendre les formules »)

Public : employés, étudiants, chercheurs d'emploi, commerçants au Cameroun. Lecture sur téléphone. Tutoiement. Montants en F CFA. Prix de l'e-book : 2 500 F.

## Règle absolue : rien d'inventé
- Chaque réponse d'IA citée est une vraie réponse obtenue par toi (ChatGPT via treg, voir plus bas), avec le modèle et la date.
- Chaque résultat de formule ou de manipulation est calculé ou vérifié dans le vrai tableur (LibreOffice Calc 24.2 en français).
- Chaque affirmation sur Excel, Google Sheets, un taux ou une règle (fiscale, sociale…) est testée, ou sourcée par une page que tu as réellement ouverte (WebFetch), de préférence support.microsoft.com/fr-fr ou une source officielle. Cite la source dans le texte, simplement (« aide Microsoft, page X »).
- Si tu ne peux ni tester ni sourcer : ne l'écris pas, ou écris clairement que c'est à vérifier.
- Si l'IA se trompe, montre-le honnêtement : c'est ce qui fait la valeur du livre.

## Fichiers à lire d'abord
- `produits/ebooks/excel/excel.md` : le livre actuel (chapitres 0 et 2). Imite exactement son ton, sa longueur de paragraphes et ses blocs.
- `produits/charte/DIRECTION-ARTISTIQUE.md` et `produits/charte/README.md` (blocs disponibles : `:::chapitre`, `:::prompt`, `:::resultat … | mono`, `:::capture`, `:::erreur`, `:::astuce`, `:::checklist`, `:::chiffre`, `:::recap`, `:::exercice`, `:::illustration`, tableaux markdown…).
- `produits/preuves/tests-ia.md` (journal existant) et `produits/preuves/cas/*.json` (format des cas du tableur).

## Outils
1. ChatGPT réel : outil MCP `mcp__treg__call` (le charger avec ToolSearch « select:mcp__treg__call »), endpoint `dataforseo.x.ai-optimization-chat-gpt-llm-responses-live`, body = tableau d'UN objet : {"model_name":"gpt-4o-mini" ou "gpt-5-mini","max_output_tokens":600 (2000 pour gpt-5-mini),"temperature":0.3 (pas pour gpt-5-mini),"web_search":false,"user_prompt":"… (500 caractères max)"}. ≈ 0,001 $ par appel. **Budget : 25 appels maximum par chapitre.** idempotency_key unique, préfixé par ton chapitre (ex. « kam-c3-t01 »).
2. Tableur réel : `python3 produits/preuves/tableur.py produits/preuves/cas/<id>.json` (depuis /home/user/chariow). Calcule, compare à l'attendu, produit `produits/preuves/sortie/<id>/capture.png`. **Préfixe tes ids de cas par ton chapitre** (ex. « c3-doublons »). Mets `"largeurs_serrees": 40`. Plage de capture : 4-5 colonnes et 6-7 lignes maximum (lisibilité téléphone). Plusieurs agents lancent l'outil en même temps : c'est prévu (profil, port et écran séparés).
   - L'outil ne gère que des formules. Pour autre chose (tableau croisé, graphique, mise en forme conditionnelle, macro), écris TON PROPRE script dans `produits/preuves/outils/<ton-chapitre>-<nom>.py` en t'inspirant de tableur.py (Python-UNO, Xvfb), sans modifier tableur.py.
3. Rendu : écris ton chapitre dans `produits/ebooks/excel/chapitres/chNN.md` (SANS en-tête ---, il commence par le bloc `:::chapitre NN`). Pour le tester, crée `produits/ebooks/excel/test-chNN.md` = l'en-tête --- de excel.md + ton fichier, puis `NODE_PATH=$(npm root -g) node produits/charte/moteur.js produits/ebooks/excel/test-chNN.md`, regarde les pages (`pdftoppm -r 80 -png …`). Supprime ensuite test-chNN.md et ses sorties (sortie/test-chNN*).
   - Chemins des captures dans le .md : `../../preuves/sortie/<id>/capture.png`.

## Captures annotées
:::capture ../../preuves/sortie/<id>/capture.png | Légende courte (« Capture réelle, LibreOffice Calc en français. »)
1: x,y h4 | texte du repère 1
2: x,y g4 | texte du repère 2
:::
x,y = point visé en % de largeur/hauteur de l'image ; lettre = d'où vient la flèche (g, d, h, b) + longueur (4 conseillé) ; le repère de la barre de formule en « h4 ». Superpose une grille de 10 % sur la capture (ImageMagick) pour viser juste ; le rond (rayon ≈ 2,6 % de la largeur) ne doit pas masquer de donnée. Vérifie sur le rendu PDF. 2 à 4 repères.

## Forme
- Chapitre : `:::chapitre NN` avec titre (7 mots max), objectif (commence par un verbe à l'infinitif, sans majuscule : « obtenir… »), intro, duree, illustration (id imposé dans ta mission).
- Sections `##` de 7 mots max. Paragraphes de 60 mots max (le moteur alerte à 75). 0 alerte attendue.
- Chaque besoin : un :::prompt (de préférence avec le réglage « J'utilise Excel 2016 en français… », ou une demande naturelle en français), la vraie réponse (:::resultat Réponse réelle de ChatGPT (modèle) | mono), la preuve (capture), et un :::erreur ou :::astuce tiré de ce que tu as observé.
- Une formule dans un paragraphe ou un prompt : entre accents graves.
- Fin de chapitre : :::recap (5 points max) et :::exercice.
- Vise 10 à 16 pages de PDF pour ton chapitre.
- Style : phrases simples, pas de jargon non expliqué, pas de formules toutes faites d'IA (« plongeons », « en résumé », « il est important de noter »), pas de tirets cadratins.

## Journal
Écris tes tests dans `produits/preuves/tests-ia-chNN.md` (pas dans tests-ia.md, d'autres agents écrivent en même temps) : un tableau (n°, date, modèle, prompt résumé, formule reçue, verdict) et un tableau des cas tableur (cas, formule, valeur réelle).

## Interdits
Ne modifie pas : excel.md, moteur.js, da.js, visuels.js, tableur.py, les cas ou sorties des autres. Ne commite pas. N'affiche jamais de variable d'environnement.

## Retour attendu
Sections écrites, tableau des tests IA, tableau des cas tableur, sources ouvertes, nombre de pages de ton chapitre, ce qui n'a pas marché (honnêtement).
