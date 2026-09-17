# Lição e Bíblia em inglês e espanhol — design

## Contexto

O app (`index.html`, site estático, sem backend) hoje mostra a lição do
trimestre em três fontes:

- **Oficial** — markdown buscado ao vivo do repositório
  `Adventech/sabbath-school-lessons` no GitHub, só em português
  (`baseUrl`/`mdUrl` fixos em `src/pt/...`, função `buscarOficialDaRede()`).
- **Resumo** — paráfrase escrita à mão especificamente para este app,
  embutida em `LESSONS_CONTENT` (~1.2MB de JSON dentro do próprio
  `index.html`), só em português.
- **Bíblia** (leitura por capítulo e popup de referência ao clicar numa
  citação) — texto buscado do repositório `MaatheusGois/bible` no
  GitHub (`fetchBookGithub()`), hoje fixo em `versions/pt-br/...`
  (NVI/ARC).

Investigação confirmou que os dois repositórios GitHub já têm inglês e
espanhol prontos, com a mesma estrutura de arquivos/JSON que o português:

- Adventech: pastas `en` e `es` existem, com o **mesmo código de
  trimestre** (`2026-03-cq`) e a mesma estrutura de arquivos
  (`01.md`...`07.md`, `info.yml`) que `pt`.
- MaatheusGois/bible: `versions/en/kjv` e `versions/en/bbe`;
  `versions/es/rvr` — mesmo esquema de ID de livro (`gn`, `ex`...) e
  mesmo formato de JSON (`{id, chapters:[[...]]}`) que `pt-br`.

Ou seja: **Oficial e Bíblia trocam de idioma só parametrizando a URL —
não precisam de tradução nenhuma.** Só o **Resumo** precisa de conteúdo
traduzido, porque não existe fonte externa pra ele.

## Objetivo

Permitir trocar entre **português, inglês e espanhol** o conteúdo das
abas Oficial, Resumo e Bíblia, com um seletor no menu do app (mesmo
menu onde já existem "Tamanho da fonte" e "Design"). A interface do
app (botões, menus, rótulos fixos) **continua em português** — fora de
escopo aqui.

## Decisões

- **Onde fica salvo:** cliente calcula nada — é só uma preferência,
  chave nova `idioma-conteudo` (valores `'pt'` | `'en'` | `'es'`,
  padrão `'pt'`). **Acompanha a conta**, não o aparelho — ao contrário
  de tema/fonte (que são intencionalmente por aparelho via
  `CHAVES_POR_APARELHO`), `idioma-conteudo` fica de fora dessa lista e
  de `CHAVES_LOCAIS`, então segue o comportamento padrão de qualquer
  ajuste (sincroniza pelo mecanismo genérico já existente, mesmo
  princípio de "o aparelho em uso vence" em caso de conflito — igual
  nome, metas etc.).
- **Onde fica o conteúdo traduzido do Resumo:** arquivos JSON
  separados (`licoes-en.json`, `licoes-es.json`), carregados sob
  demanda só quando `idioma-conteudo !== 'pt'`. Embutir tudo no
  `index.html` triplicaria os ~1.2MB de conteúdo pra todo mundo, mesmo
  quem nunca troca de idioma — rejeitado por isso.
- **Escopo da tradução:** só as **13 lições do trimestre atual**
  (`2026-03-cq`). Trimestres futuros ficam de fora — mesma limitação
  que o app já tem hoje pra português (`TRIMESTRE_ATUAL`,
  `LESSON3_START` são fixos pro trimestre corrente).
- **Interface do app:** não traduzida nesta rodada — só o conteúdo
  (lição + Bíblia). Decisão explícita: o público do app parece ser
  majoritariamente falante de português estudando em outro idioma, e
  isso corta a maior parte do trabalho de implementação (dezenas de
  strings fixas espalhadas pelo código ficam de fora).

## Modelo de dados

### Preferência de idioma

```
window.storage chave 'idioma-conteudo' = 'pt' | 'en' | 'es'
```

Lida por uma função nova `getIdiomaConteudo()` (default `'pt'` se a
chave não existir), análoga a `loadFontSize()`/`loadTheme()` já
existentes. Escrita por `setIdiomaConteudo(idioma)`, que salva e
recarrega o conteúdo da tela atual (mesmo padrão de `setDesignTheme()`).

### Arquivos de tradução do Resumo

```
licoes-en.json
licoes-es.json
```

Mesmo formato de `LESSONS_CONTENT`, um array de objetos por lição,
mas só com os campos que têm texto pra traduzir — **não repete** os
campos que não mudam por idioma (`id`, `centraltexts` como citação
técnica, `quiz.answers`, estrutura de `days[].id`/`letter`):

```json
[
  {
    "id": 12,
    "title": "He Is Risen!",
    "keyword": "DELIVERY",
    "bibleref": "Luke 24",
    "days": [
      {
        "id": "dom",
        "title": "The Empty Tomb",
        "keyideas": "...",
        "summary": "...",
        "body": ["<p>...</p>", "..."],
        "reflectTitle": "Reflection Questions",
        "reflect": ["...", "..."],
        "quiz": {
          "questions": [
            { "text": "...", "opts": ["...","...","...","..."] }
          ]
        }
      }
    ]
  }
]
```

`quiz.answers` (a letra da resposta certa, ex. `["B","D",...]`) **não
é repetido** — o embaralhamento e a correção usam a posição das opções
dentro do array `opts`, que a tradução preserva na mesma ordem. Só o
**texto** de `questions[].text`/`opts` é traduzido.

Referências bíblicas clicáveis dentro do texto (`<span class="vref"
data-book="JHN" ...>`) **mantêm os atributos `data-book`/`data-chapter`
intactos** (são códigos internos de 3 letras, independentes de
idioma) — só o texto visível dentro do `<span>` é traduzido (ex.: "Jo
12:7,8" → "John 12:7,8").

Citações de Ellen G. White usam os títulos oficiais já publicados em
cada idioma (ex.: "O Desejado de Todas as Nações" → "The Desire of
Ages" / "El Deseado de Todas las Gentes"), não tradução literal do
título.

## Como o app troca de idioma

### Seletor no menu

Nova seção "Idioma" em `app-menu-panel` (`index.html` por volta da
linha 1493), entre "Tamanho da fonte" e "Design", mesmo estilo visual
da grade de cores do Design — três botões lado a lado:

```
🇧🇷 PT   🇺🇸 EN   🇲🇽 ES
```

Cada botão chama `setIdiomaConteudo('pt'|'en'|'es')`. O botão do
idioma ativo fica destacado (mesmo padrão de estado "active" já usado
em outros seletores do app, ex. `.vpop-version-btn.active`).

### Aba Oficial

`buscarOficialDaRede()` (e o `baseImageUrl` usado pras imagens da
lição, na mesma função) passam a montar a URL com
`src/${idioma}/...` em vez de `src/pt/...` fixo, usando o idioma
corrente. Nenhuma outra mudança — o parser de markdown
(`markdownToHtml`) já processa o `.md` de qualquer idioma igual.

**Limitação aceita:** o auto-link de citações bíblicas em texto puro
dentro do markdown oficial (`formatBibleReferences()`, função
`buscarOficialDaRede`) usa `BOOK_NAME_TO_ID`, um dicionário de nomes
de livros **só em português** ("João", "Gênesis" etc.), pra detectar
e transformar citações em texto corrido em links clicáveis. Em
inglês/espanhol essa detecção não vai reconhecer os nomes dos livros
("John", "Genesis", "Juan", "Génesis"...), então citações bíblicas na
aba Oficial em EN/ES aparecem como texto normal, sem virar link
clicável — o texto em si (vindo pronto do Adventech) continua correto
e legível, só perde essa conveniência de toque. Fica registrado como
melhoria futura (adicionar `BOOK_NAME_TO_ID` equivalente por idioma),
não faz parte desta primeira entrega.

### Aba Bíblia

`fetchBookGithub(versionId, myBookId)` ganha um parâmetro de idioma,
usado pra montar `versions/${pasta}/${versionId}/...` em vez de
`versions/pt-br/...` fixo. Mapeamento de idioma → pasta/versão padrão:

| `idioma-conteudo` | pasta no repositório | versão padrão |
|---|---|---|
| `pt` | `pt-br` | `nvi` (com opção de trocar pra `arc`, como hoje) |
| `en` | `en` | `kjv` (única disponível nesta fonte gratuita) |
| `es` | `es` | `rvr` (única disponível nesta fonte gratuita) |

`versionSwitchRow()` (o seletor NVI/ARC dentro do popup de
versículo) só aparece quando `idioma-conteudo === 'pt'` — em
inglês/espanhol só existe uma versão gratuita disponível nesta fonte,
então não há o que escolher.

O link externo "Abrir [livro] [capítulo] num site de Bíblia" (hoje
sempre aponta pro bibliaonline.com.br, que é só em português) fica
condicionado a `idioma-conteudo === 'pt'` — em inglês/espanhol esse
link não aparece, evitando mandar quem está lendo em inglês pra um
site só em português.

### Aba Resumo

Nova função `carregarTraducaoResumo(idioma)`, chamada quando
`idioma-conteudo !== 'pt'`: busca `licoes-${idioma}.json` (uma vez,
com cache em memória pro resto da sessão — mesmo princípio de
`officialContentCache`), e o render da aba Resumo usa os campos
traduzidos quando existem, com fallback pro português
(`LESSONS_CONTENT`) se a lição/dia não estiver na tradução (proteção
pra quando o arquivo de tradução ainda não cobre alguma lição nova).

## Casos de borda

- **Arquivo de tradução ainda não existe ou falhou ao carregar:** aba
  Resumo cai pro conteúdo em português com um aviso discreto (mesmo
  tom de outros avisos de rede já existentes no app, ex. "Não foi
  possível carregar o ranking agora").
- **Lição sem tradução dentro do arquivo (buraco de cobertura):**
  mesmo fallback por lição/dia, não por arquivo inteiro.
- **Troca de idioma no meio da leitura de um dia:** recarrega a tela
  atual (mesmo padrão de `setDesignTheme()`), sem perder em qual
  lição/dia a pessoa estava.
- **Progresso e quiz:** não são afetados — `progress.quiz[dayId] =
  {correct, total, time}` guarda contagem e tempo, não texto; a
  correção do quiz usa a letra/posição da opção, que a tradução
  preserva.

## Fora de escopo (não incluído nesta entrega)

- Tradução da interface do app (botões, menus, rótulos fixos)
- Auto-link de citações bíblicas em texto corrido na aba Oficial para
  inglês/espanhol (precisaria de um `BOOK_NAME_TO_ID` por idioma)
- Trimestres futuros (só o trimestre `2026-03-cq` atual é traduzido)
- Mais de uma versão bíblica por idioma em inglês/espanhol (a fonte
  gratuita usada só tem uma de cada)
- Detecção automática de idioma do navegador — a pessoa escolhe
  manualmente no menu
