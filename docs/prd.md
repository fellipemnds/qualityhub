# QualityHub — PRD (Documento de Requisitos de Produto)

> **O que é este documento:** o *quê* e o *porquê* do produto — problema,
> usuários, escopo, regras de negócio. O *como* (stack, camadas, schema,
> API) fica no TRD e no Esquema Backend.
>
> **Status:** v1 (2026-09-24). Consolidado a partir de `arquitetura.md`
> (§1, §2, §5, §6, §15), `changelog-arquitetura.md` e leitura do código
> atual — onde divergiam, o código venceu. Perguntas em aberto revisadas
> com a analista de qualidade no mesmo dia (§9).

---

## 1. Problema

A empresa gerencia Não Conformidades (NCs) em **planilha + e-mail**. Isso
falha em três pontos que a ISO 9001:2015 (cláusula 10.2) cobra:

1. **Evidência dispersa** — a conversa sobre a NC mora no e-mail, o
   registro mora na planilha; um auditor não consegue reconstruir o que
   aconteceu.
2. **Nada impede fechar sem concluir** — uma NC pode ser marcada como
   resolvida sem investigação de causa nem ação definida.
3. **Sem trilha confiável** — não há registro imutável de quem fez o quê,
   quando.

## 2. Objetivo

Uma aplicação web interna, **single-tenant** (uma empresa), que conduz a
NC do registro à verificação de eficácia, **impedindo pular etapas** e
produzindo uma trilha de auditoria que um auditor externo aceite como
evidência (ISO 10.2.2).

### Princípio do produto

> **Funcional e sem risco de falha vale mais que entregar rápido.** O time
> não tem pressa para começar a usar. Na dúvida entre "mais simples agora"
> e "mais robusto", escolher robusto — e entre "mais uma peça de
> infraestrutura" e "menos coisa que pode quebrar", escolher menos.

### Métricas de sucesso

1. **Planilha aposentada** — 100% das NCs novas registradas no sistema a
   partir da data de corte.
2. **Auditoria passa com o sistema** — uma auditoria externa usa só o
   sistema como evidência da cláusula 10.2, sem achados sobre o registro
   de NCs.
3. **Zero falhas em uso** — nenhum bug que trave o fluxo ou perca dados
   nos primeiros meses de uso real.

## 3. Usuários

### 3.1 Pessoas reais

| Pessoa | O que faz no sistema | Papéis |
|---|---|---|
| Colaborador de área | Registra NC, executa contenção, investiga, executa ação corretiva | `EDITOR` |
| Analista de qualidade (QA) | Tudo do colaborador + classifica, aprova, verifica eficácia | `EDITOR`, `APROVADOR` |
| Gestor da qualidade | Tudo do QA + cancela, reatribui, relatórios | `EDITOR`, `APROVADOR`, `GERENTE` |
| Auditor externo, diretoria | Só leitura | `VISUALIZADOR` |
| TI | Contas, papéis e setores — **não** mexe em NC | `ADMIN` |

### 3.2 Dois eixos de permissão

- **Papel** responde *"o que você pode fazer no sistema"*. Papéis se
  **somam** (sem hierarquia, sem um papel anular outro).
- **Atribuição** responde *"em quais itens"*. Cada item tem um grupo de
  **colaboradores** e no máximo **um aprovador**.

Um QA com papel `APROVADOR` continua **não** podendo aprovar um item onde
ele não é o aprovador designado.

## 4. Escopo

### 4.1 MVP — já construído (backend)

- Ciclo completo da NC com as seis entidades (§5), rascunho, publicação,
  aprovação, reabertura, cancelamento
- Atribuição de colaboradores e aprovador
- Trilha de auditoria imutável em toda escrita
- Login + definição de senha por convite (token de uso único)
- Criação de usuários e concessão de papéis
- Listagem de NCs com filtros (estado, origem, classificação, período,
  "minhas") e paginação
- **Ajustes decididos em §9, feitos na A3 (2026-10-02):** planos de ação
  aprovados antes de submeter a investigação, e a NC exigindo toda
  investigação fechada (RN-21, RN-24); Ação Corretiva nascendo ligada a
  uma investigação aberta da mesma NC (RN-49); cancelar investigação só
  com as ações resolvidas (RN-50); `NAO_EFICAZ` reabrindo só o que
  estiver fechado e `PARCIALMENTE_EFICAZ` copiando todos os
  colaboradores (RN-23); item filho herdando o aprovador da NC (RN-46);
  rascunho que não se cancela, só se exclui (RN-06); atribuições só em
  rascunho ou aberto (RN-47); retirar da aprovação (RN-48)

### 4.2 MVP — falta construir

**Ajustes no que já existe** (decididos em §9):

| Item | Regra |
|---|---|
| Criar NC já com colaboradores, num passo só | RF-01 |

**Funcionalidades novas:**

| Item | Requisito |
|---|---|
| Feed: comentários, respostas, menções `@`/`#` | RF-11 |
| Gerenciamento de usuários: listar, revogar papel, inativar | RF-15 |
| Etapa calculada da NC ("em investigação", "em verificação"...) | RF-16 |
| Tela "Minhas pendências" | RF-17 |
| Anexos (imagens e PDF) | RF-18 |
| Relatórios do gestor | RF-19 |
| Cadastro de setores | RF-20 |
| Frontend inteiro | — (depende do Fluxo do App e do UI/UX) |

### 4.3 Fora do MVP (fundação preparada)

Notificações por e-mail (a fila "Minhas pendências" cobre o MVP) ·
"esqueci minha senha" (o tipo de token já existe) · auditorias internas ·
controle de documentos · treinamentos · fornecedores (SCAR) · ações
preventivas autônomas · SSO · **aprovação por auditores** (interno ou
externo) das NCs da própria Garantia da Qualidade, talvez por link
externo temporário — ideia de 2026-10-07, para refinar (`idea-refine`)
antes de entrar em fase.

---

## 5. O processo

### 5.1 Visão geral

```
                      ┌─► Contenção (0..N) ─────────────────────┐
                      │   "apagar o incêndio"                   │
NC ──► Classificação ─┤                                         ├─► Fechamento da NC
       (1..N)         │                                         │   (portão FECHAMENTO)
                      └─► Investigação (1..N) ──► Ação Corretiva ┘
                          "achar a causa"         "eliminar a causa"
                                                   (plano aprovado)
                                                        │
                                                        ▼  continua após o fechamento
                                                  execução ──► Verificação
                                                               "funcionou?"
```

Contenção e Investigação correm **em paralelo** (RN-19). A ISO separa
**correção** (conter o problema — `Contencao`) de **ação corretiva**
(eliminar a causa — `AcaoCorretiva`).

A NC fecha quando **a investigação está aprovada**, e a investigação só
é aprovada com os planos das ações que ela propõe já aprovados (o A3
inclui as contramedidas). A investigação pode concluir sem nenhuma ação
corretiva (Q17). A NC não espera a ação terminar. Execução e verificação de eficácia seguem depois; se a
verificação mostrar que a ação não funcionou, a NC é reaberta
automaticamente (§5.4).

### 5.2 As seis entidades

| Entidade | Para que serve | Quem conduz | Aprovação | Particularidade |
|---|---|---|---|---|
| **Não Conformidade** | O registro do problema | `EDITOR` | Portão `FECHAMENTO` | Aprovador só é exigido na hora de submeter pra fechar, não ao publicar |
| **Classificação** | Maior / Menor, com justificativa | Só `APROVADOR`/`GERENTE` (RN-20) | Portão único | Reclassificar = criar nova; a antiga fica no histórico |
| **Contenção** | Ação imediata + destino (disposição) | `EDITOR` | Portão único | Disposição: `ACEITO`, `CORRIGIDO`, `ANULADO`, `EM_ANALISE` — termos genéricos, servem qualquer área, não só fábrica. Falhou? Cria outra, não reabre |
| **Investigação** | Causa raiz, pelo método A3 SPS | `EDITOR` | Portão único | 1 "real problema" = 1 investigação. Hipóteses classificadas em causa direta / fator contribuinte / sem relação. Só é submetida com os planos das suas ações aprovados (RN-24). Não reabre manualmente |
| **Ação Corretiva** | Plano para eliminar a causa + execução | `EDITOR` | **Só o plano** é aprovado | Nasce ligada a uma investigação aberta (RN-49). Aprovado o plano, o colaborador executa e finaliza **sem nova aprovação** — isso gera a Verificação automaticamente |
| **Verificação** | A ação funcionou? | Só `APROVADOR` colaborador | Nenhuma — conclui direto | Nunca criada à mão. Nasce já aberta, com prazo (hoje + N dias informados ao finalizar a ação) e com o aprovador da Ação Corretiva atribuído |

### 5.3 Estados

Todas as seis entidades usam os mesmos cinco estados:

| Estado | Significado | Tem código? | Pode editar? | Pode apagar? |
|---|---|---|---|---|
| `RASCUNHO` | Sendo escrito, ainda não é oficial | Não | Sim (colaboradores) | Sim |
| `ABERTO` | Oficial, trabalho em andamento | Sim (`NC-2026-0042`) | Sim (colaboradores) | Não |
| `EM_APROVACAO` | Aguardando o aprovador | Sim | **Não** | Não |
| `FECHADO` | Concluído | Sim | Não | Não |
| `CANCELADO` | Abandonado, fica visível | Sim | Não | Não |

**Reprovar não é um estado:** o item volta a `ABERTO` com o motivo
registrado, pra ser corrigido e resubmetido.

**Retirar da aprovação** também não: quem enviou percebe um erro e
traz o item de volta a `ABERTO` sem esperar o aprovador (RN-48).

**Etapa da NC** — o usuário vai querer ver "em que pé está" a NC
("aguardando classificação", "em investigação", "em verificação"...).
Isso é **calculado** a partir dos filhos, nunca armazenado. A lista exata
de etapas se define no Fluxo do App.

### 5.4 Resultado da Verificação

| Resultado | O que o sistema faz automaticamente |
|---|---|
| `EFICAZ` | Nada — ciclo encerrado |
| `PARCIALMENTE_EFICAZ` | Cria uma **nova Ação Corretiva** em rascunho, na mesma investigação, com **todos os colaboradores** da ação anterior |
| `NAO_EFICAZ` | **Reabre a Investigação e a NC — só as que estiverem `FECHADAS`**, com motivo automático. As que já estiverem abertas ficam como estão; o resultado fica na auditoria |

---

## 6. Requisitos funcionais

Legenda: ✅ pronto · 🔧 pronto, com ajuste decidido · ⬜ a construir

| ID | Requisito | ISO 10.2 | Status |
|---|---|---|---|
| RF-01 | Registrar NC: título, descrição, requisito violado, processo afetado, setor, data de detecção, origem (auditoria interna/externa, operação, reclamação de cliente), cliente. **Colaboradores podem ser escolhidos no mesmo passo** | a); 10.2.2 a) | 🔧 |
| RF-02 | Código legível único por ano (`NC-2026-0042`), sem buracos — rascunho não consome número | 10.2.2 | ✅ |
| RF-03 | Classificar NC (Maior/Menor) com justificativa, aprovável, reclassificável | b)1 | ✅ |
| RF-04 | Registrar contenção e disposição | a)1, a)2 | ✅ |
| RF-05 | Investigação de causa raiz pelo método **A3 SPS** (inclui Ishikawa e 5 Porquês como etapas), com hipóteses testadas | b)1, b)2, b)3 | ✅ backend · formulário A3 no frontend |
| RF-06 | Plano de ação corretiva **aprovado antes da execução**; execução registrada com evidência | c) | ✅ |
| RF-07 | Verificação de eficácia com resultado em três níveis e reação automática (§5.4) | d) | ✅ |
| RF-08 | NC só fecha com classificação e investigações aprovadas (a investigação, só com os **planos de ação** aprovados) e nenhuma contenção pendente; reabrível | c), d) | ✅ |
| RF-09 | Rascunhos visíveis a todos, editáveis só pelos colaboradores | — | ✅ |
| RF-10 | Grupo de colaboradores + um único aprovador por item | — | ✅ |
| RF-11 | Feed por item: eventos do sistema + comentários com respostas e menções `@pessoa` / `#item` | 10.2.2 a) | ⬜ |
| RF-12 | Trilha de auditoria imutável de toda ação | 10.2.2 a), b) | ✅ |
| RF-13 | Login e definição de senha por convite (token de uso único, 72 h) | — | ✅ |
| RF-14 | Registrar revisão de riscos/oportunidades e mudanças no SGQ na NC | e), f) | ✅ |
| RF-15 | Gerenciar usuários: listar/buscar, revogar papel, inativar (RN-43) | — | ⬜ |
| RF-16 | Ver a etapa atual de cada NC na listagem e no detalhe | — | ⬜ |
| RF-17 | **"Minhas pendências"**: o que aguarda a pessoa — itens para aprovar, para executar, verificações a concluir, prazos vencendo ou vencidos | — | ⬜ |
| RF-18 | **Anexos** em qualquer item: imagens e PDF, com limite de tamanho, acessíveis só pelo sistema (RN-45; onde ficam guardados: TRD §8) | 10.2.2 | ⬜ |
| RF-19 | **Relatórios do gestor**: (1) NCs abertas por setor e por origem; (2) tempo médio de detecção → fechamento, por período e classificação; (3) Ações Corretivas e Verificações atrasadas, e com quem estão; (4) eficácia e reincidência — distribuição dos resultados de verificação, NCs reabertas, causas-raiz que se repetem | — | ⬜ |
| RF-20 | **Cadastro de setores** pelo `ADMIN` (RN-44) | — | ⬜ |

---

## 7. Regras de negócio

> Os números **RN-xx** são os mesmos do documento original: o código e o
> changelog os citam. Regras alteradas estão marcadas com **(alterada)**.

### Ciclo de vida
| ID | Regra |
|---|---|
| RN-01 | Transição fora dos estados permitidos é recusada |
| RN-02 | O código é atribuído ao **publicar**; rascunho não consome número |
| RN-03 | Código é imutável e único |
| RN-04 | Reprovar exige motivo; o item volta a `ABERTO` no mesmo portão |
| RN-05 | Reabrir exige motivo e fica registrado |
| RN-06 | **(alterada)** Cancelar exige motivo; nunca apaga; vale **só para itens publicados** (`ABERTO` ou `EM_APROVACAO`). Rascunho não se cancela: exclui-se (RN-09) — Q14 |
| RN-07 | Toda escrita gera registro de auditoria, junto e de forma indivisível |
| RN-07b | **(nova)** Edição permitida em `RASCUNHO` e `ABERTO`; bloqueada a partir de `EM_APROVACAO` — publicar formaliza, não trava |
| RN-48 | **(nova)** Um colaborador pode **retirar da aprovação** um item `EM_APROVACAO`: ele volta a `ABERTO`, no mesmo portão, sem registro de decisão (não é reprovação). Vale para quem pode submeter o item (na Classificação, RN-20). Auditado — Q16 |

### Rascunho
| ID | Regra |
|---|---|
| RN-08 | Rascunho é visível a quem vê a NC; só a **edição** é restrita |
| RN-09 | Rascunho pode ser excluído de verdade por um colaborador; a auditoria guarda que existiu |
| RN-10 | Rascunho não é evidência: fora de relatórios e das guardas de fechamento |
| RN-11 | Rascunho não é mencionável por `#` (não tem código) |

### Atribuições
| ID | Regra |
|---|---|
| RN-12 | Todo item publicado tem ≥1 colaborador |
| RN-13 | **(alterada)** Itens com aprovação exigem exatamente um aprovador — **na hora de submeter**, não de publicar (a NC nasce antes de a triagem designar um QA) |
| RN-14 | Quem cria vira colaborador automaticamente |
| RN-15 | Editar exige papel `EDITOR` **e** ser colaborador do item |
| RN-16 | Aprovar/reprovar exige papel `APROVADOR` **e** ser **o** aprovador designado |
| RN-17 | Reabrir exige só papel `APROVADOR`, sem atribuição |
| RN-18 | **(alterada)** Dividida em duas: **gerenciar colaboradores** — qualquer `EDITOR`/`GERENTE`, **sem precisar já estar no item** (auto-organização do time; tudo auditado); **definir aprovador** — só `APROVADOR`/`GERENTE`, e o escolhido precisa ter papel `APROVADOR` |
| RN-46 | **(nova)** Item filho **nasce com o aprovador da NC** (se a NC já tiver um), e pode ser trocado depois por quem pode definir aprovador. Filho publicado sem aprovador entra na **triagem**, junto com as NCs sem aprovador — Q13 |
| RN-47 | **(nova)** Atribuições (colaboradores e aprovador) só mudam com o item em `RASCUNHO` ou `ABERTO`. Única exceção: em `EM_APROVACAO`, o `GERENTE` troca o aprovador (férias, saída da empresa), auditado. Em `FECHADO` e `CANCELADO`, nada muda — Q15 |

### Fluxo da NC
| ID | Regra |
|---|---|
| RN-19 | Contenção e investigação correm em paralelo |
| RN-20 | Classificar (criar, editar, publicar, submeter, excluir) é exclusivo de `APROVADOR`/`GERENTE` |
| RN-21 | **(alterada, Q17)** Submeter a NC para fechamento exige: ≥1 Classificação `FECHADA`; ≥1 Investigação `FECHADA`, e **toda** Investigação não cancelada `FECHADA`; nenhuma Contenção pendente (RN-22); riscos revisados e mudanças no SGQ preenchidos. A NC **não** confere as Ações Corretivas: quem confere os planos é a Investigação (RN-24). Execução e Verificação **não** travam o fechamento |
| RN-22 | Contenção não é obrigatória; se existir, precisa estar `FECHADA` ou `CANCELADA` |
| RN-23 | **(alterada)** Verificação com resultado diferente de `EFICAZ` dispara a reação automática da §5.4 |
| RN-24 | **(alterada, Q17)** Investigação só é submetida com método, conteúdo do A3, causa direta e causa raiz preenchidos, todas as hipóteses completas, e **toda** Ação Corretiva não cancelada ligada a ela com o plano aprovado. Sem nenhuma ação, também pode ser submetida |
| RN-25 | **(alterada)** Ação Corretiva só é finalizada com data de execução e evidência — sem aprovação da execução |
| RN-26 | **(alterada)** Reclassificar = nova Classificação; a anterior fica no histórico. *(O campo "classificação atual" na NC foi removido — ninguém definiu qual é "a atual" quando há várias.)* |
| RN-41 | **(nova)** Verificação só é concluída por colaborador com papel `APROVADOR` |
| RN-42 | **(nova)** Contenção, Classificação e Investigação não são reabertas manualmente — cria-se uma nova. Só a NC é reaberta manualmente (a Investigação, só pela reação a `NAO_EFICAZ`) |
| RN-49 | **(nova)** Ação Corretiva **nasce ligada** a uma Investigação da mesma NC, **em `ABERTO`**: nem em rascunho, que ainda não existe formalmente, nem depois do envio. O vínculo não pode ser apagado. Assim nenhuma ação aparece depois que a investigação foi enviada, e nenhuma fica solta: investigação com ação está sempre publicada, e item publicado não se exclui, só se cancela (RN-50). Única exceção: a ação criada pelo `PARCIALMENTE_EFICAZ` (§5.4), na mesma investigação, mesmo fechada — Q17 |
| RN-50 | **(nova)** Cancelar uma Investigação exige que todas as Ações Corretivas ligadas a ela estejam `CANCELADAS` ou `FECHADAS`; senão, recusa com a lista das que faltam. Sem isso, a NC (que ignora investigação cancelada) fecharia com ações soltas — Q18 |
| RN-51 | **(nova)** Item filho novo (Contenção, Classificação, Investigação) só nasce com a NC **em `ABERTO`**. Em aprovação, quem quer acrescentar algo retira o envio (RN-48); fechada, reabre-se a NC (RN-17). Sem isso, a NC aprovada fechava com o filho novo em aberto, por fora da guarda de fechamento (RN-21) — Q24 |

### Aprovação
| ID | Regra |
|---|---|
| RN-27 | Auto-aprovação é permitida e **registrada** como tal |
| RN-28 | O feed exibe "Aprovado pelo próprio autor" |
| RN-29 | Configuração para proibir auto-aprovação — prevista, não implementada |

### Feed
| ID | Regra |
|---|---|
| RN-30 | Comentário tem a mesma visibilidade do item |
| RN-31 | Autor edita o próprio comentário, sem limite de tempo; marcador "editado" |
| RN-32 | Autor ou `GERENTE` exclui comentário |
| RN-33 | Comentário com respostas não pode ser excluído |
| RN-34 | Respostas têm um nível de profundidade |
| RN-35 | Editar recalcula menções; só menções **novas** notificam (na fila "Minhas pendências") |
| RN-36 | Editar não reordena o feed |
| RN-37 | Só comentários são editáveis após o fechamento; o resto exige reabertura |

### Autenticação e usuários
| ID | Regra |
|---|---|
| RN-38 | Mensagem de erro de login idêntica para qualquer falha |
| RN-39 | Token de convite guardado como hash; 72 h; uso único |
| RN-40 | Senha com mínimo de 12 caracteres na criação |
| RN-43 | **(nova)** O `ADMIN` pode **inativar** um usuário (bloqueia o login) ou **revogar um papel** específico. O sistema **recusa** inativar, ou revogar o papel `APROVADOR`, de quem é aprovadora designada de algum item em `RASCUNHO`, `ABERTO` ou `EM_APROVACAO` — e lista esses itens para o time reatribuir antes (Q23). Revogar os outros papéis não tem essa trava. Também recusa inativar, ou revogar o papel `ADMIN`, do **último `ADMIN` ativo**: sem ele, ninguém administra o sistema. Itens fechados mantêm o nome da pessoa (são evidência) |

### Setores e anexos
| ID | Regra |
|---|---|
| RN-44 | **(nova)** O `ADMIN` cria e renomeia setores. Setor com NC vinculada **não é apagado**, só desativado (some das opções de NCs novas; NCs antigas continuam apontando para ele). **Desativar exige o setor sem pessoas ativas**: o sistema recusa e lista quem ainda está nele, para o `ADMIN` mudar antes (as inativas ficam: é histórico). Setor desativado não entra em **escolha nova** (criar ou mudar o setor de uma NC ou de uma pessoa), e reativar uma pessoa cujo setor foi desativado é recusado até mudar o setor dela (Matthew, 2026-10-08) |
| RN-45 | **(nova)** Anexos aceitam só imagens e PDF, com limite de tamanho por arquivo (valor definido no TRD). Anexo segue a visibilidade do item. Anexo de item `FECHADO` não é removido (é evidência) |

---

## 8. Permissões

Como está no código hoje, mais as ações novas (marcadas com *).

| Ação | VISUALIZADOR | EDITOR | APROVADOR | GERENTE | ADMIN | Exige atribuição? |
|---|:-:|:-:|:-:|:-:|:-:|---|
| Ver tudo (inclusive rascunhos) | ✅ | ✅ | ✅ | ✅ | — | Não |
| Criar/editar/excluir rascunho | — | ✅ | — | ✅ | — | Colaborador |
| Publicar / submeter | — | ✅ | — | ✅ | — | Colaborador |
| Retirar da aprovação * | — | ✅ | — | ✅ | — | Colaborador (na Classificação, `APROVADOR`/`GERENTE`, RN-20) |
| Classificar | — | — | ✅ | ✅ | — | Colaborador (para editar) |
| Aprovar / reprovar | — | — | ✅ | ✅ | — | **Ser o aprovador** |
| Concluir verificação | — | — | ✅ | ✅ | — | Colaborador |
| Reabrir NC | — | — | ✅ | ✅ | — | Não |
| Cancelar | — | — | ✅ | ✅ | — | Ser o aprovador, ou `GERENTE` |
| Gerenciar colaboradores | — | ✅ | — | ✅ | — | Não — só em `RASCUNHO`/`ABERTO` (RN-47) |
| Definir aprovador | — | — | ✅ | ✅ | — | Não — só em `RASCUNHO`/`ABERTO`; em `EM_APROVACAO`, só `GERENTE` (RN-47) |
| Comentar | — | ✅ | ✅ | ✅ | — | Não |
| Anexar arquivo * | — | ✅ | ✅ | ✅ | — | Colaborador |
| Relatórios | — | — | — | ✅ | — | — |
| Gerenciar usuários e setores * | — | — | — | — | ✅ | — |

`ADMIN` **não** recebe permissão de negócio: quem administra contas não
aprova NC silenciosamente.

---

## 9. Decisões tomadas

Revisão das perguntas em aberto com Matthew e a analista de qualidade,
em 2026-09-24.

| # | Pergunta | Decisão |
|---|---|---|
| Q1 | Quando a NC pode fechar? | Quando **todos** os planos de Ação Corretiva (não cancelados) estiverem aprovados, com pelo menos um. Execução e Verificação não travam — **confirmado com a analista**. A regra anterior (não esperar nenhuma Ação Corretiva) tinha mudado sem registro → RN-21. **Revista na Q17** |
| Q2 | `NAO_EFICAZ` com NC/Investigação ainda abertas dava erro | Reabre **só o que estiver fechado**; o resto fica como está → §5.4 |
| Q3 | Quem assume a nova Ação Corretiva de `PARCIALMENTE_EFICAZ`? | **Todos os colaboradores** da ação anterior → §5.4 |
| Q4 | Pessoa sai da empresa / muda de função | Inativar + revogar papel, **com trava** se for aprovadora de itens abertos → RN-43 |
| Q5 | Feed no MVP? | **Sim.** O time não tem pressa; o importante é estar funcional e sem risco de falha → princípio do produto (§2) |
| Q6 | Relatórios do gestor | Os quatro propostos → RF-19 |
| Q7 | Como a pessoa sabe que tem algo a fazer? | Tela **"Minhas pendências"** no MVP; e-mail depois → RF-17 |
| Q8 | Anexos no MVP? | **Sim**, só imagens e PDF, com limite de tamanho → RF-18, RN-45 |
| Q9 | Qualquer `EDITOR` gerencia colaboradores de qualquer item? | **Mantido** — auto-organização do time, tudo auditado → RN-18 |
| Q10 | Colaboradores na criação da NC? | **Sim**, na mesma tela → RF-01 |
| Q11 | Métricas de sucesso | Planilha aposentada, auditoria passa com o sistema, zero falhas em uso → §2 |
| Q12 | Quem mantém os setores? | `ADMIN`, por tela; setor em uso é desativado, não apagado → RN-44 |

**Revisão cruzada dos documentos com o código** (2026-09-24, mesmo dia):

| # | Pergunta | Decisão |
|---|---|---|
| Q13 | Item filho nasce sem aprovador, e só `APROVADOR`/`GERENTE` pode definir um — o colaborador fica travado para enviar, sem ninguém ser avisado | **Filho herda o aprovador da NC**; filho sem aprovador vai para a triagem → RN-46 |
| Q14 | Rascunho pode ser cancelado, e vira item cancelado sem código, visível para sempre | **Rascunho só se exclui**; cancelar vale para itens publicados → RN-06 |

**Testes da fase A2** (2026-09-30, decisões de Matthew):

| # | Pergunta | Decisão |
|---|---|---|
| Q15 | Atribuições mudam em qualquer estado (inclusive item fechado ou cancelado)? | **Só em `RASCUNHO` e `ABERTO`.** Em `EM_APROVACAO`, só o `GERENTE` troca o aprovador — sem essa exceção, um aprovador ausente prenderia o item, e a única saída seria cancelar → RN-47 |
| Q16 | O colaborador pode desistir de um envio para aprovação? | **Sim**, volta a `ABERTO`, auditado. Regra de UX, sem impacto no processo → RN-48 |

**Guarda de fechamento, na A3** (2026-10-01, Matthew, confirmado com a analista):

| # | Pergunta | Decisão |
|---|---|---|
| Q18 | O que acontece com as ações quando a investigação é cancelada? | **O cancelamento é recusado** enquanto houver ação ligada que não esteja cancelada ou fechada; a pessoa resolve uma a uma. Cancelar as ações junto, sozinho, faria algo que ninguém pediu → RN-50 |
| Q17 | Quem confere os planos de ação: a NC ou a Investigação? | **A Investigação.** O QA não aprovaria a investigação, cujo A3 inclui as contramedidas, sem aprovar os planos que ela propõe. Ela só é submetida com os planos das suas ações aprovados, e pode fechar **sem nenhuma ação** ("pelo menos você investigou" — analista). A NC passa a exigir toda investigação não cancelada fechada. Para nenhuma ação escapar, ela nasce ligada a uma investigação aberta; a do `PARCIALMENTE_EFICAZ` é a exceção, e segue depois do fechamento como a execução e a verificação → RN-21, RN-24, RN-49. Substitui a Q1 |

**Classificação, reincidência e segregação** (2026-10-07, Matthew, a
partir de conversa com a analista). **Ainda não valem:** as RNs mudam quando a
fase for implementada (plano §8); até lá, o código segue as atuais.

| # | Pergunta | Decisão |
|---|---|---|
| Q19 | Com várias classificações, qual vale? | A **vigente** é a última aprovada; lista, filtro e relatório usam só ela. A anterior continua `FECHADA` no histórico, sem cancelar (RN-26, RN-42 seguem), e a Classificação continua sem `/cancelar`. Hoje o filtro da lista aceita qualquer classificação aprovada, e uma NC reclassificada aparece nos dois → RN-26 |
| Q20 | A classificação muda o que a NC exige para fechar? | **Sim.** **Menor:** ≥1 Contenção `FECHADA` (que pode ser a própria correção); investigação opcional, e a que existir precisa fechar. **Maior:** ≥1 Contenção **e** ≥1 Investigação `FECHADAS`. Nos dois, a Ação Corretiva **não** é obrigatória (quem confere é a investigação, Q17); a tela pede confirmação ao enviar investigação sem nenhuma ação → RN-21, RN-22 |
| Q21 | Como garantir que uma Menor é mesmo Menor, e pegar o problema que se repete? | **Abrangência**, obrigatória ao classificar como Menor: o QA vê **todas** as NCs dos últimos 12 meses (descrição e real problema), sem filtro por setor, e marca as relacionadas; a ligação fica registrada (inclusive "nenhuma"). Com **≥2 relacionadas** em 12 meses (a 3ª ocorrência), a Menor só é aceita com uma **justificativa específica** de por que não é Maior (escolha da analista). Quem decide se é o mesmo problema é a pessoa, não o sistema por texto |
| Q22 | Quem fez um item pode aprová-lo? | **Não.** Colaborador e aprovador são **excludentes por item**: o backend recusa definir como aprovador quem é colaborador, e incluir como colaborador quem é o aprovador (409, dizendo o que fazer); quem cria é colaborador, e só aprova se sair dos colaboradores. Sem exceção (nem em férias: esperar é melhor que aprovar o próprio trabalho). Com uma aprovadora só (a analista), a **Classificação perde o portão**: classificar já é o julgamento dela, e ela conclui direto, como na Verificação (a RN-21 segue, concluir leva a `FECHADA`). O filho **não herda** o aprovador da NC quando quem o cria é esse aprovador. Ficam de fora o gestor como segundo aprovador e a exceção de férias → RN-27 e RN-29 saem; RN-46 muda |
| Q23 | Quem escolhe o aprovador de um item? | **Também o colaborador** (`EDITOR`), nos itens em que é colaborador: o time reatribui sozinho, sem depender do gerente (confirmado com a analista, 2026-10-08). Valem as regras de hoje: o escolhido tem o papel `APROVADOR`, não pode ser colaborador do item (Q22) e, com o item `EM_APROVACAO`, a troca continua só do `GERENTE` (o colaborador retira antes, RN-48). Implementação na C2, com a Q22 |
| Q24 | Pode nascer item filho com a NC em aprovação ou fechada? | **Não: só com a NC `ABERTO`** (Matthew, 2026-10-09). A revisão da A6 mostrou que um filho criado com a NC em aprovação passava por fora da guarda de fechamento: a NC aprovada fechava com ele em rascunho → RN-51 |

Limite de tamanho e armazenamento dos anexos foram resolvidos no TRD (§8).

---

## Histórico

| Data | Mudança |
|---|---|
| 2026-09-24 | v1 — consolidação de `arquitetura.md` + changelog + código; decisões Q1–Q12 |
| 2026-09-24 | v1.1 — revisão cruzada com o código: RN-06 e RN-24 ajustadas, RN-46 nova (Q13, Q14) |
| 2026-09-30 | v1.2 — RN-47 (atribuições por estado) e RN-48 (retirar da aprovação), dos testes da A2 (Q15, Q16) |
| 2026-10-01 | v1.3 — planos de ação conferidos pela Investigação, não pela NC: RN-21 e RN-24 revistas, RN-49 nova (Q17); RN-50, cancelar investigação com ações pendentes (Q18) |
| 2026-10-02 | v1.4 — ajustes feitos na A3 passam para o §4.1; RF-07 e RF-08 prontos |
| 2026-10-07 | v1.5 — classificação e reincidência: vigente, exigências por classificação e abrangência (Q19–Q21), ainda sem mudar as RNs |
| 2026-10-07 | v1.6 — Q21 revista (3ª ocorrência aceita com justificativa); Q22, colaborador e aprovador excludentes e Classificação sem portão |
| 2026-10-08 | v1.7 — RN-43 detalhada (os três estados, só o `APROVADOR` trava, o último `ADMIN`); Q23, o colaborador escolhe o aprovador (implementação na C2) |
| 2026-10-08 | v1.8 — RN-44 detalhada: desativar exige o setor sem pessoas ativas; setor desativado fora das escolhas novas e do reativar |
| 2026-10-09 | v1.9 — RN-51 (filho novo só com a NC aberta), Q24 |
