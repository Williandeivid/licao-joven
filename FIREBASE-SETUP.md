# Login com Google (Firebase) — situação

Console: https://console.firebase.google.com → projeto **licaojovem-iasd**

## ✅ Já feito

| Item | Status | Como foi verificado |
|---|---|---|
| Provedor Google habilitado | ✅ | `accounts:createAuthUri` respondeu com `authUri` válido |
| `licaojovem-iasd.pages.dev` autorizado | ✅ | consta na lista de `authorizedDomains` |
| Config do SDK no `index.html` | ✅ | `firebaseAuthReady: true`, app inicializado |
| SDK Firebase carregando | ✅ | v10.12.2 ativo, sem erro de console |
| Funções de auth | ✅ | login, logout, sync, merge — todas implementadas |

Domínios autorizados confirmados no projeto:

```
localhost
licaojovem-iasd.firebaseapp.com
licaojovem-iasd.web.app
licaojovem-iasd.pages.dev
```

---

## ⚠️ Falta fazer — fechar o banco de dados

Único passo pendente, e o mais importante.

Hoje o Realtime Database está **aberto**: qualquer pessoa com a URL lê e apaga o
progresso de todos os usuários. Testado com requisição sem autenticação nenhuma —
respondeu `HTTP 200`.

`Realtime Database` → aba **Regras** → substituir tudo por:

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
      ".read": "auth != null",
      "$semanaId": {
        "$uid": {
          ".write": "auth != null && auth.uid == $uid",
          ".validate": "newData.hasChildren(['nome','diasConcluidos','notaMedia','pontos']) && newData.child('diasConcluidos').val() >= 0 && newData.child('diasConcluidos').val() <= 7 && newData.child('notaMedia').val() >= 0 && newData.child('notaMedia').val() <= 100 && newData.child('nome').isString() && newData.child('nome').val().length <= 40 && newData.child('pontos').val() >= 0 && newData.child('pontos').val() <= 100"
        }
      }
    },
    "ranking_trimestre": {
      ".read": "auth != null",
      "$trimestreId": {
        "$uid": {
          ".write": "auth != null && auth.uid == $uid",
          ".validate": "newData.hasChildren(['nome','diasConcluidos','diasElapsados','notaMedia','pontos']) && newData.child('diasConcluidos').val() >= 0 && newData.child('diasConcluidos').val() <= newData.child('diasElapsados').val() && newData.child('notaMedia').val() >= 0 && newData.child('notaMedia').val() <= 100 && newData.child('nome').isString() && newData.child('nome').val().length <= 40 && newData.child('pontos').val() >= 0 && newData.child('pontos').val() <= 100"
        }
      }
    }
  }
}
```

→ **Publicar**

Cada pessoa passa a ler e escrever só o próprio progresso.

**Efeito colateral esperado:** quem não estiver logado deixa de gravar na nuvem.
Não há perda — sem login o progresso continua salvo no navegador (localStorage),
como já funciona hoje. O código já trata isso: só envia para a nuvem quando há
usuário logado.

---

## Como testar o login

1. Abrir o site → aba **Conta** → **Entrar com Google**
2. Esperado: popup do Google → escolher a conta → o botão vira **Sair da conta**,
   aparece "Conectado como ..." e o botão **Sincronizar agora**
3. No console (F12): `✅ Logado como ...`

Se algo falhar, o site mostra um alerta com o motivo. Os mais comuns:

| Erro | Causa | Solução |
|---|---|---|
| `auth/unauthorized-domain` | domínio fora da lista | Authentication → Settings → Authorized domains |
| `auth/operation-not-allowed` | provedor Google desativado | Authentication → Sign-in method → Google |
| `PERMISSION_DENIED` ao salvar | regras aplicadas mas usuário deslogado | comportamento esperado — basta entrar |

---

## O que muda para quem já usa o site

- **Sem login:** nada muda. Progresso no navegador, no mesmo dispositivo.
- **Ao entrar pela primeira vez:** o progresso daquele navegador sobe para a conta.
  Nada é apagado — em conflito entre nuvem e local, **o local prevalece**.
- **Depois:** o progresso acompanha a conta, sincronizando celular ↔ computador.

Os dados antigos sob IDs anônimos (`anonimo-1234...`) continuam no banco, órfãos.
Dá para apagar depois que todo mundo migrar.

---

## O que sincroniza

**Segue a conta, igual em todo aparelho:** progresso das lições, nome, metas,
favoritos, marcações na Bíblia, plano bíblico ativo e seu progresso, datas de
início, logs de atividade e tempo.

**Segue a conta, mas separado por tipo de aparelho:** claro/escuro, tema de
design, tamanho da fonte e modo de leitura da Bíblia.

Ou seja: o que você ajusta no celular vale para os seus celulares, e o que
ajusta no computador vale para os computadores. Trocar o tema no celular à
noite não mexe no monitor do trabalho, mas um celular novo já entra com as
suas preferências de celular.

O tipo é detectado por `tipoDeAparelho()`, que combina o user agent com a
presença de toque — tablets contam como celular, incluindo iPad recente, que
se identifica como Mac.

**Nunca sobe:** o cache `official-*` (conteúdo oficial baixado, regenerável,
passa de 300 KB por usuário) e o controle interno `prefs-aparelho-ts`.

### Regra de conflito

| Tipo de dado | Regra | Motivo |
|---|---|---|
| Progresso, nome, metas | o do aparelho em uso vence | não perder o que acabou de fazer |
| Favoritos, marcações | união dos dois | nada se perde de nenhum lado |
| Aparência | a mudança mais recente vence | trocou o tema no outro celular, este acompanha |

---

## Ligar os comentários — passo único

Desde 15/09 os administradores são definidos **por e-mail, dentro das regras**.
Isso eliminou a parte chata: você não precisa mais copiar uid nem montar a
árvore `config` campo a campo no console.

Como funciona: ao entrar no app, ele tenta se cadastrar em `config/admins`.
Quem não tem o e-mail autorizado leva uma recusa do próprio banco. Quem tem,
passa a ver o cartão **Administração** na aba Conta, com a chave que liga e
desliga os comentários — sem voltar ao console nunca mais.

**O que fazer, uma vez só:**

1. `Realtime Database` → aba **Regras** → apagar tudo → colar o bloco abaixo → **Publicar**
2. Abrir o app e entrar com o Google
3. Aba **Conta** → cartão **Administração** → **Ligar**

Nada de criar nós na mão. Nada de uid.

> Para incluir mais alguém depois, é só acrescentar o e-mail na linha dos
> admins e publicar de novo.

---

## As regras (substituem as anteriores)

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
      ".read": "auth != null",
      "$semanaId": {
        "$uid": {
          ".write": "auth != null && auth.uid == $uid",
          ".validate": "newData.hasChildren(['nome','diasConcluidos','notaMedia','pontos']) && newData.child('diasConcluidos').val() >= 0 && newData.child('diasConcluidos').val() <= 7 && newData.child('notaMedia').val() >= 0 && newData.child('notaMedia').val() <= 100 && newData.child('nome').isString() && newData.child('nome').val().length <= 40 && newData.child('pontos').val() >= 0 && newData.child('pontos').val() <= 100"
        }
      }
    },
    "ranking_trimestre": {
      ".read": "auth != null",
      "$trimestreId": {
        "$uid": {
          ".write": "auth != null && auth.uid == $uid",
          ".validate": "newData.hasChildren(['nome','diasConcluidos','diasElapsados','notaMedia','pontos']) && newData.child('diasConcluidos').val() >= 0 && newData.child('diasConcluidos').val() <= newData.child('diasElapsados').val() && newData.child('notaMedia').val() >= 0 && newData.child('notaMedia').val() <= 100 && newData.child('nome').isString() && newData.child('nome').val().length <= 40 && newData.child('pontos').val() >= 0 && newData.child('pontos').val() <= 100"
        }
      }
    },
    "config": {
      ".read": "auth != null",
      "admins": {
        "$uid": {
          ".write": "auth != null && auth.uid == $uid && auth.token.email != null && (auth.token.email.toLowerCase() == 'willian932@gmail.com' || auth.token.email.toLowerCase() == 'josiaslgomes.jg@gmail.com')"
        }
      },
      "comentarios": { ".write": "auth != null && root.child('config/admins/'+auth.uid).exists()" },
      "banidos":     { ".write": "auth != null && root.child('config/admins/'+auth.uid).exists()" }
    },
    "comentarios": {
      ".read": "auth != null",
      "$licao": { "$dia": { "$id": {
        ".write": "auth != null && ( (!data.exists() && newData.child('uid').val() == auth.uid && root.child('config/comentarios/ativo').val() == true && !root.child('config/banidos/'+auth.uid).exists()) || (data.exists() && !newData.exists() && (data.child('uid').val() == auth.uid || root.child('config/admins/'+auth.uid).exists())) )",
        ".validate": "newData.hasChildren(['uid','nome','texto','criadoEm']) && newData.child('texto').isString() && newData.child('texto').val().length <= 500 && newData.child('uid').val() == auth.uid"
      } } }
    },
    "curtidas": {
      ".read": "auth != null",
      "$licao": { "$dia": { "$uid": {
        ".write": "auth != null && auth.uid == $uid && (!newData.exists() || !root.child('config/banidos/'+auth.uid).exists())",
        ".validate": "newData.hasChildren(['nome','em']) && newData.child('nome').isString() && newData.child('nome').val().length <= 40 && newData.child('em').isNumber()"
      } } }
    },
    "curtidas_cmt": {
      ".read": "auth != null",
      "$licao": { "$dia": { "$cmt": { "$uid": {
        ".write": "auth != null && auth.uid == $uid && (!newData.exists() || !root.child('config/banidos/'+auth.uid).exists())",
        ".validate": "newData.val() == true"
      } } } }
    },
    "stats": {
      ".read": "auth != null && root.child('config/admins/'+auth.uid).exists()",
      "$licao": { "$dia": { "$uid": {
        ".write": "auth != null && auth.uid == $uid",
        ".validate": "newData.hasChildren(['em']) && newData.child('em').isNumber() && (!newData.hasChild('q') || (newData.child('q').val() >= 0 && newData.child('q').val() <= 10))"
      } } }
    },
    "visitas": {
      ".read": "auth != null && root.child('config/admins/'+auth.uid).exists()",
      "$dia": { "$uid": {
        ".write": "auth != null && auth.uid == $uid",
        ".validate": "newData.hasChildren(['em']) && newData.child('em').isNumber() && (!newData.hasChild('n') || newData.child('n').isBoolean())"
      } }
    }
  }
}
```

### Visitas (desde 23/09)

| Regra | Efeito |
|---|---|
| `visitas/{AAAA-MM-DD}/{uid}` | cada pessoa grava só a **própria** visita, uma vez por dia |
| `.read` só para admin | quem estuda nunca vê o número; é painel de quem cuida da turma |
| `n: true` | marca o primeiro acesso da pessoa, para contar quem chegou agora |

O app grava a visita logo depois do login e guarda uma marca no aparelho, então
o resto do dia nem toca no banco. Quem não entra com o Google não é contado.

### Curtidas (desde 18/09)

| Regra | Efeito |
|---|---|
| `curtidas/{licao}/{dia}/{uid}` | cada um só grava e apaga a **própria** curtida do dia |
| `curtidas_cmt/.../{cmt}/{uid}` | idem para curtir um comentário |
| banido não curte | mas ainda consegue **tirar** a curtida que já tinha |
| leitura só logado | igual aos comentários |

### Acompanhamento — só para admin (desde 19/09)

`stats/{licao}/{dia}/{uid}` = `{c:true, q:<acertos 0-10>, em:<timestamp>}`

Gravado sozinho quando a pessoa conclui o dia ou termina o quiz. **Só admin
lê**: a regra exige `config/admins/{uid}`. Quem estuda nunca vê esse número.

Aparece em dois lugares, ambos só para admin: a linha embaixo da barra de
curtir, em cada dia, e a tabela da semana no cartão **Administração** da aba
Conta.

Apagar registro de teste tem que ser no caminho exato
`stats/{licao}/{dia}/{uid}` — nenhuma regra permite apagar um nó acima disso.

O que cada pedaço garante:

| Regra | Efeito |
|---|---|
| `comentarios` só lê com `auth != null` | quem não entrou não vê nome nem foto de ninguém |
| escrita exige `uid == auth.uid` | ninguém posta no nome de outro |
| exige `config/comentarios/ativo == true` | a chave geral desliga tudo de uma vez |
| bloqueia quem está em `banidos` | banir é marcar um registro, não caçar comentários |
| apagar: autor **ou** admin | você remove qualquer coisa; cada um remove o seu |
| editar não é permitido | `data.exists() && newData.exists()` não passa em nenhum caso |
| `admins` com `".write": false` | ninguém se promove a admin pelo app |
| `texto` até 500 caracteres | limite garantido no banco, não só na tela |

### Depois de publicar as regras

Ainda em `Realtime Database`, crie os dois registros (aba Dados, botão +):

```
config/admins/SEU_UID     →  true
config/comentarios/ativo  →  false
```

Seu `uid` aparece na aba **Conta** do app, embaixo de "Conectado como".

Deixe `ativo` em `false` até querer abrir para todo mundo. Com ele desligado, o
app mostra "Os comentários estão desligados no momento" e ninguém consegue postar
— nem você.

---

## Onde está cada coisa no código

| O quê | Local |
|---|---|
| SDK + `firebaseConfig` | `index.html` linhas 9–32 |
| `getUserId()` / `getAuthToken()` | bloco "IDENTIDADE DO USUARIO" |
| `salvarNoFirebase` / `lerDoFirebase` | mandam `?auth=<token>` quando logado |
| `mesclarProgressoDaNuvem()` | merge sem perda, local vence |
| `initFirebaseAuth()` | `onAuthStateChanged` + retorno do redirect |
| `loginWithGoogle()` | popup, com fallback para redirect no celular |
| `updateAuthUI()` | chamado no fim de `renderConta()` |
