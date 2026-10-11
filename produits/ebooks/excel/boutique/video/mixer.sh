#!/usr/bin/env bash
# Mixe voix + musique (ducking) + bruitages -> audio/mix.m4a (AAC 48 kHz, 160 kb/s, -14 LUFS, TP -1).
# Source unique des instants : src/evenements.json (partagée avec pub.html).
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"; cd "$ici"
DUREE=44.5
python3 sfx.py > /dev/null
TMP="${TMPDIR_MIX:-/tmp/claude-0/-home-user-chariow/435e3180-ec84-5cc9-9a28-41e5a1c93074/scratchpad/mix}"; mkdir -p "$TMP"

# 1. script de filtres généré depuis evenements.json
python3 - "$TMP/filtre.txt" "$TMP/entrees.txt" <<'PY'
import json, sys
ev = json.load(open('src/evenements.json')); meta = json.load(open('audio/sfx/meta.json'))
filtre, entrees = sys.argv[1], sys.argv[2]
ins = []                       # fichiers d'entrée dans l'ordre
f = []
# voix s1..s6 (entrées 0..5), départs exacts
labs = []
for k, v in enumerate(ev['voix']):
    ins.append('audio/' + v['fichier']); ms = int(round(v['t'] * 1000))
    f.append(f"[{k}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms}[v{k}]"); labs.append(f'[v{k}]')
f.append(f"{''.join(labs)}amix=inputs={len(labs)}:normalize=0:duration=longest,apad=whole_dur={ev['duree']},atrim=0:{ev['duree']},asplit=2[voix][vsc]")
# musique : boucle par fondu enchaîné, jusqu'à la durée, fondu de sortie de 1,5 s
m = len(ins); ins.append('audio/musique.mp3')
f.append(f"[{m}:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[m1][m2]")
f.append(f"[m1][m2]acrossfade=d=2:c1=tri:c2=tri,atrim=0:{ev['duree']},asetpts=PTS-STARTPTS,"
         f"afade=t=out:st={ev['duree']-1.5}:d=1.5,volume=-10.5dB[mus]")
# ducking : la voix déclenche la compression de la musique (la musique reste ~-22 dB sous la voix)
f.append("[mus][vsc]sidechaincompress=threshold=0.01:ratio=3:attack=20:release=500:makeup=1[musd]")
# bruitages : un asplit par son, un adelay par événement (impact calé sur t)
sons = {}
for e in ev['evenements']:
    if e['son']: sons.setdefault(e['son'], []).append(e)
etiq = []
for nom, lst in sons.items():
    i = len(ins); ins.append(f'audio/sfx/{nom}.wav')
    sp = ''.join(f'[{nom}_{j}]' for j in range(len(lst)))
    f.append(f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit={len(lst)}{sp}" if len(lst) > 1 else f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo[{nom}_0]")
    for j, e in enumerate(lst):
        t = max(0.0, e['t'] - meta[nom]['attaque']); ms = int(round(t * 1000)); g = ev['gains_db'][nom]
        f.append(f"[{nom}_{j}]volume={g}dB,adelay={ms}|{ms}[x_{nom}_{j}]"); etiq.append(f'[x_{nom}_{j}]')
f.append(f"{''.join(etiq)}amix=inputs={len(etiq)}:normalize=0:duration=longest,apad=whole_dur={ev['duree']},atrim=0:{ev['duree']}[sfx]")
f.append("[voix][musd][sfx]amix=inputs=3:normalize=0:duration=first[brut]")
open(filtre, 'w').write(';\n'.join(f)); open(entrees, 'w').write('\n'.join(ins) + '\n')
PY
ARGS=(); while IFS= read -r f; do ARGS+=(-i "$f"); done < "$TMP/entrees.txt"

# 2. mesure loudnorm (passe 1)
ffmpeg -hide_banner -nostdin -y "${ARGS[@]}" -filter_complex_script "$TMP/filtre.txt" -map "[brut]" -t $DUREE -c:a pcm_s16le "$TMP/brut.wav" 2>"$TMP/ffmpeg.log" || { tail -20 "$TMP/ffmpeg.log"; exit 1; }
MES=$(ffmpeg -hide_banner -nostdin -i "$TMP/brut.wav" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$MES" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
# 3. passe 2 linéaire + AAC
ffmpeg -hide_banner -nostdin -y -i "$TMP/brut.wav" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000,atrim=0:$DUREE" \
  -ar 48000 -c:a aac -b:a 160k audio/mix.m4a 2>>"$TMP/ffmpeg.log"
cp "$TMP/brut.wav" "$TMP/brut-garde.wav"
echo "OK audio/mix.m4a"
ffmpeg -hide_banner -nostdin -i audio/mix.m4a -af ebur128=peak=true -f null - 2>&1 | tail -12
