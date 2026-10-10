"""Journal de ventes d'octobre 2026 (données fictives mais réalistes) pour le chapitre 04.
Déterministe : même graine, mêmes lignes."""
import random, datetime

PRODUITS = {"Savon": 500, "Huile 1 L": 1500, "Riz 5 kg": 4000, "Sucre 1 kg": 800, "Lait en poudre": 2500}
VENDEURS = ["Awa", "Boris", "Carine"]
PAIEMENTS = ["Espèces", "Orange Money", "MTN MoMo"]

def journal():
    r = random.Random(2610)
    jours = list(range(1, 31)) + [r.randint(1, 30) for _ in range(6)]
    jours.sort()
    poids_prod = [30, 22, 16, 20, 12]
    lignes = []
    for j in jours:
        p = r.choices(list(PRODUITS), weights=poids_prod)[0]
        q = r.choice([1, 2, 2, 3, 4, 5, 6]) if p in ("Savon", "Sucre 1 kg") else r.choice([1, 1, 2, 2, 3])
        v = r.choice(VENDEURS)
        m = r.choices(PAIEMENTS, weights=[40, 35, 25])[0]
        lignes.append((datetime.date(2026, 10, j), p, v, q, q * PRODUITS[p], m))
    return lignes

if __name__ == "__main__":
    from collections import defaultdict
    L = journal()
    print(len(L))
    for l in L: print(l)
    for k, idx in (("prod",1),("vend",2),("pay",5)):
        d = defaultdict(int); n=defaultdict(int)
        for l in L: d[l[idx]] += l[4]; n[l[idx]] += l[3]
        print(k, dict(d), sum(d.values()), dict(n))
