// Licao 1 do 4o trimestre 2026 (id 14) - "O Criador fala" - Genesis 3
// Cada pergunta traz a resposta CERTA separada das erradas; o montador
// (q4-montar.js) sorteia a posicao em rodizio e calcula a letra do gabarito.
module.exports = {
  dom: {
    title: 'Comunicação no Éden',
    centraltexts: ['Gênesis 1:27', 'Gênesis 2:18', 'Gênesis 3:8'],
    keyideas: 'Criados à imagem de Deus · Encontros diários no Éden · O pecado cortou o contato face a face',
    summary: 'Deus criou o ser humano para uma comunhão direta com Ele e com o próximo. O pecado interrompeu essa conversa face a face, e o Senhor passou a falar por meio de profetas.',
    body: [
      'Gênesis 1 e 2 mostram que os seres humanos foram feitos para um relacionamento direto com o Criador e uns com os outros. Entre todas as criaturas, só eles foram feitos “à imagem de Deus” (Gn 1:27) — criados para amar e para andar em comunhão com o Senhor. Ao formar Eva porque “não é bom que o homem esteja só” (Gn 2:18), Deus estabeleceu a família como a primeira instituição humana, que se tornaria um dos alvos preferidos de Satanás.',
      'No Éden, a comunicação era diária: Adão e Eva se encontravam com o Criador “quando soprava o vento suave da tarde” (Gn 3:8). O sábado, separado desde a criação (Gn 2:2, 3; Êx 20:8-11), era um tempo ainda mais especial dessa comunhão, em que nossos primeiros pais experimentavam de modo único o amor e o cuidado de Deus.',
      'Com a queda, tudo mudou: o solo passou a produzir espinhos, o trabalho ficou pesado e a morte entrou na história (Gn 3:18, 19). A perda mais profunda foi a da conversa face a face com Deus. Para restaurar essa comunicação, o Senhor passou a falar por meio de profetas, Seus mensageiros — alguns de seus escritos foram preservados na Bíblia, outros não chegaram até nós.'
    ],
    reflect: [
      'Se você foi criado para conversar com Deus todos os dias, o que mudaria na sua rotina a partir de hoje?',
      'Por que você acha que Satanás mira justamente a família, a primeira instituição que Deus criou?',
      'Como o sábado pode ser, para você, um encontro marcado com Deus e não apenas um dia de regras?'
    ],
    quiz: [
      { diff: 'Fácil', text: 'Qual é o texto bíblico-base desta semana?', certa: 'Gênesis 3', erradas: ['Êxodo 20', 'Isaías 6', 'João 10'] },
      { diff: 'Fácil', text: 'Segundo Gênesis 1:27, o que distingue os seres humanos das outras criaturas?', certa: 'Foram feitos à imagem de Deus', erradas: ['Foram criados antes dos animais', 'Não precisam de descanso', 'Vivem para sempre'] },
      { diff: 'Média', text: 'Por que Deus criou Eva, segundo Gênesis 2:18?', certa: 'Porque não era bom que o homem estivesse só', erradas: ['Para dar nome aos animais', 'Para vigiar a árvore proibida', 'Para cultivar o jardim no lugar de Adão'] },
      { diff: 'Média', text: 'Qual foi a primeira instituição social humana, segundo a lição?', certa: 'A família', erradas: ['A igreja', 'O governo', 'A escola'] },
      { diff: 'Difícil', text: 'Em que momento do dia Adão e Eva se encontravam com o Criador (Gn 3:8)?', certa: 'Quando soprava o vento suave da tarde', erradas: ['Ao nascer do sol', 'À meia-noite', 'Somente uma vez por ano'] },
      { diff: 'Difícil', text: 'Qual foi a perda mais profunda causada pelo pecado, segundo a lição?', certa: 'A comunicação face a face com Deus', erradas: ['O jardim, no mesmo instante', 'A capacidade de falar', 'O sábado'] },
      { diff: 'Bíblica · Intermediária', text: 'Segundo Gênesis 3:18, o que o solo passou a produzir depois da queda?', certa: 'Espinhos e ervas daninhas', erradas: ['Somente frutos doces', 'Ouro e pedras preciosas', 'Nada mais'] },
      { diff: 'Bíblica · Intermediária', text: 'Quais textos a lição cita para mostrar o sábado separado desde a criação?', certa: 'Gn 2:2, 3 e Êx 20:8-11', erradas: ['Gn 12:1-3 e Êx 3:5', 'Sl 23:1 e Jo 3:16', 'Ap 14:7 e Mt 5:17'] },
      { diff: 'Bíblica · Difícil', text: 'Segundo Gênesis 3:19, qual seria o destino do ser humano depois da queda?', certa: 'Voltar ao pó', erradas: ['Viver para sempre no Éden', 'Tornar-se como os anjos', 'Governar a serpente'] },
      { diff: 'Bíblica · Difícil', text: 'Como Deus passou a restaurar a comunicação com a humanidade, segundo a lição?', certa: 'Por meio de profetas, Seus mensageiros', erradas: ['Apenas por meio de sonhos', 'Somente pela natureza', 'Deixou de Se comunicar'] }
    ],
    tf: [
      ['Segundo Gênesis 1:27, apenas os seres humanos foram criados à imagem de Deus.', 'V'],
      ['Adão e Eva só se encontravam com Deus uma vez por ano.', 'F'],
      ['O sábado foi separado como parte do ato criador de Deus.', 'V'],
      ['Todas as mensagens dos profetas foram preservadas na Bíblia.', 'F']
    ]
  },

  seg: {
    title: 'Escondendo-se de Deus',
    centraltexts: ['Gênesis 3:1-8', '1 João 4:8', 'Hebreus 4:13'],
    keyideas: 'Amor exige liberdade · O engano da serpente · A culpa nos faz fugir',
    summary: 'Por ser amor, Deus criou pessoas livres para escolher. Enganados por Satanás, Adão e Eva desobedeceram, perderam o manto de luz e tentaram se esconder — a culpa sempre nos empurra para longe Dele.',
    body: [
      'Deus é amor (1Jo 4:8), e amor de verdade não se impõe: por isso Adão e Eva foram criados livres, capazes de obedecer ou de desobedecer. A própria proibição da árvore do conhecimento do bem e do mal (Gn 2:15-17) mostra isso — ninguém adverte quem não tem escolha. Ellen G. White resume: sem liberdade de opção, a obediência deles “não teria sido voluntária, mas forçada” (Patriarcas e Profetas, p. 24, 25).',
      'Em Gênesis 3, a serpente usou palavras, emoções e apelos atraentes. Eva viu que a árvore era “boa para se comer”, “agradável aos olhos” e “desejável para dar entendimento” (Gn 3:6), e a promessa de serem “como Deus” (Gn 3:5) pareceu irresistível. O que Satanás escondeu foram as consequências.',
      'Assim que desobedeceram, os olhos deles se abriram e perceberam que estavam nus (Gn 3:7): o manto de luz que refletia a glória divina (Sl 104:1, 2) havia desaparecido. Então tentaram se esconder do Criador — como se fosse possível (Jr 23:24; Hb 4:13). É o que o pecado faz: enche de culpa e nos leva a fugir justamente de quem pode nos restaurar.'
    ],
    reflect: [
      'Por que Adão e Eva tentaram se esconder de Deus depois de desobedecer? Compare Gênesis 3:1-8 com Jeremias 23:24 e Hebreus 4:13.',
      'Que “apelos atraentes” a tentação usa hoje para parecer irresistível na sua vida?',
      'Quando você erra, sua tendência é correr para Deus ou se esconder Dele? Por quê?'
    ],
    quiz: [
      { diff: 'Fácil', text: 'Qual texto a lição usa para afirmar que Deus é amor?', certa: '1 João 4:8', erradas: ['João 3:16', 'Romanos 8:28', 'Salmo 23:1'] },
      { diff: 'Fácil', text: 'Por que Deus não criou os seres humanos como “robôs”?', certa: 'Porque o amor verdadeiro exige liberdade de escolha', erradas: ['Porque robôs não conseguem trabalhar', 'Porque queria que eles errassem', 'Porque não havia tempo na criação'] },
      { diff: 'Média', text: 'De qual árvore Deus proibiu Adão e Eva de comer?', certa: 'Da árvore do conhecimento do bem e do mal', erradas: ['Da árvore da vida', 'Da oliveira do jardim', 'Da figueira'] },
      { diff: 'Média', text: 'Segundo Ellen G. White, como seria a obediência deles sem liberdade de opção?', certa: 'Forçada, e não voluntária', erradas: ['Perfeita', 'Mais fácil', 'Mais duradoura'] },
      { diff: 'Difícil', text: 'Qual promessa de Satanás soou irresistível para Eva (Gn 3:5)?', certa: 'Que seriam como Deus, conhecedores do bem e do mal', erradas: ['Que nunca envelheceriam', 'Que governariam os anjos', 'Que teriam riquezas'] },
      { diff: 'Difícil', text: 'O que Adão e Eva perderam logo depois de desobedecer, segundo a lição?', certa: 'O manto de luz e glória que Deus lhes dera', erradas: ['A capacidade de falar', 'A memória do jardim', 'O direito de trabalhar'] },
      { diff: 'Bíblica · Intermediária', text: 'Segundo Gênesis 3:6, como Eva viu a árvore?', certa: 'Boa para comer, agradável aos olhos e desejável para dar entendimento', erradas: ['Assustadora e escura', 'Pequena e sem frutos', 'Igual a todas as outras'] },
      { diff: 'Bíblica · Intermediária', text: 'Qual texto a lição cita sobre o manto de luz que refletia a glória de Deus?', certa: 'Salmo 104:1, 2', erradas: ['Isaías 53:5', 'Mateus 6:33', 'Gênesis 12:1'] },
      { diff: 'Bíblica · Difícil', text: 'Quais textos mostram que é impossível se esconder de Deus?', certa: 'Jeremias 23:24 e Hebreus 4:13', erradas: ['Provérbios 3:5 e Filipenses 4:13', 'Gênesis 1:1 e João 1:1', 'Salmo 1:1 e Mateus 5:3'] },
      { diff: 'Bíblica · Difícil', text: 'Qual livro de Ellen G. White a lição cita sobre a liberdade dos primeiros pais?', certa: 'Patriarcas e Profetas', erradas: ['O Grande Conflito', 'Caminho a Cristo', 'Educação'] }
    ],
    tf: [
      ['A proibição de uma árvore mostra que Adão e Eva eram livres para desobedecer.', 'V'],
      ['Satanás contou a Eva todas as consequências da desobediência.', 'F'],
      ['Depois de pecar, Adão e Eva perceberam que estavam nus.', 'V'],
      ['A culpa do pecado nos aproxima naturalmente de Deus.', 'F']
    ]
  },

  ter: {
    title: 'Deus busca a humanidade',
    centraltexts: ['Gênesis 3:9-13', 'Lucas 22:61', 'Romanos 7:15-25'],
    keyideas: '“Onde você está?” · A culpa jogada no outro · Deus nunca desiste',
    summary: 'Depois da queda, foi Deus quem tomou a iniciativa: “Onde você está?”. Enquanto Adão e Eva jogavam a culpa um no outro, o Senhor continuava a buscá-los — e continua a nos buscar para nos levar a Jesus.',
    body: [
      'Em Gênesis 3:9 e 10, é Deus quem vai atrás de Seus filhos caídos com a pergunta “Onde você está?”. Ele sabia exatamente onde estavam; a pergunta era um convite para retomar o diálogo. O verbo hebraico qara, traduzido como “chamar”, aparece muitas vezes para descrever o chamado de Deus ao Seu povo. E Ele continua assim: depois que Pedro O negou três vezes, Jesus “voltou-Se e fixou os olhos” nele (Lc 22:61) — sem dizer nada, buscava o amigo.',
      'O pecado também abalou o relacionamento do casal. Adão culpou Eva e, indiretamente, o próprio Deus: “A mulher que me deste para estar comigo, ela me deu da árvore” (Gn 3:12). Eva culpou a serpente (Gn 3:13). Ninguém assumiu a própria culpa — e pouca coisa mudou em seis mil anos.',
      'Paulo descreve essa luta com honestidade: “não faço o que prefiro, e sim o que detesto” (Rm 7:15). A única saída é a libertação “por Jesus Cristo, nosso Senhor” (Rm 7:25). Por isso Deus continua a nos buscar, como o pai da parábola do filho pródigo (Lc 15:11-32): para nos levar a Jesus, o único que pode nos restaurar à Sua imagem.'
    ],
    reflect: [
      'De que maneiras Deus já foi atrás de você para chamar sua atenção e trazê-lo de volta?',
      'Por que é tão mais fácil culpar alguém do que assumir o próprio erro?',
      'Como a parábola do filho pródigo (Lc 15:11-32) ajuda a entender a pergunta de Deus em Gênesis 3:9?'
    ],
    quiz: [
      { diff: 'Fácil', text: 'Que pergunta Deus fez a Adão em Gênesis 3:9?', certa: '“Onde você está?”', erradas: ['“Por que você fez isso?”', '“Quem é você?”', '“O que você comeu?”'] },
      { diff: 'Fácil', text: 'Quem tomou a iniciativa de restabelecer a comunicação depois da queda?', certa: 'Deus', erradas: ['Adão', 'Eva', 'A serpente'] },
      { diff: 'Média', text: 'Qual verbo hebraico, traduzido como “chamar”, a lição destaca?', certa: 'Qara', erradas: ['Shalom', 'Hesed', 'Torah'] },
      { diff: 'Média', text: 'A quem Adão atribuiu a culpa pelo que fez?', certa: 'À mulher e, indiretamente, a Deus', erradas: ['À serpente', 'A si mesmo', 'Aos anjos'] },
      { diff: 'Difícil', text: 'O que Jesus fez depois que Pedro O negou três vezes (Lc 22:61)?', certa: 'Voltou-Se e fixou os olhos nele', erradas: ['Mandou Pedro embora', 'Fingiu não ter visto', 'Pediu que o prendessem'] },
      { diff: 'Difícil', text: 'Por que a pergunta de Deus a Adão é chamada de retórica?', certa: 'Porque Deus já sabia onde eles estavam e o que tinham feito', erradas: ['Porque Deus não sabia a resposta', 'Porque Adão não podia responder', 'Porque era uma ordem disfarçada'] },
      { diff: 'Bíblica · Intermediária', text: 'Segundo Gênesis 3:13, a quem Eva culpou?', certa: 'À serpente', erradas: ['A Adão', 'A Deus', 'A si mesma'] },
      { diff: 'Bíblica · Intermediária', text: 'Segundo Romanos 7:15, qual é a angústia descrita por Paulo?', certa: 'Fazer o que detesta em vez do que prefere', erradas: ['Não ter recursos para viajar', 'Não ser ouvido pelas igrejas', 'Não conhecer a lei'] },
      { diff: 'Bíblica · Difícil', text: 'Segundo Romanos 7:25, qual é a nossa esperança de libertação?', certa: 'Jesus Cristo, nosso Senhor', erradas: ['Nossos próprios esforços', 'A lei de Moisés', 'O passar do tempo'] },
      { diff: 'Bíblica · Difícil', text: 'Qual parábola a lição usa para entender Gênesis 3:9 e 10?', certa: 'O filho pródigo', erradas: ['O semeador', 'O bom samaritano', 'As dez virgens'] }
    ],
    tf: [
      ['Depois da queda, foi Adão quem procurou Deus primeiro.', 'F'],
      ['O verbo hebraico qara é usado com frequência para o chamado de Deus ao Seu povo.', 'V'],
      ['Adão e Eva assumiram imediatamente a própria culpa.', 'F'],
      ['Deus continua a nos buscar para nos conduzir a Jesus.', 'V']
    ]
  },

  qua: {
    title: 'Três vozes de Deus',
    centraltexts: ['Salmos 19:1-4', '2 Timóteo 3:16, 17', 'Hebreus 1:1, 2'],
    keyideas: 'A natureza · Os profetas e as Escrituras · A revelação suprema em Jesus',
    summary: 'Desde a queda, Deus nunca ficou em silêncio: fala pela natureza, pelos profetas e pelas Escrituras e, acima de tudo, em Jesus, a revelação mais completa do coração do Pai.',
    body: [
      'Desde a entrada do pecado, Deus nunca deixou a humanidade sem testemunho. A natureza fala: a ordem do Universo, a beleza da criação e a complexidade da vida apontam para um Criador sábio, poderoso e bondoso (Sl 19:1-4; Rm 1:19, 20).',
      'Ele também chamou homens e mulheres para transmitir Sua mensagem (Nm 12:6). Inspirados por Deus, eles trouxeram advertências, promessas, consolo e direção, e muito disso foi preservado nas Escrituras, que continuam sendo fonte segura de verdade e orientação para a vida (2Tm 3:16, 17).',
      'Acima de tudo, Deus Se revelou em Jesus. Cristo não apenas falou sobre Deus — Ele mostrou quem Deus é: “Quem vê a Mim vê o Pai” (Jo 14:9). Por isso, ouvir a voz do Bom Pastor e segui-Lo (Jo 10:27-30) é conhecer a revelação mais completa do coração do Pai (Hb 1:1, 2).'
    ],
    reflect: [
      'Em qual dessas vozes — natureza, Escrituras ou Jesus — você mais percebe Deus falando com você hoje?',
      'Se você fosse montar um mapa mental com a palavra “Comunicação” no centro, o que ligaria a ela depois desta semana?',
      'Por que a revelação de Deus em Jesus é chamada de “suprema”?'
    ],
    quiz: [
      { diff: 'Fácil', text: 'Segundo a lição, qual é a revelação mais plena de Deus?', certa: 'Jesus Cristo', erradas: ['A natureza', 'Os sonhos', 'A tradição da igreja'] },
      { diff: 'Fácil', text: 'Qual salmo mostra que os céus proclamam a glória de Deus?', certa: 'Salmo 19', erradas: ['Salmo 23', 'Salmo 51', 'Salmo 119'] },
      { diff: 'Média', text: 'Além da natureza, por meio de quem Deus transmitiu Sua mensagem?', certa: 'De homens e mulheres chamados como profetas', erradas: ['Somente de reis', 'Apenas de sacerdotes', 'De filósofos gregos'] },
      { diff: 'Média', text: 'Segundo 2 Timóteo 3:16, 17, para que serve a Escritura inspirada?', certa: 'Para ensinar, repreender, corrigir e educar na justiça', erradas: ['Apenas para contar histórias antigas', 'Para ser guardada sem ser lida', 'Para substituir a oração'] },
      { diff: 'Difícil', text: 'O que a lição afirma sobre Jesus e a revelação de Deus?', certa: 'Ele mostrou quem Deus é, e não apenas falou sobre Ele', erradas: ['Ele falou menos que os profetas', 'Ele revelou apenas a lei', 'Ele não revelou o Pai'] },
      { diff: 'Difícil', text: 'Qual texto de Romanos mostra que Deus Se revela pela criação?', certa: 'Romanos 1:19, 20', erradas: ['Romanos 3:23', 'Romanos 6:23', 'Romanos 12:1'] },
      { diff: 'Bíblica · Intermediária', text: 'O que Jesus afirma em João 14:9?', certa: '“Quem vê a Mim vê o Pai”', erradas: ['“Eu sou a videira”', '“Eu sou o pão da vida”', '“Está consumado”'] },
      { diff: 'Bíblica · Intermediária', text: 'Segundo Números 12:6, como Deus Se revelava aos profetas?', certa: 'Em visões e em sonhos', erradas: ['Somente por escrito', 'Por meio de sorteio', 'Apenas pela voz de anjos'] },
      { diff: 'Bíblica · Difícil', text: 'Segundo João 10:27, o que fazem as ovelhas de Jesus?', certa: 'Ouvem a Sua voz e O seguem', erradas: ['Fogem ao ouvir Sua voz', 'Ficam paradas no aprisco', 'Seguem qualquer voz'] },
      { diff: 'Bíblica · Difícil', text: 'Segundo Hebreus 1:1, 2, por meio de quem Deus falou “nestes últimos dias”?', certa: 'Pelo Filho', erradas: ['Pelos anjos', 'Pelos reis', 'Pelos juízes'] }
    ],
    tf: [
      ['Depois do pecado, Deus deixou a humanidade sem testemunho.', 'F'],
      ['A natureza é uma das formas pelas quais Deus continua a falar.', 'V'],
      ['Hebreus 1:1, 2 diz que Deus falou antigamente pelos profetas e agora pelo Filho.', 'V'],
      ['Segundo a lição, Jesus apenas falou sobre Deus, sem revelar quem Ele é.', 'F']
    ]
  },

  qui: {
    title: 'Deus ainda fala',
    centraltexts: ['Lucas 19:10', 'João 16:13', '2 Pedro 1:21'],
    keyideas: 'Profetas como porta-vozes · Jesus cumpre Gênesis 3:15 · O Espírito guia à verdade',
    summary: 'Apesar do pecado, Deus continua falando: pela criação, pelos profetas — muitos preservados na Bíblia —, de modo pleno em Jesus e, depois da ascensão, pelo Espírito Santo, que nos guia a toda a verdade.',
    body: [
      'Mesmo depois do pecado, Deus encontrou muitas formas de falar. A criação revela Suas obras e, ao mesmo tempo, as consequências da queda. Ele também escolheu profetas como porta-vozes — Noé, Abraão, Moisés, Daniel — para mostrar que não Se esqueceu de Seus filhos e continua ao lado deles.',
      'Nem todo profeta escreveu livro: Enoque, Natã, Hulda e João Batista, por exemplo, deixaram mensagens para tempos e lugares específicos. Mas muitas mensagens foram preservadas nas Escrituras para nós (2Tm 3:16, 17), e é nelas que aprendemos quem Deus é, quem somos, de onde viemos e para onde vamos.',
      'A forma mais plena de Deus falar é Jesus. Assim como buscou Adão e Eva, Cristo “veio buscar e salvar o perdido” (Lc 19:10) e cumpriu a promessa feita no Éden (Gn 3:15). Depois de Sua ascensão, o Espírito Santo continua a nos guiar “em toda a verdade” (Jo 16:13), inclusive por meio de mensagens dadas a pessoas escolhidas para o Seu povo (2Pe 1:21).'
    ],
    reflect: [
      'Jesus revela quem Deus é por meio de Seu amor e sacrifício. Como essa verdade fortalece sua fé?',
      'Por que Deus escolheria falar por meio de pessoas comuns, com defeitos, em vez de usar apenas anjos?',
      'Como você percebe o Espírito Santo guiando você “em toda a verdade” hoje?'
    ],
    quiz: [
      { diff: 'Fácil', text: 'Segundo Lucas 19:10, para que Cristo veio?', certa: 'Para buscar e salvar o perdido', erradas: ['Para julgar os pecadores', 'Para fundar um reino terreno', 'Para encerrar a obra dos profetas'] },
      { diff: 'Fácil', text: 'Quem nos guia “em toda a verdade” depois da ascensão de Jesus (Jo 16:13)?', certa: 'O Espírito Santo', erradas: ['Os anjos', 'Os reis', 'Os sacerdotes'] },
      { diff: 'Média', text: 'Qual destes profetas NÃO escreveu livro da Bíblia, segundo a lição?', certa: 'Natã', erradas: ['Isaías', 'Jeremias', 'Daniel'] },
      { diff: 'Média', text: 'Qual promessa feita no Éden Jesus cumpriu?', certa: 'Gênesis 3:15', erradas: ['Gênesis 12:3', 'Êxodo 20:3', 'Salmo 23:1'] },
      { diff: 'Difícil', text: 'Além dos profetas, que outra forma de Deus falar a lição cita no início?', certa: 'A criação', erradas: ['A astrologia', 'O acaso', 'As tradições humanas'] },
      { diff: 'Difícil', text: 'Segundo a lição, o que aprendemos por meio da Bíblia?', certa: 'Quem Deus é, quem somos, de onde viemos e para onde vamos', erradas: ['Apenas uma lista de regras', 'Somente a história de Israel', 'A data exata da volta de Jesus'] },
      { diff: 'Bíblica · Intermediária', text: 'Qual texto afirma que toda a Escritura é inspirada por Deus?', certa: '2 Timóteo 3:16, 17', erradas: ['João 3:16', 'Romanos 3:23', 'Gálatas 5:22'] },
      { diff: 'Bíblica · Intermediária', text: 'Em João 14:9, Jesus diz que quem O vê...', certa: 'vê o Pai', erradas: ['vê os anjos', 'vê Moisés', 'vê o templo'] },
      { diff: 'Bíblica · Difícil', text: 'Segundo 2 Pedro 1:21, como as mensagens proféticas foram transmitidas?', certa: 'Homens falaram da parte de Deus movidos pelo Espírito Santo', erradas: ['Por vontade humana', 'Por meio de sorteio', 'Copiadas de outros povos'] },
      { diff: 'Bíblica · Difícil', text: 'Qual destes a lição cita como porta-voz de Deus?', certa: 'Noé', erradas: ['Nabucodonosor', 'Faraó', 'Herodes'] }
    ],
    tf: [
      ['Todos os profetas da Bíblia escreveram algum livro.', 'F'],
      ['Jesus cumpriu a promessa feita a Adão e Eva em Gênesis 3:15.', 'V'],
      ['O Espírito Santo deixou de falar depois da ascensão de Jesus.', 'F'],
      ['A criação revela as obras de Deus e também as consequências da queda.', 'V']
    ]
  },

  sex: {
    title: 'Apresentando Ellen G. White',
    centraltexts: ['Gênesis 1:26', 'Gênesis 3:8-13', 'João 16:13'],
    keyideas: 'Nascida em 1827, no Maine · Um acidente aos 9 anos · Do medo ao amor de Deus',
    summary: 'A comunicação de Deus não parou nos tempos bíblicos. Ellen Harmon, uma menina marcada por um acidente e pelo medo de Deus, descobriu Seu amor e passou a servi-Lo por toda a vida.',
    body: [
      'Ellen Gould Harmon (depois White) e sua irmã gêmea, Elizabeth, nasceram em 26 de novembro de 1827, em Gorham, no Maine, Estados Unidos — as caçulas dos oito filhos de Robert e Eunice Harmon. Alguns anos depois, a família se mudou para Portland.',
      'Aos 9 anos, uma colega de escola atirou uma pedra que atingiu o rosto de Ellen e a deixou semiconsciente por semanas. O acidente interrompeu seus estudos, trouxe problemas de saúde para a vida toda e a deixou constrangida com a própria aparência. Nesse tempo de dor, ela passou a pensar seriamente em Deus — mas tinha medo Dele e se sentia indigna do Céu, mesmo depois de ser batizada na Igreja Metodista, em 1842.',
      'Dois sonhos e as conversas com o pastor metodista Levi Stockman mudaram tudo. Ela escreveu: “Considerava-O agora um Pai bondoso e afetuoso, em vez de um tirano severo” (Vida e Ensinos, p. 23). Ao compreender também o estado dos mortos e que não existe inferno eterno, sua visão do caráter de Deus foi transformada — e ela O serviu fielmente por toda a vida.'
    ],
    reflect: [
      'Que tipo de comunicação Deus desejava ter com os seres humanos desde o princípio? (Gn 1:26; 2:18, 19)',
      'Depois da decisão de Adão e Eva, como o Senhor tomou a iniciativa de restabelecer a comunicação com eles? (Gn 3:8-13)',
      'Ellen trocou a imagem de um Deus tirano pela de um Pai afetuoso. Como você enxerga Deus hoje?'
    ],
    quiz: [
      { diff: 'Fácil', text: 'Em que ano Ellen Harmon nasceu?', certa: '1827', erradas: ['1844', '1798', '1915'] },
      { diff: 'Fácil', text: 'Qual era o nome da irmã gêmea de Ellen?', certa: 'Elizabeth', erradas: ['Maria', 'Sarah', 'Anna'] },
      { diff: 'Média', text: 'Em qual estado dos Estados Unidos Ellen nasceu?', certa: 'Maine', erradas: ['Texas', 'Califórnia', 'Michigan'] },
      { diff: 'Média', text: 'Quantos anos Ellen tinha quando foi atingida por uma pedra?', certa: '9 anos', erradas: ['15 anos', '5 anos', '18 anos'] },
      { diff: 'Difícil', text: 'Em que igreja Ellen foi batizada por imersão, em 1842?', certa: 'Na Igreja Metodista', erradas: ['Na Igreja Batista', 'Na Igreja Católica', 'Na Igreja Presbiteriana'] },
      { diff: 'Difícil', text: 'Qual pastor ajudou Ellen a compreender o amor e a graça de Deus?', certa: 'Levi Stockman', erradas: ['Guilherme Miller', 'Tiago White', 'José Bates'] },
      { diff: 'Bíblica · Intermediária', text: 'De qual livro é a frase “Considerava-O agora um Pai bondoso e afetuoso”?', certa: 'Vida e Ensinos', erradas: ['O Grande Conflito', 'Caminho a Cristo', 'Educação'] },
      { diff: 'Bíblica · Intermediária', text: 'Qual doutrina bíblica ajudou Ellen a entender que não existe inferno eterno?', certa: 'O estado dos mortos', erradas: ['O dízimo', 'A reforma de saúde', 'O santuário'] },
      { diff: 'Bíblica · Difícil', text: 'Qual pregador anunciava a breve volta de Jesus e influenciou a família Harmon?', certa: 'Guilherme Miller', erradas: ['Levi Stockman', 'Martinho Lutero', 'João Wesley'] },
      { diff: 'Bíblica · Difícil', text: 'Segundo João 16:13, quem nos guia a toda a verdade depois que Jesus voltou ao Céu?', certa: 'O Espírito Santo', erradas: ['Os discípulos', 'Os anjos', 'Os profetas antigos'] }
    ],
    tf: [
      ['Ellen G. White teve uma irmã gêmea chamada Elizabeth.', 'V'],
      ['O acidente que Ellen sofreu aos 9 anos não trouxe consequências duradouras.', 'F'],
      ['Mesmo depois de batizada, Ellen ainda se sentia indigna do amor de Deus.', 'V'],
      ['Ellen sempre viu Deus como um Pai bondoso, desde criança.', 'F']
    ]
  },

  sab: {
    title: 'Entre tantas vozes',
    centraltexts: ['João 10:27'],
    keyideas: 'Excesso de vozes · Falta de discernimento · Intimidade com o Pastor',
    summary: 'Numa geração cercada de vozes, o problema não é o Céu em silêncio, mas nós distraídos demais. Quem convive com o Bom Pastor aprende a reconhecer a Sua voz.',
    body: [
      'Em 2007, o violinista Joshua Bell tocou por cerca de 45 minutos numa estação de metrô de Washington, com um violino de milhões de dólares — e quase ninguém parou para ouvir. Na noite anterior, ele tinha lotado um teatro. O problema não era a música; era a pressa de quem passava.',
      'Talvez nossa geração não sofra de falta de informação, mas de falta de discernimento. Redes sociais, influenciadores e notificações disputam nossa atenção o tempo todo, e fica difícil reconhecer quando é Deus quem está falando. Jesus disse: “As Minhas ovelhas ouvem a Minha voz” (Jo 10:27). O Senhor continua falando; nós é que estamos distraídos.',
      'Quanto mais convivemos com alguém, mais facilmente reconhecemos sua voz. Na vida espiritual é igual: é na oração, na leitura da Bíblia e nos momentos de silêncio que aprendemos a discernir a voz do Bom Pastor — e quem aprende a ouvi-Lo encontra direção, identidade e propósito, mesmo no meio do caos.'
    ],
    reflect: [
      'Quais vozes mais influenciam minhas decisões atualmente?',
      'Como posso desenvolver discernimento espiritual para reconhecer a voz de Deus em meio a tantas outras vozes?',
      'O que poderia mudar na minha vida se eu criasse mais momentos de comunhão sincera com Deus ao longo da semana?'
    ]
  }
};
