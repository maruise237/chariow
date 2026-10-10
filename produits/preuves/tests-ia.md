# Tests réels des prompts (ChatGPT via l'API, appel treg → DataForSEO)

Chaque prompt du livre est testé ici avant d'être publié. On garde la réponse brute, le modèle, la date et le verdict après vérification dans un vrai tableur (`tableur.py`).

| # | Date | Modèle | Prompt (résumé) | Formule reçue | Verdict |
|---|---|---|---|---|---|
| T1 | 10/10/2026 | gpt-4o-mini | FR : total des ventes de Savon (B produits, D totaux, lignes 2 à 5) | `=SOMME.SI(B2:B5; "Savon"; D2:D5)` | Juste, en français, avec « ; » |
| T2 | 10/10/2026 | gpt-5-mini | Même prompt que T1 | `=SOMME.SI(B2:B5;"Savon";D2:D5)` | Juste |
| T3 | 10/10/2026 | gpt-4o-mini | FR : prix depuis la feuille Tarifs (code en A2) | `=RECHERCHEV(A2; Tarifs!A:B; 2; FAUX)` | Juste |
| T4 | 10/10/2026 | gpt-5-mini | Même prompt que T3 | 3 options, dont `=XLOOKUP(A2;Tarifs!A:A;Tarifs!B:B;"Non trouvé")` | **Piège** : nom anglais XLOOKUP dans une formule française → à vérifier (#NOM?) |
| T5 | 10/10/2026 | gpt-4o-mini | EN : if D2 > 50000 and C2 = Grossiste… | `=IF(AND(D2 > 50000, C2 = "Grossiste"), "Remise 10%", "")` | Anglais + virgules : ne marche pas tel quel dans Excel en français |
| T6 | 10/10/2026 | gpt-4o-mini | FR : même demande que T5 | `=SI(ET(D2>50000; C2="Grossiste"); "Remise 10%"; "")` | Juste |
| T7 | 10/10/2026 | gpt-4o-mini | FR, très court : compter « Payé » dans la colonne E | `=NB.SI(E:E; "Payé")` + « respect des majuscules/minuscules » | Formule juste ; **affirmation à vérifier** (NB.SI ne distingue pas les majuscules d'après la doc Microsoft) |
| T8 | 10/10/2026 | gpt-5-mini | **Réglage** (« Excel en français, noms français, « ; », une seule formule ») + Tarifs/Facture + « Code inconnu » | `=RECHERCHEX(A2;Tarifs!A:A;Tarifs!B:B;"Code inconnu")` | Une seule formule, tout en français |
| T9 | 10/10/2026 | gpt-5-mini | Sans réglage, même besoin que T8 | 3 options en français : RECHERCHEX(…;"Code introuvable";0), SIERREUR(RECHERCHEV…), INDEX/EQUIV | Juste cette fois : le nom anglais de T4 n'est pas systématique |
| T10 | 10/10/2026 | gpt-4o-mini | Réglage, comme T8 | `=SIERREUR(RECHERCHEV(A2;Tarifs!A:B;2;FAUX);"Code inconnu")` | Juste |
| T11 | 10/10/2026 | gpt-5-mini | Réglage avec la version : « Excel 2016 en français » + même besoin que T8 | `=SIERREUR(RECHERCHEV(A2;Tarifs!A:B;2;FAUX);"Code inconnu")` | Juste ; vérifiée dans le tableur (cas `recherchev-sierreur` : 7 500 et « Code inconnu ») |
| T12 | 10/10/2026 | gpt-5-mini | Réglage « Excel 2016 » + total des ventes de Savon faites par Awa (A vendeur, B produit, C total, lignes 2 à 5) — prompt 2.2 | `=SOMME.SI.ENS(C2:C5; A2:A5; "Awa"; B2:B5; "Savon")` | Juste : 15 000 (cas `somme-si-ens`) |
| T13 | 10/10/2026 | gpt-4o-mini | Même prompt que T12 | `=SOMME.SI(A2:A5; "Awa"; C2:C5) * SOMME.SI(B2:B5; "Savon"; C2:C5)` | **Faux, sans message d'erreur** : multiplie deux totaux, 427 500 000 au lieu de 15 000 (cas `somme-si-ens-produit`) |
| T14 | 10/10/2026 | gpt-5-mini | Réglage + plus grosse vente et moyenne (A jour, B ventes, lignes 2 à 5) — prompt 2.3 | `=MAX(B2:B5)` et `=MOYENNE(B2:B5)` | Juste : 21 000 et 14 125 (cas `max-moyenne`) |
| T15 | 10/10/2026 | gpt-4o-mini | Même prompt que T14 | `=MAX(B2:B5)` et `=MOYENNE(B2:B5)` | Juste, identique à T14 |
| T16 | 10/10/2026 | gpt-5-mini | Réglage + jours de retard par rapport à aujourd'hui, 0 si pas en retard (A facture, B échéance) — prompt 2.4 | `=MAX(0;AUJOURDHUI()-B2)` | Juste : 12, 5, 0, 0 le 10/10/2026 (cas `jours-retard`) |
| T17 | 10/10/2026 | gpt-4o-mini | Même prompt que T16 | `=MAX(0; AUJOURD'HUI() - B2)` | **Faux** : apostrophe dans le nom de la fonction, Err:508 dans LibreOffice (cas `jours-retard-apostrophe`) |
| T18 | 10/10/2026 | gpt-5-mini | Réglage + prix TTC arrondi au franc, TVA du Cameroun (19,25 %) donnée (B prix HT) — prompt 2.5 | `=ARRONDI(B2*1,1925;0)` | Juste : 2 981 / 8 944 / 16 099 (cas `tva-arrondi`) |
| T19 | 10/10/2026 | gpt-4o-mini | Même prompt que T18 | `=ARRONDI(B1 * (1 + 19,25%) ; 0)` | Calcul juste mais **cellule B1** (le titre) : avec B2, 2 981 ; avec B1, #VALEUR! |
| T20 | 10/10/2026 | gpt-5-mini | Comme T18, **sans donner le taux** (« la TVA du Cameroun ») | `=ARRONDI(B2*(1+0,1925);0)` | Juste : 2 981 pour 2 500 F ; l'IA connaît 19,25 % |
| T21 | 10/10/2026 | gpt-5-mini | Réglage + nom complet : prénom (A), une espace, nom (B) — prompt 2.6 | `=CONCATENER(A2;" ";B2)` | Juste : « Aminatou Njoya » (cas `nom-complet`) |
| T22 | 10/10/2026 | gpt-4o-mini | Même prompt que T21 | `=CONCATENER(A1; " "; B1)` | Juste (à adapter à la ligne) |
| T23 | 10/10/2026 | gpt-5-mini | « Ma formule =RECHERCHEV(A2;Tarifs!A:B;2;FAUX) donne #N/A alors que le code P03 existe… Pourquoi ? 6 lignes max » — prompt 2.7, essai 1 | `=RECHERCHEV(TRIM(SUBSTITUE(A2;CAR(160);""));Tarifs!A:B;2;FAUX)` | **Faux** : TRIM (nom anglais) dans une formule française, Err:511 (cas `recherchev-na`, cellule E2) |
| T24 | 10/10/2026 | gpt-5-mini | Même message que T23, essai 2 | `=RECHERCHEV(SUPPRESPACE(A2);Tarifs!A:B;2;FAUX)` puis, si ça persiste, `=RECHERCHEV(SUBSTITUE(A2;CAR(160);"");…)` | 1re correction juste : 7 500 (cas `recherchev-na-corrige`). 2e (CAR(160)) non vérifiable dans LibreOffice |
| T25 | 10/10/2026 | gpt-5-mini | Même message que T23, essai 3 | `=RECHERCHEV(SUPPRESPACE(SUBSTITUE(A2;CAR(160);""));Tarifs!A:B;2;FAUX)` + test `=NB.SI(Tarifs!A:A;A2)` | Juste pour l'espace de fin (SUPPRESPACE) |
| T26 | 10/10/2026 | gpt-4o-mini | Même message que T23 (6 lignes max) | `=SUPPRESPACE(A2)` seul + « vérifiez la valeur exactement identique (majuscules/minuscules) » | Morceau, pas une formule complète ; **affirmation fausse** : RECHERCHEV trouve « p03 » (7 500) |
| T27 | 10/10/2026 | gpt-4o-mini | Même message que T23, sans limite de lignes | Liste de 5 pistes, `=SUPPRESPACE(A2)`, `=TEXTE(A2; "0")`, `=INDEX(Tarifs!B:B;EQUIV(A2;Tarifs!A:A;0))` | Dit juste cette fois : « RECHERCHEV ne soit pas sensible à la casse » ; pistes sans formule complète |

## Ce que ces tests changent

- L'idée « les formules de ChatGPT ne marchent pas en français » est **trop forte**. Quand on pose la question en français, la formule revient en français avec « ; » (T1, T2, T3, T6, T7).
- Les vrais pièges observés :
  - la question posée en anglais, ou copiée depuis un tutoriel anglais (T5) ;
  - un nom anglais glissé dans une réponse française (T4) ;
  - une explication fausse à côté d'une formule juste (T7).
- Le mécanisme du livre devient : **dire à l'IA sa version et ses colonnes, puis vérifier dans le tableur en 30 secondes.**
- Le réglage (T8, T10) donne une réponse plus courte : une seule formule, prête à coller. Sans réglage, l'IA propose souvent 2 ou 3 versions, et le débutant ne sait pas laquelle prendre (T4, T9).
- Donner la **version** compte : RECHERCHEX « n'est pas disponible dans Excel 2016 et Excel 2019 » (Microsoft, page RECHERCHEX en français). Avec « Excel 2016 » dans le réglage, gpt-5-mini passe de RECHERCHEX (T8) à RECHERCHEV (T11).

## Vérifications dans le tableur (`tableur.py`, LibreOffice Calc 24.2 en français)

| Cas | Formule | Résultat réel |
|---|---|---|
| somme-si | `=SOMME.SI(B2:B5;"Savon";D2:D5)` | 16 000 |
| somme-si-virgules | `=SOMME.SI(B2:B5,"Savon",D2:D5)` | Err:501 (caractère non valide) |
| si-et | `=SI(ET(C2>50000; B2="Grossiste"); "Remise 10%"; "")` | « Remise 10% » pour Awa, vide pour Boris et Carine |
| si-anglais | `=IF(AND(C2 > 50000, B2 = "Grossiste"), "Remise 10%", "")` | Err:509 |
| recherchev-sierreur | `=SIERREUR(RECHERCHEV(A2;Tarifs!A:B;2;FAUX);"Code inconnu")` | 7 500 (P03), « Code inconnu » (P09) |
| xlookup | `=XLOOKUP(…)` | #NOM ? |
| nb-si-casse | `=NB.SI(E2:E6;"Payé")` sur Payé, payé, PAYÉ, Impayé, Payé | 4 : NB.SI ignore les majuscules (confirmé par Microsoft : « NB.SI ignore la casse inférieure et supérieure ») |
| somme-si-ens | `=SOMME.SI.ENS(C2:C5; A2:A5; "Awa"; B2:B5; "Savon")` | 15 000 |
| somme-si-ens-produit | `=SOMME.SI(A2:A5; "Awa"; C2:C5) * SOMME.SI(B2:B5; "Savon"; C2:C5)` | 427 500 000 (22 500 × 19 000), aucune erreur affichée |
| max-moyenne | `=MAX(B2:B5)` / `=MOYENNE(B2:B5)` | 21 000 / 14 125 |
| jours-retard | `=MAX(0;AUJOURDHUI()-B2)` (lignes 2 à 5) | 12, 5, 0, 0 le 10/10/2026 (dépend de la date du jour : à relancer avec d'autres attendus un autre jour) |
| jours-retard-apostrophe | `=MAX(0; AUJOURD'HUI() - B2)` | Err:508 |
| tva-arrondi | `=ARRONDI(B2*1,1925;0)` ; `=B2*1,1925` ; `=ARRONDI(B2 * (1 + 19,25%) ; 0)` ; `=ARRONDI(B2*(1+0,1925);0)` ; `=ARRONDI(B1 * (1 + 19,25%) ; 0)` | 2 981 / 8 944 / 16 099 ; 2 981,25 / 8 943,75 / 16 098,75 ; 2 981 ; 2 981 ; #VALEUR ! |
| nom-complet | `=CONCATENER(A2;" ";B2)` ; `=A2&" "&B2` ; `=CONCAT(A2;" ";B2)` | « Aminatou Njoya » pour les trois (CONCAT existe dans LibreOffice : ce n'est pas une preuve pour Excel 2016) |
| recherchev-na | `=RECHERCHEV(A2;Tarifs!A:B;2;FAUX)` avec A2 = « P03␣ » (espace de fin) | #N/D (LibreOffice ; #N/A dans Excel) ; P01 : 500 ; « p03 » : 7 500 (casse ignorée) ; `=NBCAR(A2)` : 4 ; `TRIM(…)` : Err:511 ; `SUPPRESPACE(A5)` sur « P03 » + espace insécable : #N/D ; `SUBSTITUE(A5;CAR(160);"")` : #N/D (CAR(160) ≠ espace insécable dans LibreOffice) ; `SUBSTITUE(A5;UNICAR(160);"")` : 7 500 |
| recherchev-na-corrige | `=RECHERCHEV(SUPPRESPACE(A2);Tarifs!A:B;2;FAUX)` | 7 500 |

Limite : LibreOffice 24.2 ne connaît pas RECHERCHEX. Pour cette fonction, on s'appuie sur la documentation Microsoft, pas sur une capture.

## Sources ouvertes (10/10/2026)

- Microsoft, pages ouvertes avec WebFetch : SOMME.SI.ENS (somme_plage en premier), CONCAT (« disponible […] si vous avez Office 2019, ou […] un abonnement Office 365 »), CONCATENER (reste disponible pour la compatibilité ; & recommandé), AUJOURDHUI (numéro de série de la date ; format Standard ou Nombre), ARRONDI (0 = entier le plus proche), SUPPRESPACE (ne supprime pas l'espace insécable, code 160), RECHERCHEV (#N/A : espace de fin, caractères non imprimables ; SUPPRESPACE ou EPURAGE).
- TVA Cameroun 19,25 % : PwC Worldwide Tax Summaries, page Cameroon / Corporate / Other taxes (« The total VAT in Cameroon is 19.25%. », dernière revue le 14 août 2026) ; lefisk.cm/fiscalite/tva (17,5 % + 10 % de centimes additionnels, soit 19,25 %). Le site impots.cm (DGI) ne mentionne pas le taux sur sa page d'accueil. Aucune de ces sources n'est un texte de loi : le taux est à confirmer dans le Code général des impôts.
- Non trouvée : une page support.microsoft.com sur #N/A (l'URL essayée donne 404). Le livre s'appuie sur la page RECHERCHEV.
