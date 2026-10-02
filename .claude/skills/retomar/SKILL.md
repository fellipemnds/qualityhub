---
name: retomar
description: Rotina de chegada no computador (trabalho ou casa) — lê o handoff, confere branch, ambiente e plugins do Claude Code, compara com o outro PC e diz de onde retomar. Use quando Matthew disser "continuar de onde parei", no início da sessão, ou chamar /retomar.
---

# Retomar (chegada)

## 0. Preparar o shell

O mesmo passo 0 do `/trocar-pc`: `source ~/.nvm/nvm.sh`, `export PATH="$HOME/.local/bin:$PATH"`,
checks pelo código de saída.

## 1. Ler o handoff

`handoff.md` inteiro, antes de qualquer outra coisa.

## 2. Máquina e Git

- Máquina pelo `hostname` (como no `/trocar-pc`).
- `git fetch`, `git status -sb`. A branch atual é a do handoff? A remota está à frente?
  Diga, e sugira o `git pull`.
- Sem `docs/ambiente/<máquina>.txt`: é a primeira foto desta máquina.
  Siga o "Chegando em casa" do handoff (`SETUP.md` §12.1).

## 3. Ambiente, ferramentas e plugins

1. `npm run ambiente -- <máquina>`, depois `npm run ambiente -- comparar`.
2. **Ferramentas globais:** na foto, qualquer linha com "não instalado" (nvm, Node, npm, Git,
   Docker, gh, Claude Code) é alerta. Também é alerta: versão do Node diferente de 24,
   `gh` sem os escopos `repo` e `workflow`, banco fora do ar.
3. **Preparar:** se a foto disser que as migrations estão pendentes, ou faltar chave no `.env`,
   lembre do `npm run preparar` (ou da chave) antes de qualquer outra coisa.
4. **Plugins do Claude Code:** compare os habilitados (no `~/.claude/settings.json` e no
   `.claude/settings.json` do projeto) com os instalados nesta máquina:

   ```bash
   python3 - <<'EOF'
   import json, os
   raiz = os.getcwd()
   def ler(caminho):
       try:
           return json.load(open(os.path.expanduser(caminho)))
       except Exception:
           return {}
   habilitados = {**ler("~/.claude/settings.json").get("enabledPlugins", {}),
                  **ler(".claude/settings.json").get("enabledPlugins", {})}
   esperados = {nome for nome, ligado in habilitados.items() if ligado}
   instalados = ler("~/.claude/plugins/installed_plugins.json").get("plugins", {})
   aqui = {nome for nome, lista in instalados.items()
           if any(i.get("scope") == "user" or i.get("projectPath") == raiz for i in lista)}
   print("habilitados:", ", ".join(sorted(esperados)) or "nenhum")
   print("faltando nesta máquina:", ", ".join(sorted(esperados - aqui)) or "nenhum")
   EOF
   ```

   Faltando algum (por exemplo, `agent-skills@addy-agent-skills`): alerte com o nome exato e
   diga como instalar, pelo menu de plugins do Claude Code ou, no terminal,
   `claude plugin install <nome>`. Se a marketplace também não estiver cadastrada nesta máquina
   (`~/.claude/plugins/known_marketplaces.json`), ela vem antes.
   Sem nenhum `settings.json` com `enabledPlugins`, diga que não há referência para comparar.

## 4. O que contar a Matthew (poucas linhas)

- de onde retomamos (o §6 do handoff);
- o que difere do outro PC (o `comparar`) e o que mudou nesta máquina (o `git diff` da foto);
- os alertas do passo 3 (ferramenta, preparar, plugin), primeiro, se houver;
- prazo do handoff ou do `CONSTRAINTS.md` §5 que já venceu ou vence em até 30 dias,
  comparado com a data de hoje.

## 5. Registrar

Anote no `handoff.md` ("Última atualização" e o que a comparação mostrou).
Commit só com o ok.

## 6. Retomar

Pelo "Próximo passo", na regra do `CLAUDE.md`: diga se o item é algo que Matthew
já aprendeu e espere a confirmação antes de executar.
