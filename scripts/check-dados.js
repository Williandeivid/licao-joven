// Confere os dados das licoes antes de publicar. Rodar na raiz do projeto:
//   node scripts/check-dados.js
// Sai com codigo 1 se achar erro - e o teste que teria pego o gabarito errado
// em 59 de 78 dias do 3o trimestre de 2026.
//
// ERRO  = impede publicar (dado quebrado ou incoerente)
// AVISO = vale uma olhada humana (ex.: gabarito concentrado numa letra)
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
let erros = 0, avisos = 0;
const erro = m => { console.log('ERRO  ' + m); erros++; };
const aviso = m => { console.log('AVISO ' + m); avisos++; };

// --- conteudo em portugues, que mora dentro do index.html
const marca = 'const LESSONS_CONTENT = ';
const ini = html.indexOf(marca);
const fimLinha = html.indexOf('\n', ini);
const LICOES = JSON.parse(html.slice(ini + marca.length, html.lastIndexOf(']', fimLinha) + 1));

const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const ids = LICOES.map(l => l.id);
ids.forEach((id, i) => { if (i && id !== ids[i - 1] + 1) erro(`licoes fora de sequencia: ${ids[i - 1]} -> ${id}`); });

for (const l of LICOES) {
  const nomes = l.days.map(d => d.id).join(',');
  if (nomes !== DIAS.join(',')) erro(`licao ${l.id}: dias ${nomes}`);
  const letras = { A: 0, B: 0, C: 0, D: 0 };
  for (const d of l.days) {
    const onde = `licao ${l.id}/${d.id}`;
    if (d.quiz) {
      const q = d.quiz;
      if (!Array.isArray(q.answers) || q.answers.length !== q.questions.length) erro(`${onde}: ${q.questions.length} perguntas e ${q.answers && q.answers.length} respostas`);
      q.questions.forEach((p, i) => {
        if (!Array.isArray(p.opts) || p.opts.length !== 4) erro(`${onde} q${i + 1}: ${p.opts && p.opts.length} alternativas`);
        if (new Set((p.opts || []).map(o => String(o).trim().toLowerCase())).size !== (p.opts || []).length) erro(`${onde} q${i + 1}: alternativas repetidas`);
        const r = q.answers[i];
        if (!'ABCD'.includes(r) || !r) erro(`${onde} q${i + 1}: resposta "${r}"`);
        else letras[r]++;
      });
    }
    if (d.tf) {
      if (d.tf.answers.length !== d.tf.items.length) erro(`${onde}: V/F com ${d.tf.items.length} itens e ${d.tf.answers.length} respostas`);
      d.tf.answers.forEach((a, i) => { if (a !== 'V' && a !== 'F') erro(`${onde} V/F ${i + 1}: "${a}"`); });
    }
  }
  const total = Object.values(letras).reduce((a, b) => a + b, 0);
  if (total) {
    const [letra, n] = Object.entries(letras).sort((a, b) => b[1] - a[1])[0];
    if (n / total > 0.6) aviso(`licao ${l.id}: ${Math.round(n / total * 100)}% das respostas em ${letra} (A=${letras.A} B=${letras.B} C=${letras.C} D=${letras.D}) - confira uma amostra`);
  }
}

// --- alternativas que entregam a resposta pelo TAMANHO.
// Medido em 16/10/2026 nas 1.560 perguntas existentes: em 56% delas a resposta
// certa era a mais longa das quatro (o acaso daria 25%), e quem chutasse sempre
// a alternativa maior tiraria 5,6/10 sem ler nada. Dai a media da turma de 98%.
// Esta checagem existe para o problema nao voltar nas licoes novas.
//
// LIMITE_MAIS_LONGA: ate 40% das perguntas de uma licao podem ter a certa como
// a mais longa. Acima disso o padrao ja' e' perceptivel para quem responde.
// LIMITE_DIFERENCA: uma alternativa certa com 8+ caracteres a mais que a maior
// errada e' um caso grave sozinho - nao precisa de padrao, ja' denuncia.
//
// NAO existe regra de "alternativa curta demais". A primeira versao tinha, e
// acusava pergunta boa: "Ana / Maria / Priscila / Lidia", "Quatro / Duas /
// Sete / Doze" e listas de referencia biblica sao curtas de proposito e nao
// entregam nada. O defeito nunca e' o tamanho - e' a DESPROPORCAO entre a
// certa e as erradas, que as duas regras acima ja' medem.
const LIMITE_MAIS_LONGA = 0.40;
const LIMITE_DIFERENCA = 8;
// Ser "a mais longa" por 1 ou 2 caracteres nao entrega nada a ninguem
// ("Cinco" contra "Quatro", "Jeremias 36:20-32" contra "Jeremias 36:1-19").
// So conta para a proporcao quando a diferenca da' para notar de relance.
const MARGEM_QUE_SE_NOTA = 3;

for (const l of LICOES) {
  let perguntas = 0, maisLonga = 0;
  const graves = [];
  for (const d of l.days) {
    if (!d.quiz || !d.quiz.questions) continue;
    d.quiz.questions.forEach((q, i) => {
      if (!q.opts || !d.quiz.answers || !d.quiz.answers[i]) return;
      const idx = String(d.quiz.answers[i]).charCodeAt(0) - 65;
      const certa = q.opts[idx];
      if (typeof certa !== 'string') return;
      perguntas++;
      const erradas = q.opts.filter((_, k) => k !== idx);
      const maiorErrada = Math.max(...erradas.map(o => String(o).length));
      if (certa.length - maiorErrada >= MARGEM_QUE_SE_NOTA) maisLonga++;
      if (certa.length - maiorErrada >= LIMITE_DIFERENCA) graves.push(`${d.id} q${i + 1}`);
    });
  }
  if (!perguntas) continue;
  const proporcao = maisLonga / perguntas;
  if (proporcao > LIMITE_MAIS_LONGA) {
    aviso(`licao ${l.id}: em ${Math.round(proporcao * 100)}% das perguntas a resposta certa e' a mais longa (limite ${Math.round(LIMITE_MAIS_LONGA * 100)}%) - da' para acertar sem ler`);
  }
  if (graves.length) {
    aviso(`licao ${l.id}: ${graves.length} pergunta(s) com a certa ${LIMITE_DIFERENCA}+ caracteres maior que a maior errada: ${graves.slice(0, 6).join(', ')}${graves.length > 6 ? '...' : ''}`);
  }
}

// --- traducoes: o gabarito NAO vai no JSON traduzido, ele casa por posicao.
// Se a contagem de perguntas ou de alternativas divergir, o quiz traduzido
// fica errado em silencio. Por isso a checagem e de quantidade e ordem.
for (const idioma of ['en', 'es']) {
  const arq = path.join(raiz, `licoes-${idioma}.json`);
  if (!fs.existsSync(arq)) continue;
  let tr;
  try { tr = JSON.parse(fs.readFileSync(arq, 'utf8')); }
  catch (e) { erro(`licoes-${idioma}.json nao abre: ${e.message}`); continue; }
  const lista = Array.isArray(tr) ? tr : (tr.licoes || tr.lessons || Object.values(tr));
  for (const lt of lista) {
    const pt = LICOES.find(l => l.id === lt.id);
    if (!pt || !lt.days) continue;
    for (const dt of lt.days) {
      const dp = pt.days.find(d => d.id === dt.id);
      if (!dp || !dt.quiz || !dp.quiz) continue;
      const qt = dt.quiz.questions || [], qp = dp.quiz.questions;
      if (qt.length !== qp.length) erro(`${idioma} licao ${lt.id}/${dt.id}: ${qt.length} perguntas x ${qp.length} em pt`);
      qt.forEach((q, i) => { if (q.opts && qp[i] && q.opts.length !== qp[i].opts.length) erro(`${idioma} licao ${lt.id}/${dt.id} q${i + 1}: alternativas ${q.opts.length} x ${qp[i].opts.length}`); });
    }
  }
}

console.log(`\n${LICOES.length} licoes conferidas: ${erros} erro(s), ${avisos} aviso(s)`);
process.exit(erros ? 1 : 0);
