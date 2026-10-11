#!/usr/bin/env python3
"""Construit src/soustitres.json et sortie/pub-excel.srt.
Texte : colonne « Texte » du storyboard (fait foi). Minutage : mots de audio/mots.json
(Whisper) + départ du segment (src/evenements.json)."""
import json, os
ici = os.path.dirname(os.path.abspath(__file__))
mots = json.load(open(f'{ici}/audio/mots.json'))
voix = {v['fichier'].split('.')[0]: v['t'] for v in json.load(open(f'{ici}/src/evenements.json'))['voix']}

# (texte affiché, indice du premier mot Whisper, indice du dernier mot Whisper, ponctuation de fin)
S = {
 's1': [("J'ai",0,1,''),("demandé",2,2,''),("une",3,3,''),("formule",4,4,''),("Excel",5,5,''),("à",6,6,''),
        ("ChatGPT",7,8,'.'),("Résultat",9,9,'.'),("427",10,10,''),("millions",11,11,''),("de",12,12,''),("francs",13,13,'.'),
        ("Le",14,14,''),("vrai",15,15,''),("chiffre",16,16,'?'),("15 000",17,18,'.'),
        ("Et",19,19,''),("Excel",20,20,''),("n'a",21,22,''),("affiché",23,23,''),("aucune",24,24,''),("erreur",25,25,'.')],
 's2': [("L'IA",0,0,''),("peut",1,1,''),("écrire",2,2,''),("tes",3,3,''),("formules",4,4,''),("à",5,5,''),("ta",6,6,''),("place",7,7,','),
        ("mais",8,8,''),("il",9,9,''),("faut",10,10,''),("savoir",11,11,''),("lui",12,12,''),("parler",13,13,''),
        ("et",14,14,''),("vérifier",15,15,''),("en",16,16,''),("30",17,17,''),("secondes",18,18,'.')],
 's3': [("Tu",0,0,''),("écris",1,1,''),("ta",2,2,''),("demande",3,3,''),("en",4,4,''),("français",5,5,'.'),
        ("L'IA",6,6,''),("te",7,7,''),("donne",8,8,''),("la",9,9,''),("formule",10,10,'.'),
        ("Tu",11,11,''),("la",12,12,''),("colle",13,13,''),("et",14,14,''),("tu",15,15,''),("contrôles",16,16,''),
        ("le",17,17,''),("résultat",18,18,''),("de",19,19,''),("tête",20,20,'.')],
 's4': [("Stock",0,0,','),("tontine",1,1,','),("Mobile",2,2,''),("Money",3,3,','),("paie",4,4,','),
        ("tu",5,5,''),("reçois",6,6,''),("aussi",7,7,''),("7",8,8,''),("modèles",9,9,''),("Excel",10,10,','),
        ("déjà",11,11,''),("en",12,12,''),("francs",13,13,','),("prêts",14,14,''),("à",15,15,''),("remplir",16,16,'.')],
 's5': [("35",0,0,''),("prompts",1,1,''),("testés",2,2,','),("avec",3,3,''),("les",4,4,''),("captures",5,5,''),
        ("des",6,6,''),("vrais",7,7,''),("résultats",8,8,'.')],
 's6': [("Excel",0,0,','),("sans",1,1,''),("apprendre",2,2,''),("les",3,3,''),("formules",4,4,'.'),
        ("2 500 F",5,6,''),("au",7,7,''),("lieu",8,8,''),("de",9,9,''),("10 000 F",10,11,'.'),
        ("Clique",12,12,''),("sur",13,13,''),("En",15,15,''),("savoir",16,16,''),("plus",17,17,'.')],
}
mots_abs = []   # (texte, debut, fin, ponct)
for seg, lst in S.items():
    ws = mots[seg]['mots']; off = voix[seg]
    for txt, a, b, p in lst:
        d = off + ws[a][0]; f = off + ws[b][1]
        mots_abs.append([txt + p, round(d, 2), round(min(f, d + 0.6), 2), p, seg])

# corrections à la main : mots Whisper trop longs ou décalés
def fixe(txt, seg, d=None, f=None):
    for m in mots_abs:
        if m[0].startswith(txt) and m[4] == seg:
            if d is not None: m[1] = d
            if f is not None: m[2] = f
            return
    raise SystemExit('introuvable ' + txt)
fixe('427', 's1', d=2.96, f=3.5)

# groupes de 2 à 4 mots, coupe sur la ponctuation, sur une pause, ou à 22 signes
groupes = []; cur = []
def flush():
    global cur
    if cur: groupes.append(cur); cur = []
for i, m in enumerate(mots_abs):
    nxt = mots_abs[i + 1] if i + 1 < len(mots_abs) else None
    cur.append(m)
    lg = len(' '.join(x[0] for x in cur))
    fin = (m[3] in ('.', '?')) or (m[3] == ',' and len(cur) >= 2) or len(cur) >= 4 or m[4] != (nxt[4] if nxt else None) \
          or (nxt and (nxt[1] - m[2] > 0.5) and len(cur) >= 2) \
          or (nxt and lg + len(nxt[0]) + 1 > 24 and len(cur) >= 2)
    if fin: flush()
flush()
# fusionne un groupe d'un seul mot avec le précédent du même segment si possible
res = []
for g in groupes:
    if len(g) == 1 and res and res[-1][-1][3] not in ('.', '?') and res[-1][-1][4] == g[0][4] and len(res[-1]) < 4 and g[0][1] - res[-1][-1][2] < 0.6:
        res[-1].extend(g)
    else:
        res.append(g)
out = []
for k, g in enumerate(res):
    deb = g[0][1]
    nxt = res[k + 1][0][1] if k + 1 < len(res) else 44.5
    fin = min(g[-1][1] + 0.55, nxt - 0.02)
    if fin < deb + 0.15: fin = deb + 0.15
    out.append({'d': deb, 'f': round(fin, 2), 'mots': [{'t': m[0].rstrip('.,?'), 'd': m[1], 'p': m[3]} for m in g]})
json.dump(out, open(f'{ici}/src/soustitres.json', 'w'), ensure_ascii=False, indent=1)

def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'
# SRT : phrases de 1 à 2 lignes, plus lisibles pour Meta que les groupes karaoké
srt = []; n = 0
for g in out:
    n += 1
    txt = ' '.join(m['t'] + m['p'] for m in g['mots'])
    srt.append(f"{n}\n{ts(g['d'])} --> {ts(g['f'])}\n{txt}\n")
os.makedirs(f'{ici}/sortie', exist_ok=True)
open(f'{ici}/sortie/pub-excel.srt', 'w', encoding='utf-8').write('\n'.join(srt))
for g in out: print(g['d'], g['f'], ' '.join(m['t'] for m in g['mots']))
