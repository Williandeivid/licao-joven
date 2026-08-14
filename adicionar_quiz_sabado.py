#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Script para adicionar quiz ao sábado (reflexão) das lições 8-13

import json
import re
import sys
import io

# Força UTF-8 output
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Ler o arquivo HTML
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extrair o JSON das lições
match = re.search(r'const LESSONS_CONTENT = (\[[\s\S]*?\]);', content)
if not match:
    print("Erro: Não encontrou LESSONS_CONTENT")
    exit(1)

json_str = match.group(1)

# Fazer parse JSON
try:
    lessons = json.loads(json_str)
    print(f"Leu {len(lessons)} lições")
except Exception as e:
    print(f"Erro ao fazer parse JSON: {e}")
    exit(1)

# DEFINIÇÃO DE QUIZZES PARA SÁBADO (DIA 7) - REFLEXÃO SEMANAL

# Lição 8: Remorso e Arrependimento
quiz_sabado_8 = {
    "questions": [
        {
            "q": "Qual foi a lição central desta semana sobre o julgamento de Jesus?",
            "opts": ["Que a verdade prevalece mesmo sob pressão", "Que pilatos era inocente", "Que mentiras conseguem sempre ganhar", "Que Jesus era culpado"],
            "explanation": "A semana mostrou como Jesus foi julgado injustamente, paralelo com Daniel, mas a verdade foi condenada por pressão política."
        },
        {
            "q": "Como as diferentes reações ao arrependimento se conectam ao tema central?",
            "opts": ["O arrependimento de Judas vs. a falta dele em Pilatos mostra consequências diferentes", "Todos se arrependeram", "Ninguém se arrependeu", "O arrependimento não importava"],
            "explanation": "Judas sentiu remorso mas não verdadeiro arrependimento, enquanto Pilatos reconheceu a inocência mas não agiu."
        },
        {
            "q": "O que esta semana revela sobre a responsabilidade de nossas escolhas?",
            "opts": ["Nossas escolhas têm consequências eternas, mesmo que pareçam pequenas", "Não temos responsabilidade", "As consequências são sempre imediatas", "Nossas escolhas nunca importam"],
            "explanation": "Pilatos e Judas fizeram escolhas que os assombraram, mostrando que nossas ações têm peso espiritual."
        },
        {
            "q": "Como o sacrifício de Jesus responde ao tema 'Remorso e Arrependimento'?",
            "opts": ["Jesus morreu oferecendo perdão a todos, incluindo os arrependidos", "Jesus morreu com raiva", "O sacrifício não tem relação", "Todos foram condenados"],
            "explanation": "Cristo ofereceu redenção através de Seu sacrifício, respondendo ao chamado do arrependimento genuíno."
        },
        {
            "q": "Qual aplicação pessoal podemos tirar desta lição?",
            "opts": ["Buscar arrependimento genuíno e não viver com remorso sem mudança", "Ignorar nossas falhas", "Culpar os outros", "Nunca confessar pecados"],
            "explanation": "A lição convida a um arrependimento verdadeiro que transforma, não apenas remorso que condena."
        },
        {
            "q": "Como a fidelidade de Daniel contrasta com a fraqueza de Pilatos nesta narrativa?",
            "opts": ["Daniel permaneceu fiel apesar da pressão, enquanto Pilatos cedeu", "Pilatos foi mais fiel", "Ambos foram infiéis", "Fidelidade não importava"],
            "explanation": "Daniel manteve sua integridade mesmo em risco de morte, enquanto Pilatos cedeu à pressão apesar de reconhecer a verdade."
        },
        {
            "q": "Qual é o chamado de Deus para nós ao meditar nesta semana?",
            "opts": ["Escolher sempre a verdade e a justiça, mesmo quando for difícil", "Aceitar injustiça", "Prejudicar o inocente", "Viver sem princípios"],
            "explanation": "A semana nos chama a defender a verdade e a justiça, seguindo o exemplo de fidelidade de Daniel e o sacrifício de Cristo."
        },
        {
            "q": "Como a pressão social influenciou os eventos desta semana?",
            "opts": ["A pressão levou líderes a condenar o inocente para manter poder", "Não havia pressão", "A pressão era boa", "Ninguém cedeu à pressão"],
            "explanation": "Os líderes e Pilatos cederam à pressão de multidões invejosas em lugar de seguir a verdade."
        },
        {
            "q": "O que o remorso de Judas revela sobre estar separado de Deus?",
            "opts": ["O remorso sem Deus leva ao desespero e morte", "O remorso é sempre bom", "A separação de Deus não importa", "Judas estava feliz"],
            "explanation": "Judas experimentou remorso profundo mas sem esperança de perdão, levando ao desespero final."
        },
        {
            "q": "Como podemos aplicar o perdão de Cristo nesta semana à nossa vida?",
            "opts": ["Reconhecendo que mesmo nossos erros podem ser perdoados através do arrependimento genuíno", "Nunca pedir perdão", "Manter rancor", "Ignorar o perdão divino"],
            "explanation": "Cristo ofereceu Seu sacrifício para perdão genuíno, convidando-nos a nos arrependermos e recebermos graça."
        }
    ],
    "answers": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

# Lição 9: Crucifiquem o Rei de Vocês
quiz_sabado_9 = {
    "questions": [
        {
            "q": "Como a ironia 'Crucifiquem o Rei de Vocês' resume a semana?",
            "opts": ["Os mesmos que gritaram hosanas agora pedem morte, mostrando a inconstância humana", "Havia consistência nas ações", "A multidão sempre apoiou Jesus", "Não havia ironia"],
            "explanation": "A multidão que aclamou Jesus como Rei agora pede Sua morte, revelando superficialidade da fé humana."
        },
        {
            "q": "Qual foi o papel da pressão coletiva nos eventos desta semana?",
            "opts": ["A pressão de grupo levou pessoas a agir contra sua consciência", "Não havia pressão", "A pressão ajudou", "Todos agiam independentemente"],
            "explanation": "A dinâmica de grupo amplificou o ódio e a demanda por morte de Jesus."
        },
        {
            "q": "Como Jesus respondeu à rejeição e violência desta semana?",
            "opts": ["Com amor e perdão, até durante Seu sofrimento", "Com raiva", "Com desespero", "Com violência"],
            "explanation": "Jesus manteve amor e compaixão mesmo sendo crucificado, exemplificando perdão perfeito."
        },
        {
            "q": "O que a crucificação de um inocente revela sobre nosso mundo?",
            "opts": ["Que o pecado humano pode levar à injustiça extrema, mas Deus transforma isso em salvação", "O mundo é perfeito", "A injustiça não existe", "Não há redenção possível"],
            "explanation": "A crucificação injusta revela a profundidade do pecado humano, mas também a graça divina em transformá-lo."
        },
        {
            "q": "Como a morte de Jesus na cruz transforma o significado de 'Rei'?",
            "opts": ["Redefiniu realeza como servido, sofrimento e amor em lugar de poder", "Realeza continuou a mesma", "Jesus não era rei", "Rei significa apenas poder"],
            "explanation": "A morte de Cristo revelou que verdadeira realeza está em servir e morrer pelo povo, não em dominação."
        },
        {
            "q": "Qual é a conexão entre a rejeição de Jesus e nossa chamada hoje?",
            "opts": ["Como Jesus foi rejeitado, podemos esperar resistência ao seguir princípios de Cristo", "Nunca seremos rejeitados", "A rejeição é derrota", "Não existe conexão"],
            "explanation": "Jesus prometeu que Seus seguidores enfrentariam oposição, assim como Ele."
        },
        {
            "q": "Como podemos honrar o sacrifício de Cristo após esta semana?",
            "opts": ["Vivendo por Seus princípios de amor e justiça, mesmo sob pressão", "Esquecendo o sacrifício", "Vivendo apenas para nós mesmos", "Rejeitando Seus ensinos"],
            "explanation": "Honrar Cristo significa viver Seus valores e estar dispostos a sofrer por eles se necessário."
        },
        {
            "q": "O que a semana revela sobre a natureza do verdadeiro poder espiritual?",
            "opts": ["O verdadeiro poder está em suportar injustiça com amor, não em vingança", "Poder significa dominar outros", "Não existe poder espiritual", "O poder físico é superior"],
            "explanation": "Christ demonstrou que o verdadeiro poder espiritual é suportar o sofrimento com amor e perdão."
        },
        {
            "q": "Como o arrependimento dos perpetradores afeta a história da crucificação?",
            "opts": ["Alguns que pediam morte posteriormente creram em Jesus ressuscitado, mostrando esperança de redenção", "Ninguém se arrependeu", "O arrependimento não muda nada", "Todos rejeitaram para sempre"],
            "explanation": "Mesmo após crucificar Jesus, muitos se arrependeram no Pentecostes, mostrando que nenhum pecado está além do perdão."
        },
        {
            "q": "Qual lição final esta semana deixa para nossas escolhas diárias?",
            "opts": ["Nossas decisões têm consequências eternas e podemos ser influenciados pela pressão, mas Deus oferece redenção", "Nossas escolhas não importam", "A pressão sempre está certa", "Não há esperança após erros"],
            "explanation": "A semana nos convida à vigilância moral, reconhecendo pressões, mas confiando na redenção divina."
        }
    ],
    "answers": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

# Lição 10: O Rei na Cruz
quiz_sabado_10 = {
    "questions": [
        {
            "q": "Como a cruz, símbolo de morte, se torna símbolo de vida nesta semana?",
            "opts": ["Porque Jesus transformou a morte em redenção, vencendo o pecado", "A cruz permanece apenas morte", "Não há conexão", "Jesus não venceu"],
            "explanation": "A cruz, resultado do pecado humano, tornou-se instrumento de salvação através da ressurreição de Cristo."
        },
        {
            "q": "Qual é o significado teológico de Jesus ser chamado 'Rei na Cruz'?",
            "opts": ["Que verdadeira realeza é alcançada através do sacrifício e sofrimento, não pelo poder terreno", "Realeza é apenas terrena", "Jesus não era rei", "Ser rei significa evitar sofrimento"],
            "explanation": "A paradoxal realeza de Cristo na cruz revela que Deus governa através de amor e sacrifício."
        },
        {
            "q": "Como as diferentes reações à crucificação (soldados, líderes, povo) revelam a natureza humana?",
            "opts": ["Mostram que a mesma morte toca diferentes corações de formas diferentes, alguns com dureza e outros com remorso", "Todos reagiram igual", "Não há diferença", "Não havia reações"],
            "explanation": "As reações variadas revelam que o coração humano responde diferentemente à verdade, dependendo de sua abertura."
        },
        {
            "q": "Qual promessa Jesus fez enquanto estava na cruz?",
            "opts": ["Perdão aos que o crucificavam e salvação ao ladrão arrependido", "Punição a todos", "Nenhuma promessa", "Abandono de Seus seguidores"],
            "explanation": "Jesus ofereceu perdão e salvação mesmo durante Seu sofrimento máximo."
        },
        {
            "q": "Como a morte de Jesus cumpre as promessas do Antigo Testamento?",
            "opts": ["Como o Cordeiro de Deus sacrificado pelos pecados do mundo", "Não cumpre", "É contradição", "Promessas foram anuladas"],
            "explanation": "Cristo é o sacrifício perfeito prefigurado em toda a história da redenção do Antigo Testamento."
        },
        {
            "q": "O que significa 'estar na cruz' espiritualmente em nossas vidas hoje?",
            "opts": ["Morrer para o ego e vivermos para Cristo, aceitando Seu chamado de sacrifício", "Nada significa", "Sofrimento sem propósito", "Rejeição do sacrifício de Cristo"],
            "explanation": "Tomar nossa cruz significa abdicar de nossa vontade por Cristo e Seus propósitos."
        },
        {
            "q": "Como o sofrimento de Jesus na cruz se conecta à nossa esperança?",
            "opts": ["Porque Seu sofrimento realizou redenção, garantindo nossa salvação se recebermos Sua graça", "Seu sofrimento não nos ajuda", "Não há esperança", "Esperança está em outro lugar"],
            "explanation": "A morte de Cristo na cruz é a base de nossa esperança de redenção eterna."
        },
        {
            "q": "Qual foi a mensagem da escrita 'INRI' (Jesus de Nazaré, Rei dos Judeus) na cruz?",
            "opts": ["Mesmo a ironia humana proclamava a verdade: Jesus é Rei, embora de um Reino não terreno", "Era apenas um rótulo", "Significado não importava", "Era falso"],
            "explanation": "A inscrição, mesmo como mocking humano, profeticamente declarava a verdade da realeza de Cristo."
        },
        {
            "q": "Como o escurecimento da terra durante a crucificação simboliza o momento?",
            "opts": ["Representa o triunfo da escuridão temporário, mas que seria vencido pela ressurreição", "Era coincidência", "Sem significado", "Escuridão permanece"],
            "explanation": "A escuridão simbolizou o poder do mal em seu clímax, mas foi apenas temporária."
        },
        {
            "q": "Qual aplicação pessoal esta semana nos convida a fazer?",
            "opts": ["Reconhecer que Cristo pagou o preço máximo e responder com fé, gratidão e disposição de servi-Lo", "Ignorar o sacrifício", "Viver independente de Cristo", "Rejeitar Sua morte"],
            "explanation": "A semana nos convida à gratidão profunda e ao compromisso de viver para Cristo que nos resgatou."
        }
    ],
    "answers": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

# Lição 11: Morte e Sepultamento
quiz_sabado_11 = {
    "questions": [
        {
            "q": "Por que o sepultamento de Jesus foi um ponto crucial na história da redenção?",
            "opts": ["Porque confirmou Sua morte real e criou espaço para a ressurreição de poder", "O sepultamento não importava", "Jesus não morreu realmente", "A morte foi o fim"],
            "explanation": "A morte e sepultamento verificáveis confirmam que a ressurreição seria um evento real e sobrenatural."
        },
        {
            "q": "Como o túmulo vazio se conecta à fé cristã primitiva?",
            "opts": ["É a base de toda fé cristã, pois prova que morte não teve a última palavra", "Túmulo vazio não importa", "Jesus permaneceu morto", "Ressurreição é simbólica"],
            "explanation": "O túmulo vazio é evidência histórica que sustentou a fé dos primeiros cristãos."
        },
        {
            "q": "Qual foi a experiência emocional dos discípulos durante o sepultamento?",
            "opts": ["Desespero e confusão, pois esperavam um Messias que não morreria", "Alegria", "Indiferença", "Esperança completa"],
            "explanation": "Os discípulos estavam devastados, pois sua esperança parecia ter sido enterrada com Jesus."
        },
        {
            "q": "Como a morte de Jesus afetou a compreensão do Reino de Deus entre Seus seguidores?",
            "opts": ["Os forçou a reavaliar suas expectativas, compreendendo um reino espiritual, não político", "Nada mudou", "Entendimento permaneceu igual", "Deixaram de acreditar"],
            "explanation": "A morte revelou que o Reino de Deus funciona diferentemente do que esperavam."
        },
        {
            "q": "Qual era o propósito de Jesus em permitir Sua morte?",
            "opts": ["Cumprir as Escrituras e pagar o preço do pecado humano para redenção", "Não havia propósito", "Foi um acidente", "Para desapontar Seus seguidores"],
            "explanation": "Cada aspecto da morte de Jesus foi necessário para realizar salvação universal."
        },
        {
            "q": "Como o repouso de Jesus no sepulcro durante o sábado tem significado especial?",
            "opts": ["Honra o Sábado e cumpre a Escritura do 'repouso', prefigurando nossa paz em Cristo", "Sem significado especial", "Violou o Sábado", "Nenhuma conexão"],
            "explanation": "O repouso de Cristo no Sábado cumpre temas de repouso e restauração de todo o Antigo Testamento."
        },
        {
            "q": "O que o relato do sepultamento honrado (tumba de José) revela sobre Deus?",
            "opts": ["Que Deus honra Seu Filho mesmo em morte, e que aqueles que O servem serão honrados", "Não revela nada", "Indica fraqueza de Deus", "É apenas coincidência"],
            "explanation": "A sepultura respeitosa que José providenciou foi honra providenciada por Deus."
        },
        {
            "q": "Como a certeza da morte de Jesus fortaleceu a realidade de Sua ressurreição?",
            "opts": ["Se não tivesse realmente morrido, a ressurreição seria apenas resgate, não vitória sobre morte", "Morte e ressurreição não se conectam", "Ressurreição seria igual de qualquer forma", "Morte enfraquece ressurreição"],
            "explanation": "A realidade da morte é essencial para a realidade da vitória sobre morte."
        },
        {
            "q": "Qual esperança os seguidores de Jesus poderiam ter durante aquele sábado de sepultamento?",
            "opts": ["Esperança baseada nas Escrituras sobre ressurreição, embora não compreendida plenamente", "Nenhuma esperança", "Esperança no mundo político", "Esperança em sua própria força"],
            "explanation": "Mesmo na morte, as Escrituras mantinham a esperança de ressurreição para aqueles que criam."
        },
        {
            "q": "Como esta semana nos convida à reflexão pessoal sobre morte e vida?",
            "opts": ["Reconhecemos que morte não é final para quem segue Cristo, e que ressurreição espiritual e física são nossas esperanças", "Morte é tudo", "Sem esperança após morte", "Não há conexão com nós"],
            "explanation": "A morte e sepultamento de Cristo estabelecem o padrão para nossa própria ressurreição futura."
        }
    ],
    "answers": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

# Lição 12: Ele Ressuscitou!
quiz_sabado_12 = {
    "questions": [
        {
            "q": "Por que a ressurreição de Jesus é o evento mais importante do cristianismo?",
            "opts": ["Porque prova que Jesus é Deus e que morte não tem poder sobre Seus seguidores", "Crucificação era mais importante", "Ressurreição é simbólica apenas", "Não é importante"],
            "explanation": "A ressurreição valida tudo que Jesus ensinou e promete vida eterna aos crentes."
        },
        {
            "q": "Como as primeiras testemunhas da ressurreição responderam inicialmente?",
            "opts": ["Com descrença e medo, até que encontraram o Jesus ressuscitado pessoalmente", "Com alegria imediata", "Não viram ressurreição", "Apenas acreditaram em histórias"],
            "explanation": "Os discípulos enfrentaram descrença natural perante evento tão sobrenatural."
        },
        {
            "q": "Qual é a conexão entre a ressurreição de Jesus e nossa própria ressurreição?",
            "opts": ["Cristo é as primícias, garantindo que crentes também ressuscitarão quando Ele retornar", "Nenhuma conexão", "Nós não ressuscitaremos", "Ressurreição dele era única"],
            "explanation": "A ressurreição de Cristo é o protótipo e garantia de nossa ressurreição futura."
        },
        {
            "q": "Como a ressurreição transformou a compreensão dos discípulos sobre Reino de Deus?",
            "opts": ["Revelou que o Reino é eterno e spiritual, não derrotado pela morte política", "Não mudou nada", "Ainda esperavam reino político", "Perderam fé completamente"],
            "explanation": "A ressurreição provou que o poder de Deus transcende estruturas políticas."
        },
        {
            "q": "Qual é o significado da frase 'Exaltado à mão direita de Deus'?",
            "opts": ["Jesus agora está em posição de autoridade suprema, intercedendo e governando para nós", "Posição física literal", "Está fraco agora", "Não significa nada"],
            "explanation": "A exaltação indica a autoridade cósmica contínua de Jesus sobre tudo."
        },
        {
            "q": "Como a ressurreição afetou o que Cristo promete aos Seus seguidores?",
            "opts": ["Confirma Suas promessas de vida eterna, perdão e transformação espiritual", "Promessas foram canceladas", "Promessas são apenas simbólicas", "Nada foi confirmado"],
            "explanation": "A ressurreição valida cada promessa que Cristo fez."
        },
        {
            "q": "O que a aparição ressuscitada de Jesus revelou sobre a natureza de nosso próprio futuro corpo?",
            "opts": ["Será físico e real, mas transformado, capaz de transcender limitações presentes", "Será puramente espiritual", "Não teremos corpos", "Será igual ao atual"],
            "explanation": "O corpo ressuscitado de Jesus é modelo do corpo ressuscitado que receberemos."
        },
        {
            "q": "Como a ressurreição respondeu ao desafio do pecado e morte na história humana?",
            "opts": ["Provou que Deus tem poder maior que pecado e morte, oferecendo libertação a todos", "Pecado ainda tem poder total", "Morte é final", "Não há libertação"],
            "explanation": "A ressurreição é a resposta definitiva de Deus ao problema do pecado e morte."
        },
        {
            "q": "Qual foi a reação das autoridades religiosas à ressurreição?",
            "opts": ["Negação e tentativa de suprimir a notícia, mostrando medo do poder de Deus revelado", "Aceitação imediata", "Não importava para eles", "Celebraram"],
            "explanation": "O medo das autoridades em cobrir a ressurreição prova seu impacto transformador."
        },
        {
            "q": "Qual é nossa resposta apropriada à ressurreição de Cristo nesta semana?",
            "opts": ["Fé genuína, alegria profunda, e vida transformada pela esperança de ressurreição futura", "Indiferença", "Descrença", "Medo apenas"],
            "explanation": "A ressurreição merece nossa adoração, fé completa e compromisso renovado com Cristo."
        }
    ],
    "answers": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

# Lição 13: O Fim da História
quiz_sabado_13 = {
    "questions": [
        {
            "q": "Como a ascensão de Jesus completa a história do Evangelho?",
            "opts": ["Retorna Ele ao céu para preparar lugar para nós e interceder continuamente", "Termina e não há continuação", "Jesus permanece na Terra", "História está incompleta"],
            "explanation": "A ascensão não é fim, mas início do ministério celestial contínuo de Cristo."
        },
        {
            "q": "Qual é o significado de 'O Fim da História' como título desta lição?",
            "opts": ["Não é fim do plano de Deus, mas cumprimento desta fase e promessa de retorno de Cristo", "História realmente termina", "Nada mais acontecerá", "Sem significado especial"],
            "explanation": "O título indica que a história de redenção não termina com ascensão, mas continua até Segunda Vinda."
        },
        {
            "q": "Como o Pentecostes conecta a ascensão de Jesus aos Seus seguidores?",
            "opts": ["O Espírito Santo enviado confirmou presença contínua de Cristo e deu poder aos discípulos", "Pentecostes não se conecta", "Espírito não foi enviado", "Discípulos ficaram sozinhos"],
            "explanation": "O Espírito Santo é Jesus presente em cada crente, continuando Seu ministério."
        },
        {
            "q": "Qual promessa Jesus deixou antes de ascender?",
            "opts": ["Voltaria para buscar Seus seguidores e estabelecer Reino eterno", "Nunca voltaria", "Promessa de sofrimento apenas", "Sem promessas"],
            "explanation": "A esperança da Segunda Vinda sustenta a fé cristã até hoje."
        },
        {
            "q": "Como a Nova Jerusalém, descrita no final da Bíblia, representa a consumação da história?",
            "opts": ["Mostra restauração final de comunhão de Deus com humanidade, livre de sofrimento e pecado", "Sem importância", "Nunca será realidade", "Apenas simbólico"],
            "explanation": "A Nova Jerusalém representa a vitória final de Deus e o resultado supremo da redenção."
        },
        {
            "q": "Qual papel o Espírito Santo tem nesta era atual (entre ascensão e retorno)?",
            "opts": ["Capacita crentes para testemunho e transformação espiritual, aplicando obra de Cristo", "Sem papel", "Não existe", "Espírito não trabalha"],
            "explanation": "O Espírito Santo é agente ativo de Deus na Igreja durante esta era."
        },
        {
            "q": "Como a morte e ressurreição de Cristo remodelaram todo o Antigo Testamento?",
            "opts": ["Revelaram que tudo apontava para Cristo e Sua redenção, cumprindo todas as profecias", "Nada mudou", "Contradiz o AT", "Sem conexão"],
            "explanation": "Cristo é o cumprimento de toda a narrativa de redenção do Antigo Testamento."
        },
        {
            "q": "Qual é nosso trabalho como seguidores de Cristo antes de Seu retorno?",
            "opts": ["Pregar o evangelho a todas as nações e fazer discípulos, vivendo transformação de Cristo", "Nada fazer", "Apenas esperar", "Negligenciar mundo"],
            "explanation": "Cristo nos deixou a Grande Comissão como nossa missão até Seu retorno."
        },
        {
            "q": "Como a história de Cristo—morte, ressurreição, ascensão—oferece esperança ao sofrimento do mundo?",
            "opts": ["Garante que Deus é soberano, sofrimento tem propósito, e justiça será estabelecida", "Sem esperança", "Sofrimento sem sentido", "Deus é impotente"],
            "explanation": "A história de Cristo nos assegura que Deus final conquistará o mal e restaurará tudo."
        },
        {
            "q": "Qual aplicação central esta série de lições nos convida a fazer agora?",
            "opts": ["Viver entregues a Cristo, confiando em Sua vitória, sendo testemunhas de Sua redenção até Seu retorno", "Esquecer as lições", "Viver em dúvida", "Ignorar esperança"],
            "explanation": "Toda esta série nos convida a rendição total, fé ativa e testemunho comprometido."
        }
    ],
    "answers": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

# Adicionar quizzes ao sábado (dia 7) de cada lição
quizzes_to_add = {
    7: quiz_sabado_8,   # Lição 8
    8: quiz_sabado_9,   # Lição 9
    9: quiz_sabado_10,  # Lição 10
    10: quiz_sabado_11, # Lição 11
    11: quiz_sabado_12, # Lição 12
    12: quiz_sabado_13  # Lição 13
}

count_added = 0
for lesson_idx, quiz_data in quizzes_to_add.items():
    if lessons[lesson_idx]["days"][6]["id"] == "sab":
        if not lessons[lesson_idx]["days"][6].get("quiz"):
            lessons[lesson_idx]["days"][6]["quiz"] = quiz_data
            count_added += 1
            print(f"Quiz adicionado ao Sábado da Lição {lesson_idx+1}")
        else:
            print(f"Quiz já existe no Sábado da Lição {lesson_idx+1}, pulando...")
    else:
        print(f"Dia 7 da Lição {lesson_idx+1} não é sábado!")

# Converter de volta para JSON
new_json = json.dumps(lessons, ensure_ascii=False, separators=(',', ':'))

# Substituir no conteúdo original
new_content = content.replace(json_str, new_json)

# Salvar arquivo
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"\nTotal de quizzes adicionados: {count_added}")
print("Arquivo salvo com sucesso!")
