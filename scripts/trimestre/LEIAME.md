# Montagem de um trimestre novo

O conteudo proprio do app (resumo, ideias-chave, perguntas, quiz e V/F) e
escrito a mao em `fonte/<id>.js`; o resto sai dos arquivos oficiais da
Adventech. Os scripts trabalham numa pasta de trabalho qualquer (`TRAB`).

1. Baixar os .md oficiais para `TRAB/q4/<licao>/<dia>.md` (e `info.yml` de cada licao)
   de `Adventech/sabbath-school-lessons/src/pt/<codigo-do-trimestre>`.
2. `node esqueleto.js TRAB/q4` -> gera `TRAB/q4-esqueleto.json` (titulos, datas, textos-base).
3. Copiar `fonte/*.js` para `TRAB/q4-fonte/` e escrever a licao nova no mesmo formato.
4. `node montar.js TRAB <id>` -> gera `TRAB/q4-conteudo/<id>.json`.
   Cada pergunta traz a resposta `certa` separada das `erradas`; a posicao gira
   entre A-D e a letra do gabarito e calculada. Nao digite gabarito a mao.
5. `node inserir.js index.html TRAB` -> substitui as licoes do trimestre em
   LESSONS_CONTENT (rodar de novo e seguro).
6. `node scripts/check-dados.js` antes de publicar.

Os numeros das licoes nao se repetem entre trimestres (3o = 1-13, 4o = 14-26):
progresso, comentarios e curtidas sao guardados pelo numero. Ver TRIMESTRES
no index.html.
