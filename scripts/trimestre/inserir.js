// Coloca as licoes 14-26 em LESSONS_CONTENT (uma linha so no index.html).
// Junta o esqueleto (vindo da fonte oficial) com o conteudo proprio ja
// escrito em q4-conteudo/<id>.json, dia por dia. Rodar de novo e seguro:
// substitui as licoes 14-26 inteiras, nunca duplica.
const fs = require('fs');
const path = require('path');
const [arq, dirTrab] = process.argv.slice(2);

const s = fs.readFileSync(arq, 'utf8');
const marca = 'const LESSONS_CONTENT = ';
const ini = s.indexOf(marca);
const fimLinha = s.indexOf('\n', ini);
const linha = s.slice(ini, fimLinha).replace(/\r$/, '');
const json = linha.slice(marca.length, linha.lastIndexOf(']') + 1);
const L = JSON.parse(json);

// Garantia de que o parse/stringify nao altera nada do que ja existe
if (JSON.stringify(L) !== json) { console.error('ROUND-TRIP FALHOU: a linha nao e JSON canonico'); process.exit(1); }

const esqueleto = JSON.parse(fs.readFileSync(path.join(dirTrab, 'q4-esqueleto.json'), 'utf8'));
const dirConteudo = path.join(dirTrab, 'q4-conteudo');

const novas = esqueleto.map(lic => {
  const arqC = path.join(dirConteudo, lic.id + '.json');
  const proprio = fs.existsSync(arqC) ? JSON.parse(fs.readFileSync(arqC, 'utf8')) : null;
  const saida = { id: lic.id, title: lic.title, keyword: lic.keyword, bibleref: lic.bibleref, daterange: lic.daterange, days: [] };
  saida.days = lic.days.map(d => {
    const p = proprio && proprio.days && proprio.days[d.id];
    const dia = {
      id: d.id, letter: d.letter, date: d.date,
      title: (p && p.title) || d.title,
      keyideas: (p && p.keyideas) || '',
      centraltexts: (p && p.centraltexts) || d.centraltexts,
      summary: (p && p.summary) || '',
      body: (p && p.body) || [],
      reflectTitle: 'Perguntas Reflexivas',
      reflect: (p && p.reflect) || []
    };
    if (p && p.quiz) dia.quiz = p.quiz;
    if (p && p.tf) dia.tf = p.tf;
    return dia;
  });
  return saida;
});

const mantidas = L.filter(x => x.id < 14 || x.id > 26);
const final = mantidas.concat(novas);
const novaLinha = marca + JSON.stringify(final) + ';';
const fimOriginal = s.slice(ini, fimLinha).endsWith('\r') ? '\r' : '';
fs.writeFileSync(arq, s.slice(0, ini) + novaLinha + fimOriginal + s.slice(fimLinha));

const comConteudo = novas.filter(l => l.days.some(d => d.body.length)).map(l => l.id);
console.log('licoes no app:', final.length, '| do 4o trimestre:', novas.length, '| com conteudo proprio:', comConteudo.join(',') || 'nenhuma');
