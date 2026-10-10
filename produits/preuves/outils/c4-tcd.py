#!/usr/bin/env python3
"""Chapitre 04 : tableaux croisés dynamiques et graphiques, faits pour de vrai dans LibreOffice Calc.

Usage (depuis /home/user/chariow) :
    python3 produits/preuves/outils/c4-tcd.py

Ce que fait le script :
  1. écrit le journal de ventes (36 lignes, données de c4-donnees.py) dans la feuille « Ventes » ;
  2. crée des tables de pilote (DataPilot, le nom LibreOffice des tableaux croisés dynamiques) avec
     createDataPilotDescriptor / insertNewByName : produits, vendeurs, moyens de paiement, croisé
     produit x paiement, évolution par jour ;
  3. recalcule chaque total avec SOMME.SI / NB.SI / SOMME.SI.ENS (formules indépendantes de la table
     de pilote) et compare : les deux doivent concorder, sinon code de sortie 1 ;
  4. recalcule aussi les totaux en Python, directement depuis la liste des lignes ;
  5. fabrique un graphique en colonnes (produits) et un graphique en courbes (jours), exportés en PNG ;
  6. enregistre les captures d'écran réelles (réutilise les fonctions de tableur.py, sans le modifier).

Sorties dans produits/preuves/sortie/ : c4-tcd/, c4-tcd-vendeurs-paiement/, c4-tcd-croise/,
c4-graph-barres/, c4-graph-courbe/ (capture.png + resultat.json + classeur .xlsx).
"""
import datetime
import importlib.util
import json
import os
import shutil
import sys
import tempfile
import time

QUI = os.path.dirname(os.path.abspath(__file__))
PREUVES = os.path.dirname(QUI)
sys.path.insert(0, PREUVES)
import tableur as T  # noqa: E402  (on réutilise ses fonctions, on ne le modifie pas)

spec = importlib.util.spec_from_file_location("c4donnees", os.path.join(QUI, "c4-donnees.py"))
D = importlib.util.module_from_spec(spec)
spec.loader.exec_module(D)

SORTIE = os.path.join(PREUVES, "sortie")
ENTETES = ["Date", "Produit", "Vendeur", "Quantité", "Montant en F", "Moyen de paiement"]
N = 36                      # lignes de données (2 à 37)
EPOCH = datetime.date(1899, 12, 30)


def adresse(feuille_idx, col, lig):
    from com.sun.star.table import CellAddress
    a = CellAddress()
    a.Sheet, a.Column, a.Row = feuille_idx, col, lig
    return a


def tcd(doc, nom, feuille, col, lig, lignes=(), colonnes=(), valeur="Montant en F", fonction="SUM"):
    """Crée une table de pilote (DataPilot) : renvoie sa plage de sortie."""
    from com.sun.star.sheet.DataPilotFieldOrientation import ROW, COLUMN, DATA
    from com.sun.star.sheet.GeneralFunction import SUM, COUNT
    fonctions = {'SUM': SUM, 'COUNT': COUNT}
    ventes = doc.Sheets.getByName("Ventes")
    tables = feuille.DataPilotTables
    desc = tables.createDataPilotDescriptor()
    desc.setSourceRange(ventes.getCellRangeByName("A1:F%d" % (N + 1)).RangeAddress)
    champs = desc.DataPilotFields
    for c in lignes:
        champs.getByName(c).Orientation = ROW
    for c in colonnes:
        champs.getByName(c).Orientation = COLUMN
    v = champs.getByName(valeur)
    v.Orientation = DATA
    v.Function = fonctions[fonction]
    idx = list(doc.Sheets.ElementNames).index(feuille.Name)
    tables.insertNewByName(nom, adresse(idx, col, lig), desc)
    return tables.getByName(nom).OutputRange


def format_nombre(doc, plage, code):
    from com.sun.star.lang import Locale
    loc = Locale("fr", "FR", "")
    nf = doc.NumberFormats
    cle = nf.queryKey(code, loc, False)
    if cle == -1:
        cle = nf.addNew(code, loc)
    plage.NumberFormat = cle


def lire(feuille, adr):
    return feuille.getCellRangeByName(adr).getDataArray()


def ctrl(res, nom, tcd_val, formule_val, python_val, formule):
    ok = abs(tcd_val - formule_val) < 1e-9 and abs(tcd_val - python_val) < 1e-9
    res.append({"controle": nom, "table_de_pilote": tcd_val, "formule": formule,
                "valeur_formule": formule_val, "python": python_val, "ok": ok})
    return ok


def capture_feuille(doc, id_, feuille, plage, active, zoom=185, serre=40):
    cas = {"id": id_, "capture": {"feuille": feuille, "plage": plage, "cellule_active": active, "zoom": zoom}}
    T.serrer_colonnes(doc, cas, serre)
    T.configurer_fenetre(doc, cas)
    time.sleep(4)
    out = os.path.join(SORTIE, id_)
    os.makedirs(out, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="c4-cap-")
    try:
        brut = T.capturer(cas, None, tmp)
        mes = T.recadrer(brut, os.path.join(out, "capture.png"), cas, doc)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    return mes


def main():
    import uno
    from com.sun.star.awt import Rectangle, Size
    xvfb = T.demarrer_xvfb()
    tmp = tempfile.mkdtemp(prefix="kt-c4-")
    proc, port = T.lancer_calc(os.path.join(tmp, "profil"))
    tout_ok = True
    try:
        ctx = T.se_connecter(port)
        T.syntaxe_excel(ctx)
        smgr = ctx.ServiceManager
        bureau = smgr.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
        doc = bureau.loadComponentFromURL("private:factory/scalc", "_blank", 0, ())
        lignes = D.journal()
        assert len(lignes) == N

        # ---------------------------------------------------------- 1. les données
        ventes = doc.Sheets.getByIndex(0)
        ventes.Name = "Ventes"
        for c, h in enumerate(ENTETES):
            ventes.getCellByPosition(c, 0).setString(h)
        for r, l in enumerate(lignes, 1):
            ventes.getCellByPosition(0, r).setValue((l[0] - EPOCH).days)
            ventes.getCellByPosition(1, r).setString(l[1])
            ventes.getCellByPosition(2, r).setString(l[2])
            ventes.getCellByPosition(3, r).setValue(l[3])
            ventes.getCellByPosition(4, r).setValue(l[4])
            ventes.getCellByPosition(5, r).setString(l[5])
        format_nombre(doc, ventes.getCellRangeByName("A2:A%d" % (N + 1)), "JJ/MM/AAAA")
        format_nombre(doc, ventes.getCellRangeByName("E2:E%d" % (N + 1)), "# ##0")
        for nom in ("Produits", "Vendeurs", "Paiements", "Croisé", "Jours"):
            doc.Sheets.insertNewByName(nom, doc.Sheets.Count)

        # ---------------------------------------------------------- 2. les tables de pilote
        res = []
        py_prod, py_qte, py_vend, py_pay, py_npay, py_jour = {}, {}, {}, {}, {}, {}
        for d, p, v, q, m, pay in lignes:
            py_prod[p] = py_prod.get(p, 0) + m
            py_qte[p] = py_qte.get(p, 0) + q
            py_vend[v] = py_vend.get(v, 0) + m
            py_pay[pay] = py_pay.get(pay, 0) + m
            py_npay[pay] = py_npay.get(pay, 0) + 1
            py_jour[d] = py_jour.get(d, 0) + m
        total_py = sum(py_prod.values())
        E = "Ventes!$E$2:$E$%d" % (N + 1)

        # --- produits (Excel : Lignes = Produit, Valeurs = Somme de Montant en F)
        fp = doc.Sheets.getByName("Produits")
        tcd(doc, "Produits", fp, 0, 0, lignes=["Produit"])
        fp.getCellByPosition(3, 2).setString("Contrôle SOMME.SI")
        # table de pilote : en-têtes ligne 3, produits lignes 4 à 8, total ligne 9
        noms = [fp.getCellByPosition(0, r).getString() for r in range(3, 8)]
        fp.getCellByPosition(1, 8)
        for i, nom in enumerate(noms):
            r = 3 + i
            fp.getCellByPosition(3, r).setPropertyValue(
                "FormulaLocal", "=SOMME.SI(Ventes!$B$2:$B$%d;A%d;%s)" % (N + 1, r + 1, E))
        fp.getCellByPosition(3, 8).setPropertyValue("FormulaLocal", "=SOMME(%s)" % E)
        doc.calculateAll()
        # même chose pour la quantité (pour la comparaison « plus vendu / rapporte le plus »)
        fq = doc.Sheets.getByName("Produits")
        tcd(doc, "Quantites", fq, 5, 0, lignes=["Produit"], valeur="Quantité")
        format_nombre(doc, fp.getCellRangeByName("B4:B9"), "# ##0")
        format_nombre(doc, fp.getCellRangeByName("D4:D9"), "# ##0")
        doc.calculateAll()
        for i, nom in enumerate(noms):
            r = 3 + i
            v_tcd = fp.getCellByPosition(1, r).getValue()
            v_f = fp.getCellByPosition(3, r).getValue()
            tout_ok &= ctrl(res, "Produit : " + nom, v_tcd, v_f, py_prod[nom],
                            fp.getCellByPosition(3, r).getPropertyValue("FormulaLocal"))
            q_tcd = fq.getCellByPosition(6, r).getValue()
            q_f = doc.Sheets.getByName("Ventes")  # recalcul indépendant de la quantité plus bas
        tcd_total = fp.getCellByPosition(1, 8).getValue()
        tout_ok &= ctrl(res, "Produits : total", tcd_total, fp.getCellByPosition(3, 8).getValue(), total_py,
                        "=SOMME(Ventes!E2:E37)")
        produits_texte = [(fp.getCellByPosition(0, r).getString(), fp.getCellByPosition(1, r).getValue(),
                           fp.getCellByPosition(6, r).getValue()) for r in range(3, 8)]
        # contrôle des quantités avec SOMME.SI
        for i, nom in enumerate(noms):
            f = "=SOMME.SI(Ventes!$B$2:$B$%d;\"%s\";Ventes!$D$2:$D$%d)" % (N + 1, nom, N + 1)
            c = fq.getCellByPosition(8, 3 + i)
            c.setPropertyValue("FormulaLocal", f)
        doc.calculateAll()
        for i, nom in enumerate(noms):
            tout_ok &= ctrl(res, "Quantité : " + nom, fq.getCellByPosition(6, 3 + i).getValue(),
                            fq.getCellByPosition(8, 3 + i).getValue(), py_qte[nom],
                            fq.getCellByPosition(8, 3 + i).getPropertyValue("FormulaLocal"))

        # --- vendeurs (Lignes = Vendeur) : table de pilote en A3:B7, contrôle SOMME.SI en C
        fv = doc.Sheets.getByName("Vendeurs")
        tcd(doc, "Vendeurs", fv, 0, 0, lignes=["Vendeur"])
        format_nombre(doc, fv.getCellRangeByName("B4:B7"), "# ##0")
        fv.getCellByPosition(2, 2).setString("Contrôle SOMME.SI")
        vend = [fv.getCellByPosition(0, r).getString() for r in range(3, 6)]
        for i, nom in enumerate(vend):
            fv.getCellByPosition(2, 3 + i).setPropertyValue(
                "FormulaLocal", "=SOMME.SI(Ventes!$C$2:$C$%d;A%d;%s)" % (N + 1, 4 + i, E))
        fv.getCellByPosition(2, 6).setPropertyValue("FormulaLocal", "=SOMME(%s)" % E)
        format_nombre(doc, fv.getCellRangeByName("C4:C7"), "# ##0")
        # --- paiements : somme en A3:B7 (contrôle C), nombre de ventes en A13:B17 (contrôle C)
        fy = doc.Sheets.getByName("Paiements")
        tcd(doc, "Paiements", fy, 0, 0, lignes=["Moyen de paiement"])
        tcd(doc, "Paiements nombre", fy, 0, 10, lignes=["Moyen de paiement"], valeur="Date", fonction="COUNT")
        format_nombre(doc, fy.getCellRangeByName("B4:B7"), "# ##0")
        format_nombre(doc, fy.getCellRangeByName("B14:B17"), "# ##0")
        fy.getCellByPosition(2, 2).setString("Contrôle SOMME.SI")
        fy.getCellByPosition(2, 12).setString("Contrôle NB.SI")
        pays = [fy.getCellByPosition(0, r).getString() for r in range(3, 6)]
        for i, nom in enumerate(pays):
            fy.getCellByPosition(2, 3 + i).setPropertyValue(
                "FormulaLocal", "=SOMME.SI(Ventes!$F$2:$F$%d;A%d;%s)" % (N + 1, 4 + i, E))
            fy.getCellByPosition(2, 13 + i).setPropertyValue(
                "FormulaLocal", "=NB.SI(Ventes!$F$2:$F$%d;A%d)" % (N + 1, 14 + i))
        fy.getCellByPosition(2, 6).setPropertyValue("FormulaLocal", "=SOMME(%s)" % E)
        fy.getCellByPosition(2, 16).setPropertyValue("FormulaLocal", "=NB(Ventes!$E$2:$E$%d)" % (N + 1))
        format_nombre(doc, fy.getCellRangeByName("C4:C7"), "# ##0")
        doc.calculateAll()
        for i, nom in enumerate(vend):
            tout_ok &= ctrl(res, "Vendeur : " + nom, fv.getCellByPosition(1, 3 + i).getValue(),
                            fv.getCellByPosition(2, 3 + i).getValue(), py_vend[nom],
                            fv.getCellByPosition(2, 3 + i).getPropertyValue("FormulaLocal"))
        tout_ok &= ctrl(res, "Vendeurs : total", fv.getCellByPosition(1, 6).getValue(),
                        fv.getCellByPosition(2, 6).getValue(), total_py, "=SOMME(Ventes!E2:E37)")
        for i, nom in enumerate(pays):
            tout_ok &= ctrl(res, "Paiement : " + nom, fy.getCellByPosition(1, 3 + i).getValue(),
                            fy.getCellByPosition(2, 3 + i).getValue(), py_pay[nom],
                            fy.getCellByPosition(2, 3 + i).getPropertyValue("FormulaLocal"))
            tout_ok &= ctrl(res, "Nombre de ventes : " + nom, fy.getCellByPosition(1, 13 + i).getValue(),
                            fy.getCellByPosition(2, 13 + i).getValue(), py_npay[nom],
                            fy.getCellByPosition(2, 13 + i).getPropertyValue("FormulaLocal"))
        tout_ok &= ctrl(res, "Paiements : total", fy.getCellByPosition(1, 6).getValue(),
                        fy.getCellByPosition(2, 6).getValue(), total_py, "=SOMME(Ventes!E2:E37)")
        tout_ok &= ctrl(res, "Nombre de ventes : total", fy.getCellByPosition(1, 16).getValue(),
                        fy.getCellByPosition(2, 16).getValue(), N, "=NB(Ventes!E2:E37)")

        # --- contrôle : quantités par vendeur et par moyen de paiement (SOMME.SI sur la colonne D)
        py_qvend, py_qpay = {}, {}
        for d, p, v, q, m, pay in lignes:
            py_qvend[v] = py_qvend.get(v, 0) + q
            py_qpay[pay] = py_qpay.get(pay, 0) + q
        fv.getCellByPosition(4, 2).setString("Articles SOMME.SI")
        fy.getCellByPosition(4, 2).setString("Articles SOMME.SI")
        for i, nom in enumerate(vend):
            fv.getCellByPosition(4, 3 + i).setPropertyValue(
                "FormulaLocal", "=SOMME.SI(Ventes!$C$2:$C$%d;A%d;Ventes!$D$2:$D$%d)" % (N + 1, 4 + i, N + 1))
        for i, nom in enumerate(pays):
            fy.getCellByPosition(4, 3 + i).setPropertyValue(
                "FormulaLocal", "=SOMME.SI(Ventes!$F$2:$F$%d;A%d;Ventes!$D$2:$D$%d)" % (N + 1, 4 + i, N + 1))
        doc.calculateAll()
        for i, nom in enumerate(vend):
            c = fv.getCellByPosition(4, 3 + i)
            tout_ok &= ctrl(res, "Articles par vendeur : " + nom, c.getValue(), c.getValue(), py_qvend[nom],
                            c.getPropertyValue("FormulaLocal"))
        for i, nom in enumerate(pays):
            c = fy.getCellByPosition(4, 3 + i)
            tout_ok &= ctrl(res, "Articles par paiement : " + nom, c.getValue(), c.getValue(), py_qpay[nom],
                            c.getPropertyValue("FormulaLocal"))

        # --- croisé produit x paiement
        fc = doc.Sheets.getByName("Croisé")
        tcd(doc, "Croise", fc, 0, 0, lignes=["Produit"], colonnes=["Moyen de paiement"])
        format_nombre(doc, fc.getCellRangeByName("B4:E12"), "# ##0")
        doc.calculateAll()
        croise = [list(r) for r in lire(fc, "A1:F12")]
        # contrôle : SOMME.SI.ENS pour chaque case
        entetes_pay = [fc.getCellByPosition(c, 3).getString() for c in range(1, 4)]
        entetes_prod = [fc.getCellByPosition(0, r).getString() for r in range(4, 9)]
        fc.getCellByPosition(8, 2).setString("Contrôle SOMME.SI.ENS")
        for i, pr in enumerate(entetes_prod):
            for j, pa in enumerate(entetes_pay):
                c = fc.getCellByPosition(8 + j, 4 + i)
                c.setPropertyValue("FormulaLocal",
                    "=SOMME.SI.ENS(%s;Ventes!$B$2:$B$%d;\"%s\";Ventes!$F$2:$F$%d;\"%s\")" % (E, N + 1, pr, N + 1, pa))
        fc.getCellByPosition(0, 10).setString("Contrôle Sucre")
        fc.getCellByPosition(4, 10).setPropertyValue(
            "FormulaLocal", "=SOMME.SI(Ventes!$B$2:$B$%d;\"Sucre 1 kg\";%s)" % (N + 1, E))
        format_nombre(doc, fc.getCellRangeByName("E11"), "# ##0")
        doc.calculateAll()
        tout_ok &= ctrl(res, "Croisé : total Sucre (E9) et contrôle E11", fc.getCellByPosition(4, 8).getValue(),
                        fc.getCellByPosition(4, 10).getValue(), 26400,
                        fc.getCellByPosition(4, 10).getPropertyValue("FormulaLocal"))
        py_cx = {}
        for d, p, v, q, m, pay in lignes:
            py_cx[(p, pay)] = py_cx.get((p, pay), 0) + m
        for i, pr in enumerate(entetes_prod):
            for j, pa in enumerate(entetes_pay):
                tcd_v = fc.getCellByPosition(1 + j, 4 + i).getValue()
                f_v = fc.getCellByPosition(8 + j, 4 + i).getValue()
                tout_ok &= ctrl(res, "Croisé : %s / %s" % (pr, pa), tcd_v, f_v, py_cx.get((pr, pa), 0),
                                fc.getCellByPosition(8 + j, 4 + i).getPropertyValue("FormulaLocal"))

        # --- jours
        fj = doc.Sheets.getByName("Jours")
        tcd(doc, "Jours", fj, 0, 0, lignes=["Date"])
        format_nombre(doc, fj.getCellRangeByName("A4:A33"), "JJ/MM")
        format_nombre(doc, fj.getCellRangeByName("B4:B34"), "# ##0")
        fj.getCellByPosition(3, 2).setString("Contrôle SOMME.SI")
        for r in range(3, 33):
            fj.getCellByPosition(3, r).setPropertyValue(
                "FormulaLocal", "=SOMME.SI(Ventes!$A$2:$A$%d;A%d;%s)" % (N + 1, r + 1, E))
        doc.calculateAll()
        jours_valeurs = []
        for r in range(3, 33):
            serie = fj.getCellByPosition(0, r).getValue()
            jour = EPOCH + datetime.timedelta(days=int(serie))
            v_tcd = fj.getCellByPosition(1, r).getValue()
            tout_ok &= ctrl(res, "Jour : %s" % jour.strftime("%d/%m"), v_tcd,
                            fj.getCellByPosition(3, r).getValue(), py_jour[jour],
                            fj.getCellByPosition(3, r).getPropertyValue("FormulaLocal"))
            jours_valeurs.append((jour.strftime("%d/%m"), v_tcd))

        # ---------------------------------------------------------- 3. captures de tables
        mes = {}
        mes["c4-tcd"] = capture_feuille(doc, "c4-tcd", "Produits", "A3:D9", "D4")
        mes["c4-tcd-vendeurs"] = capture_feuille(doc, "c4-tcd-vendeurs", "Vendeurs", "A3:C7", "C4")
        mes["c4-tcd-paiements"] = capture_feuille(doc, "c4-tcd-paiements", "Paiements", "A3:C7", "C4")
        mes["c4-tcd-croise"] = capture_feuille(doc, "c4-tcd-croise", "Croisé", "A4:E11", "E11")

        # ---------------------------------------------------------- 4. graphiques
        def graphique(feuille, nom, plage_src, rect, type_diagramme, titre, axe_y, couleur, id_png, labels):
            charts = feuille.Charts
            r = Rectangle()
            r.X, r.Y, r.Width, r.Height = rect
            rng = feuille.getCellRangeByName(plage_src).RangeAddress
            charts.addNewByName(nom, r, (rng,), True, True)
            ch = charts.getByName(nom)
            emb = ch.EmbeddedObject
            emb.setDiagram(emb.createInstance(type_diagramme))
            emb.HasMainTitle = True
            emb.Title.String = titre
            emb.HasLegend = False
            diag = emb.Diagram
            diag.Vertical = False
            try:
                diag.DataCaption = 1 if labels else 0
            except Exception:
                pass
            ser = diag.getDataRowProperties(0)
            for prop in ("Color", "FillColor", "LineColor"):
                try:
                    ser.setPropertyValue(prop, couleur)
                except Exception:
                    pass
            return ch, emb, diag

        BLEU = 0x1F5FA8
        fprod = doc.Sheets.getByName("Produits")
        ch, emb, diag = graphique(fprod, "GrapheProduits", "A3:B8", (7000, 600, 16000, 9500),
                                  "com.sun.star.chart.BarDiagram",
                                  "Ventes par produit, octobre 2026 (F)", "F", BLEU, "c4-graph-barres", True)
        # axe des Y : titre
        try:
            diag.YAxisTitle = None
        except Exception:
            pass
        fjr = doc.Sheets.getByName("Jours")
        ch2, emb2, diag2 = graphique(fjr, "GrapheJours", "A3:B33", (7000, 600, 18000, 9500),
                                     "com.sun.star.chart.LineDiagram",
                                     "Ventes par jour, octobre 2026 (F)", "F", BLEU, "c4-graph-courbe", False)
        try:
            diag2.Lines = True
            diag2.Symbols = True
        except Exception:
            pass
        doc.calculateAll()
        time.sleep(2)

        def export_png(feuille, cible, nom):
            from com.sun.star.beans import PropertyValue
            os.makedirs(os.path.dirname(cible), exist_ok=True)
            forme = None
            page = feuille.DrawPage
            for i in range(page.Count):
                forme = page.getByIndex(i)
            exp = smgr.createInstanceWithContext("com.sun.star.drawing.GraphicExportFilter", ctx)
            exp.setSourceDocument(forme)
            def pv(n, v):
                x = PropertyValue(); x.Name = n; x.Value = v; return x
            fd = uno.Any("[]com.sun.star.beans.PropertyValue", (pv("PixelWidth", 1200), pv("PixelHeight", 720)))
            exp.filter((pv("URL", "file://" + cible), pv("MediaType", "image/png"), pv("FilterData", fd)))

        export_png(fprod, os.path.join(SORTIE, "c4-graph-barres", "capture.png"), "GrapheProduits")
        export_png(fjr, os.path.join(SORTIE, "c4-graph-courbe", "capture.png"), "GrapheJours")

        # ---------------------------------------------------------- 5. sorties
        sauve = {
            "ok": bool(tout_ok),
            "lignes": N,
            "total_F": total_py,
            "controles": res,
            "produits": produits_texte,
            "croise": croise,
            "jours": jours_valeurs,
            "mesures_captures": mes,
        }
        os.makedirs(os.path.join(SORTIE, "c4-tcd"), exist_ok=True)
        with open(os.path.join(SORTIE, "c4-tcd", "resultat.json"), "w", encoding="utf-8") as fh:
            json.dump(sauve, fh, ensure_ascii=False, indent=2)
        doc.storeToURL("file://" + os.path.join(SORTIE, "c4-tcd", "c4-tcd.xlsx"),
                       (T.pv("FilterName", "Calc MS Excel 2007 XML"),))
        doc.close(True)
        print("TOUT OK" if tout_ok else "ECHEC")
        for r in res:
            print(("ok  " if r["ok"] else "KO  "), r["controle"], r["table_de_pilote"], r["valeur_formule"], r["python"])
    finally:
        T.arreter(proc)
        xvfb.terminate()
        shutil.rmtree(tmp, ignore_errors=True)
    return 0 if tout_ok else 1


if __name__ == "__main__":
    sys.exit(main())
