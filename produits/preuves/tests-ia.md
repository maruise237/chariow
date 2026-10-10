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

Limite : LibreOffice 24.2 ne connaît pas RECHERCHEX. Pour cette fonction, on s'appuie sur la documentation Microsoft, pas sur une capture.
