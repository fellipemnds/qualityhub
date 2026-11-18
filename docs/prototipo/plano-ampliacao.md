# O protótipo ampliado (B4) — o plano

Pedido de Matthew em 2026-11-03, no dia marcado para o teste: o protótipo de três jornadas
(J1 registrar, J8 aprovar, J10 comentar) dá "basicamente só para aprovar ou reprovar uma NC". Ele
vai cobrir **o ciclo inteiro da NC**, com **um login de perfis** para cada colega testar no papel
que quiser, e **uma versão para o computador**. O teste com os 3 colegas foi **adiado** até o
protótipo ampliado ficar pronto e passar pelo revisor.

**Status (2026-11-03, tarde):** aprovado por Matthew ("pode incluir tudo": os perfis do §2, a J11 e
a J12; o teste fica para 04/11 ou 05/11). **Feitas, numa leva só:** as fatias 1 a 6, a J11 e a J12,
e o roteiro novo (`roteiro-teste.md`, as três tarefas do portão e oito extras). O
`teste-jornadas.js` clica pelas jornadas com cada perfil, no celular e no computador, num DOM de
mentira (o Chrome não estava conectado): todas passam. **Falta:** olhar o desenho num navegador de
verdade (o teste não vê layout) e a revisão em contexto limpo (o `revisor`). O perfil do `ADMIN`
é o Tiago Melo (TI).

## 1. O que entra

| | O quê | De onde vem o desenho |
|---|---|---|
| Login | A T-01 com o e-mail e a senha já preenchidos e, embaixo, **os perfis**: tocar num cartão entra como aquela pessoa. A aba Eu ganha **Trocar de perfil**, que volta ao login **sem apagar o que foi feito** (a Fulana registra, a Beltrana classifica e aprova, no mesmo aparelho) | `ui-ux.md` §7.7 |
| J1 | Registrar a NC (já existe) | §7.6 |
| J2 | Triagem (definir o aprovador) e Classificação (Maior/Menor, justificativa, publicar, submeter, aprovar) | §7.9 |
| J3 | Contenção: publicar, preencher a execução e a disposição, submeter, aprovar | §7.10 |
| J4 | Investigação A3: as etapas, as hipóteses, a causa direta e a raiz, submeter com a lista do que falta | §7.5 |
| J5 | Ação corretiva: o plano, submeter o plano, a execução, o Finalizar (a Verificação nasce sozinha) | §7.4 |
| J6 | Enviar a NC para fechamento: riscos, mudanças no SGQ e o checklist de verdade | §7.3 |
| J7 | Verificação: eficaz, parcialmente eficaz (nova ação) ou não eficaz (reabre a investigação e a NC) | §7.11 |
| J8 | Aprovar ou reprovar, agora em qualquer item, não só na NC-0038 | §8.2 |
| J9 | Reabrir uma NC fechada (com motivo) | `fluxo-app.md` J9 |
| J10 | Comentar com menção (já existe), agora com quem está logado | §7.3 |
| Computador | Acima de 1024 px: a doca embaixo, a T-04 em tabela, a T-06 e a T-07 do computador, as folhas viram janelas | §6.1, §7.2 a §7.5 |

**As regras** seguem as do backend, numa versão pequena dentro do protótipo: o estado de cada item
(Rascunho, Aberta, Em aprovação, Fechada, Cancelada), quem pode o quê (o papel e a atribuição,
como o `podeExecutar`), a etapa da NC calculada pelos filhos (`fluxo-app.md` §4) e as pendências
de cada perfil montadas a partir dos itens (`fluxo-app.md` §5), não mais escritas à mão.

## 2. Os perfis (proposta)

| Pessoa | Papel | Para testar |
|---|---|---|
| Fulana Souza | `EDITOR`, Produção | Registrar, conter, investigar, executar a ação, enviar para fechamento |
| Beltrana Lima | `APROVADOR`, Qualidade | Triagem, classificar, aprovar e reprovar, verificar a eficácia, reabrir |
| Rui Santos | `GERENTE`, Qualidade | Tudo o que a Beltrana faz, e ver tudo |
| Vera Dias | `VISUALIZADOR` | Só ler: os botões que ela não pode usar não aparecem |

Hoje a Fulana é responsável **e** aprovadora; separar os papéis deixa o teste mais claro (quem
aprova é outra pessoa, como na fábrica).

## 3. Como fica por dentro

- **Um arquivo só** (`docs/prototipo/andon-b4.html`), publicado em dois lugares: o **GitHub
  Pages** (https://fellipemnds.github.io/qualityhub/, a branch `gh-pages`, montada pelo
  `docs/prototipo/pagina.sh`) e o link do Claude.
- **O estado fica guardado no navegador** (para recarregar a página não apagar o teste); o
  "Recomeçar o protótipo" volta tudo ao começo.
- Continua descartável: não vira código do produto. A C0 começa do zero, com React e shadcn.

## 4. A ordem (cada fatia termina publicada e testável)

1. **A base:** o login com os perfis, o modelo dos itens com o ciclo de vida, as permissões, as
   pendências calculadas e a T-07 genérica (a tela do item filho). As três jornadas de hoje
   continuam funcionando.
2. **J2 e J3:** triagem, classificação, contenção.
3. **J4:** a investigação A3.
4. **J5, J7 e J9:** a ação, a verificação e o reabrir.
5. **J6 e J8 completos:** o envio da NC com o checklist de verdade e a decisão em qualquer item.
6. **O computador.**
7. **A revisão em contexto limpo** (o `revisor`) e o **roteiro novo**, com tarefas por perfil.

São umas **4 a 6 sessões**. O teste com os colegas fica para depois da fatia 7.

## 5. Para Matthew decidir

1. Os perfis do §2 (e se a Fulana continua aprovadora).
2. A J11 (usuários e setores, `ADMIN`) e a J12 (relatórios, `GERENTE`) entram? Ficaram de fora
   da proposta: não são o ciclo da NC, e o teste é sobre ele.
3. A nova data do teste.
