# Journal des tests, chapitre 01 « L'essentiel d'Excel en 1 heure »

Date des tests : 10 octobre 2026. ChatGPT via treg (endpoint llm-responses-live, web_search désactivé). 7 appels sur 25 autorisés. Tableur : LibreOffice Calc 24.2 en français (`tableur.py`).

## Tests IA

| n° | Modèle | Prompt résumé | Réponse (formule) | Verdict |
|---|---|---|---|---|
| kam-c1-t01 | gpt-5-mini | Explique `=SI(NB.SI($A$2:$A$7;A2)>1;"Doublon";"")` à un débutant, 6 lignes | Explication morceau par morceau, $ expliqués | Juste, vérifiée dans le tableur (c1-explique). |
| kam-c1-t02 | gpt-4o-mini | Même demande | Explication juste, mais n'explique pas pourquoi A2 n'a pas de $ ; ajoute « En résumé » | Correcte sur le fond, moins utile. Non montrée dans le livre. |
| kam-c1-t03 | gpt-5-mini | « 6 000 F » tapés avec le F, SOMME trop petite, pourquoi, comment garder le F | Texte ignoré par SOMME ; format personnalisé `# ##0" F"` ; en secours `=VALEUR(SUBSTITUE(B2;" F";""))` | Diagnostic et format justes (c1-texte-corrige : 14 500 F). VALEUR donne #NOM? (c1-texte-valeur) : le nom français est CNUM. |
| kam-c1-t04 | gpt-4o-mini | Même demande | `=SOMME(VALEUR(SUBSTITUE(B2:B4; " F"; "")))`, suppression du F ou conversion | Diagnostic juste, formule fausse : VALEUR inconnue, et avec CNUM le tableur renvoie #VALEUR! (sans saisie matricielle). |
| kam-c1-t05 | gpt-5-mini | `=B2/B6` recopiée donne #DIV/0! en C3 (`=B3/B7`), pourquoi, quelle formule | `=SI($B$6=0;"";B2/$B$6)` | Juste (c1-ia-5mini : 29,3 / 22,0 / 29,3 / 19,5 %). SI superflu. |
| kam-c1-t06 | gpt-4o-mini | Même demande | `=SI(B6=0; ""; B2/B6)` (sans $) | Piège : recopiée, C3 à C5 deviennent vides, sans erreur (c1-ia-4omini). |
| kam-c1-t07 | gpt-5-mini | Google Sheets français sur Android : où taper `=SOMME(B2:B5)`, séparateur | Cellule ou barre de formule, `=SOMME(B2:B5)`, « ; » en français | Non vérifiable dans Google Sheets (pas d'accès). Citée dans le livre comme non vérifiée. |

## Cas tableur (préfixe c1-)

| Cas | Formule | Valeur réelle |
|---|---|---|
| c1-adresse | (aucune, valeurs) | capture de C3 = 150 |
| c1-plage | `=SOMME(D2:D5)` en D6 | 20 500 (capture non utilisée dans le texte final) |
| c1-recopie | `=B2*C2` à `=B5*C5` ; `=SOMME(D2:D5)` | 6 000 ; 4 500 ; 6 000 ; 4 000 ; 20 500 |
| c1-texte | `=SOMME(B2:B4)` avec « 6 000 F » et « 4 000 F » (texte), 4 500 (nombre) | 4 500 (au lieu de 14 500) |
| c1-texte | `=B2+B3` (B2 texte) | #VALEUR! |
| c1-texte-corrige | `=SOMME(B2:B4)` sur 6000, 4500, 4000, format `# ##0" F"` | 14 500 (affiché 14 500 F) |
| c1-texte-valeur | `=CNUM(SUBSTITUE(B2;" F";""))` (B2:B4) | 6 000 ; 4 500 ; 4 000 ; total 14 500 |
| c1-texte-valeur | `=SOMME(CNUM(SUBSTITUE(B2:B4; " F"; "")))` (gpt-4o-mini, avec CNUM) | #VALEUR! |
| c1-texte-valeur | `=VALEUR(SUBSTITUE(B2;" F";""))` (gpt-5-mini, telle quelle) | #NOM? |
| c1-avant / c1-apres | `=B2*C2`... | 300 000 ; 260 000 ; 540 000 (avant : sans format, colonnes étroites) |
| c1-sans-dollar | `=B2/B6` recopiée : `=B3/B7`, `=B4/B8`, `=B5/B9` | 29,3 % puis #DIV/0! x3 |
| c1-avec-dollar | `=B2/$B$6` recopiée, `=SOMME(C2:C5)` | 29,3 ; 22,0 ; 29,3 ; 19,5 % ; total 100 % |
| c1-ia-5mini | `=SI($B$6=0;"";B2/$B$6)` | idem c1-avec-dollar |
| c1-ia-4omini | `=SI(B6=0; ""; B2/B6)` recopiée (B7, B8, B9 vides) | 29,3 % puis 3 cellules vides |
| c1-explique | `=SI(NB.SI($A$2:$A$7;A2)>1;"Doublon";"")` | Doublon, Doublon, Doublon, vide, vide, Doublon (Awa x2, Boris x2) |

Test de saisie (script temporaire, FormulaLocal, équivalent à la frappe en locale française dans LibreOffice) : « 6000 » nombre ; « 6 000 » nombre ; « 6000 F », « 6 000 F », « 6000F », « 6000 FCFA » texte ; « 6.000 » texte ; « 6,5 » nombre.

Limite : ces tests valent pour LibreOffice Calc. Pour Excel, le livre s'appuie sur les pages d'aide citées ci-dessous.

## Sources ouvertes (WebFetch, 10 octobre 2026)

- Microsoft : « SOMME » (ignore le texte ; `+` peut donner #VALEUR!) ; « Corriger des nombres mis en forme en tant que texte en appliquant un format numérique » (aligné à gauche, triangle vert) ; « Basculer entre les références relatives, absolues et mixtes » (F4, signe $) ; « Recopier une formule dans des cellules adjacentes » (poignée de recopie, références relatives) ; « Modifier la largeur de colonne et la hauteur de ligne » (double-clic sur la limite) ; « Afficher ou masquer le séparateur de milliers » (Style de virgule) ; « Créer un format de nombre personnalisé » (Personnalisée, texte entre guillemets) ; « CNUM » (nom français, `CNUM(texte)`) ; « Excel pour les téléphones Android : conseils animés » (barre de formule, coche, bouton fx).
- Google : « Mettre en forme des nombres dans une feuille de calcul » (paramètres régionaux et séparateur décimal) ; « Modifier les paramètres de la feuille » (answer 58515, effet sur le format) ; « SOMME » (syntaxe avec « ; » dans l'aide française, sans règle écrite) ; « Ajouter des formules et des fonctions » (ordinateur et Android).
- Non trouvé : aucune page d'aide Google officielle ne dit que le séparateur d'arguments dépend des paramètres régionaux (seulement des blogs, non cités).
