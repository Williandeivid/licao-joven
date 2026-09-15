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
          ".write": "auth != null && auth.uid === $uid",
          ".validate": "newData.hasChildren(['nome','diasConcluidos','notaMedia','pontos']) && newData.child('diasConcluidos').val() >= 0 && newData.child('diasConcluidos').val() <= 7 && newData.child('notaMedia').val() >= 0 && newData.child('notaMedia').val() <= 100 && newData.child('nome').isString() && newData.child('nome').val().length <= 40 && newData.child('pontos').val() >= 0 && newData.child('pontos').val() <= 100"
        }
      }
    },
    "ranking_trimestre": {
      ".read": "auth != null",
      "$trimestreId": {
        "$uid": {
          ".write": "auth != null && auth.uid === $uid",
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

## Regras com comentários (substituem as anteriores)

Quando for ligar os comentários, `Realtime Database → Regras` recebe isto no lugar
do que está publicado hoje:

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
          ".write": "auth != null && auth.uid === $uid",
          ".validate": "newData.hasChildren(['nome','diasConcluidos','notaMedia','pontos']) && newData.child('diasConcluidos').val() >= 0 && newData.child('diasConcluidos').val() <= 7 && newData.child('notaMedia').val() >= 0 && newData.child('notaMedia').val() <= 100 && newData.child('nome').isString() && newData.child('nome').val().length <= 40 && newData.child('pontos').val() >= 0 && newData.child('pontos').val() <= 100"
        }
      }
    },
    "ranking_trimestre": {
      ".read": "auth != null",
      "$trimestreId": {
        "$uid": {
          ".write": "auth != null && auth.uid === $uid",
          ".validate": "newData.hasChildren(['nome','diasConcluidos','diasElapsados','notaMedia','pontos']) && newData.child('diasConcluidos').val() >= 0 && newData.child('diasConcluidos').val() <= newData.child('diasElapsados').val() && newData.child('notaMedia').val() >= 0 && newData.child('notaMedia').val() <= 100 && newData.child('nome').isString() && newData.child('nome').val().length <= 40 && newData.child('pontos').val() >= 0 && newData.child('pontos').val() <= 100"
        }
      }
    },
    "config": {
      ".read": "auth != null",
      "comentarios": { ".write": "root.child('config/admins/'+auth.uid).exists()" },
      "banidos":     { ".write": "root.child('config/admins/'+auth.uid).exists()" },
      "admins":      { ".write": false }
    },
    "comentarios": {
      ".read": "auth != null",
      "$licao": { "$dia": { "$id": {
        ".write": "auth != null && ( (!data.exists() && newData.child('uid').val() == auth.uid && root.child('config/comentarios/ativo').val() == true && !root.child('config/banidos/'+auth.uid).exists()) || (data.exists() && !newData.exists() && (data.child('uid').val() == auth.uid || root.child('config/admins/'+auth.uid).exists())) )",
        ".validate": "newData.hasChildren(['uid','nome','texto','criadoEm']) && newData.child('texto').isString() && newData.child('texto').val().length <= 500 && newData.child('uid').val() == auth.uid"
      } } }
    }
  }
}
```

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
