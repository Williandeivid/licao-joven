// Confere a traducao contra o app: para cada pergunta, a letra do gabarito
// (do portugues, em index.html) tem de cair na resposta certa traduzida, e o
// V/F traduzido tem de estar na mesma posicao do portugues.
//   node q4-conferir-trad.js <dirTrab> <index.html> <idioma> <id...>
const fs = require('fs'), path = require('path');
const [dirTrab, arqIndex, idioma, ...ids] = process.argv.slice(2);
const s = fs.readFileSync(arqIndex, 'utf8');
const L = JSON.parse(s.match(/const LESSONS_CONTENT = (\[.*?\]);\r?\n/)[1]);
const T = JSON.parse(fs.readFileSync(path.join(path.dirname(arqIndex), `licoes-${idioma}.json`), 'utf8'));
let erros = 0, ok = 0;
for (const id of ids.map(Number)) {
  const pt = L.find(l => l.id === id), tr = T.find(l => l.id === id);
  const fonteTr = require(path.join(dirTrab, 'q4-trad', idioma, id + '.js'));
  const fontePt = require(path.join(dirTrab, 'q4-fonte', id + '.js'));
  for (const dPt of pt.days) {
    if (!dPt.quiz) continue;
    const dTr = tr.days.find(d => d.id === dPt.id);
    dPt.quiz.answers.forEach((letra, i) => {
      const certaTr = fonteTr[dPt.id].quiz[i][1];
      const naPosicao = dTr.quiz.questions[i].opts[letra.charCodeAt(0) - 65];
      const certaPt = fontePt[dPt.id].quiz[i].certa;
      const ptNaPosicao = dPt.quiz.questions[i].opts[letra.charCodeAt(0) - 65];
      if (naPosicao !== certaTr || ptNaPosicao !== certaPt) { erros++; console.log(`ERRO ${id}/${dPt.id} q${i+1}: letra ${letra} -> "${naPosicao}" (esperado "${certaTr}")`); }
      else ok++;
    });
    dPt.tf.items.forEach((item, i) => {
      const iFonte = fontePt[dPt.id].tf.findIndex(x => x[0] === item);
      const esperado = fonteTr[dPt.id].tf[iFonte][0];
      if (dTr.tf.items[i] !== esperado) { erros++; console.log(`ERRO ${id}/${dPt.id} V/F ${i+1}: posicao trocada`); }
      else ok++;
    });
  }
}
console.log(`${idioma}: ${ok} itens conferidos, ${erros} erro(s)`);
if (erros) process.exit(1);
