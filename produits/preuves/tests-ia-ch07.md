# Tests réels, chapitre 7 (5 projets en FCFA + conclusion)

ChatGPT via treg (DataForSEO, web_search désactivé), 10 octobre 2026. 10 appels sur 25 de budget. Tableur : LibreOffice Calc 24.2 en français (`tableur.py`).

## Appels à ChatGPT

| n° | Date | Modèle | Prompt (résumé) | Réponse reçue | Verdict |
|---|---|---|---|---|---|
| kam-c7-t01 | 10/10/2026 | gpt-5-mini | Stock : Mouvements (date, produit, type, quantité) + Stock (seuil, entrées, sorties, reste, alerte), formules de la ligne 2 | `SOMME.SI.ENS(Mouvements!$D$2:$D$100;…;"Entrée")`, idem « Sortie », `=C2-D2`, `=SI(E2<B2;"COMMANDER";"")` | Juste (cas c7-stock). Piège : « Entree » sans accent ignoré en silence, plage limitée à la ligne 100 |
| kam-c7-t02 | 10/10/2026 | gpt-5-mini | Taux CNPS, crédit foncier, redevance audiovisuelle, CAC, barème IRPP du Cameroun | Refuse : « Mes données s'arrêtent en juin 2024… voulez-vous que je recherche ? » | Honnête, aucun chiffre |
| kam-c7-t03 | 10/10/2026 | gpt-4o-mini | Même question que t02 | CNPS salarié 3,6 %, crédit foncier 0,5 %, RAV 1 %, CAC 1 %, IRPP 0 % jusqu'à 150 000 F puis 11/16/21/35 % | **Faux ou invérifiable** : 3,6 % ne correspond à aucune des deux sources trouvées (4,2 % CLEISS, 2,8 % infospratiques.cm) ; barème IRPP sans rapport avec PwC (11 / 16,5 / 27,5 / 38,5 % annuel). Rien repris dans le livre |
| kam-c7-t04 | 10/10/2026 | gpt-5-mini | Facture, première disposition (articles lignes 2 à 6, totaux D8 à D10) | `=SI(A2="";"";B2*C2)`, `=SOMME(D2:D6)`, `=D8*$B$9`, `=ARRONDI(D8+D9;0)` | Juste mais mise en page abandonnée (trop de lignes pour la capture). Non utilisée dans le livre |
| kam-c7-t05 | 10/10/2026 | gpt-5-mini | Tontine, première disposition (grille membres x tours) | `=SOMME(B2:F2)`, `=MAX(0;5*10000-SOMME(B2:F2))`, pot par `NBVAL` | Montants 5 et 10 000 écrits en dur ; `NBVAL` compte aussi un 0 saisi. Non utilisée (grille de 9 colonnes impossible à capturer) |
| kam-c7-t06 | 10/10/2026 | gpt-5-mini | Mobile Money : Opérations + Bilan par opérateur | `SOMME.SI.ENS('Opérations'!$D:$D;…;"Entrée")`, idem « Sortie », `SOMME.SI(…E:E)`, `=B2-C2-D2` | Juste (cas c7-momo). Piège : espace en trop invisible, ligne ignorée (c7-momo-piege) |
| kam-c7-t07 | 10/10/2026 | gpt-5-mini | Paie sans impôt : B2 brut, B3 taux retraite, B4 plafond, B5 autres retenues | `=MIN(B2;B4)*B3`, `=B6+B5`, `=B2-B7` | Juste (c7-paie, c7-paie-plafond). Piège : taux tapé 4,2 au lieu de 4,2 % (c7-paie-piege) |
| kam-c7-t08 | 10/10/2026 | gpt-5-mini | Facture, 2 articles : D2, D4, D5 (TVA, taux en B5), D6 TTC arrondi | `=B2*C2`, `=SOMME(D2:D3)`, `=D4*B5`, `=ARRONDI(D4+D5;0)` | Juste si B5 est au format % (c7-facture) |
| kam-c7-t09 | 10/10/2026 | gpt-5-mini | Tontine : Cotisations (une ligne par versement) + Suivi (total, reste jusqu'au tour en cours, a reçu) | `C2 =SOMME.SI.ENS(…)`, `D2 =MAX(0;Cotisations!$F$1*MIN(Cotisations!$F$2;$B2)-$C2)`, `E2 =SI($B2<=Cotisations!$F$2;"Oui";"Non")` | **Règle inventée** : le dû s'arrête au tour de réception (MIN). Awa (reçoit au tour 1, a payé 10 000 sur 30 000) : reste 0 au lieu de 20 000. Corrigé en supprimant le MIN (c7-tontine-corrige) |
| kam-c7-t10 | 10/10/2026 | gpt-4o-mini | Même prompt que t08 | `D5 =D4*B5/100` (suppose B5 = 19,25) | Juste si B5 vaut 19,25 ; avec B5 en % la TVA est 100 fois trop petite (c7-facture-piege) |

## Cas tableur

Tous les cas sont à `ok: true` (valeur réelle = attendue). Fichiers dans `produits/preuves/sortie/<cas>/`.

| Cas | Formule testée (résumé) | Valeurs réelles |
|---|---|---|
| c7-stock | SOMME.SI.ENS entrées/sorties, `=C-D`, `=SI(E<B;"COMMANDER";"")` | Savon 50/41/9 COMMANDER ; Huile 24/8/16 ; Riz 30/12/18 ; Sucre 20/10/10 COMMANDER |
| c7-stock-piege | idem, « Entree » sans accent sur l'entrée d'huile | Huile : entrées 0, reste -8, COMMANDER |
| c7-paie | `=MIN(B2;B4)*B3`, `=B6+B5`, `=B2-B7` (brut 250 000, 4,2 %, plafond 750 000, autres 25 000) | 10 500 ; 35 500 ; 214 500 |
| c7-paie-plafond | idem avec brut 900 000 | 31 500 ; 56 500 ; 843 500 |
| c7-paie-piege | taux saisi 4,2 (nombre) | 1 050 000 ; 1 075 000 ; -825 000 |
| c7-facture | `=B2*C2`, `=SOMME(D2:D3)`, `=D4*B5`, `=ARRONDI(D4+D5;0)` | 40 500 ; 5 000 ; 45 500 ; 8 758,75 ; 54 259 |
| c7-facture-piege | `=D4*B5/100` avec B5 = 19,25 % | TVA 87,5875 ; TTC 45 588 |
| c7-tontine | formule de l'IA (MIN) | reste Awa 0 (faux), Boris 0, Carine 0, David 10 000 ; A reçu Oui/Oui/Oui/Non |
| c7-tontine-corrige | `=MAX(0;Cotisations!$F$1*Cotisations!$F$2-$C2)` | reste Awa 20 000, Boris 0, Carine 0, David 10 000 |
| c7-momo | SOMME.SI.ENS / SOMME.SI sur Opérations | Orange 170 000 / 35 000 / 400 / 134 600 ; MTN 80 000 / 45 000 / 500 / 34 500 |
| c7-momo-piege | « Orange Money » avec espace final sur une ligne | Orange sorties 25 000, frais 250, solde 144 750 (silencieusement faux) |

Modèles bonus (xlsx produits par l'outil) : `sortie/c7-stock/c7-stock.xlsx`, `c7-paie/c7-paie.xlsx`, `c7-facture/c7-facture.xlsx`, `c7-tontine-corrige/c7-tontine-corrige.xlsx`, `c7-momo/c7-momo.xlsx`. Les montants et frais sont des exemples inventés.

## Sources ouvertes (WebFetch / WebSearch, 10/10/2026)

- CLEISS, « Les cotisations au Cameroun » (cleiss.fr/docs/cotisations/cameroun.html) : pension vieillesse 4,20 % salarié, 4,20 % employeur, plafond 750 000 F/mois, « Cotisations au 1er janvier 2024 ».
- infospratiques.cm/cnps-cameroun/ (dates affichées août 2026, mai 2026) : 2,8 % salarié, 4,2 % employeur. Contredit le CLEISS. Source grand public, non retenue comme référence.
- cnps.cm (page d'accueil) : aucun taux ni plafond.
- copeps.fr/actualites/cotisation-cnps-au-cameroun/ : pas de taux pension, renvoie à cnps.cm.
- PwC, taxsummaries.pwc.com/republic-of-cameroon/individual/taxes-on-personal-income (revue le 14 août 2026) : barème IRPP annuel 11 % (0 à 2 M), 16,5 % (2 à 3 M), 27,5 % (3 à 5 M), 38,5 % (> 5 M). Aucune mention de CNPS, crédit foncier, redevance audiovisuelle ni CAC.
- TVA 19,25 % : PwC, taxsummaries.pwc.com/republic-of-cameroon/corporate/other-taxes (source donnée dans le brief, non rouverte).
- Frais Mobile Money : orange.cm/fr/orange-money.html renvoie 404 ; mtn.cm non trouvée par recherche. Seulement des articles de presse et un simulateur tiers qui se contredisent. Aucun barème dans le livre.

## Ce qui n'a pas marché ou reste ouvert

- Lancement de 11 cas en parallèle : LibreOffice ne répond pas / Xvfb échoue. Relancés un par un.
- Montant en lettres pour la facture : aucune solution testée, non traité (dit dans le livre).
- Taux CNPS de l'exemple (4,2 %, plafond 750 000) : source CLEISS 2024, contredite par un autre site, non confirmée sur cnps.cm. Signalé dans le livre comme à faire confirmer par un comptable.
- Crédit foncier, redevance audiovisuelle, CAC, retenue d'IRPP : aucune source ouverte trouvée, volontairement absents du modèle (cellule « autres retenues » saisie à la main).
- Longueur : le chapitre rend 43 pages au format téléphone du moteur (45 pages avec couverture et sommaire), au-dessus de la cible 10 à 16 du brief ; les chapitres déjà rendus par les autres font 39 pages environ.
