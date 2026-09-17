# Tradução completa da interface (UI) em EN/ES — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nenhum texto fixo da interface aparece em português quando o idioma escolhido é inglês ou espanhol — só conteúdo escrito pela própria pessoa (comentários, nome de exibição) continua como foi digitado.

**Architecture:** Dicionário central `UI_STRINGS` (um objeto por idioma) + função `t(chave)` que resolve a string no idioma atual, caindo pro português se a chave não existir nesse idioma. Texto gerado por JS passa a chamar `t('chave')` dentro do template string. Texto estático no HTML (fora de `<script>`) ganha `data-i18n="chave"` e é preenchido por uma função nova, `aplicarTraducaoEstatica()`, chamada no boot e toda vez que o idioma muda. Nomes de dia da semana passam a ser calculados na hora via `toLocaleDateString`, no idioma atual, a partir da data real de cada dia — não ficam mais gravados como texto fixo. Nomes de livro bíblico usam um helper novo, `bookDisplayName(bookId, idioma)`, que lê campos novos (`name_en`/`name_es`) adicionados a `BIBLE_BOOKS`, derivados dos dicionários de nome→id que já existem (`BOOK_NAME_TO_ID_EN`/`BOOK_NAME_TO_ID_ES`).

**Tech Stack:** HTML/CSS/JS vanilla, sem build step, sem test runner. Verificação manual via `python3 -m http.server` + `mcp__claude-in-chrome__*`, mesmo padrão de todas as tasks anteriores desta branch.

**Spec:** `docs/superpowers/specs/2026-09-17-ui-completa-multi-idioma-design.md`

## Global Constraints

- Nunca traduzir texto que vem de dado do usuário: nome de exibição digitado, texto de comentário, nome de outro usuário no ranking (`nome` vindo do Firebase).
- Nunca mexer em `console.*` — não é visível pra quem usa o app.
- `q.diff` ("Fácil"/"Intermediária"/"Avançada") continua em português — é valor de dado casado com classe CSS (`diffClass`), decisão já tomada na feature de conteúdo original; não faz parte deste plano.
- `LESSONS_META[].title`/`.dateLabel` (usados na lista de lições) continuam em português — são CONTEÚDO (não interface), vêm de um array que nunca passou pela tradução de conteúdo da feature anterior; é um buraco pré-existente registrado, mas está fora do escopo deste plano de UI.
- "ComTexto Bíblico" é nome de produto/marca — nunca traduzir, em nenhum idioma (mesmo tratamento que nomes de versão bíblica como "NVI"/"ARC", que também não traduzem).
- Toda chave nova de `UI_STRINGS` entra nos 3 idiomas (`pt`/`en`/`es`) na mesma task que a introduz — nunca deixar uma chave só em português torcendo pro fallback cobrir depois. O fallback (`t()` cai pro português se a chave não existir no idioma atual) existe só pra não quebrar a tela numa chave *esquecida por engano*, não como plano.
- Texto que cita o nome de outro elemento traduzível (ex.: "Toque em 'Início'...", que cita o botão da nav) **interpola a chave desse elemento via `t()`** em vez de repetir a palavra em português solta — senão o texto citado fica errado em EN/ES.
- Quando a MESMA string em português já existe em mais de um lugar com o MESMO sentido (ex.: "Carregando…", "Esta semana", "pts"), reaproveita uma chave só (nunca duplica a chave com sufixo tipo `.2`); quando o sentido é parecido mas o CONTEXTO é diferente (ex.: "Anterior"/"Próximo" da tela de lição vs. "‹ Anterior"/"Próximo ›" da Bíblia, que usam símbolos de seta diferentes), usa chaves separadas mesmo que a tradução acabe sendo parecida.
- Todo texto novo depois de `t(...)` continua saindo direto num template string / `textContent` — nunca via `innerHTML` com dado não confiável (mesma disciplina de XSS já seguida no resto do projeto). Como toda entrada de `UI_STRINGS` é escrita por nós (não vem de rede/usuário), não precisa escapar, só não interpolar dado do usuário dentro de uma chave.
- Teste sempre com chamada direta de função — nunca `setIdiomaConteudo()` de verdade sem reverter pra `'pt'` logo depois (grava a preferência na conta real via sync com a nuvem).

---

## Task 1: Infraestrutura — `UI_STRINGS`, `t()`, tradução do HTML estático, nav inferior

**Files:**
- Modify: `index.html` (novo bloco `UI_STRINGS`/`t()`, perto de `IDIOMAS_SUPORTADOS`, por volta da linha 4920)
- Modify: `index.html:1532-1552` (nav inferior — HTML estático)
- Modify: `index.html` (`recarregarConteudoNoIdiomaAtual`, por volta da linha 4960)

**Interfaces:**
- Produces:
  - `UI_STRINGS` (objeto módulo, `{pt:{}, en:{}, es:{}}`) — todas as tasks seguintes adicionam chaves aqui.
  - `t(chave)` → `string` — resolve `UI_STRINGS[idiomaConteudoAtual][chave]`, cai pra `UI_STRINGS.pt[chave]` se faltar, cai pra `chave` (a própria string) se nem em pt existir (nunca deve acontecer, é rede de segurança).
  - `aplicarTraducaoEstatica()` → `void` — percorre `[data-i18n]` e aplica `t()` no `textContent`.
- Consumes: `idiomaConteudoAtual` (já existe).

- [ ] **Step 1: Criar `UI_STRINGS` e `t()`**

Localize em `index.html` (logo depois de `IDIOMAS_SUPORTADOS` estar declarado — busque por `const IDIOMAS_SUPORTADOS`):

```js
const IDIOMAS_SUPORTADOS = ['pt', 'en', 'es'];
```

Adicione logo depois:

```js
// Dicionario central de strings de interface (botoes, menus, titulos fixos).
// Cada task da feature de UI multi-idioma adiciona suas chaves aqui, nos 3
// idiomas ao mesmo tempo - nunca so em portugues torcendo pro fallback.
const UI_STRINGS = {
  pt: {
    'nav.inicio': 'Início',
    'nav.biblia': 'Bíblia',
    'nav.licoes': 'Lições',
    'nav.progresso': 'Progresso',
    'nav.conta': 'Conta',
  },
  en: {
    'nav.inicio': 'Home',
    'nav.biblia': 'Bible',
    'nav.licoes': 'Lessons',
    'nav.progresso': 'Progress',
    'nav.conta': 'Account',
  },
  es: {
    'nav.inicio': 'Inicio',
    'nav.biblia': 'Biblia',
    'nav.licoes': 'Lecciones',
    'nav.progresso': 'Progreso',
    'nav.conta': 'Cuenta',
  },
};

function t(chave){
  const dict = UI_STRINGS[idiomaConteudoAtual] || UI_STRINGS.pt;
  return dict[chave] || UI_STRINGS.pt[chave] || chave;
}

// Aplica traducao no texto que esta direto no HTML (fora de qualquer
// template JS) - elementos marcados com data-i18n="chave". Chamada no
// boot e toda vez que o idioma muda.
function aplicarTraducaoEstatica(){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
}
```

- [ ] **Step 2: Marcar a nav inferior com `data-i18n`**

Localize (linhas 1532-1552):

```html
<nav class="bottomnav">
  <button class="navtab" id="tab-home" onclick="goHome()">
    <svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
    Início
  </button>
  <button class="navtab" id="tab-bible" onclick="goBible()">
    <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    Bíblia
  </button>
  <button class="navtab" id="tab-list" onclick="goList()">
    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>
    Lições
  </button>
```

Troque cada texto solto por um `<span data-i18n="...">` (mantém o texto em português como conteúdo inicial do `<span>` — é o que aparece antes do JS rodar, e é o fallback caso `aplicarTraducaoEstatica` falhe por algum motivo):

```html
<nav class="bottomnav">
  <button class="navtab" id="tab-home" onclick="goHome()">
    <svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
    <span data-i18n="nav.inicio">Início</span>
  </button>
  <button class="navtab" id="tab-bible" onclick="goBible()">
    <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    <span data-i18n="nav.biblia">Bíblia</span>
  </button>
  <button class="navtab" id="tab-list" onclick="goList()">
    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>
    <span data-i18n="nav.licoes">Lições</span>
  </button>
```

Faça o mesmo para `tab-stats` (linha ~1545-1548, texto "Progresso" → `data-i18n="nav.progresso"`) e `tab-conta` (linha ~1549-1552, texto "Conta" → `data-i18n="nav.conta"`) — mesmo padrão dos três acima: o texto vira um `<span data-i18n="chave">texto-pt-original</span>` no lugar do texto solto.

- [ ] **Step 3: Chamar `aplicarTraducaoEstatica()` no boot e ao trocar idioma**

Localize a função `carregarIdiomaConteudo` (por volta da linha 4929):

```js
async function carregarIdiomaConteudo(){
  try{
    const res = await window.storage.get('idioma-conteudo', false);
    if(res && res.value && IDIOMAS_SUPORTADOS.includes(res.value)) idiomaConteudoAtual = res.value;
  }catch(e){ /* chave ainda nao existe, fica pt */ }
  atualizarBotoesIdiomaConteudo();
}
```

Substitua por (chama `aplicarTraducaoEstatica()` depois de carregar o idioma salvo, cobrindo o boot):

```js
async function carregarIdiomaConteudo(){
  try{
    const res = await window.storage.get('idioma-conteudo', false);
    if(res && res.value && IDIOMAS_SUPORTADOS.includes(res.value)) idiomaConteudoAtual = res.value;
  }catch(e){ /* chave ainda nao existe, fica pt */ }
  atualizarBotoesIdiomaConteudo();
  aplicarTraducaoEstatica();
}
```

Localize `recarregarConteudoNoIdiomaAtual` (por volta da linha 4960):

```js
async function recarregarConteudoNoIdiomaAtual(){
  try{
    const container = document.getElementById('detail-container');
    const licaoAberta = container && container.style.display !== 'none' && container.dataset.lessonId;
    if(licaoAberta){
      await renderLessonDetail(parseInt(container.dataset.lessonId), false);
      return;
    }
    const bibleAtivo = document.getElementById('tab-bible') && document.getElementById('tab-bible').classList.contains('active');
    if(bibleAtivo && typeof bibleState !== 'undefined' && bibleState && bibleState.book && bibleState.chapter){
      await openBibleChapter(bibleState.chapter);
    }
  }catch(e){ console.warn('⚠️ Não recarregou o conteúdo no novo idioma:', e.message); }
}
```

Substitua por (chama `aplicarTraducaoEstatica()` sempre; as tasks 3, 5, 7 e 8 vão completar os `if` que faltam pra redesenhar lista/estatísticas/conta quando essas telas estiverem abertas — por enquanto só a nav e o HTML estático são cobertos aqui):

```js
async function recarregarConteudoNoIdiomaAtual(){
  aplicarTraducaoEstatica();
  try{
    const container = document.getElementById('detail-container');
    const licaoAberta = container && container.style.display !== 'none' && container.dataset.lessonId;
    if(licaoAberta){
      await renderLessonDetail(parseInt(container.dataset.lessonId), false);
      return;
    }
    const bibleAtivo = document.getElementById('tab-bible') && document.getElementById('tab-bible').classList.contains('active');
    if(bibleAtivo && typeof bibleState !== 'undefined' && bibleState && bibleState.book && bibleState.chapter){
      await openBibleChapter(bibleState.chapter);
    }
  }catch(e){ console.warn('⚠️ Não recarregou o conteúdo no novo idioma:', e.message); }
}
```

- [ ] **Step 4: Testar**

`python3 -m http.server 8000` na raiz do projeto. Via `mcp__claude-in-chrome__*`, chamada direta de função (sem clique real, sem `setIdiomaConteudo` de verdade):

```js
idiomaConteudoAtual = 'en';
aplicarTraducaoEstatica();
[...document.querySelectorAll('.navtab span[data-i18n]')].map(el => el.textContent);
// Esperado: ["Home", "Bible", "Lessons", "Progress", "Account"]
idiomaConteudoAtual = 'pt';
aplicarTraducaoEstatica();
```

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: infraestrutura de tradução de UI (UI_STRINGS, t(), nav inferior)"
```

---

## Task 2: Menu do app (parte ainda não traduzida)

**Files:**
- Modify: `index.html:1454-1521` (painel do menu — HTML estático)

**Interfaces:**
- Consumes: `UI_STRINGS`/`t()` (Task 1).
- Produces: chaves `menu.*` em `UI_STRINGS`.

- [ ] **Step 1: Adicionar as chaves `menu.*`**

No bloco `UI_STRINGS` criado na Task 1, adicione (mesma chave nos 3 idiomas):

```js
// pt
'menu.suaConta': 'Sua conta',
'menu.abrirConta': 'Abrir minha conta',
'menu.maisOpcoes': 'Mais opções',
'menu.voltarHoje': 'Voltar para hoje',
'menu.tamanhoFonte': 'Tamanho da fonte',
'menu.alternarTamanho': 'Alternar tamanho',
'menu.idioma': 'Idioma',
'menu.design': 'Tema',
'menu.tema.claro': 'Claro',
'menu.tema.escuro': 'Escuro',
'menu.tema.leitura': 'Leitura',
'menu.tema.neutro': 'Neutro',
'menu.tema.monoEscuro': 'Mono Escuro',
'menu.tema.monoClaro': 'Mono Claro',
'menu.tema.cinzaClaro': 'Cinza Claro',
'menu.tema.cinzaEscuro': 'Cinza Escuro',
'menu.tema.vibrante': 'Vibrante',
'menu.tema.sutil': 'Sutil',
'menu.tema.premium': 'Premium',
'menu.tema.sunset': 'Sunset',
'menu.tema.ocean': 'Ocean',
'menu.tema.forest': 'Forest',
```

```js
// en
'menu.suaConta': 'Your account',
'menu.abrirConta': 'Open my account',
'menu.maisOpcoes': 'More options',
'menu.voltarHoje': 'Back to today',
'menu.tamanhoFonte': 'Font size',
'menu.alternarTamanho': 'Cycle size',
'menu.idioma': 'Language',
'menu.design': 'Theme',
'menu.tema.claro': 'Light',
'menu.tema.escuro': 'Dark',
'menu.tema.leitura': 'Reading',
'menu.tema.neutro': 'Neutral',
'menu.tema.monoEscuro': 'Mono Dark',
'menu.tema.monoClaro': 'Mono Light',
'menu.tema.cinzaClaro': 'Light Gray',
'menu.tema.cinzaEscuro': 'Dark Gray',
'menu.tema.vibrante': 'Vibrant',
'menu.tema.sutil': 'Subtle',
'menu.tema.premium': 'Premium',
'menu.tema.sunset': 'Sunset',
'menu.tema.ocean': 'Ocean',
'menu.tema.forest': 'Forest',
```

```js
// es
'menu.suaConta': 'Tu cuenta',
'menu.abrirConta': 'Abrir mi cuenta',
'menu.maisOpcoes': 'Más opciones',
'menu.voltarHoje': 'Volver a hoy',
'menu.tamanhoFonte': 'Tamaño de fuente',
'menu.alternarTamanho': 'Cambiar tamaño',
'menu.idioma': 'Idioma',
'menu.design': 'Tema',
'menu.tema.claro': 'Claro',
'menu.tema.escuro': 'Oscuro',
'menu.tema.leitura': 'Lectura',
'menu.tema.neutro': 'Neutro',
'menu.tema.monoEscuro': 'Mono Oscuro',
'menu.tema.monoClaro': 'Mono Claro',
'menu.tema.cinzaClaro': 'Gris Claro',
'menu.tema.cinzaEscuro': 'Gris Oscuro',
'menu.tema.vibrante': 'Vibrante',
'menu.tema.sutil': 'Sutil',
'menu.tema.premium': 'Premium',
'menu.tema.sunset': 'Sunset',
'menu.tema.ocean': 'Ocean',
'menu.tema.forest': 'Forest',
```

- [ ] **Step 2: Aplicar no HTML do menu**

Nas linhas 1454-1521, aplique o mesmo padrão da Task 1 (Step 2) em cada elemento da tabela abaixo: se o texto está num `title="..."` de botão, troca por `data-i18n="chave"` (mantendo o `title` original como fallback de acessibilidade — o navegador ainda usa `title` pra tooltip, então deixe os dois: `title="Sua conta" data-i18n-title="menu.suaConta"`); se está como texto solto dentro de uma `<div>`/`<button>`, troca por `<span data-i18n="chave">texto-original</span>` igual à Task 1.

Como `title` não é `textContent`, `aplicarTraducaoEstatica` (Task 1) precisa de um pequeno complemento — adicione ao final da função, ainda na Task 1 ou aqui:

```js
function aplicarTraducaoEstatica(){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
}
```

Tabela de aplicação (linha aproximada → texto atual → chave):

| Linha | Texto atual | Tipo | Chave |
|---|---|---|---|
| 1454 | `title="Sua conta"` | title | `menu.suaConta` |
| 1458 | `title="Abrir minha conta"` | title | `menu.abrirConta` |
| 1472 | `title="Mais opções"` | title | `menu.maisOpcoes` |
| 1480 | `Voltar para hoje` | texto | `menu.voltarHoje` |
| 1485 | `Tamanho da fonte` | texto (cabeçalho de seção) | `menu.tamanhoFonte` |
| 1489 | `Alternar tamanho` | texto | `menu.alternarTamanho` |
| 1496 | `Idioma` | texto (cabeçalho de seção) | `menu.idioma` |
| 1505 | `Design` | texto (cabeçalho de seção) | `menu.design` |
| 1507 | `title="Claro"` | title | `menu.tema.claro` |
| 1508 | `title="Escuro"` | title | `menu.tema.escuro` |
| 1509 | `title="Leitura"` | title | `menu.tema.leitura` |
| 1510 | `title="Neutro"` | title | `menu.tema.neutro` |
| 1511 | `title="Mono Escuro"` | title | `menu.tema.monoEscuro` |
| 1512 | `title="Mono Claro"` | title | `menu.tema.monoClaro` |
| 1513 | `title="Cinza Claro"` | title | `menu.tema.cinzaClaro` |
| 1514 | `title="Cinza Escuro"` | title | `menu.tema.cinzaEscuro` |
| 1515 | `title="Vibrante"` | title | `menu.tema.vibrante` |
| 1516 | `title="Sutil"` | title | `menu.tema.sutil` |
| 1517 | `title="Premium"` | title | `menu.tema.premium` |
| 1518 | `title="Sunset"` | title | `menu.tema.sunset` |
| 1519 | `title="Ocean"` | title | `menu.tema.ocean` |
| 1520 | `title="Forest"` | title | `menu.tema.forest` |

(Números de linha são aproximados — o arquivo pode ter se movido um pouco entre a auditoria e a implementação; confirme cada um com uma busca pelo texto exato antes de editar.)

- [ ] **Step 3: Testar**

```js
idiomaConteudoAtual = 'en';
aplicarTraducaoEstatica();
document.querySelector('[data-i18n="menu.idioma"]').textContent; // "Language"
document.querySelector('[data-i18n-title="menu.tema.escuro"]').title; // "Dark"
idiomaConteudoAtual = 'pt';
aplicarTraducaoEstatica();
```

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: traduz o restante do menu do app (tema, fonte, rótulos)"
```

---

## Task 3: Tela inicial / lista de lições

**Files:**
- Modify: `index.html` (`renderLessonList`, por volta da linha 2812-2845)
- Modify: `index.html` (`recarregarConteudoNoIdiomaAtual`, complementa o `if` de lista)

**Interfaces:**
- Consumes: `t()` (Task 1).
- Produces: chaves `list.*`.

- [ ] **Step 1: Adicionar as chaves `list.*`**

```js
// pt
'list.titulo': 'Lições do Trimestre',
'list.subtitulo': 'Toque em qualquer lição pra abrir — passadas, atual ou futuras.',
'list.statusAtual': 'Atual',
'list.statusConcluida': 'Concluída',
'list.statusEmBreve': 'Em breve',
'list.footer': 'Toque em "${nav}" pra voltar direto pra lição da semana atual.',
```

```js
// en
'list.titulo': "Quarter's Lessons",
'list.subtitulo': 'Tap any lesson to open it — past, current, or future.',
'list.statusAtual': 'Current',
'list.statusConcluida': 'Completed',
'list.statusEmBreve': 'Coming soon',
'list.footer': 'Tap "${nav}" to go straight back to this week\'s lesson.',
```

```js
// es
'list.titulo': 'Lecciones del Trimestre',
'list.subtitulo': 'Toca cualquier lección para abrirla — pasada, actual o futura.',
'list.statusAtual': 'Actual',
'list.statusConcluida': 'Completada',
'list.statusEmBreve': 'Próximamente',
'list.footer': 'Toca "${nav}" para volver directo a la lección de esta semana.',
```

`list.footer` usa um placeholder literal `${nav}` (não interpolação JS de verdade) porque vai ser resolvido manualmente no Step 2, pra sempre citar o nome traduzido do botão "Início" da nav em vez de repetir a palavra solta.

- [ ] **Step 2: Aplicar em `renderLessonList`**

Localize:

```js
function renderLessonList(){
  const currentId = getCurrentLessonId();
  const container = document.getElementById('list-container');
  if(!container) return;
  let html = `<div class="list-header"><h1>Lições do Trimestre</h1><p>Toque em qualquer lição pra abrir — passadas, atual ou futuras.</p></div>`;
  html += `<div class="lesson-grid">`;
  LESSONS_META.forEach(l=>{
    const status = lessonStatus(l.id, currentId);
    const content = LESSONS_CONTENT.find(c=>c.id===l.id);
    const progress = progressCache[l.id] || {days:{}, quiz:{}};
    let pct = 0, daysFilled = [];
    if(content){
      const quizDays = content.days.filter(d=>d.quiz);
      let totalCorrect=0, totalQ=0;
      quizDays.forEach(d=>{ if(progress.quiz && progress.quiz[d.id]){ totalCorrect+=progress.quiz[d.id].correct; totalQ+=10; }});
      pct = totalQ? Math.round(totalCorrect/totalQ*100) : 0;
      daysFilled = content.days.map(d=> !!(progress.days && progress.days[d.id]));
    } else {
      daysFilled = new Array(7).fill(false);
    }
    html += `<div class="lesson-card status-${status}" onclick="openLessonFromList(${l.id})">
      <div class="lc-num">${String(l.id).padStart(2,'0')}</div>
      <div class="lc-body">
        <div class="lc-title">${l.title}</div>
        <div class="lc-dates">${l.dateLabel}</div>
        <div class="lc-progress-track"><div class="lc-progress-fill" style="width:${pct}%"></div></div>
        <div class="lc-daydots">${daysFilled.map(f=>`<span class="${f?'filled':''}"></span>`).join('')}</div>
      </div>
      <div class="lc-badge">${status==='current'?'Atual':status==='past'?'Concluída':'Em breve'}</div>
    </div>`;
  });
  html += `</div><footer>Toque em "Início" pra voltar direto pra lição da semana atual.</footer>`;
  container.innerHTML = html;
}
```

Substitua as 4 linhas que mudam (cabeçalho, badge de status, footer — `l.title`/`l.dateLabel` ficam como estão, são conteúdo, ver Global Constraints):

```js
function renderLessonList(){
  const currentId = getCurrentLessonId();
  const container = document.getElementById('list-container');
  if(!container) return;
  let html = `<div class="list-header"><h1>${t('list.titulo')}</h1><p>${t('list.subtitulo')}</p></div>`;
  html += `<div class="lesson-grid">`;
  LESSONS_META.forEach(l=>{
    const status = lessonStatus(l.id, currentId);
    const content = LESSONS_CONTENT.find(c=>c.id===l.id);
    const progress = progressCache[l.id] || {days:{}, quiz:{}};
    let pct = 0, daysFilled = [];
    if(content){
      const quizDays = content.days.filter(d=>d.quiz);
      let totalCorrect=0, totalQ=0;
      quizDays.forEach(d=>{ if(progress.quiz && progress.quiz[d.id]){ totalCorrect+=progress.quiz[d.id].correct; totalQ+=10; }});
      pct = totalQ? Math.round(totalCorrect/totalQ*100) : 0;
      daysFilled = content.days.map(d=> !!(progress.days && progress.days[d.id]));
    } else {
      daysFilled = new Array(7).fill(false);
    }
    const statusLabel = status==='current'?t('list.statusAtual'):status==='past'?t('list.statusConcluida'):t('list.statusEmBreve');
    html += `<div class="lesson-card status-${status}" onclick="openLessonFromList(${l.id})">
      <div class="lc-num">${String(l.id).padStart(2,'0')}</div>
      <div class="lc-body">
        <div class="lc-title">${l.title}</div>
        <div class="lc-dates">${l.dateLabel}</div>
        <div class="lc-progress-track"><div class="lc-progress-fill" style="width:${pct}%"></div></div>
        <div class="lc-daydots">${daysFilled.map(f=>`<span class="${f?'filled':''}"></span>`).join('')}</div>
      </div>
      <div class="lc-badge">${statusLabel}</div>
    </div>`;
  });
  html += `</div><footer>${t('list.footer').replace('${nav}', t('nav.inicio'))}</footer>`;
  container.innerHTML = html;
}
```

- [ ] **Step 3: Redesenhar a lista ao trocar idioma**

Localize (dentro de `recarregarConteudoNoIdiomaAtual`, já editada na Task 1):

```js
    const bibleAtivo = document.getElementById('tab-bible') && document.getElementById('tab-bible').classList.contains('active');
    if(bibleAtivo && typeof bibleState !== 'undefined' && bibleState && bibleState.book && bibleState.chapter){
      await openBibleChapter(bibleState.chapter);
    }
  }catch(e){ console.warn('⚠️ Não recarregou o conteúdo no novo idioma:', e.message); }
}
```

Substitua por (acrescenta o `if` da lista, ANTES do bloco da Bíblia):

```js
    const listaAtiva = document.getElementById('tab-list') && document.getElementById('tab-list').classList.contains('active') && document.getElementById('list-container') && document.getElementById('list-container').style.display !== 'none';
    if(listaAtiva){
      renderLessonList();
      return;
    }
    const bibleAtivo = document.getElementById('tab-bible') && document.getElementById('tab-bible').classList.contains('active');
    if(bibleAtivo && typeof bibleState !== 'undefined' && bibleState && bibleState.book && bibleState.chapter){
      await openBibleChapter(bibleState.chapter);
    }
  }catch(e){ console.warn('⚠️ Não recarregou o conteúdo no novo idioma:', e.message); }
}
```

(Se `licaoAberta` já deu `return` mais acima na função, este bloco só roda quando nenhuma lição está aberta — condição implícita já existente na estrutura da função.)

- [ ] **Step 4: Testar**

```js
idiomaConteudoAtual = 'en';
renderLessonList();
document.querySelector('.list-header h1').textContent; // "Quarter's Lessons"
document.querySelector('footer').textContent; // cita "Home", não "Início"
idiomaConteudoAtual = 'pt';
renderLessonList();
```

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: traduz tela inicial/lista de lições"
```

---

## Task 4: Tela de lição — chrome (botões, cabeçalhos, rótulos fixos)

**Files:**
- Modify: `index.html` (`renderLessonDetail` e funções próximas, linhas ~1900-2150, ~2530-2800)

**Interfaces:**
- Consumes: `t()` (Task 1).
- Produces: chaves `lesson.*`.

- [ ] **Step 1: Adicionar as chaves `lesson.*`**

```js
// pt
'lesson.concluirDia': 'Concluir este dia',
'lesson.diaConcluido': '✓ Dia concluído',
'lesson.voceLevou': 'Você levou ',
'lesson.acertos': 'Acertos: ',
'lesson.refazer': '🔄 Refazer',
'lesson.verGabaritoCompleto': 'Ver gabarito completo',
'lesson.verdadeiroOuFalso': 'Verdadeiro ou Falso',
'lesson.verGabarito': 'Ver gabarito',
'lesson.voltarLista': '← Voltar para a lista',
'lesson.comecouHoje': '🔥 Começou hoje',
'lesson.diasSeguidos': '🔥 ${n} dias seguidos',
'lesson.licaoJovem': 'Lição Jovem',
'lesson.conteudoConstrucao': 'Conteúdo em construção',
'lesson.conteudoConstrucaoTexto': 'Essa lição ainda não foi extraída e parafraseada do PDF. Peça pra eu montar a Lição ${n} e ela aparece aqui com todos os dias, versículos e quiz — igual às Lições 3 e 4.',
'lesson.comeceUmDia': 'Comece um dia abaixo',
'lesson.excelenteDominio': 'Excelente domínio',
'lesson.bomDominio': 'Bom domínio',
'lesson.valeRevisar': 'Vale revisar alguns pontos',
'lesson.revejaComCalma': 'Reveja a lição com calma',
'lesson.progresso': 'Progresso: ',
'lesson.dias': ' dias',
'lesson.escolherOutroDia': 'Escolher outro dia',
'lesson.resumoEstudoPessoal': 'resumo de estudo pessoal',
'lesson.anterior': '← Anterior',
'lesson.proximo': 'Próximo →',
```

```js
// en
'lesson.concluirDia': 'Complete this day',
'lesson.diaConcluido': '✓ Day completed',
'lesson.voceLevou': 'You took ',
'lesson.acertos': 'Correct: ',
'lesson.refazer': '🔄 Retry',
'lesson.verGabaritoCompleto': 'See full answer key',
'lesson.verdadeiroOuFalso': 'True or False',
'lesson.verGabarito': 'See answer key',
'lesson.voltarLista': '← Back to the list',
'lesson.comecouHoje': '🔥 Started today',
'lesson.diasSeguidos': '🔥 ${n} days in a row',
'lesson.licaoJovem': 'Youth Lesson',
'lesson.conteudoConstrucao': 'Content coming soon',
'lesson.conteudoConstrucaoTexto': "This lesson hasn't been extracted and paraphrased from the PDF yet. Ask me to build Lesson ${n} and it will show up here with all the days, verses, and quiz — just like Lessons 3 and 4.",
'lesson.comeceUmDia': 'Start a day below',
'lesson.excelenteDominio': 'Excellent mastery',
'lesson.bomDominio': 'Good mastery',
'lesson.valeRevisar': 'Worth reviewing a few points',
'lesson.revejaComCalma': 'Review the lesson slowly',
'lesson.progresso': 'Progress: ',
'lesson.dias': ' days',
'lesson.escolherOutroDia': 'Choose another day',
'lesson.resumoEstudoPessoal': 'personal study summary',
'lesson.anterior': '← Previous',
'lesson.proximo': 'Next →',
```

```js
// es
'lesson.concluirDia': 'Completar este día',
'lesson.diaConcluido': '✓ Día completado',
'lesson.voceLevou': 'Te tomó ',
'lesson.acertos': 'Aciertos: ',
'lesson.refazer': '🔄 Rehacer',
'lesson.verGabaritoCompleto': 'Ver solucionario completo',
'lesson.verdadeiroOuFalso': 'Verdadero o Falso',
'lesson.verGabarito': 'Ver solucionario',
'lesson.voltarLista': '← Volver a la lista',
'lesson.comecouHoje': '🔥 Empezó hoy',
'lesson.diasSeguidos': '🔥 ${n} días seguidos',
'lesson.licaoJovem': 'Lección Joven',
'lesson.conteudoConstrucao': 'Contenido en construcción',
'lesson.conteudoConstrucaoTexto': 'Esta lección todavía no fue extraída y parafraseada del PDF. Pídeme que arme la Lección ${n} y va a aparecer aquí con todos los días, versículos y quiz — igual que las Lecciones 3 y 4.',
'lesson.comeceUmDia': 'Empieza un día abajo',
'lesson.excelenteDominio': 'Dominio excelente',
'lesson.bomDominio': 'Buen dominio',
'lesson.valeRevisar': 'Vale la pena repasar algunos puntos',
'lesson.revejaComCalma': 'Repasa la lección con calma',
'lesson.progresso': 'Progreso: ',
'lesson.dias': ' días',
'lesson.escolherOutroDia': 'Elegir otro día',
'lesson.resumoEstudoPessoal': 'resumen de estudio personal',
'lesson.anterior': '← Anterior',
'lesson.proximo': 'Siguiente →',
```

`lesson.diasSeguidos` e `lesson.conteudoConstrucaoTexto` usam `${n}` como placeholder literal (mesma técnica da Task 3), resolvido com `.replace('${n}', valorReal)` no call site.

- [ ] **Step 2: Aplicar nos pontos de `renderLessonDetail` e vizinhos**

Para cada linha da tabela, localize o texto exato (com uma busca pela string em português) e troque pela chamada a `t()` equivalente — mesmo padrão do Step 2 da Task 3 (string literal → `t('chave')`, ou `.replace('${n}', valor)` quando a chave tem placeholder):

| Contexto (função) | Texto atual (pt) | Chave |
|---|---|---|
| `marcarConcluido`, botão | `'✓ Dia concluído'` / `'Concluir este dia'` (ternário) | `lesson.diaConcluido` / `lesson.concluirDia` |
| resultado do quiz múltipla escolha | `"Você levou "` | `lesson.voceLevou` |
| resultado do quiz múltipla escolha | `"Acertos: "` | `lesson.acertos` |
| resultado do quiz múltipla escolha | `"🔄 Refazer"` | `lesson.refazer` |
| resultado do quiz múltipla escolha | `"Ver gabarito completo"` | `lesson.verGabaritoCompleto` |
| render do bloco tf | `"Verdadeiro ou Falso"` (`<h3>`) | `lesson.verdadeiroOuFalso` |
| render do bloco tf | `"Ver gabarito"` (botão) | `lesson.verGabarito` |
| `renderLessonDetail`, header | `'← Voltar para a lista'` (só quando `fromList`) | `lesson.voltarLista` |
| `renderLessonDetail`, streak | `` `🔥 Começou hoje` `` | `lesson.comecouHoje` |
| `renderLessonDetail`/`atualizarDashboardProgresso`, streak | `` `🔥 ${seq} dias seguidos` `` | `t('lesson.diasSeguidos').replace('${n}', seq)` |
| `renderLessonDetail`, eyebrow | `` `Lição Jovem ${lessonId}` `` | `` `${t('lesson.licaoJovem')} ${lessonId}` `` |
| `renderLessonDetail`, placeholder de conteúdo | `"Conteúdo em construção"` (`<h3>`) | `lesson.conteudoConstrucao` |
| `renderLessonDetail`, placeholder de conteúdo | texto longo com `${lessonId}` | `t('lesson.conteudoConstrucaoTexto').replace('${n}', lessonId)` |
| `renderLessonDetail`, `evalLabel` | `'Comece um dia abaixo'` (default) | `lesson.comeceUmDia` |
| `renderLessonDetail`, `evalLabel` | `'Excelente domínio'`/`'Bom domínio'`/`'Vale revisar alguns pontos'`/`'Reveja a lição com calma'` (por faixa de nota) | `lesson.excelenteDominio`/`lesson.bomDominio`/`lesson.valeRevisar`/`lesson.revejaComCalma` |
| `renderLessonDetail`/`atualizarDashboardProgresso`, dashboard (2 pontos, mesmo texto) | `"Progresso: "` / `" dias"` | `lesson.progresso` / `lesson.dias` |
| `renderLessonDetail`/`atualizarDashboardProgresso`, dashboard | `"Acertos: "` | `lesson.acertos` (reaproveita a mesma chave do resultado do quiz — mesmo sentido) |
| botão calendário | `title="Escolher outro dia"` | `data-i18n-title="lesson.escolherOutroDia"` (mesmo padrão `title` da Task 2) |
| `renderLessonDetail`, footer | `"resumo de estudo pessoal"` (mantém `"ComTexto Bíblico"` sem traduzir — nome de marca, ver Global Constraints) | `lesson.resumoEstudoPessoal` |
| `renderLessonDetail`, footer | `"← Anterior"` | `lesson.anterior` |
| `renderLessonDetail`, footer | `"Próximo →"` | `lesson.proximo` |
| `marcarConcluido`, atualização parcial do botão (3 pontos: linhas ~2577/2736/2799) | `'✓ Dia concluído'` | `lesson.diaConcluido` (mesma chave dos 3 pontos — são o mesmo texto, não duplicar) |

- [ ] **Step 3: Testar**

Abra uma lição (`renderLessonDetail(1, false)`) com `idiomaConteudoAtual='en'` e confirme visualmente (screenshot) que os botões "Complete this day"/"True or False"/"← Previous"/"Next →" aparecem; confirme que `q.diff` ("Fácil"/"Intermediária"/"Avançada") continua em português (não é bug, ver Global Constraints).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: traduz chrome da tela de lição (botões, cabeçalhos, rótulos)"
```

---

## Task 5: Nomes de livro bíblico (`bookDisplayName`) + chrome da aba Bíblia

**Files:**
- Modify: `index.html` (declaração de `BIBLE_BOOKS`, por volta da linha 4113)
- Modify: `index.html` (`renderBibleBooks`/`renderBibleChapters` e pontos que leem `book.name`/`bookMeta.name` pra exibir, linhas ~2355-2371, ~4433, ~5054-5420)

**Interfaces:**
- Consumes: `t()` (Task 1), `BOOK_NAME_TO_ID_EN`/`BOOK_NAME_TO_ID_ES` (já existem).
- Produces:
  - `BIBLE_BOOKS[].name_en`/`.name_es` (novos campos).
  - `bookDisplayName(bookId, idioma)` → `string`.
  - chaves `bible.*`.

- [ ] **Step 1: Popular `name_en`/`name_es` em `BIBLE_BOOKS` por inversão dos dicionários existentes**

Localize, logo depois da declaração de `BIBLE_BOOKS` (por volta da linha 4223, onde `BOOK_NAME_BY_ID` já é montado por um `forEach` parecido):

```js
BIBLE_BOOKS.forEach(b=>{ BOOK_NAME_BY_ID[b.id] = b.name; });
```

Adicione logo depois (inverte `BOOK_NAME_TO_ID_EN`/`_ES`: cada dicionário tem nome completo E abreviações apontando pro mesmo id — pega a entrada mais LONGA por id, que é sempre o nome completo, nunca a abreviação):

```js
// Deriva o nome completo em EN/ES de cada livro invertendo os dicionarios
// nome->id que ja existem (BOOK_NAME_TO_ID_EN/_ES) - a entrada mais longa
// que aponta pra um id e sempre o nome completo, nunca a abreviacao (ex.:
// "Genesis" e "Gn" apontam pro mesmo id GEN; "Genesis" e a mais longa).
function nomesCompletosPorId(dicionario){
  const porId = {};
  Object.keys(dicionario).forEach(nome => {
    const id = dicionario[nome];
    if(!porId[id] || nome.length > porId[id].length) porId[id] = nome;
  });
  return porId;
}
const NOME_COMPLETO_EN_POR_ID = nomesCompletosPorId(BOOK_NAME_TO_ID_EN);
const NOME_COMPLETO_ES_POR_ID = nomesCompletosPorId(BOOK_NAME_TO_ID_ES);
BIBLE_BOOKS.forEach(b=>{
  b.name_en = NOME_COMPLETO_EN_POR_ID[b.id] || b.name;
  b.name_es = NOME_COMPLETO_ES_POR_ID[b.id] || b.name;
});

// Nome do livro pra EXIBIR na tela, no idioma certo - nunca usar pra montar
// URL/chave de cache (isso continua sendo o id de 3 letras, ja existente).
function bookDisplayName(bookId, idioma){
  const book = BIBLE_BOOKS.find(b => b.id === bookId);
  if(!book) return bookId;
  if(idioma === 'en') return book.name_en;
  if(idioma === 'es') return book.name_es;
  return book.name;
}
```

- [ ] **Step 2: Trocar leituras de `book.name`/`bookMeta.name` por `bookDisplayName`**

Para cada ponto que hoje lê `book.name`/`bookMeta.name` pra **exibir** texto na tela (não pra montar URL, nem pra comparar/buscar), troque por `bookDisplayName(book.id, idiomaConteudoAtual)` (ou `bookMeta.id` conforme a variável local do ponto). Localizações confirmadas na auditoria — confirme cada uma com uma busca pelo texto exato antes de editar, o arquivo pode ter se movido um pouco:

- `toggleVerseLive`/`switchVerseVersion` (linhas ~2355, ~2358, ~2371): `` `${bookMeta.name} ${chapter}...` `` → `` `${bookDisplayName(bookMeta.id, idiomaConteudoAtual)} ${chapter}...` ``. **Atenção:** o link externo "Abrir X num site de Bíblia" (linhas 2355/2371) só existe em português (`idioma === 'pt'` já é a condição pra esse bloco existir — ver `toggleVerseLive`), então dentro desse `if` específico pode continuar sendo `bookMeta.name` puro (já é sempre pt ali).
- breadcrumb da Bíblia (linha ~4433): `` `${book.name}` `` → `` `${bookDisplayName(book.id, idiomaConteudoAtual)}` ``.
- `renderBibleBooks`/grade de livros (linhas ~5058, ~5064, ~5068): `${b.name}` (span de nome, atributo `title`) → `${bookDisplayName(b.id, idiomaConteudoAtual)}`. **Atenção:** `BOOK_ABBR_PT[b.id]` (abreviação mostrada ao lado do nome) continua fixo em português — é um selo visual curto, não faz parte deste plano (não estava na auditoria como item de UI, é abreviação de referência).
- `openChapterPopup`/título de capítulo (linhas ~5165, ~5166, ~5204, ~5336, ~5392): `${book.name} ${chapter}` → `${bookDisplayName(book.id, idiomaConteudoAtual)} ${chapter}` em cada ocorrência.
- `renderBibleChapters`, subtítulo de contagem de capítulos (linha ~5204): `` `<p>${book.ch} capítulo${book.ch>1?'s':''}</p>` `` — "capítulo(s)" é string de UI nova, adiciona à tabela do Step 3 abaixo (`bible.capitulo`/`bible.capitulos`).

- [ ] **Step 3: Adicionar as chaves `bible.*` e aplicar no restante da aba**

```js
// pt
'bible.titulo': 'Bíblia',
'bible.modoLista': '☰ Lista',
'bible.modoCards': '▢ Cards',
'bible.modoTabela': '▦ Tabela Periódica',
'bible.subtitulo': 'Escolha um livro para ler — NVI ou ARA.',
'bible.antigoTestamento': 'Antigo Testamento',
'bible.novoTestamento': 'Novo Testamento',
'bible.credito': 'NVI e ARC via repositório público no GitHub (MaatheusGois/bible)',
'bible.anteriorCap': '‹ Anterior',
'bible.proximoCap': 'Próximo ›',
'bible.capitulo': ' capítulo',
'bible.capitulos': ' capítulos',
```

```js
// en
'bible.titulo': 'Bible',
'bible.modoLista': '☰ List',
'bible.modoCards': '▢ Cards',
'bible.modoTabela': '▦ Periodic Table',
'bible.subtitulo': 'Choose a book to read — King James Version.',
'bible.antigoTestamento': 'Old Testament',
'bible.novoTestamento': 'New Testament',
'bible.credito': 'KJV via public GitHub repository (MaatheusGois/bible)',
'bible.anteriorCap': '‹ Previous',
'bible.proximoCap': 'Next ›',
'bible.capitulo': ' chapter',
'bible.capitulos': ' chapters',
```

```js
// es
'bible.titulo': 'Biblia',
'bible.modoLista': '☰ Lista',
'bible.modoCards': '▢ Tarjetas',
'bible.modoTabela': '▦ Tabla Periódica',
'bible.subtitulo': 'Elige un libro para leer — Reina-Valera.',
'bible.antigoTestamento': 'Antiguo Testamento',
'bible.novoTestamento': 'Nuevo Testamento',
'bible.credito': 'Reina-Valera vía repositorio público en GitHub (MaatheusGois/bible)',
'bible.anteriorCap': '‹ Anterior',
'bible.proximoCap': 'Siguiente ›',
'bible.capitulo': ' capítulo',
'bible.capitulos': ' capítulos',
```

Aplique nos pontos correspondentes de `renderBibleBooks` (linhas ~5076-5090: `<h1>`, botões de modo, subtítulo, rótulos AT/NT, footer de crédito) e na navegação de capítulo (linhas ~4854/4858 e ~5419/5420: `‹ Anterior`/`Próximo ›` — **strings diferentes** de `lesson.anterior`/`lesson.proximo` da Task 4, símbolos de seta distintos, não reaproveitar). O parágrafo de contagem de capítulos (Step 2) vira: `` `<p>${book.ch}${book.ch>1?t('bible.capitulos'):t('bible.capitulo')}</p>` ``.

- [ ] **Step 4: Testar**

```js
bookDisplayName('GEN', 'en'); // "Genesis"
bookDisplayName('1CO', 'es'); // "1 Corintios"
bookDisplayName('GEN', 'pt'); // "Gênesis"
```

Abra a aba Bíblia com `idiomaConteudoAtual='es'`, confira visualmente (screenshot) que a lista de livros mostra nomes em espanhol e o cabeçalho/subtítulo também.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: nomes de livro bíblico e chrome da aba Bíblia em EN/ES"
```

---

## Task 6: Nome do dia da semana dinâmico + rótulos especiais de dia

**Files:**
- Modify: `index.html` (pontos que hoje leem `day.date` pra exibir dia+data, ex.: `renderDayCard`, calendário semanal, breadcrumb de dia)

**Interfaces:**
- Consumes: `dayCalendarDate(lessonId, dayId)` (já existe), `t()` (Task 1).
- Produces: `dayDisplayDate(lessonId, dayId, idioma)` → `string`.

- [ ] **Step 1: Criar `dayDisplayDate` e as chaves de rótulo especial**

Localize `dayCalendarDate` (por volta da linha 3143):

```js
function dayCalendarDate(lessonId, dayId){
  const d = new Date(lessonStart(lessonId));
  d.setDate(d.getDate() + dayOffsets[dayId]);
  d.setHours(0,0,0,0);
  return d;
}
```

Adicione logo depois:

```js
const LOCALE_POR_IDIOMA = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };

// Monta "Domingo · 28 de junho" (ou equivalente no idioma atual) a partir
// da data REAL do dia, em vez de ler texto fixo gravado no conteudo -
// assim nunca fica dessincronizado da data e nao precisa de traducao
// separada guardada em disco.
function dayDisplayDate(lessonId, dayId, idioma){
  const date = dayCalendarDate(lessonId, dayId);
  const locale = LOCALE_POR_IDIOMA[idioma] || LOCALE_POR_IDIOMA.pt;
  const formatado = date.toLocaleDateString(locale, {weekday:'long', day:'numeric', month:'long'});
  // toLocaleDateString devolve ex. "domingo, 28 de junho" (pt) / "Sunday, June 28" (en) /
  // "domingo, 28 de junio" (es) - normaliza pra maiuscula inicial e pro
  // formato "Dia · data" que o resto do app espera.
  const comMaiuscula = formatado.charAt(0).toUpperCase() + formatado.slice(1);
  const partes = comMaiuscula.split(idioma === 'en' ? ', ' : ', ');
  return partes.length === 2 ? `${partes[0]} · ${partes[1]}` : comMaiuscula;
}
```

Adicione as chaves dos 2 rótulos especiais (comparação exata contra os 2 valores conhecidos em português, que é como o campo `date` do conteúdo sempre chega):

```js
// pt
'day.especial.hipertexto': 'Momento Hipertexto',
'day.especial.comunidade': 'Comunidade',
```

```js
// en
'day.especial.hipertexto': 'Hypertext Moment',
'day.especial.comunidade': 'Community',
```

```js
// es
'day.especial.hipertexto': 'Momento Hipertexto',
'day.especial.comunidade': 'Comunidad',
```

- [ ] **Step 2: Aplicar nos pontos que exibem `day.date`**

Para cada ponto que hoje interpola `${day.date}` (ou `${d.date}`) direto na tela, troque pela chamada a `dayDisplayDate`, e trate o rótulo especial (se o `day.date` original tinha um terceiro pedaço depois da data — "Momento Hipertexto" ou "Comunidade" — acrescenta a versão traduzida desse rótulo no fim). Padrão de substituição, usando `renderDayCard` como exemplo (localize a linha que monta o cabeçalho do card de dia, dentro de `renderDayCard`, buscando por `day.date`):

```js
// antes (exemplo do formato hoje usado onde quer que day.date apareca)
`<div class="day-date">${day.date}</div>`
```

```js
// depois
function labelEspecialDoDia(dateOriginalPt){
  if(dateOriginalPt.includes('Momento Hipertexto')) return ' · ' + t('day.especial.hipertexto');
  if(dateOriginalPt.includes('Comunidade')) return ' · ' + t('day.especial.comunidade');
  return '';
}
// ...
`<div class="day-date">${dayDisplayDate(lessonId, day.id, idiomaConteudoAtual)}${labelEspecialDoDia(day.date)}</div>`
```

Aplique essa mesma troca em TODO ponto que hoje mostra `day.date`/`d.date` pra pessoa (breadcrumb do dia, calendário semanal — `toggleWeekCalendar`, qualquer lugar que precise do texto "Domingo · 28 de junho"). Localize cada ocorrência com uma busca por `.date}` dentro de template strings que envolvem uma variável de dia, e confirme se está mostrando pra usuário (não usando internamente pra outra coisa, tipo agrupar por data) antes de trocar.

- [ ] **Step 3: Testar**

```js
dayDisplayDate(1, 'dom', 'en'); // algo como "Sunday · June 28"
dayDisplayDate(1, 'dom', 'es'); // "Domingo · 28 de junio"
dayDisplayDate(1, 'dom', 'pt'); // "Domingo · 28 de junho"
```

Abra a Lição 12 (que tem "qua" com "Momento Hipertexto" e "sab" com "Comunidade") em inglês e confira visualmente que os dois rótulos aparecem traduzidos ("Hypertext Moment"/"Community") ao lado da data.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: nome do dia da semana dinâmico por idioma + rótulos especiais"
```

---

## Task 7: Aba Estatísticas

**Files:**
- Modify: `index.html` (`renderStats` e funções de gráfico, linhas ~3777-3922)

**Interfaces:**
- Consumes: `t()` (Task 1).
- Produces: chaves `stats.*`, `common.carregando`, `common.salvar`.

- [ ] **Step 1: Adicionar as chaves `stats.*` e `common.*`**

```js
// pt
'common.carregando': 'Carregando…',
'common.salvar': 'Salvar',
'stats.titulo': 'Seu Progresso',
'stats.calendarioTitulo': 'Calendário de estudos',
'stats.calendarioSubtitulo': 'Calendário, evolução das notas e sua sequência de estudo.',
'stats.hoje': 'Hoje',
'stats.semana': 'Esta semana',
'stats.trimestre': 'Trimestre',
'stats.historico': 'Histórico',
'stats.instrucao': 'Toque em um dia do calendário pra registrar ou editar o que você fez.',
'stats.sequenciaDias': 'Sequência de dias',
'stats.tempoTotal': 'Tempo total de estudo',
'stats.tempoPorDia': 'Tempo de estudo por dia',
'stats.notaQuizzes': 'Nota dos quizzes ao longo do tempo',
'stats.diasBibliaLicao': 'Dias de Bíblia × Dias de lição',
'stats.bibliaDia': 'Bíblia/dia',
'stats.licaoDia': 'Lição/dia',
'stats.diasSemana': 'Dias/semana',
'stats.notaAlvo': 'Nota alvo',
'stats.mediaPorDia': 'Média por dia estudado',
'stats.metaBiblia': 'Meta de Bíblia (min/dia)',
'stats.metaLicao': 'Meta de Lição (min/dia)',
'stats.metaDiasSemana': 'Meta de dias/semana',
'stats.metaNota': 'Meta de nota (de 10)',
```

```js
// en
'common.carregando': 'Loading…',
'common.salvar': 'Save',
'stats.titulo': 'Your Progress',
'stats.calendarioTitulo': 'Study calendar',
'stats.calendarioSubtitulo': 'Calendar, grade trends, and your study streak.',
'stats.hoje': 'Today',
'stats.semana': 'This week',
'stats.trimestre': 'Quarter',
'stats.historico': 'History',
'stats.instrucao': 'Tap a day on the calendar to log or edit what you did.',
'stats.sequenciaDias': 'Day streak',
'stats.tempoTotal': 'Total study time',
'stats.tempoPorDia': 'Study time per day',
'stats.notaQuizzes': 'Quiz scores over time',
'stats.diasBibliaLicao': 'Bible days × Lesson days',
'stats.bibliaDia': 'Bible/day',
'stats.licaoDia': 'Lesson/day',
'stats.diasSemana': 'Days/week',
'stats.notaAlvo': 'Target score',
'stats.mediaPorDia': 'Average per day studied',
'stats.metaBiblia': 'Bible goal (min/day)',
'stats.metaLicao': 'Lesson goal (min/day)',
'stats.metaDiasSemana': 'Days/week goal',
'stats.metaNota': 'Score goal (out of 10)',
```

```js
// es
'common.carregando': 'Cargando…',
'common.salvar': 'Guardar',
'stats.titulo': 'Tu Progreso',
'stats.calendarioTitulo': 'Calendario de estudio',
'stats.calendarioSubtitulo': 'Calendario, evolución de las notas y tu racha de estudio.',
'stats.hoje': 'Hoy',
'stats.semana': 'Esta semana',
'stats.trimestre': 'Trimestre',
'stats.historico': 'Historial',
'stats.instrucao': 'Toca un día del calendario para registrar o editar lo que hiciste.',
'stats.sequenciaDias': 'Racha de días',
'stats.tempoTotal': 'Tiempo total de estudio',
'stats.tempoPorDia': 'Tiempo de estudio por día',
'stats.notaQuizzes': 'Nota de los quizzes a lo largo del tiempo',
'stats.diasBibliaLicao': 'Días de Biblia × Días de lección',
'stats.bibliaDia': 'Biblia/día',
'stats.licaoDia': 'Lección/día',
'stats.diasSemana': 'Días/semana',
'stats.notaAlvo': 'Nota objetivo',
'stats.mediaPorDia': 'Promedio por día estudiado',
'stats.metaBiblia': 'Meta de Biblia (min/día)',
'stats.metaLicao': 'Meta de Lección (min/día)',
'stats.metaDiasSemana': 'Meta de días/semana',
'stats.metaNota': 'Meta de nota (de 10)',
```

- [ ] **Step 2: Aplicar em `renderStats` e funções de gráfico**

Para cada string da tabela abaixo, localize o texto exato dentro de `renderStats` (e das funções de gráfico que ela chama) e troque por `t('chave')`, mesmo padrão das tasks anteriores:

| Texto atual (pt) | Chave |
|---|---|
| `"Seu Progresso"` | `stats.titulo` |
| `"Calendário de estudos"` | `stats.calendarioTitulo` |
| `"Calendário, evolução das notas e sua sequência de estudo."` | `stats.calendarioSubtitulo` |
| `"Hoje"` | `stats.hoje` |
| `"Esta semana"` | `stats.semana` |
| `"Trimestre"` | `stats.trimestre` |
| `"Histórico"` | `stats.historico` |
| `"Toque em um dia do calendário pra registrar ou editar o que você fez."` | `stats.instrucao` |
| `"Sequência de dias"` | `stats.sequenciaDias` |
| `"Tempo total de estudo"` | `stats.tempoTotal` |
| `"Tempo de estudo por dia"` | `stats.tempoPorDia` |
| `"Nota dos quizzes ao longo do tempo"` | `stats.notaQuizzes` |
| `"Dias de Bíblia × Dias de lição"` | `stats.diasBibliaLicao` |
| `"Bíblia/dia"` | `stats.bibliaDia` |
| `"Lição/dia"` | `stats.licaoDia` |
| `"Dias/semana"` | `stats.diasSemana` |
| `"Nota alvo"` | `stats.notaAlvo` |
| `"Média por dia estudado"` | `stats.mediaPorDia` |
| `"Meta de Bíblia (min/dia)"` | `stats.metaBiblia` |
| `"Meta de Lição (min/dia)"` | `stats.metaLicao` |
| `"Meta de dias/semana"` | `stats.metaDiasSemana` |
| `"Meta de nota (de 10)"` | `stats.metaNota` |
| `"Salvar"` (botão de metas) | `common.salvar` |
| `"Carregando…"` (qualquer estado de loading dentro da aba) | `common.carregando` |

- [ ] **Step 3: Redesenhar a aba ao trocar idioma**

Complementa `recarregarConteudoNoIdiomaAtual` (Task 1/3) com mais um `if`, mesmo padrão da Task 3 — localize o bloco da lista (Task 3, Step 3) e adicione, logo antes dele:

```js
    const statsAtivo = document.getElementById('tab-stats') && document.getElementById('tab-stats').classList.contains('active');
    if(statsAtivo){
      await renderStats();
      return;
    }
```

(ajuste `renderStats()` pra `renderStats(...)` com os argumentos que a função realmente usa hoje, se houver — confirme a assinatura antes de aplicar.)

- [ ] **Step 4: Testar**

Abra a aba Estatísticas com `idiomaConteudoAtual='es'`, confira visualmente (screenshot) os títulos dos gráficos e cards.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: traduz aba Estatísticas"
```

---

## Task 8: Aba Conta + Ranking

**Files:**
- Modify: `index.html` (`renderConta`, `carregarRankingTab`, linhas ~2891-3260, ~3865-3999)

**Interfaces:**
- Consumes: `t()` (Task 1), `UI_STRINGS` (chaves de `conta.*`/`ranking.*` reaproveitam `stats.semana`/`stats.trimestre` da Task 7 para as abas do ranking — mesmo sentido, mesma chave).
- Produces: chaves `conta.*`, `ranking.*`.

- [ ] **Step 1: Adicionar as chaves `conta.*` e `ranking.*`**

```js
// pt
'conta.subtitulo': 'Seu perfil, aparência e seus dados.',
'conta.loginSync': 'Login e sincronização',
'conta.entrarGoogle': 'Entrar com Google',
'conta.sairConta': 'Sair da conta',
'conta.nomePlaceholder': 'Seu nome',
'conta.participarRanking': 'Participar do ranking',
'conta.entreParaRanking': 'Entre com sua conta Google para participar do ranking.',
'conta.ranking': 'Ranking',
'conta.feedback': 'Feedback',
'conta.reportarBug': 'Reportar bug ou sugestão',
'conta.reportarBugNota': 'Abre um formulário rápido, leva menos de 1 minuto',
'conta.seusDados': 'Seus dados',
'conta.fazerBackup': 'Fazer backup',
'conta.fazerBackupNota': 'Baixa um arquivo com todo seu progresso',
'conta.baixar': 'Baixar',
'conta.restaurarBackup': 'Restaurar backup',
'conta.restaurarBackupNota': 'Recupera o progresso de um arquivo salvo',
'conta.escolherArquivo': 'Escolher arquivo',
'conta.zerarTudo': 'Zerar tudo',
'conta.zerar': 'Zerar',
'conta.administracao': 'Administração',
'conta.administracaoNota': 'Esta seção aparece só para administradores.',
'conta.comentariosToggle': 'Comentários nas lições',
'conta.sobre': 'Sobre',
'ranking.vocePrivado': 'Você (privado)',
'ranking.ativeParticipar': 'Ative "${toggle}" na aba ${conta} pra comparar com outras pessoas.',
'ranking.ninguemSemana': 'Ninguém no ranking essa semana ainda. Seja o primeiro!',
'ranking.ninguemTrimestre': 'Ninguém no ranking esse trimestre ainda. Seja o primeiro!',
'ranking.alguem': 'Alguém',
'ranking.pts': 'pts',
```

```js
// en
'conta.subtitulo': 'Your profile, appearance, and your data.',
'conta.loginSync': 'Login and sync',
'conta.entrarGoogle': 'Sign in with Google',
'conta.sairConta': 'Sign out',
'conta.nomePlaceholder': 'Your name',
'conta.participarRanking': 'Join the leaderboard',
'conta.entreParaRanking': 'Sign in with your Google account to join the leaderboard.',
'conta.ranking': 'Leaderboard',
'conta.feedback': 'Feedback',
'conta.reportarBug': 'Report a bug or suggestion',
'conta.reportarBugNota': 'Opens a quick form, takes less than 1 minute',
'conta.seusDados': 'Your data',
'conta.fazerBackup': 'Back up',
'conta.fazerBackupNota': 'Downloads a file with all your progress',
'conta.baixar': 'Download',
'conta.restaurarBackup': 'Restore backup',
'conta.restaurarBackupNota': 'Recovers progress from a saved file',
'conta.escolherArquivo': 'Choose file',
'conta.zerarTudo': 'Reset everything',
'conta.zerar': 'Reset',
'conta.administracao': 'Administration',
'conta.administracaoNota': 'This section only appears for admins.',
'conta.comentariosToggle': 'Comments on lessons',
'conta.sobre': 'About',
'ranking.vocePrivado': 'You (private)',
'ranking.ativeParticipar': 'Turn on "${toggle}" in the ${conta} tab to compare with others.',
'ranking.ninguemSemana': "No one's on the leaderboard this week yet. Be the first!",
'ranking.ninguemTrimestre': "No one's on the leaderboard this quarter yet. Be the first!",
'ranking.alguem': 'Someone',
'ranking.pts': 'pts',
```

```js
// es
'conta.subtitulo': 'Tu perfil, apariencia y tus datos.',
'conta.loginSync': 'Inicio de sesión y sincronización',
'conta.entrarGoogle': 'Iniciar sesión con Google',
'conta.sairConta': 'Cerrar sesión',
'conta.nomePlaceholder': 'Tu nombre',
'conta.participarRanking': 'Participar en el ranking',
'conta.entreParaRanking': 'Inicia sesión con tu cuenta de Google para participar en el ranking.',
'conta.ranking': 'Ranking',
'conta.feedback': 'Feedback',
'conta.reportarBug': 'Reportar un error o sugerencia',
'conta.reportarBugNota': 'Abre un formulario rápido, toma menos de 1 minuto',
'conta.seusDados': 'Tus datos',
'conta.fazerBackup': 'Hacer copia de seguridad',
'conta.fazerBackupNota': 'Descarga un archivo con todo tu progreso',
'conta.baixar': 'Descargar',
'conta.restaurarBackup': 'Restaurar copia de seguridad',
'conta.restaurarBackupNota': 'Recupera el progreso de un archivo guardado',
'conta.escolherArquivo': 'Elegir archivo',
'conta.zerarTudo': 'Borrar todo',
'conta.zerar': 'Borrar',
'conta.administracao': 'Administración',
'conta.administracaoNota': 'Esta sección aparece solo para administradores.',
'conta.comentariosToggle': 'Comentarios en las lecciones',
'conta.sobre': 'Acerca de',
'ranking.vocePrivado': 'Tú (privado)',
'ranking.ativeParticipar': 'Activa "${toggle}" en la pestaña ${conta} para comparar con otras personas.',
'ranking.ninguemSemana': 'Todavía nadie está en el ranking esta semana. ¡Sé el primero!',
'ranking.ninguemTrimestre': 'Todavía nadie está en el ranking este trimestre. ¡Sé el primero!',
'ranking.alguem': 'Alguien',
'ranking.pts': 'pts',
```

`ranking.ativeParticipar` usa `${toggle}`/`${conta}` como placeholders literais (mesma técnica das tasks 3/4), resolvidos no Step 3 interpolando `t('conta.participarRanking')` e `t('nav.conta')`.

- [ ] **Step 2: Aplicar em `renderConta`**

Para cada string da tabela, localize o texto exato dentro de `renderConta` e troque por `t('chave')` (título "Conta" reaproveita `nav.conta`, já existente desde a Task 1 — não cria `conta.titulo` novo):

| Texto atual (pt) | Chave |
|---|---|
| `"Seu perfil, aparência e seus dados."` | `conta.subtitulo` |
| `"Login e sincronização"` | `conta.loginSync` |
| `"Entrar com Google"` | `conta.entrarGoogle` |
| `"Sair da conta"` | `conta.sairConta` |
| `placeholder="Seu nome"` | `conta.nomePlaceholder` (vira `placeholder="${t('conta.nomePlaceholder')}"`) |
| `"Participar do ranking"` | `conta.participarRanking` |
| `"Entre com sua conta Google para participar do ranking."` | `conta.entreParaRanking` |
| `"Ranking"` (cabeçalho de seção dentro de Conta) | `conta.ranking` |
| `"Feedback"` | `conta.feedback` |
| `"Reportar bug ou sugestão"` | `conta.reportarBug` |
| `"Abre um formulário rápido, leva menos de 1 minuto"` | `conta.reportarBugNota` |
| `"Seus dados"` | `conta.seusDados` |
| `"Fazer backup"` | `conta.fazerBackup` |
| `"Baixa um arquivo com todo seu progresso"` | `conta.fazerBackupNota` |
| `"Baixar"` | `conta.baixar` |
| `"Restaurar backup"` | `conta.restaurarBackup` |
| `"Recupera o progresso de um arquivo salvo"` | `conta.restaurarBackupNota` |
| `"Escolher arquivo"` | `conta.escolherArquivo` |
| `"Zerar tudo"` | `conta.zerarTudo` |
| `"Zerar"` | `conta.zerar` |
| `"Administração"` | `conta.administracao` |
| `"Esta seção aparece só para administradores."` | `conta.administracaoNota` |
| `"Comentários nas lições"` | `conta.comentariosToggle` |
| `"Sobre"` | `conta.sobre` |

- [ ] **Step 3: Aplicar no ranking (`carregarRankingTab` e vizinhos)**

Localize (dentro de `carregarRankingTab`, bloco sem opt-in):

```js
      panel.innerHTML = `
        <div class="ranking-row me">
          <span class="ranking-rank">—</span>
          <span class="ranking-name">Você (privado)</span>
          <span class="ranking-score">${dados.pontos} pts</span>
        </div>
        <p class="conta-note">Ative "Participar do ranking" na aba Conta pra comparar com outras pessoas.</p>`;
```

Substitua por:

```js
      panel.innerHTML = `
        <div class="ranking-row me">
          <span class="ranking-rank">—</span>
          <span class="ranking-name">${t('ranking.vocePrivado')}</span>
          <span class="ranking-score">${dados.pontos} ${t('ranking.pts')}</span>
        </div>
        <p class="conta-note">${t('ranking.ativeParticipar').replace('${toggle}', t('conta.participarRanking')).replace('${conta}', t('nav.conta'))}</p>`;
```

Localize também o estado vazio (`` `Ninguém no ranking ${tipo==='semana'?'essa semana':'esse trimestre'} ainda. Seja o primeiro!` ``) e troque por:

```js
tipo === 'semana' ? t('ranking.ninguemSemana') : t('ranking.ninguemTrimestre')
```

E o nome fallback `"Alguém"` → `t('ranking.alguem')`, e as ~3 outras ocorrências de `"pts"` (linhas ~3950/3990/3999, unidade ao lado da pontuação de cada linha do ranking) → `t('ranking.pts')`. As abas "Esta semana"/"Trimestre" do ranking (linhas ~3888-3889) reaproveitam `t('stats.semana')`/`t('stats.trimestre')` da Task 7 — não criar chave nova pra elas.

- [ ] **Step 4: Redesenhar Conta ao trocar idioma**

Mesmo padrão da Task 7 Step 3 — adicione mais um `if` em `recarregarConteudoNoIdiomaAtual`:

```js
    const contaAtiva = document.getElementById('tab-conta') && document.getElementById('tab-conta').classList.contains('active');
    if(contaAtiva){
      await renderConta();
      return;
    }
```

(confirme a assinatura real de `renderConta` antes de aplicar, igual observado na Task 7.)

- [ ] **Step 5: Testar**

Abra a aba Conta com `idiomaConteudoAtual='en'`, confira visualmente (screenshot) os rótulos; ative opt-in de ranking (se já não estiver) e confira a aba Ranking mostrando "Leaderboard"/pontuação em inglês.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: traduz aba Conta e Ranking"
```

---

## Task 9: Comentários

**Files:**
- Modify: `index.html` (linhas ~6060-6360: `desenharComentarios`, `enviarComentario`, etc.)

**Interfaces:**
- Consumes: `t()`, `common.carregando` (Task 7).
- Produces: chaves `comments.*`.

- [ ] **Step 1: Adicionar as chaves `comments.*`**

```js
// pt
'comments.entreParaComentar': 'Entre com sua conta Google para ver e deixar comentários.',
'comments.desligados': 'Os comentários estão desligados no momento.',
'comments.banido': 'Sua conta não pode comentar.',
'comments.vazio': 'Ninguém comentou esse dia ainda.',
'comments.placeholder': 'Escreva o que esse dia te deixou…',
'comments.comentar': 'Comentar',
'comments.enviando': 'Enviando…',
```

```js
// en
'comments.entreParaComentar': 'Sign in with your Google account to see and leave comments.',
'comments.desligados': 'Comments are currently turned off.',
'comments.banido': "Your account can't comment.",
'comments.vazio': "No one has commented on this day yet.",
'comments.placeholder': 'Write what this day left you with…',
'comments.comentar': 'Comment',
'comments.enviando': 'Sending…',
```

```js
// es
'comments.entreParaComentar': 'Inicia sesión con tu cuenta de Google para ver y dejar comentarios.',
'comments.desligados': 'Los comentarios están desactivados por ahora.',
'comments.banido': 'Tu cuenta no puede comentar.',
'comments.vazio': 'Todavía nadie comentó este día.',
'comments.placeholder': 'Escribe lo que este día te dejó…',
'comments.comentar': 'Comentar',
'comments.enviando': 'Enviando…',
```

- [ ] **Step 2: Aplicar**

| Texto atual (pt) | Chave |
|---|---|
| `"Entre com sua conta Google para ver e deixar comentários."` | `comments.entreParaComentar` |
| `"Os comentários estão desligados no momento."` | `comments.desligados` |
| `"Sua conta não pode comentar."` | `comments.banido` |
| `"Ninguém comentou esse dia ainda."` | `comments.vazio` |
| `placeholder="Escreva o que esse dia te deixou…"` | `comments.placeholder` |
| `"Comentar"` (texto padrão do botão) | `comments.comentar` |
| `"Enviando…"` (estado transitório do botão em `enviarComentario`) | `comments.enviando` |
| `"Carregando…"` (estado de loading dos comentários) | `common.carregando` (reaproveita, não cria chave nova) |

Todos dentro de `desenharComentarios`/`enviarComentario`/`toggleComentarios` (linhas ~6060-6360) — localize cada texto exato antes de editar.

- [ ] **Step 3: Testar**

Chame `desenharComentarios(1, 'dom', [], null)` com `idiomaConteudoAtual='es'` (lista vazia) e confirme que mostra `"Todavía nadie comentó este día."`.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: traduz seção de comentários"
```

---

## Task 10: `alert()`/`confirm()` visíveis à pessoa

**Files:**
- Modify: `index.html` (pontos espalhados: linhas ~3034, ~3072, ~3075, ~3082, ~3083, ~4646, ~4793, ~4929, ~6125, ~6138, ~6326, ~6333, ~6341, ~6508, ~6542, ~7561)

**Interfaces:**
- Consumes: `t()`.
- Produces: chaves `alerts.*`.

**Fora de escopo nesta task** (ver spec/auditoria — erros de configuração do Firebase, praticamente inalcançáveis em produção hoje): as mensagens das linhas ~6493 ("O login ainda nao esta configurado...") e ~6506 ("Este dominio nao esta autorizado no Firebase..."). Não criar chave pra elas, não mexer nessas duas linhas.

- [ ] **Step 1: Adicionar as chaves `alerts.*`**

```js
// pt
'alerts.rankingRemoveFalhou': 'Não conseguimos remover seus dados do ranking agora. Verifique sua conexão e tente novamente na aba Conta.',
'alerts.backupRestaurado': 'Backup restaurado! O app vai recarregar agora.',
'alerts.backupInvalido': 'Não consegui ler esse arquivo de backup.',
'alerts.confirmZerar1': 'Isso vai apagar TODO o seu progresso (lições, plano bíblico, metas). Não tem como desfazer. Tem certeza?',
'alerts.confirmZerar2': 'Confirma mesmo? Essa é a última chance de cancelar.',
'alerts.compartilharPrefixo': 'Compartilhar: ',
'alerts.selecioneData': 'Selecione uma data',
'alerts.planoCongelado': 'Plano congelado na data de hoje',
'alerts.confirmComentariosLigar': 'Ligar os comentários para todo mundo?',
'alerts.confirmComentariosDesligar': 'Desligar os comentários do app inteiro?',
'alerts.comentariosConfigFalhou': 'Não foi possível alterar agora. Confira se as regras do banco já foram publicadas.',
'alerts.comentarioEnvioFalhou': 'Não foi possível enviar seu comentário agora. Tente de novo em instantes.',
'alerts.confirmApagarComentario': 'Apagar este comentário?',
'alerts.comentarioApagarFalhou': 'Não foi possível apagar agora. Tente de novo.',
'alerts.loginFalhouPrefixo': 'Nao foi possivel entrar: ',
'alerts.confirmSair': 'Sair da conta?\n\nSeu progresso fica guardado na nuvem e volta ao entrar de novo. Ele sera removido deste aparelho para nao se misturar com o de outra pessoa.',
'alerts.licaoGithubFalhou': 'Não conseguimos buscar a lição do GitHub. Usando versão local.',
```

```js
// en
'alerts.rankingRemoveFalhou': "We couldn't remove your leaderboard data right now. Check your connection and try again from the Account tab.",
'alerts.backupRestaurado': 'Backup restored! The app will reload now.',
'alerts.backupInvalido': "Couldn't read that backup file.",
'alerts.confirmZerar1': "This will delete ALL your progress (lessons, Bible plan, goals). This can't be undone. Are you sure?",
'alerts.confirmZerar2': 'Really confirm? This is your last chance to cancel.',
'alerts.compartilharPrefixo': 'Share: ',
'alerts.selecioneData': 'Select a date',
'alerts.planoCongelado': "Plan frozen at today's date",
'alerts.confirmComentariosLigar': 'Turn comments on for everyone?',
'alerts.confirmComentariosDesligar': 'Turn off comments for the whole app?',
'alerts.comentariosConfigFalhou': "Couldn't change this right now. Check whether the database rules have been published yet.",
'alerts.comentarioEnvioFalhou': "Couldn't send your comment right now. Try again in a moment.",
'alerts.confirmApagarComentario': 'Delete this comment?',
'alerts.comentarioApagarFalhou': "Couldn't delete it right now. Try again.",
'alerts.loginFalhouPrefixo': "Couldn't sign in: ",
'alerts.confirmSair': "Sign out?\n\nYour progress stays saved in the cloud and comes back when you sign in again. It will be removed from this device so it doesn't mix with someone else's.",
'alerts.licaoGithubFalhou': "Couldn't fetch the lesson from GitHub. Using the local version.",
```

```js
// es
'alerts.rankingRemoveFalhou': 'No pudimos eliminar tus datos del ranking ahora. Revisa tu conexión e intenta de nuevo en la pestaña Cuenta.',
'alerts.backupRestaurado': '¡Copia de seguridad restaurada! La app se va a recargar ahora.',
'alerts.backupInvalido': 'No pude leer ese archivo de copia de seguridad.',
'alerts.confirmZerar1': 'Esto va a borrar TODO tu progreso (lecciones, plan bíblico, metas). No se puede deshacer. ¿Estás seguro?',
'alerts.confirmZerar2': '¿Confirmas de verdad? Esta es tu última oportunidad de cancelar.',
'alerts.compartilharPrefixo': 'Compartir: ',
'alerts.selecioneData': 'Selecciona una fecha',
'alerts.planoCongelado': 'Plan congelado en la fecha de hoy',
'alerts.confirmComentariosLigar': '¿Activar los comentarios para todos?',
'alerts.confirmComentariosDesligar': '¿Desactivar los comentarios de toda la app?',
'alerts.comentariosConfigFalhou': 'No se pudo cambiar ahora. Revisa si las reglas de la base de datos ya fueron publicadas.',
'alerts.comentarioEnvioFalhou': 'No se pudo enviar tu comentario ahora. Intenta de nuevo en un momento.',
'alerts.confirmApagarComentario': '¿Borrar este comentario?',
'alerts.comentarioApagarFalhou': 'No se pudo borrar ahora. Intenta de nuevo.',
'alerts.loginFalhouPrefixo': 'No se pudo iniciar sesión: ',
'alerts.confirmSair': '¿Cerrar sesión?\n\nTu progreso queda guardado en la nube y vuelve cuando inicies sesión de nuevo. Se eliminará de este dispositivo para no mezclarse con el de otra persona.',
'alerts.licaoGithubFalhou': 'No pudimos buscar la lección de GitHub. Usando la versión local.',
```

- [ ] **Step 2: Aplicar em cada `alert()`/`confirm()`**

Para cada linha da tabela, localize a chamada exata (`alert('...')`/`confirm('...')`) e troque o literal por `t('chave')` (concatenando prefixo + dado quando indicado):

| Linha aprox. | Chamada atual | Nova chamada |
|---|---|---|
| 3034 | `alert('Não conseguimos remover...')` | `alert(t('alerts.rankingRemoveFalhou'))` |
| 3072 | `alert('Backup restaurado!...')` | `alert(t('alerts.backupRestaurado'))` |
| 3075 | `alert('Não consegui ler esse arquivo...')` | `alert(t('alerts.backupInvalido'))` |
| 3082 | `confirm('Isso vai apagar TODO...')` | `confirm(t('alerts.confirmZerar1'))` |
| 3083 | `confirm('Confirma mesmo?...')` | `confirm(t('alerts.confirmZerar2'))` |
| 4646 | `alert('Compartilhar: '+plan.name)` | `alert(t('alerts.compartilharPrefixo')+plan.name)` (`plan.name` é dado, não traduz) |
| 4793 | `alert('Selecione uma data')` | `alert(t('alerts.selecioneData'))` |
| 4929 | `alert('Plano congelado na data de hoje')` | `alert(t('alerts.planoCongelado'))` |
| 6125 | `confirm(novo ? 'Ligar os comentários...' : 'Desligar os comentários...')` | `confirm(novo ? t('alerts.confirmComentariosLigar') : t('alerts.confirmComentariosDesligar'))` |
| 6138 | `alert('Não foi possível alterar agora...')` | `alert(t('alerts.comentariosConfigFalhou'))` |
| 6326 | `alert('Não foi possível enviar...')` | `alert(t('alerts.comentarioEnvioFalhou'))` |
| 6333 | `confirm('Apagar este comentário?')` | `confirm(t('alerts.confirmApagarComentario'))` |
| 6341 | `alert('Não foi possível apagar agora...')` | `alert(t('alerts.comentarioApagarFalhou'))` |
| 6508 | `alert('Nao foi possivel entrar: ' + (e.message || e.code))` | `alert(t('alerts.loginFalhouPrefixo') + (e.message || e.code))` (`e.message`/`e.code` é erro técnico do Firebase, não traduz) |
| 6542 | `confirm('Sair da conta?\n\n...')` | `confirm(t('alerts.confirmSair'))` |
| 7561 | `alert('Não conseguimos buscar a lição do GitHub...')` | `alert(t('alerts.licaoGithubFalhou'))` |

- [ ] **Step 3: Testar**

```js
idiomaConteudoAtual = 'en';
t('alerts.confirmSair'); // texto completo em inglês, com \n\n preservado
idiomaConteudoAtual = 'pt';
```

Não é possível testar `alert()`/`confirm()` reais via automação (bloqueiam a página) — a verificação é ler `t('chave')` diretamente pra cada uma das 16 chaves e conferir que o texto faz sentido nos 3 idiomas, mais uma inspeção visual do código no call site confirmando que a chamada foi trocada corretamente.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: traduz alert()/confirm() visíveis ao usuário"
```
