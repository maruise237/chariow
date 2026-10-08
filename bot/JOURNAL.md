# Journal du bot Chariow

Registre des actions faites, des erreurs et des leçons. Ajouter en haut, une ligne par fait.
Les leçons durables vont aussi dans CARTE.md.

## Leçons (à relire avant d'agir)

- Vérifier **quelle boutique** est ciblée avant toute action : le login ouvre digital-maket, le MCP lit esaystor, les commandes visent KAMTECH.
- Supprimer ou rendre définitif (nom d'URL, téléphone, suppression) → confirmation de l'utilisateur d'abord, inventaire montré.
- Menus Chariow = `[role=menuitem]` dans `#…-dropdown`, pas `[role=option]` (30 s perdues en timeout).
- `getByRole('button', {name: 'Create store'})` a échoué → `locator('button', {hasText})`.
- L'indicatif téléphonique reste sur US même quand le pays est Cameroun : le régler à part.
- Le logo s'envoie dès la sélection du fichier ; Save n'est pas nécessaire pour lui.
- La vitrine peut afficher l'ancien logo un moment (cache) : ne pas renvoyer le fichier en boucle.
- curl sur la vitrine → 500 (anti-bot). Utiliser Playwright pour vérifier.
- Media Gallery : cliquer la vignette, pas le nom du fichier (le nom ne sélectionne rien).
- Keywords SEO : l'espace crée une nouvelle étiquette ; préférer des mots seuls.
- Économie de contexte : `voir.cjs` / `cartographier.cjs` coupent la barre latérale et les boutons vides ; les dumps complets vont dans `bot/captures/` (non versionné), ne les lire que par `sed`/`grep` ciblés.

## Historique

- 2026-10-08 — Textes réécrits (skill humanizer) et enregistrés : description boutique (143/150), titre SEO, meta description, mots-clés, miniature SEO (`marque/logo-1200.png`). Logo visible dans le dashboard.
- 2026-10-08 — Logo KAMTECH (recréé en SVG d'après l'image envoyée, `marque/logo-carre.png`) envoyé ; vitrine encore en cache.
- 2026-10-08 — Cartographie complète : 54 pages → CARTE.md.
- 2026-10-08 — URL : nom `kamtech` (définitif) + extension `.com` → https://kamtech.mychariow.com (vérifiée, 200).
- 2026-10-08 — Boutique KAMTECH créée (`store_icq378ahk7ls`) : produits digitaux, Cameroun, FCFA, tél. +237 676634549.
- 2026-10-08 — Inventaire d'esaystor (7 produits, 1 remise, 2 workflows, 3 intégrations, 4 pages) ; rien supprimé, l'utilisateur a choisi de repartir sur une nouvelle boutique.
- 2026-10-08 — Login OK (2FA TOTP), session dans `bot/.session.json`.
