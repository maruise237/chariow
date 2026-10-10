# Autocritique de la fiche, de la FAQ, du SEO et des accroches

## Passe 1 : relecture en acheteur méfiant

Corrigé :
- Chiffre « 84 tests » du brief : introuvable dans les fichiers. Recompte des journaux (`tests-ia.md` 27, ch01 7, ch03 13, ch04 10, ch05 5, ch06 5, ch07 10) : 77 tests consignés. Le texte de vente ne cite pas ce total (il cite les modèles et la méthode) ; le chiffre est signalé au superviseur.
- « 58 formules vérifiées » : il y a 58 dossiers de cas dans `preuves/cas`, qui contiennent aussi des formules fausses de l'IA. Le texte ne dit pas « 58 formules justes » ; il parle de formules collées dans un vrai tableur.
- « Compte 20 minutes par chapitre » : les durées du livre vont de 15 à 60 minutes. Remplacé par « entre 15 et 60 minutes ».
- « Une quinzaine de fonctions » : chiffre non vérifié, supprimé.
- Accroche 1 « Cherche l'espace en trop » : laisse croire que c'est toujours la cause. Remplacée par « Un #N/A alors que le code existe ? ».
- Texte Facebook 2 : « trois autres erreurs » remplacé par « d'autres erreurs » (le livre en montre plus).
- FAQ téléphone : « les macros se font sur ordinateur » n'est pas écrit dans le livre. Remplacé par ce que le chapitre 6 décrit (menus et raccourcis de l'ordinateur).
- Taux de paie : « il n'en donne pas de garantis » reformulé en « il n'en garantit aucun » (le livre cite 4,2 % du CLEISS 2024 en précisant de le faire confirmer).
- Accroches trop longues au comptage mot à mot (2, 5, 6) : raccourcies à 8 mots ou moins, en comptant chaque groupe de chiffres comme un mot.

## Passe 2 : relecture en éditeur anti-slop

Recherche par script (grep) de : tirets cadratins, points d'exclamation, « ce n'est pas X, c'est Y », mots creux (incroyable, ultime, révolutionnaire, plongeons, booster, débloquer, potentiel, magique, puissant, facilement, rapidement), majuscules d'emphase. Aucun cas trouvé après la passe 1, sauf les siglas légitimes (PROPER, TRIM, CNPS, SOMME.SI.ENS).

Corrigé à la main :
- « Les erreurs de l'IA sont montrées, pas cachées » : contraste de façade, réduit à « sont montrées ».
- « Ces erreurs te servent de modèle » : phrase creuse, remplacée par « Tu apprends ainsi quoi regarder quand l'IA te répond ».
- « Ce livre te donne une autre façon de travailler » : remplacé par « propose une autre méthode ».
- FAQ « Oui, et c'est pourquoi le livre existe » : phrase-chute supprimée.
- Aucune triade forcée gardée : les listes restantes sont des inventaires de contenu (chapitres, fichiers, projets).

## Vérification des chiffres

Voir le compte rendu : chaque chiffre du texte renvoie à un fichier.

## À décider par le superviseur

- Catégorie Chariow exacte (proposée, non vérifiée dans la liste réelle).
- Les 7 modèles `bonus/*.xlsx` doivent être joints au produit (le livre en cite 5 au chapitre 7 et le tableau croisé au chapitre 4).
- Le chiffre « 84 tests » du brief ne correspond pas aux journaux (77).
