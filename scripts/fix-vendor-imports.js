// O plugin vem com imports relativos sem extensao ('./definitions'), que so
// funcionam com bundler. No WebView do Capacitor o modulo e carregado direto
// e o servidor devolve HTML pra esses caminhos, entao acrescentamos o '.js'.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'www', 'vendor', 'capacitor-firebase-authentication');
for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.js'))) {
  const p = path.join(dir, f);
  const src = fs.readFileSync(p, 'utf8');
  const out = src.replace(/(from\s+|import\()(['"])(\.\/[\w-]+)\2/g, '$1$2$3.js$2');
  if (out !== src) fs.writeFileSync(p, out);
}
