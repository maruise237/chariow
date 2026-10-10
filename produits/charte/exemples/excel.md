---
produit: excel
da: atelier
titre: Excel sans apprendre les formules
titreCouv: Excel *sans apprendre* les formules
titreVignette: Excel *sans* formules
court: Excel avec l'IA
surtitre: Excel + Intelligence artificielle
sousTitre: Tu dis ce que tu veux en français, l'IA écrit la formule à ta place. De débutant à pro en 7 jours.
collection: E-book + bonus
atouts: 100 prompts prêts | 20 modèles en FCFA | PC et téléphone
visuel: tableur
contenu: L'e-book PDF (environ 70 pages) | 100 prompts Excel en français | 20 modèles Excel et Google Sheets en FCFA | La fiche mémo des 15 formules
suite: Tu travailles en comptabilité ? Découvre **Comptable 2.0**.
edition: Octobre 2026
---
# Comment lire cet e-book

Tu vas apprendre à obtenir n'importe quelle formule sans l'apprendre par cœur. Tu sauras aussi nettoyer une liste, faire un tableau de bord et automatiser les tâches répétitives.

## Ce qu'il te faut
- Excel, Excel mobile ou Google Sheets (gratuit).
- Une IA gratuite : ChatGPT, Claude ou Gemini.
- Les fichiers bonus livrés avec cet e-book.

## Les encadrés de la méthode
1. Les encadrés foncés sont des **prompts** : copie-les tels quels.
2. Les encadrés « résultat » montrent ce que l'IA doit te rendre.
3. Les encadrés rouges listent les **erreurs fréquentes**. Lis-les avant de valider.
4. Chaque chapitre finit par **À retenir** et un exercice.

:::chapitre 02
titre: Les 15 formules qui font 90 % du travail
objectif: obtenir de l'IA la bonne formule du premier coup, et la débloquer quand elle affiche une erreur.
intro: SOMME, SI, RECHERCHEV, SOMME.SI.ENS... Pour chacune : le prompt à copier, la formule obtenue et l'erreur que font presque tous les débutants.
duree: 25 min
bonus: fiche mémo des 15 formules
visuel: avantApres: #NOM? | 16 000 | SOMME.SI.ENS
:::

## SOMME.SI.ENS : le total d'un seul produit

Tu veux savoir combien t'a rapporté un produit précis dans une longue liste de ventes. Ne cherche pas la formule : décris ton tableau à l'IA.

:::prompt Prompt 2.6
J'utilise Excel en français. Colonne B = produit, colonne D = montant en FCFA, lignes 2 à 200. Écris la formule qui fait le total des ventes de « Savon ». Utilise les noms de fonctions en français et le point-virgule.
:::

:::resultat Ce que l'IA doit te rendre | mono
=SOMME.SI.ENS(D2:D200;B2:B200;"Savon")
:::

:::erreur
L'IA répond `SUMIFS(D2:D200,B2:B200,"Savon")`. En Excel français, ça affiche #NOM?. Rappelle-lui : « noms français et point-virgule ».
:::

:::astuce
Écris le nom du produit dans la cellule F1 et remplace "Savon" par F1 : la même formule marche pour tous tes produits.
:::

## Débloquer une formule en erreur

Quand une formule affiche une erreur, ne la corrige pas à la main. Copie la formule ET le message d'erreur, et donne les deux à l'IA.

:::avantapres
avant: Tu cherches sur Google pendant 20 minutes, tu essaies trois formules, rien ne marche.
apres: Tu colles la formule et l'erreur, l'IA t'explique la cause et te donne la correction en 30 secondes.
:::

| Erreur | Ce qu'elle veut dire |
|---|---|
| #NOM? | Nom de fonction inconnu (souvent en anglais) |
| #N/A | La valeur cherchée n'existe pas |
| #VALEUR! | Du texte là où il faut un nombre |
| #REF! | Une cellule supprimée est utilisée |

:::recap
- Donne toujours à l'IA ta version d'Excel, tes colonnes et le résultat voulu.
- Exige les noms de fonctions en français et le point-virgule.
- En cas d'erreur, colle la formule et le message : l'IA corrige.
:::

:::exercice 5 minutes
Ouvre le modèle « Ventes du mois » des bonus. Demande à l'IA la formule qui donne le total des ventes de riz, puis celle qui compte combien de fois tu as vendu de l'huile.
:::
