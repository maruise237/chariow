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
# Écran virtuel grand : l'interface de LibreOffice est agrandie (DPI forcé),
# ce qui agrandit aussi la barre de formule (sa police ne suit pas le zoom de la feuille).
ECRAN = "2600x1600x24"
ECRAN_L, ECRAN_H = 2600, 1600
DPI_INTERFACE = 192       # SAL_FORCEDPI : 96 = normal ; l'interface grandit avec
# Le texte de la barre de formule (taille fixe) doit rester lisible une fois la
# capture ramenée à 1000 px : sa taille relative à la grille vaut 1/zoom. On
# plafonne donc le zoom de la feuille (le zoom des json est un maximum).
ZOOM_MAX = 120
LARGEUR_FINALE = 1000


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
    env = dict(os.environ, SAL_FORCEDPI=str(DPI_INTERFACE))
    p = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                         start_new_session=True, env=env)
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


def zoom_effectif(cap):
    return min(int(cap.get("zoom", 100)), ZOOM_MAX)


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
               "toolbar/findbar", "statusbar/statusbar", "toolbar/colorbar",
               "toolbar/formatobjectbar", "toolbar/textobjectbar"):
        try:
            lm.hideElement("private:resource/" + el)
        except Exception:
            pass
    feuille = doc.Sheets.getByName(cap["feuille"])
    ctrl.setActiveSheet(feuille)
    ctrl.ZoomType = 3  # DocumentZoomType.BY_VALUE
    ctrl.ZoomValue = zoom_effectif(cap)
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


def _sombre(p):
    """Trait de grille d'en-tête : noir ou bleu nuit de la sélection."""
    return max(p[:3]) < 120


def _separateurs_x(im, y, x0, x_max):
    """Abscisses des traits sombres (fins) sur la ligne y, de x0 à x_max."""
    xs, prec = [], False
    for x in range(x0, x_max):
        s = _sombre(im.getpixel((x, y)))
        if s and not prec:
            xs.append(x)
        prec = s
    return xs


def _separateurs_y(im, x, y0, y_max):
    ys, prec = [], False
    for y in range(y0, y_max):
        s = _sombre(im.getpixel((x, y)))
        if s and not prec:
            ys.append(y)
        prec = s
    return ys


def mesurer_ecran(im, nb_col, nb_lig):
    """Repère, par analyse de la capture brute, les bandes de l'interface.

    Renvoie un dict : x0 (trait à droite des numéros de ligne), y_entete
    (trait sous les lettres de colonnes), x_fin / y_fin (dernier trait de la
    plage), bar_haut / bar_bas (bandeau nom de cellule + barre de formule).
    Rien n'est calé en dur : tout se déduit des couleurs de l'interface.
    """
    larg, haut = im.size
    # trait vertical à droite des numéros de ligne : premier pixel noir de la
    # ligne y = bas d'écran (les numéros de ligne descendent jusque-là)
    y_bas = haut - 200
    x0 = next(x for x in range(0, larg) if _sombre(im.getpixel((x, y_bas))))
    # trait sous les en-têtes de colonnes : à droite, dans la grille vide, on
    # remonte depuis le bas (traits de grille clairs) jusqu'au premier trait noir
    xv = larg - 300
    y_entete = next(y for y in range(y_bas, 0, -1) if _sombre(im.getpixel((xv, y))))
    # traits entre colonnes, lus juste au-dessus du trait d'en-tête
    seps_x = _separateurs_x(im, y_entete - 3, x0, larg - 60)
    seps_y = _separateurs_y(im, x0 - 10, y_entete, haut - 20)
    if len(seps_x) < nb_col + 1 or len(seps_y) < nb_lig:
        raise RuntimeError("plage trop grande pour l'écran virtuel")
    x_fin = seps_x[nb_col]      # seps_x[0] = x0
    y_fin = seps_y[nb_lig]      # seps_y[0] = y_entete
    # bandeau de la barre de formule : à droite (zone de texte vide, blanche),
    # en remontant depuis les en-têtes, on traverse le gris puis le blanc
    xb = larg - 300
    y = y_entete - 1
    gris = im.getpixel((xb, y))[:3]
    while im.getpixel((xb, y))[:3] == gris:
        y -= 1
    bar_bas = y + 1                      # sous le cadre bas du champ de saisie
    while im.getpixel((xb, y))[:3] != gris:
        y -= 1
    bar_haut = max(y - 3, 0)             # au-dessus du cadre haut du champ
    return {"x0": x0, "y_entete": y_entete, "x_fin": x_fin, "y_fin": y_fin,
            "bar_haut": bar_haut, "bar_bas": bar_bas, "xb": xb}


def fin_texte_formule(im, m):
    """Abscisse du dernier pixel de texte dans le champ de formule."""
    y1, y2 = m["bar_haut"] + 6, m["bar_bas"] - 6
    for x in range(m["xb"] - 40, 400, -1):
        for y in range(y1, y2):
            if max(im.getpixel((x, y))[:3]) < 160:
                return x
    return 400


def recadrer(brut, cible, cas, doc):
    """Recadre la capture : barre de formule + exactement la plage demandée.

    Les bandes sont repérées par analyse d'image (voir mesurer_ecran) : le
    recadrage tombe sur le dernier trait de la plage, sans colonne ni ligne en
    trop. Si le texte de la formule dépasse la plage, la barre est gardée en
    entier et la grille est complétée à droite par du blanc (jamais de colonne
    voisine). L'image reste une capture réelle : aucun pixel n'est dessiné.
    """
    from PIL import Image
    cap = cas["capture"]
    feuille = doc.Sheets.getByName(cap["feuille"])
    plage = feuille.getCellRangeByName(cap["plage"]).RangeAddress
    nb_col = plage.EndColumn - plage.StartColumn + 1
    nb_lig = plage.EndRow - plage.StartRow + 1
    im = Image.open(brut).convert("RGB")
    m = mesurer_ecran(im, nb_col, nb_lig)
    larg_grille = m["x_fin"] + 3
    larg = max(larg_grille, fin_texte_formule(im, m) + 24)
    barre = im.crop((0, m["bar_haut"], larg, m["bar_bas"]))
    grille = im.crop((0, m["bar_bas"], larg_grille, m["y_fin"] + 3))
    toile = Image.new("RGB", (larg, barre.height + grille.height), (255, 255, 255))
    toile.paste(barre, (0, 0))
    toile.paste(grille, (0, barre.height))
    cadre = Image.new("RGB", (larg + 8, toile.height + 8), (255, 255, 255))
    cadre.paste(toile, (4, 4))
    h = round(cadre.height * LARGEUR_FINALE / cadre.width)
    cadre.resize((LARGEUR_FINALE, h), Image.LANCZOS).save(cible)


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
