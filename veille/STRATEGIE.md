# Stratégie produits KAMTECH (boutique esaystor)

Basée sur la veille du 8 octobre 2026 : 74 pubs Meta actives, 56 produits, 51 boutiques Chariow concurrentes (CM, CI, SN, BJ). Détail dans `RAPPORT.md` et `data/produits.csv`.

## Ce que font les produits qui vendent

| Constat | Chiffre | Ce qu'on en fait |
|---|---|---|
| Prix des produits à 1K+ achats | 600 à 2 500 F (sauf Excel à 7 000 F) | Produit d'appel à 1 000 F, cœur d'offre à 2 500 F |
| Prix barré sur la page | 45 pages sur 56 (80 %) | Toujours un prix barré crédible (×3 à ×5) |
| Compte à rebours sur la page | 26 sur 56 (46 %) | Activer la date de fin de promo Chariow |
| Nombre d'achats affiché | 27 sur 56 | Afficher le compteur dès 10 ventes |
| Pubs en vidéo | 37 sur 74 (50 %) | 1 vidéo de 30 à 60 s + 1 image par produit |
| Urgence dans le texte (promo, « au lieu de », minuit) | 33 sur 74 | Accroche + prix barré + délai |
| Bonus annoncés | 20 sur 74 | 1 à 3 bonus à valeur perçue forte |
| Lien de paiement écrit dans le texte de la pub | fréquent | Mettre le lien direct `/checkout` dans le texte |

Les gagnants sont **très concrets et locaux** : « 500 recettes camerounaises », « carnet de suivi des dépenses », « crée des affiches qui vendent », « Excel de débutant à expert », « guide ultime du smartphone ». Pas de promesse floue, un résultat qu'on comprend en 2 secondes.

## Nos produits actuels face au marché

| Produit | Prix actuel | Ventes | Problème | Action |
|---|---|---|---|---|
| Transforme ton téléphone en machine à visuels pro (Nano Banana) | 3 900 F | 0 | Même besoin que le n°4 du marché (« affiches qui vendent », 1K+ à 1 050 F) mais 4× plus cher et angle « outil » au lieu de « résultat » | Renommer « Crée des affiches qui vendent avec ton téléphone », passer à **1 000 F**, prix barré 5 000 F |
| Maîtriser Claude AI de A à Z | 5 900 F | 0 | Pas de couverture (vignette par défaut), prix au-dessus du marché, « Claude » est inconnu du grand public | Angle résultat (« Fais en 1 h le travail d'une journée avec l'IA »), **2 500 F**, ajouter une couverture |
| No-code Express | gratuit | 4 | OK comme aimant à clients | Garder gratuit, ajouter un upsell vers les produits ci-dessous |
| Mini serveur n8n à vie | 19 500 F | 0 | Niche, achat réfléchi | Ne pas pousser en pub froide ; vendre aux acheteurs existants |

## 4 nouveaux produits à créer (ordre de priorité)

Chaque produit copie une **demande prouvée** (pub qui tourne depuis des mois + 1K+ achats) et y ajoute **l'angle KAMTECH : l'IA**.

1. **Excel + IA : de zéro à pro en 7 jours** · 2 500 F (barré 10 000 F)
   Preuve : n°1 du classement, 254 jours de pub, 6 variantes, 5 pays, 1K+ achats à 7 000 F.
   Différence : on montre comment ChatGPT/Claude écrit les formules à ta place. Format : e-book PDF d'environ 70 pages.
   Bonus : 20 modèles Excel prêts (facture, stock, paie, budget).

2. **Kit budget Mobile Money** (modèle Google Sheets + PDF) · 1 000 F
   Preuve : n°2, « Carnet de suivi des dépenses », 1K+ achats à 1 000 F, 131 jours de pub.
   Différence : tableau Google Sheets automatique (catégories Orange Money / MTN / Wave, graphiques). Produit d'appel parfait vers l'offre Excel.

3. **Crée des affiches qui vendent avec ton téléphone** · 1 000 F
   C'est notre guide Nano Banana repositionné (voir tableau). Preuve : n°4, 1K+ achats à 1 050 F.
   Bonus : 50 prompts d'affiches (promo, menu restaurant, boutique, église, événement).

4. **Ton téléphone, ton bureau : 30 outils IA gratuits** · 2 000 F
   Preuve : n°6, « Guide ultime du smartphone », 1K+ achats, 139 jours de pub.
   Différence : orienté travail et argent (rédiger, traduire, faire des visuels, répondre aux clients WhatsApp, avec Whappi en bonus).

**Pack « Business IA »** (1 + 3 + 4) à 4 900 F, barré 15 000 F, en offre groupée sur Chariow.

## Plan de lancement par produit

1. Créer le produit sur Chariow : couverture, prix barré, date de fin de promo, 1 à 3 bonus.
2. 2 pubs : 1 vidéo (téléphone en main, 30 à 60 s) + 1 image, lien `/checkout` dans le texte.
3. Budget test : 2 000 à 3 000 F/jour pendant 4 jours, pays CM + CI + SN + BJ.
4. Règle de décision au jour 4 : coût par achat < 50 % du prix → on augmente ; sinon on change l'accroche (pas le produit) et on reteste une fois.
5. Relancer la veille chaque semaine (`node veille/analyze.mjs` après une nouvelle collecte) pour suivre les nouveaux gagnants.

## Accroches modèles (tirées des gagnants, à adapter)

- « 😍 Imagine… te réveiller le matin et voir des ventes tomber sur ton téléphone »
- « Tu utilises Excel depuis des années mais tu cherches encore les formules sur Google ? »
- « 🔥 +2 000 exemplaires vendus ! »
- « Le guide qui transforme ton smartphone en outil de PRODUCTIVITÉ »
- « Seulement 1 000 F au lieu de 5 000 F, promo valable jusqu'à minuit »
