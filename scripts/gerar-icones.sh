#!/bin/bash
# Gera todos os icones do app a partir de assets/icone/icone.svg (fonte unica).
#   iOS      : ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png (1024, opaco, sem cantos)
#   Android  : mipmap-*/ic_launcher.png (quadrado arredondado), ic_launcher_round.png (circulo)
#              e ic_launcher_foreground.png (camada do icone adaptativo, com a arte na zona segura)
#   Lojas    : assets/icone/icone-1024.png (App Store) e icone-512.png (Google Play)
# Precisa de: Google Chrome (renderiza o SVG com degrade) e ImageMagick (magick).
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
SVG="$RAIZ/assets/icone/icone.svg"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

render() {  # render <svg> <png de saida> <fundo: opaco|transparente>
  local fundo="00000000"; [ "$3" = "opaco" ] && fundo="ffffffff"
  cat > "$TMP/r.html" <<HTML
<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent}img{display:block;width:1024px;height:1024px}</style><img src="file://$1">
HTML
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --default-background-color=$fundo \
    --window-size=1024,1024 --screenshot="$2" "file://$TMP/r.html" >/dev/null 2>&1
}

# 1) icone completo (fundo + arte)
render "$SVG" "$TMP/mestre.png" opaco

# 2) so a arte, reduzida para a zona segura do icone adaptativo do Android
python3 - "$SVG" "$TMP/fg.svg" <<'PY'
import sys, re
s = open(sys.argv[1]).read()
arte = re.search(r'<g id="arte">.*</g>\s*</svg>', s, re.S).group(0)[:-len('</svg>')]
defs = re.search(r'<defs>.*?</defs>', s, re.S).group(0)
open(sys.argv[2], 'w').write(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">' + defs +
  '<g transform="translate(512 512) scale(0.85) translate(-512 -520)">' + arte + '</g></svg>')
PY
render "$TMP/fg.svg" "$TMP/fg.png" transparente

# 3) iOS: 1024 opaco (sem canal alfa; o iOS arredonda sozinho)
magick "$TMP/mestre.png" -alpha off -strip "$RAIZ/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"

# 4) lojas
magick "$TMP/mestre.png" -alpha off -strip "$RAIZ/assets/icone/icone-1024.png"
magick "$TMP/mestre.png" -alpha off -resize 512x512 -strip "$RAIZ/assets/icone/icone-512.png"

# 5) Android
RES="$RAIZ/android/app/src/main/res"
declare -a DENS=("mdpi:48:108" "hdpi:72:162" "xhdpi:96:216" "xxhdpi:144:324" "xxxhdpi:192:432")
for d in "${DENS[@]}"; do
  IFS=: read -r nome lado fg <<< "$d"
  raio=$(( lado * 18 / 100 ))
  # legado (API < 26): quadrado arredondado
  magick "$TMP/mestre.png" -alpha off -resize ${lado}x${lado} \
    \( -size ${lado}x${lado} xc:black -fill white -draw "roundrectangle 0,0,$((lado-1)),$((lado-1)),$raio,$raio" \) \
    -compose CopyOpacity -composite -strip "$RES/mipmap-$nome/ic_launcher.png"
  # legado redondo
  magick "$TMP/mestre.png" -alpha off -resize ${lado}x${lado} \
    \( -size ${lado}x${lado} xc:black -fill white -draw "circle $((lado/2)),$((lado/2)) $((lado/2)),0" \) \
    -compose CopyOpacity -composite -strip "$RES/mipmap-$nome/ic_launcher_round.png"
  # camada de frente do icone adaptativo
  magick "$TMP/fg.png" -resize ${fg}x${fg} -strip "$RES/mipmap-$nome/ic_launcher_foreground.png"
done
echo "icones gerados"
