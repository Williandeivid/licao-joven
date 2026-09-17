# Tradução completa da interface (UI) em inglês/espanhol — Design

## Contexto

A branch `feat/idiomas-en-es` já traduz o **conteúdo** da lição (Oficial,
Resumo, Bíblia, quiz, Verdadeiro ou Falso) para inglês e espanhol. A
decisão original de escopo (spec `2026-09-17-idiomas-en-es-design.md`)
foi deixar a **interface** (botões, menus, navegação, nomes de dia da
semana, nomes de livro bíblico) sempre em português.

O usuário pediu para reverter essa decisão: agora a interface inteira
deve acompanhar o idioma escolhido no seletor 🇧🇷/🇺🇸/🇲🇽 (o mesmo já
existente no menu de fonte/tema).

## Objetivo

Nenhum texto fixo da interface deve aparecer em português quando o
idioma escolhido for inglês ou espanhol — com a única exceção de
conteúdo que a própria pessoa escreveu (comentários, respostas dadas
em editores), que nunca é traduzido automaticamente.

## Escala do problema

Uma varredura no arquivo (nós de texto capitalizados dentro de tags)
encontrou ~455 ocorrências (com duplicatas) de texto fixo espalhado por
todo o arquivo de ~7500 linhas de JS/HTML. As áreas principais:

- Barra de navegação inferior (Início/Bíblia/Lições/Progresso/Conta) —
  **HTML estático**, não gerado por JavaScript.
- Menu do app (⋮ no topo): idioma, fonte, tema — parte já traduzida
  (Task 1 da feature original), parte ainda não (seção de tema, fonte).
- Tela inicial / lista de lições ("Lições do Trimestre", rótulos de
  status "Atual"/"Concluída"/"Em breve", etc.)
- Tela de lição: botões "Concluir este dia", "Ver perguntas e quiz",
  cabeçalhos "Perguntas Reflexivas", "Verdadeiro ou Falso", "Ver
  gabarito", rótulos de dificuldade do quiz.
- Aba Bíblia: lista de livros, cabeçalho de capítulo, botões de
  navegação, modal de escolha de versão.
- Aba Estatísticas: títulos de gráfico, rótulos de card.
- Aba Conta: login/logout, metas, ranking, campos do editor de dia.
- Comentários: botão, placeholder do campo, mensagens de erro
  (`alert`), confirmação de apagar (`confirm`).
- Nomes de dia da semana ("Domingo", "Segunda"...) — hoje vêm prontos
  no campo `date` de cada dia em `LESSONS_CONTENT`, sempre em
  português.
- Nomes de livro bíblico (`BIBLE_BOOKS[].name`) — usados em ~15+
  lugares (lista de livros, cabeçalho de capítulo, título de popup de
  versículo, link externo "Abrir X num site de Bíblia").
- Rótulos especiais de dia ("Momento Hipertexto", "Comunidade") — só 2
  valores distintos em toda a grade curricular, aparecem no campo
  `date` depois da data.

## Fora de escopo (não traduzir)

- Texto que o usuário escreveu: comentários (`enviarComentario`),
  respostas no editor de dia, nome de exibição da conta.
- Mensagens só de developer (`console.warn`/`console.log`) — nunca
  aparecem pra pessoa usando o app.
- Conteúdo já coberto pela feature original (corpo/resumo/quiz/tf da
  lição, texto bíblico) — esse já traduz.

## Arquitetura

### 1. Dicionário central + função `t()`

```js
const UI_STRINGS = {
  pt: { 'nav.inicio': 'Início', 'nav.biblia': 'Bíblia', /* ... */ },
  en: { 'nav.inicio': 'Home',   'nav.biblia': 'Bible',  /* ... */ },
  es: { 'nav.inicio': 'Inicio', 'nav.biblia': 'Biblia', /* ... */ }
};
function t(chave){
  const dict = UI_STRINGS[idiomaConteudoAtual] || UI_STRINGS.pt;
  return dict[chave] || UI_STRINGS.pt[chave] || chave;
}
```

Chaves em `dot.case`, agrupadas por área (`nav.*`, `menu.*`,
`lesson.*`, `bible.*`, `stats.*`, `conta.*`, `comments.*`,
`alerts.*`). Cada task do plano de implementação adiciona as chaves da
sua área nos três idiomas — nunca deixa uma chave só em português (se
faltar tradução em uma tarefa, cai no fallback pt automaticamente via
`|| UI_STRINGS.pt[chave]`, então o app nunca quebra, só mostra
português onde uma chave específica ainda não foi preenchida).

### 2. Texto gerado por JavaScript

Todo template string que hoje escreve texto fixo (ex.:
`` `<h1>Lições do Trimestre</h1>` ``) passa a chamar `t()` (ex.:
`` `<h1>${t('list.titulo')}</h1>` ``).

### 3. Texto estático no HTML (barra de navegação)

Elementos com texto fixo escrito direto no HTML (não gerado por JS)
recebem um atributo `data-i18n`:

```html
<button class="navtab" id="tab-home" onclick="goHome()">
  <svg>...</svg>
  <span data-i18n="nav.inicio">Início</span>
</button>
```

(o texto vira um `<span>` próprio pra não conflitar com o ícone SVG
dentro do mesmo botão). Uma função nova, `aplicarTraducaoEstatica()`,
percorre `document.querySelectorAll('[data-i18n]')` e substitui o
`textContent` de cada um pelo resultado de `t(elemento.dataset.i18n)`.
Chamada uma vez no boot do app e de novo toda vez que o idioma muda.

### 4. Nomes de dia da semana

Em vez de guardar string traduzida (duplicaria dado, ficaria
dessincronizado da data real), o nome do dia passa a ser calculado
dinamicamente a partir do `Date` já existente
(`dayCalendarDate(lessonId, dayId)`), usando
`date.toLocaleDateString(locale, {weekday:'long', day:'numeric',
month:'long'})` com o `locale` certo por idioma (`pt-BR`/`en-US`/
`es-ES`). Os pontos que hoje leem `day.date` diretamente (dia da
semana + data) passam a montar essa string na hora, no idioma atual,
em vez de ler o campo fixo do conteúdo.

Os rótulos especiais ("Momento Hipertexto", "Comunidade") continuam
vindo do conteúdo (são só 2 valores em toda a grade), mas passam por
`t()` também — viram chaves normais do dicionário
(`day.special.hipertexto`, `day.special.comunidade`), com o texto do
conteúdo usado só pra decidir QUAL chave mostrar (comparação exata
contra os 2 valores conhecidos em português, já que o campo em si
continua vindo do JSON em pt).

### 5. Nomes de livro bíblico

`BIBLE_BOOKS` (array com `{id, name, ch, t}`, uma entrada por livro)
ganha `name_en` e `name_es` por entrada, derivados por inversão dos
dicionários que já existem (`BOOK_NAME_TO_ID_EN`/`BOOK_NAME_TO_ID_ES`)
— pegando a entrada de nome completo (não abreviação) que aponta pra
cada id. Uma função helper, `bookDisplayName(bookId, idioma)`,
centraliza a escolha do campo certo; todo lugar que hoje lê
`book.name`/`bookMeta.name` pra EXIBIR (não pra montar URL/query)
passa a chamar essa função.

### 6. Troca de idioma precisa redesenhar mais telas

Hoje `recarregarConteudoNoIdiomaAtual()` só redesenha a lição aberta ou
o capítulo de Bíblia aberto. Passa a também:
- Chamar `aplicarTraducaoEstatica()` (barra de navegação, HTML
  estático).
- Redesenhar o menu do app, se estiver aberto.
- Redesenhar a aba atualmente ativa entre Progresso/Estatísticas/
  Conta/Lista, se alguma estiver visível (cada uma já tem sua função
  de render — só chamar de novo).

## Testando

Mesma disciplina já usada nesta branch: chamadas diretas de função
(nunca clique real simulado quando precisar interceptar fetch),
nunca chamar `setIdiomaConteudo()` de verdade sem reverter pra `'pt'`
depois (grava na conta real via sync com a nuvem). Validação
específica desta feature:
- Nenhuma chave usada no código sem entrada nos 3 idiomas (checagem
  automática: extrair todo `t('...')`/`data-i18n="..."` do arquivo e
  conferir contra `Object.keys(UI_STRINGS.pt)`).
- Trocar idioma com cada tela/aba aberta e conferir visualmente que
  não sobra texto em português (exceto comentários de outros
  usuários, que são conteúdo, não interface).
- Nomes de dia da semana batem com a data real do calendário em todos
  os 3 idiomas (comparar contra `toLocaleDateString` de referência).

## Restrições globais (valem pra todas as tarefas do plano)

- Nunca traduzir texto gerado a partir de dado do usuário (nome de
  conta, comentários, respostas de editor).
- Toda chave nova de `UI_STRINGS` precisa existir nos 3 idiomas na
  mesma tarefa que a introduz — não faseado tela por tela deixando
  buracos (o fallback pt existe pra não quebrar o app numa transição,
  não como desculpa pra pular tradução).
- Nomes de livro bíblico e dia da semana seguem os helpers centrais
  (`bookDisplayName`, `toLocaleDateString`) — nunca strings soltas
  novas duplicando esse dado.
- Mensagens de `alert()`/`confirm()` visíveis pro usuário entram no
  escopo (são interface); `console.*` não entra (developer-only).
