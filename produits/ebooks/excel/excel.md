---
produit: excel
da: atelier
titre: Excel sans apprendre les formules
titreCouv: Excel *sans apprendre* les formules
titreVignette: Excel *sans* formules
court: Excel sans formules
collection: Méthode KAMTECH
surtitre: Excel + IA · en français
sousTitre: Tu écris ta demande en français, l'IA te donne la formule, tu la vérifies en 30 secondes.
atouts: 100 prompts testés | 20 modèles en FCFA | Fiche mémo
visuel: excel
contenu: L'e-book PDF | 100 prompts Excel testés | 20 modèles Excel et Google Sheets en FCFA | La fiche mémo des 15 formules
suite: Tu es comptable ? Le même principe, appliqué au SYSCOHADA : **Comptable 2.0**.
edition: Octobre 2026
---
# Avant de commencer

Tu n'as pas besoin de retenir SOMME.SI.ENS ni RECHERCHEV. Tu as besoin de savoir dire ce que tu veux, et de vérifier ce qu'on te donne.

Ce livre t'apprend ces deux gestes. Chaque prompt a été envoyé à ChatGPT avant d'être imprimé ici. Chaque formule a été collée dans un vrai tableur : les captures montrent le résultat obtenu, pas une maquette.

Il te faut Excel ou Google Sheets, une IA gratuite (ChatGPT, Gemini ou Claude) et 20 minutes par chapitre.

:::chapitre 00
titre: Régler ton IA pour Excel
objectif: obtenir une formule qui marche du premier coup dans ton Excel en français.
intro: Nous avons posé les mêmes questions à ChatGPT de plusieurs façons. La plupart du temps, il répond juste. Mais trois pièges reviennent, et ils coûtent une heure à un débutant.
duree: 15 min
illustration: telephone-afro
:::

## Ce que nous avons testé

Le 10 octobre 2026, nous avons envoyé 10 demandes à ChatGPT (modèles gpt-4o-mini et gpt-5-mini), puis collé chaque formule dans un tableur en français.

Quand la question est écrite en français, la formule revient presque toujours en français, avec le point-virgule. C'est une bonne nouvelle. Les problèmes viennent d'ailleurs.

## Piège 1 : la question en anglais

Beaucoup de tutoriels sont en anglais. Si tu poses ta question en anglais, l'IA te répond avec des noms anglais et des virgules.

:::resultat Réponse réelle de ChatGPT (question en anglais) | mono
=IF(AND(D2 > 50000, C2 = "Grossiste"), "Remise 10%", "")
:::

Nous l'avons collée telle quelle dans un tableur en français :

:::capture ../../preuves/sortie/si-anglais/capture.png | Capture réelle : LibreOffice Calc en français, 10 octobre 2026.
1: 50,12 h4 | La formule anglaise, collée sans rien changer.
2: 98,72 b4 | Le résultat : une erreur au lieu de « Remise 10% ».
:::

Dans Excel en français aussi, `IF` et `AND` sont inconnus : il faut `SI`, `ET` et des « ; ». La même question posée en français donne directement la bonne version :

:::resultat Réponse réelle de ChatGPT (question en français) | mono
=SI(ET(D2>50000; C2="Grossiste"); "Remise 10%"; "")
:::

:::capture ../../preuves/sortie/si-et/capture.png | La même formule, collée dans le même tableur.
1: 45,10 h4 | La formule française, avec ET et les « ; ».
2: 88,56 b4 | Awa est grossiste et dépasse 50 000 F : elle a la remise. Boris (détaillant) et Carine (30 000 F) n'ont rien.
:::

## Piège 2 : un mot anglais au milieu

Nous avons posé deux fois à gpt-5-mini, sans réglage, une question de recherche de prix. Une des deux réponses, pourtant en français, contenait un nom anglais :

:::resultat Réponse réelle de ChatGPT | mono
=XLOOKUP(A2;Tarifs!A:A;Tarifs!B:B;"Non trouvé")
:::

En français, cette fonction s'appelle `RECHERCHEX`. Avec un nom qu'il ne reconnaît pas, Excel affiche l'erreur `#NOM?` au lieu du prix (aide Microsoft, « Comment corriger une erreur #NOM? »).

Il y a un second piège : d'après Microsoft, RECHERCHEX « n'est pas disponible dans Excel 2016 et Excel 2019 ». Sur ces versions, encore très répandues, même le bon nom français donne une erreur.

## Piège 3 : trop de choix

Sans consigne, l'IA propose souvent deux ou trois formules « selon ta version ». Le débutant ne sait pas laquelle prendre. Une consigne claire règle ça : tu reçois une seule formule, adaptée à ton Excel.

## Le message de réglage

Copie ce texte au début de ta conversation avec l'IA. Mets ta version d'Excel (elle s'affiche dans Fichier, puis Compte). Remplace la partie sur tes colonnes à chaque nouveau tableau.

:::prompt Réglage
J'utilise Excel [2016, 2019, 2021 ou 365] en français. Donne-moi une seule formule, avec les noms de fonctions en français et le point-virgule ; comme séparateur. Mes données : [décris tes feuilles et tes colonnes]. Je veux : [le résultat attendu].
:::

Nous avons envoyé ce réglage à gpt-5-mini avec « Excel 2016 » et notre besoin : le prix d'un produit à partir de son code, ou « Code inconnu ». Réponse complète, en une ligne :

:::resultat Réponse réelle de ChatGPT (avec le réglage) | mono
=SIERREUR(RECHERCHEV(A2;Tarifs!A:B;2;FAUX);"Code inconnu")
:::

:::capture ../../preuves/sortie/recherchev-sierreur/capture.png | LibreOffice écrit 0 à la place de FAUX : c'est la même valeur.
1: 58,9 h4 | La formule de l'IA, collée en B2 puis recopiée en B3.
2: 58,55 d4 | P03 existe dans les tarifs : son prix s'affiche.
3: 55,72 d4 | P09 n'existe pas dans les tarifs : le message remplace l'erreur.
:::

:::astuce
Sur Google Sheets, écris « J'utilise Google Sheets en français ». Les noms sont presque tous les mêmes qu'Excel.
:::

## Vérifier en 30 secondes

L'IA peut se tromper même quand la formule est juste. Dans nos tests, ChatGPT a donné `=NB.SI(E:E; "Payé")` pour compter les clients qui ont payé, en ajoutant qu'il fallait « respecter les majuscules ». Nous avons vérifié :

:::capture ../../preuves/sortie/nb-si-casse/capture.png | Payé, payé et PAYÉ sont comptés ; Impayé ne l'est pas.
1: 33,6 h4 | La formule de l'IA, limitée aux lignes 2 à 6.
2: 98,83 g4 | Résultat : 4. NB.SI ne fait pas la différence entre majuscules et minuscules.
:::

La formule est juste, l'explication est fausse. L'aide Microsoft le confirme : « NB.SI ignore la casse ».

:::checklist Avant de garder une formule
- Elle s'affiche sans erreur (#NOM?, #VALEUR!, #N/A).
- Tu as vérifié le résultat sur 2 ou 3 lignes, de tête ou à la calculatrice.
- Tu as changé une donnée : le résultat a bougé comme prévu.
:::

:::recap
- Pose ta question en français.
- Commence par le message de réglage : version, colonnes, résultat voulu.
- Vérifie sur 2 ou 3 lignes avant de recopier la formule partout.
:::

:::exercice Maintenant
Ouvre ChatGPT, colle le message de réglage et décris un tableau que tu utilises vraiment. Garde cette conversation : tu t'en serviras dans les chapitres suivants.
:::

:::chapitre 02
titre: Les formules qui font le travail
objectif: obtenir de l'IA les formules de tous les jours, et les vérifier sur tes propres chiffres.
intro: Additionner, choisir, compter, calculer la TVA, réparer une erreur. Pour chaque besoin : le message à envoyer, la vraie réponse de l'IA et la capture du résultat dans le tableur.
duree: 25 min
illustration: papier-lunettes
:::

## Additionner une seule catégorie

Tu as la liste des ventes de la semaine et tu veux le total du savon seulement.

:::prompt Prompt 2.1
J'ai un tableau Excel : colonne B les produits, colonne D le total de chaque vente en FCFA, lignes 2 à 5. Donne-moi la formule pour avoir le total des ventes de Savon.
:::

:::resultat Réponse réelle de ChatGPT (gpt-4o-mini et gpt-5-mini) | mono
=SOMME.SI(B2:B5;"Savon";D2:D5)
:::

:::capture ../../preuves/sortie/somme-si/capture.png | Capture réelle, LibreOffice Calc en français.
1: 50,7 h4 | La formule, telle que l'IA l'a donnée.
2: 41,42 d4 | Première vente de savon : 6 000.
3: 41,67 d4 | Deuxième vente de savon : 10 000.
4: 84,92 g4 | Le total : 16 000. Le compte est bon.
:::

:::erreur
Copier la formule avec des virgules à la place des « ; ». Nous l'avons testé : le tableur affiche une erreur et ne calcule rien.
:::

## Décider entre deux cas

La fonction SI sert dès que la réponse dépend d'une condition : remise ou pas, payé ou pas, en stock ou pas. C'est la formule SI(ET(…)) du chapitre 0.

:::astuce
Pour vérifier une formule SI, ajoute une ligne qui doit dire « non ». Si Boris le détaillant reçoit la remise, la condition est fausse.
:::

## Additionner avec deux conditions

Awa et Boris vendent tous les deux du savon. Tu veux seulement le savon vendu par Awa : deux conditions à la fois. Pour cela, Microsoft prévoit la fonction SOMME.SI.ENS.

:::prompt Prompt 2.2
J'utilise Excel 2016 en français. Donne-moi une seule formule, avec les noms de fonctions en français et le point-virgule ; comme séparateur. Mon tableau : colonne A le vendeur, colonne B le produit, colonne C le total de la vente en FCFA, lignes 2 à 5. Je veux le total des ventes de Savon faites par Awa.
:::

:::resultat Réponse réelle de ChatGPT (gpt-5-mini) | mono
=SOMME.SI.ENS(C2:C5; A2:A5; "Awa"; B2:B5; "Savon")
:::

Lis la formule dans l'ordre : on additionne la colonne C, là où A vaut « Awa » et où B vaut « Savon ». Microsoft précise que la plage à additionner passe en premier dans SOMME.SI.ENS, alors qu'elle vient en troisième position dans SOMME.SI.

:::capture ../../preuves/sortie/somme-si-ens/capture.png | Capture réelle, LibreOffice Calc en français.
1: 50,7 h4 | La formule de l'IA : on additionne C si A vaut Awa et si B vaut Savon.
2: 76,42 g4 | Awa, savon : 6 000 comptés.
3: 80,54 g4 | Boris, savon : 4 000 non comptés, ce n'est pas Awa.
4: 74,92 g4 | Total : 15 000, soit 6 000 + 9 000. L'huile d'Awa (7 500) reste dehors.
:::

:::erreur
Le même message, envoyé à gpt-4o-mini, a donné `=SOMME.SI(A2:A5; "Awa"; C2:C5) * SOMME.SI(B2:B5; "Savon"; C2:C5)`. Elle multiplie deux totaux. Dans le même tableau, le tableur affiche 427 500 000 au lieu de 15 000, sans aucun message d'erreur. Seul ton calcul de tête te protège.
:::

## Trouver le plus gros et la moyenne

Quel est ton meilleur jour de la semaine, et combien vends-tu en moyenne par jour ? Deux petites fonctions répondent.

:::prompt Prompt 2.3
J'utilise Excel 2016 en français. Donne-moi deux formules, avec les noms de fonctions en français et le point-virgule ; comme séparateur. Mon tableau : colonne A le jour, colonne B les ventes du jour en FCFA, lignes 2 à 5. Je veux la plus grosse vente, puis la vente moyenne.
:::

:::resultat Réponse réelle de ChatGPT (gpt-5-mini et gpt-4o-mini) | mono
=MAX(B2:B5)
=MOYENNE(B2:B5)
:::

Les deux modèles ont répondu pareil. MAX renvoie la plus grande valeur de la plage. MOYENNE fait le total divisé par le nombre de jours. Contrôle de tête : 12 500 + 8 000 + 21 000 + 15 000 = 56 500, divisé par 4, donne 14 125.

:::capture ../../preuves/sortie/max-moyenne/capture.png | Capture réelle. La formule de D2 est =MOYENNE(B2:B5).
1: 25,8 h4 | La formule de C2 : =MAX(B2:B5).
2: 70,56 b4 | Le plus gros : mercredi, 21 000.
3: 90,56 b4 | La moyenne : 14 125 par jour.
:::

## Compter les jours de retard

Une facture devait être payée le 28 septembre. Combien de jours de retard aujourd'hui ? Pour Excel, une date est un nombre : AUJOURDHUI « retourne le numéro de série de la date actuelle » (Microsoft). En soustrayant deux dates, tu obtiens des jours.

:::prompt Prompt 2.4
J'utilise Excel 2016 en français. Donne-moi une seule formule, avec les noms de fonctions en français. Colonne A : le numéro de facture. Colonne B : la date d'échéance. Dans la colonne C, je veux le nombre de jours de retard par rapport à aujourd'hui, et 0 si la facture n'est pas encore en retard.
:::

:::resultat Réponse réelle de ChatGPT (gpt-5-mini) | mono
=MAX(0;AUJOURDHUI()-B2)
:::

ChatGPT ajoute : « à placer en C2 et recopier vers le bas ; B2 doit contenir une date ». Le MAX(0; …) évite un retard négatif pour une facture pas encore échue. Comme AUJOURDHUI change chaque jour, la capture est datée.

:::capture ../../preuves/sortie/jours-retard/capture.png | Capture du 10 octobre 2026. Le lendemain, chaque retard gagne un jour.
1: 45,8 h4 | La formule de l'IA. Ici, AUJOURDHUI() vaut le 10/10/2026.
2: 93,48 g4 | F-101, échéance le 28/09 : 12 jours de retard.
3: 95,76 g4 | F-103, échéance le 20/10 : pas encore en retard, donc 0.
:::

:::erreur
gpt-4o-mini a écrit `AUJOURD'HUI()` avec une apostrophe. Le tableur refuse la formule (Err:508 dans LibreOffice). Le nom de la fonction s'écrit en un seul mot : AUJOURDHUI.
:::

:::astuce
Pour Excel, le 10/10/2026 est le nombre 46 305. Pour voir ce numéro à la place d'une date, passe la cellule au format Standard ou Nombre (conseil de Microsoft sur la page d'AUJOURDHUI).
:::

## Calculer un prix TTC arrondi

Un client ne paie pas 2 981,25 F. Il te faut un prix TTC arrondi au franc. Au Cameroun, le taux normal de la TVA est de 19,25 %. Le site taxsummaries.pwc.com (page revue le 14 août 2026) écrit : « The total VAT in Cameroon is 19.25%. »

Le site fiscal lefisk.cm détaille ce taux : 17,5 % de TVA, plus 10 % de centimes additionnels calculés sur ce montant. Et 17,5 × 1,10 = 19,25. C'est le taux normal : vérifie qu'il s'applique à ce que tu vends.

:::prompt Prompt 2.5
J'utilise Excel 2016 en français. Donne-moi une seule formule, avec les noms de fonctions en français et le point-virgule ; comme séparateur. Colonne B : le prix hors taxe en FCFA. Dans la colonne C, je veux le prix TTC avec la TVA du Cameroun (19,25 %), arrondi au franc.
:::

:::resultat Réponse réelle de ChatGPT (gpt-5-mini) | mono
=ARRONDI(B2*1,1925;0)
:::

Ici, 1,1925 veut dire 1 + 19,25 %. Le 0 de ARRONDI demande l'unité : Microsoft écrit que le nombre est alors arrondi à l'entier le plus proche.

:::capture ../../preuves/sortie/tva-arrondi/capture.png | Capture réelle. La colonne D, ajoutée par nous, montre le prix avant l'arrondi.
1: 33,8 h4 | La formule de l'IA : prix HT × 1,1925, arrondi à l'unité.
2: 58,75 b4 | 13 500 F HT donnent 16 099 F TTC.
3: 88,75 b4 | Sans ARRONDI, le calcul tombe sur 16 098,75.
:::

:::erreur
gpt-4o-mini a écrit `=ARRONDI(B1 * (1 + 19,25%) ; 0)` et précisé qu'il fallait changer B1 selon la ligne. Dans notre tableau, B1 contient le titre « Prix HT » : le tableur affiche #VALEUR!. Le calcul, lui, est bon : avec B2, nous obtenons 2 981.
:::

:::astuce
Nous avons aussi posé la question sans donner le taux. gpt-5-mini a écrit `=ARRONDI(B2*(1+0,1925);0)`, le bon calcul : 2 981 pour 2 500 F. Donne quand même le taux toi-même, pour savoir ce que tu utilises.
:::

## Assembler le prénom et le nom

Ta liste a le prénom en colonne A et le nom en colonne B. Tu veux « Aminatou Njoya » dans une seule cellule, sans tout retaper.

:::prompt Prompt 2.6
J'utilise Excel 2016 en français. Donne-moi une seule formule, avec les noms de fonctions en français et le point-virgule ; comme séparateur. Colonne A : le prénom. Colonne B : le nom. Dans la colonne C, je veux le nom complet : le prénom, une espace, puis le nom.
:::

:::resultat Réponse réelle de ChatGPT (gpt-5-mini) | mono
=CONCATENER(A2;" ";B2)
:::

gpt-4o-mini a donné la même fonction, avec A1 et B1 : à toi d'adapter la ligne. L'espace entre guillemets sépare les deux mots.

Il existe aussi CONCAT, plus courte. Microsoft indique qu'elle est disponible avec Office 2019 ou un abonnement Office 365. CONCATENER, elle, reste disponible « pour des raisons de compatibilité » : l'IA a choisi la fonction qui passe partout.

:::capture ../../preuves/sortie/nom-complet/capture.png | Capture réelle. La colonne D, ajoutée par nous, utilise le signe &.
1: 32,7 h4 | La formule de l'IA : prénom, une espace entre guillemets, nom.
2: 55,76 b4 | Le résultat en C4 : Carine Fotso.
3: 85,76 b4 | Avec & : même résultat, formule plus courte.
:::

:::astuce
Le signe & fait la même chose, et Microsoft le recommande à la place de CONCATENER : `=A2&" "&B2`. Nous l'avons essayé en colonne D.
:::

## Débloquer une formule en erreur

Tu tapes P03, un code qui existe bien dans les tarifs. La formule du chapitre 0 affiche pourtant une erreur. Au lieu de deviner, donne l'erreur à l'IA.

:::capture ../../preuves/sortie/recherchev-na/capture.png | LibreOffice écrit #N/D à la place de #N/A : c'est la même erreur.
1: 60,8 h4 | La formule du chapitre 0, en B2.
2: 80,67 d4 | P03 est dans les tarifs, et pourtant B2 affiche une erreur.
3: 79,86 d4 | P01 donne 500 avec la même formule.
:::

:::prompt Prompt 2.7
Ma formule `=RECHERCHEV(A2;Tarifs!A:B;2;FAUX)` donne #N/A alors que le code P03 existe bien dans la feuille Tarifs. J'utilise Excel 2016 en français. Pourquoi, et que dois-je changer ? Réponds en 6 lignes maximum.
:::

:::resultat Réponse réelle de ChatGPT (gpt-5-mini) | mono
Le #N/A vient très souvent d’un décalage de format ou de caractères invisibles (espaces, espace insécable CHAR(160), texte vs nombre) entre A2 et la colonne Tarifs!A.
Essayez d’abord : =RECHERCHEV(SUPPRESPACE(A2);Tarifs!A:B;2;FAUX) pour enlever les espaces.
Si ça persiste (espaces insécables), utilisez : =RECHERCHEV(SUBSTITUE(A2;CAR(160);"");Tarifs!A:B;2;FAUX).
Vérifiez aussi que les deux cellules sont du même type (texte vs nombre) avec =ESTTEXTE / =ESTNUM.
:::

L'IA liste des pistes, sans savoir laquelle est la bonne. C'est à toi de les essayer dans l'ordre. Nous avons collé la première :

:::capture ../../preuves/sortie/recherchev-na-corrige/capture.png | Capture réelle : la première correction de l'IA suffit.
1: 47,9 h4 | SUPPRESPACE retire l'espace en trop avant la recherche.
2: 60,67 d4 | P03 : 7 500. L'erreur a disparu.
3: 59,87 d4 | P01 : 500, toujours bon.
:::

La cause : A2 contient « P03 » suivi d'une espace invisible. Tu peux le prouver : `=NBCAR(A2)` donne 4 dans notre tableau, au lieu de 3. Sur sa page RECHERCHEV, Microsoft prévient qu'une « espace de fin » peut fausser le résultat et conseille SUPPRESPACE.

:::erreur
Envoyé une première fois à gpt-5-mini, le même message a donné `TRIM(SUBSTITUE(A2;CAR(160);""))` dans la formule. TRIM est le nom anglais de SUPPRESPACE : le tableur refuse la formule (Err:511 dans LibreOffice). Sur nos trois essais avec ce modèle, un seul a mélangé les langues.
:::

:::erreur
gpt-4o-mini a répondu `=SUPPRESPACE(A2)` seul : un morceau, pas la formule complète. Dans un premier essai, il a aussi demandé de vérifier que la valeur est « exactement identique (majuscules/minuscules) ». C'est faux : nous avons cherché « p03 » en minuscules, et RECHERCHEV a trouvé 7 500. Dans un second essai, le même modèle le dit juste.
:::

:::astuce
Si SUPPRESPACE ne suffit pas, le code contient peut-être une espace insécable, courante sur les pages web. Microsoft précise que SUPPRESPACE ne la retire pas, et nous l'avons vérifié : l'erreur reste. Dans notre tableur, la formule à CAR(160) de l'IA ne la retirait pas non plus. Teste-la sur ton fichier avant de t'y fier.
:::

:::recap
- Décris tes colonnes et la plage de lignes : l'IA écrit la bonne plage.
- Vérifie le résultat de tête : une IA peut donner une formule fausse, sans aucune erreur affichée.
- Pour un SI, teste une ligne « oui » et une ligne « non ».
- Deux conditions : SOMME.SI.ENS, avec la plage à additionner en premier.
- Un prix TTC : ARRONDI, avec un taux de TVA vérifié.
- Un #N/A alors que le code existe : cherche une espace en trop (NBCAR), puis essaie SUPPRESPACE.
:::

:::exercice Avec tes chiffres
Prends une liste de ventes ou de dépenses à toi. Demande à l'IA le total pour une personne et une catégorie, puis le plus gros montant et la moyenne. Colle les formules et vérifie chaque résultat de tête.
:::
