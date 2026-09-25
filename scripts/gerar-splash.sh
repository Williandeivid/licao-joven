#!/bin/bash
# Gera a tela de abertura (splash) do iOS e do Android a partir de assets/icone/icone.svg.
#   iOS     : ios/App/App/Assets.xcassets/Splash.imageset/splash.jpg (2732x2732; o iOS corta no formato da tela)
#   Android : drawable[-port|-land]-*/splash.jpg (usados antes do Android 12; do 12 em diante o
#             sistema mostra o icone sobre windowSplashScreenBackground, ver values/styles.xml)
# Precisa de: Google Chrome (renderiza o SVG com degrade) e ImageMagick (magick).
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
SVG="$RAIZ/assets/icone/icone.svg"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
LADO=2732

# SVG da splash: o mesmo fundo do icone, com a arte (livro + fita + faisca) no centro.
python3 - "$SVG" "$TMP/splash.svg" "$LADO" <<'PY'
import sys, re
svg, saida, lado = open(sys.argv[1]).read(), sys.argv[2], int(sys.argv[3])
defs = re.search(r'<defs>.*?</defs>', svg, re.S).group(0)
arte = re.search(r'<g id="arte">.*</g>\s*</svg>', svg, re.S).group(0)[:-len('</svg>')]
fundo = ''.join('<rect width="%d" height="%d" fill="url(#%s)"/>' % (lado, lado, i) for i in ('fundo', 'brilho', 'luz'))
c = lado // 2
# a arte mede ~572 unidades de largura; escala 1.10 => ~630 px no quadrado de 2732 (cabe na faixa
# central que sobra num iPhone em pe, ~46% da largura)
open(saida, 'w').write(
  '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">%s%s'
  '<g transform="translate(%d %d) scale(1.10) translate(-512 -520)">%s</g></svg>' % (lado, lado, lado, lado, defs, fundo, c, c, arte))
PY
cat > "$TMP/r.html" <<HTML
<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#4a33b8}img{display:block;width:${LADO}px;height:${LADO}px}</style><img src="file://$TMP/splash.svg">
HTML
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=$LADO,$LADO \
  --screenshot="$TMP/mestre.png" "file://$TMP/r.html" >/dev/null 2>&1
magick "$TMP/mestre.png" -alpha off -strip "$TMP/mestre.png"

# iOS: uma unica imagem (JPEG q90, 4:4:4: a splash e opaca, e o PNG do degrade pesava 3,8 MB, 25x mais,
# sem diferenca visivel). Antes eram 3 copias identicas (uma por escala), que o Xcode guardava as tres.
IOS="$RAIZ/ios/App/App/Assets.xcassets/Splash.imageset"
rm -f "$IOS"/*.png "$IOS"/*.jpg
magick "$TMP/mestre.png" -sampling-factor 4:4:4 -quality 90 -strip "$IOS/splash.jpg"
cat > "$IOS/Contents.json" <<'JSON'
{
  "images" : [
    {
      "idiom" : "universal",
      "filename" : "splash.jpg"
    }
  ],
  "info" : {
    "version" : 1,
    "author" : "xcode"
  }
}
JSON

# Android (antes do 12): cada arquivo mantem o tamanho que ja tinha; recorta o centro do quadrado no
# formato dele. JPEG em vez de PNG (opaco; o mesmo nome de recurso @drawable/splash continua valendo).
RES="$RAIZ/android/app/src/main/res"
for f in $(find "$RES" \( -name splash.png -o -name splash.jpg \)); do
  dim=$(magick identify -format "%wx%h" "$f"); w=${dim%x*}; h=${dim#*x}
  d=$(dirname "$f")
  if [ "$w" -ge "$h" ]; then cw=$LADO; ch=$(( LADO * h / w )); else ch=$LADO; cw=$(( LADO * w / h )); fi
  magick "$TMP/mestre.png" -gravity center -crop ${cw}x${ch}+0+0 +repage -resize ${w}x${h}! \
    -sampling-factor 4:4:4 -quality 90 -strip "$TMP/novo.jpg"
  rm -f "$d/splash.png" "$d/splash.jpg"; cp "$TMP/novo.jpg" "$d/splash.jpg"
done

# Android 12+: icone da splash em alta resolucao (o sistema amplia para ~288dp; a camada de frente do icone
# adaptativo, de 432px, ficava borrada). Arte com ~60% da largura, dentro do circulo de 2/3 que o sistema mostra.
python3 - "$SVG" "$TMP/icone_splash.svg" <<'PY'
import sys, re
svg = open(sys.argv[1]).read()
defs = re.search(r'<defs>.*?</defs>', svg, re.S).group(0)
arte = re.search(r'<g id="arte">.*</g>\s*</svg>', svg, re.S).group(0)[:-len('</svg>')]
open(sys.argv[2], 'w').write('<svg xmlns="http://www.w3.org/2000/svg" width="1152" height="1152" viewBox="0 0 1152 1152">' + defs +
  '<g transform="translate(576 576) scale(1.15) translate(-512 -520)">' + arte + '</g></svg>')
PY
cat > "$TMP/r2.html" <<HTML
<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent}img{display:block;width:1152px;height:1152px}</style><img src="file://$TMP/icone_splash.svg">
HTML
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=1152,1152 \
  --screenshot="$TMP/icone_splash.png" "file://$TMP/r2.html" >/dev/null 2>&1
mkdir -p "$RES/drawable-nodpi"
magick "$TMP/icone_splash.png" -strip "$RES/drawable-nodpi/splash_icone.png"
echo "splash gerada"
