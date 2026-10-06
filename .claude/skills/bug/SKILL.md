---
name: bug
description: Registra um bug novo ou fecha um bug corrigido nos documentos do projeto (esquema-backend §7, plano, CLAUDE.md), sem esquecer nenhum lugar. Use quando um bug for achado (revisão, auditoria, teste), quando o conserto de um bug estiver pronto, ou quando Matthew chamar /bug.
---

# Bug (registrar ou fechar)

Só documentos: o teste que falha e o conserto seguem a regra do `CLAUDE.md` ("bug começa por
um teste que falha"), com a skill `agent-skills:test-driven-development` (o padrão Prove-It).
Copie o formato das linhas vizinhas; não invente um novo.
Peça antes do commit.

## Registrar

1. **`docs/esquema-backend.md` §7:** linha nova com o próximo número livre (`Bxx`). Colunas:
   - **Problema:** o efeito em negrito, depois o mecanismo e de onde veio (revisão,
     auditoria, teste, com a data);
   - **Onde:** arquivos ou funções;
   - **Correção:** o que fazer, o teste que vai falhar primeiro e a **fase**.
2. **`esquema-backend.md`, histórico:** a próxima versão,
   `| <AAAA-MM-DD> | v<x.yy> — Bxx registrado (<resumo>) |`.
3. **`docs/plano-implementacao.md`:**
   - na tabela da fase, a entrega (e a ordem, se ela importa);
   - na **rastreabilidade (§8)**, o `Bxx` na linha da fase;
   - no histórico, a linha da versão do plano.
4. **`CLAUDE.md`:** o intervalo `B1–Bxx` (na tabela de documentos e em "Bugs conhecidos") e,
   em "Bugs conhecidos", o bug entre os abertos, com a fase.

Bug sem fase decidida: pergunte a Matthew antes do passo 3.

## Fechar

Só depois do teste verde, da suíte completa e do commit `fix:` (o número do bug na mensagem).

1. **`esquema-backend.md` §7:** `✅` depois do número (`| **Bxx** ✅ |`) e, no fim da coluna
   Correção, `**Corrigido na <fase>** (<AAAA-MM-DD>): <o que mudou>. Testes: <nome do
   teste e arquivo>`.
2. **`esquema-backend.md`, histórico:** `| <AAAA-MM-DD> | v<x.yy> — Bxx corrigido (<fase>): <resumo> |`.
3. **`CLAUDE.md`, "Bugs conhecidos":** o bug sai dos abertos e entra na frase dos corrigidos.
   Se ele mudou uma regra que a seção de arquitetura ou de entidades descreve, atualize lá
   também.
4. **`handoff.md`:** o bug sai do "Próximo passo".

## Conferir

`git grep -n "Bxx"`: todo lugar onde o bug aparece está coerente com o estado novo (aberto ou
✅)? Mostre os arquivos e a mensagem (`docs: Bxx registrado` ou `docs: Bxx corrigido`) e
espere o ok.
