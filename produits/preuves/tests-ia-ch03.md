# Tests réels du chapitre 3 « Nettoyer une liste en 10 minutes »

ChatGPT via treg (DataForSEO, endpoint llm-responses-live), le 10/10/2026. 13 appels sur 25 autorisés. Tableur : LibreOffice Calc 24.2 en français (`tableur.py`), cas `c3-*` générés par `produits/preuves/outils/c3-gen.py`. Les attendus viennent d'un modèle Python indépendant (nettoyage des noms et des numéros), pas du tableur. Pour les formules fausses de l'IA, l'attendu est la valeur observée, relue à la main.

Liste de test : 15 clients (colonnes A prénom+nom sale, B téléphone), voir le chapitre. Doublons attendus après nettoyage : lignes 5, 8, 15.

## Appels à ChatGPT

| n° | Date | Modèle | Prompt (résumé) | Formule reçue | Verdict |
|---|---|---|---|---|---|
| t01 | 10/10/2026 | gpt-5-mini | Réglage Excel 2016 + nom propre sans espace en trop (A2 vers C2) | `=NOMPROPRE(SUPPRESPACE(MINUSCULE(A2)))` | Juste sur 15 lignes (`c3-noms`) |
| t02 | 10/10/2026 | gpt-4o-mini | Même prompt que t01 | `=PROPER(SUPPRESPACE(A2))` (+ explication) | Faux : PROPER, nom anglais, #NOM? sur 15 lignes (`c3-noms-proper`) |
| t03 | 10/10/2026 | gpt-5-mini | Téléphones mixtes en B vers +237 collé en D, une seule formule | `="+237"&DROITE(SUBSTITUE(…(B2;" ";"");"-";"");"(";"";")";"");"+";"");9)` | Faux : 5 paramètres dans un SUBSTITUE, Err:504 sur 15 lignes (`c3-tel-gpt5`) |
| t04 | 10/10/2026 | gpt-4o-mini | Même prompt que t03 | `=SI(GAUCHE(B2; 4) = "+237"; SUBSTITUE(B2; " "; ""); SI(GAUCHE(B2; 5) = "00237"; SUBSTITUE(DROITE(B2; NBCAR(B2) - 5); " "; ""); SUBSTITUE(DROITE(B2; NBCAR(B2) - 1); " "; "")))` | Faux presque partout : juste seulement pour +237…, retire le 6 de « 6 77 12 34 56 », accepte +33 sans alerte (`c3-tel-gpt4o`) |
| t05 | 10/10/2026 | gpt-5-mini | Marquer « Doublon » si le nom est déjà apparu plus haut (C vers E) | `=SI(NB.SI($C$2:C2;C2)>1;"Doublon";"")` | Juste : doublons en 5, 8, 15 (`c3-doublons`) |
| t06 | 10/10/2026 | gpt-4o-mini | Même prompt que t05 | même formule | Juste |
| t07 | 10/10/2026 | gpt-5-mini | Deux formules : prénom en F, nom (après le 1er espace) en G | `=SIERREUR(GAUCHE(C2;TROUVE(" ";C2)-1);C2)` et `=SIERREUR(DROITE(C2;NBCAR(C2)-TROUVE(" ";C2));"")` | Juste sur 15 lignes (`c3-separer`) ; « Pauline Ngo Bassa » donne nom « Ngo Bassa » |
| t08 | 10/10/2026 | gpt-4o-mini | Même prompt que t07 | `=GAUCHE(C2;CHERCHE(" ";C2)-1)` et `=DROITE(C2;NBCAR(C2)-CHERCHE(" ";C2))` | Juste sur 15 lignes (`c3-separer-4o`), sans SIERREUR |
| t09 | 10/10/2026 | gpt-5-mini | Une seule formule, 7 exemples dont +33 et 8 chiffres, « À vérifier » sinon | Réponse coupée à 2500 tokens (formule imbriquée interminable, avec SUBSTITUTE anglais) | Inutilisable, non retenue |
| t10 | 10/10/2026 | gpt-4o-mini | Même prompt que t09 | `=SI(ET(GAUCHE(SUPPRESPACE(B2); 4) = "+237"; ESTNUM(VALUE(DROITE(SUPPRESPACE(B2); 9))); GAUCHE(DROITE(SUPPRESPACE(B2); 9); 1) = "6"); "+237" & DROITE(SUPPRESPACE(B2); 9); "À vérifier")` | Non testée dans le tableur : VALUE est anglais, et elle exige « +237 » au début (rejette « 6 77 12 34 56 » et « 00237… »). Non retenue dans le chapitre |
| t11 | 10/10/2026 | gpt-5-mini | Deux formules : C2 chiffres seuls, D2 à partir de C2 | C2 : `=CONCAT(SI(ESTNUM(VALEUR(MID(B2;LIGNE(INDIRECT("1:"&NBCAR(B2)));1)));MID(…);""))` (matricielle, MID anglais) ; D2 : longue formule SI/ET/NBCAR | C2 : cellule vide dans le tableur (`c3-tel-mid`), non gardée. D2 : juste sur 15 lignes avec nos chiffres (`c3-tel`) |
| t12 | 10/10/2026 | gpt-4o-mini | Même prompt que t11 | C2 : `=TEXTJOIN("");(SIERREUR(…VALUE…));""))` ; D2 : `=SI(GAUCHE(C2;2)="00";DROITE(C2;9);SI(GAUCHE(C2;3)="237";DROITE(C2;9);SI(GAUCHE(C2;1)="6";"+237"&C2; "À vérifier")))` | C2 : Err:508 (`c3-tel-4o-c2`). D2 : faux pour 237…/00… (pas de +237) et pour 8 chiffres (`c3-tel-d4`) |
| t13 | 10/10/2026 | gpt-5-mini | C2 seule, SUBSTITUE imposé, sans matricielle | `=SUBSTITUE(SUBSTITUE(SUBSTITUE(SUBSTITUE(SUBSTITUE(SUBSTITUE(SI(ESTNUM(B2);TEXTE(B2;"0");B2);" ";"");"+";"");"-";"");".";"");"(";"");")";"")` | Juste sur 15 lignes (`c3-tel`) |

## Cas tableur

| Cas | Formule | Valeur réelle |
|---|---|---|
| c3-noms | `=NOMPROPRE(SUPPRESPACE(MINUSCULE(A2)))` (C2:C16) | 15/15 conformes : « Aminatou Njoya », « Marie-Claire Ewane », « Pauline Ngo Bassa »… |
| c3-noms-sans-minuscule | `=NOMPROPRE(SUPPRESPACE(A2))` | 15/15 identiques (MINUSCULE superflu, comme l'écrit l'aide Microsoft) |
| c3-noms-proper | `=PROPER(SUPPRESPACE(A2))` | #NOM ? sur 15 lignes |
| c3-tel-gpt5 | t03 | Err :504 sur 15 lignes |
| c3-tel-gpt4o | t04 | 77123456, 99887766, +237699112233, +237677123456, 655443322, 33612345678, 99887766, 7712345, 237)691-234-567, 37670556677, +237699001122, 94121212, 22334455, 99112233, 51203040 : seules les lignes 4, 5 et 12 sont justes |
| c3-tel-mid | C2 de t11 | cellule vide sur 15 lignes |
| c3-tel-4o-c2 | C2 de t12 | Err:508 sur 15 lignes |
| c3-tel | C2 de t13 + D2 de t11 | C : chiffres seuls, 15/15. D : +237677123456, +237699887766, +237699112233, +237677123456, +237655443322, À vérifier (+33), +237699887766, À vérifier (8 chiffres), +237691234567, +237670556677, +237699001122, +237694121212, À vérifier (fixe 222…), +237699112233, +237651203040 |
| c3-tel-d4 | C2 de t13 + D2 de t12 | 699112233 (ligne 4), 677123456 (5), 655443322 (6), 691234567, 670556677, 699001122 sans +237 ; +23767712345 (ligne 9, 8 chiffres) ; les autres justes |
| c3-doublons | `=SI(NB.SI($C$2:C2;C2)>1;"Doublon";"")` (E2:E16) | « Doublon » en E5, E8, E15 seulement |
| c3-doublons-brut | même formule sur la colonne A brute | « Doublon » en B8 et B15 seulement : Aminatou (ligne 5) manquée à cause des espaces de la ligne 2 ; Boris et Carine repérés malgré la casse |
| c3-separer | t07 (F2:F16, G2:G16) | 15/15 conformes ; G9 = « Ngo Bassa » ; F11 = « Marie-Claire » |
| c3-separer-4o | t08 | mêmes valeurs que c3-separer |
| c3-separer-ms | `=GAUCHE(C2;CHERCHE(" ";C2;1))` (formule de la page Microsoft, avec « ; ») et `=NBCAR(F2)` | F2 = « Aminatou␣ » (espace gardée), NBCAR = 9 au lieu de 8 |
| c3-separer-ngo | comme c3-separer, capture lignes 8 à 11 | capture non utilisée dans le livre (allègement) |

## Sources ouvertes (WebFetch)

- Communication de l'ART (Cameroun, 6 octobre 2014) publiée par l'UIT, https://www.itu.int/dms_pub/itu-t/oth/02/02/T02020000240001PDFF.pdf (texte extrait du PDF avec pdftotext) : plan fermé à 9 chiffres, indicatif +237, S = 6 pour le mobile, S = 2 pour le fixe, passage de 8 à 9 chiffres le 21 novembre 2014.
- Wikipédia en anglais, « Telephone numbers in Cameroon » : 9 chiffres, mobile « 6 XX XX XX XX », indicatif +237, accès international 00, pas de préfixe national.
- Microsoft, « Rechercher et supprimer des doublons » (support.microsoft.com/fr-fr/office/rechercher-et-supprimer-des-doublons-00e35bea-b46a-4d5d-b28e-66a552dc138d) : onglet Données > Supprimer les doublons, colonnes à cocher, suppression définitive, copie conseillée, retirer plans et sous-totaux, mise en forme conditionnelle. La page ne dit pas quelle occurrence est conservée ni si la comparaison tient compte de la casse.
- Microsoft, « Fractionner du texte en plusieurs colonnes à l'aide de l'Assistant Conversion » : Délimité, délimiteurs, destination.
- Microsoft, « Fractionner du texte en plusieurs colonnes en utilisant des fonctions » : formules GAUCHE/CHERCHE/DROITE/NBCAR (la page écrit les formules avec des virgules).
- Microsoft, « Utilisation du remplissage instantané dans Excel » : détection d'un modèle, Ctrl+E, séparer prénoms et noms, option à activer.
- Microsoft, page NOMPROPRE : première lettre de chaque mot et lettre suivant un caractère non alphabétique en majuscule, autres lettres en minuscules.

## Ce qui n'a pas été testé

- Le bouton « Supprimer les doublons », l'Assistant Conversion et le remplissage instantané : décrits d'après Microsoft seulement (LibreOffice n'a pas les mêmes commandes). Le chapitre le dit.
- Excel lui-même : tout est testé dans LibreOffice. Err:504 et Err:508 sont des codes LibreOffice.
- Le plan de numérotation date de 2014 : à revérifier si l'ART le modifie.
