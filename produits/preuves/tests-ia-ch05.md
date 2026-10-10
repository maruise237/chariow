# Journal des tests, chapitre 5 « Ton tableau de bord en 30 minutes »

Date des tests : 10 octobre 2026. ChatGPT via treg (dataforseo, llm_responses), modèle gpt-5-mini-2025-08-07, web_search désactivé. 6 appels sur 25 autorisés (kam-c5-t01 à t06 ; t02 refusé car prompt de plus de 500 caractères, non facturé, repris en t03). Tableur : LibreOffice Calc 24.2.7.2, en français.

## Appels à ChatGPT

| n° | Modèle | Prompt résumé | Réponse (résumé ou formule) | Verdict |
|---|---|---|---|---|
| t01 | gpt-5-mini | Structure d'un tableau de bord mensuel pour une boutique de hijabs (Excel 2016 FR) | 5 feuilles (Paramètres, Ventes, Dépenses, Encaissements, Tableau_de_bord), 10 colonnes pour Ventes, une douzaine d'indicateurs | Correct mais trop lourd : nous gardons 3 feuilles |
| t03 | gpt-5-mini | Formules B2 à B7 (ventes, dépenses, bénéfice, 3 parts de moyens de paiement) | `=SOMME.SI(Ventes!$A$2:$A$40;$B$1;Ventes!$C$2:$C$40)` ; `=B2-B3` ; `=SI(B2=0;0;SOMME.SI.ENS(…;"Espèces")/B2*100)` etc. | Calculs justes (testés). Piège : `*100` + format Pourcentage = 3 538,5 % |
| t04 | gpt-5-mini | Évolution D2 (ventes) et D4 (bénéfice) vs mois précédent | `=SI(OU(ESTVIDE(C2);C2=0);"";(B2-C2)/C2)`, à recopier en D4 | Juste pour D2 et protégée contre #DIV/0!. Pour D4 : signe faux si le mois précédent est négatif (aucun avertissement) |
| t05 | gpt-5-mini | Marche à suivre Excel 2016 : B4 rouge si négatif, B2 vert si >= E2 | Accueil, groupe Styles, Mise en forme conditionnelle, Nouvelle règle, Utiliser une formule…, `=B4<0` ; `=B2>=$E$2`, Format, Remplissage | Noms de menus conformes à l'aide Microsoft fr-fr. Pas testé dans Excel lui-même |
| t06 | gpt-5-mini | « -440 % est-il correct ? » (B4=34000, C4=-10000) | « Mathématiquement Excel a raison », puis `=(B4-C4)/ABS(C4)` | Correct |

## Cas tableur (LibreOffice Calc)

| Cas | Formule | Valeur réelle |
|---|---|---|
| c5-tableau-de-bord (script `outils/c5-tableau-de-bord.py`) | B2 `=SOMME.SI(Ventes!$A$2:$A$40;B$1;Ventes!$C$2:$C$40)` | 130 000 (C2 : 85 000) |
| idem | B3 `=SOMME.SI(Dépenses!…)` | 96 000 (C3 : 95 000) |
| idem | B4 `=B2-B3` | 34 000 (C4 : -10 000) |
| idem | B5, B6, B7 `=SI(B$2=0;0;SOMME.SI.ENS(…)/B$2)`, format 0,0 % | 35,4 % ; 33,8 % ; 30,8 % (Septembre : 42,4 % ; 28,2 % ; 29,4 %) |
| idem | D2 `=SIERREUR((B2-C2)/C2;"")` | 52,9 % |
| idem | D4 `=SIERREUR((B4-C4)/ABS(C4);"")` | 440,0 % |
| c5-pct-double | `=B3/B2*100` avec format Pourcentage ; `=B4/B2` | 3 538,5 % ; 35,4 % |
| c5-div0 | `=(B2-C2)/C2` avec C2 vide | #DIV/0 ! |
| c5-div0 | `=SI(OU(ESTVIDE(C3);C3=0);"";(B3-C3)/C3)` | case vide |
| c5-div0 | `=SIERREUR((B4-C4)/C4;"")` | case vide |
| c5-evol-negatif | `=(B2-C2)/C2` avec 34000 et -10000 | -440 % |
| c5-evol-negatif | `=(B3-C3)/ABS(C3)` | +440 % |

Attendus calculés à la main : 130 000 - 96 000 = 34 000 ; 46 000 / 130 000 = 35,38 % ; (130 000 - 85 000) / 85 000 = 52,94 %. Le script rend un code de sortie nul si tout concorde (c'est le cas).

## Mise en forme conditionnelle (script Python-UNO)

- Règle 1 : B4:C4, ConditionOperator LESS, Formula1 « 0 », style rouge (fond F8C9C9, texte 9B1C1C). Septembre (-10 000) prend la couleur, Octobre (34 000) non.
- Règle 2 : B2:C2, GREATER_EQUAL, Formula1 « $E$2 », style vert (fond CDEBD3). Octobre (130 000 >= 120 000) vert, Septembre (85 000) non.
- Capture réelle : `sortie/c5-tableau-de-bord/capture.png` (couleurs visibles).
- Relecture du .xlsx enregistré avec openpyxl : deux règles `cellIs` (lessThan 0 ; greaterThanOrEqual $E$2) avec leur remplissage. Elles sont donc bien enregistrées dans le fichier. Non vérifié : l'ouverture dans Excel 2016.
- Différence avec l'IA : elle propose une règle « avec une formule » (`=B4<0`) ; nous avons testé le type « valeur de la cellule », équivalent ici.
- Fichier modèle bonus : `sortie/c5-tableau-de-bord/c5-tableau-de-bord.xlsx` (3 feuilles : Ventes, Dépenses, Tableau de bord).

## Sources ouvertes (WebFetch, 10/10/2026)

- support.microsoft.com/fr-fr, « Appliquer la mise en forme conditionnelle pour faire ressortir des informations dans Excel » : onglet Accueil, groupe Styles, « Mise en forme conditionnelle », « Nouvelle règle », « Utiliser une formule pour déterminer pour quelles cellules le format sera appliqué », bouton « Format » (boîte « Format de cellule »), « Gérer les règles ». Liste « S'applique à » : Excel 2016 y figure. Seuls les 100 000 premiers caractères de la page ont été lus.
- support.microsoft.com/fr-fr/excel/how-to-correct-a-div-0-error, « Comment corriger un #DIV/0 ! erreur » : cause (division par zéro ou cellule vide), solution SIERREUR (`=SIERREUR(A2/A3;0)`), avertissement que SIERREUR masque toutes les erreurs ; Excel 2016 dans « S'applique à ».
- Pages Mac « Utiliser une formule pour appliquer une mise en forme conditionnelle dans Excel pour Mac » : lue, non utilisée dans le livre.
- Première URL tentée (fe2d9d6f…) : 404.
