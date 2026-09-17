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

### Toque pra ver versículo funciona nos três idiomas

O auto-link de citações bíblicas em texto corrido
(`formatBibleReferences()`, dentro de `buscarOficialDaRede()`) detecta
nomes de livro no texto puro do markdown oficial usando
`BOOK_NAME_TO_ID` — hoje um dicionário só em português ("João",
"Gênesis"...). Pra funcionar em inglês e espanhol também, ele precisa
reconhecer os nomes de livro **naquele** idioma.

Solução: dois dicionários novos, mesmo formato de `BOOK_NAME_TO_ID`
(nome do livro → mesmo código de 3 letras já usado em `data-book`,
independente de idioma — `GEN`, `EXO`... `JHN`... `REV`), cobrindo
nome completo de cada um dos 66 livros mais as abreviações mais
comuns:

```js
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
  // abreviacoes comuns
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
  // abreviaciones comunes
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

`formatBibleReferences()` passa a receber o idioma corrente e escolher
o dicionário certo (`BOOK_NAME_TO_ID` pra `pt`, `BOOK_NAME_TO_ID_EN`
pra `en`, `BOOK_NAME_TO_ID_ES` pra `es`) antes de montar o
`namesPattern`/`fullCiteRe` — o resto da função (como já reconhece
"livro + capítulo[:versículos]" e "v. 10, 11" avulsos) não muda, só a
fonte dos nomes de livro.

`seedContextFromCentralTexts()` (usada só pela aba Resumo, pra
interpretar referências curtas tipo "v. 10" a partir do contexto de
`centraltexts`) **continua usando sempre `BOOK_NAME_TO_ID` em
português** — `centraltexts` não é traduzido (ver Modelo de dados
acima), então o dicionário que o interpreta também não precisa mudar.

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
- Trimestres futuros (só o trimestre `2026-03-cq` atual é traduzido)
- Mais de uma versão bíblica por idioma em inglês/espanhol (a fonte
  gratuita usada só tem uma de cada)
- Detecção automática de idioma do navegador — a pessoa escolhe
  manualmente no menu
