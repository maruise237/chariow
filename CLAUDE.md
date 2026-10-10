# Règles de travail KAMTECH

## Répartition des modèles (économie de tokens)

La session principale **supervise** : elle comprend la demande, découpe le travail, décide, vérifie le résultat et répond à Mariuse. Elle ne fait pas elle-même le travail d'exécution léger : elle le confie à un sous-agent moins cher.

| Rôle | Modèle | Sous-agent | Pour quoi |
|---|---|---|---|
| Superviseur | celui de la session (Opus) | (session principale) | Stratégie, architecture, décisions, arbitrages, revue finale, réponse à l'utilisateur |
| Exécutant | Sonnet | `executant` | Écrire ou modifier du code selon un plan clair, rédiger des fiches produit, des textes de pub, des descriptions, lancer et corriger les scripts de `veille/`, mettre à jour le Radar |
| Éclaireur | Haiku | `eclaireur` | Chercher dans les fichiers, lire et résumer des données ou des pages, compter, lister, extraire, reformater, vérifications mécaniques |

### Règles

1. Avant chaque tâche, le superviseur la classe : **légère** (éclaireur), **standard** (exécutant) ou **lourde** (il la garde).
2. Est lourde seulement une tâche qui demande du jugement : choisir une stratégie, concevoir un système, arbitrer entre options, diagnostiquer un bug difficile, relire avant livraison.
3. Le superviseur donne au sous-agent un brief complet et autonome : objectif, fichiers concernés, contraintes, format de retour attendu. Le sous-agent ne voit pas la conversation.
4. Le superviseur vérifie toujours le résultat d'un sous-agent avant de le livrer (lire le diff, relancer le script, contrôler les chiffres).
5. Une action d'une seule commande (un `git status`, lire un petit fichier) reste dans la session principale : lancer un sous-agent coûterait plus cher que de la faire.
6. Les tâches indépendantes sont confiées en parallèle, en une seule fois.
7. En cas de doute entre deux niveaux, prendre le moins cher et remonter d'un niveau seulement si le résultat ne passe pas la vérification.

## Projet

- `veille/` : veille des pubs Meta des boutiques Chariow concurrentes (voir `veille/README.md`). Tableau de bord : Radar KAMTECH, https://claude.ai/artifact/CeyiakYhTfLpacMDQPjfjc
- `bot/` : connexion automatisée au dashboard Chariow.
- Boutiques Chariow du compte (3) :
  - **KAMTECH** (https://kamtech.mychariow.com) : la boutique des e-books KAMTECH, celle à utiliser par défaut ;
  - esaystor (https://esaysto.mychariow.shop) : c'est la seule que voient le connecteur MCP chariow et les clés API actuelles ;
  - digital-maket (https://ycnrtfmk.mychariow.shop).
- Devise XAF, marché Afrique francophone (Cameroun d'abord).
- Langue de travail : français.
