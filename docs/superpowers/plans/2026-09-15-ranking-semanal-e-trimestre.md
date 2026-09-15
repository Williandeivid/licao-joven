# Ranking semanal e acumulado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um ranking público (semanal e acumulado do trimestre) ao app, comparando dias de lição concluídos e nota média dos quizzes entre usuários que optarem por participar.

**Architecture:** Site estático de arquivo único (`index.html`) + Firebase Realtime Database via REST, sem backend. O cliente calcula sua própria pontuação a partir de `progressCache` (já mantido localmente) e grava diretamente em dois nós públicos novos (`/ranking/{semanaId}/{uid}` e `/ranking_trimestre/{trimestreId}/{uid}`), seguindo o mesmo padrão de leitura/escrita direta via `fetch` já usado pelos comentários e pela sincronização de progresso.

**Tech Stack:** HTML/CSS/JS vanilla (sem build step, sem framework, sem test runner). Firebase Realtime Database (REST API). Verificação manual via `python3 -m http.server` + as ferramentas `mcp__claude-in-chrome__*` (não há jest/pytest neste projeto — é assim que o bugfix do quiz, feito nesta mesma sessão, foi verificado).

**Spec:** `docs/superpowers/specs/2026-09-15-ranking-semanal-design.md`

## Global Constraints

- Nome exibido publicamente é sempre só o primeiro nome (`primeiroNome()`), nunca o nome completo nem o e-mail.
- Participação é opt-in explícito (switch desligado por padrão) — nunca automática.
- Escala de pontos é sempre 0-100: `pontos = round(diasConcluidos/base * 60) + round(notaMedia/100 * 40)`, onde `base` é `7` no semanal e `diasElapsados` no trimestre.
- Cliente calcula e grava a própria pontuação (sem Cloud Functions) — risco de adulteração aceito e documentado no spec, não deve ser "corrigido" nesta implementação.
- Toda escrita no Firebase relacionada a ranking é silenciosa (try/catch, `console.warn`) — uma falha de rede aqui nunca pode quebrar o fluxo de concluir dia/quiz.
- Toda leitura/escrita do ranking usa o padrão REST direto já estabelecido (`fetch` + `${FIREBASE_DB}/.../uid.json?auth=${token}`), igual aos comentários — não introduzir o SDK do Firebase.

---

## Task 1: Regras do Firebase (documentação)

**Files:**
- Modify: `FIREBASE-SETUP.md`

**Interfaces:**
- Produces: bloco de regras JSON documentado, a ser colado manualmente no console do Firebase pelo usuário (mesma ida já pendente no arquivo) — nenhuma outra task depende disto para funcionar hoje, porque as regras atuais do banco ainda estão abertas (`FIREBASE-SETUP.md` confirma isso). Isto documenta o que falta fechar quando o usuário aplicar as regras pendentes.

- [ ] **Step 1: Adicionar os nós `ranking` e `ranking_trimestre` ao bloco de regras pendente**

Abra `FIREBASE-SETUP.md` e localize o bloco de regras JSON (seção "⚠️ Falta fazer — fechar o banco de dados"). Substitua o bloco existente por este, que mantém as regras de `usuarios` já documentadas e adiciona `ranking`/`ranking_trimestre`:

```json
{
  "rules": {
    "usuarios": {
      "$uid": {
        ".read":  "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "ranking": {
      "$semanaId": {
        ".read": "auth != null",
        "$uid": {
          ".write": "auth != null && auth.uid === $uid",
          ".validate": "newData.hasChildren(['nome','diasConcluidos','notaMedia','pontos']) && newData.child('diasConcluidos').val() >= 0 && newData.child('diasConcluidos').val() <= 7 && newData.child('notaMedia').val() >= 0 && newData.child('notaMedia').val() <= 100"
        }
      }
    },
    "ranking_trimestre": {
      "$trimestreId": {
        ".read": "auth != null",
        "$uid": {
          ".write": "auth != null && auth.uid === $uid",
          ".validate": "newData.hasChildren(['nome','diasConcluidos','diasElapsados','notaMedia','pontos']) && newData.child('diasConcluidos').val() >= 0 && newData.child('diasConcluidos').val() <= newData.child('diasElapsados').val() && newData.child('notaMedia').val() >= 0 && newData.child('notaMedia').val() <= 100"
        }
      }
    }
  }
}
```

- [ ] **Step 2: Verificar que o JSON é válido**

Run: `node -e "JSON.parse(require('fs').readFileSync('FIREBASE-SETUP.md','utf8').match(/\`\`\`json\n(\{[\s\S]*?\})\n\`\`\`/)[1]); console.log('OK')"`
Expected: `OK` impresso, sem erro de parse.

- [ ] **Step 3: Commit**

```bash
git add FIREBASE-SETUP.md
git commit -m "docs: adiciona regras do ranking ao fechamento pendente do Firebase"
```

---

## Task 2: Funções de cálculo de pontuação

**Files:**
- Modify: `index.html:3112-3114` (inserir entre o fim de `computeDaysInRange` e o início de `computeDailyStreakSync`)

**Interfaces:**
- Consumes: `buildProgressMap()` (retorna `{[dateKey]: {studied, pct, date, time}}`), `dateKey(Date)`, `dayCalendarDate(lessonId, dayId)`, `findLessonDayByDate(key)` — todas já existentes no arquivo.
- Produces:
  - `getQuarterRange()` → `{start: Date, end: Date}`
  - `calcularRankingSemanal()` → `{semanaId: string, diasConcluidos: number, notaMedia: number, pontos: number}`
  - `calcularRankingTrimestre()` → `{trimestreId: string, diasConcluidos: number, diasElapsados: number, notaMedia: number, pontos: number}`
  - Usadas pela Task 3 (gravação) e Task 6 (exibição).

- [ ] **Step 1: Inserir as três funções**

Localize em `index.html` o trecho (função `computeDaysInRange`, termina com):

```js
function computeDaysInRange(progressMap, startDate, endDate){
  let count = 0;
  const cursor = new Date(startDate);
  while(cursor <= endDate){
    const key = dateKey(cursor);
    const lessonDone = progressMap[key] && progressMap[key].studied;
    const bibleDone = !!(bibleActivityLog && bibleActivityLog[key]);
    if(lessonDone || bibleDone) count++;
    cursor.setDate(cursor.getDate()+1);
  }
  return count;
}

function computeDailyStreakSync(progressMap){
```

Insira as três funções novas entre o `}` que fecha `computeDaysInRange` e a linha `function computeDailyStreakSync(progressMap){`:

```js
function computeDaysInRange(progressMap, startDate, endDate){
  let count = 0;
  const cursor = new Date(startDate);
  while(cursor <= endDate){
    const key = dateKey(cursor);
    const lessonDone = progressMap[key] && progressMap[key].studied;
    const bibleDone = !!(bibleActivityLog && bibleActivityLog[key]);
    if(lessonDone || bibleDone) count++;
    cursor.setDate(cursor.getDate()+1);
  }
  return count;
}

// ===== RANKING: intervalo do trimestre e calculo de pontos =====
function getQuarterRange(){
  return { start: dayCalendarDate(1, 'dom'), end: dayCalendarDate(13, 'sab') };
}

function calcularRankingSemanal(){
  const progressMap = buildProgressMap();
  const today = new Date(); today.setHours(0,0,0,0);
  const sunday = new Date(today); sunday.setDate(today.getDate() - today.getDay());
  let diasConcluidos = 0;
  const notas = [];
  const cursor = new Date(sunday);
  while(cursor <= today){
    const info = progressMap[dateKey(cursor)];
    if(info && info.studied) diasConcluidos++;
    if(info && info.pct !== null && info.pct !== undefined) notas.push(info.pct);
    cursor.setDate(cursor.getDate() + 1);
  }
  const notaMedia = notas.length ? Math.round(notas.reduce((a,b)=>a+b,0)/notas.length) : 0;
  const pontos = Math.round(diasConcluidos/7*60) + Math.round(notaMedia/100*40);
  return { semanaId: dateKey(sunday), diasConcluidos, notaMedia, pontos };
}

function calcularRankingTrimestre(){
  const progressMap = buildProgressMap();
  const { start, end } = getQuarterRange();
  const today = new Date(); today.setHours(0,0,0,0);
  const limite = today < end ? today : end;
  let diasElapsados = Math.floor((limite - start) / 86400000) + 1;
  if(diasElapsados < 1) diasElapsados = 1;
  let diasConcluidos = 0;
  const notas = [];
  Object.keys(progressMap).forEach(key => {
    const dia = new Date(key + 'T00:00:00');
    if(dia < start || dia > limite) return;
    const info = progressMap[key];
    if(info.studied) diasConcluidos++;
    if(info.pct !== null && info.pct !== undefined) notas.push(info.pct);
  });
  const notaMedia = notas.length ? Math.round(notas.reduce((a,b)=>a+b,0)/notas.length) : 0;
  const pontos = Math.round(diasConcluidos/diasElapsados*60) + Math.round(notaMedia/100*40);
  return { trimestreId: dateKey(start), diasConcluidos, diasElapsados, notaMedia, pontos };
}

function computeDailyStreakSync(progressMap){
```

(A última linha (`function computeDailyStreakSync...`) já existe — não duplicar, é só o marcador de onde o bloco novo termina.)

- [ ] **Step 2: Iniciar servidor local**

Run: `cd /Users/josiasgomeslima/Documents/licao-joven && (lsof -i :8000 -t | xargs -r kill) 2>/dev/null; python3 -m http.server 8000 >/tmp/server.log 2>&1 &`
Expected: processo sobe em background, sem erro.

- [ ] **Step 3: Testar `calcularRankingSemanal()` no navegador com fixture controlada**

Usando as ferramentas `mcp__claude-in-chrome__*` (navegar para `http://localhost:8000/index.html`, esperar a lição carregar), execute via `javascript_tool`:

```js
const backup = JSON.parse(JSON.stringify(progressCache));
let resultado;
try {
  Object.keys(progressCache).forEach(k => { progressCache[k] = {days:{}, quiz:{}}; });

  const today = new Date(); today.setHours(0,0,0,0);
  const sunday = new Date(today); sunday.setDate(today.getDate() - today.getDay());
  const dias = [];
  const cursor = new Date(sunday);
  while(cursor <= today){ dias.push(new Date(cursor)); cursor.setDate(cursor.getDate()+1); }

  const notasEsperadas = [80, 100];
  let diasConcluidosEsperado = 0, somaNotas = 0, qtdNotas = 0;
  dias.forEach((d, i) => {
    const key = dateKey(d);
    const match = findLessonDayByDate(key);
    if(!match || i >= 2) return;
    const p = progressCache[match.lessonId] || {days:{}, quiz:{}};
    p.days[match.dayId] = {studied:true, estMinutes:5};
    p.quiz[match.dayId] = {correct: notasEsperadas[i]/10, total:10, time:1000};
    progressCache[match.lessonId] = p;
    diasConcluidosEsperado++;
    somaNotas += notasEsperadas[i]; qtdNotas++;
  });

  const notaMediaEsperada = qtdNotas ? Math.round(somaNotas/qtdNotas) : 0;
  const pontosEsperados = Math.round(diasConcluidosEsperado/7*60) + Math.round(notaMediaEsperada/100*40);
  const r = calcularRankingSemanal();
  resultado = JSON.stringify({
    r,
    esperado: {diasConcluidos: diasConcluidosEsperado, notaMedia: notaMediaEsperada, pontos: pontosEsperados},
    ok: r.diasConcluidos===diasConcluidosEsperado && r.notaMedia===notaMediaEsperada && r.pontos===pontosEsperados
  });
} finally {
  Object.keys(progressCache).forEach(k => delete progressCache[k]);
  Object.assign(progressCache, backup);
}
resultado;
```

Expected: JSON com `"ok":true`. Se `diasConcluidosEsperado` sair `0` (nenhum dia da semana corrente tem lição no calendário — só acontece fora do trimestre atual), o teste ainda deve reportar `ok:true` com todos os campos zerados; se isso acontecer, repita o teste ajustando `i >= 2` para cobrir mais dias, ou aceite o resultado zerado como válido.

- [ ] **Step 4: Testar `calcularRankingTrimestre()` no navegador com fixture controlada**

```js
const backup = JSON.parse(JSON.stringify(progressCache));
let resultado;
try {
  Object.keys(progressCache).forEach(k => { progressCache[k] = {days:{}, quiz:{}}; });

  const { start, end } = getQuarterRange();
  const today = new Date(); today.setHours(0,0,0,0);
  const limite = today < end ? today : end;
  const diasElapsadosEsperado = Math.max(1, Math.floor((limite - start) / 86400000) + 1);

  // marca os 3 primeiros dias do trimestre (lição 1, dom/seg/ter) como estudados
  const alvo = [
    {lessonId:1, dayId:'dom', nota:70},
    {lessonId:1, dayId:'seg', nota:90},
    {lessonId:1, dayId:'ter', nota:100}
  ];
  alvo.forEach(a => {
    const p = progressCache[a.lessonId] || {days:{}, quiz:{}};
    p.days[a.dayId] = {studied:true, estMinutes:5};
    p.quiz[a.dayId] = {correct:a.nota/10, total:10, time:1000};
    progressCache[a.lessonId] = p;
  });
  const notaMediaEsperada = Math.round(alvo.reduce((s,a)=>s+a.nota,0)/alvo.length);
  const pontosEsperados = Math.round(alvo.length/diasElapsadosEsperado*60) + Math.round(notaMediaEsperada/100*40);

  const r = calcularRankingTrimestre();
  resultado = JSON.stringify({
    r,
    esperado: {diasConcluidos: alvo.length, diasElapsados: diasElapsadosEsperado, notaMedia: notaMediaEsperada, pontos: pontosEsperados},
    ok: r.diasConcluidos===alvo.length && r.diasElapsados===diasElapsadosEsperado && r.notaMedia===notaMediaEsperada && r.pontos===pontosEsperados
  });
} finally {
  Object.keys(progressCache).forEach(k => delete progressCache[k]);
  Object.assign(progressCache, backup);
}
resultado;
```

Expected: JSON com `"ok":true`.

- [ ] **Step 5: Parar servidor local**

Run: `lsof -i :8000 -t | xargs -r kill 2>/dev/null`

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: calculo de pontuacao do ranking semanal e do trimestre"
```

---

## Task 3: Gravação e saída do ranking no Firebase

**Files:**
- Modify: `index.html:5230-5232` (inserir entre o fim de `lerDoFirebase` e o comentário `// ===== SINCRONIZACAO DOS AJUSTES`)

**Interfaces:**
- Consumes: `calcularRankingSemanal()`, `calcularRankingTrimestre()` (Task 2); `currentUser`, `getAuthToken()`, `getUserId()`, `FIREBASE_DB`, `primeiroNome()`, `window.storage` (já existentes).
- Produces:
  - `rankingOptInAtivo()` → `Promise<boolean>`
  - `atualizarRankingSemanal()` → `Promise<void>`
  - `atualizarRankingTrimestre()` → `Promise<void>`
  - `sairDoRanking()` → `Promise<void>`
  - Usadas pela Task 4 (opt-in UI), Task 5 (gatilhos) e Task 6 (exibição, só `rankingOptInAtivo`).

- [ ] **Step 1: Inserir as quatro funções**

Localize o trecho (fim de `lerDoFirebase`, início do comentário de sincronização):

```js
async function lerDoFirebase(usuarioId) {
  try {
    const token = await getAuthToken();
    const url = `${FIREBASE_DB}/usuarios/${usuarioId}.json` + (token ? `?auth=${token}` : '');
    const response = await fetch(url);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const dados = await response.json();
    return dados;
  } catch(e) {
    console.error('❌ Erro ao ler do Firebase:', e);
    return null;
  }
}

// ===== SINCRONIZACAO DOS AJUSTES (nome, metas, favoritos, marcacoes, planos) =====
```

Insira entre o `}` que fecha `lerDoFirebase` e o comentário:

```js
async function lerDoFirebase(usuarioId) {
  try {
    const token = await getAuthToken();
    const url = `${FIREBASE_DB}/usuarios/${usuarioId}.json` + (token ? `?auth=${token}` : '');
    const response = await fetch(url);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const dados = await response.json();
    return dados;
  } catch(e) {
    console.error('❌ Erro ao ler do Firebase:', e);
    return null;
  }
}

// ===== RANKING: opt-in, gravacao e saida =====
async function rankingOptInAtivo(){
  try {
    const res = await window.storage.get('ranking-opt-in', false);
    return res && JSON.parse(res.value) === true;
  } catch(e) { return false; }
}

async function atualizarRankingSemanal(){
  if(!currentUser) return;
  try{
    if(!(await rankingOptInAtivo())) return;
    const { semanaId, diasConcluidos, notaMedia, pontos } = calcularRankingSemanal();
    const token = await getAuthToken();
    const url = `${FIREBASE_DB}/ranking/${semanaId}/${getUserId()}.json` + (token ? `?auth=${token}` : '');
    await fetch(url, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ nome: primeiroNome(), diasConcluidos, notaMedia, pontos, atualizado_em: new Date().toISOString() })
    });
  } catch(e){ console.warn('⚠️ Não atualizou o ranking semanal:', e.message); }
}

async function atualizarRankingTrimestre(){
  if(!currentUser) return;
  try{
    if(!(await rankingOptInAtivo())) return;
    const { trimestreId, diasConcluidos, diasElapsados, notaMedia, pontos } = calcularRankingTrimestre();
    const token = await getAuthToken();
    const url = `${FIREBASE_DB}/ranking_trimestre/${trimestreId}/${getUserId()}.json` + (token ? `?auth=${token}` : '');
    await fetch(url, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ nome: primeiroNome(), diasConcluidos, diasElapsados, notaMedia, pontos, atualizado_em: new Date().toISOString() })
    });
  } catch(e){ console.warn('⚠️ Não atualizou o ranking do trimestre:', e.message); }
}

async function sairDoRanking(){
  const uid = getUserId();
  const token = await getAuthToken();
  try {
    const semanasUrl = `${FIREBASE_DB}/ranking.json?shallow=true` + (token ? `&auth=${token}` : '');
    const semanasRes = await fetch(semanasUrl);
    if(semanasRes.ok){
      const semanas = (await semanasRes.json()) || {};
      for(const semanaId of Object.keys(semanas)){
        const delUrl = `${FIREBASE_DB}/ranking/${semanaId}/${uid}.json` + (token ? `?auth=${token}` : '');
        await fetch(delUrl, {method:'DELETE'});
      }
    }
    const { trimestreId } = calcularRankingTrimestre();
    const trimUrl = `${FIREBASE_DB}/ranking_trimestre/${trimestreId}/${uid}.json` + (token ? `?auth=${token}` : '');
    await fetch(trimUrl, {method:'DELETE'});
  } catch(e){ console.warn('⚠️ Não conseguiu limpar o ranking ao sair:', e.message); }
}

// ===== SINCRONIZACAO DOS AJUSTES (nome, metas, favoritos, marcacoes, planos) =====
```

- [ ] **Step 2: Iniciar servidor local**

Run: `cd /Users/josiasgomeslima/Documents/licao-joven && (lsof -i :8000 -t | xargs -r kill) 2>/dev/null; python3 -m http.server 8000 >/tmp/server.log 2>&1 &`

- [ ] **Step 3: Testar gravação com `fetch` interceptado (sem tocar o Firebase real)**

No navegador (`javascript_tool`), depois de abrir `http://localhost:8000/index.html`:

```js
const chamadas = [];
const fetchOriginal = window.fetch.bind(window);
window.fetch = async (url, opts) => { chamadas.push({url, opts}); return new Response('{}', {status:200}); };
const userBackup = currentUser;
currentUser = { uid:'uid-teste', getIdToken: async()=>'token-teste' };
await window.storage.set('ranking-opt-in', JSON.stringify(true), false);

await atualizarRankingSemanal();
await atualizarRankingTrimestre();

const { semanaId } = calcularRankingSemanal();
const { trimestreId } = calcularRankingTrimestre();
const chamadaSemana = chamadas.find(c => c.url.includes(`/ranking/${semanaId}/uid-teste.json`));
const chamadaTrimestre = chamadas.find(c => c.url.includes(`/ranking_trimestre/${trimestreId}/uid-teste.json`));

const resultado = JSON.stringify({
  gravouSemana: !!chamadaSemana && chamadaSemana.opts.method==='PUT',
  corpoSemanaTemPontos: !!(chamadaSemana && JSON.parse(chamadaSemana.opts.body).pontos !== undefined),
  gravouTrimestre: !!chamadaTrimestre && chamadaTrimestre.opts.method==='PUT',
  corpoTrimestreTemPontos: !!(chamadaTrimestre && JSON.parse(chamadaTrimestre.opts.body).pontos !== undefined)
});

window.fetch = fetchOriginal;
currentUser = userBackup;
await window.storage.set('ranking-opt-in', JSON.stringify(false), false);
resultado;
```

Expected: `{"gravouSemana":true,"corpoSemanaTemPontos":true,"gravouTrimestre":true,"corpoTrimestreTemPontos":true}`.

- [ ] **Step 4: Testar que sem opt-in nada é gravado**

```js
const chamadas = [];
const fetchOriginal = window.fetch.bind(window);
window.fetch = async (url, opts) => { chamadas.push({url, opts}); return new Response('{}', {status:200}); };
const userBackup = currentUser;
currentUser = { uid:'uid-teste', getIdToken: async()=>'token-teste' };
await window.storage.set('ranking-opt-in', JSON.stringify(false), false);

await atualizarRankingSemanal();
await atualizarRankingTrimestre();

const resultado = JSON.stringify({ nenhumaChamada: chamadas.length === 0 });
window.fetch = fetchOriginal;
currentUser = userBackup;
resultado;
```

Expected: `{"nenhumaChamada":true}`.

- [ ] **Step 5: Testar `sairDoRanking()` — GET shallow + DELETE por semana + DELETE do trimestre**

```js
const chamadas = [];
const fetchOriginal = window.fetch.bind(window);
window.fetch = async (url, opts) => {
  chamadas.push({url, method: (opts && opts.method) || 'GET'});
  if(url.includes('shallow=true')) return new Response(JSON.stringify({'2026-09-13':true,'2026-09-06':true}), {status:200});
  return new Response('{}', {status:200});
};
const userBackup = currentUser;
currentUser = { uid:'uid-teste', getIdToken: async()=>'token-teste' };

await sairDoRanking();

const deletes = chamadas.filter(c => c.method === 'DELETE');
const resultado = JSON.stringify({
  fezShallowGet: chamadas.some(c => c.url.includes('shallow=true')),
  apagouDuasSemanas: deletes.filter(c => c.url.includes('/ranking/')).length === 2,
  apagouTrimestre: deletes.some(c => c.url.includes('/ranking_trimestre/'))
});
window.fetch = fetchOriginal;
currentUser = userBackup;
resultado;
```

Expected: `{"fezShallowGet":true,"apagouDuasSemanas":true,"apagouTrimestre":true}`.

- [ ] **Step 6: Parar servidor local**

Run: `lsof -i :8000 -t | xargs -r kill 2>/dev/null`

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: gravacao e saida do ranking semanal/trimestre no Firebase"
```

---

## Task 4: Opt-in na aba Conta

**Files:**
- Modify: `index.html:2797-2799` (novo `conta-card` em `renderConta()`, antes do card "Sobre")
- Modify: `index.html` próximo a `saveContaName` (novas funções `atualizarRankingCheckboxConta`, `onRankingOptInChange`)

**Interfaces:**
- Consumes: `rankingOptInAtivo()`, `sairDoRanking()` (Task 3); `currentUser`, `window.storage` (existentes).
- Produces:
  - `atualizarRankingCheckboxConta()` → `Promise<void>` (seta o estado inicial do checkbox)
  - `onRankingOptInChange(ligado: boolean)` → `Promise<void>`
  - Card com `id="ranking-opt-in-check"` — consumida só visualmente pela Task 6 (nenhuma dependência de código).

- [ ] **Step 1: Adicionar o card na aba Conta**

Localize em `renderConta()`:

```js
    </div>

    <div class="conta-card">
      <div class="conta-section-title">Sobre</div>
      <p class="conta-note">ComTexto Bíblico — Resgate<br>3º Trimestre 2026</p>
    </div>

  </div>`;
  container.innerHTML = html;
  // Os botoes de login so existem depois deste innerHTML.
  // Sem esta chamada, quem ja esta logado veria "Entrar com Google" de novo.
  updateAuthUI();
}
```

Substitua por (novo card antes de "Sobre", e chamada nova depois de `updateAuthUI()`):

```js
    </div>

    <div class="conta-card">
      <div class="conta-section-title">Ranking</div>
      ${currentUser ? `
      <div class="conta-row">
        <div><div class="conta-row-title">Participar do ranking</div><div class="conta-row-sub">Mostra seu nome e desempenho pros outros participantes, nas abas Esta semana e Trimestre em Progresso</div></div>
        <input type="checkbox" id="ranking-opt-in-check" onchange="onRankingOptInChange(this.checked)" style="width:22px;height:22px;flex-shrink:0;">
      </div>
      ` : `<p class="conta-note">Entre com sua conta Google para participar do ranking.</p>`}
    </div>

    <div class="conta-card">
      <div class="conta-section-title">Sobre</div>
      <p class="conta-note">ComTexto Bíblico — Resgate<br>3º Trimestre 2026</p>
    </div>

  </div>`;
  container.innerHTML = html;
  // Os botoes de login so existem depois deste innerHTML.
  // Sem esta chamada, quem ja esta logado veria "Entrar com Google" de novo.
  updateAuthUI();
  await atualizarRankingCheckboxConta();
}
```

- [ ] **Step 2: Adicionar as funções de controle do checkbox**

Localize:

```js
async function saveContaName(name){
  await loadUserGoals();
  userGoals.name = name.trim();
  try{ await window.storage.set('user-goals', JSON.stringify(userGoals), false); }catch(e){}
}
```

Insira logo depois:

```js
async function saveContaName(name){
  await loadUserGoals();
  userGoals.name = name.trim();
  try{ await window.storage.set('user-goals', JSON.stringify(userGoals), false); }catch(e){}
}

async function atualizarRankingCheckboxConta(){
  const check = document.getElementById('ranking-opt-in-check');
  if(!check) return;
  check.checked = await rankingOptInAtivo();
}

async function onRankingOptInChange(ligado){
  await window.storage.set('ranking-opt-in', JSON.stringify(ligado), false);
  if(!ligado) await sairDoRanking();
}
```

- [ ] **Step 3: Iniciar servidor local**

Run: `cd /Users/josiasgomeslima/Documents/licao-joven && (lsof -i :8000 -t | xargs -r kill) 2>/dev/null; python3 -m http.server 8000 >/tmp/server.log 2>&1 &`

- [ ] **Step 4: Testar o checkbox — logado, ligar e desligar**

```js
const userBackup = currentUser;
currentUser = { uid:'uid-teste', getIdToken: async()=>'token-teste', displayName:'Teste', email:'teste@example.com' };
await window.storage.set('ranking-opt-in', JSON.stringify(false), false);
await goConta();
await new Promise(r=>setTimeout(r,100));

const antes = document.getElementById('ranking-opt-in-check').checked;

let chamouSair = false;
const sairOriginal = sairDoRanking;
window.sairDoRanking = async () => { chamouSair = true; };

document.getElementById('ranking-opt-in-check').checked = true;
document.getElementById('ranking-opt-in-check').dispatchEvent(new Event('change'));
await new Promise(r=>setTimeout(r,50));
const flagLigado = JSON.parse((await window.storage.get('ranking-opt-in', false)).value);

document.getElementById('ranking-opt-in-check').checked = false;
document.getElementById('ranking-opt-in-check').dispatchEvent(new Event('change'));
await new Promise(r=>setTimeout(r,50));
const flagDesligado = JSON.parse((await window.storage.get('ranking-opt-in', false)).value);

window.sairDoRanking = sairOriginal;
currentUser = userBackup;

JSON.stringify({ antes, flagLigado, flagDesligado, chamouSairAoDesligar: chamouSair });
```

Expected: `{"antes":false,"flagLigado":true,"flagDesligado":false,"chamouSairAoDesligar":true}`.

- [ ] **Step 5: Testar estado deslogado**

```js
const userBackup = currentUser;
currentUser = null;
await goConta();
await new Promise(r=>setTimeout(r,100));
const temCheckbox = !!document.getElementById('ranking-opt-in-check');
const temAvisoLogin = document.getElementById('conta-container').textContent.includes('Entre com sua conta Google para participar do ranking');
currentUser = userBackup;
JSON.stringify({ temCheckbox, temAvisoLogin });
```

Expected: `{"temCheckbox":false,"temAvisoLogin":true}`.

- [ ] **Step 6: Parar servidor local**

Run: `lsof -i :8000 -t | xargs -r kill 2>/dev/null`

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: opt-in do ranking na aba Conta"
```

---

## Task 5: Disparar a atualização do ranking ao concluir dia/quiz

**Files:**
- Modify: `index.html:2438-2461` (`marcarConcluido`)
- Modify: `index.html` (bloco de conclusão da 10ª pergunta do quiz, dentro de `bindDayInteractions`)

**Interfaces:**
- Consumes: `atualizarRankingSemanal()`, `atualizarRankingTrimestre()` (Task 3, ambas já se autoprotegem contra usuário deslogado/sem opt-in).
- Produces: nenhuma nova função — só liga os dois pontos de gravação de progresso já existentes às funções da Task 3.

- [ ] **Step 1: Adicionar as chamadas em `marcarConcluido`**

Localize:

```js
  // 🔥 Auto-save no Firebase (so quando ha usuario logado)
  // Sem login o progresso ja ficou salvo em saveProgress() acima, no proprio navegador.
  if (currentUser) {
    await salvarNoFirebase(getUserId(), await montarPacoteSync());
    console.log('✅ Progresso sincronizado com Firebase!');
  }
}

function refazerQuiz(lessonId, dayId){
```

Substitua por:

```js
  // 🔥 Auto-save no Firebase (so quando ha usuario logado)
  // Sem login o progresso ja ficou salvo em saveProgress() acima, no proprio navegador.
  if (currentUser) {
    await salvarNoFirebase(getUserId(), await montarPacoteSync());
    console.log('✅ Progresso sincronizado com Firebase!');
    await atualizarRankingSemanal();
    await atualizarRankingTrimestre();
  }
}

function refazerQuiz(lessonId, dayId){
```

- [ ] **Step 2: Adicionar as chamadas na conclusão do quiz**

Localize (dentro de `bindDayInteractions`, no `if(localState.answered === 10)`):

```js
            atualizarMarcacoesDoDia(lessonId, day.id);
            atualizarDashboardProgresso(lessonId);
            const btnConcluir = document.querySelector(`.btn-concluir[data-lesson="${lessonId}"][data-day="${day.id}"]`);
            if(btnConcluir && !btnConcluir.classList.contains('done')){
              btnConcluir.classList.add('done');
              btnConcluir.textContent = '✓ Dia concluído';
            }
          }
        });
```

Substitua por:

```js
            atualizarMarcacoesDoDia(lessonId, day.id);
            atualizarDashboardProgresso(lessonId);
            const btnConcluir = document.querySelector(`.btn-concluir[data-lesson="${lessonId}"][data-day="${day.id}"]`);
            if(btnConcluir && !btnConcluir.classList.contains('done')){
              btnConcluir.classList.add('done');
              btnConcluir.textContent = '✓ Dia concluído';
            }
            await atualizarRankingSemanal();
            await atualizarRankingTrimestre();
          }
        });
```

- [ ] **Step 3: Iniciar servidor local**

Run: `cd /Users/josiasgomeslima/Documents/licao-joven && (lsof -i :8000 -t | xargs -r kill) 2>/dev/null; python3 -m http.server 8000 >/tmp/server.log 2>&1 &`

- [ ] **Step 4: Testar que `marcarConcluido` dispara as duas funções (só quando logado)**

```js
let chamadasSemanal = 0, chamadasTrimestre = 0;
const semanalOriginal = atualizarRankingSemanal, trimestreOriginal = atualizarRankingTrimestre;
window.atualizarRankingSemanal = async () => { chamadasSemanal++; };
window.atualizarRankingTrimestre = async () => { chamadasTrimestre++; };

const userBackup = currentUser;
currentUser = { uid:'uid-teste', getIdToken: async()=>'token-teste' };
const fetchOriginal = window.fetch.bind(window);
window.fetch = async () => new Response('{}', {status:200}); // evita gravar de verdade no usuarios/

const btn = document.querySelector('.btn-concluir:not(.done)');
const tinhaBotao = !!btn;
if(btn) await marcarConcluido(btn);

window.fetch = fetchOriginal;
window.atualizarRankingSemanal = semanalOriginal;
window.atualizarRankingTrimestre = trimestreOriginal;
currentUser = userBackup;

JSON.stringify({ tinhaBotao, chamadasSemanal, chamadasTrimestre });
```

Expected: `{"tinhaBotao":true,"chamadasSemanal":1,"chamadasTrimestre":1}`. Se `tinhaBotao` for `false`, abra manualmente uma lição com pelo menos um dia não concluído antes de rodar o script (ex.: navegue pra lição atual e expanda um dia).

- [ ] **Step 5: Testar que a conclusão do quiz dispara as duas funções**

Reaproveita a técnica de clicar nas 10 respostas certas já usada na verificação do fix do "refresh do quiz":

```js
let chamadasSemanal = 0, chamadasTrimestre = 0;
const semanalOriginal = atualizarRankingSemanal, trimestreOriginal = atualizarRankingTrimestre;
window.atualizarRankingSemanal = async () => { chamadasSemanal++; };
window.atualizarRankingTrimestre = async () => { chamadasTrimestre++; };

const quizEl = document.querySelector('.day.selected .quiz, .quiz');
const answers = quizEl.dataset.answers.split(',');
const blocks = quizEl.querySelectorAll('.q-block');
for(let i=0;i<blocks.length;i++){
  const btn = blocks[i].querySelector(`.opt[data-v="${answers[i]}"]`);
  if(btn && !btn.disabled) btn.click();
  await new Promise(r=>setTimeout(r,60));
}
await new Promise(r=>setTimeout(r,300));

window.atualizarRankingSemanal = semanalOriginal;
window.atualizarRankingTrimestre = trimestreOriginal;

JSON.stringify({ chamadasSemanal, chamadasTrimestre });
```

Expected: `{"chamadasSemanal":1,"chamadasTrimestre":1}`. Se o quiz já estiver respondido de um teste anterior, chame `refazerQuiz(lessonId, dayId)` primeiro (pegue os IDs de `quizEl.id`, formato `quiz-{lessonId}-{dayId}`) e reabra a lição antes de repetir o script.

- [ ] **Step 6: Parar servidor local**

Run: `lsof -i :8000 -t | xargs -r kill 2>/dev/null`

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: atualiza ranking ao concluir dia ou terminar o quiz"
```

---

## Task 6: Exibição do ranking na aba Progresso

**Files:**
- Modify: `index.html:1008-1009` (CSS, inserir regras novas depois de `.stats-card h3`)
- Modify: `index.html:3588-3591` (HTML, nova seção entre o resumo da semana e "Histórico")
- Modify: `index.html:3614-3615` (chamar o carregamento da aba padrão depois do `container.innerHTML`)
- Modify: `index.html` (novas funções `switchRankingTab`, `carregarRankingTab`)

**Interfaces:**
- Consumes: `calcularRankingSemanal()`, `calcularRankingTrimestre()`, `rankingOptInAtivo()` (Tasks 2-3); `currentUser`, `getAuthToken()`, `getUserId()`, `FIREBASE_DB`, `escaparHtml()` (existentes).
- Produces:
  - `switchRankingTab(btn: HTMLElement)` → `void`
  - `carregarRankingTab(tipo: 'semana'|'trimestre')` → `Promise<void>`

- [ ] **Step 1: Adicionar o CSS**

Localize:

```css
  .stats-card{background:var(--card); border-radius:22px; padding:20px 20px 22px; box-shadow:0 20px 44px -28px rgba(28,23,53,0.3);}
  .stats-card h3{font-family:'Unbounded', sans-serif; font-size:1rem; color:var(--heading); margin:0 0 14px; display:flex; align-items:center; gap:8px;}
```

Insira logo depois:

```css
  .stats-card{background:var(--card); border-radius:22px; padding:20px 20px 22px; box-shadow:0 20px 44px -28px rgba(28,23,53,0.3);}
  .stats-card h3{font-family:'Unbounded', sans-serif; font-size:1rem; color:var(--heading); margin:0 0 14px; display:flex; align-items:center; gap:8px;}
  .ranking-tabs{display:flex; gap:6px; background:var(--bg); padding:5px; border-radius:100px; margin-bottom:14px;}
  .ranking-tab{flex:1; padding:10px 8px; border-radius:100px; border:none; cursor:pointer; font-family:'JetBrains Mono', monospace; font-weight:700; font-size:12px; background:none; color:var(--ink-soft); transition:all .15s ease;}
  .ranking-tab.active{background:var(--violet); color:var(--on-violet, #fff);}
  .ranking-panel{display:none;}
  .ranking-panel.active{display:block;}
  .ranking-row{display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px;}
  .ranking-row.me{background:var(--tint-violet); font-weight:700;}
  .ranking-rank{font-family:'JetBrains Mono', monospace; font-weight:800; color:var(--ink-soft); width:28px; flex-shrink:0;}
  .ranking-name{flex:1; font-size:14px; color:var(--ink); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
  .ranking-score{font-family:'JetBrains Mono', monospace; font-weight:700; color:var(--violet); font-size:13px; flex-shrink:0;}
  .ranking-sep{text-align:center; color:var(--ink-soft); padding:2px 0; letter-spacing:0.2em;}
```

- [ ] **Step 2: Adicionar a seção de ranking em `renderStats()`**

Localize:

```js
      })()}</b> min essa semana</span>
    </div>

  <div class="stats-section-label">Histórico</div>
```

Substitua por:

```js
      })()}</b> min essa semana</span>
    </div>

  <div class="stats-section-label">Ranking</div>
  <div class="stats-card" id="ranking-section">
    <div class="ranking-tabs">
      <button class="ranking-tab active" data-tab="semana" onclick="switchRankingTab(this)">Esta semana</button>
      <button class="ranking-tab" data-tab="trimestre" onclick="switchRankingTab(this)">Trimestre</button>
    </div>
    <div class="ranking-panel active" data-panel="semana"><p class="conta-note">Carregando…</p></div>
    <div class="ranking-panel" data-panel="trimestre"></div>
  </div>

  <div class="stats-section-label">Histórico</div>
```

- [ ] **Step 3: Carregar a aba padrão depois de montar o HTML**

Localize:

```js
  <footer>Toque em um dia do calendário pra registrar ou editar o que você fez.</footer>`;
  container.innerHTML = html;
}
```

Substitua por:

```js
  <footer>Toque em um dia do calendário pra registrar ou editar o que você fez.</footer>`;
  container.innerHTML = html;
  carregarRankingTab('semana');
}
```

- [ ] **Step 4: Adicionar `switchRankingTab` e `carregarRankingTab`**

Adicione estas duas funções logo depois da função `renderStats` (após o `}` que a fecha, antes do comentário `// ============ DAY EDITOR MODAL ============`):

```js
function switchRankingTab(btn){
  const wrap = document.getElementById('ranking-section');
  if(!wrap) return;
  wrap.querySelectorAll('.ranking-tab').forEach(b => b.classList.toggle('active', b === btn));
  wrap.querySelectorAll('.ranking-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === btn.dataset.tab));
  const panel = wrap.querySelector(`.ranking-panel[data-panel="${btn.dataset.tab}"]`);
  if(panel && !panel.dataset.loaded) carregarRankingTab(btn.dataset.tab);
}

async function carregarRankingTab(tipo){
  const panel = document.querySelector(`#ranking-section .ranking-panel[data-panel="${tipo}"]`);
  if(!panel) return;

  if(!currentUser){
    panel.innerHTML = `<p class="conta-note">Entre com sua conta Google na aba Conta pra ver e participar do ranking.</p>`;
    panel.dataset.loaded = '1';
    return;
  }
  if(!(await rankingOptInAtivo())){
    panel.innerHTML = `<p class="conta-note">Ative "Participar do ranking" na aba Conta pra ver e aparecer aqui.</p>`;
    panel.dataset.loaded = '1';
    return;
  }

  panel.innerHTML = `<p class="conta-note">Carregando…</p>`;
  try{
    const token = await getAuthToken();
    const meuId = getUserId();
    let entradas;
    if(tipo === 'semana'){
      const { semanaId } = calcularRankingSemanal();
      const url = `${FIREBASE_DB}/ranking/${semanaId}.json` + (token ? `?auth=${token}` : '');
      const r = await fetch(url);
      entradas = r.ok ? ((await r.json()) || {}) : {};
    } else {
      const { trimestreId } = calcularRankingTrimestre();
      const url = `${FIREBASE_DB}/ranking_trimestre/${trimestreId}.json` + (token ? `?auth=${token}` : '');
      const r = await fetch(url);
      entradas = r.ok ? ((await r.json()) || {}) : {};
    }

    const lista = Object.keys(entradas).map(uid => Object.assign({uid}, entradas[uid]));
    lista.sort((a,b) => (b.pontos - a.pontos) || (b.notaMedia - a.notaMedia) || String(a.nome||'').localeCompare(String(b.nome||''), 'pt-BR'));

    if(!lista.length){
      panel.innerHTML = `<p class="conta-note">Ninguém no ranking ${tipo==='semana'?'essa semana':'esse trimestre'} ainda. Seja o primeiro!</p>`;
      panel.dataset.loaded = '1';
      return;
    }

    const top = lista.slice(0, 50);
    const meuIndex = lista.findIndex(item => item.uid === meuId);
    let html = top.map((item, i) => `
      <div class="ranking-row${item.uid===meuId?' me':''}">
        <span class="ranking-rank">${i+1}º</span>
        <span class="ranking-name">${escaparHtml(item.nome || 'Alguém')}</span>
        <span class="ranking-score">${item.pontos} pts</span>
      </div>`).join('');

    if(meuIndex >= 50){
      const item = lista[meuIndex];
      html += `<div class="ranking-sep">···</div>
      <div class="ranking-row me">
        <span class="ranking-rank">${meuIndex+1}º</span>
        <span class="ranking-name">${escaparHtml(item.nome || 'Alguém')}</span>
        <span class="ranking-score">${item.pontos} pts</span>
      </div>`;
    }

    panel.innerHTML = html;
    panel.dataset.loaded = '1';
  } catch(e){
    console.warn('⚠️ Não carregou o ranking:', e.message);
    panel.innerHTML = `<p class="conta-note">Não foi possível carregar o ranking agora.</p>`;
  }
}
```

- [ ] **Step 5: Iniciar servidor local**

Run: `cd /Users/josiasgomeslima/Documents/licao-joven && (lsof -i :8000 -t | xargs -r kill) 2>/dev/null; python3 -m http.server 8000 >/tmp/server.log 2>&1 &`

- [ ] **Step 6: Testar estado deslogado e estado sem opt-in**

```js
const userBackup = currentUser;
currentUser = null;
await goStats();
await new Promise(r=>setTimeout(r,100));
const semDeslogado = document.querySelector('#ranking-section .ranking-panel.active').textContent;

currentUser = { uid:'uid-teste', getIdToken: async()=>'token-teste' };
await window.storage.set('ranking-opt-in', JSON.stringify(false), false);
await goStats();
await new Promise(r=>setTimeout(r,100));
const semOptIn = document.querySelector('#ranking-section .ranking-panel.active').textContent;

currentUser = userBackup;
JSON.stringify({
  deslogadoPedeLogin: semDeslogado.includes('Entre com sua conta Google'),
  semOptInPedeAtivar: semOptIn.includes('Ative "Participar do ranking"')
});
```

Expected: `{"deslogadoPedeLogin":true,"semOptInPedeAtivar":true}`.

- [ ] **Step 7: Testar lista renderizada, ordenação e destaque de "eu"**

```js
const fetchOriginal = window.fetch.bind(window);
window.fetch = async (url) => {
  if(url.includes('/ranking/')){
    return new Response(JSON.stringify({
      'uid-teste': {nome:'Você', diasConcluidos:5, notaMedia:80, pontos:74},
      'uid-outro': {nome:'Outra Pessoa', diasConcluidos:7, notaMedia:90, pontos:96}
    }), {status:200});
  }
  return new Response('{}', {status:200});
};

const userBackup = currentUser;
currentUser = { uid:'uid-teste', getIdToken: async()=>'token-teste' };
await window.storage.set('ranking-opt-in', JSON.stringify(true), false);

await goStats();
await new Promise(r=>setTimeout(r,100));

const panel = document.querySelector('#ranking-section .ranking-panel[data-panel="semana"]');
const linhas = [...panel.querySelectorAll('.ranking-row')].map(r => ({
  nome: r.querySelector('.ranking-name').textContent,
  pontos: r.querySelector('.ranking-score').textContent,
  souEu: r.classList.contains('me')
}));

window.fetch = fetchOriginal;
currentUser = userBackup;
JSON.stringify(linhas);
```

Expected: array com 2 linhas, "Outra Pessoa" (96 pts) em 1º lugar, "Você" (74 pts) em 2º com `souEu:true`.

- [ ] **Step 8: Testar troca de aba (Esta semana → Trimestre)**

```js
const fetchOriginal = window.fetch.bind(window);
window.fetch = async (url) => {
  if(url.includes('/ranking_trimestre/')) return new Response(JSON.stringify({'uid-teste':{nome:'Você', diasConcluidos:10, diasElapsados:20, notaMedia:85, pontos:64}}), {status:200});
  return new Response('{}', {status:200});
};
const userBackup = currentUser;
currentUser = { uid:'uid-teste', getIdToken: async()=>'token-teste' };
await window.storage.set('ranking-opt-in', JSON.stringify(true), false);

await goStats();
await new Promise(r=>setTimeout(r,100));

document.querySelector('.ranking-tab[data-tab="trimestre"]').click();
await new Promise(r=>setTimeout(r,100));

const painelAtivo = document.querySelector('#ranking-section .ranking-panel.active').dataset.panel;
const temLinha = !!document.querySelector('#ranking-section .ranking-panel[data-panel="trimestre"] .ranking-row');

window.fetch = fetchOriginal;
currentUser = userBackup;
JSON.stringify({ painelAtivo, temLinha });
```

Expected: `{"painelAtivo":"trimestre","temLinha":true}`.

- [ ] **Step 9: Checar console por erros**

Use `mcp__claude-in-chrome__read_console_messages` com `pattern: "error|Error"` — Expected: nenhuma mensagem.

- [ ] **Step 10: Parar servidor local**

Run: `lsof -i :8000 -t | xargs -r kill 2>/dev/null`

- [ ] **Step 11: Commit**

```bash
git add index.html
git commit -m "feat: exibe o ranking semanal e do trimestre na aba Progresso"
```

---

## Pós-implementação (não faz parte deste plano)

- Aplicar as regras pendentes no console do Firebase (Task 1 só documenta; a aplicação em si é uma ação manual do usuário, junto com o resto do `FIREBASE-SETUP.md`).
- Testar o fluxo completo com um usuário real logado (Google OAuth não é automatizável nos testes acima).
- Abrir PR seguindo o mesmo fluxo usado no resto da sessão (branch → PR → merge).
