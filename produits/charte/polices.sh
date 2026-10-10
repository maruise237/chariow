#!/usr/bin/env bash
# Télécharge les polices des e-books dans assets/fonts/ (non versionnées).
# Licences : OFL (Google Fonts via fontsource) et ITF Free Font License (Fontshare).
# La licence Fontshare autorise l'incorporation dans un PDF vendu, mais pas la redistribution
# des fichiers : on ne les commite donc jamais, on les télécharge.
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)/assets/fonts"
mkdir -p "$D"

fs() { # fontsource : nom version graisse [style]
  local f="$1-latin-$3-${4:-normal}.woff2"
  [ -s "$D/$f" ] || curl -sSfL -o "$D/$f" "https://cdn.jsdelivr.net/npm/@fontsource/$1@$2/files/$f"
}
fs literata 5.2.5 400; fs literata 5.2.5 400 italic; fs literata 5.2.5 600; fs literata 5.2.5 700
fs hanken-grotesk 5.2.5 400; fs hanken-grotesk 5.2.5 600; fs hanken-grotesk 5.2.5 800
fs jetbrains-mono 5.2.5 500
fs bricolage-grotesque 5.2.5 800; fs bricolage-grotesque 5.2.5 600

fshare() { # Fontshare : nom Fichier1 Fichier2...
  local nom="$1"; shift
  local manque=0 f t
  for f in "$@"; do [ -s "$D/$f.woff2" ] || manque=1; done
  [ "$manque" = 0 ] && return 0
  t="$(mktemp -d)"
  curl -sSfL -o "$t/z.zip" "https://api.fontshare.com/v2/fonts/download/$nom"
  unzip -q "$t/z.zip" -d "$t"
  for f in "$@"; do cp "$(find "$t" -path '*WEB/fonts/*' -name "$f.woff2" | head -1)" "$D/"; done
  rm -r -- "$t"
}
fshare zodiak Zodiak-Bold Zodiak-Extrabold Zodiak-BoldItalic
fshare cabinet-grotesk CabinetGrotesk-Bold CabinetGrotesk-Extrabold
fshare supreme Supreme-Extrabold
ls "$D"
