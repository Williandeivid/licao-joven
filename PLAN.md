# 📋 Plano de Desenvolvimento - Lições Jovens App

## 🎯 Objetivo Final
Criar app educativo completo para Lições da Escola Sabatina Jovem com:
- 13 lições do Q3/2026 (tema: Resgate)
- 7 dias por lição (Dom-Sab)
- Quiz interativo (10 MC + 3 V/F por dia)
- Dashboard gamificado com XP, badges, série
- Bíblia integrada com busca por versículos
- Calendário de progresso mensal
- Dark mode + responsivo

---

## 📊 Fases de Desenvolvimento

### ✅ FASE 1: Estrutura Base (CONCLUÍDA)
**Status:** 100% ✓

- [x] HTML5 estrutura com 4 abas (Home, Lições, Bíblia, Config)
- [x] CSS3 com design premium (gradientes, cards, animações)
- [x] Navegação bottom com SVG icons monocromáticos
- [x] Dark mode funcional (toggle + localStorage)
- [x] API Bíblia integrada (Scripture.api.bible - NVI)
- [x] JSON estruturado para Lição 4 (7 dias completos)

---

### ⏳ FASE 2: Integração de Dados (PRÓXIMO)
**Estimado:** 2-3 horas

**O que fazer:**
- [ ] Integrar `licao-4.json` no `app.html`
- [ ] Renderizar todos os 7 dias dinamicamente
- [ ] Implementar quiz interativo:
  - [ ] Click em opção = desabilita e mostra correta
  - [ ] Marca resposta correta em verde
  - [ ] Marca resposta errada em vermelho
  - [ ] Contador de tempo em MM:SS
- [ ] Gabarito toggle "Ver/Ocultar"
- [ ] Score final: X/13 (10 MC + 3 V/F)
- [ ] Porcentagem: 85%

**Files:**
- `app.html` — modifica <script> para carregar JSON
- `licao-4.json` — usar conforme estrutura

---

### 🎮 FASE 3: Dashboard Gamificado
**Estimado:** 4-5 horas

**Nova aba: DASH (antes de CONFIG)**

**Elementos:**

#### 3.1 — Progresso Semanal
```
🏆 SEMANA 1 (18-24 de julho)
├─ Nível: 🟢 DEDICADO (85%+)
├─ XP Semanal: 340/500 (68%)
├─ Série: 3️⃣ dias seguidos 🔥
├─ Badge: "Série de Ouro" ✨
└─ Tempo total: 2h 15min
```

#### 3.2 — Calendário Interativo
**Semanal (padrão):**
```
📅 JULHO 2026
[D] [S] [T] [Q] [Q] [S] [S]
           1   2
3   4  [5] [6] 7   8   9
    ↓18m  ↓20m
```

**Mensal (expandido com ➕):**
```
JULHO 2026
D  S  T  Q  Q  S  S
      1  2  3  4  5
6  7 [8] 9 10 11 12
   ↓15m
```

Verde = dia estudado com minutos  
Normal = dia não estudado

#### 3.3 — Badges & Achievements
- [ ] "Série de Ouro" (3+ dias seguidos)
- [ ] "Madrugador" (estuda antes 6h)
- [ ] "Dedicado" (85%+ semana)
- [ ] "Trimestre Completo" (100% de 13)
- [ ] Mais 3 customizadas

#### 3.4 — Sistema de XP
- [ ] 50-200 XP por dia (proporcional ao tempo + acertos)
- [ ] Total trimestral: até 2600 XP
- [ ] Nível 1-5: Iniciante → Mestre

---

### 📖 FASE 4: Bíblia Completa
**Estimado:** 3 horas

**Aba Bíblia com 3 passos:**

1. **Configuração (em cima):**
   - [ ] Toggle: "Tabela Periódica" vs "Lista"
   - [ ] Padrão: Lista (A-Z dos 66 livros)

2. **Passo 1 - Selecionar Livro:**
   - [ ] Mostrar 66 livros em lista/tabela
   - [ ] Click = vai para Passo 2

3. **Passo 2 - Selecionar Capítulo:**
   - [ ] Input numérico ou dropdown
   - [ ] Valida capítulo máximo do livro
   - [ ] Click = vai para Passo 3

4. **Passo 3 - Visualizar Versículos:**
   - [ ] Carrega via API Scripture
   - [ ] Exibe texto NVI completo
   - [ ] Searchable por número de versículo

**Futura integração:**
- [ ] Click em referência (João 15:1) = abre versículo automaticamente

---

### 📚 FASE 5: Lições 2-13
**Estimado:** 8-10 horas (1h30m por lição)

**Padrão para cada:**
1. Ler PDF visualmente
2. Parafrasear 7 dias mantendo estrutura
3. Criar 10 MC (4F+2M+2D+2T) + 3 V/F
4. Validar gabarito
5. Estruturar em JSON
6. Integrar ao app

**Lições pendentes:**
- [ ] Lição 1: Confronto Decisivo
- [ ] Lição 2: A Última Ceia
- [ ] Lição 3: Não é Adeus
- [ ] Lição 5: Os Últimos Ensinhos
- [ ] Lição 6: A Oração de Cristo
- [ ] Lição 7: O Jardim do Getsêmani
- [ ] Lição 8: Remorso e Arrependimento
- [ ] Lição 9: Crucificado O Rei de Vocês?
- [ ] Lição 10: O Rei na Cruz
- [ ] Lição 11: Morte e Sepultamento
- [ ] Lição 12: Ele Ressuscitou!
- [ ] Lição 13: O Fim da História

---

## 📋 Checklist Final (Beta → Versão 1.0)

### Funcionalidades Essenciais
- [ ] Todos 7 dias de Lição 4 renderizando
- [ ] Quiz completo com timer e score
- [ ] Pills mostrando pontuação (85%)
- [ ] Dark mode funcionando
- [ ] Bíblia com seleção livro/capítulo
- [ ] Dashboard com XP e série

### Dados
- [ ] Lição 4 completa ✓
- [ ] Lições 2-13 estruturadas
- [ ] 10 MC + 3 V/F em cada dia
- [ ] Gabaritos validados

### Design
- [ ] Cores principais implementadas
- [ ] Tipografia correta
- [ ] Ícones SVG em todos lugares
- [ ] Responsivo (mobile-first)
- [ ] Sem bugs visuais

### Testes
- [ ] Quiz funciona sem travamentos
- [ ] Timer preciso
- [ ] Score calcula corretamente
- [ ] Dark mode sem problemas
- [ ] Bíblia API responde
- [ ] LocalStorage salva progresso

---

## 🎯 Roadmap Visual

```
HOJE (20/07)          30/07          10/08          25/08          10/09
   │                    │              │               │               │
   ├─ Fase 1 ✓          │              │               │               │
   │  Base ready         │              │               │               │
   │                     ├─ Fase 2 ───┤              │               │
   │                     │  Integration│              │               │
   │                     │             ├─ Fase 3 ────┤               │
   │                     │             │  Gamified    │               │
   │                     │             │              ├─ Fase 4 ─────┤
   │                     │             │              │  Bible ready  │
   │                     │             │              │               │
   │                     │             │              │              ├─ Fase 5 ──→ LIVE
   │                     │             │              │              │  13 Lições
   │                     │             │              │              │  Done
   └─────────────────────┴─────────────┴──────────────┴──────────────┴────────────
   
   0%                   30%           50%            70%            90%   100%
```

---

## 🔧 Notas Técnicas

### Regras Implementadas
- ✅ Respostas de quiz: SEMPRE proporcionais (não A,A,A,A...)
- ✅ Estrutura cada dia: Resumo → Conteúdo → Reflexivas → Quiz → V/F
- ✅ Pills: Ontem/Passado=Roxo, Hoje=Verde, Próximos=Cinza
- ✅ Bíblia: API Scripture.api.bible com bookIdMap de 66 livros
- ✅ Dark mode: CSS variables com light icons em config

### Files Principais
- `app.html` — app completo (30KB)
- `licao-4.json` — dados L4 (33KB)
- `README.md` — documentação
- `PLAN.md` — este plano

---

## 📞 Status Report

**Início:** 20/07/2026  
**Versão Atual:** 0.3 Beta  
**Progresso:** 30% (Fase 1 ✓, Fase 2 começando)  
**Próximo Milestone:** Fase 2 completa (05/08)  
**Go Live:** ~10/09/2026  

---

**Desenvolvido para:** Escola Sabatina Jovem - Lições Jovens Q3/2026  
**Tema:** Resgate - As cenas finais da vida de Cristo
