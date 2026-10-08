# Carte du dashboard Chariow

Référence pour agir sans réexplorer. Lire la section utile, pas tout le fichier.
Mettre à jour dès qu'on découvre un écran, un sélecteur ou un piège (voir JOURNAL.md).
Dernière cartographie complète : 2026-10-08 (54 pages, `node bot/cmd/cartographier.cjs`).

## Boutiques du compte

| Boutique | ID | URL publique | Rôle |
|---|---|---|---|
| **KAMTECH** | `store_icq378ahk7ls` | https://kamtech.mychariow.com | Boutique active (repart de zéro) |
| esaystor | `store_jpfdvorvvwhr` | https://esaysto.mychariow.shop | Ancienne, à vider plus tard |
| digital-maket | `store_bufmr4sbjdij` | https://ycnrtfmk.mychariow.shop | Ancienne, boutique ouverte par défaut après login |

- Le connecteur MCP de cette session lit **esaystor**, pas KAMTECH.
  MCP de KAMTECH : `https://mcp.chariow.com/public/?store=store_icq378ahk7ls` (page `automations/mcp`).
- `CHARIOW_STORE=<id>` change la boutique ciblée par les commandes (KAMTECH par défaut).

## Commandes (bot/cmd/)

| Commande | Rôle |
|---|---|
| `node bot/login.cjs` | Connexion ; 2FA → demander le code TOTP à l'utilisateur, l'écrire dans `bot/code.txt` |
| `node bot/cmd/voir.cjs <chemin> [capture]` | Texte + champs compacts d'une page, capture dans `bot/captures/` |
| `node bot/cmd/remplir.cjs <chemin> "Libellé=valeur" ... [--save]` | Remplit des champs par libellé ; sans `--save` = essai à blanc |
| `node bot/cmd/logo.cjs <png>` | Envoie le logo de la boutique |
| `node bot/cmd/cartographier.cjs [profondeur]` | Recartographie tout → `bot/captures/carte/*.txt` (non versionné) |

Helpers dans `bot/lib.cjs` : `open()`, `go()`, `text()`, `fields()`, `pickMenu()`, `btn()`, `shot()`, `storeUrl()`.

## Conventions de l'interface (Mantine, préfixe `chariow-`)

- **Menus déroulants** : bouton `#raiton-XX-target` (`aria-haspopup=menu`) → `#raiton-XX-dropdown`, avec un champ Search et des `[role=menuitem]`. Utiliser `pickMenu(page, '#…-target', 'Camer', /Cameroon/)`. Ce ne sont **pas** des `[role=option]`.
- Les IDs `raiton-rN` sont générés : stables pour un même parcours, mais fragiles. Préférer libellé (`getByLabel`) ou texte de bouton.
- **Choix en cartes** (type de produit, expérience…) : `button` contenant le texte + `input[type=checkbox]` caché. Cliquer le texte.
- **Modals** : `[role=dialog]` ; le bouton de validation est le dernier `button` du modal.
- **Enregistrement des formulaires** : `button[type=submit]` « Save » en bas ; toast « Changes saved successfully! 👍 ».
- `getByRole('button', {name})` échoue parfois (nom accessible différent) → utiliser `locator('button', {hasText})`.
- **Media Gallery** (images hors logo : miniature SEO, sans doute images produit) : clic sur la zone image → modal « Media Gallery » (Uploads, Badges & Icons, Canva, Pixabay, Unsplash). « Choose an image to upload » (2 boutons du même nom : prendre `button:visible` .first()) → filechooser → toast « Store asset created successfully. » → **cliquer la vignette** de l'image (pas son nom) : le modal se ferme et l'image est sélectionnée → Save. Les images envoyées restent dans `more/assets`. Max 2 Mo.
- Une `textarea` cachée de valeur `x` existe sur toutes les pages : l'ignorer.
- La vitrine publique renvoie **500 à curl** (anti-bot) : vérifier avec Playwright.

## Pages (chemin après `/stores/<id>/`)

### Principal
- `home` : tableau de bord, bouton « Add your first product ».
- `sales`, `customers`, `earnings` (versements), `analytics` (+ `/sales` `/visits` `/customers` `/conversion-rate`).
- `products` : liste. `products/create` : **choix du type** : Files, Courses, Licenses, Bundles, Coaching, Services, Community → « Next step ». *(Formulaire produit pas encore cartographié.)*

### Marketing (`marketing/…`)
`discounts`, `popups`, `makeups` (pages de vente), `snap` (widget de paiement externe), `proof` (widget avis), `banners`, `campaigns` (liens de suivi).

### Affiliation (`affiliation/…`)
`offers`, `affiliate`, `partnerships`, `analytics`.

### Automations (`automations/…`)
`integrations`, `workflows`, `tasks`, `pulses` (webhooks), `mcp` (URL du serveur MCP de la boutique).

### More (`more/…`)
`ratings`, `coaching-sessions`, `licenses`, `statements`, `exports` (Excel), `trophy`, `spotlights`, `assets` (images), `trash` (corbeille : produits, remises, variantes, partenariats — restaurables).

### Réglages (`settings/…`)
| Chemin | Contenu / champs |
|---|---|
| `general` | Logo (« Choose file » → `input[type=file]` caché ; **upload immédiat** via `POST api.chariow.com/core/stores/<id>/logo`), Store name, About your store * (**max 150 car.**), téléphone (ne peut plus être supprimé, seulement modifié), réseaux : Telegram, Instagram, Facebook, X, LinkedIn, TikTok, YouTube, Discord (`input[type=url]` par libellé). Zone « Archive Store » en bas. |
| `creator-profile` | Interrupteur « Enable Creator Profile ». |
| `appearance` | Mise en page produit : Feed / Oreo / Make ; Brand color (`input[type=color]`, défaut #ffcc00) ; polices titre/texte (search) ; coins Rounded/Square ; animation du bouton d'achat ; interrupteurs : produits mis en avant, bouton d'achat sur la carte, produits recommandés, catalogue d'affiliation ; produits 1 ou 2 par ligne ; ordre. Reset / Save. |
| `advanced` | **Domaine.** « Customize name » → modal, input `your-store` + « .mychariow.com » ; **IRRÉVERSIBLE**. « Change extension » → 3 étapes : choisir (.co .com .market .online .shop .store) → raison → « Confirm change » ; réversible, anciennes adresses conservées. « Connect your domain » (domaine perso, partenaire LWS -50 % code CHARIOW). |
| `pages` | About us, Privacy Policy, Legal notice, Terms of service (« Not set » au départ). |
| `seo` | Title, Description (par libellé, `remplir.cjs`). **Keywords** = étiquettes : taper puis Entrée ; **l'espace sépare aussi** (« formation IA » → 2 étiquettes). **Thumbnail** (carré ≥ 1200 px) → ouvre la **Media Gallery** (voir conventions). Bouton « Optimize SEO with AI ». Save désactivé tant que rien n'a changé. |
| `analytics` | Pixels : Facebook, GTM, TikTok, JS perso. |
| `notifications` | E-mail : achats, achats gratuits, nouveautés Chariow, avis ; Telegram. |
| `configurations` | Support email * (défaut maruise237@gmail.com), Support phone, WhatsApp support. |
| `teams` | Membres / invitations / activités. |
| `plan` | Plan Starter (commission 15 %). |
| `ownership-transfer`, `api-keys` (« Create API Key »). |

## Parcours documentés

### Créer une boutique (`/stores/create`, assistant en 4 étapes)
1. « I'm a beginner » / « I'm experienced » → Continue
2. « Digital products » / « Services » / « Unsure » → Continue
3. Store name * (`#raiton-rb`), Colors, About your store * (`#raiton-rc`, 150 car.) → Continue
4. Location (`pickMenu` sur `#raiton-re-target`), devise (`#raiton-rg-target`, se règle seule sur le pays), indicatif tél. (`#raiton-rj-target`, **US par défaut**), téléphone (`#raiton-ri`) → « Create store » → redirection `/stores/<nouvel-id>/home`.
Une URL aléatoire est attribuée (ex. `ioptahbh.mychariow.market`) → la personnaliser dans `settings/advanced`.

### Login
Voir `bot/login.cjs` : email sur app.chariow.com → Axa Zara (mot de passe) → 2FA TOTP (application d'authentification, code valable 30 s).
