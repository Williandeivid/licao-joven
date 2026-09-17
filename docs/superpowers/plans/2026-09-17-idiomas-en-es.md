# Lição e Bíblia em inglês e espanhol — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deixar as abas Oficial, Resumo e Bíblia trocarem entre português, inglês e espanhol, com um seletor no menu do app (mesmo lugar de fonte/cor).

**Architecture:** Site estático de arquivo único (`index.html`), sem build/backend. Uma preferência local (`idioma-conteudo`, sincronizada pela conta) guarda o idioma escolhido numa variável de módulo lida em todo lugar que hoje monta URL/cache em português. Oficial e Bíblia buscam ao vivo de dois repositórios GitHub que já têm inglês e espanhol prontos (mesma estrutura que português) — só parametrizar URL. Resumo carrega um JSON de tradução à parte, sob demanda, com fallback pro português quando faltar.

**Tech Stack:** HTML/CSS/JS vanilla, sem build step, sem test runner. Verificação manual via `python3 -m http.server` + `mcp__claude-in-chrome__*` (mesmo padrão já usado nos planos anteriores deste projeto).

**Spec:** `docs/superpowers/specs/2026-09-17-idiomas-en-es-design.md`

## Global Constraints

- Idioma é sempre um destes três valores: `'pt'`, `'en'`, `'es'` — nunca outro.
- A **interface do app** (botões, menus, rótulos fixos) continua em português nesta entrega — só o conteúdo (lição + Bíblia) muda de idioma.
- Só o **trimestre atual** (`TRIMESTRE_ATUAL`) é afetado — sem suporte a outros trimestres.
- `idioma-conteudo` **não entra** em `CHAVES_LOCAIS` nem em `CHAVES_POR_APARELHO` — acompanha a conta, como qualquer ajuste comum (diferente de tema/fonte, que são por aparelho de propósito).
- Toda chave de cache que hoje é `${lessonId}-${dayId}` ou `${versionId}-${bookId}` e passa a depender de idioma **precisa incluir o idioma na chave** — nunca reaproveitar uma entrada de cache de outro idioma.
- Falha de rede ou de tradução ausente **nunca quebra a tela** — sempre cai num fallback silencioso (conteúdo em português, ou aviso já no tom existente do app), igual ao resto do app.
- Não introduzir Cloud Functions, backend, nem SDK do Firebase — nada disso muda aqui.

---

## Task 1: Preferência de idioma, seletor no menu, recarregamento da tela atual

**Files:**
- Modify: `index.html:1493-1512` (nova seção "Idioma" em `app-menu-panel`)
- Modify: `index.html:1978-1993` (`renderLessonDetail` — marca `data-lesson-id` no container, usa `content.title` traduzido no `<h1>`)
- Modify: `index.html:6886-6899` (bootstrap `window.addEventListener('load', ...)` — carrega o idioma salvo)
- Modify: `index.html` (novas funções perto de `loadBibleViewMode`/`setBibleViewMode`, por volta da linha 4829)

**Interfaces:**
- Consumes: `window.storage.get/set` (existente), `LESSONS_META`/`LESSONS_CONTENT` (existente).
- Produces:
  - `idiomaConteudoAtual` (variável de módulo, `'pt'|'en'|'es'`, valor inicial `'pt'`) — lida diretamente (sem `await`) por todo o resto do plano.
  - `carregarIdiomaConteudo()` → `Promise<void>` — lê a preferência salva e atualiza `idiomaConteudoAtual`. Chamada uma vez no boot.
  - `setIdiomaConteudo(idioma)` → `Promise<void>` — troca `idiomaConteudoAtual`, salva, atualiza o destaque dos botões no menu, fecha o menu, e recarrega a tela atual.
  - `recarregarConteudoNoIdiomaAtual()` → `Promise<void>` — usada pela Task 4 (e por qualquer troca de idioma) pra atualizar o que está na tela sem perder o lugar.
  - Usadas por: Task 2, 3 e 4 (leem `idiomaConteudoAtual` diretamente).

- [ ] **Step 1: Adicionar a seção "Idioma" no menu**

Localize em `index.html`:

```html
    <div style="padding:6px 12px 2px;font-size:11px;color:var(--ink-soft);font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Tamanho da fonte</div>
    <button id="font-size-menu-btn" onclick="cycleFontSize()" style="width:100%;padding:10px 12px;border:none;background:none;text-align:left;cursor:pointer;color:var(--ink);font-size:14px;border-radius:10px;display:flex;gap:10px;align-items:center;justify-content:space-between;">
      <span style="display:flex;gap:10px;align-items:center;">
        <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--violet);fill:none;stroke-width:2.2;flex-shrink:0;"><circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/></svg>
        Alternar tamanho
      </span>
      <span id="font-size-menu-label" style="font-size:12px;color:var(--ink-soft);"></span>
    </button>

    <hr style="margin:8px 0;border:none;border-top:1px solid var(--border);">

    <div style="padding:6px 12px 2px;font-size:11px;color:var(--ink-soft);font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Design</div>
```

Substitua por (nova seção "Idioma" entre "Tamanho da fonte" e "Design"):

```html
    <div style="padding:6px 12px 2px;font-size:11px;color:var(--ink-soft);font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Tamanho da fonte</div>
    <button id="font-size-menu-btn" onclick="cycleFontSize()" style="width:100%;padding:10px 12px;border:none;background:none;text-align:left;cursor:pointer;color:var(--ink);font-size:14px;border-radius:10px;display:flex;gap:10px;align-items:center;justify-content:space-between;">
      <span style="display:flex;gap:10px;align-items:center;">
        <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--violet);fill:none;stroke-width:2.2;flex-shrink:0;"><circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/></svg>
        Alternar tamanho
      </span>
      <span id="font-size-menu-label" style="font-size:12px;color:var(--ink-soft);"></span>
    </button>

    <hr style="margin:8px 0;border:none;border-top:1px solid var(--border);">

    <div style="padding:6px 12px 2px;font-size:11px;color:var(--ink-soft);font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Idioma</div>
    <div id="idioma-conteudo-row" style="display:flex;gap:8px;padding:8px 10px 4px;">
      <button class="idioma-conteudo-btn" data-idioma="pt" onclick="setIdiomaConteudo('pt')" style="flex:1;padding:8px 6px;border-radius:10px;border:2px solid var(--border);background:none;cursor:pointer;font-size:13px;font-weight:700;color:var(--ink);">🇧🇷 PT</button>
      <button class="idioma-conteudo-btn" data-idioma="en" onclick="setIdiomaConteudo('en')" style="flex:1;padding:8px 6px;border-radius:10px;border:2px solid var(--border);background:none;cursor:pointer;font-size:13px;font-weight:700;color:var(--ink);">🇺🇸 EN</button>
      <button class="idioma-conteudo-btn" data-idioma="es" onclick="setIdiomaConteudo('es')" style="flex:1;padding:8px 6px;border-radius:10px;border:2px solid var(--border);background:none;cursor:pointer;font-size:13px;font-weight:700;color:var(--ink);">🇲🇽 ES</button>
    </div>

    <hr style="margin:8px 0;border:none;border-top:1px solid var(--border);">

    <div style="padding:6px 12px 2px;font-size:11px;color:var(--ink-soft);font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Design</div>
```

- [ ] **Step 2: Adicionar CSS do botão ativo**

Localize (CSS do `.vpop-version-btn`, que já tem o padrão de estado "active" que vamos seguir):

```css
  .vpop-version-btn.active{background:var(--violet); color:var(--on-violet);}
```

Insira logo depois:

```css
  .vpop-version-btn.active{background:var(--violet); color:var(--on-violet);}
  .idioma-conteudo-btn.active{background:var(--violet); border-color:var(--violet); color:var(--on-violet);}
```

- [ ] **Step 3: Adicionar a variável, o loader e o setter**

Localize (perto de `bibleViewMode`, mesmo padrão a seguir):

```js
let bibleViewMode = 'list';
async function loadBibleViewMode(){
  try{
    const res = await window.storage.get('bible-view-mode', false);
    if(res && res.value) bibleViewMode = res.value;
  }catch(e){}
}
```

Insira logo antes dessas duas linhas:

```js
// ===== IDIOMA DO CONTEUDO (licao + biblia) =====
// So o conteudo troca de idioma - botoes, menus e rotulos fixos do app
// continuam em portugues nesta entrega. Variavel de modulo (nao window.storage
// direto) para que o resto do codigo leia sincrono, sem precisar de await
// espalhado por toda parte - mesmo principio de bibleViewMode logo abaixo.
let idiomaConteudoAtual = 'pt';
const IDIOMAS_SUPORTADOS = ['pt', 'en', 'es'];

async function carregarIdiomaConteudo(){
  try{
    const res = await window.storage.get('idioma-conteudo', false);
    if(res && res.value && IDIOMAS_SUPORTADOS.includes(res.value)) idiomaConteudoAtual = res.value;
  }catch(e){ /* chave ainda nao existe, fica pt */ }
  atualizarBotoesIdiomaConteudo();
}

function atualizarBotoesIdiomaConteudo(){
  document.querySelectorAll('.idioma-conteudo-btn').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.idioma === idiomaConteudoAtual);
  });
}

async function setIdiomaConteudo(idioma){
  if(!IDIOMAS_SUPORTADOS.includes(idioma) || idioma === idiomaConteudoAtual){
    const appMenu = document.getElementById('app-menu-panel');
    if(appMenu) appMenu.style.display = 'none';
    return;
  }
  idiomaConteudoAtual = idioma;
  try{ await window.storage.set('idioma-conteudo', idioma, false); }catch(e){}
  atualizarBotoesIdiomaConteudo();
  const appMenu = document.getElementById('app-menu-panel');
  if(appMenu) appMenu.style.display = 'none';
  await recarregarConteudoNoIdiomaAtual();
}

// Reaproveita a tela que ja esta aberta (licao ou biblia) e busca de novo
// no idioma corrente - sem isso, trocar o idioma so afetaria a proxima
// navegacao, nao o que a pessoa esta lendo agora.
async function recarregarConteudoNoIdiomaAtual(){
  try{
    const listAtivo = document.getElementById('tab-list') && document.getElementById('tab-list').classList.contains('active');
    if(listAtivo){
      const container = document.getElementById('detail-container');
      const lessonId = container && container.dataset.lessonId ? parseInt(container.dataset.lessonId) : null;
      if(lessonId){ await renderLessonDetail(lessonId, false); return; }
    }
    const bibleAtivo = document.getElementById('tab-bible') && document.getElementById('tab-bible').classList.contains('active');
    if(bibleAtivo && typeof bibleState !== 'undefined' && bibleState && bibleState.book && bibleState.chapter){
      await openBibleChapter(bibleState.chapter);
    }
  }catch(e){ console.warn('⚠️ Não recarregou o conteúdo no novo idioma:', e.message); }
}

let bibleViewMode = 'list';
async function loadBibleViewMode(){
  try{
    const res = await window.storage.get('bible-view-mode', false);
    if(res && res.value) bibleViewMode = res.value;
  }catch(e){}
}
```

- [ ] **Step 4: Marcar a lição atual no container e usar o título traduzido**

Localize em `renderLessonDetail`:

```js
  const meta = LESSONS_META.find(l=>l.id===lessonId);
  const content = LESSONS_CONTENT.find(l=>l.id===lessonId);
  const progress = progressCache[lessonId] || {days:{}, quiz:{}};
  const container = document.getElementById('detail-container');
  if(!container) return;
  window.scrollTo(0, 0);
```

Substitua por:

```js
  const meta = LESSONS_META.find(l=>l.id===lessonId);
  const content = LESSONS_CONTENT.find(l=>l.id===lessonId);
  const progress = progressCache[lessonId] || {days:{}, quiz:{}};
  const container = document.getElementById('detail-container');
  if(!container) return;
  container.dataset.lessonId = lessonId;
  window.scrollTo(0, 0);
```

Localize logo abaixo (título da lição no cabeçalho):

```js
  html += `<div class="eyebrow">Lição Jovem ${lessonId}</div>
    <h1 class="title">${meta.title}</h1>`;
```

Substitua por (usa o título de `content`, que a Task 4 passa a traduzir — hoje é igual a `meta.title`, então não muda nada até a Task 4 entrar):

```js
  html += `<div class="eyebrow">Lição Jovem ${lessonId}</div>
    <h1 class="title">${content ? content.title : meta.title}</h1>`;
```

- [ ] **Step 5: Chamar o loader no boot do app**

Localize:

```js
    try {
      await loadDesignTheme();
    } catch(e) {
      console.error('Init error (loadDesignTheme):', e);
    }
    try {
      await preloadAllProgress();
    } catch(e) {
      console.error('Init error (preloadAllProgress):', e);
    }
```

Substitua por:

```js
    try {
      await loadDesignTheme();
    } catch(e) {
      console.error('Init error (loadDesignTheme):', e);
    }
    try {
      await carregarIdiomaConteudo();
    } catch(e) {
      console.error('Init error (carregarIdiomaConteudo):', e);
    }
    try {
      await preloadAllProgress();
    } catch(e) {
      console.error('Init error (preloadAllProgress):', e);
    }
```

- [ ] **Step 6: Iniciar servidor local**

Run: `cd /Users/josiasgomeslima/Documents/licao-joven && (lsof -i :8000 -t | xargs -r kill) 2>/dev/null; python3 -m http.server 8000 >/tmp/server.log 2>&1 &`

- [ ] **Step 7: Testar troca de idioma — variável, storage, botões, container marcado**

No navegador (`javascript_tool`, depois de abrir `http://localhost:8000/index.html` e esperar ~1.5s):

```js
const backup = await window.storage.get('idioma-conteudo', false).catch(()=>null);
let resultado;
try{
  const antes = idiomaConteudoAtual;
  let chamouRecarregar = 0;
  const original = recarregarConteudoNoIdiomaAtual;
  window.recarregarConteudoNoIdiomaAtual = async () => { chamouRecarregar++; };

  await setIdiomaConteudo('en');
  const depois = idiomaConteudoAtual;
  const salvou = JSON.parse(JSON.stringify((await window.storage.get('idioma-conteudo', false)).value));
  const btnEn = document.querySelector('.idioma-conteudo-btn[data-idioma="en"]');
  const btnPt = document.querySelector('.idioma-conteudo-btn[data-idioma="pt"]');

  window.recarregarConteudoNoIdiomaAtual = original;
  resultado = JSON.stringify({
    antes, depois, salvou,
    btnEnAtivo: btnEn.classList.contains('active'),
    btnPtNaoAtivo: !btnPt.classList.contains('active'),
    chamouRecarregar
  });
}finally{
  if(backup && backup.value) await window.storage.set('idioma-conteudo', backup.value, false);
  else await window.storage.delete('idioma-conteudo', false).catch(()=>{});
  idiomaConteudoAtual = 'pt';
}
resultado;
```

Expected: `{"antes":"pt","depois":"en","salvou":"en","btnEnAtivo":true,"btnPtNaoAtivo":true,"chamouRecarregar":1}`.

- [ ] **Step 8: Testar que abrir uma lição marca `dataset.lessonId`**

```js
await goList();
await new Promise(r=>setTimeout(r,300));
const card = document.querySelector('.lesson-card, [onclick*="renderLessonDetail"], [data-lesson-id]');
// Abre a licao atual diretamente, sem depender do seletor exato do card:
await renderLessonDetail(getCurrentLessonId(), true);
await new Promise(r=>setTimeout(r,200));
JSON.stringify({ lessonId: document.getElementById('detail-container').dataset.lessonId });
```

Expected: `lessonId` igual ao retorno de `getCurrentLessonId()` (um número em formato string, ex. `"12"`).

- [ ] **Step 9: Parar servidor local**

Run: `lsof -i :8000 -t | xargs -r kill 2>/dev/null`

- [ ] **Step 10: Commit**

```bash
git add index.html
git commit -m "feat: preferencia de idioma do conteudo, seletor no menu e recarregamento da tela atual"
```

---

## Task 2: Aba Oficial em português, inglês e espanhol

**Files:**
- Modify: `index.html:6568-6744` (`buscarOficialDaRede` — URL por idioma + `formatBibleReferences` multilíngue)
- Modify: `index.html:6488-6503` (`getCachedOfficial`/`setCachedOfficial` — cache por idioma)
- Modify: `index.html:6550-6554` (`fetchOfficialContent` — chave de cache em memória por idioma)
- Modify: `index.html:6754` (`switchSourceTab` — mesma chave por idioma)
- Modify: `index.html:1547-1572` (novos dicionários `BOOK_NAME_TO_ID_EN`/`BOOK_NAME_TO_ID_ES` logo depois de `BOOK_NAME_TO_ID`)

**Interfaces:**
- Consumes: `idiomaConteudoAtual` (Task 1).
- Produces: `BOOK_NAME_TO_ID_EN`, `BOOK_NAME_TO_ID_ES` (mesmo formato de `BOOK_NAME_TO_ID`, usados só dentro desta task).

- [ ] **Step 1: Adicionar os dicionários de nomes de livro em inglês e espanhol**

Localize o fim de `BOOK_NAME_TO_ID`:

```js
  '1 Sm':'1SA','2 Sm':'2SA','1 Rs':'1KI','2 Rs':'2KI','1 Cr':'1CH','2 Cr':'2CH',
  '1 Co':'1CO','2 Co':'2CO','1 Ts':'1TH','2 Ts':'2TH','1 Tm':'1TI','2 Tm':'2TI',
  '1 Pe':'1PE','2 Pe':'2PE','1 Jo':'1JN','2 Jo':'2JN','3 Jo':'3JN','Fl':'PHP'
};
```

Substitua por (mesmo bloco + dois dicionários novos logo depois):

```js
  '1 Sm':'1SA','2 Sm':'2SA','1 Rs':'1KI','2 Rs':'2KI','1 Cr':'1CH','2 Cr':'2CH',
  '1 Co':'1CO','2 Co':'2CO','1 Ts':'1TH','2 Ts':'2TH','1 Tm':'1TI','2 Tm':'2TI',
  '1 Pe':'1PE','2 Pe':'2PE','1 Jo':'1JN','2 Jo':'2JN','3 Jo':'3JN','Fl':'PHP'
};

const BOOK_NAME_TO_ID_EN = {
  'Genesis':'GEN','Exodus':'EXO','Leviticus':'LEV','Numbers':'NUM','Deuteronomy':'DEU',
  'Joshua':'JOS','Judges':'JDG','Ruth':'RUT','1 Samuel':'1SA','2 Samuel':'2SA',
  '1 Kings':'1KI','2 Kings':'2KI','1 Chronicles':'1CH','2 Chronicles':'2CH','Ezra':'EZR',
  'Nehemiah':'NEH','Esther':'EST','Job':'JOB','Psalms':'PSA','Psalm':'PSA','Proverbs':'PRO',
  'Ecclesiastes':'ECC','Song of Solomon':'SNG','Song of Songs':'SNG','Isaiah':'ISA',
  'Jeremiah':'JER','Lamentations':'LAM','Ezekiel':'EZK','Daniel':'DAN','Hosea':'HOS',
  'Joel':'JOL','Amos':'AMO','Obadiah':'OBA','Jonah':'JON','Micah':'MIC','Nahum':'NAM',
  'Habakkuk':'HAB','Zephaniah':'ZEP','Haggai':'HAG','Zechariah':'ZEC','Malachi':'MAL',
  'Matthew':'MAT','Mark':'MRK','Luke':'LUK','John':'JHN','Acts':'ACT','Romans':'ROM',
  '1 Corinthians':'1CO','2 Corinthians':'2CO','Galatians':'GAL','Ephesians':'EPH',
  'Philippians':'PHP','Colossians':'COL','1 Thessalonians':'1TH','2 Thessalonians':'2TH',
  '1 Timothy':'1TI','2 Timothy':'2TI','Titus':'TIT','Philemon':'PHM','Hebrews':'HEB',
  'James':'JAS','1 Peter':'1PE','2 Peter':'2PE','1 John':'1JN','2 John':'2JN',
  '3 John':'3JN','Jude':'JUD','Revelation':'REV',
  'Gen':'GEN','Ex':'EXO','Lev':'LEV','Num':'NUM','Deut':'DEU','Josh':'JOS','Judg':'JDG',
  '1 Sam':'1SA','2 Sam':'2SA','1 Kgs':'1KI','2 Kgs':'2KI','1 Chr':'1CH','2 Chr':'2CH',
  'Neh':'NEH','Ps':'PSA','Prov':'PRO','Eccl':'ECC','Isa':'ISA','Jer':'JER','Lam':'LAM',
  'Ezek':'EZK','Dan':'DAN','Hos':'HOS','Obad':'OBA','Nah':'NAM','Hab':'HAB','Zeph':'ZEP',
  'Hag':'HAG','Zech':'ZEC','Mal':'MAL','Matt':'MAT','Mk':'MRK','Lk':'LUK','Jn':'JHN',
  'Rom':'ROM','1 Cor':'1CO','2 Cor':'2CO','Gal':'GAL','Eph':'EPH','Phil':'PHP',
  'Col':'COL','1 Thess':'1TH','2 Thess':'2TH','1 Tim':'1TI','2 Tim':'2TI','Phlm':'PHM',
  'Heb':'HEB','Jas':'JAS','1 Pet':'1PE','2 Pet':'2PE','1 Jn':'1JN','2 Jn':'2JN',
  '3 Jn':'3JN','Rev':'REV'
};

const BOOK_NAME_TO_ID_ES = {
  'Génesis':'GEN','Éxodo':'EXO','Levítico':'LEV','Números':'NUM','Deuteronomio':'DEU',
  'Josué':'JOS','Jueces':'JDG','Rut':'RUT','1 Samuel':'1SA','2 Samuel':'2SA',
  '1 Reyes':'1KI','2 Reyes':'2KI','1 Crónicas':'1CH','2 Crónicas':'2CH','Esdras':'EZR',
  'Nehemías':'NEH','Ester':'EST','Job':'JOB','Salmos':'PSA','Salmo':'PSA',
  'Proverbios':'PRO','Eclesiastés':'ECC','Cantares':'SNG','Isaías':'ISA',
  'Jeremías':'JER','Lamentaciones':'LAM','Ezequiel':'EZK','Daniel':'DAN','Oseas':'HOS',
  'Joel':'JOL','Amós':'AMO','Abdías':'OBA','Jonás':'JON','Miqueas':'MIC','Nahúm':'NAM',
  'Habacuc':'HAB','Sofonías':'ZEP','Hageo':'HAG','Zacarías':'ZEC','Malaquías':'MAL',
  'Mateo':'MAT','Marcos':'MRK','Lucas':'LUK','Juan':'JHN','Hechos':'ACT','Romanos':'ROM',
  '1 Corintios':'1CO','2 Corintios':'2CO','Gálatas':'GAL','Efesios':'EPH',
  'Filipenses':'PHP','Colosenses':'COL','1 Tesalonicenses':'1TH','2 Tesalonicenses':'2TH',
  '1 Timoteo':'1TI','2 Timoteo':'2TI','Tito':'TIT','Filemón':'PHM','Hebreos':'HEB',
  'Santiago':'JAS','1 Pedro':'1PE','2 Pedro':'2PE','1 Juan':'1JN','2 Juan':'2JN',
  '3 Juan':'3JN','Judas':'JUD','Apocalipsis':'REV',
  'Gn':'GEN','Ex':'EXO','Lv':'LEV','Nm':'NUM','Dt':'DEU','Jos':'JOS','Jue':'JDG',
  '1 Sm':'1SA','2 Sm':'2SA','1 Re':'1KI','2 Re':'2KI','1 Cr':'1CH','2 Cr':'2CH',
  'Neh':'NEH','Sal':'PSA','Prov':'PRO','Ecl':'ECC','Is':'ISA','Jer':'JER','Lam':'LAM',
  'Ez':'EZK','Dn':'DAN','Os':'HOS','Am':'AMO','Abd':'OBA','Jon':'JON','Miq':'MIC',
  'Nah':'NAM','Hab':'HAB','Sof':'ZEP','Hag':'HAG','Zac':'ZEC','Mal':'MAL','Mt':'MAT',
  'Mc':'MRK','Lc':'LUK','Jn':'JHN','Hch':'ACT','Rom':'ROM','1 Co':'1CO','2 Co':'2CO',
  'Gal':'GAL','Ef':'EPH','Flp':'PHP','Col':'COL','1 Ts':'1TH','2 Ts':'2TH',
  '1 Tim':'1TI','2 Tim':'2TI','Tit':'TIT','Flm':'PHM','Heb':'HEB','Stg':'JAS',
  '1 Pe':'1PE','2 Pe':'2PE','1 Jn':'1JN','2 Jn':'2JN','3 Jn':'3JN','Jud':'JUD','Ap':'REV'
};
```

- [ ] **Step 2: Trocar a URL do markdown e das imagens pelo idioma corrente**

Localize em `buscarOficialDaRede`:

```js
    // URL do arquivo .md
    const mdUrl = `https://raw.githubusercontent.com/Adventech/sabbath-school-lessons/${branch}/src/pt/${quarter}/${lessonNum}/${dayNum}.md`;

    const response = await fetch(mdUrl);
    if(!response.ok) throw new Error(`Não encontrado: ${response.status}`);

    let content = await response.text();

    // Extrair conteúdo após frontmatter
    const parts = content.split('---');
    if(parts.length >= 3) {
      content = parts[2].trim();
    }

    // Converter markdown para HTML com suporte melhorado
    const baseImageUrl = `https://raw.githubusercontent.com/Adventech/sabbath-school-lessons/${branch}/src/pt/${quarter}/${lessonNum}`;
```

Substitua por:

```js
    // URL do arquivo .md — pasta do idioma corrente (Adventech ja publica en/es
    // com a mesma estrutura de arquivos que pt, mesmo codigo de trimestre)
    const mdUrl = `https://raw.githubusercontent.com/Adventech/sabbath-school-lessons/${branch}/src/${idiomaConteudoAtual}/${quarter}/${lessonNum}/${dayNum}.md`;

    const response = await fetch(mdUrl);
    if(!response.ok) throw new Error(`Não encontrado: ${response.status}`);

    let content = await response.text();

    // Extrair conteúdo após frontmatter
    const parts = content.split('---');
    if(parts.length >= 3) {
      content = parts[2].trim();
    }

    // Converter markdown para HTML com suporte melhorado
    const baseImageUrl = `https://raw.githubusercontent.com/Adventech/sabbath-school-lessons/${branch}/src/${idiomaConteudoAtual}/${quarter}/${lessonNum}`;
```

- [ ] **Step 3: Tornar `formatBibleReferences` ciente do idioma**

Localize:

```js
    // Função auxiliar para converter referências bíblicas em links
    function formatBibleReferences(text) {
      let lastBookId = null, lastChapter = null;

      function wrapVerse(bookId, chapter, v1, v2, label){
        v2 = v2 || v1;
        return `<span class="vref" data-book="${bookId}" data-chapter="${chapter}" data-v1="${v1}" data-v2="${v2}" onclick="toggleVerseLive(this)">${label}</span><span class="vref-pop"></span>`;
      }
      function wrapChapter(fullName, chapter, label){
        return `<a href="javascript:openBibleReference('${fullName} ${chapter}')" style="color:var(--violet);text-decoration:underline;cursor:pointer;">${label}</a>`;
      }

      const bookKeys = Object.keys(BOOK_NAME_TO_ID).sort((a,b)=>b.length-a.length);
      const namesPattern = bookKeys.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
      const fullCiteRe = new RegExp('(?<![A-Za-zÀ-ÿ])(' + namesPattern + ')\\s+(\\d+)(?::(\\d+)(?:-(\\d+))?)?((?:,\\s?\\d+)*)', 'g');

      // Primeiro: livro + capítulo[:versículos][, versículo extra...]
      text = text.replace(fullCiteRe, (match, bookName, chapter, v1, v2, extraList) => {
        const bookId = BOOK_NAME_TO_ID[bookName];
        if(!bookId) return match;
```

Substitua por:

```js
    // Função auxiliar para converter referências bíblicas em links
    function formatBibleReferences(text) {
      let lastBookId = null, lastChapter = null;
      const dicionarioLivros = idiomaConteudoAtual === 'en' ? BOOK_NAME_TO_ID_EN
        : idiomaConteudoAtual === 'es' ? BOOK_NAME_TO_ID_ES
        : BOOK_NAME_TO_ID;

      function wrapVerse(bookId, chapter, v1, v2, label){
        v2 = v2 || v1;
        return `<span class="vref" data-book="${bookId}" data-chapter="${chapter}" data-v1="${v1}" data-v2="${v2}" onclick="toggleVerseLive(this)">${label}</span><span class="vref-pop"></span>`;
      }
      function wrapChapter(fullName, chapter, label){
        return `<a href="javascript:openBibleReference('${fullName} ${chapter}')" style="color:var(--violet);text-decoration:underline;cursor:pointer;">${label}</a>`;
      }

      const bookKeys = Object.keys(dicionarioLivros).sort((a,b)=>b.length-a.length);
      const namesPattern = bookKeys.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
      const fullCiteRe = new RegExp('(?<![A-Za-zÀ-ÿ])(' + namesPattern + ')\\s+(\\d+)(?::(\\d+)(?:-(\\d+))?)?((?:,\\s?\\d+)*)', 'g');

      // Primeiro: livro + capítulo[:versículos][, versículo extra...]
      text = text.replace(fullCiteRe, (match, bookName, chapter, v1, v2, extraList) => {
        const bookId = dicionarioLivros[bookName];
        if(!bookId) return match;
```

`formatBibleReferences` só referencia `BOOK_NAME_TO_ID` nesses dois lugares (`Object.keys(...)` e `[bookName]`) — o bloco acima já cobre os dois.

- [ ] **Step 4: Cache do conteúdo oficial por idioma (localStorage)**

Localize:

```js
function getCachedOfficial(lessonId, dayId){
  const key = `official-${lessonId}-${dayId}`;
  const stored = localStorage.getItem(key);
  if(!stored) return null;
  try{
    const {content, timestamp} = JSON.parse(stored);
    if(Date.now() - timestamp < CACHE_TTL) return content;
    localStorage.removeItem(key);
  } catch(e){}
  return null;
}

function setCachedOfficial(lessonId, dayId, content){
  const key = `official-${lessonId}-${dayId}`;
  localStorage.setItem(key, JSON.stringify({content, timestamp: Date.now()}));
}
```

Substitua por:

```js
function getCachedOfficial(lessonId, dayId){
  const key = `official-${idiomaConteudoAtual}-${lessonId}-${dayId}`;
  const stored = localStorage.getItem(key);
  if(!stored) return null;
  try{
    const {content, timestamp} = JSON.parse(stored);
    if(Date.now() - timestamp < CACHE_TTL) return content;
    localStorage.removeItem(key);
  } catch(e){}
  return null;
}

function setCachedOfficial(lessonId, dayId, content){
  const key = `official-${idiomaConteudoAtual}-${lessonId}-${dayId}`;
  localStorage.setItem(key, JSON.stringify({content, timestamp: Date.now()}));
}
```

- [ ] **Step 5: Cache em memória e checagem do `switchSourceTab` por idioma**

Localize:

```js
async function fetchOfficialContent(lessonId, dayId){
  const cacheKey = `${lessonId}-${dayId}`;
  if(officialContentCache[cacheKey]) return officialContentCache[cacheKey];
```

Substitua por:

```js
async function fetchOfficialContent(lessonId, dayId){
  const cacheKey = `${idiomaConteudoAtual}-${lessonId}-${dayId}`;
  if(officialContentCache[cacheKey]) return officialContentCache[cacheKey];
```

Localize:

```js
  // Se clicou em Oficial e ainda não carregou, carrega agora
  if(btn.dataset.tab === 'oficial' && !officialContentCache[`${lessonId}-${dayId}`]){
    loadOfficialContent(lessonId, dayId);
  }
```

Substitua por:

```js
  // Se clicou em Oficial e ainda não carregou, carrega agora
  if(btn.dataset.tab === 'oficial' && !officialContentCache[`${idiomaConteudoAtual}-${lessonId}-${dayId}`]){
    loadOfficialContent(lessonId, dayId);
  }
```

- [ ] **Step 6: `buscarOficialDaRede` usa a chave por idioma também**

A função já grava em `officialContentCache[cacheKey]` usando a variável `cacheKey` montada logo no início da função — só falta essa variável incluir o idioma. Localize:

```js
async function buscarOficialDaRede(lessonId, dayId){
  const cacheKey = `${lessonId}-${dayId}`;
```

Substitua por:

```js
async function buscarOficialDaRede(lessonId, dayId){
  const cacheKey = `${idiomaConteudoAtual}-${lessonId}-${dayId}`;
```

- [ ] **Step 7: Iniciar servidor local**

Run: `cd /Users/josiasgomeslima/Documents/licao-joven && (lsof -i :8000 -t | xargs -r kill) 2>/dev/null; python3 -m http.server 8000 >/tmp/server.log 2>&1 &`

- [ ] **Step 8: Testar que a URL muda com o idioma (fetch mockado, sem tocar na rede real)**

```js
const chamadas = [];
const fetchOriginal = window.fetch.bind(window);
window.fetch = async (url, opts) => {
  chamadas.push(url);
  if(String(url).includes('.md')) return new Response('---\ntitle: Test\n---\n\n# Titulo\n\nTexto de teste com John 3:16 dentro.', {status:200});
  return new Response('', {status:200});
};

idiomaConteudoAtual = 'en';
delete officialContentCache['pt-1-dom']; delete officialContentCache['en-1-dom'];
const htmlEn = await buscarOficialDaRede(1, 'dom');
idiomaConteudoAtual = 'pt';

window.fetch = fetchOriginal;
JSON.stringify({
  chamouUrlEn: chamadas.some(u => u.includes('/src/en/')),
  linkouReferencia: htmlEn.includes('data-book="JHN"') && htmlEn.includes('data-chapter="3"')
});
```

Expected: `{"chamouUrlEn":true,"linkouReferencia":true}` — confirma que a URL usou `/src/en/` e que "John 3:16" virou link clicável usando o dicionário em inglês.

- [ ] **Step 9: Testar que o cache não mistura idiomas**

```js
const fetchOriginal = window.fetch.bind(window);
let chamadasReais = 0;
window.fetch = async (url) => { chamadasReais++; return new Response('---\ntitle: T\n---\n\n# T\n\nTexto pt.', {status:200}); };

delete officialContentCache['pt-1-dom']; delete officialContentCache['en-1-dom'];
idiomaConteudoAtual = 'pt';
await buscarOficialDaRede(1, 'dom'); // grava cache pt
idiomaConteudoAtual = 'en';
await buscarOficialDaRede(1, 'dom'); // deveria buscar de novo, cache separado
idiomaConteudoAtual = 'pt';

window.fetch = fetchOriginal;
JSON.stringify({ chamadasReais, temCachePt: !!officialContentCache['pt-1-dom'], temCacheEn: !!officialContentCache['en-1-dom'] });
```

Expected: `{"chamadasReais":2,"temCachePt":true,"temCacheEn":true}` — duas chamadas de rede (uma por idioma), e as duas entradas de cache coexistem sem se sobrescrever.

- [ ] **Step 10: Parar servidor local**

Run: `lsof -i :8000 -t | xargs -r kill 2>/dev/null`

- [ ] **Step 11: Commit**

```bash
git add index.html
git commit -m "feat: aba Oficial em ingles/espanhol, com toque pra ver versiculo nos tres idiomas"
```

---

## Task 3: Aba Bíblia em português, inglês e espanhol

**Files:**
- Modify: `index.html:5002-5074` (`fetchBookGithub`, `fetchNVI`, `fetchARA`, nova `fetchVersaoUnica`, `fetchTranslation`)
- Modify: `index.html:2249-2312` (`fetchVerseVersion`, `versionSwitchRow`, `toggleVerseLive`, `switchVerseVersion`, `renderVerseVersion`)
- Modify: `index.html:5076-5153` (`openBibleChapter`, botões de tradução em `renderBibleChapterContent`)

**Interfaces:**
- Consumes: `idiomaConteudoAtual` (Task 1).
- Produces: `IDIOMA_BIBLIA_VERSAO_PADRAO` (mapa idioma → versão única en/es), `fetchVersaoUnica(idioma, bookMeta, chapter)`.

- [ ] **Step 1: `fetchBookGithub` recebe o idioma e monta a pasta certa**

Localize:

```js
const bookJsonCache = {};
async function fetchBookGithub(versionId, myBookId){
  const cacheKey = versionId + '-' + myBookId;
  if(bookJsonCache[cacheKey]) return bookJsonCache[cacheKey];
  const ghId = BOOK_ID_TO_GITHUB[myBookId];
  if(!ghId) throw new Error('Livro sem correspondência: ' + myBookId);
  const url = `https://raw.githubusercontent.com/MaatheusGois/bible/main/versions/pt-br/${versionId}/${ghId}/${ghId}.json`;
  const res = await fetch(url);
  if(!res.ok) throw new Error(versionId + ' (GitHub) falhou: ' + res.status);
  const json = await res.json();
  bookJsonCache[cacheKey] = json;
  return json;
}

async function fetchNVI(book, chapter){
  const data = await fetchBookGithub('nvi', book.id);
  const chapterVerses = data.chapters && data.chapters[chapter - 1];
  if(!chapterVerses || !chapterVerses.length) throw new Error('NVI: capítulo vazio');
  const verses = chapterVerses.map((text, idx) => ({ verse: String(idx + 1), text }));
  return { verses, note: 'NVI' };
}

async function fetchARA(book, chapter){
  const data = await fetchBookGithub('arc', book.id);
  const chapterVerses = data.chapters && data.chapters[chapter - 1];
  if(!chapterVerses || !chapterVerses.length) throw new Error('ARC: capítulo vazio');
  const verses = chapterVerses.map((text, idx) => ({ verse: String(idx + 1), text }));
  return { verses, note: 'ARC (Almeida Revista e Corrigida)' };
}
```

Substitua por:

```js
// Pasta e versao unica gratuita disponivel por idioma neste repositorio
// (MaatheusGois/bible). Portugues tem NVI e ARC pra escolher; ingles e
// espanhol so tem uma versao gratuita cada aqui.
const IDIOMA_BIBLIA = {
  pt: { pasta: 'pt-br' },
  en: { pasta: 'en', versaoUnica: 'kjv' },
  es: { pasta: 'es', versaoUnica: 'rvr' }
};

const bookJsonCache = {};
async function fetchBookGithub(idioma, versionId, myBookId){
  const cacheKey = idioma + '-' + versionId + '-' + myBookId;
  if(bookJsonCache[cacheKey]) return bookJsonCache[cacheKey];
  const ghId = BOOK_ID_TO_GITHUB[myBookId];
  if(!ghId) throw new Error('Livro sem correspondência: ' + myBookId);
  const pasta = (IDIOMA_BIBLIA[idioma] || IDIOMA_BIBLIA.pt).pasta;
  const url = `https://raw.githubusercontent.com/MaatheusGois/bible/main/versions/${pasta}/${versionId}/${ghId}/${ghId}.json`;
  const res = await fetch(url);
  if(!res.ok) throw new Error(versionId + ' (GitHub) falhou: ' + res.status);
  const json = await res.json();
  bookJsonCache[cacheKey] = json;
  return json;
}

async function fetchNVI(book, chapter){
  const data = await fetchBookGithub('pt', 'nvi', book.id);
  const chapterVerses = data.chapters && data.chapters[chapter - 1];
  if(!chapterVerses || !chapterVerses.length) throw new Error('NVI: capítulo vazio');
  const verses = chapterVerses.map((text, idx) => ({ verse: String(idx + 1), text }));
  return { verses, note: 'NVI' };
}

async function fetchARA(book, chapter){
  const data = await fetchBookGithub('pt', 'arc', book.id);
  const chapterVerses = data.chapters && data.chapters[chapter - 1];
  if(!chapterVerses || !chapterVerses.length) throw new Error('ARC: capítulo vazio');
  const verses = chapterVerses.map((text, idx) => ({ verse: String(idx + 1), text }));
  return { verses, note: 'ARC (Almeida Revista e Corrigida)' };
}

// Unica versao gratuita disponivel pra ingles/espanhol nesta fonte -
// usada tanto na leitura por capitulo quanto no popup de referencia.
async function fetchVersaoUnica(idioma, book, chapter){
  const versionId = IDIOMA_BIBLIA[idioma].versaoUnica;
  const data = await fetchBookGithub(idioma, versionId, book.id);
  const chapterVerses = data.chapters && data.chapters[chapter - 1];
  if(!chapterVerses || !chapterVerses.length) throw new Error(versionId + ': capítulo vazio');
  const verses = chapterVerses.map((text, idx) => ({ verse: String(idx + 1), text }));
  return { verses, note: versionId.toUpperCase() };
}
```

- [ ] **Step 2: `fetchTranslation` passa a considerar o idioma**

Localize:

```js
async function fetchTranslation(book, chapter, translation){
  const cacheKey = book.id+'-'+chapter+'-'+translation;
  if(bibleChapterCache[cacheKey]) return bibleChapterCache[cacheKey];
  const result = translation==='nvi' ? await fetchNVI(book, chapter) : await fetchARA(book, chapter);
  bibleChapterCache[cacheKey] = result;
  return result;
}
```

Substitua por:

```js
async function fetchTranslation(idioma, book, chapter, translation){
  const cacheKey = idioma+'-'+book.id+'-'+chapter+'-'+translation;
  if(bibleChapterCache[cacheKey]) return bibleChapterCache[cacheKey];
  const result = idioma !== 'pt'
    ? await fetchVersaoUnica(idioma, book, chapter)
    : (translation==='nvi' ? await fetchNVI(book, chapter) : await fetchARA(book, chapter));
  bibleChapterCache[cacheKey] = result;
  return result;
}
```

- [ ] **Step 3: `openBibleChapter` usa o idioma corrente e esconde o alternador de versão fora do português**

Localize:

```js
async function openBibleChapter(chapter){
  bibleState.chapter = chapter;
  bibleState.translation = bibleState.translation || 'ara';
  const container = document.getElementById('bible-container');
  if(!container) return;
  const book = BIBLE_BOOKS.find(b=>b.id===bibleState.book);
  container.innerHTML = `<div class="bible-wrap"><div class="bible-crumbs">
    ${bibleCrumbHtml(book)}
  </div><div class="bible-loading">Carregando ${book.name} ${chapter}...</div></div>`;
  window.scrollTo(0,0);

  let result, usedTranslation = bibleState.translation;
  try{
    result = await fetchTranslation(book, chapter, usedTranslation);
  }catch(e1){
    const fallback = usedTranslation==='nvi' ? 'ara' : 'nvi';
    try{
      result = await fetchTranslation(book, chapter, fallback);
      usedTranslation = fallback;
      bibleState.translation = fallback;
    }catch(e2){
      try{
        result = await fetchARAviaProxy(book, chapter);
        usedTranslation = 'ara';
        bibleState.translation = 'ara';
        bibleChapterCache[book.id+'-'+chapter+'-ara'] = result;
      }catch(e3){
      const slug = BIBLIAONLINE_SLUG[book.id] || '';
      const externalUrl = `https://www.bibliaonline.com.br/nvi/${slug}/${chapter}`;
      container.innerHTML = `<div class="bible-wrap"><div class="bible-crumbs">
        ${bibleCrumbHtml(book)}
      </div><div class="bible-error">Não consegui buscar este capítulo agora (sem conexão ou bloqueio de rede).<br>
      <a href="${externalUrl}" target="_blank" rel="noopener" class="vpop-extlink">Abrir ${book.name} ${chapter} num site de Bíblia →</a><br><br>
      <button onclick="openBibleChapter(${chapter})">Tentar de novo</button></div></div>`;
      return;
      }
    }
  }
  await renderBibleChapterContent(book, chapter, result, usedTranslation);
}
```

Substitua por:

```js
async function openBibleChapter(chapter){
  bibleState.chapter = chapter;
  bibleState.translation = bibleState.translation || 'ara';
  const container = document.getElementById('bible-container');
  if(!container) return;
  const book = BIBLE_BOOKS.find(b=>b.id===bibleState.book);
  const idioma = idiomaConteudoAtual;
  container.innerHTML = `<div class="bible-wrap"><div class="bible-crumbs">
    ${bibleCrumbHtml(book)}
  </div><div class="bible-loading">Carregando ${book.name} ${chapter}...</div></div>`;
  window.scrollTo(0,0);

  let result, usedTranslation = bibleState.translation;
  try{
    result = await fetchTranslation(idioma, book, chapter, usedTranslation);
  }catch(e1){
    if(idioma !== 'pt'){
      container.innerHTML = `<div class="bible-wrap"><div class="bible-crumbs">
        ${bibleCrumbHtml(book)}
      </div><div class="bible-error">Não consegui buscar este capítulo agora (sem conexão ou bloqueio de rede).<br><br>
      <button onclick="openBibleChapter(${chapter})">Tentar de novo</button></div></div>`;
      return;
    }
    const fallback = usedTranslation==='nvi' ? 'ara' : 'nvi';
    try{
      result = await fetchTranslation(idioma, book, chapter, fallback);
      usedTranslation = fallback;
      bibleState.translation = fallback;
    }catch(e2){
      try{
        result = await fetchARAviaProxy(book, chapter);
        usedTranslation = 'ara';
        bibleState.translation = 'ara';
        bibleChapterCache['pt-'+book.id+'-'+chapter+'-ara'] = result;
      }catch(e3){
      const slug = BIBLIAONLINE_SLUG[book.id] || '';
      const externalUrl = `https://www.bibliaonline.com.br/nvi/${slug}/${chapter}`;
      container.innerHTML = `<div class="bible-wrap"><div class="bible-crumbs">
        ${bibleCrumbHtml(book)}
      </div><div class="bible-error">Não consegui buscar este capítulo agora (sem conexão ou bloqueio de rede).<br>
      <a href="${externalUrl}" target="_blank" rel="noopener" class="vpop-extlink">Abrir ${book.name} ${chapter} num site de Bíblia →</a><br><br>
      <button onclick="openBibleChapter(${chapter})">Tentar de novo</button></div></div>`;
      return;
      }
    }
  }
  await renderBibleChapterContent(book, chapter, result, usedTranslation, idioma);
}
```

- [ ] **Step 4: Esconder o alternador NVI/ARA fora do português**

Localize (dentro de `renderBibleChapterContent`):

```js
async function renderBibleChapterContent(book, chapter, result, translation){
  const container = document.getElementById('bible-container');
  if(!container) return;
  const verses = result.verses || [];
  let html = `<div class="bible-wrap">
    <div class="bible-crumbs">
      ${bibleCrumbHtml(book)}
    </div>
    <div class="verse-card">
      <div class="verse-card-head">
        <h2>${book.name} ${chapter}</h2>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="fav-star-btn" id="fav-star-btn-chapter" onclick="toggleFavorite('${book.id}',${chapter},0,0,'${book.name} ${chapter}')"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>
          <div class="translation-toggle">
            <button class="${translation==='nvi'?'active':''}" onclick="switchTranslation('nvi')">NVI</button>
            <button class="${translation==='ara'?'active':''}" onclick="switchTranslation('ara')">ARA</button>
          </div>
```

Substitua por:

```js
async function renderBibleChapterContent(book, chapter, result, translation, idioma){
  const container = document.getElementById('bible-container');
  if(!container) return;
  idioma = idioma || idiomaConteudoAtual;
  const verses = result.verses || [];
  let html = `<div class="bible-wrap">
    <div class="bible-crumbs">
      ${bibleCrumbHtml(book)}
    </div>
    <div class="verse-card">
      <div class="verse-card-head">
        <h2>${book.name} ${chapter}</h2>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="fav-star-btn" id="fav-star-btn-chapter" onclick="toggleFavorite('${book.id}',${chapter},0,0,'${book.name} ${chapter}')"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>
          ${idioma === 'pt' ? `<div class="translation-toggle">
            <button class="${translation==='nvi'?'active':''}" onclick="switchTranslation('nvi')">NVI</button>
            <button class="${translation==='ara'?'active':''}" onclick="switchTranslation('ara')">ARA</button>
          </div>` : ''}
```

- [ ] **Step 5: Popup de referência — `fetchVerseVersion`, `versionSwitchRow`, `toggleVerseLive`, `switchVerseVersion`, `renderVerseVersion`**

Localize (bloco inteiro, do `fetchVerseVersion` até o fim de `renderVerseVersion`):

```js
async function fetchVerseVersion(version, bookMeta, chapter){
  const cacheKey = version+'-'+bookMeta.id+'-'+chapter;
  if(!verseFetchCache[cacheKey]){
    const result = version==='nvi' ? await fetchNVI(bookMeta, chapter) : await fetchARA(bookMeta, chapter);
    verseFetchCache[cacheKey] = result.verses;
  }
  return verseFetchCache[cacheKey];
}

function versionSwitchRow(activeVersion, book, chapter, v1, v2){
  const btn = (v, label) => `<button class="vpop-version-btn${v===activeVersion?' active':''}" onclick="switchVerseVersion('${v}','${book}',${chapter},${v1},${v2})">${label}</button>`;
  return `<div class="vpop-version-row">${btn('nvi','NVI')}${btn('arc','ARC')}</div>`;
}

async function toggleVerseLive(el){
  const book = el.dataset.book, chapter = parseInt(el.dataset.chapter);
  const v1 = parseInt(el.dataset.v1), v2 = parseInt(el.dataset.v2);
  const bookMeta = BIBLE_BOOKS.find(b=>b.id===book);
  const slug = BIBLIAONLINE_SLUG[book] || '';
  const externalUrl = `https://www.bibliaonline.com.br/nvi/${slug}/${chapter}`;
  const externalLink = `<a href="${externalUrl}" target="_blank" rel="noopener" class="vpop-extlink">Abrir ${bookMeta.name} ${chapter} num site de Bíblia →</a>`;
  const refLabel = v1===v2 ? `${bookMeta.name} ${chapter}:${v1}` : `${bookMeta.name} ${chapter}:${v1}-${v2}`;

  openVerseModal(refLabel, `${versionSwitchRow('nvi',book,chapter,v1,v2)}<span class="vpop-loading">Buscando o texto...</span><br>${externalLink}`, {book,chapter,v1,v2,label:refLabel});
  await renderVerseVersion('nvi', bookMeta, chapter, v1, v2, externalLink);
}

async function switchVerseVersion(version, book, chapter, v1, v2){
  const bookMeta = BIBLE_BOOKS.find(b=>b.id===book);
  const slug = BIBLIAONLINE_SLUG[book] || '';
  const externalUrl = `https://www.bibliaonline.com.br/${version==='nvi'?'nvi':'acf'}/${slug}/${chapter}`;
  const externalLink = `<a href="${externalUrl}" target="_blank" rel="noopener" class="vpop-extlink">Abrir ${bookMeta.name} ${chapter} num site de Bíblia →</a>`;
  updateVerseModalBody(`${versionSwitchRow(version,book,chapter,v1,v2)}<span class="vpop-loading">Buscando o texto...</span><br>${externalLink}`);
  await renderVerseVersion(version, bookMeta, chapter, v1, v2, externalLink);
}

async function renderVerseVersion(version, bookMeta, chapter, v1, v2, externalLink){
  let allVerses;
  try{
    allVerses = await fetchVerseVersion(version, bookMeta, chapter);
  }catch(e){
    if(version==='nvi'){
      try{ allVerses = await fetchVerseVersion('arc', bookMeta, chapter); version = 'arc'; }
      catch(e2){
        updateVerseModalBody(`${versionSwitchRow(version,bookMeta.id,chapter,v1,v2)}<span class="vpop-loading">Não consegui buscar aqui dentro agora.</span><br>${externalLink}`);
        return;
      }
    } else {
      updateVerseModalBody(`${versionSwitchRow(version,bookMeta.id,chapter,v1,v2)}<span class="vpop-loading">Não consegui buscar aqui dentro agora.</span><br>${externalLink}`);
      return;
    }
  }
  const verses = allVerses.filter(v=>{
    const vn = parseInt(v.verse);
    return vn >= v1 && vn <= v2;
  });
  if(verses.length === 0){
    updateVerseModalBody(`${versionSwitchRow(version,bookMeta.id,chapter,v1,v2)}<span class="vpop-loading">Versículo não encontrado neste capítulo.</span><br>${externalLink}`);
    return;
  }
  const text = verses.map(v=> (verses.length>1?`<b>${v.verse}</b> `:'') + v.text).join(' ');
  updateVerseModalBody(`${versionSwitchRow(version,bookMeta.id,chapter,v1,v2)}${text}`);
}
```

Substitua por:

```js
async function fetchVerseVersion(idioma, version, bookMeta, chapter){
  const cacheKey = idioma+'-'+version+'-'+bookMeta.id+'-'+chapter;
  if(!verseFetchCache[cacheKey]){
    const result = idioma !== 'pt'
      ? await fetchVersaoUnica(idioma, bookMeta, chapter)
      : (version==='nvi' ? await fetchNVI(bookMeta, chapter) : await fetchARA(bookMeta, chapter));
    verseFetchCache[cacheKey] = result.verses;
  }
  return verseFetchCache[cacheKey];
}

// So mostra alternador de versao em portugues - ingles/espanhol so tem
// uma versao gratuita disponivel nesta fonte, nao ha o que escolher.
function versionSwitchRow(idioma, activeVersion, book, chapter, v1, v2){
  if(idioma !== 'pt') return '';
  const btn = (v, label) => `<button class="vpop-version-btn${v===activeVersion?' active':''}" onclick="switchVerseVersion('${v}','${book}',${chapter},${v1},${v2})">${label}</button>`;
  return `<div class="vpop-version-row">${btn('nvi','NVI')}${btn('arc','ARC')}</div>`;
}

async function toggleVerseLive(el){
  const book = el.dataset.book, chapter = parseInt(el.dataset.chapter);
  const v1 = parseInt(el.dataset.v1), v2 = parseInt(el.dataset.v2);
  const bookMeta = BIBLE_BOOKS.find(b=>b.id===book);
  const idioma = idiomaConteudoAtual;
  const versaoInicial = idioma === 'pt' ? 'nvi' : IDIOMA_BIBLIA[idioma].versaoUnica;
  // Link externo (bibliaonline.com.br) so existe em portugues - nao faz
  // sentido mandar quem le em ingles/espanhol pra um site so em pt.
  const externalLink = idioma === 'pt'
    ? (() => {
        const slug = BIBLIAONLINE_SLUG[book] || '';
        const externalUrl = `https://www.bibliaonline.com.br/nvi/${slug}/${chapter}`;
        return `<a href="${externalUrl}" target="_blank" rel="noopener" class="vpop-extlink">Abrir ${bookMeta.name} ${chapter} num site de Bíblia →</a>`;
      })()
    : '';
  const refLabel = v1===v2 ? `${bookMeta.name} ${chapter}:${v1}` : `${bookMeta.name} ${chapter}:${v1}-${v2}`;

  openVerseModal(refLabel, `${versionSwitchRow(idioma,versaoInicial,book,chapter,v1,v2)}<span class="vpop-loading">Buscando o texto...</span><br>${externalLink}`, {book,chapter,v1,v2,label:refLabel});
  await renderVerseVersion(idioma, versaoInicial, bookMeta, chapter, v1, v2, externalLink);
}

async function switchVerseVersion(version, book, chapter, v1, v2){
  const bookMeta = BIBLE_BOOKS.find(b=>b.id===book);
  const idioma = idiomaConteudoAtual;
  const externalLink = idioma === 'pt'
    ? (() => {
        const slug = BIBLIAONLINE_SLUG[book] || '';
        const externalUrl = `https://www.bibliaonline.com.br/${version==='nvi'?'nvi':'acf'}/${slug}/${chapter}`;
        return `<a href="${externalUrl}" target="_blank" rel="noopener" class="vpop-extlink">Abrir ${bookMeta.name} ${chapter} num site de Bíblia →</a>`;
      })()
    : '';
  updateVerseModalBody(`${versionSwitchRow(idioma,version,book,chapter,v1,v2)}<span class="vpop-loading">Buscando o texto...</span><br>${externalLink}`);
  await renderVerseVersion(idioma, version, bookMeta, chapter, v1, v2, externalLink);
}

async function renderVerseVersion(idioma, version, bookMeta, chapter, v1, v2, externalLink){
  let allVerses;
  try{
    allVerses = await fetchVerseVersion(idioma, version, bookMeta, chapter);
  }catch(e){
    if(idioma === 'pt' && version==='nvi'){
      try{ allVerses = await fetchVerseVersion(idioma, 'arc', bookMeta, chapter); version = 'arc'; }
      catch(e2){
        updateVerseModalBody(`${versionSwitchRow(idioma,version,bookMeta.id,chapter,v1,v2)}<span class="vpop-loading">Não consegui buscar aqui dentro agora.</span><br>${externalLink}`);
        return;
      }
    } else {
      updateVerseModalBody(`${versionSwitchRow(idioma,version,bookMeta.id,chapter,v1,v2)}<span class="vpop-loading">Não consegui buscar aqui dentro agora.</span><br>${externalLink}`);
      return;
    }
  }
  const verses = allVerses.filter(v=>{
    const vn = parseInt(v.verse);
    return vn >= v1 && vn <= v2;
  });
  if(verses.length === 0){
    updateVerseModalBody(`${versionSwitchRow(idioma,version,bookMeta.id,chapter,v1,v2)}<span class="vpop-loading">Versículo não encontrado neste capítulo.</span><br>${externalLink}`);
    return;
  }
  const text = verses.map(v=> (verses.length>1?`<b>${v.verse}</b> `:'') + v.text).join(' ');
  updateVerseModalBody(`${versionSwitchRow(idioma,version,bookMeta.id,chapter,v1,v2)}${text}`);
}
```

- [ ] **Step 6: Iniciar servidor local**

Run: `cd /Users/josiasgomeslima/Documents/licao-joven && (lsof -i :8000 -t | xargs -r kill) 2>/dev/null; python3 -m http.server 8000 >/tmp/server.log 2>&1 &`

- [ ] **Step 7: Testar `fetchBookGithub` com idioma diferente monta a pasta certa (fetch mockado)**

```js
const chamadas = [];
const fetchOriginal = window.fetch.bind(window);
window.fetch = async (url) => { chamadas.push(url); return new Response(JSON.stringify({id:'jo', chapters:[['In the beginning...']]}), {status:200}); };

delete bookJsonCache['en-kjv-JHN'];
const data = await fetchBookGithub('en', 'kjv', 'JHN');

window.fetch = fetchOriginal;
JSON.stringify({ url: chamadas[0], temPasta: chamadas[0].includes('/versions/en/kjv/'), chapters: data.chapters.length });
```

Expected: `{"url":"...(url com /versions/en/kjv/jo/jo.json)...","temPasta":true,"chapters":1}`.

- [ ] **Step 8: Testar o popup de referência em espanhol — sem alternador de versão, sem link externo**

```js
const fetchOriginal = window.fetch.bind(window);
window.fetch = async () => new Response(JSON.stringify({id:'jn', chapters:[Array(17).fill('Texto de prueba')]}), {status:200});

idiomaConteudoAtual = 'es';
await toggleVerseLive({ dataset: { book:'JHN', chapter:'3', v1:'16', v2:'16' } });
await new Promise(r=>setTimeout(r,300));

const body = document.getElementById('verse-modal-body');
const resultado = {
  temVersionRow: !!body.querySelector('.vpop-version-row'),
  temLinkExterno: !!body.querySelector('.vpop-extlink'),
  temTexto: body.textContent.trim().length > 0
};
closeVerseModal();
idiomaConteudoAtual = 'pt';
window.fetch = fetchOriginal;
JSON.stringify(resultado);
```

Expected: `{"temVersionRow":false,"temLinkExterno":false,"temTexto":true}`.

- [ ] **Step 9: Testar que em português o alternador continua aparecendo (comportamento antigo preservado)**

```js
const fetchOriginal = window.fetch.bind(window);
window.fetch = async () => new Response(JSON.stringify({id:'jo', chapters:[Array(17).fill('Texto de teste')]}), {status:200});

idiomaConteudoAtual = 'pt';
await toggleVerseLive({ dataset: { book:'JHN', chapter:'3', v1:'16', v2:'16' } });
await new Promise(r=>setTimeout(r,300));

const body = document.getElementById('verse-modal-body');
const resultado = { temVersionRow: !!body.querySelector('.vpop-version-row'), temLinkExterno: !!body.querySelector('.vpop-extlink') };
closeVerseModal();
window.fetch = fetchOriginal;
JSON.stringify(resultado);
```

Expected: `{"temVersionRow":true,"temLinkExterno":true}`.

- [ ] **Step 10: Checar console por erros**

Use `mcp__claude-in-chrome__read_console_messages` com `pattern: "error|Error"` — Expected: nenhuma mensagem relacionada aos testes acima.

- [ ] **Step 11: Parar servidor local**

Run: `lsof -i :8000 -t | xargs -r kill 2>/dev/null`

- [ ] **Step 12: Commit**

```bash
git add index.html
git commit -m "feat: aba Biblia (leitura e popup de referencia) em ingles e espanhol"
```

---

## Task 4: Aba Resumo com conteúdo traduzido, com fallback pro português

**Files:**
- Create: `licoes-en.json` (fixture mínima pra teste — arquivo real com as 13 lições é gerado depois, fora deste plano)
- Create: `licoes-es.json` (mesma fixture mínima)
- Modify: `index.html:1978-1993` (`renderLessonDetail` — usa conteúdo traduzido quando disponível)
- Modify: `index.html` (nova função `carregarTraducaoResumo`/`aplicarTraducaoConteudo`, perto de `officialContentCache`)

**Interfaces:**
- Consumes: `idiomaConteudoAtual` (Task 1), `LESSONS_CONTENT` (existente).
- Produces: `aplicarTraducaoConteudo(contentPt, idioma)` → `Promise<object>` (retorna `contentPt` sem mudanças se `idioma==='pt'` ou tradução indisponível; senão retorna uma cópia mesclada com os campos traduzidos).

- [ ] **Step 1: Criar as fixtures de tradução (uma lição só, pra testar o mecanismo)**

Crie `/Users/josiasgomeslima/Documents/licao-joven/licoes-en.json`:

```json
[
  {
    "id": 1,
    "title": "Decisive Confrontation",
    "keyword": "DELIVERY",
    "days": [
      {
        "id": "dom",
        "title": "The Beginning of the End",
        "summary": "The resurrection of Lazarus was Jesus' last great public miracle — and, at the same time, the spark that sealed the religious leaders' decision to kill Him.",
        "body": ["<p>The resurrection of Lazarus was the last great miracle performed by Jesus during His public ministry.</p>"],
        "reflectTitle": "Reflection Questions",
        "reflect": ["Why do you think Jesus' greatest miracle generated more hatred, instead of more faith?"]
      }
    ]
  }
]
```

Crie `/Users/josiasgomeslima/Documents/licao-joven/licoes-es.json`:

```json
[
  {
    "id": 1,
    "title": "Confrontación Decisiva",
    "keyword": "ENTREGA",
    "days": [
      {
        "id": "dom",
        "title": "El Comienzo del Fin",
        "summary": "La resurrección de Lázaro fue el último gran milagro público de Jesús — y, al mismo tiempo, la chispa que selló la decisión de los líderes religiosos de matarlo.",
        "body": ["<p>La resurrección de Lázaro fue el último gran milagro realizado por Jesús durante Su ministerio público.</p>"],
        "reflectTitle": "Preguntas de Reflexión",
        "reflect": ["¿Por qué crees que el mayor milagro de Jesús generó más odio, en lugar de más fe?"]
      }
    ]
  }
]
```

(Essas fixtures cobrem só a Lição 1, dia `dom`, campos `title`/`summary`/`body`/`reflect` — o suficiente pra testar merge e fallback. As 13 lições completas, nos dois idiomas, são geradas depois como um passo de conteúdo à parte, fora deste plano de código.)

- [ ] **Step 2: Função de carregar e mesclar a tradução**

Localize:

```js
const officialContentCache = {};
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
```

Insira logo antes:

```js
// ===== TRADUCAO DA ABA RESUMO =====
// So carrega o arquivo do idioma quando alguem troca pra ingles/espanhol -
// em portugues (o padrao) nao baixa nada extra, o conteudo ja esta embutido
// em LESSONS_CONTENT.
const traducaoResumoCache = {};

async function carregarTraducaoResumo(idioma){
  if(idioma === 'pt') return null;
  if(traducaoResumoCache[idioma]) return traducaoResumoCache[idioma];
  try{
    const res = await fetch(`licoes-${idioma}.json`);
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const lista = await res.json();
    traducaoResumoCache[idioma] = lista;
    return lista;
  }catch(e){
    console.warn('⚠️ Não carregou a tradução da lição (' + idioma + '):', e.message);
    traducaoResumoCache[idioma] = []; // evita tentar de novo a cada render nesta sessao
    return [];
  }
}

// Mescla os campos traduzidos por cima de uma copia do conteudo em
// portugues. Campos ausentes na traducao (lista de dias menor, ou o
// proprio dia faltando) caem pro portugues automaticamente - cobertura
// parcial nunca quebra a tela.
function aplicarTraducaoConteudo(contentPt, idioma, listaTraducoes){
  if(idioma === 'pt' || !contentPt || !listaTraducoes) return contentPt;
  const traducaoLicao = listaTraducoes.find(l => l.id === contentPt.id);
  if(!traducaoLicao) return contentPt;

  const mesclado = Object.assign({}, contentPt, traducaoLicao, {
    days: contentPt.days.map(diaPt => {
      const diaTraduzido = traducaoLicao.days && traducaoLicao.days.find(d => d.id === diaPt.id);
      return diaTraduzido ? Object.assign({}, diaPt, diaTraduzido) : diaPt;
    })
  });
  return mesclado;
}

const officialContentCache = {};
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
```

- [ ] **Step 3: Usar a tradução em `renderLessonDetail`**

Localize:

```js
  const meta = LESSONS_META.find(l=>l.id===lessonId);
  const content = LESSONS_CONTENT.find(l=>l.id===lessonId);
  const progress = progressCache[lessonId] || {days:{}, quiz:{}};
  const container = document.getElementById('detail-container');
  if(!container) return;
  container.dataset.lessonId = lessonId;
  window.scrollTo(0, 0);
```

Substitua por:

```js
  const meta = LESSONS_META.find(l=>l.id===lessonId);
  const contentPt = LESSONS_CONTENT.find(l=>l.id===lessonId);
  const listaTraducoes = await carregarTraducaoResumo(idiomaConteudoAtual);
  const content = aplicarTraducaoConteudo(contentPt, idiomaConteudoAtual, listaTraducoes);
  const progress = progressCache[lessonId] || {days:{}, quiz:{}};
  const container = document.getElementById('detail-container');
  if(!container) return;
  container.dataset.lessonId = lessonId;
  window.scrollTo(0, 0);
```

- [ ] **Step 4: Iniciar servidor local**

Run: `cd /Users/josiasgomeslima/Documents/licao-joven && (lsof -i :8000 -t | xargs -r kill) 2>/dev/null; python3 -m http.server 8000 >/tmp/server.log 2>&1 &`

- [ ] **Step 5: Testar carregamento e cache da tradução**

```js
const chamadas = [];
const fetchOriginal = window.fetch.bind(window);
window.fetch = async (url, opts) => { chamadas.push(String(url)); return fetchOriginal(url, opts); };

delete traducaoResumoCache['en'];
const lista1 = await carregarTraducaoResumo('en');
const lista2 = await carregarTraducaoResumo('en'); // deveria vir do cache, sem nova chamada de rede

window.fetch = fetchOriginal;
JSON.stringify({
  chamadasDeRede: chamadas.filter(u=>u.includes('licoes-en.json')).length,
  licoesCarregadas: lista1.length,
  mesmaReferencia: lista1 === lista2
});
```

Expected: `{"chamadasDeRede":1,"licoesCarregadas":1,"mesmaReferencia":true}`.

- [ ] **Step 6: Testar merge — campo traduzido substitui, campo ausente cai pro português**

```js
const contentPt = LESSONS_CONTENT.find(l=>l.id===1);
const listaEn = await carregarTraducaoResumo('en');
const mesclado = aplicarTraducaoConteudo(contentPt, 'en', listaEn);
const diaDom = mesclado.days.find(d=>d.id==='dom');
const diaSeg = mesclado.days.find(d=>d.id==='seg'); // fixture nao tem 'seg' em ingles

JSON.stringify({
  tituloTraduzido: mesclado.title === 'Decisive Confrontation',
  domSummaryTraduzido: diaDom.summary.startsWith('The resurrection of Lazarus'),
  segCaiuNoPortugues: diaSeg.summary === contentPt.days.find(d=>d.id==='seg').summary
});
```

Expected: `{"tituloTraduzido":true,"domSummaryTraduzido":true,"segCaiuNoPortugues":true}`.

- [ ] **Step 7: Testar fallback quando o arquivo de tradução não existe**

```js
const fetchOriginal = window.fetch.bind(window);
window.fetch = async (url) => url.includes('licoes-es.json') ? new Response('', {status:404}) : fetchOriginal(url);

delete traducaoResumoCache['es'];
const lista = await carregarTraducaoResumo('es');
const contentPt = LESSONS_CONTENT.find(l=>l.id===1);
const mesclado = aplicarTraducaoConteudo(contentPt, 'es', lista);

window.fetch = fetchOriginal;
JSON.stringify({ listaVazia: lista.length === 0, caiuTodoNoPortugues: mesclado.title === contentPt.title });
```

Expected: `{"listaVazia":true,"caiuTodoNoPortugues":true}`.

- [ ] **Step 8: Testar a tela inteira — abrir a Lição 1 em inglês mostra o título traduzido**

```js
idiomaConteudoAtual = 'en';
await renderLessonDetail(1, false);
await new Promise(r=>setTimeout(r,300));
const titulo = document.querySelector('#detail-container .title');
const resultado = JSON.stringify({ titulo: titulo ? titulo.textContent : null });
idiomaConteudoAtual = 'pt';
await renderLessonDetail(1, false);
resultado;
```

Expected: `{"titulo":"Decisive Confrontation"}`.

- [ ] **Step 9: Checar console por erros**

Use `mcp__claude-in-chrome__read_console_messages` com `pattern: "error|Error"` — Expected: nenhuma mensagem inesperada (o aviso de fallback do Step 7 é esperado, via `console.warn`, não `console.error`).

- [ ] **Step 10: Parar servidor local**

Run: `lsof -i :8000 -t | xargs -r kill 2>/dev/null`

- [ ] **Step 11: Commit**

```bash
git add index.html licoes-en.json licoes-es.json
git commit -m "feat: aba Resumo com traducao sob demanda e fallback pro portugues"
```

---

## Pós-implementação (não faz parte deste plano)

- **Gerar a tradução completa das 13 lições** em `licoes-en.json`/`licoes-es.json` (título, resumo, corpo, perguntas reflexivas e quiz de cada um dos 7 dias × 13 lições, nos dois idiomas) — substituindo as fixtures de 1 lição criadas na Task 4. Trabalho de conteúdo, não de código; fica pra depois deste plano, coordenado separadamente (ex.: um agente por lição).
- Título das lições na aba "Lições" (lista das 13, `renderLessonList()`) continua em português mesmo com outro idioma selecionado — só o título dentro da lição aberta (`renderLessonDetail`) foi coberto aqui.
- `BOOK_NAME_TO_ID_EN`/`BOOK_NAME_TO_ID_ES` cobrem nome completo + abreviações comuns dos 66 livros; variações menos comuns de abreviação não detectadas caem como texto normal (mesmo comportamento de hoje em português pra abreviações fora da lista).
