#!/usr/bin/env bash
# Monta a página inteira do protótipo (o invólucro que o claude.ai põe sozinho ao publicar):
# serve para o GitHub Pages e para o teste no localhost.
# Uso: bash docs/prototipo/pagina.sh > index.html
set -euo pipefail
cat <<'HTML'
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<!-- "Adicionar à Tela de Início" no iPhone abre em tela cheia, sem a barra de endereço, e a página vai por trás do relógio -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Andon">
<style>
    :root { color-scheme: light; padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
    body { margin: 0; }
    img { max-width: 100%; }
    [hidden] { display: none !important; }
</style>
HTML
cat "$(dirname "$0")/andon-b4.html"
