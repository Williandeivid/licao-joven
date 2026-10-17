# Padrão da lição — o que fazer quando chega um trimestre novo

Receita fixa, construída entre 16 e 17 de outubro de 2026 enquanto o 4º
trimestre era revisado. Vale para toda lição nova, sem precisar reabrir a
discussão. Os scripts citados vivem em `scripts/`.

---

## 1. Grifo: **um por dia**

Em cada dia, exatamente **um** trecho do `body` vai dentro de
`<mark class="hl">…</mark>`.

**O critério:** a frase que a pessoa precisa levar daquele dia — não a mais
bonita, não a mais citável. Se o dia fosse resumido em uma linha na cabeça de
alguém uma semana depois, qual seria?

**Por que um só:** grifo em tudo é o mesmo que grifo em nada. O 3º trimestre
nasceu com 2 a 8 marcações por dia — havia dia com "cenáculo", "graça",
"Trindade" e "poda" destacados, e o olho não sabia onde pousar. Em 17/10/2026
os 182 dias do ano foram normalizados para um grifo cada.

**Cuidados:**
- O trecho tem que existir **uma única vez no arquivo inteiro**. Já aconteceu
  de uma troca destinada à lição 17 cair na 15, porque a âncora se repetia.
- Não grife por cima de `<span class="vref">` (referência bíblica) nem de
  `<a>`: escolha um pedaço de texto limpo.
- O grifo entra no português. As traduções (`licoes-en.json`, `licoes-es.json`)
  casam por posição; enquanto não forem grifadas, o destaque simplesmente não
  aparece nelas — o que é aceitável, mas vale lembrar.

**Como aplicar:** um lote `[(licao, dia, trecho), …]` e o script que confere
tudo antes de gravar (recusa trecho ambíguo, ausente ou já grifado).

---

## 2. Quiz: a resposta certa não pode se entregar

São três regras, em ordem de gravidade. O `scripts/check-dados.js` mede as
duas primeiras e avisa.

**(a) Nunca 8+ caracteres maior.** Se a certa for 8 caracteres mais longa que
a maior errada, dá para acertar de relance, sem ler a pergunta. É o defeito
grave; tem que ser zero.

**(b) A certa não pode ser visivelmente a mais longa.** Diferença de 3 ou mais
caracteres já se nota. Quando acontecer, **alongue UMA alternativa errada** até
ela passar a certa — mantendo o sentido plausível, só mais completa. Nunca
encurte a certa nem mexa na pergunta.

**(c) Diferença de 1 ou 2 caracteres não conta.** "Cinco" contra "Quatro",
"Jeremias 36:20-32" contra "Jeremias 36:1-19": ninguém percebe, e tentar
igualar isso só deixa o texto artificial.

**O que NÃO é regra:** alternativa curta não é defeito. "Ana / Maria /
Priscila / Lídia" e listas de referência bíblica são curtas por natureza. O
defeito nunca é o tamanho — é a **desproporção** entre a certa e as erradas.

**As erradas precisam ter o mesmo peso da certa.** Nada de "Para ficar famoso"
ao lado de uma resposta de 50 caracteres. Cada errada deve ser algo que alguém
poderia mesmo acreditar: mesmo assunto, mesma concretude, mesmo nível de
detalhe.

**Medida de controle:** a nota de quem chuta sem ler. Chutar "a mais comprida"
deve dar perto de 2,5 em 10 (o acaso com 4 alternativas). No 4º trimestre caiu
de 5,3 para 1,8; chutar "a mais curta" dá 1,7. O tamanho parou de dizer
qualquer coisa.

---

## 3. Depois de mexer no quiz, conferir SEMPRE

Três checagens, nesta ordem. A terceira existe porque uma vez o app passou a
marcar a resposta certa como errada depois de uma troca de alternativas.

1. **`node scripts/check-dados.js`** — zero erros; avisos só nas lições que
   ainda não foram revisadas.
2. **A resposta certa continua a mesma, no mesmo lugar?** Comparar com a
   versão publicada: texto da certa idêntico, letra do gabarito idêntica,
   nenhuma alternativa repetida ou vazia, 4 alternativas por pergunta.
3. **Clicar de verdade, no navegador.** Abrir cada lição, achar a alternativa
   cujo texto é a resposta certa, clicar e confirmar que o app a marca como
   certa. O app embaralha as alternativas na hora de desenhar
   (`shuffleOptions`), então a conferência estática não basta.

---

## 4. Curiosidades (lâmpada)

- Fonte primária citada, texto reescrito com palavras próprias, nada copiado.
- Nada doutrinário, nada enquadrado como "isso prova que a Bíblia é verdadeira".
- Nada anterior a ~3000 a.C., para não esbarrar em discussão de cronologia.
- Nada de folclore (portão da agulha, corda no tornozelo do sumo sacerdote).
- Limites: curta ≤ 95, longa ≤ 200, fonte ≤ 40 caracteres.
- Etiquetar a lição em `ETIQUETAS_DA_LICAO` com o tema que ela de fato tem —
  o grupo temático precisa de pelo menos 7 itens (um por dia da semana), senão
  a mesma curiosidade volta o trimestre inteiro.

---

## 5. Antes de publicar

- `node scripts/check-dados.js` sem erros.
- Conferir no navegador em **320 px e 375 px**, nos temas **claro, escuro e
  cinza escuro**: nenhuma tela pode estourar a largura (no app das lojas isso
  vira zoom, não barra de rolagem).
- Backup do `index.html` antes de qualquer lote grande.
- Publicar só com o OK do Willian, de preferência por branch com prévia.
- **O app das lojas não atualiza sozinho**: qualquer mudança no `index.html`
  só chega lá com rebuild do Josias.
