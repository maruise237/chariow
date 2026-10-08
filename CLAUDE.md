# Bot Chariow — boutique KAMTECH

Automatisation du dashboard Chariow (app.chariow.com) par Playwright pour la boutique KAMTECH
(`store_icq378ahk7ls`, https://kamtech.mychariow.com). L'utilisateur parle français.

## Avant d'agir sur le dashboard
1. Lire `bot/JOURNAL.md` (section Leçons) puis la section utile de `bot/CARTE.md`. Ne pas réexplorer ce qui y est déjà.
2. Session : `bot/.session.json`. Si une commande répond `SESSION_EXPIREE`, lancer `node bot/login.cjs` en arrière-plan et demander à l'utilisateur son code 2FA (6 chiffres, valable 30 s) → l'écrire dans `bot/code.txt`.
3. Utiliser les commandes de `bot/cmd/` et les helpers de `bot/lib.cjs` ; écrire une nouvelle commande quand un parcours se répète.

## Après chaque découverte
- Nouvel écran / sélecteur / parcours → mettre à jour `bot/CARTE.md`.
- Erreur ou piège → ligne dans « Leçons » de `bot/JOURNAL.md` ; action faite → ligne dans « Historique ».
- Garder ces fichiers courts et factuels (ils sont relus à chaque session).

## Règles
- Toute action irréversible ou visible publiquement (suppression, nom d'URL, prix, publication, argent) : montrer ce qui sera fait et attendre la confirmation.
- Ne jamais versionner `.session.json`, `code.txt`, `captures/`, `.env`.
- Textes de vente : français, ton humain (skill humanizer), adaptés aux entrepreneurs d'Afrique francophone.
