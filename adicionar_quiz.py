#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Script para adicionar quiz ao HTML de forma SEGURA

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

# Extrair o JSON das lições (entre const LESSONS_CONTENT = [ e ];)
match = re.search(r'const LESSONS_CONTENT = (\[[\s\S]*?\]);', content)
if not match:
    print("❌ Não encontrou LESSONS_CONTENT")
    exit(1)

json_str = match.group(1)

# Fazer parse JSON
try:
    lessons = json.loads(json_str)
    print(f"✅ Leu {len(lessons)} lições")
except Exception as e:
    print(f"❌ Erro ao fazer parse JSON: {e}")
    exit(1)

# QUIZ PARA LIÇÃO 1, DIA 1 (Domingo)
quiz_dom = {
    "questions": [
        {
            "q": "Qual foi o último grande milagre público de Jesus?",
            "opts": ["A ressurreição de Lázaro", "Transformação da água em vinho", "A cura de um paralítico", "A alimentação dos 5 mil"],
            "explanation": "A ressurreição de Lázaro foi o último grande milagre público, realizado diante de muitas testemunhas e que intensificou o ódio dos líderes religiosos."
        },
        {
            "q": "Por que os sacerdotes intensificaram seu ódio APÓS a ressurreição de Lázaro?",
            "opts": ["Porque o milagre foi inegável diante de muitas testemunhas", "Porque Lázaro pregava contra eles", "Porque Jesus ressuscitou o filho de um sacerdote", "Porque o milagre ocorreu no templo"],
            "explanation": "O milagre foi absolutamente inegável - muitas pessoas viram. Isso tornou impossível negar o poder de Jesus, intensificando o ódio."
        },
        {
            "q": "O que o texto revela sobre o amor de Jesus ser maior que seu sofrimento?",
            "opts": ["Que Ele seguiu adiante rumo à morte porque abandonar os seres humanos lhe causaria maior angústia", "Que Jesus não tinha medo da cruz", "Que Jesus priorizava seus milagres sobre sua segurança", "Que a morte não lhe afetava emocionalmente"],
            "explanation": "Jesus escolheu a morte porque o abandono da humanidade seria uma angústia ainda maior. Seu amor pelos humanos era mais forte que seu sofrimento na cruz."
        },
        {
            "q": "Qual era o estado emocional de Jesus ao saber sobre a morte de Lázaro?",
            "opts": ["Profundamente comovido e angustiado", "Calmo e desinteressado", "Alegre porque ressuscitaria Lázaro", "Confuso e inseguro"],
            "explanation": "Jesus chorou diante da morte de Lázaro, mostrando sua genuína comiseração e ligação emocional com a dor humana."
        },
        {
            "q": "Como a ressurreição de Lázaro se diferenciou de outras ressurreições?",
            "opts": ["Ocorreu diante de muitas testemunhas após 4 dias de morte", "Ocorreu em segredo", "Ocorreu apenas no templo", "Não se diferenciou"],
            "explanation": "Lázaro estava morto há 4 dias (já em decomposição), havia muitas testemunhas, e foi público - tornando impossível negar o milagre."
        },
        {
            "q": "Por que os discípulos ficaram confusos com a intenção de Jesus de ir a Betânia?",
            "opts": ["Porque sabiam que os judeus buscavam matá-Lo ali", "Porque queriam voltar para Galileia", "Porque não gostavam de Lázaro", "Porque a viagem era perigosa demais"],
            "explanation": "Os discípulos sabiam que havia ódio contra Jesus em Judeia e temiam pela sua segurança ao retornar."
        },
        {
            "q": "Qual é a lição mais profunda sobre fé neste dia?",
            "opts": ["Fé genuína inclui compreender que Deus trabalha através do sofrimento e da morte", "Fé significa nunca sofrer", "Fé é apenas um conceito abstrato", "Fé não importa quando alguém morre"],
            "explanation": "Este dia mostra que a fé verdadeira confia em Deus mesmo diante da morte e do sofrimento - Jesus não evitou a morte, mas a abraçou com propósito."
        },
        {
            "q": "O que a reação de Jesus diante da morte revela sobre sua natureza divina?",
            "opts": ["Que Ele era completamente humano em suas emoções enquanto confiava plenamente no Pai", "Que Ele era indiferente ao sofrimento humano", "Que Ele usava divindade para escapar de problemas", "Que Ele não tinha verdadeiro amor pelos humanos"],
            "explanation": "Jesus chorou e foi comovido, mostrando humanidade genuína, enquanto confiava no Pai - unindo humanidade perfeita com fé perfeita."
        },
        {
            "q": "Qual era o propósito aparente dos inimigos de Jesus ao aprisionar ou matar Lázaro?",
            "opts": ["Tentar eliminar a evidência do milagre matando Lázaro novamente", "Envergonhar Jesus", "Provar que Lázaro nunca estivera morto", "Recuperar sua posição de poder"],
            "explanation": "Os inimigos queriam matar Lázaro novamente para eliminar a evidência viva e irrefutável do poder de Jesus - mas não conseguiram."
        },
        {
            "q": "Como a história de Lázaro prefigura o que aconteceria com Jesus em breve?",
            "opts": ["Assim como Lázaro foi ressuscitado apesar do ódio dos líderes, Jesus também seria ressuscitado e sua morte não seria final", "Jesus também seria aprisionado", "Jesus também teria 4 dias de morte", "Nenhuma conexão existe"],
            "explanation": "A ressurreição de Lázaro é um sinal profético: apesar da morte e do ódio dos líderes, a ressurreição é possível - isto prefigura a ressurreição de Jesus."
        }
    ],
    "answers": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  # Todos os índices 0 são as respostas corretas
}

# Adicionar quiz ao primeiro dia da primeira lição
if lessons[0]["days"][0]["id"] == "dom":
    lessons[0]["days"][0]["quiz"] = quiz_dom
    print("✅ Quiz adicionado ao Domingo da Lição 1")
else:
    print("❌ Primeiro dia não é domingo")
    exit(1)

# Converter de volta para JSON
new_json = json.dumps(lessons, ensure_ascii=False, separators=(',', ':'))

# Substituir no conteúdo original
new_content = content.replace(json_str, new_json)

# Salvar arquivo
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"✅ Arquivo salvo com sucesso!")
print(f"📊 Quiz tem 10 perguntas com 4 alternativas cada")
