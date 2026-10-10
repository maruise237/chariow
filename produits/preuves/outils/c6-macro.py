#!/usr/bin/env python3
"""Chapitre 6 : teste dans LibreOffice Calc (mode compatibilité VBA) les macros VBA données par ChatGPT.

Usage (depuis /home/user/chariow) :
    python3 produits/preuves/outils/c6-macro.py

Pour chaque macro de produits/preuves/outils/c6-vba/*.bas :
  1. ouvre un classeur neuf, feuille « Ventes », 7 ventes en désordre ;
  2. injecte le code dans la bibliothèque Basic DU DOCUMENT (module précédé de
     « Option VBASupport 1 », ce qui active le mode compatibilité VBA) ;
  3. l'exécute par le moteur de scripts de LibreOffice (comme le bouton Exécuter) ;
  4. vérifie : ordre des montants, clients restés avec leur montant, gras sur
     les montants > 50 000 et seulement eux ;
  5. rejoue après une modification (un gros montant devient petit) pour voir si
     le gras périmé est retiré ;
  6. enregistre les captures avant / après et resultat.json dans
     produits/preuves/sortie/c6-macro-<nom>/.
Variable C6_SANS_OPTION=1 : même test sans la ligne « Option VBASupport 1 » (contrôle).
Une macro qui ouvre une boîte de dialogue (MsgBox) bloque l'exécution : on le
détecte par un délai maximal et on le signale.
"""
import glob
import json
import os
import shutil
import sys
import tempfile
import threading
import time

ICI = os.path.dirname(os.path.abspath(__file__))
PREUVES = os.path.dirname(ICI)
sys.path.insert(0, PREUVES)
import tableur as T  # noqa: E402  (outils de capture communs, non modifiés)

DONNEES = [
    ["Client", "Produit", "Montant FCFA"],
    ["Carine", "Riz 50 kg", 50000],
    ["Franck", "Savon", 9500],
    ["Aminatou", "Pagne", 120000],
    ["Djibril", "Sucre", 32500],
    ["Boris", "Huile 20 L", 75000],
    ["Estelle", "Farine", 51000],
    ["Awa", "Savon", 18000],
]
ATTENDU_ORDRE = [120000, 75000, 51000, 50000, 32500, 18000, 9500]
ATTENDU_CLIENTS = ["Aminatou", "Boris", "Estelle", "Carine", "Djibril", "Awa", "Franck"]
GRAS = 150.0   # CharWeight de LibreOffice pour le gras (100 = normal)
DELAI = 40     # secondes avant de déclarer la macro bloquée

CAS = {"id": "", "capture": {"feuille": "Ventes", "plage": "A1:C8", "cellule_active": "A1",
                             "zoom": 140}, "largeurs": {}}


def remplir(doc):
    f = doc.Sheets.getByIndex(0)
    f.Name = "Ventes"
    for r, lig in enumerate(DONNEES):
        for c, v in enumerate(lig):
            cell = f.getCellByPosition(c, r)
            if isinstance(v, (int, float)):
                cell.setValue(v)
            else:
                cell.setString(v)
    from com.sun.star.lang import Locale
    nf = doc.NumberFormats
    loc = Locale("fr", "FR", "")
    cle = nf.queryKey("# ##0", loc, False)
    if cle == -1:
        cle = nf.addNew("# ##0", loc)
    f.getCellRangeByName("C2:C8").NumberFormat = cle
    for c in range(0, 3):
        f.getCellByPosition(c, 0).CharWeight = GRAS   # en-têtes en gras pour la lisibilité
    return f


def etat(f):
    montants = [f.getCellByPosition(2, r).getValue() for r in range(1, 8)]
    clients = [f.getCellByPosition(0, r).getString() for r in range(1, 8)]
    gras = [f.getCellByPosition(2, r).CharWeight >= GRAS for r in range(1, 8)]
    return montants, clients, gras


def injecter(doc, code):
    bib = doc.BasicLibraries
    if not bib.hasByName("Standard"):
        bib.createLibrary("Standard")
    bib.loadLibrary("Standard")
    std = bib.getByName("Standard")
    if std.hasByName("Module1"):
        std.removeByName("Module1")
    entete = "" if os.environ.get("C6_SANS_OPTION") else "Option VBASupport 1\n"
    std.insertByName("Module1", entete + code.replace("\r\n", "\n"))


def lancer(ctx, doc, nom_macro):
    """Exécute la macro ; renvoie (ok, message). Détecte le blocage (boîte de dialogue)."""
    smgr = ctx.ServiceManager
    fab = smgr.createInstanceWithContext(
        "com.sun.star.script.provider.MasterScriptProviderFactory", ctx)
    prov = fab.createScriptProvider(doc)
    url = ("vnd.sun.star.script:Standard.Module1.%s?language=Basic&location=document" % nom_macro)
    script = prov.getScript(url)
    res = {}

    def cible():
        try:
            script.invoke((), (), ())
            res["ok"] = True
        except Exception as e:  # noqa: BLE001
            res["erreur"] = "%s: %s" % (type(e).__name__, str(e)[:300])

    th = threading.Thread(target=cible, daemon=True)
    th.start()
    th.join(DELAI)
    if th.is_alive():
        return False, "BLOQUÉE : la macro attend (probablement une boîte de dialogue)"
    if res.get("ok"):
        return True, "exécutée sans erreur"
    return False, res.get("erreur", "inconnu")


def verifier(f):
    montants, clients, gras = etat(f)
    attendu_gras = [m > 50000 for m in montants]
    return {
        "montants": montants,
        "clients": clients,
        "gras": gras,
        "ordre_ok": montants == ATTENDU_ORDRE,
        "clients_ok": clients == ATTENDU_CLIENTS,
        "gras_ok": gras == [m > 50000 for m in ATTENDU_ORDRE],
        "gras_coherent_avec_montants": gras == attendu_gras,
    }


def capturer(doc, ctx, chemin, tmp, cellule):
    cas = json.loads(json.dumps(CAS))
    cas["capture"]["cellule_active"] = cellule
    T.serrer_colonnes(doc, cas, 40)
    T.configurer_fenetre(doc, cas)
    time.sleep(3)
    brut = T.capturer(cas, None, tmp)
    T.recadrer(brut, chemin, cas, doc)


def tester(bas):
    nom = os.path.splitext(os.path.basename(bas))[0]
    sortie = os.path.join(T.DOSSIER_SORTIE, "c6-macro-" + nom + ("-sans-option" if os.environ.get("C6_SANS_OPTION") else ""))
    os.makedirs(sortie, exist_ok=True)
    code = open(bas, encoding="utf-8").read()
    nom_macro = code.split("Sub ", 1)[1].split("(", 1)[0].strip()
    tmp = tempfile.mkdtemp(prefix="kt-c6-")
    proc, port = T.lancer_calc(os.path.join(tmp, "profil"))
    rapport = {"macro": nom, "fichier": os.path.basename(bas)}
    try:
        ctx = T.se_connecter(port)
        T.syntaxe_excel(ctx)
        bureau = ctx.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
        doc = bureau.loadComponentFromURL("private:factory/scalc", "_blank", 0, ())
        f = remplir(doc)
        capturer(doc, ctx, os.path.join(sortie, "avant.png"), tmp, "A1")
        injecter(doc, code)
        ok, msg = lancer(ctx, doc, nom_macro)
        rapport["execution"] = {"ok": ok, "message": msg}
        if ok:
            rapport["apres"] = verifier(f)
            capturer(doc, ctx, os.path.join(sortie, "apres.png"), tmp, "C2")
            # rejeu : le 1er montant (120 000) devient 5 000 ; le gras périmé est-il retiré ?
            f.getCellByPosition(2, 1).setValue(5000)
            ok2, msg2 = lancer(ctx, doc, nom_macro)
            montants, clients, gras = etat(f)
            capturer(doc, ctx, os.path.join(sortie, "rejeu.png"), tmp, "C2")
            rapport["rejeu"] = {"ok": ok2, "message": msg2, "montants": montants,
                                "gras": gras,
                                "gras_perime": [m <= 50000 and g for m, g in zip(montants, gras)]}
        doc.storeToURL("file://" + os.path.join(sortie, nom + ".ods"), ())
        try:
            doc.close(True)
        except Exception:  # noqa: BLE001
            pass
    finally:
        T.arreter(proc)
        shutil.rmtree(tmp, ignore_errors=True)
    with open(os.path.join(sortie, "resultat.json"), "w", encoding="utf-8") as fh:
        json.dump(rapport, fh, ensure_ascii=False, indent=2)
    return rapport


if __name__ == "__main__":
    fichiers = sys.argv[1:] or sorted(glob.glob(os.path.join(ICI, "c6-vba", "*.bas")))
    xvfb = T.demarrer_xvfb()
    code = 0
    try:
        for b in fichiers:
            r = tester(b)
            print("==", r["fichier"])
            print(json.dumps(r, ensure_ascii=False, indent=1))
            ap = r.get("apres")
            if not (r["execution"]["ok"] and ap and ap["ordre_ok"] and ap["gras_ok"]):
                code = 1
    finally:
        xvfb.terminate()
    sys.exit(code)
