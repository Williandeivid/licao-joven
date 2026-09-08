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
