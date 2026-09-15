# Ideias e pendências

Lista viva. Cada item tem contexto suficiente para alguém pegar e executar
sem precisar reconstruir a conversa.

Última revisão: 13 de setembro de 2026

---

## 🔴 Corrigir

### Compartilhar no WhatsApp manda para um link que não existe
O item "Compartilhar" do menu ⋮ de cada dia monta a mensagem com
`https://licoes-jovens.com`. Esse domínio **não está registrado** — o RDAP da
Verisign devolve `404` e o endereço não responde.

Dois problemas: quem recebe a mensagem cai num link morto; e qualquer pessoa
pode registrar `licoes-jovens.com` hoje e passar a receber todo o tráfego vindo
dos compartilhamentos do app.

**Correção imediata:** trocar pelo endereço real, `licaojovem-iasd.pages.dev`,
até existir domínio próprio. Melhor ainda: montar o link com o dia específico,
para quem recebe cair direto na lição compartilhada.

**Onde:** `compartilharWhatsApp()`.

---

### "Baixar PDF" baixa um arquivo .txt
O item do menu ⋮ se chama "Baixar PDF", mas `exportarPDF()` gera um `Blob` de
`text/plain` e salva como `licao-11-qua.txt`. Ou renomear para "Baixar texto",
ou gerar PDF de verdade.

**Detalhe junto:** as duas funções fecham o menu com
`document.querySelector('.menu-3pontos-btn')`, que pega o **primeiro** botão da
página, não o que foi clicado.

---

### A tirinha do domingo nunca aparece
O código da aba Resumo mostra a tirinha do trimestre no domingo só se a lição
tiver o campo `quarter`:

```js
if(day.id === 'dom' && meta && meta.quarter){ ... }
```

Mas nenhuma entrada de `LESSONS_META` tem esse campo — são todas `{id, title}`.
A condição nunca é verdadeira e a tirinha nunca foi exibida. Resolve junto com
**Trimestre num lugar só**: usar a constante única em vez de `meta.quarter`.

---

### Rajada de requisições ao conteúdo oficial
Em 11/09 o app acumulou ~490 erros `503` por carregamento e o conteúdo oficial
não abria. Em 12/09 voltou ao normal (`200`), então foi queda passageira do
GitHub — mas a causa que provavelmente disparou o limite continua:
`fetchOfficialContent` é chamada para os **7 dias de uma vez** via `Promise.all`.

**O que fazer:** espaçar as chamadas (uma por vez, ou 2 em paralelo), respeitar o
cache de 7 dias que já existe antes de pedir de novo, e não repetir a busca
quando a anterior falhou com 503.

**Onde:** `fetchOfficialContent()` e a chamada com `Promise.all` logo abaixo.

---

### Quizzes de sábado das lições 8 a 13
Existiam na versão de 17 de agosto e se perderam na restauração do backup de 14.
As demais lições têm quiz de sábado; essas ficaram sem.

**Onde:** `LESSONS_CONTENT`, dias `sab` das lições 8–13.

---

## 🟡 Próximo

### Willian e Josias como gerentes
Hoje admin é por `uid` em `config/admins/{uid}`. Funciona, mas exige que cada
pessoa entre no app primeiro para o uid existir.

**Alternativa mais prática:** as regras do Firebase leem `auth.token.email`, então
dá para autorizar por e-mail direto, sem depender de uid:

```
"admins": "auth.token.email == 'willian932@gmail.com' || auth.token.email == 'EMAIL_DO_JOSIAS'"
```

Assim o Josias vira gerente antes mesmo de entrar pela primeira vez.

**Falta:** o e-mail Google do Josias.

**Nota:** os e-mails ficam nas regras do banco, que não são públicas — não vão
para o HTML.

---

### Curtir, salvar e compartilhar a lição
Três ações por dia de estudo, numa barra só. Hoje parte disso já existe
espalhado no menu ⋮ (e com os dois bugs listados em **Corrigir**) — a ideia é
reunir e fazer direito.

#### Curtir (reagir)
Baixo risco: a pessoa reage ao **conteúdo**, não a outra pessoa. Em vez de um
coração solto, um conjunto pequeno de reações com significado — algo como
"me marcou", "fiquei com dúvida", "vou orar por isso". Dá sinal útil sobre
quais dias tocam mais, sem criar comparação.

**Banco:** `reacoes/{licao}/{dia}/{uid} = "marcou"`. Um registro por pessoa por
dia — trocar de reação sobrescreve, e contar é só agrupar na leitura. Precisa de
regra nova: cada um escreve só o próprio `uid`.

#### Salvar
Guardar um dia de lição para voltar depois, numa lista "Salvos" na aba Conta.

**Detalhe que barateia:** a sincronização que já existe sobe para a nuvem
qualquer chave nova gravada com `window.storage.set`. Gravando em
`licoes-salvas`, o recurso já nasce sincronizado entre celular e computador,
sem mexer em banco nem em regra.

#### Compartilhar
Três formas, com complexidade bem diferente:

**1. Texto no WhatsApp** — já existe, só precisa do link corrigido. Melhoria:
incluir o trecho principal do dia na mensagem, não só o título.

**2. Link direto para o dia** — quem recebe abre o app já na lição e no dia
certos, em vez de cair na tela inicial. Pede que a URL carregue lição e dia
(algo como `?licao=11&dia=qua`) e que o app leia isso ao abrir.

**3. Imagem para Instagram e WhatsApp** — a mais bonita e a que mais precisa de
decisão. Como gerar:

- **No próprio navegador, com Canvas.** Sem servidor e sem custo. O app desenha
  a imagem na hora e entrega o arquivo PNG.
- **Dois formatos:** 1080 × 1920 para Stories e Status do WhatsApp, 1080 × 1080
  para o feed.
- **O que vai na imagem:** um trecho curto (a pessoa seleciona, ou o app usa a
  frase-chave do dia), título da lição, dia da semana, e o endereço do app
  pequeno no rodapé.
- **Cores do tema que a pessoa escolheu.** Quem usa Rosa Teen compartilha imagem
  rosa; quem usa Forest, verde. A imagem sai com a cara de quem compartilhou.

**Como a imagem chega no Instagram:** o Instagram **não tem API web para
postar** — nenhum site consegue publicar direto lá. O caminho é a Web Share API
com arquivo (`navigator.share({ files })`), que abre a folha de compartilhamento
nativa do celular. É ali que aparecem Instagram, WhatsApp e o resto — a pessoa
escolhe. No computador, onde isso não existe, cai para baixar o PNG.

**Três armadilhas conhecidas do Canvas:**
- Esperar as fontes carregarem (`document.fonts.ready`) antes de desenhar,
  senão sai tudo na fonte padrão em vez de Unbounded.
- Quebra de linha é manual — o Canvas não quebra texto sozinho, precisa medir
  palavra por palavra.
- Imagem de outro domínio "contamina" o Canvas e bloqueia a exportação. A
  tirinha vem de `raw.githubusercontent.com` — ou carrega com `crossOrigin`, ou
  fica fora da imagem.

#### Curtida em comentário
Separado das reações acima, e foi decidido deixar para depois sabendo do risco:
comentário com contador de curtida vira disputa de popularidade em cima de
reflexão espiritual, e quem escreve algo sincero e não recebe curtida tende a
parar de escrever. Se for feito, considerar mostrar a reação **sem número
visível** para os outros, só para quem escreveu.

---

### Trimestre num lugar só
O trimestre `2026-03-cq` está escrito à mão em **três** pontos do `index.html`:
a imagem de fundo (CSS, ~linha 525), a busca do conteúdo oficial
(`const quarter`, ~linha 6109) e o link "Repositório Adventech" (~linha 6280).
Na virada, esquecer um deles deixa o app meio no trimestre novo, meio no velho.

**O que fazer:** uma constante única, `TRIMESTRE_ATUAL`, usada nos três lugares.

**Por que não detectar pela data** (ideia registrada antes e descartada em
13/09): o conteúdo próprio do app, em `LESSONS_CONTENT`, é fixo por trimestre.
Se a aba Oficial trocasse sozinha pela data, na virada ela mostraria o trimestre
novo enquanto a aba Resumo continuaria no antigo — as duas descasadas. O
trimestre precisa virar junto com o conteúdo, de forma deliberada.

---

### Aviso quando o próximo trimestre subir
Em 12/09 o 4º trimestre (`2026-04-cq`) ainda não existia no repositório Adventech,
com a lição 13 fechando em 26/09. Checar periodicamente e avisar quando aparecer,
para montar a virada com antecedência em vez de correr no início de outubro.
A virada envolve: trocar o trimestre, carregar as 13 lições novas em
`LESSONS_CONTENT` e atualizar `LESSON3_START`, que calcula todo o calendário.

---

### Calendário no estilo Duolingo
Três peças, em ordem de impacto:

1. **Semana perfeita como faixa contínua** — quando os 7 dias da lição estão
   concluídos, a linha vira uma faixa única em gradiente, em vez de 7 quadrados.
   A estrutura já existe: `.wcal-this-week.dow-0` e `.dow-6` já arredondam as
   pontas. Como cada lição cobre exatamente domingo a sábado, "semana perfeita"
   é o mesmo que "lição completa" — marco real, não inventado.
2. **Contador do mês** — "12 dias estudados em setembro", acima do calendário.
3. **Gelinho nos dias perdidos** — pendente de decisão de tom. No Duolingo o gelo
   é prêmio (protege a sequência); usar o mesmo símbolo para "você faltou"
   inverte o significado e vira marcador de culpa num app devocional.

---

### Busca de conteúdo
Buscar dentro de todas as lições e dias. Nunca foi implementado.

---

### Retirar a aba Resumo
Ideia levantada em 12/09. **Antes de fazer, saber exatamente o que sai** — a aba
guarda mais coisa do que o nome sugere.

Hoje cada dia tem duas abas, com **Oficial** aberta por padrão:

| Aba | O que é |
|---|---|
| **Oficial** | busca ao vivo o `.md` do repositório Adventech |
| **Resumo** | conteúdo **nosso**: `day.summary`, o texto parafraseado (`day.body`), a tirinha do trimestre no domingo e o link do texto-base da semana |

Ou seja: o Resumo não é um resumo do Oficial — é o conteúdo próprio do app,
escrito para o projeto. Removendo, o app vira um leitor do conteúdo Adventech
com quiz em cima.

**Argumento a favor de manter:** é a rede de segurança. Em 11/09 o Adventech
devolveu `503` o dia inteiro e a aba Oficial mostrou "Conteúdo oficial
indisponível". Sem o Resumo, naquele dia o app não teria **nada** para mostrar.

**Se ainda assim for para tirar**, vale considerar o meio-termo: manter o
conteúdo próprio, mas sem a troca de abas — o Oficial primeiro e o nosso texto
logo abaixo, na mesma rolagem. Some a interface de aba, fica o conteúdo.

---

## 🟢 Maior

### Inglês e espanhol
**Descoberta que reduz muito o trabalho:** o repositório Adventech já tem o
conteúdo oficial nos três idiomas — `src/pt/`, `src/en/` e `src/es/` respondem
`200`. Nosso código fixa `pt` numa linha só:

```js
const mdUrl = `.../src/pt/${quarter}/${lessonNum}/${dayNum}.md`;
```

Trocar para uma variável de idioma resolve a aba **Oficial** inteira.

**O que sobra em português:**
- `LESSONS_CONTENT` — o conteúdo parafraseado nosso, 13 lições × 7 dias
- As perguntas e alternativas dos quizzes
- Os textos da interface

**Sugestão de fatiamento:** começar pela aba Oficial (quase de graça) e pela
interface, deixando o conteúdo próprio só em português no início, com aviso.
Traduzir 91 dias de conteúdo é um projeto à parte.

---

### Aprofundar a lição com o Claude
Um caminho dentro do app para quem quiser ir além do texto do dia — perguntar
sobre o contexto histórico, o original grego, o paralelo com outra passagem.

Não existe "login do Claude" que um site de terceiro possa embutir. Os caminhos
reais são dois, com custos bem diferentes:

**A) Botão que abre o Claude com a pergunta pronta** — de graça e sem servidor.
Um link para `claude.ai/new?q=...` já preenchido com o contexto do dia:
lição, título, texto-base e uma pergunta de partida. A pessoa usa a conta Claude
dela. Sai do app, mas custa zero e dá para fazer numa tarde.

**B) Claude dentro do app, respondendo ali** — precisa de chave da API, e chave
**não pode ficar no HTML** (o arquivo é público, seria copiada em minutos).
Exigiria uma Cloudflare Pages Function como intermediária, guardando a chave
como variável de ambiente. Como o site já roda em Cloudflare Pages, a
infraestrutura existe — o trabalho é a função e o controle de uso.

**O custo é o ponto de atenção do caminho B:** cada pergunta consome tokens
pagos por você. Com adolescentes usando à vontade, escala rápido. Precisaria de
limite por pessoa por dia, e ainda assim é conta recorrente.

**Cuidado de conteúdo, vale para os dois caminhos:** o Claude responde a partir
de conhecimento geral, não da doutrina adventista. Em pergunta sobre santuário,
estado dos mortos ou profecia, pode dar resposta que não bate com o que a lição
ensina. Se for em frente, o texto de partida deveria pedir explicitamente a
perspectiva adventista, e a interface deveria deixar claro que é ferramenta de
estudo, não posição oficial da igreja.

**Sugestão:** começar pelo A. Testa o interesse real sem gastar nada e sem
assumir risco. Se muita gente usar, aí avaliar o B.

---

### Turma ou amigos
Discutido, não decidido. Duas modelagens possíveis:

- **Turma por código** — o líder cria, gera um código curto, quem entra vê os
  outros da turma. Encaixa com a realidade da Escola Sabatina e a moderação tem
  dono natural.
- **Amigo a amigo** — cada um adiciona cada um. Mais trabalhoso de usar.

Estrutura sugerida: um nó `perfis/{uid}` com resumo público (nome, foto,
sequência, dias no mês), separado do `usuarios/{uid}` privado, que continua
trancado.

**Decidir antes de codar** — muda a modelagem do banco.

**Cuidado levantado:** é app de adolescente. Entrada na turma deveria ser
opt-in explícito, com aviso do que os outros vão ver.

---

### Quiz com alternativas no mesmo nível
Pergunta fácil com alternativas fáceis; intermediária com intermediárias;
avançada com avançadas. Hoje as alternativas erradas às vezes são óbvias demais
e a pessoa acerta por contraste, sem saber a matéria.

---

### Auditoria dos planos bíblicos
Levantamento feito em `ANALISE_PLANOS_BIBLICOS.md`, sem decisão tomada:

- **Cronológico** diverge do padrão — insere Jó inteiro (42 capítulos) entre
  Gênesis 11 e 12. A YouVersion segue sequência contínua. Decidir se é escolha
  pedagógica intencional ou erro a corrigir.
- **Acelerado 6 meses** é cópia exata do Tradicional, só com ritmo dobrado.
  Não agrega — remover ou redesenhar.
- **Ano Bíblico Jovem** (3 variações) começa com Salmos 1–24 e pula Gênesis
  1–12. Não encontramos fonte que confirme esse formato. Precisa validação.

---

### Domínio próprio
Pesquisa completa com 54 nomes verificados no registro.br. Favoritos livres:
`fejovem`, `licaoviva`, `alvojovem`.

Ao trocar de domínio, lembrar do redirecionamento 301 do
`licaojovem-iasd.pages.dev` — já tem gente com o link salvo.

---

## Decisões já tomadas (não reabrir sem motivo novo)

| Tema | Decisão |
|---|---|
| Responder comentário (thread) | não — exige moderação de verdade |
| Editar comentário | não — proibido nas regras, só apagar e reescrever |
| Comentário anônimo | não — anonimato entre adolescentes degrada o tom |
| Ranking entre usuários | não — comparação atrapalha em app devocional |
| Congelamento estilo Duolingo | não — mecânica de engajamento sem serventia ao estudo |
| Aparência por tipo de aparelho | sim — celular e computador guardam preferências separadas |
| Ordem dos comentários | cronológica, mais antigo primeiro |
