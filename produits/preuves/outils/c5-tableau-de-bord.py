#!/usr/bin/env python3
"""Chapitre 5 : construit le tableau de bord mensuel (boutique de hijabs) dans
LibreOffice Calc en français, applique une mise en forme conditionnelle
(propriété ConditionalFormat, Python-UNO), enregistre le .xlsx et fait la capture.

Usage (depuis /home/user/chariow) :
    python3 produits/preuves/outils/c5-tableau-de-bord.py

Sorties dans produits/preuves/sortie/c5-tableau-de-bord/ :
    c5-tableau-de-bord.xlsx, resultat.json, capture.png
Variante : argument "sans-mfc" pour faire la capture sans mise en forme conditionnelle
(sortie c5-tableau-de-bord-sans-mfc).
"""
import json
import os
import shutil
import sys
import tempfile
import time

AICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(AICI))
import tableur as T  # noqa: E402  (outil commun, non modifié)

SANS = len(sys.argv) > 1 and sys.argv[1] == "sans-mfc"
CID = "c5-tableau-de-bord" + ("-sans-mfc" if SANS else "")

VENTES = [  # Mois, Article, Montant, Moyen
    ("Septembre", "Hijab coton", 8000, "Espèces"), ("Septembre", "Hijab soie", 12000, "Orange Money"),
    ("Septembre", "Voile jersey", 5000, "MTN MoMo"), ("Septembre", "Hijab coton", 8000, "Espèces"),
    ("Septembre", "Écharpe", 10000, "Espèces"), ("Septembre", "Hijab soie", 12000, "Orange Money"),
    ("Septembre", "Voile jersey", 5000, "Espèces"), ("Septembre", "Hijab coton", 8000, "MTN MoMo"),
    ("Septembre", "Bonnet", 5000, "Espèces"), ("Septembre", "Hijab soie", 12000, "MTN MoMo"),
    ("Octobre", "Hijab soie", 12000, "Orange Money"), ("Octobre", "Hijab coton", 8000, "Espèces"),
    ("Octobre", "Voile jersey", 5000, "MTN MoMo"), ("Octobre", "Hijab soie", 12000, "Orange Money"),
    ("Octobre", "Hijab coton", 8000, "Espèces"), ("Octobre", "Écharpe", 10000, "MTN MoMo"),
    ("Octobre", "Hijab soie", 12000, "Espèces"), ("Octobre", "Hijab coton", 8000, "Orange Money"),
    ("Octobre", "Voile jersey", 5000, "Espèces"), ("Octobre", "Hijab luxe", 25000, "MTN MoMo"),
    ("Octobre", "Hijab soie", 12000, "Orange Money"), ("Octobre", "Hijab coton", 8000, "Espèces"),
    ("Octobre", "Bonnet", 5000, "Espèces"),
]
DEPENSES = [
    ("Septembre", "Tissu", 55000), ("Septembre", "Loyer", 20000), ("Septembre", "Transport", 8000),
    ("Septembre", "Publicité Facebook", 7000), ("Septembre", "Emballages", 5000),
    ("Octobre", "Tissu", 60000), ("Octobre", "Loyer", 20000), ("Octobre", "Transport", 6000),
    ("Octobre", "Crédit téléphone", 4000), ("Octobre", "Emballages", 6000),
]
V = "Ventes!$A$2:$A$40", "Ventes!$C$2:$C$40", "Ventes!$D$2:$D$40"
D = "Dépenses!$A$2:$A$40", "Dépenses!$C$2:$C$40"


def formules():
    f = {}
    for col in "BC":
        f[col + "2"] = "=SOMME.SI(%s;%s$1;%s)" % (V[0], col, V[1])
        f[col + "3"] = "=SOMME.SI(%s;%s$1;%s)" % (D[0], col, D[1])
        f[col + "4"] = "=%s2-%s3" % (col, col)
        for i, moyen in ((5, "Espèces"), (6, "Orange Money"), (7, "MTN MoMo")):
            f[col + str(i)] = ('=SI(%s$2=0;0;SOMME.SI.ENS(%s;%s;%s$1;%s;"%s")/%s$2)'
                               % (col, V[1], V[0], col, V[2], moyen, col))
    f["D2"] = '=SIERREUR((B2-C2)/C2;"")'
    f["D3"] = '=SIERREUR((B3-C3)/C3;"")'
    f["D4"] = '=SIERREUR((B4-C4)/ABS(C4);"")'
    return f


def style(doc, nom, fond, texte):
    st = doc.createInstance("com.sun.star.style.CellStyle")
    doc.StyleFamilies.getByName("CellStyles").insertByName(nom, st)
    st.CellBackColor = fond
    st.CharColor = texte
    st.CharWeight = 150.0
    return st


def mise_en_forme_conditionnelle(doc, feuille):
    from com.sun.star.sheet.ConditionOperator import LESS, GREATER_EQUAL
    style(doc, "KT_Rouge", 0xF8C9C9, 0x9B1C1C)
    style(doc, "KT_Vert", 0xCDEBD3, 0x1B6B34)
    # Bénéfice négatif en rouge : B4:C4, condition « valeur < 0 »
    plage = feuille.getCellRangeByName("B4:C4")
    ent = plage.ConditionalFormat
    ent.addNew((T.pv("Operator", LESS), T.pv("Formula1", "0"), T.pv("StyleName", "KT_Rouge")))
    plage.ConditionalFormat = ent
    # Objectif atteint en vert : B2:C2, condition « valeur >= $E$2 »
    plage = feuille.getCellRangeByName("B2:C2")
    ent = plage.ConditionalFormat
    ent.addNew((T.pv("Operator", GREATER_EQUAL), T.pv("Formula1", "$E$2"), T.pv("StyleName", "KT_Vert")))
    plage.ConditionalFormat = ent


def construire(doc):
    from com.sun.star.lang import Locale
    S = doc.Sheets
    S.getByIndex(0).Name = "Ventes"
    S.insertNewByName("Dépenses", 1)
    S.insertNewByName("Tableau de bord", 2)
    v, d, t = S.getByName("Ventes"), S.getByName("Dépenses"), S.getByName("Tableau de bord")
    for c, h in enumerate(("Mois", "Article", "Montant", "Moyen")):
        v.getCellByPosition(c, 0).setString(h)
    for r, lig in enumerate(VENTES, 1):
        for c, x in enumerate(lig):
            cell = v.getCellByPosition(c, r)
            cell.setValue(x) if isinstance(x, int) else cell.setString(x)
    for c, h in enumerate(("Mois", "Libellé", "Montant")):
        d.getCellByPosition(c, 0).setString(h)
    for r, lig in enumerate(DEPENSES, 1):
        for c, x in enumerate(lig):
            cell = d.getCellByPosition(c, r)
            cell.setValue(x) if isinstance(x, int) else cell.setString(x)
    for c, h in enumerate(("Indicateur", "Octobre", "Septembre", "Évolution", "Objectif")):
        t.getCellByPosition(c, 0).setString(h)
    for r, nom in enumerate(("Ventes", "Dépenses", "Bénéfice", "Espèces", "Orange Money", "MTN MoMo"), 1):
        t.getCellByPosition(0, r).setString(nom)
    t.getCellRangeByName("E2").setValue(120000)
    for adr, fo in formules().items():
        t.getCellRangeByName(adr).setPropertyValue("FormulaLocal", fo)
    loc = Locale("fr", "FR", "")
    nf = doc.NumberFormats

    def fmt(plage, code):
        cle = nf.queryKey(code, loc, False)
        if cle == -1:
            cle = nf.addNew(code, loc)
        t.getCellRangeByName(plage).NumberFormat = cle
    fmt("B2:C4", "# ##0")
    fmt("E2", "# ##0")
    fmt("B5:C7", "0,0%")
    fmt("D2:D4", "0,0%")
    t.getCellRangeByName("A1:E1").CharWeight = 150.0
    if not SANS:
        mise_en_forme_conditionnelle(doc, t)
    return t


def main():
    sortie = os.path.join(T.DOSSIER_SORTIE, CID)
    os.makedirs(sortie, exist_ok=True)
    xvfb = T.demarrer_xvfb()
    tmp = tempfile.mkdtemp(prefix="kt-c5-")
    proc, port = T.lancer_calc(os.path.join(tmp, "profil"))
    try:
        ctx = T.se_connecter(port)
        T.syntaxe_excel(ctx)
        bureau = ctx.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
        doc = bureau.loadComponentFromURL("private:factory/scalc", "_blank", 0, ())
        t = construire(doc)
        doc.calculateAll()
        attendu = {"B2": 130000, "C2": 85000, "B3": 96000, "C3": 95000, "B4": 34000, "C4": -10000,
                   "B5": 46000 / 130000, "B6": 44000 / 130000, "B7": 40000 / 130000,
                   "D2": 45000 / 85000, "D4": 4.4}
        res, ok = [], True
        for adr in ("B2", "C2", "B3", "C3", "B4", "C4", "B5", "B6", "B7", "C5", "C6", "C7", "D2", "D3", "D4"):
            cell = t.getCellRangeByName(adr)
            val, err = T.lire_resultat(cell)
            att = attendu.get(adr)
            bon = (not err) and (att is None or T.egal(round(val, 6), round(att, 6)))
            ok &= bon
            res.append({"cellule": adr, "formule": cell.getPropertyValue("FormulaLocal"),
                        "valeur": val, "attendu": att, "ok": bon})
        # mise en forme conditionnelle relue dans le document
        mfc = []
        for adr in ("B4:C4", "B2:C2"):
            ent = t.getCellRangeByName(adr).ConditionalFormat
            for i in range(ent.Count):
                e = ent.getByIndex(i)
                mfc.append({"plage": adr, "operateur": str(e.Operator), "formule1": e.Formula1,
                            "style": e.StyleName})
        with open(os.path.join(sortie, "resultat.json"), "w", encoding="utf-8") as fh:
            json.dump({"id": CID, "ok": bool(ok), "resultats": res, "mise_en_forme_conditionnelle": mfc},
                      fh, ensure_ascii=False, indent=2)
        doc.storeToURL("file://" + os.path.join(sortie, CID + ".xlsx"),
                       (T.pv("FilterName", "Calc MS Excel 2007 XML"),))
        cas = {"id": CID, "largeurs": {"A": 12}, "largeurs_serrees": 40,
               "capture": {"feuille": "Tableau de bord", "plage": "A1:E7",
                           "cellule_active": "D4", "zoom": 140}}
        T.serrer_colonnes(doc, cas, 40)
        T.configurer_fenetre(doc, cas)
        time.sleep(4)
        brut = T.capturer(cas, None, tmp)
        print(T.recadrer(brut, os.path.join(sortie, "capture.png"), cas, doc))
        for r in res:
            print(r)
        print(mfc)
        doc.close(True)
        sys.exit(0 if ok else 1)
    finally:
        T.arreter(proc)
        shutil.rmtree(tmp, ignore_errors=True)
        xvfb.terminate()


main()
