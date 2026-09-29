#!/bin/bash
# Gera a imagem de destaque do Google Play (feature graphic, 1024x500) a partir de
# assets/icone/icone.svg (mesma fonte do icone e da splash) mais o nome do app.
# Precisa de: Google Chrome (renderiza com fontes web) e ImageMagick (magick).
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
SVG="$RAIZ/assets/icone/icone.svg"
SAIDA="${1:-$RAIZ/assets/icone/imagem-destaque-play.png}"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
LARGURA=1024; ALTURA=500

# So a arte (livro + fita + faisca), sem o fundo do icone - o fundo desta imagem
# e o gradiente proprio, landscape, montado abaixo.
python3 - "$SVG" "$TMP/arte.svg" <<'PY'
import sys, re
svg = open(sys.argv[1]).read()
defs = re.search(r'<defs>.*?</defs>', svg, re.S).group(0)
arte = re.search(r'<g id="arte">.*</g>\s*</svg>', svg, re.S).group(0)[:-len('</svg>')]
open(sys.argv[2], 'w').write('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">' + defs +
  '<g transform="translate(300 300) scale(0.95) translate(-512 -520)">' + arte + '</g></svg>')
PY

cat > "$TMP/pagina.html" <<'HTML'
<!doctype html>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@800;900&family=Plus+Jakarta+Sans:wght@500;600&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:1024px;height:500px;overflow:hidden;}
  .fundo{
    position:relative; width:1024px; height:500px;
    background:
      radial-gradient(120% 140% at 78% 8%, rgba(255,255,255,0.18), transparent 55%),
      radial-gradient(90% 120% at 10% 100%, rgba(47,214,200,0.35), transparent 60%),
      linear-gradient(120deg, #7f5ff2 0%, #4a33b8 55%, #1c1548 100%);
    font-family:'Plus Jakarta Sans', sans-serif;
  }
  .arte{position:absolute; left:-10px; top:-40px; width:480px; height:480px;}
  .texto{position:absolute; right:56px; top:0; height:500px; width:460px; display:flex; flex-direction:column; justify-content:center; align-items:flex-end; text-align:right;}
  .nome{font-family:'Unbounded', sans-serif; font-weight:900; font-size:92px; line-height:1.02; color:#fff; margin:0; letter-spacing:-0.01em;}
  .selo{margin-top:18px; display:inline-flex; align-items:center; gap:10px; background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.35); border-radius:100px; padding:10px 22px;}
  .selo span{font-family:'Plus Jakarta Sans', sans-serif; font-weight:700; font-size:26px; color:#fff; letter-spacing:0.02em;}
</style>
<div class="fundo">
  <img class="arte" src="file://__ARTE__">
  <div class="texto">
    <div class="nome">Sinergia<br>JA</div>
    <div class="selo"><span>Escola Sabatina Jovem</span></div>
  </div>
</div>
HTML
sed -i '' "s#__ARTE__#$TMP/arte.svg#" "$TMP/pagina.html"

"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=$LARGURA,$ALTURA \
  --screenshot="$TMP/mestre.png" "file://$TMP/pagina.html" >/dev/null 2>&1

magick "$TMP/mestre.png" -resize ${LARGURA}x${ALTURA}! -alpha off -strip "$SAIDA"
echo "imagem de destaque gerada em $SAIDA"
