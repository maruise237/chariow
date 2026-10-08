# Veille pubs : notre AdsMetrik maison

Repère les produits digitaux qui se vendent en Afrique francophone en espionnant la bibliothèque publicitaire Meta, puis lit les vraies ventes sur les pages Chariow des concurrents.

| Étape | Commande | Résultat |
|---|---|---|
| 1. Collecter les pubs | `SCRAPECREATORS_API_KEY=... node veille/collect.mjs --query mychariow --countries CM,CI,SN,BJ --pages 3` | `data/raw/*.json` |
| 2. Analyser | `node veille/analyze.mjs` | `RAPPORT.md`, `data/produits.csv`, `data/pubs.json` |
| 3. Lire les pages de vente | `node veille/enrich.cjs` | `data/pages.json` (achats, avis, prix, compte à rebours) |
| 4. Relancer l'analyse | `node veille/analyze.mjs` | rapport avec les ventes intégrées au score |

- Clé ScrapeCreators : 100 crédits offerts à l'inscription, 1 crédit par page de 10 à 30 pubs.
- `--query` accepte n'importe quel mot-clé (`ebook`, `formation`, `selar`, `systeme.io`…). `mychariow` trouve les concurrents qui vendent sur Chariow.
- `enrich.cjs` a besoin de Playwright (`PLAYWRIGHT_MODULE=$(npm root -g)/playwright` si installé globalement). Les prix sont convertis depuis le $US avec `USD_XAF` (570 par défaut), ils sont donc approximatifs.
- Score = jours de diffusion (max 120) + 15 × variantes + 10 × pays + achats ÷ 5 (max 200).

La stratégie produits tirée de la première collecte est dans `STRATEGIE.md`.

## Tableau de bord : Radar KAMTECH

https://claude.ai/artifact/CeyiakYhTfLpacMDQPjfjc (source : `veille/radar.html`)

- Chaque collecte devient un document `scans/<date>` (contenu de `data/scan.json`, écrit par `analyze.mjs`). Les anciens scans restent consultables ; les produits apparus depuis le scan précédent sont marqués « nouveau ».
- Les statuts posés sur les produits concurrents (`suivi/`) et le plan produits (`plan/`) sont modifiés depuis la page et survivent aux mises à jour.
