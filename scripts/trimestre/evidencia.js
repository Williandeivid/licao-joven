// Para cada pergunta, procura no texto OFICIAL do dia a frase que sustenta
// a resposta certa. Nota = fracao das palavras-chave da resposta achadas na
// melhor frase. Nota baixa nao quer dizer errado: quer dizer "olhe a mao".
const fs = require('fs');
const path = require('path');
const [dirTrab, id] = process.argv.slice(2);
const fonte = require(path.join(dirTrab, 'q4-fonte', id + '.js'));
const num = String(Number(id) - 13).padStart(2, '0');
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const norm = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[“”"'().,:;!?—–-]/g, ' ');
const PARADAS = new Set('para pela pelo pelos pelas como mais porque quando onde entre sobre depois antes sem com por dos das uma um uns umas que nao sua seu suas seus ele ela eles elas isso este esta esse essa foi era sao ser ter tinha deus'.split(' '));

let semEvidencia = 0;
DIAS.forEach((dia, i) => {
  const f = fonte[dia];
  if (!f || !f.quiz) return;
  const md = fs.readFileSync(path.join(dirTrab, 'q4', num, String(i + 1).padStart(2, '0') + '.md'), 'utf8');
  const frases = md.split(/(?<=[.!?”])\s+|\n+/).map(s => s.trim()).filter(s => s.length > 20);
  const melhor = texto => {
    const chaves = norm(texto).split(/\s+/).filter(w => (w.length >= 4 || /\d/.test(w)) && !PARADAS.has(w));
    if (!chaves.length) return { nota: 1, frase: '(resposta curta: conferir a mao)' };
    let top = { nota: 0, frase: '' };
    for (const fr of frases) {
      const n = norm(fr);
      const achadas = chaves.filter(c => n.includes(c)).length / chaves.length;
      if (achadas > top.nota) top = { nota: achadas, frase: fr };
    }
    return top;
  };
  console.log(`\n===== ${dia.toUpperCase()} — ${f.title} =====`);
  f.quiz.forEach((q, k) => {
    const r = melhor(q.certa + ' ' + q.text);
    const marca = r.nota >= 0.5 ? 'ok ' : 'OLHAR';
    if (r.nota < 0.5) semEvidencia++;
    console.log(`${marca} q${k + 1} ${q.text}\n      -> ${q.certa}\n      fonte (${Math.round(r.nota * 100)}%): ${r.frase.slice(0, 170)}`);
  });
  f.tf.forEach(([item, v], k) => {
    const r = melhor(item);
    console.log(`${r.nota >= 0.5 ? 'ok ' : 'OLHAR'} V/F${k + 1} [${v}] ${item}\n      fonte (${Math.round(r.nota * 100)}%): ${r.frase.slice(0, 170)}`);
    if (r.nota < 0.5) semEvidencia++;
  });
});
console.log(`\n${semEvidencia} item(ns) sem evidencia automatica - conferir a mao`);
