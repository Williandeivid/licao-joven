// Monta q4-conteudo/<id>.json a partir de q4-fonte/<id>.js.
// A resposta certa e escrita separada das erradas; aqui ela ganha uma
// posicao em rodizio (A, B, C, D...) e a letra do gabarito e CALCULADA.
// Isso elimina a classe de erro que ja aconteceu duas vezes no app:
// gabarito digitado a mao, concentrado em A e B, com respostas trocadas.
const fs = require('fs');
const path = require('path');
const [dirTrab, ...ids] = process.argv.slice(2);
const LETRAS = ['A', 'B', 'C', 'D'];
const DIFS = ['Fácil', 'Média', 'Difícil', 'Bíblica · Intermediária', 'Bíblica · Difícil'];
const ORDEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
let erros = 0;
const erro = msg => { console.error('ERRO: ' + msg); erros++; };

// Sigla usada no texto da CPB -> id do livro no app (o mesmo de BIBLE_BOOKS).
const USFM = {
  'Gn':'GEN','Êx':'EXO','Lv':'LEV','Nm':'NUM','Dt':'DEU','Js':'JOS','Jz':'JDG','Rt':'RUT','1Sm':'1SA','2Sm':'2SA',
  '1Rs':'1KI','2Rs':'2KI','1Cr':'1CH','2Cr':'2CH','Ed':'EZR','Ne':'NEH','Et':'EST','Jó':'JOB','Sl':'PSA','Pv':'PRO',
  'Ec':'ECC','Ct':'SNG','Is':'ISA','Jr':'JER','Lm':'LAM','Ez':'EZK','Dn':'DAN','Os':'HOS','Jl':'JOL','Am':'AMO',
  'Ob':'OBA','Jn':'JON','Mq':'MIC','Na':'NAM','Hc':'HAB','Sf':'ZEP','Ag':'HAG','Zc':'ZEC','Ml':'MAL','Mt':'MAT',
  'Mc':'MRK','Lc':'LUK','Jo':'JHN','At':'ACT','Rm':'ROM','1Co':'1CO','2Co':'2CO','Gl':'GAL','Ef':'EPH','Fp':'PHP',
  'Cl':'COL','1Ts':'1TH','2Ts':'2TH','1Tm':'1TI','2Tm':'2TI','Tt':'TIT','Fm':'PHM','Hb':'HEB','Tg':'JAS','1Pe':'1PE',
  '2Pe':'2PE','1Jo':'1JN','2Jo':'2JN','3Jo':'3JN','Jd':'JUD','Ap':'REV'
};
// Transforma "Gn 3:8", "Gn 2:2, 3" e "Jo 10:27-30" em versiculo tocavel, no
// mesmo formato que o 3o trimestre ja traz pronto no conteudo.
function linkarVersiculos(texto){
  return texto.replace(/\b([123]?[A-ZÁÉÍÓÚÊÔ][a-záéíóúêôãõç]{0,2})\s(\d{1,3}):(\d{1,3})(?:\s?[-–,]\s?(\d{1,3}))?/g,
    (m, sigla, cap, v1, v2) => {
      const livro = USFM[sigla];
      if(!livro) return m;
      return `<span class="vref" data-book="${livro}" data-chapter="${cap}" data-v1="${v1}" data-v2="${v2 || v1}" onclick="toggleVerseLive(this)">${m}</span><span class="vref-pop"></span>`;
    });
}

for (const id of ids) {
  const fonte = require(path.join(dirTrab, 'q4-fonte', id + '.js'));
  const saida = { days: {} };
  const contagem = { A: 0, B: 0, C: 0, D: 0 };
  let tfV = 0, tfF = 0;

  ORDEM.forEach((dia, iDia) => {
    const f = fonte[dia];
    if (!f) { erro(`${id}/${dia}: dia ausente`); return; }
    for (const campo of ['title', 'summary', 'keyideas']) if (!f[campo]) erro(`${id}/${dia}: sem ${campo}`);
    if (!Array.isArray(f.body) || f.body.length < 2) erro(`${id}/${dia}: body curto`);
    if (!Array.isArray(f.reflect) || f.reflect.length < 2) erro(`${id}/${dia}: reflect curto`);

    const d = {
      title: f.title, keyideas: f.keyideas, summary: f.summary,
      centraltexts: f.centraltexts || [],
      body: (f.body || []).map(p => '<p>' + linkarVersiculos(p) + '</p>'),
      reflect: f.reflect || []
    };

    if (dia !== 'sab') {
      if (!f.quiz || f.quiz.length !== 10) erro(`${id}/${dia}: quiz precisa de 10 perguntas`);
      const questions = [], answers = [];
      (f.quiz || []).forEach((q, i) => {
        if (!DIFS.includes(q.diff)) erro(`${id}/${dia} q${i+1}: dificuldade "${q.diff}"`);
        if (!q.certa || !Array.isArray(q.erradas) || q.erradas.length !== 3) erro(`${id}/${dia} q${i+1}: precisa de 1 certa e 3 erradas`);
        const todas = [q.certa, ...(q.erradas || [])].map(x => String(x).trim().toLowerCase());
        if (new Set(todas).size !== 4) erro(`${id}/${dia} q${i+1}: alternativas repetidas`);
        const pos = (i + iDia) % 4;
        const opts = [...q.erradas];
        opts.splice(pos, 0, q.certa);
        questions.push({ diff: q.diff, text: q.text, opts });
        answers.push(LETRAS[pos]);
        contagem[LETRAS[pos]]++;
        // conferencia de volta: a letra aponta mesmo para a certa?
        if (opts[pos] !== q.certa) erro(`${id}/${dia} q${i+1}: letra nao aponta para a certa`);
      });
      d.quiz = { answers, questions };

      if (!f.tf || f.tf.length !== 4) erro(`${id}/${dia}: V/F precisa de 4 itens`);
      d.tf = { answers: (f.tf || []).map(x => x[1]), items: (f.tf || []).map(x => x[0]) };
      d.tf.answers.forEach(a => { if (a === 'V') tfV++; else if (a === 'F') tfF++; else erro(`${id}/${dia}: V/F invalido "${a}"`); });
    }
    saida.days[dia] = d;
  });

  fs.mkdirSync(path.join(dirTrab, 'q4-conteudo'), { recursive: true });
  fs.writeFileSync(path.join(dirTrab, 'q4-conteudo', id + '.json'), JSON.stringify(saida, null, 1));
  const total = Object.values(contagem).reduce((a, b) => a + b, 0);
  console.log(`licao ${id}: ${total} perguntas | gabarito A=${contagem.A} B=${contagem.B} C=${contagem.C} D=${contagem.D} | V/F: V=${tfV} F=${tfF}`);
}
if (erros) { console.error(erros + ' erro(s) - nada deve ser publicado'); process.exit(1); }
