#!/usr/bin/env bash
# Foto do ambiente de desenvolvimento, para comparar o PC do trabalho com o de casa (SETUP.md §12.5).
#
#   npm run ambiente -- trabalho   grava a foto desta máquina em docs/ambiente/trabalho.txt
#   npm run ambiente -- casa       idem, em docs/ambiente/casa.txt
#   npm run ambiente -- comparar   mostra a diferença entre as duas fotos
#
# A foto não tem data nem hora (senão toda comparação acusaria diferença; a data fica no commit) e nunca tem segredos:
# do .env, só os nomes das chaves.
set -uo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"
pasta="$raiz/docs/ambiente"

if [ "${1:-}" = "comparar" ]; then
    if [ ! -f "$pasta/trabalho.txt" ] || [ ! -f "$pasta/casa.txt" ]; then
        echo "Falta uma das fotos em docs/ambiente/ (trabalho.txt e casa.txt)."
        exit 1
    fi
    if diff -u --label trabalho "$pasta/trabalho.txt" --label casa "$pasta/casa.txt"; then
        echo "Os dois ambientes estão iguais."
    fi
    exit 0
fi

maquina="${1:-}"
if [ "$maquina" != "trabalho" ] && [ "$maquina" != "casa" ]; then
    echo "Uso: npm run ambiente -- trabalho | casa | comparar"
    exit 1
fi

# O nvm é uma função do shell: sem carregá-lo, o script não o enxerga
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" >/dev/null

# A primeira linha da saída de um comando, ou "não instalado"
versao() {
    if command -v "$1" >/dev/null 2>&1; then
        "$@" 2>/dev/null | head -1
    else
        echo "não instalado"
    fi
}

# Extensões do VS Code do lado Windows: o cmd.exe reclama se a pasta atual estiver dentro do WSL
extensoes_windows() {
    if command -v cmd.exe >/dev/null 2>&1; then
        (cd /mnt/c 2>/dev/null && cmd.exe /c "code --list-extensions --show-versions" 2>/dev/null | tr -d '\r' | sort)
    else
        echo "indisponível (sem acesso ao Windows)"
    fi
}

chaves_env() {
    cd "$raiz" || return
    if [ ! -f .env ]; then
        echo "sem .env"
        return
    fi
    local faltando
    faltando="$(comm -13 <(grep -oE '^[A-Z_]+' .env | sort -u) <(grep -oE '^[A-Z_]+' .env.example | sort -u))"
    if [ -z "$faltando" ]; then
        echo "todas as chaves do .env.example"
    else
        echo "faltando: $(echo "$faltando" | tr '\n' ' ')"
    fi
}

migrations() {
    cd "$raiz" || return
    local saida
    saida="$(timeout 60 npx --no-install prisma migrate status 2>&1)"
    if echo "$saida" | grep -q "Database schema is up to date"; then
        echo "em dia"
    elif echo "$saida" | grep -q "have not yet been applied"; then
        echo "PENDENTES — rode npm run preparar"
    else
        echo "banco fora do ar ou erro (docker compose up -d)"
    fi
}

mkdir -p "$pasta"
arquivo="$pasta/$maquina.txt"

{
    echo "# Ambiente: $maquina"
    echo "hostname: $(hostname)"
    echo
    echo "## Sistema e ferramentas"
    echo "ubuntu: $(versao lsb_release -ds)"
    echo "nvm: $(command -v nvm >/dev/null 2>&1 && nvm --version || echo 'não instalado')"
    echo "nvm (node padrão): $(command -v nvm >/dev/null 2>&1 && nvm version default || echo '-')"
    echo "node: $(versao node -v)"
    echo "npm: $(versao npm -v)"
    echo "git: $(versao git --version)"
    echo "docker: $(versao docker --version)"
    echo "docker compose: $(versao docker compose version)"
    echo "gh: $(versao gh --version)"
    echo "claude code: $(versao claude --version)"
    echo
    echo "## Contas e configuração"
    echo "git user.name: $(git config --global user.name || echo '-')"
    echo "git user.email: $(git config --global user.email || echo '-')"
    echo "gh: $(gh auth status 2>&1 | grep -oE 'account [^ ]+' | head -1 || echo 'sem login')"
    echo "gh escopos: $(gh auth status 2>&1 | grep -oE "Token scopes: .*" | head -1 || echo '-')"
    echo
    echo "## Projeto"
    echo ".env: $(chaves_env)"
    echo "banco (docker): $(docker ps --filter name=qualityhub_db --format '{{.Image}}' 2>/dev/null | grep . || echo 'parado')"
    echo "migrations: $(migrations)"
    echo
    echo "## VS Code — extensões no WSL"
    if command -v code >/dev/null 2>&1; then code --list-extensions --show-versions 2>/dev/null | sort; else echo "code indisponível"; fi
    echo
    echo "## VS Code — extensões no Windows"
    extensoes_windows
} >"$arquivo"

echo "Foto gravada em docs/ambiente/$maquina.txt"
echo "Mudanças desde a última foto desta máquina: git diff docs/ambiente/$maquina.txt"
echo "Comparar com o outro PC: npm run ambiente -- comparar"
