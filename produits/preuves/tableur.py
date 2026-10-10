#!/usr/bin/env python3
"""Prouve des formules Excel en les faisant calculer par LibreOffice Calc en français.

Usage :
    python3 produits/preuves/tableur.py produits/preuves/cas/somme-si.json
    python3 produits/preuves/tableur.py --tous

Pour chaque cas JSON, on produit dans produits/preuves/sortie/<id>/ :
    <id>.xlsx      le classeur réel, enregistré par LibreOffice
    resultat.json  valeur calculée (ou texte d'erreur), attendu, ok
    capture.png    capture réelle de l'interface Calc (barre de formule + plage)

Principe : la formule est écrite en français (comme le lecteur la tape) et
injectée par la propriété de cellule « FormulaLocal ». C'est donc LibreOffice
qui interprète la syntaxe française (noms de fonctions, « ; »). Une formule
fausse produit l'erreur exacte que le lecteur verrait.

Code de sortie non nul si une formule ne donne pas l'attendu (sauf si la
formule ou le cas déclare "attendu_erreur").
"""
import glob
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time

RACINE = os.path.dirname(os.path.abspath(__file__))
DOSSIER_CAS = os.path.join(RACINE, "cas")
DOSSIER_SORTIE = os.path.join(RACINE, "sortie")
ECRAN = "1600x1000x24"
LARGEUR_FINALE = 1000
ECRAN_L, ECRAN_H = 1600, 1000
# Calage de la capture (pixels de l'écran virtuel)
PX_PAR_CENTIMM = 0.0399   # pixels par 1/100 mm à 100 % de zoom
RATIO_Y = 1.0             # correction des hauteurs de ligne
BARRE_Y, BARRE_H = 31, 28 # bandeau « zone de nom + barre de formule »
GRILLE_X0, GRILLE_Y0 = 32, 64  # origine de la grille (en-têtes de colonnes)


# ---------------------------------------------------------------- environnement

def demarrer_xvfb():
    """Démarre un écran virtuel Xvfb, règle DISPLAY et la locale française.

    Renvoie le processus Xvfb (à arrêter en fin de programme).
    """
    lire, ecrire = os.pipe()
    proc = subprocess.Popen(["Xvfb", "-screen", "0", ECRAN, "-nolisten", "tcp",
                             "-displayfd", str(ecrire)], pass_fds=(ecrire,),
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.close(ecrire)
    numero = os.read(lire, 16).decode().strip()  # Xvfb écrit son numéro d'écran
    os.close(lire)
    os.environ["DISPLAY"] = ":" + numero
    os.environ["LANG"] = os.environ["LC_ALL"] = "fr_FR.UTF-8"
    return proc


def port_libre():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def lancer_calc(profil):
    """Lance LibreOffice Calc (interface graphique) et renvoie (processus, port)."""
    port = port_libre()
    cmd = ["soffice", "-env:UserInstallation=file://" + profil,
           "--accept=socket,host=127.0.0.1,port=%d;urp;" % port,
           "--calc", "--norestore", "--nologo", "--nodefault"]
    p = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                         start_new_session=True)
    return p, port


def se_connecter(port, delai=90):
    import uno
    local = uno.getComponentContext()
    resolver = local.ServiceManager.createInstanceWithContext(
        "com.sun.star.bridge.UnoUrlResolver", local)
    fin = time.time() + delai
    while time.time() < fin:
        try:
            ctx = resolver.resolve(
                "uno:socket,host=127.0.0.1,port=%d;urp;StarOffice.ComponentContext" % port)
            return ctx
        except Exception:
            time.sleep(1)
    raise RuntimeError("LibreOffice ne répond pas")


def syntaxe_excel(ctx):
    """Règle LibreOffice sur la syntaxe de formule « Excel A1 » (Feuille!A1, A:A).

    Par défaut Calc attend « Feuille.A1 » ; le lecteur, lui, tape la syntaxe
    Excel. Réglage équivalent à Outils > Options > Calc > Formule > Syntaxe.
    """
    fournisseur = ctx.ServiceManager.createInstanceWithContext(
        "com.sun.star.configuration.ConfigurationProvider", ctx)
    acces = fournisseur.createInstanceWithArguments(
        "com.sun.star.configuration.ConfigurationUpdateAccess",
        (pv("nodepath", "/org.openoffice.Office.Calc/Formula/Syntax"),))
    acces.setPropertyValue("Grammar", 1)  # 0 = Calc A1, 1 = Excel A1
    acces.commitChanges()


def arreter(p):
    """Arrête LibreOffice par PID (jamais pkill -f, qui pourrait tuer ce script)."""
    try:
        os.killpg(p.pid, 15)
        p.wait(timeout=10)
    except Exception:
        try:
            os.killpg(p.pid, 9)
        except Exception:
            pass
    # le vrai processus (soffice.bin) reste dans le même groupe : déjà couvert


# ---------------------------------------------------------------- tableur

def pv(nom, valeur):
    import uno
    from com.sun.star.beans import PropertyValue
    p = PropertyValue()
    p.Name, p.Value = nom, valeur
    return p


def largeur_colonne_mm100(car):
    """Largeur en 1/100 mm pour un nombre de caractères (approx. 0,19 cm par car.)."""
    return int(car * 190 + 200)


def construire(doc, cas):
    """Remplit le classeur : données, formules françaises, largeurs, formats."""
    feuilles = doc.Sheets
    noms = list(cas["feuilles"].keys())
    # première feuille : renommer celle qui existe, puis insérer les autres
    feuilles.getByIndex(0).Name = noms[0]
    for i, nom in enumerate(noms[1:], 1):
        feuilles.insertNewByName(nom, i)
    for nom, lignes in cas["feuilles"].items():
        f = feuilles.getByName(nom)
        for r, ligne in enumerate(lignes):
            for c, v in enumerate(ligne):
                if v is None:
                    continue
                cell = f.getCellByPosition(c, r)
                if isinstance(v, (int, float)) and not isinstance(v, bool):
                    cell.setValue(v)
                elif isinstance(v, str) and v.startswith("="):
                    cell.setPropertyValue("FormulaLocal", v)
                else:
                    cell.setString(str(v))
    # formules à prouver, saisies en français
    for fo in cas["formules"]:
        cell = feuilles.getByName(fo["feuille"]).getCellRangeByName(fo["cellule"])
        cell.setPropertyValue("FormulaLocal", fo["fr"])
    # largeurs de colonnes (en nombre de caractères)
    for fn in noms:
        f = feuilles.getByName(fn)
        for col, car in cas.get("largeurs", {}).items():
            f.Columns.getByName(col).Width = largeur_colonne_mm100(car)
    # formats numériques (locale française)
    from com.sun.star.lang import Locale
    loc = Locale("fr", "FR", "")
    nf = doc.NumberFormats
    for plage, code in cas.get("formats", {}).items():
        feuille_nom, _, adr = plage.rpartition("!")
        f = feuilles.getByName(feuille_nom or cas["capture"]["feuille"])
        cle = nf.queryKey(code, loc, False)
        if cle == -1:
            cle = nf.addNew(code, loc)
        f.getCellRangeByName(adr).NumberFormat = cle


def lire_resultat(cell):
    """Renvoie (valeur, est_erreur) telle que le lecteur la verrait."""
    if cell.getError() != 0:
        return cell.getString(), True
    # FormulaResultType2 : 1 = nombre, 2 = texte
    if cell.getType().value == "FORMULA" and cell.FormulaResultType2 == 2:
        return cell.getString(), False
    return cell.getValue(), False


def sans_espaces(t):
    """LibreOffice FR affiche « #NOM ? » : on compare sans les espaces."""
    return "".join(str(t).split())


def egal(a, b):
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(a - b) < 1e-9
    return a == b


def configurer_fenetre(doc, cas):
    """Zoom, plage visible, cellule active, interface épurée avant capture."""
    cap = cas["capture"]
    ctrl = doc.CurrentController
    frame = ctrl.Frame
    # fenêtre plein écran virtuel
    w, h = [int(x) for x in ECRAN.split("x")[0:2]]
    frame.ContainerWindow.setPosSize(0, 0, w, h, 15)
    lm = frame.LayoutManager
    # on garde seulement la barre de formule ; on masque barres d'outils, menu, latéral
    for el in ("menubar/menubar", "toolbar/standardbar", "toolbar/toolbar",
               "toolbar/findbar", "statusbar/statusbar", "toolbar/colorbar"):
        try:
            lm.hideElement("private:resource/" + el)
        except Exception:
            pass
    feuille = doc.Sheets.getByName(cap["feuille"])
    ctrl.setActiveSheet(feuille)
    ctrl.ZoomType = 3  # DocumentZoomType.BY_VALUE
    ctrl.ZoomValue = int(cap.get("zoom", 100))
    # plage visible : on place le coin haut-gauche de la plage en haut-gauche
    plage = feuille.getCellRangeByName(cap["plage"])
    ctrl.setFirstVisibleColumn(plage.RangeAddress.StartColumn)
    ctrl.setFirstVisibleRow(plage.RangeAddress.StartRow)
    ctrl.select(feuille.getCellRangeByName(cap.get("cellule_active", cap["plage"].split(":")[0])))


def capturer(cas, fichier_png, tmp):
    """Capture l'écran virtuel puis recadre : barre de formule + plage demandée."""
    brut = os.path.join(tmp, "ecran.png")
    subprocess.run(["import", "-window", "root", brut], check=True)
    return brut


def main_cas(chemin_cas, doc_ctx_factory=None):
    with open(chemin_cas, encoding="utf-8") as fh:
        cas = json.load(fh)
    cid = cas["id"]
    sortie = os.path.join(DOSSIER_SORTIE, cid)
    os.makedirs(sortie, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="kt-calc-")
    profil = os.path.join(tmp, "profil")
    proc, port = lancer_calc(profil)
    try:
        ctx = se_connecter(port)
        syntaxe_excel(ctx)
        smgr = ctx.ServiceManager
        bureau = smgr.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
        doc = bureau.loadComponentFromURL("private:factory/scalc", "_blank", 0, ())
        construire(doc, cas)
        doc.calculateAll()

        # --- résultats
        resultats = []
        attendu_global = cas.get("attendu_erreur")
        tout_ok = True
        for fo in cas["formules"]:
            cell = doc.Sheets.getByName(fo["feuille"]).getCellRangeByName(fo["cellule"])
            valeur, erreur = lire_resultat(cell)
            att_err = fo.get("attendu_erreur", attendu_global if len(cas["formules"]) == 1 else None)
            if att_err is not None:
                ok = erreur and sans_espaces(valeur) == sans_espaces(att_err)
                attendu = att_err
            else:
                attendu = fo.get("attendu")
                ok = (not erreur) and egal(valeur, attendu)
            tout_ok &= bool(ok)
            resultats.append({
                "feuille": fo["feuille"], "cellule": fo["cellule"],
                "formule_fr": fo["fr"],
                "formule_affichee": cell.getPropertyValue("FormulaLocal"),
                "valeur": valeur, "erreur": erreur,
                "attendu": attendu, "ok": bool(ok),
            })
        with open(os.path.join(sortie, "resultat.json"), "w", encoding="utf-8") as fh:
            json.dump({"id": cid, "ok": tout_ok, "resultats": resultats},
                      fh, ensure_ascii=False, indent=2)

        # --- xlsx
        xlsx = os.path.join(sortie, cid + ".xlsx")
        doc.storeToURL("file://" + xlsx, (pv("FilterName", "Calc MS Excel 2007 XML"),))

        # --- capture
        configurer_fenetre(doc, cas)
        time.sleep(4)
        brut = capturer(cas, None, tmp)
        recadrer(brut, os.path.join(sortie, "capture.png"), cas, doc)
        doc.close(True)
        return tout_ok, resultats
    finally:
        arreter(proc)
        shutil.rmtree(tmp, ignore_errors=True)


def recadrer(brut, cible, cas, doc):
    """Recadre la capture : barre de formule + plage demandée, largeur ~1000 px.

    Les dimensions en pixels se déduisent des largeurs/hauteurs réelles des
    cellules (1/100 mm) et du zoom ; les constantes ci-dessous ont été calées
    sur des captures réelles de l'interface à l'écran virtuel utilisé.
    """
    cap = cas["capture"]
    feuille = doc.Sheets.getByName(cap["feuille"])
    plage = feuille.getCellRangeByName(cap["plage"]).RangeAddress
    zoom = int(cap.get("zoom", 100))
    k = PX_PAR_CENTIMM * zoom / 100.0
    larg = sum(feuille.Columns.getByIndex(c).Width
               for c in range(plage.StartColumn, plage.EndColumn + 1))
    haut = sum(feuille.Rows.getByIndex(r).Height
               for r in range(plage.StartRow, plage.EndRow + 1))
    x_fin = min(GRILLE_X0 + int(larg * k) + 6, ECRAN_L)
    y_fin = min(GRILLE_Y0 + int(haut * k * RATIO_Y) + 10, ECRAN_H - 30)
    # barre de formule (nom de cellule + formule) puis grille, assemblées
    barre = os.path.join(os.path.dirname(brut), "barre.png")
    grille = os.path.join(os.path.dirname(brut), "grille.png")
    subprocess.run(["convert", brut, "-crop", "%dx%d+0+%d" % (x_fin, BARRE_H, BARRE_Y),
                    "+repage", barre], check=True)
    subprocess.run(["convert", brut, "-crop",
                    "%dx%d+0+%d" % (x_fin, y_fin - GRILLE_Y0, GRILLE_Y0),
                    "+repage", grille], check=True)
    subprocess.run(["convert", barre, grille, "-append", "+repage", "-bordercolor",
                    "white", "-border", "4", "-resize", "%dx" % LARGEUR_FINALE, cible],
                   check=True)


def cas_a_lancer(args):
    if args == ["--tous"]:
        return sorted(glob.glob(os.path.join(DOSSIER_CAS, "*.json")))
    return args


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    xvfb = demarrer_xvfb()
    code = 0
    try:
        for c in cas_a_lancer(sys.argv[1:]):
            ok, res = main_cas(c)
            print(("OK  " if ok else "ECHEC ") + os.path.basename(c))
            for r in res:
                print("   %s!%s %s -> %r (attendu %r)" % (r["feuille"], r["cellule"],
                      r["formule_fr"], r["valeur"], r["attendu"]))
            if not ok:
                code = 1
    finally:
        xvfb.terminate()
    sys.exit(code)
