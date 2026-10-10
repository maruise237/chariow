# Direction artistique des e-books KAMTECH

Ce document explique **pourquoi** la charte est construite ainsi, et **comment choisir** une mise en page pour un nouveau produit ou une nouvelle situation. Le code (`moteur.js`, `da.js`, `visuels.js`) applique ces règles.

## 1. Ce qu'on garde du modèle Chariow, et ce qu'on laisse

Le PDF Chariow est un **catalogue de modèles Canva**, pas un e-book qu'on lit. On n'en recopie donc pas la structure.

On garde :
- la page « usage strictement personnel » au début ;
- la page « à propos de l'auteur » en bande de couleur ;
- la 4e de couverture sobre avec le logo ;
- le format portrait 4:5 ;
- le grand titre serif sur aplat.

On laisse :
- la mise en page « fiche produit » répétée à l'identique ;
- les textes de remplissage ;
- un seul style pour tous les produits.

## 2. Ce que dit la recherche (octobre 2026)

| Constat | Source | Ce qu'on en fait |
|---|---|---|
| Une couverture se juge en vignette : la tester à environ 200 px de large. | [Krumzi](https://www.krumzi.com/blog/how-to-design-an-ebook), [Subscription Insider](https://www.subscriptioninsider.com/article-type/news/why-publishers-should-design-for-the-thumbnail-instead-of-just-squishing-regular-cover-art) | Le moteur produit une miniature de 200 px à chaque rendu. On la regarde avant de publier. |
| Les mockups 3D se réduisent mal en vignette. Ils servent pour la pub, pas pour la boutique. | [Goodreads](https://www.goodreads.com/author_blog_posts/15442401-creating-an-ebook-and-paperback-box-set-part-2), [MediaModifier](https://mediamodifier.com/blog/ebook-mockup-generator-guide-templates) | Couverture plate dans le PDF et sur la boutique. Le mockup 3D est réservé aux pubs. |
| Sur téléphone, le texte doit faire au moins 16 px à l'écran, avec 40 à 60 caractères par ligne. | [OneNine](https://onenine.com/10-mobile-typography-tips-for-better-readability/), [Commission européenne](https://ec.europa.eu/component-library/v4.11.2/ec/guidelines/typography/) | Voir section 4. Notre première version affichait du texte d'environ 10 px : corrigé. |
| Un PDF est une page fixe, et le zoom coupe la lecture. | [MobileRead](https://wiki.mobileread.com/wiki/PDF) | La page a les proportions d'un écran de téléphone. On ne fait jamais de deux colonnes de texte. |
| Une collection se reconnaît à un dispositif constant, avec une couleur et un motif qui changent (O'Reilly : même gabarit, un animal par livre). | [O'Reilly](https://oreilly.com/ideas/a-short-history-of-the-oreilly-animals), [TheBookDesigner](https://www.thebookdesigner.com/consistency-in-book-series-design/) | Trois couches : marque constante, DA par produit, gabarits par contenu (section 3). |
| Structure efficace : 6 à 8 gabarits de pages, une page « feature » par chapitre, une respiration toutes les 4 à 6 pages, et chaque chapitre en intro, contenu, récap. | [Krumzi](https://www.krumzi.com/blog/how-to-design-an-ebook), [Webstacks](https://www.webstacks.com/blog/ebook-design-template-and-best-practices) | Blocs `:::chiffre`, `:::pause` et `:::recap`. Le moteur alerte s'il manque un récap. |
| Le fichier doit peser moins de 10 Mo pour un téléchargement rapide sur réseau mobile. | Krumzi | Pas de photo pleine page. Les visuels sont en HTML ou vectoriels : nos PDF font moins de 1 Mo. |

Limite : aucune étude publique ne porte sur le style des e-books vendus en Afrique francophone. Notre hypothèse, à vérifier avec `veille/`, est que les couvertures concurrentes sont chargées (texte dense, photos de stock). Une couverture sobre et très lisible devrait donc ressortir.

## 3. Le système en trois couches

### Couche 1 : la marque KAMTECH (ne change jamais)
- Le logo KAMTECH (provisoire, en texte, à remplacer par le vrai logo).
- Les polices communes (section 5) : Literata pour lire, Hanken Grotesk pour les outils, JetBrains Mono pour les formules. Elles donnent la « voix » commune aux e-books.
- La **forme** des encadrés de la méthode : prompt à copier, résultat attendu, erreur fréquente, astuce, à retenir, à toi de jouer. Un lecteur qui a acheté Excel reconnaît la méthode dans Comptable 2.0.
- Les pages licence, auteur et 4e de couverture.
- Le format de page et les règles de lisibilité.

### Couche 2 : la direction artistique (DA), choisie par produit
On choisit la DA avec 4 questions :

| Question | Réponse A | Réponse B |
|---|---|---|
| Qui lit ? | Pro, expert | Grand public |
| À quel prix ? | Premium (4 000 F et plus) | Petit prix (moins de 2 000 F) |
| Comment ? | Livre de référence, relu | Action immédiate, une fois |
| Sur quoi ? | PC et téléphone | Téléphone seulement |

| DA | Pour qui | Titres | Couverture | Ouvertures | Corps | Motif | Produits |
|---|---|---|---|---|---|---|---|
| **Cabinet** | Pros, premium, référence | Zodiak (serif éditorial, Fontshare) | Scène : l'écriture au journal SYSCOHADA, annotée | Scindée (colonne + texte) | 15,5 pt | Filets fins | Comptable 2.0 |
| **Atelier** | Apprenants motivés, outil | Cabinet Grotesk (grotesque à caractère, Fontshare) | Scène : réplique d'Excel avec repères numérotés | Pleine page / panneau en alternance | 17 pt | Grille de tableur | Excel avec l'IA |
| **Marché** | Grand public, petit prix, téléphone | Bricolage Grotesque (chaleureux) | Scène : le ticket « bilan du jour » | Panneau / pleine page | 18 pt | Losanges façon pagne, discrets | Comptes de boutique |
| **Studio** | Créatifs, vidéo, réseaux | Supreme (Fontshare) | Typographique sur fond sombre | Pleine page | 17 pt | Grille | Futur e-book montage vidéo |

Pourquoi la police des titres change alors que la recherche conseille de la garder constante :
- Nos trois publics sont trop éloignés pour un même ton : un comptable qui paie 4 900 F n'achète pas sur les mêmes signaux qu'un commerçant à 1 500 F.
- La cohérence de la collection passe donc par la couche 1 : logo, encadrés de la méthode, police du texte et structure.

Pour ajouter une DA (par exemple pour un public étudiant), on ajoute une entrée dans `da.js`. Le reste suit.

### Couche 3 : les gabarits, choisis selon le contenu
On n'écrit pas « page 12 = gabarit B ». On écrit le contenu avec des blocs, et le moteur choisit la mise en page :

| Bloc dans la source | Quand l'utiliser | Rendu |
|---|---|---|
| `:::chapitre` | Début de chapitre | Pleine page. La variante dépend de la DA et alterne pour le rythme. On peut l'imposer avec `variante:`. |
| `:::prompt` | Texte à copier dans l'IA | Encadré foncé, étiquette « À copier » |
| `:::resultat` | Ce que l'IA doit rendre (`\| mono` pour une formule) | Encadré bordé |
| `:::erreur` / `:::astuce` | Piège fréquent / raccourci | Encadrés rouge et clair |
| `:::avantapres` | Montrer le gain | Deux colonnes Avant / Avec l'IA |
| `:::chiffre` | Un nombre qui frappe | Grand chiffre entre deux filets (page « feature ») |
| `:::pause` | Respiration, toutes les 4 à 6 pages | Pleine page couleur accent, chiffre ou phrase |
| `:::checklist` | Contrôle à faire | Cases à cocher |
| `:::recap` | Fin de chapitre (obligatoire) | Bloc « À retenir » |
| `:::exercice` | Passage à l'action | Cadre pointillé « À toi de jouer » |
| Tableau `\| a \| b \|` | Comparer, écritures comptables | Tableau en-tête foncé |
| `> phrase` | Phrase-clé | Citation en police de titre |

## 4. Les règles chiffrées

1. **Format** : 148 × 185 mm (portrait 4:5, largeur A5). Affichée en entier sur un téléphone d'environ 400 px de large, la page est réduite à 0,72 environ.
2. **Corps du texte** (relevé le 10 octobre 2026, le texte était jugé trop petit sur téléphone) : 15,5 pt (Cabinet), 17 pt (Atelier et Studio), 18 pt (Marché), en Literata. Marges de page : 10 mm à gauche et à droite.
   - Le calcul : la page fait 148 mm = 559 px CSS. Un téléphone courant affiche environ 393 px de large, donc la page en pleine largeur est réduite à 393 / 559 = 0,70. Or 1 pt = 1,333 px. 17 pt donne 22,7 px × 0,70 = **16 px à l'écran**, la taille de texte par défaut des navigateurs mobiles. 15,5 pt donne 14,5 px et 18 pt donne 16,8 px.
   - On ne descend jamais sous 15,5 pt pour le texte courant.
3. **Paragraphes** : 60 mots au plus. Le moteur alerte au-delà de 75.
4. **Couverture** : 7 mots de titre au plus, un seul mot en couleur d'accent, lisible à 200 px (vérifier `*-miniature-200px-01.png`). Pas de badge au-dessus du titre, et les atouts tiennent sur une seule ligne de texte.
5. **Polices** : une police de titre par DA, plus les trois polices communes. Rien d'autre.
6. **Palette** : 5 couleurs par DA (primaire, foncé, accent, fond, papier), plus le rouge des erreurs, commun à tous.
7. **Chaque chapitre** : ouverture, contenu avec au moins un prompt, puis `:::recap`. Un `:::exercice` est conseillé.
8. **Rythme** : un `:::chiffre`, un `:::avantapres` ou un tableau par chapitre. Une `:::pause` toutes les 4 à 6 pages, placée **entre deux sections** et pas juste après un encadré, sinon la page précédente reste à moitié vide.
9. **Poids** : moins de 10 Mo. Pas de photo pleine page.
10. **Déclinaisons** : la même source produit le PDF, la vignette carrée (boutique Chariow, pubs) et la miniature de contrôle. Le mockup 3D reste réservé aux pubs.

## 5. Typographie

### Choix des polices
Source : recherche d'octobre 2026 (Typewolf, Butterick, Fontshare), avec les glyphes et les chiffres vérifiés dans chaque fichier.

| Rôle | Police | Pourquoi | Licence |
|---|---|---|---|
| Texte courant (toute la collection) | **Literata** | Dessinée pour Google Play Livres, donc pour lire sur Android. Grande hauteur d'x (0,507 em), vrai italique. Le serif donne un rendu « livre » et pas « template ». | OFL |
| Outils : tableaux, légendes, étiquettes, prompts | **Hanken Grotesk** | Sans-serif sobre à chiffres tabulaires, qui distingue « ce qu'on lit » de « ce qu'on utilise ». | OFL |
| Formules Excel | **JetBrains Mono** | Zéro barré, aucun caractère ambigu. | OFL |
| Titres Cabinet | **Zodiak** | Serif à contraste doux, autoritaire sans être froide. | ITF FFL |
| Titres Atelier | **Cabinet Grotesk** | Grotesque moderne avec du caractère, nette en gros corps. | ITF FFL |
| Titres Marché | **Bricolage Grotesque** | Expressive et chaleureuse, avec des chiffres tabulaires. | OFL |
| Titres Studio | **Supreme** | Display moderne pour les créatifs. | ITF FFL |

Écartées :
- Outfit : hauteur d'x basse, rondeurs fatigantes sur un long texte, « look template ».
- Inter, Poppins et Montserrat : vues partout.
- DM Serif Display et Space Grotesk : moins de caractère que les choix retenus.

Les fichiers de police ne sont **pas versionnés**. La licence Fontshare interdit de les redistribuer, mais autorise leur incorporation dans un PDF vendu. `polices.sh` les télécharge.

### Règles françaises appliquées automatiquement par le moteur
- Espace fine insécable avant ; ! ? et à l'intérieur des « ». Aucune de nos polices n'a le glyphe U+202F, donc le moteur le remplace par une insécable en corps réduit.
- Insécable avant les deux-points et entre un nombre et son unité (500 F, 25 min, 19,25 %).
- Apostrophe courbe ’ et points de suspension « … » en un seul caractère.
- Milliers séparés par une fine (596 250).
- Titres équilibrés : jamais un mot ou un point d'interrogation seul sur la dernière ligne.
- Césure française dans le texte courant, jamais dans les titres.
- Le code et les formules ne sont pas touchés.

## 6. Anti-slop : ce qu'on s'interdit

Le « slop » est l'esthétique par défaut des outils IA et des templates (source : [impeccable.style/slop](https://impeccable.style/slop)). Remplacer une couleur par une autre ne suffit pas : il faut une raison à chaque élément.

| Interdit | Remplacé par |
|---|---|
| Halos et dégradés radiaux | Aplats de couleur |
| Cartes penchées avec grosse ombre | Objets posés à plat, avec un filet fin |
| Bulles de chat « TOI / L'IA » | Répliques fidèles d'interface avec repères numérotés |
| Pastilles arrondies à coche (« 100 prompts ✓ ») | Une ligne de texte, séparateurs « / » |
| Badge ou petit label au-dessus du titre | Le titre seul. Le numéro de chapitre, plein, sert d'étiquette. |
| Numéros géants en contour | Numéros pleins dans la police de titre |
| Tableaux à en-tête plein et grille | Filets horizontaux fins (section 7) |
| Formules « pas X, mais Y », phrases-slogans, gras décoratif | Phrases concrètes, avec les vrais chiffres (passage au skill humanizer) |

## 7. Tableaux et illustrations

### Tableaux
D'après [Butterick](https://practicaltypography.com/tables.html) et [Matthew Strom](https://matthewstrom.com/writing/tables).

1. Pas de grille, seulement des filets horizontaux fins. L'en-tête est en petites capitales, avec un filet foncé dessous.
2. Les colonnes de montants sont détectées automatiquement et alignées à droite, en chiffres tabulaires.
3. La ligne « Total » ou « Totaux » est détectée et passe en gras sous un filet.
4. L'unité va dans l'en-tête (« Total FCFA ») et n'est pas répétée dans chaque cellule.
5. Sur téléphone, 4 colonnes au plus. Au-delà, on découpe ou on passe à une liste.
6. En comptabilité, on utilise la présentation journal (`:::visuel journal`) : comptes crédités décalés, totaux débit = crédit sous filet, libellé en italique sous l'écriture.

### Illustrations
1. Un visuel montre un **objet réel du lecteur** : le tableur Excel, le journal comptable, le ticket du jour. Pas de décor.
2. **Réplique fidèle ou schéma franc**, jamais une imitation approximative. La réplique d'Excel reprend les couleurs, la zone de nom, la barre de formule et la cellule active de la version française.
3. Les explications passent par des **repères numérotés** reliés à une légende : 5 au plus, une seule couleur.
4. Style par e-book :
   - Excel : interface réelle annotée ;
   - Comptable 2.0 : typographie et documents comptables fidèles ;
   - Comptes de boutique : objets du quotidien (ticket, cahier), plus un motif géométrique discret façon pagne, en accent seulement.
5. **Personnages** : la bibliothèque [Open Peeps](https://www.openpeeps.com/) de Pablo Stanley, sous licence CC0 (usage commercial libre, sans attribution), rendue en SVG par `illustrations/generer.js`. C'est la seule bibliothèque vérifiée qui soit à la fois libre de droits et dans le style choisi : trait noir, aplat d'une seule couleur. Les coiffures (afro, twists, bantu knots, nattes, hijab) servent à représenter nos lecteurs.
   - **Dosage** : une illustration par ouverture de chapitre au plus, aucune dans les pages techniques (formules, écritures). Une image décorative est ignorée, alors qu'une image qui montre quelque chose est regardée (Nielsen Norman Group, [Photos as Web Content](https://www.nngroup.com/articles/photos-as-web-content/)). Le GOV.UK Design System, lui, dit : « n'utiliser une image que s'il y a un vrai besoin » ([Images](https://design-system.service.gov.uk/styles/images)).
   - **Trait noir** : jamais sur un fond foncé. Le moteur passe l'ouverture en « panneau » (haut clair) quand le chapitre a une illustration.
6. **Captures annotées** (`:::capture`) : une vraie capture, avec 5 repères numérotés au plus, des flèches d'une seule couleur (le rouge de la marque) et une explication d'une ligne par repère sous l'image.
7. Images générées par IA : pas utilisées pour l'instant. Toute image Gemini porte un filigrane invisible SynthID, et une image purement générée n'est pas protégeable par le droit d'auteur (avis du Copyright Office américain, 2025).

### Preuves
Rien n'est inventé. Chaque prompt est envoyé à ChatGPT avant publication, avec la réponse brute archivée dans `produits/preuves/tests-ia.md`. Chaque formule est calculée dans un vrai tableur (LibreOffice Calc en français) par `produits/preuves/tableur.py`, qui fournit aussi les captures. Une réponse d'IA citée dans le livre est toujours une vraie réponse, avec le nom du modèle et la date.

### Pages
Pas de page sans contenu utile :
- les droits d'usage tiennent en 3 lignes au bas du sommaire ;
- « à propos » et l'adresse de la boutique vont sur la dernière page ;
- pas de sommaire s'il n'y a pas de chapitre.

## 8. Ce qui reste à décider ou à tester
- Le vrai logo KAMTECH et ses couleurs : la couche 1 est prête à les recevoir dans `da.js`, via `MARQUE`.
- Tester les 3 PDF sur 2 ou 3 téléphones Android réels (dont un bas de gamme) : le calcul des tailles reste théorique tant que ce n'est pas fait.
- A/B test en pub : couverture plate ou mockup 3D.
