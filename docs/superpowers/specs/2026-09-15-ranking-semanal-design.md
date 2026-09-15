# Ranking semanal — design

## Contexto

O app (`index.html`, site estático + Firebase Realtime Database via REST,
sem backend/Cloud Functions) hoje rastreia progresso de lição por usuário
em `/usuarios/{uid}` — um nó privado, de leitura restrita ao próprio dono.
A aba **Progresso** já calcula, só localmente, "X/7 dias essa semana" e
"nota média" da semana corrente (ver `renderStats()`, `buildProgressMap()`,
`computeDaysInRange()`).

Este documento cobre a primeira de três frentes pedidas pelo usuário
(ranking semanal, seguir/seguidores, conquistas mensais/trimestrais) —
as outras duas ficam para ciclos de design separados.

## Objetivo

Ranking semanal público entre todos os usuários que optarem por
participar, comparando consistência (dias de lição concluídos) e
desempenho (nota média nos quizzes) dentro da mesma janela de semana
(domingo-sábado) que a aba Progresso já usa.

## Decisão de arquitetura: quem calcula a pontuação

**Cliente calcula e grava diretamente** no nó público de ranking —
consistente com o resto do app, que não tem backend. As regras do
Firebase validam formato e limites (não negativo, não maior que o
máximo possível), mas não conseguem conferir o valor contra o
progresso privado real do usuário, porque `/usuarios/{uid}` continua
de leitura restrita ao dono (inclusive para as próprias regras, ao
validar outro nó).

**Risco aceito:** um usuário tecnicamente capaz poderia forjar uma
pontuação mais alta via DevTools. Para um app de estudo em grupo, sem
prêmio ou disputa séria em jogo, esse risco foi considerado aceitável.
Alternativa descartada: calcular no servidor via Cloud Functions —
eliminaria o risco, mas exigiria plano pago do Firebase (Blaze) e uma
camada de backend que o projeto não tem hoje. Fica registrado como
opção futura se o problema aparecer na prática.

## Modelo de dados

Nó novo, separado do `/usuarios/{uid}` privado:

```
/ranking/{semanaId}/{uid} = {
  nome: "Josias",           // primeiro nome só (mesma convenção dos comentários)
  diasConcluidos: 5,        // 0-7, dias de lição concluídos na semana
  notaMedia: 87,             // 0-100, média dos quizzes respondidos na semana
  pontos: 65,                 // calculado, usado para ordenar
  atualizado_em: "2026-09-15T12:00:00.000Z"
}
```

`semanaId` = `dateKey()` do domingo da semana em questão — a mesma
janela (domingo-sábado) que `renderStats()` já usa para "X/7 dias essa
semana" e "nota média", então os números do ranking batem com os que a
pessoa já vê no próprio card de progresso.

## Fórmula de pontos

```
pontos = round(diasConcluidos/7 * 60) + round(notaMedia/100 * 40)
```

Escala 0-100. Consistência (dias concluídos) vale até 60 pontos,
desempenho no quiz (nota média) até 40. São duas constantes no código —
dá para reajustar o peso depois sem redesenhar nada.

Desempate: `pontos` desc → `notaMedia` desc → `nome` alfabético.

## Quando a entrada é gravada

Uma função nova, `atualizarRankingSemanal(lessonId)`, roda nos dois
pontos onde o progresso de lição já muda:

- depois de `marcarConcluido()` (dia concluído)
- depois da 10ª resposta do quiz (mesmo ponto corrigido no fix do
  "refresh do quiz")

Ela só executa se **a pessoa estiver logada** e **tiver optado por
participar** (ver seção seguinte). Recalcula `diasConcluidos` e
`notaMedia` da semana corrente a partir de `progressCache` (mesma
lógica de `buildProgressMap()` + `computeDaysInRange()`, mas restrita a
dias de lição — não conta plano bíblico) e grava com `PUT` em
`/ranking/{semanaId}/{uid}`. Silenciosa (try/catch), no mesmo padrão do
resto da sincronização com Firebase — uma falha de rede aqui não pode
quebrar o fluxo de concluir dia/quiz.

**Regra central de presença:** a entrada de uma semana só existe se
houve alguma ação de progresso *naquela* semana. Quem não estuda a
lição nem faz quiz numa semana simplesmente não tem entrada nela — some
do ranking daquela semana automaticamente, sem necessidade de limpeza.
Assim que volta a estudar (mesmo um dia só), a entrada da semana atual
é criada de novo e a pessoa reaparece. O único jeito de sair "de vez",
inclusive do histórico de semanas passadas, é desativar o switch (ver
próxima seção).

## Opt-in e UI

**Switch "Participar do ranking semanal"** na aba Conta, perto do
switch de sincronização existente. Estado guardado localmente (chave
`window.storage`, ex.: `ranking-opt-in`) e sincronizado como qualquer
outro ajuste via `montarPacoteSync()`/`coletarDadosLocais()` (já
cobertos pelas regras de chave sincronizável existentes).

- **Ativar:** liga o switch; a próxima ação de progresso já grava a
  entrada da semana atual (não escreve nada na hora de ativar — só
  passa a permitir a gravação).
- **Desativar:** apaga a entrada do usuário em **todas** as semanas que
  o app conseguir listar — `GET /ranking.json?shallow=true` retorna as
  chaves de semana existentes, e o cliente deleta
  `/ranking/{semanaId}/{uid}` em cada uma. Evita deixar nome/nota
  expostos depois que a pessoa saiu.

**Exibição:** nova seção na aba Progresso, logo abaixo do card "Esta
semana" já existente. Busca o nó inteiro de `/ranking/{semanaId}`
(chave da semana corrente), ordena no cliente pela fórmula de
desempate acima, mostra os top 20-50. A posição de quem está vendo é
destacada mesmo se estiver fora do topo. Dado o tamanho esperado de um
grupo de estudo (dezenas a poucas centenas de pessoas, não milhões),
buscar o nó inteiro e ordenar no cliente é suficiente — não precisa de
query otimizada (`orderBy`/`limitToLast`) agora; fica registrado como
melhoria futura se o grupo crescer muito.

## Regras do Firebase

Entra junto com a atualização de regras já pendente no
`FIREBASE-SETUP.md` (mesma ida ao console, mesmo passo):

```json
"ranking": {
  "$semanaId": {
    ".read": "auth != null",
    "$uid": {
      ".write": "auth != null && auth.uid === $uid",
      ".validate": "newData.hasChildren(['nome','diasConcluidos','notaMedia','pontos']) && newData.child('diasConcluidos').val() >= 0 && newData.child('diasConcluidos').val() <= 7 && newData.child('notaMedia').val() >= 0 && newData.child('notaMedia').val() <= 100"
    }
  }
}
```

## Casos de borda

- **Ninguém participando ainda:** a seção mostra "Ninguém no ranking
  essa semana ainda. Seja o primeiro!" em vez de lista vazia.
- **Empate em pontos:** desempate por `notaMedia`, depois por ordem
  alfabética do nome (ver fórmula de desempate acima).
- **Usuário sem atividade na semana:** não aparece (ver "Regra central
  de presença" acima) — não é um caso de borda tratado à parte, é o
  comportamento padrão do modelo de dados.
- **Semanas antigas:** os nós `/ranking/{semanaId}` de semanas
  passadas continuam existindo no banco sem limpeza automática — não é
  problema com poucas semanas por trimestre, mas fica registrado como
  possível melhoria futura (ex.: apagar semanas com mais de N meses).
- **Usuário desloga no meio da semana:** a última entrada gravada
  permanece visível para os outros até a próxima ação de progresso
  (não há como "despublicar" automaticamente ao deslogar sem quebrar a
  regra central de presença).

## Fora de escopo (frentes futuras, não incluídas aqui)

- Seguir / seguidores
- Conquistas mensais ou trimestrais
- Cloud Functions / cálculo no servidor
- Paginação ou query otimizada do ranking
- Limpeza automática de semanas antigas
