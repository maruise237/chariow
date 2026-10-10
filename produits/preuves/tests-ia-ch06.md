# Tests réels du chapitre 06 « Automatiser sans coder »

Date des appels : 10/10/2026. ChatGPT via treg (DataForSEO), 5 appels sur 25 autorisés. Code des macros archivé dans `produits/preuves/outils/c6-vba/`. Script de test : `produits/preuves/outils/c6-macro.py` (LibreOffice Calc 24.2 en français, Python-UNO, bibliothèque Basic du document, module précédé de `Option VBASupport 1`, exécution par le moteur de scripts, vérification cellule par cellule).

## Tests IA

| n° | Date | Modèle | Prompt (résumé) | Réponse reçue | Verdict |
|---|---|---|---|---|---|
| c6-T01 | 10/10/2026 | gpt-5-mini | Excel 2016 FR, macro VBA : feuille Ventes (A client, B produit, C montant), trier décroissant sur C, gras si > 50 000 | Macro de 45 lignes (`c6-vba/t01-gpt5mini.bas`) : dernière ligne sur A/B/C, `Sort Key1:=C2, xlDescending, Header:=xlYes`, boucle avec `Bold = True` puis `Bold = False` sinon, gestion d'erreur avec MsgBox. Mode d'emploi : Alt+F11, module, F5 « ou via Excel > Macros », feuille nommée exactement « Ventes » | **Juste dans LibreOffice** (ordre, clients, gras corrects ; relance après modification : gras retiré). Mode d'emploi un peu flou (« Excel > Macros ») |
| c6-T02 | 10/10/2026 | gpt-4o-mini | Même prompt que T01 | Macro de 15 lignes (`c6-vba/t02-gpt4omini.bas`) : même tri, boucle qui met `Bold = True` si > 50 000, jamais de retrait | **Juste au 1er lancement** (ordre, clients, gras corrects). **Piège** : au 2e lancement après avoir baissé un montant, le gras périmé reste (5 000 en gras) |
| c6-T03 | 10/10/2026 | gpt-5-mini | Google Sheets FR, script Apps Script, même besoin | Fonction `trierEtFormatterVentes()` de 29 lignes : `getSheetByName`, `getLastRow`, `getRange(2,1,lastRow-1,3).sort({column:3, ascending:false})`, boucle `setFontWeight('bold'/'normal')`. Mode d'emploi : Extensions > Apps Script, exécuter, autoriser, déclencheur optionnel | **Non exécuté** (pas de compte Sheets de test). Méthodes vérifiées dans la doc Google (voir sources) |
| c6-T04 | 10/10/2026 | gpt-5-mini | « Explique cette macro Excel ligne par ligne, pour un débutant… Dis aussi si elle peut supprimer ou envoyer quelque chose » + macro T02 (boucle raccourcie à C2:C8 pour tenir en 500 caractères) | Explication numérotée des 9 lignes + « Supprimer : Non… Envoyer : Non… » + précautions (tri réordonne, plage C2:C8 figée, feuille absente = erreur, « annulez (Ctrl+Z) après exécution si nécessaire ») | Juste sur le code. **Affirmation à ne pas croire** : Ctrl+Z après macro (Microsoft : certaines instructions VBA effacent la pile d'annulation) |
| c6-T05 | 10/10/2026 | gpt-5-mini | « Un inconnu m'a envoyé un fichier Excel bonus avec cette macro… 5 lignes max » + macro piégée (`Auto_Open` : `Kill` de C:\Users\Public\Documents\*.xlsx, `Shell` ouvrant https://exemple.test/bonus) | Dit que la macro supprime les .xlsx et ouvre une URL, « C'est dangereux… Ne la lancez pas », conseils (supprimer, antivirus, isoler) | Juste sur le fond. **Détail faux** : l'URL citée est `https://exemple.test`, le `/bonus` est perdu |

## Cas tableur / macro (LibreOffice)

Classeur de test : 7 ventes en désordre dans « Ventes » (Carine 50 000, Franck 9 500, Aminatou 120 000, Djibril 32 500, Boris 75 000, Estelle 51 000, Awa 18 000). Attendu après macro : 120 000, 75 000, 51 000, 50 000, 32 500, 18 000, 9 500 ; clients Aminatou, Boris, Estelle, Carine, Djibril, Awa, Franck ; gras seulement sur les 3 premiers (50 000 pile : pas de gras).

| Cas (dossier `sortie/…`) | Macro | Résultat réel |
|---|---|---|
| `c6-macro-t01-gpt5mini` | T01 | Exécutée sans erreur. Montants dans l'ordre attendu, clients restés avec leur vente, gras sur 120 000 / 75 000 / 51 000 seulement. Rejeu après avoir mis 5 000 à la place de 120 000 : gras uniquement sur 75 000 et 51 000 (aucun gras périmé) |
| `c6-macro-t02-gpt4omini` | T02 | Exécutée sans erreur, même résultat au 1er lancement. Rejeu : 75 000, 51 000, 50 000, 32 500, 18 000, 9 500, 5 000 ; gras sur 75 000, 51 000 **et 5 000** (gras périmé) |
| `c6-macro-t02-gpt4omini-sans-option` | T02 sans `Option VBASupport 1` (contrôle) | Non exécutée : l'appel reste bloqué (boîte d'erreur de compilation Basic) après 40 s. Montre que le mode compatibilité est nécessaire dans LibreOffice, sans rien dire de la validité du code dans Excel |

Captures : `avant.png`, `apres.png`, `rejeu.png` dans chaque dossier ; `resultat.json` détaille chaque valeur.

## Limites assumées

- LibreOffice n'est pas Excel : le test valide la logique, pas l'exécution dans Excel 2016. Chaque objet VBA utilisé a été relu contre Microsoft Learn (fr-fr) : `Range.Sort` (Key1, Order1, Header ; `xlNo` par défaut), `Range.End(xlUp)`, `Font.Bold`, `Workbook.Sheets`. `ThisWorkbook`, `Application.ScreenUpdating/EnableEvents`, `IsNumeric` et la gestion d'erreur de T01 : non ouverts dans la doc, non affirmés dans le livre ; ils ont tourné dans LibreOffice.
- Apps Script : jamais exécuté. `getUi().alert` : la doc ouverte décrit `getUi()` (menus, boîtes de dialogue) mais pas `alert` ; non affirmé dans le livre. Déclencheur « Sur modification » : non vérifié.
- Étapes Excel 2016 : issues des pages Microsoft fr-fr (générales, pas propres à 2016), non rejouées dans un Excel réel.

## Sources ouvertes (WebFetch / curl)

Microsoft support fr-fr :
- « Démarrage rapide : créer une macro » (onglet Développeur masqué par défaut ; Macros > Modifier ouvre Visual Basic Editor ; ne cite ni Alt+F11, ni .xlsm).
- « Afficher l'onglet Développeur » (Fichier > Options > Personnaliser le ruban, case Développeur).
- « Raccourcis clavier dans Excel » (Alt+F11 ouvre l'éditeur VBA ; Alt+F8 affiche la boîte Macro).
- « Créer des fonctions personnalisées dans Excel » (Alt+F11 puis Insérer > un module).
- « Exécuter une macro dans Excel » (Développeur > Macros > Exécuter ; classeur prenant en charge les macros .xlsm).
- « Enregistrement de xls dans xlsx xlsm » (type « Classeur Excel Macro-Enabled (*.xlsm) », rouvrir pour vérifier). Le tableau des formats est une image : non lu.
- « Activer ou désactiver les macros dans les fichiers Office » (avertissement de sécurité ; « N'activez jamais les macros… » ; « Désactiver toutes les macros avec notification » ; Fichier > Options > Centre de gestion de la confidentialité).
- « Une macro potentiellement dangereuse a été bloquée » (macros utilisées par des personnes mal intentionnées ; source non fiable ; case Débloquer).
- Page « Créer ou exécuter une macro » (c6b99036) ouverte : c'est une page Word, écartée. Page « Les macros de sources externes sont bloquées par défaut » : 404, non citée.

Microsoft Learn fr-fr : `Range.Sort`, `Range.End`, `Font.Bold`, `Workbook.Sheets`, « Impact de l'enregistrement automatique (AutoSave) sur les compléments et les macros » (la pile d'annulation est effacée par certaines instructions VBA, exemple `ActiveCell.Value`).

Google (developers.google.com/apps-script, hl=fr) : guide Sheets (Extensions > Apps Script), reference Spreadsheet (`getSheetByName` renvoie `Sheet|null`), Sheet (`getLastRow`, `getRange`), Range (`sort`, `setFontWeight`, `getValues`, lus par curl), SpreadsheetApp (`getActiveSpreadsheet`, `getUi`), autorisation (boîte de dialogue d'autorisation), macros Sheets (Extensions > Macros).
