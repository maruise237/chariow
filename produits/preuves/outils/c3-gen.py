"""Genere les cas du chapitre 3 (cas/c3-*.json).
Usage : python3 produits/preuves/outils/c3-gen.py   (depuis /home/user/chariow)
Les attendus viennent d'un modele Python independant (propre, tel), pas du tableur."""
import json, os, re

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "cas")
CLIENTS = [
    ("  aminatou  NJOYA ", "6 77 12 34 56"),
    ("BORIS tchoumi", 699887766),
    ("carine FOTSO", "+237699112233"),
    ("Aminatou Njoya", "+237677123456"),
    ("Esther  Nkou", "00237 655 44 33 22"),
    ("Joël  ATANGANA", "+33 6 12 34 56 78"),
    ("boris Tchoumi", "699 88 77 66"),
    ("Pauline ngo bassa", "677 12 34 5"),
    ("armand MBARGA", "(237) 691-234-567"),
    ("marie-claire EWANE", "237 670 55 66 77"),
    ("Hervé  KAMGA", "+237 6 99 00 11 22"),
    ("sandrine abena", "694 12 12 12"),
    ("FATIMA bello", "222 33 44 55"),
    ("Carine Fotso", 699112233),
    ("paul  EBODE", "651 20 30 40"),
]
N = len(CLIENTS)


def propre(s):
    s = " ".join(s.split()).lower()
    return re.sub(r"(^|[ \-'])(\w)", lambda m: m.group(1) + m.group(2).upper(), s)


def tel(v):
    s = str(v)
    d = re.sub(r"\D", "", s)
    if s.startswith("+") and not s.startswith("+237"):
        return "À vérifier"
    if d.startswith("00237"):
        d = d[5:]
    elif d.startswith("237") and len(d) == 12:
        d = d[3:]
    return "+237" + d if len(d) == 9 and d[0] == "6" else "À vérifier"


NOMS = [propre(a) for a, _ in CLIENTS]
TELS = [tel(b) for _, b in CLIENTS]
DOUBLONS = ["Doublon" if NOMS[i] in NOMS[:i] else "" for i in range(N)]
PRENOMS = [n.split(" ", 1)[0] for n in NOMS]
FAMILLES = [n.split(" ", 1)[1] for n in NOMS]

ENTETES = ["Client", "Téléphone", "Nom propre", "Numéro", "Doublon", "Prénom", "Nom"]

# valeurs OBSERVEES dans le tableur pour les formules fausses de l'IA (verifiees a la main)
OBS_4O = ["77123456", "99887766", "+237699112233", "+237677123456", "655443322", "33612345678", "99887766",
          "7712345", "237)691-234-567", "37670556677", "+237699001122", "94121212", "22334455", "99112233", "51203040"]
OBS_D4 = ["+237677123456", "+237699887766", "699112233", "677123456", "655443322", "À vérifier", "+237699887766",
          "+23767712345", "691234567", "670556677", "699001122", "+237694121212", "À vérifier", "+237699112233",
          "+237651203040"]

# formules de reference (reponses de l'IA, corrigees si besoin dans d'autres cas)
NOM_IA = "=NOMPROPRE(SUPPRESPACE(MINUSCULE(A{r})))"
DOUBLON_IA = '=SI(NB.SI($C$2:C{r};C{r})>1;"Doublon";"")'
PRENOM_IA = '=SIERREUR(GAUCHE(C{r};TROUVE(" ";C{r})-1);C{r})'
NOM2_IA = '=SIERREUR(DROITE(C{r};NBCAR(C{r})-TROUVE(" ";C{r}));"")'


ENTETES_TEL = ["Client", "Téléphone", "Chiffres", "Numéro"]
CHIFFRES = [re.sub(r"\D", "", str(b)) for _, b in CLIENTS]


def feuille(mode="liste"):
    """mode liste : A client, B tel, D numero propre colle en valeurs ; mode tel : A, B seulement."""
    if mode == "brut":
        rows = [["Client", "Doublon ?"]] + [[a, None] for a, _ in CLIENTS]
    elif mode == "tel":
        rows = [ENTETES_TEL] + [[a, b] for a, b in CLIENTS]
    else:
        rows = [ENTETES] + [[a, b, None, TELS[i]] for i, (a, b) in enumerate(CLIENTS)]
    return {"Clients": rows}


def formules(col, modele, attendus=None, feuille_nom="Clients", erreur=None):
    """attendus : valeurs attendues (ou observees, pour une formule fausse de l'IA) ; erreur : code d'erreur attendu."""
    out = []
    for i in range(N):
        r = i + 2
        d = {"feuille": feuille_nom, "cellule": "%s%d" % (col, r), "fr": modele.format(r=r)}
        if erreur is not None:
            d["attendu_erreur"] = erreur
        elif attendus is not None:
            d["attendu"] = attendus[i]
        out.append(d)
    return out


def ecrire(id, fl, cap, formats=None, mode="liste"):
    c = {"id": id, "feuilles": feuille(mode), "formules": fl, "capture": cap, "largeurs_serrees": 40}
    if formats:
        c["formats"] = formats
    with open(os.path.join(BASE, id + ".json"), "w", encoding="utf-8") as f:
        json.dump(c, f, ensure_ascii=False, indent=1)


def cap(plage, cell, zoom=165):
    return {"feuille": "Clients", "plage": plage, "cellule_active": cell, "zoom": zoom}


TEL_FIX = None  # rempli plus bas selon la reponse corrigee

if __name__ == "__main__":
    noms = formules("C", NOM_IA, NOMS)
    ecrire("c3-noms", noms, cap("A1:C7", "C2"))
    ecrire("c3-noms-proper", formules("C", "=PROPER(SUPPRESPACE(A{r}))", erreur="#NOM?"), cap("A1:C4", "C2"))

    # telephone, une seule formule : reponses brutes de l'IA (colonne D, feuille "tel")
    t5 = '="+237"&DROITE(SUBSTITUE(SUBSTITUE(SUBSTITUE(SUBSTITUE(SUBSTITUE(B{r};" ";"");"-";"");"(";"";")";"");"+";"");9)'
    t4 = ('=SI(GAUCHE(B{r};4)="+237";SUBSTITUE(B{r};" ";"");SI(GAUCHE(B{r};5)="00237";'
          'SUBSTITUE(DROITE(B{r};NBCAR(B{r})-5);" ";"");SUBSTITUE(DROITE(B{r};NBCAR(B{r})-1);" ";"")))')
    ecrire("c3-tel-gpt5", formules("D", t5, erreur="Err:504"), cap("A1:D7", "D2"), mode="tel")
    ecrire("c3-tel-gpt4o", formules("D", t4, OBS_4O), cap("A1:D7", "D2"), mode="tel")
    # deux etapes
    mid = '=CONCAT(SI(ESTNUM(VALEUR(MID(B{r};LIGNE(INDIRECT("1:"&NBCAR(B{r})));1)));MID(B{r};LIGNE(INDIRECT("1:"&NBCAR(B{r})));1);""))'
    ecrire("c3-tel-mid", formules("C", mid, [""] * N), cap("A1:D4", "C2"), mode="tel")
    chif = ('=SUBSTITUE(SUBSTITUE(SUBSTITUE(SUBSTITUE(SUBSTITUE(SUBSTITUE(SI(ESTNUM(B{r});TEXTE(B{r};"0");B{r});'
            '" ";"");"+";"");"-";"");".";"");"(";"");")";"")')
    d5 = ('=SI(ET(NBCAR(SI(GAUCHE(C{r};5)="00237";DROITE(C{r};NBCAR(C{r})-5);SI(GAUCHE(C{r};3)="237";DROITE(C{r};NBCAR(C{r})-3);C{r})))=9;'
          'GAUCHE(SI(GAUCHE(C{r};5)="00237";DROITE(C{r};NBCAR(C{r})-5);SI(GAUCHE(C{r};3)="237";DROITE(C{r};NBCAR(C{r})-3);C{r}));1)="6");'
          '"+237"&SI(GAUCHE(C{r};5)="00237";DROITE(C{r};NBCAR(C{r})-5);SI(GAUCHE(C{r};3)="237";DROITE(C{r};NBCAR(C{r})-3);C{r}));"À vérifier")')
    d4 = ('=SI(GAUCHE(C{r};2)="00";DROITE(C{r};9);SI(GAUCHE(C{r};3)="237";DROITE(C{r};9);SI(GAUCHE(C{r};1)="6";"+237"&C{r};"À vérifier")))')
    ch = formules("C", chif, CHIFFRES)
    ecrire("c3-tel", ch + formules("D", d5, TELS), cap("A1:D7", "D2"), mode="tel")
    ecrire("c3-tel-d4", ch + formules("D", d4, OBS_D4), cap("A1:D7", "D2"), mode="tel")
    base = formules("C", NOM_IA, NOMS)
    ecrire("c3-doublons", base + formules("E", DOUBLON_IA, DOUBLONS), cap("C1:E8", "E5"))
    spl = formules("F", PRENOM_IA, PRENOMS) + formules("G", NOM2_IA, FAMILLES)
    ecrire("c3-separer", base + spl, cap("C1:G7", "F2"))
    # doublons sur la colonne A brute : la meme formule de l'IA, pointee sur les noms non nettoyes
    brut = ['=SI(NB.SI($A$2:A{r};A{r})>1;"Doublon";"")']
    obs = ["" for _ in range(N)]
    obs[6] = "Doublon"   # boris Tchoumi : la casse est ignoree
    obs[13] = "Doublon"  # Carine Fotso : idem
    ecrire("c3-doublons-brut", formules("B", brut[0], obs), cap("A1:B8", "B5"), mode="brut")
    # separer avec CHERCHE (gpt-4o-mini) et avec la formule de la page Microsoft
    p4 = '=GAUCHE(C{r};CHERCHE(" ";C{r})-1)'
    n4 = '=DROITE(C{r};NBCAR(C{r})-CHERCHE(" ";C{r}))'
    ecrire("c3-separer-4o", base + formules("F", p4, PRENOMS) + formules("G", n4, FAMILLES), cap("C1:G7", "F2"))
    ms = '=GAUCHE(C{r};CHERCHE(" ";C{r};1))'
    ecrire("c3-separer-ms", base + formules("F", ms, [p + " " for p in PRENOMS]) + formules("G", "=NBCAR(F{r})", [len(p) + 1 for p in PRENOMS]),
           cap("C1:G7", "F2"))
