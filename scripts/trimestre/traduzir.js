// Monta a traducao (en/es) das licoes do 4o trimestre e grava em licoes-<idioma>.json.
//   node q4-traduzir.js <dirTrab> <arquivo licoes-xx.json> <idioma> <id> [id...]
// Fonte: <dirTrab>/q4-trad/<idioma>/<id>.js, no MESMO ORDEM do portugues
// (q4-fonte/<id>.js). O app nao guarda gabarito na traducao: a letra certa
// vem do portugues e aponta para uma POSICAO. Por isso as alternativas saem
// daqui pela mesma regra do q4-montar.js - a certa na posicao (i+iDia)%4 e
// o V/F no mesmo padrao - e o script confere que os V/F batem com o portugues.
//
// Formato da fonte traduzida:
//   module.exports = { title, keyword,
//     dom: { title, summary, body:[...], reflect:[...],
//            quiz:[[pergunta, certa, errada1, errada2, errada3], ...10],
//            tf:[[afirmacao, 'V'|'F'], ...4] },
//     ... sab: { title, summary, body, reflect } }
// Referencias no body vao como {Gn 3:8} (sigla em portugues); aqui viram o
// versiculo tocavel com o nome do livro no idioma.
const fs = require('fs');
const path = require('path');
const [dirTrab, arqSaida, idioma, ...ids] = process.argv.slice(2);
const ORDEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const PADROES = ['VVFF', 'FVVF', 'VFFV', 'FFVV', 'VFFV', 'FVVF'];
let erros = 0;
const erro = m => { console.error('ERRO: ' + m); erros++; };

const USFM = {
  'Gn':'GEN','Êx':'EXO','Lv':'LEV','Nm':'NUM','Dt':'DEU','Js':'JOS','Jz':'JDG','Rt':'RUT','1Sm':'1SA','2Sm':'2SA',
  '1Rs':'1KI','2Rs':'2KI','1Cr':'1CH','2Cr':'2CH','Ed':'EZR','Ne':'NEH','Et':'EST','Jó':'JOB','Sl':'PSA','Pv':'PRO',
  'Ec':'ECC','Ct':'SNG','Is':'ISA','Jr':'JER','Lm':'LAM','Ez':'EZK','Dn':'DAN','Os':'HOS','Jl':'JOL','Am':'AMO',
  'Ob':'OBA','Jn':'JON','Mq':'MIC','Na':'NAM','Hc':'HAB','Sf':'ZEP','Ag':'HAG','Zc':'ZEC','Ml':'MAL','Mt':'MAT',
  'Mc':'MRK','Lc':'LUK','Jo':'JHN','At':'ACT','Rm':'ROM','1Co':'1CO','2Co':'2CO','Gl':'GAL','Ef':'EPH','Fp':'PHP',
  'Cl':'COL','1Ts':'1TH','2Ts':'2TH','1Tm':'1TI','2Tm':'2TI','Tt':'TIT','Fm':'PHM','Hb':'HEB','Tg':'JAS','1Pe':'1PE',
  '2Pe':'2PE','1Jo':'1JN','2Jo':'2JN','3Jo':'3JN','Jd':'JUD','Ap':'REV'
};
const ABREV = {
  en: { GEN:'Gen.',EXO:'Exod.',LEV:'Lev.',NUM:'Num.',DEU:'Deut.',JOS:'Josh.',JDG:'Judg.',RUT:'Ruth','1SA':'1 Sam.','2SA':'2 Sam.',
    '1KI':'1 Kings','2KI':'2 Kings','1CH':'1 Chron.','2CH':'2 Chron.',EZR:'Ezra',NEH:'Neh.',EST:'Esther',JOB:'Job',PSA:'Ps.',PRO:'Prov.',
    ECC:'Eccles.',SNG:'Song',ISA:'Isa.',JER:'Jer.',LAM:'Lam.',EZK:'Ezek.',DAN:'Dan.',HOS:'Hos.',JOL:'Joel',AMO:'Amos',
    OBA:'Obad.',JON:'Jon.',MIC:'Mic.',NAM:'Nah.',HAB:'Hab.',ZEP:'Zeph.',HAG:'Hag.',ZEC:'Zech.',MAL:'Mal.',MAT:'Matt.',
    MRK:'Mark',LUK:'Luke',JHN:'John',ACT:'Acts',ROM:'Rom.','1CO':'1 Cor.','2CO':'2 Cor.',GAL:'Gal.',EPH:'Eph.',PHP:'Phil.',
    COL:'Col.','1TH':'1 Thess.','2TH':'2 Thess.','1TI':'1 Tim.','2TI':'2 Tim.',TIT:'Titus',PHM:'Philem.',HEB:'Heb.',JAS:'James','1PE':'1 Pet.',
    '2PE':'2 Pet.','1JN':'1 John','2JN':'2 John','3JN':'3 John',JUD:'Jude',REV:'Rev.' },
  es: { GEN:'Gén.',EXO:'Éx.',LEV:'Lev.',NUM:'Núm.',DEU:'Deut.',JOS:'Jos.',JDG:'Juec.',RUT:'Rut','1SA':'1 Sam.','2SA':'2 Sam.',
    '1KI':'1 Rey.','2KI':'2 Rey.','1CH':'1 Crón.','2CH':'2 Crón.',EZR:'Esd.',NEH:'Neh.',EST:'Est.',JOB:'Job',PSA:'Sal.',PRO:'Prov.',
    ECC:'Ecl.',SNG:'Cant.',ISA:'Isa.',JER:'Jer.',LAM:'Lam.',EZK:'Eze.',DAN:'Dan.',HOS:'Ose.',JOL:'Joel',AMO:'Amós',
    OBA:'Abd.',JON:'Jon.',MIC:'Miq.',NAM:'Nah.',HAB:'Hab.',ZEP:'Sof.',HAG:'Hag.',ZEC:'Zac.',MAL:'Mal.',MAT:'Mat.',
    MRK:'Mar.',LUK:'Luc.',JHN:'Juan',ACT:'Hech.',ROM:'Rom.','1CO':'1 Cor.','2CO':'2 Cor.',GAL:'Gál.',EPH:'Efe.',PHP:'Fil.',
    COL:'Col.','1TH':'1 Tes.','2TH':'2 Tes.','1TI':'1 Tim.','2TI':'2 Tim.',TIT:'Tito',PHM:'Filem.',HEB:'Heb.',JAS:'Sant.','1PE':'1 Ped.',
    '2PE':'2 Ped.','1JN':'1 Juan','2JN':'2 Juan','3JN':'3 Juan',JUD:'Jud.',REV:'Apoc.' }
};
const TITULO_REFLEXAO = {
  en: { dia: 'Reflection Questions', sab: 'Open Dialogue (group discussion)' },
  es: { dia: 'Preguntas de Reflexión', sab: 'Diálogo Abierto (discusión en grupo)' }
};

// {Gn 3:8} {Gn 2:2, 3} {Jo 10:27-30} {Dt 27–30} {Ap 2; 3}
function linkar(texto, onde){
  return texto.replace(/\{([^}]+)\}/g, (m, dentro) => {
    const r = dentro.match(/^([123]?[A-ZÁÉÍÓÚÊÔ][a-záéíóúêôãõç]{0,2})\s(.+)$/);
    if (!r || !USFM[r[1]]) { erro(`${onde}: referencia nao reconhecida "${dentro}"`); return dentro; }
    const livro = USFM[r[1]], resto = r[2];
    const nome = ABREV[idioma][livro] + ' ' + resto;
    const v = resto.match(/^(\d{1,3}):(\d{1,3})(?:\s?[-–,]\s?(\d{1,3}))?/);
    if (!v) return nome; // capitulo inteiro ("Ap 2; 3"): so traduz o nome
    return `<span class="vref" data-book="${livro}" data-chapter="${v[1]}" data-v1="${v[2]}" data-v2="${v[3] || v[2]}" onclick="toggleVerseLive(this)">${nome}</span><span class="vref-pop"></span>`;
  });
}

const lista = JSON.parse(fs.readFileSync(arqSaida, 'utf8'));
for (const id of ids) {
  const pt = require(path.join(dirTrab, 'q4-fonte', id + '.js'));
  const tr = require(path.join(dirTrab, 'q4-trad', idioma, id + '.js'));
  if (!tr.title || !tr.keyword) erro(`${id}: sem title/keyword da licao`);
  const dias = [];
  ORDEM.forEach((dia, iDia) => {
    const p = pt[dia], t = tr[dia], onde = `${idioma}/${id}/${dia}`;
    if (!t) { erro(`${onde}: dia ausente`); return; }
    for (const c of ['title', 'summary']) if (!t[c]) erro(`${onde}: sem ${c}`);
    if (!Array.isArray(t.body) || t.body.length !== p.body.length) erro(`${onde}: body com ${t.body && t.body.length} paragrafos (pt tem ${p.body.length})`);
    if (!Array.isArray(t.reflect) || t.reflect.length !== p.reflect.length) erro(`${onde}: reflect com ${t.reflect && t.reflect.length} (pt tem ${p.reflect.length})`);
    const d = {
      id: dia, title: t.title, summary: t.summary,
      body: (t.body || []).map(par => '<p>' + linkar(par, onde) + '</p>'),
      reflectTitle: TITULO_REFLEXAO[idioma][dia === 'sab' ? 'sab' : 'dia'],
      reflect: t.reflect || []
    };
    if (dia !== 'sab') {
      if (!t.quiz || t.quiz.length !== p.quiz.length) erro(`${onde}: quiz com ${t.quiz && t.quiz.length} (pt tem ${p.quiz.length})`);
      d.quiz = { questions: (t.quiz || []).map((q, i) => {
        if (!Array.isArray(q) || q.length !== 5) { erro(`${onde} q${i+1}: precisa [pergunta, certa, 3 erradas]`); return { text: '', opts: [] }; }
        const [text, certa, ...erradas] = q;
        if (new Set([certa, ...erradas].map(x => x.trim().toLowerCase())).size !== 4) erro(`${onde} q${i+1}: alternativas repetidas`);
        const pos = (i + iDia) % 4;
        const opts = [...erradas];
        opts.splice(pos, 0, certa);
        return { text, opts };
      }) };
      const flagsPt = p.tf.map(x => x[1]).join(''), flagsTr = (t.tf || []).map(x => x[1]).join('');
      if (flagsPt !== flagsTr) erro(`${onde}: V/F ${flagsTr} nao bate com o portugues ${flagsPt}`);
      const filaV = (t.tf || []).filter(x => x[1] === 'V'), filaF = (t.tf || []).filter(x => x[1] === 'F');
      const padrao = PADROES[(iDia + Number(id)) % PADROES.length];
      d.tf = { items: [...padrao].map(c => (c === 'V' ? filaV.shift() : filaF.shift())[0]) };
    }
    dias.push(d);
  });
  const entrada = { id: Number(id), title: tr.title, keyword: tr.keyword, days: dias };
  const i = lista.findIndex(l => l.id === Number(id));
  if (i >= 0) lista[i] = entrada; else lista.push(entrada);
  console.log(`${idioma} ${id}: ${dias.length} dias`);
}
if (erros) { console.error(erros + ' erro(s) - nada gravado'); process.exit(1); }
lista.sort((a, b) => a.id - b.id);
// Mesmo formato do arquivo do Josias (2 espacos, CRLF), para o diff ficar legivel.
fs.writeFileSync(arqSaida, JSON.stringify(lista, null, 2).replace(/\n/g, '\r\n'));
console.log('gravado em', arqSaida, '| licoes:', lista.map(l => l.id).join(','));
