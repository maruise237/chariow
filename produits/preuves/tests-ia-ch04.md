# Journal des tests, chapitre 04 « Tableaux croisés et graphiques »

Date des appels : 10/10/2026. ChatGPT via treg (dataforseo, llm_responses, web_search false). 10 appels sur 25 autorisés. Données : journal fictif de 36 lignes (`produits/preuves/outils/c4-donnees.py`), total 91 400 F.

## Tests IA

| n° | Date | Modèle | Prompt résumé | Réponse reçue (résumé) | Verdict |
|---|---|---|---|---|---|
| t01 | 10/10/2026 | gpt-5-mini | Excel 2016 FR, 6 colonnes : quels tableaux croisés pour produit / vendeur / paiement ? Sans les étapes | 3 TCD : Produit (Somme de Montant) ; Vendeur (Somme de Montant ou Quantité) ; Moyen de paiement (Nombre de ou Somme de Montant) | Correct. Résultats obtenus dans LibreOffice : Sucre 26 400 F, Boris 35 700 F, Orange Money 36 400 F / 15 ventes |
| t02 | 10/10/2026 | gpt-4o-mini | Même prompt que t01 | 3 TCD ; vendeur et moyen de paiement mesurés par « Quantité en somme » | Partiellement faux : « le plus utilisé » compté en articles (25 espèces, 26 MTN, 37 Orange) au lieu du nombre de ventes (11, 10, 15) ; la deuxième place change, le gagnant (Orange Money) reste le même |
| t03 | 10/10/2026 | gpt-5-mini | Étapes Excel 2016 FR pour le total par produit, noms exacts des menus | 8 étapes : « Insertion », Tableau croisé dynamique, boîte « Créer… », volet « Champs de tableau croisé dynamique », Lignes / Valeurs, « Paramètres des champs de valeur », Somme, Format de nombre, Analyse > Actualiser | Presque exact. « Insertion » contre « Insérer » (Microsoft) : à vérifier. « Nombre de Montant en F » par défaut : faux pour des nombres (Microsoft : « Somme de »). « champs de valeur » : Microsoft écrit « valeurs » |
| t04 | 10/10/2026 | gpt-4o-mini | Même prompt que t03 | 7 étapes, onglet « Insertion », groupe « Tableaux », volet, Lignes / Valeurs, Paramètres, Actualiser | Erreur : sélection « A2 à F37 » sans la ligne d'en-têtes (Microsoft : une ligne d'en-têtes). Champ nommé « Montant » au lieu de « Montant en F ». « Nombre » par défaut : même réserve que t03 |
| t05 | 10/10/2026 | gpt-5-mini | Quel graphique : comparer 5 produits, évolution sur 30 jours ? Noms exacts Excel 2016 FR | Colonnes (Colonne groupée) ; Courbes (Courbe) ; chemin Insertion > Graphiques | Bon choix. Intitulés différents de la page Microsoft (« Histogramme groupé », « Graphique en courbes »), page qui ne cite pas Excel 2016 : à vérifier |
| t06 | 10/10/2026 | gpt-4o-mini | Même prompt que t05 | « Graphique en colonnes » et « Graphique en courbes », sans sous-type ; « Sélectionne les données de ton tableau » | Bon choix, réponse vague : ne dit pas s'il faut prendre le journal ou le tableau croisé |
| t07 | 10/10/2026 | gpt-5-mini | Tableau croisé produit / quantité / montant collé en texte, 5 phrases d'explication | 5 phrases : 88 articles, 91 400 F ; sucre premier en quantité (33) et en montant (26 400) ; savon 31 unités ; riz 4 000 F l'unité, 3 unités ; conseil : pousser le sucre | Aucune erreur de chiffre. À noter : huile (2e, 22 500 F) non citée ; chiffre d'affaires pris pour critère, pas le bénéfice |
| t08 | 10/10/2026 | gpt-4o-mini | Même prompt que t07 | Sucre 33 unités et 26 400 F ; riz 3 unités et 12 000 F ; total 91 400 F pour 88 produits ; pousser le sucre | Aucune erreur de chiffre |
| t09 | 10/10/2026 | gpt-5-mini | Tableau croisé produit x paiement collé en texte (cases vides), 4 phrases sur les moyens de paiement | Orange Money 36 400 > espèces 28 600 > MTN 26 400 ; mobile 62 800 F ; riz uniquement en espèces ; lait sans espèces | Aucune erreur de chiffre (26 400 + 36 400 = 62 800 ; 12 000 F de riz en espèces seulement ; lait : case Espèces vide) |
| t10 | 10/10/2026 | gpt-4o-mini | Même prompt que t09 | Mêmes totaux ; « une tendance croissante vers les paiements numériques » ; sucre dépendant d'Orange Money | Chiffres justes (sucre : 18 400 / 26 400 = 70 % Orange Money) ; **affirmation inventée** : une tendance ne se lit pas sur un seul mois |

## Vérifications dans LibreOffice Calc 24.2 (script `produits/preuves/outils/c4-tcd.py`)

Création de chaque tableau croisé (« table de pilote ») par UNO : `createDataPilotDescriptor`, `insertNewByName`. Chaque valeur de la table est comparée à une formule SOMME.SI / NB.SI / SOMME.SI.ENS indépendante et à un recalcul Python depuis la liste des lignes. 75 contrôles, tous concordants (`sortie/c4-tcd/resultat.json`, `"ok": true`).

| Cas | Formule de contrôle | Valeur réelle (table de pilote = formule) |
|---|---|---|
| c4-tcd (produits) | `=SOMME.SI(Ventes!$B$2:$B$37;A4;Ventes!$E$2:$E$37)` | Huile 22 500 ; Lait 15 000 ; Riz 12 000 ; Savon 15 500 ; Sucre 26 400 ; total 91 400 (`=SOMME(Ventes!$E$2:$E$37)`) |
| Quantités par produit | `=SOMME.SI(Ventes!$B$2:$B$37;"Savon";Ventes!$D$2:$D$37)` | Huile 15 ; Lait 6 ; Riz 3 ; Savon 31 ; Sucre 33 (total 88) |
| c4-tcd-vendeurs | `=SOMME.SI(Ventes!$C$2:$C$37;A4;Ventes!$E$2:$E$37)` | Awa 31 900 ; Boris 35 700 ; Carine 23 800 ; total 91 400 |
| Articles par vendeur | `=SOMME.SI(Ventes!$C$2:$C$37;A4;Ventes!$D$2:$D$37)` | Awa 25 ; Boris 39 ; Carine 24 |
| c4-tcd-paiements | `=SOMME.SI(Ventes!$F$2:$F$37;A4;Ventes!$E$2:$E$37)` | Espèces 28 600 ; MTN MoMo 26 400 ; Orange Money 36 400 ; total 91 400 |
| Nombre de ventes par paiement | `=NB.SI(Ventes!$F$2:$F$37;A15)` | Espèces 11 ; MTN MoMo 10 ; Orange Money 15 ; total 36 (`=NB(Ventes!$E$2:$E$37)`) |
| Articles par paiement | `=SOMME.SI(Ventes!$F$2:$F$37;A4;Ventes!$D$2:$D$37)` | Espèces 25 ; MTN MoMo 26 ; Orange Money 37 |
| c4-tcd-croise (produit x paiement) | `=SOMME.SI.ENS(Ventes!$E$2:$E$37;Ventes!$B$2:$B$37;"Sucre 1 kg";Ventes!$F$2:$F$37;"Orange Money")` etc., 15 cases | Huile 7 500 / 10 500 / 4 500 ; Lait – / 5 000 / 10 000 ; Riz 12 000 / – / – ; Savon 7 500 / 4 500 / 3 500 ; Sucre 1 600 / 6 400 / 18 400 (Espèces / MTN MoMo / Orange Money). Contrôle E11 : `=SOMME.SI(Ventes!$B$2:$B$37;"Sucre 1 kg";Ventes!$E$2:$E$37)` = 26 400 |
| Jours (30 lignes) | `=SOMME.SI(Ventes!$A$2:$A$37;A4;Ventes!$E$2:$E$37)` | Pics : 04/10 7 000 ; 12/10 8 000 ; 16/10 8 800 ; 21/10 7 400 ; 27/10 9 000 ; creux : 18/10 et 28/10 500 |
| c4-graph-barres | graphique UNO (`Charts.addNewByName`, BarDiagram) sur A3:B8 de la feuille « Produits », exporté en PNG (`GraphicExportFilter`) | 5 colonnes, de 12 000 (riz) à 26 400 (sucre) |
| c4-graph-courbe | graphique UNO (LineDiagram) sur A3:B33 de la feuille « Jours », exporté en PNG | 30 points, un par jour du 01/10 au 30/10 |

Captures : `sortie/c4-tcd/capture.png`, `c4-tcd-croise`, `c4-tcd-vendeurs`, `c4-tcd-paiements` (captures d'écran réelles, via les fonctions de `tableur.py`), `c4-graph-barres`, `c4-graph-courbe` (export direct du graphique). Classeur complet avec les tables de pilote : `sortie/c4-tcd/c4-tcd.xlsx`.

## Sources ouvertes (10/10/2026, WebFetch)

- Microsoft, « Créer un tableau croisé dynamique pour analyser des données d'une feuille de calcul » (support.microsoft.com/fr-fr). La page dit s'appliquer à Excel 2016, 2019, 2021, 2024, Microsoft 365. Citations retenues : « Sélectionnez Insérer, puis Tableau croisé dynamique » ; « une seule ligne d'étiquettes » et en-têtes non vides ; volet « Champs de tableau croisé dynamique » ; zones Lignes, Colonnes, Valeurs ; « les champs numériques sont ajoutés à Valeurs » ; « Paramètres des champs de valeurs » (pluriel) ; « Somme de » par défaut ; actualiser : clic droit puis Actualiser, ou « Analyse du tableau croisé dynamique » ; « Les tableaux croisés dynamiques recommandés sont disponibles uniquement pour les abonnés Microsoft 365 ».
- Microsoft, « Types de graphiques disponibles dans Office » (support.microsoft.com/fr-fr). Intitulés : « Histogramme groupé », « Graphique en courbes » ; courbes : « des données continues sur une période donnée ». Page applicable à Microsoft 365, Office 2021 et 2024 : Excel 2016 n'est pas cité.

## Ce qui n'a pas pu être vérifié

- Le nom exact de l'onglet du ruban d'Excel 2016 (« Insertion » selon l'IA, « Insérer » selon la page Microsoft) : pas d'Excel 2016 disponible. Signalé « à vérifier » dans le chapitre.
- Le comportement « Nombre de » par défaut dans Excel : non reproduit (LibreOffice affiche « Somme » pour une colonne de nombres). Signalé comme tel dans le chapitre.
- Les intitulés des types de graphique d'Excel 2016 (la page Microsoft ne couvre pas cette version).
- Le libellé de Excel pour la ligne de total (LibreOffice écrit « Total Résultat ») : non cité dans le chapitre.

## Incident technique

Plusieurs agents lancent `tableur.py` en même temps. Un de mes lancers a pris l'écran virtuel d'un autre agent (même numéro d'écran Xvfb) : une capture « c4-tcd » montrait le tableau d'un autre chapitre (Opérateur / Entrées / Sorties). Détecté en relisant le rendu, capture régénérée. `c4-tcd.py` démarre maintenant son Xvfb avec contrôle de survie et nouvelles tentatives. `tableur.py` n'a pas été modifié ; il garde le même risque pour les autres agents.
