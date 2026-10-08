#!/usr/bin/env bash
# Test de l'API Chariow (lecture seule : aucun achat, aucune licence modifiée).
# Usage : CHARIOW_API_KEY=sk_... ./test-api.sh
set -u

API="https://api.chariow.com/v1"
KEY="${CHARIOW_API_KEY:-}"

if [ -z "$KEY" ]; then
  echo "Erreur : définis CHARIOW_API_KEY (Dashboard > Settings > API Keys)." >&2
  exit 1
fi

pass=0
fail=0

check() {
  local label="$1" path="$2"
  local body code
  body=$(curl -sS -H "Authorization: Bearer $KEY" -H "Accept: application/json" \
    -w '\n%{http_code}' "$API$path")
  code="${body##*$'\n'}"
  body="${body%$'\n'*}"
  if [ "$code" = "200" ]; then
    pass=$((pass + 1))
    printf 'OK   %-12s %s\n' "$label" "$(summary "$body")"
  else
    fail=$((fail + 1))
    printf 'FAIL %-12s HTTP %s %s\n' "$label" "$code" "$(echo "$body" | jq -r '.message // empty' 2>/dev/null)"
  fi
}

summary() {
  echo "$1" | jq -r '
    if (.data | type) == "array" then "\(.data | length) élément(s)"
    elif .data.name then .data.name
    else "réponse reçue" end' 2>/dev/null
}

echo "== Test API Chariow =="
check "store"     "/store"
check "products"  "/products?per_page=5"
check "sales"     "/sales?per_page=5"
check "customers" "/customers?per_page=5"
check "discounts" "/discounts?per_page=5"
check "licenses"  "/licenses?per_page=5"
check "pulses"    "/pulses?per_page=5"

# Accès à un produit précis via le premier produit de la liste
first=$(curl -sS -H "Authorization: Bearer $KEY" "$API/products?per_page=1" | jq -r '.data[0].id // empty')
[ -n "$first" ] && check "product" "/products/$first"

echo "== $pass OK, $fail échec(s) =="
[ "$fail" -eq 0 ]
