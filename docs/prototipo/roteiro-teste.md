# Roteiro do teste da B4 (o portão G3)

O que se prova: **3 colegas completam sem ajuda** as três jornadas do G3 (`docs/ui-ux.md` §2,
`docs/plano-implementacao.md`, linha da B4): registrar uma NC com rascunho, aprovar um item e
comentar com menção. E uma pergunta só sobre a luz da T-03 (a decisão (u)).

O protótipo: `docs/prototipo/andon-b4.html`, publicado em
https://claude.ai/artifact/6ookPCHR7vF4D7nbur4h6D. **Antes:** compartilhar a página pelo menu
Share dela; sem isso, os colegas não abrem o link.

Quem conduz: Matthew. Uns **15 minutos por colega**, um de cada vez.

## 1. Antes de cada colega

1. O protótipo aberto no celular dele (ou no seu), na tela **Pendências**.
2. Se outro colega já usou: aba **Eu → Recomeçar o protótipo**.
3. Anote se o celular está no modo claro ou no escuro: a luz da T-03 muda entre os dois.
4. Uma folha de anotação por colega (§5) e o cartão com os dados da NC (§3, tarefa 1) à mão.

## 2. A abertura (ler em voz alta)

> "Estou testando o sistema, não você: se algo der errado, o erro é do sistema, e é isso que eu
> quero achar. Fala em voz alta o que você está pensando e procurando. Eu não vou ajudar durante
> as tarefas, porque quero ver onde o sistema confunde; no fim eu explico tudo. Algumas partes
> ainda não existem: se aparecer o aviso 'fica fora do protótipo', tenta outro caminho. Você pode
> desistir de uma tarefa a qualquer momento, e isso também me ajuda."
>
> "Nas tarefas, você é a **Fulana Souza**, da Produção: responsável por NCs e aprovadora."

## 3. As tarefas

Leia cada tarefa como está escrita. Elas não usam as palavras dos botões ("rascunho",
"publicar", "aprovar", "@"), para não entregar o caminho. Se o colega perguntar "onde eu clico?",
responda só "o que você tentaria?".

### Tarefa 1 · Registrar uma NC com rascunho (J1)

**1a.** "Agora há pouco você ouviu um vazamento de ar na linha 5. Comece a registrar isso no
sistema. Você ainda não sabe todos os detalhes: guarde o que já escreveu para terminar depois."

Entregue o cartão só com o título e a descrição:

| Campo | Valor |
|---|---|
| Título | Vazamento de ar na linha 5 |
| Descrição | Vazamento de ar comprimido na conexão da pistola de pintura da linha 5, ouvido na inspeção do turno da tarde |

**1b.** "Você descobriu o resto. Termine o registro e deixe a NC valendo, para a qualidade ver."

Entregue o resto do cartão:

| Campo | Valor |
|---|---|
| Detectada em | hoje |
| Origem | Operação |
| Setor | Produção |
| Processo afetado | Pintura |
| Requisito violado | IT-051, item 2.1 |

**Completou** quando a NC-2026-0046 abre, depois de um rascunho salvo na 1a. **Observe:** acha o
"Nova NC"? Entende que "Salvar rascunho" guarda para depois? Acha o "Continuar rascunho" nas
pendências? Se tentar publicar faltando campo, entende a mensagem ao lado do campo?

### Tarefa 2 · Aprovar um item (J8)

"A NC-2026-0038 está esperando a sua decisão sobre o fechamento dela. Você já conferiu tudo, e
está certo. Faça o que precisa ser feito."

**Completou** quando a NC-2026-0038 fica **Fechada**. **Observe:** começa pelas Pendências (a
gaveta Aprovar) ou pela lista de NCs? Lê o checklist antes de decidir? Hesita entre Aprovar e
Reprovar?

### Tarefa 3 · Comentar com menção (J10)

"Na NC do vazamento na linha 3, peça para o **Ciclano Reis** conferir se o lote 42 já foi
isolado. Ele precisa ficar sabendo do pedido."

**Completou** quando o comentário aparece no feed da NC-2026-0042 **chamando o Ciclano** (o
aviso diz que ele vai ver na pendência). **Observe:** acha a aba Feed? Descobre o `@` sozinho, ou
escreve só "Ciclano" no texto? (Escrever o nome sem o `@` não avisa ninguém: conta como não
completou, e é um achado importante.)

## 4. No fim (depois das três tarefas)

Primeiro, explique o que ele quiser saber. Depois, quatro perguntas, nesta ordem:

1. "Qual das três foi a mais difícil? Por quê?"
2. "Alguma palavra da tela que você não entendeu, ou entendeu diferente?"
3. **A luz** (volte para a tela Pendências e mostre o alto da tela): "O que você achou desse
   brilho aqui em cima? Gosta, atrapalha, ou nem tinha reparado?" Anote a frase dele como veio.
4. "De 1 a 5, quão fácil foi usar, no geral?" (1 = muito difícil, 5 = muito fácil)

## 5. A folha de anotação (uma por colega)

| | Tarefa 1 (NC com rascunho) | Tarefa 2 (aprovar) | Tarefa 3 (comentar com menção) |
|---|---|---|---|
| Completou? (sozinho · com dica · não) | | | |
| Tempo (mais ou menos) | | | |
| Onde hesitou ou errou | | | |
| O que ele disse | | | |

Colega (só o primeiro nome ou uma letra; o nome não vai para o repositório): ____ · Função: ____
· Modo do celular: claro / escuro · A luz (pergunta 3): ____ · Nota (pergunta 4): ____

## 6. O resultado

- **O G3 passa** quando os 3 colegas completam **sozinhos** as 3 tarefas. "Com dica" não conta:
  vira um ajuste.
- Cada hesitação que se repetir em 2 colegas vira um ajuste, no Figma (a tela) ou no plano (a
  fase C que a constrói).
- Os resultados vão para `docs/prototipo/resultados-teste.md` (a última entrega da B4), sem o
  nome dos colegas: o repositório é público.
