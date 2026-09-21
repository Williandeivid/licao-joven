// Gera o esqueleto das licoes 14-26 (4o trimestre 2026) a partir dos .md
// oficiais da Adventech. O conteudo proprio do app (resumo, quiz, V/F) entra
// depois, licao por licao; aqui so o que vem direto da fonte.
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2];

const LIVROS = {
  'Gn':'Gênesis','Êx':'Êxodo','Lv':'Levítico','Nm':'Números','Dt':'Deuteronômio','Js':'Josué','Jz':'Juízes','Rt':'Rute',
  '1Sm':'1 Samuel','2Sm':'2 Samuel','1Rs':'1 Reis','2Rs':'2 Reis','1Cr':'1 Crônicas','2Cr':'2 Crônicas','Ed':'Esdras','Ne':'Neemias','Et':'Ester',
  'Jó':'Jó','Sl':'Salmos','Pv':'Provérbios','Ec':'Eclesiastes','Ct':'Cantares','Is':'Isaías','Jr':'Jeremias','Lm':'Lamentações','Ez':'Ezequiel','Dn':'Daniel',
  'Os':'Oseias','Jl':'Joel','Am':'Amós','Ob':'Obadias','Jn':'Jonas','Mq':'Miqueias','Na':'Naum','Hc':'Habacuque','Sf':'Sofonias','Ag':'Ageu','Zc':'Zacarias','Ml':'Malaquias',
  'Mt':'Mateus','Mc':'Marcos','Lc':'Lucas','Jo':'João','At':'Atos','Rm':'Romanos','1Co':'1 Coríntios','2Co':'2 Coríntios','Gl':'Gálatas','Ef':'Efésios','Fp':'Filipenses',
  'Cl':'Colossenses','1Ts':'1 Tessalonicenses','2Ts':'2 Tessalonicenses','1Tm':'1 Timóteo','2Tm':'2 Timóteo','Tt':'Tito','Fm':'Filemom','Hb':'Hebreus','Tg':'Tiago',
  '1Pe':'1 Pedro','2Pe':'2 Pedro','1Jo':'1 João','2Jo':'2 João','3Jo':'3 João','Jd':'Judas','Ap':'Apocalipse'
};
const expandir = ref => {
  const m = String(ref).trim().match(/^([123]?[A-ZÁÉÍÓÚÊÔ][a-záéíóúêôãõç]*)\s*(.*)$/);
  if(!m || !LIVROS[m[1]]) return String(ref).trim();
  return (LIVROS[m[1]] + ' ' + m[2]).trim();
};

const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const DIAS = [
  {id:'dom', letter:'D', nome:'Domingo'}, {id:'seg', letter:'S', nome:'Segunda'}, {id:'ter', letter:'T', nome:'Terça'},
  {id:'qua', letter:'Q', nome:'Quarta', sufixo:' · Momento Hipertexto'}, {id:'qui', letter:'Q', nome:'Quinta'},
  {id:'sex', letter:'S', nome:'Sexta'}, {id:'sab', letter:'C', nome:'Sábado', sufixo:' · Comunidade'}
];
const PALAVRA = ['VOZ','CHAMADO','MENSAGEIROS','TESTEMUNHAS','INSPIRAÇÃO','ESCRITOS','ATENÇÃO','INTERPRETAR','PROVA','AUTORIDADE','DECISÃO','LUZ','BÊNÇÃO'];

const lerData = s => { const [d,m,a] = s.split('/').map(Number); return new Date(a, m-1, d); };
const rotulo = d => `${d.getDate()} de ${MESES[d.getMonth()]}`;

// Referencias biblicas no texto: "Gn 3:8", "1Rs 19:1-16", "Jo 14:7-9"
const RE_REF = /\b([123]?[A-ZÁÉÍÓÚÊÔ][a-záéíóúêôãõç]{0,3})\s(\d{1,3}:\d{1,3}(?:[-–]\d{1,3})?)/g;
function referencias(texto){
  const fora = [];
  let m;
  while((m = RE_REF.exec(texto))){
    if(!LIVROS[m[1]]) continue;
    const r = expandir(m[1] + ' ' + m[2]);
    if(!fora.includes(r)) fora.push(r);
    if(fora.length >= 3) break;
  }
  return fora;
}

const licoes = [];
for(let n = 1; n <= 13; n++){
  const pasta = path.join(DIR, String(n).padStart(2,'0'));
  const info = fs.readFileSync(path.join(pasta,'info.yml'),'utf8');
  const titulo = info.match(/title:\s*"([^"]+)"/)[1];
  const inicio = lerData(info.match(/start_date:\s*"([^"]+)"/)[1]);
  const fim = lerData(info.match(/end_date:\s*"([^"]+)"/)[1]);
  const dom = fs.readFileSync(path.join(pasta,'01.md'),'utf8');
  const base = (dom.match(/desta semana:\*\*\s*(.+)/) || [,''])[1].trim();

  const dias = DIAS.map((d, i) => {
    const md = fs.readFileSync(path.join(pasta, String(i+1).padStart(2,'0') + '.md'), 'utf8');
    const corpo = md.split('---').slice(2).join('---');
    const titulos = [...corpo.matchAll(/^### (.+)$/gm)].map(x => x[1].trim())
      .filter(x => !/^Texto-chave$/i.test(x) && !/^Momento Hipertexto$/i.test(x) && !/^Redesem/i.test(x) && !/^Mergulhe/i.test(x));
    const data = new Date(inicio); data.setDate(inicio.getDate() + i);
    const dia = {
      id: d.id, letter: d.letter,
      date: `${d.nome} · ${rotulo(data)}${d.sufixo || ''}`,
      title: titulos[0] || (d.id === 'qua' ? 'Momento Hipertexto' : titulo),
      centraltexts: d.id === 'dom' && base ? base.split(';').map(x => expandir(x.trim())) : referencias(corpo)
    };
    return dia;
  });

  licoes.push({
    id: 13 + n,
    title: titulo,
    keyword: PALAVRA[n-1],
    bibleref: base.split(';').map(x => expandir(x.trim())).join('; '),
    daterange: `${rotulo(inicio)} a ${rotulo(fim)}`,
    days: dias
  });
}
fs.writeFileSync(path.join(DIR, '..', 'q4-esqueleto.json'), JSON.stringify(licoes, null, 1));
licoes.forEach(l => console.log(l.id, '|', l.title.padEnd(28), '|', l.bibleref.padEnd(18), '|', l.daterange, '|', l.days.map(d=>d.title).join(' / ').slice(0,90)));
