---
produit: compta
da: cabinet
titre: Comptable 2.0 : le SYSCOHADA avec l'IA
titreCouv: Comptable *2.0*
titreVignette: Comptable *2.0*
tailleVignette: 110
court: Comptable 2.0
collection: Édition professionnelle
surtitre: SYSCOHADA révisé + IA
sousTitre: Saisie, rapprochement, clôture et états financiers avec l'IA, plus vite et sans perdre le contrôle.
motsCles: Écritures | Rapprochement | Clôture | États financiers | DSF
atouts: 150 prompts SYSCOHADA | Modèles Excel | Grille de contrôle
contenu: L'e-book PDF (environ 90 pages) | 150 prompts SYSCOHADA prêts à copier | Modèles Excel : rapprochement, amortissements, immobilisations, balance | La checklist de clôture
suite: Pour aller plus loin sur les tableaux, découvre **Excel sans apprendre les formules**.
edition: Octobre 2026
---
# Les règles de cet e-book

Cet e-book s'adresse aux comptables, assistants comptables et cabinets qui travaillent en SYSCOHADA révisé. Il montre comment confier à l'IA le travail répétitif, sans jamais lui confier la signature.

1. Tu anonymises toujours les données clients avant de les donner à l'IA.
2. Tu vérifies chaque écriture avec la grille de contrôle en 7 points (chapitre 9).
3. Pour la fiscalité, le texte en vigueur (CGI, loi de finances) a toujours raison contre l'IA.

> Aucune écriture proposée par l'IA n'entre en comptabilité sans ton contrôle.

:::chapitre 01
titre: Les écritures courantes
objectif: Faire proposer à l'IA l'écriture compte par compte, puis la valider en moins d'une minute.
intro: Achats, ventes, TVA, frais, paie, emprunts, puis les cas difficiles : avoirs, acomptes, opérations en devises. Chaque cas a son prompt et son contrôle.
duree: 35 min
bonus: 150 prompts SYSCOHADA
:::

## La facture d'achat avec TVA

C'est le cas le plus courant, et celui où l'IA se trompe le plus souvent de plan comptable. Le mode SYSCOHADA du chapitre 0 corrige ce défaut.

:::prompt Prompt 1.3
Mode SYSCOHADA. Facture fournisseur F-0231 : marchandises 500 000 F HT, TVA 19,25 %, payable à 30 jours. Donne l'écriture au journal des achats en tableau : compte, intitulé exact, débit, crédit. Vérifie que débit = crédit.
:::

| Compte | Intitulé | Débit | Crédit |
|---|---|---|---|
| 601 | Achats de marchandises | 500 000 | |
| 4452 | TVA récupérable sur achats | 96 250 | |
| 401 | Fournisseurs | | 596 250 |

:::erreur
Sans le mode SYSCOHADA, l'IA utilise le plan comptable français : 607 et 44566. L'écriture semble juste, mais les comptes sont faux.
:::

:::astuce
Demande toujours « l'intitulé exact du compte ». Si l'intitulé ne figure pas dans le plan SYSCOHADA, le compte est probablement inventé.
:::

## Les contrôles avant de valider

:::checklist Avant de valider une écriture proposée par l'IA
- Les comptes existent dans le plan SYSCOHADA révisé.
- Débit = crédit.
- Le taux de TVA est celui de la loi de finances en vigueur.
- Le libellé permet de retrouver la pièce.
:::

:::recap
- Le prompt commence toujours par « Mode SYSCOHADA ».
- Exige compte, intitulé exact, débit et crédit en tableau.
- Contrôle les comptes avant de passer l'écriture.
:::
