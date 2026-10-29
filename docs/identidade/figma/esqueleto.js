// Esqueleto: transforma uma cópia de tela no seu estado Carregando, com a cara da própria tela
// (pedido de Matthew, 2026-10-28: as barras no meio não lembravam a tela). Cada texto vira uma
// barra por linha, e cada cópia de componente (botão, chip, avatar) ou ícone vira um bloco do mesmo
// tamanho; tudo no `fundo/selecao`, com o raio do `raio/*`. O que estiver dentro de um nó com o
// nome na lista `manter` (a doca, a barra do celular) fica como está.
//
// Como rodar: o Claude passa este arquivo para o `use_figma` sem os `export` e com a chamada no
// fim: `return await esqueleto("123:456")`. O alvo é o id da cópia que vai virar o Carregando:
// a troca não tem volta, então nunca no quadro original. Um Carregando ainda em cinza vira
// ASCII com `return await asciificar("123:456")`.
//
// O ASCII (decisão (t), 2026-10-29): cada barra e cada bloco cinza vira uma caixa de caracteres
// `░` (o esqueleto do ASCII Reveal), com a faixa `▒▓` parada numa diagonal que parte do canto
// superior esquerdo (a onda do Corner). Os caracteres saem na IBM Plex Mono, que desenha o `░` como
// meio-tom de pontos, só no Figma; no código, a `ui-monospace` do sistema.

const MANTER = ["Shell/Doca", "Shell/Barra inferior", "Barra superior"];
const GLIFO = {
    pequeno: { estilo: "Esqueleto/ASCII", tamanho: 12, w: 7.2, h: 16 },
    grande: { estilo: "Esqueleto/ASCII grande", tamanho: 18, w: 10.8, h: 22 },
};

const variaveis = async () => {
    const V = {};
    for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
        for (const id of c.variableIds) {
            const v = await figma.variables.getVariableByIdAsync(id);
            V[v.name] = v;
        }
    }
    return V;
};

// o lugar do original no pai: a mesma posição, o mesmo tamanho e o mesmo encaixe no auto layout
const ocupar = (original, novo, nome = `Esqueleto · ${original.name}`) => {
    const pai = original.parent;
    pai.insertChild(pai.children.indexOf(original), novo);
    novo.resize(Math.max(1, original.width), Math.max(1, original.height));
    if (pai.layoutMode && pai.layoutMode !== "NONE") {
        novo.layoutSizingHorizontal = original.layoutSizingHorizontal === "FILL" ? "FILL" : "FIXED";
        novo.layoutAlign = original.layoutAlign;
        novo.layoutGrow = original.layoutGrow;
    } else {
        novo.x = original.x;
        novo.y = original.y;
    }
    novo.name = nome;
    original.remove();
};

export async function asciificar(alvo) {
    const raiz = await figma.getNodeByIdAsync(alvo);
    if (!raiz) throw new Error(`Alvo não achado: ${alvo}`);
    let pagina = raiz;
    while (pagina.type !== "PAGE") pagina = pagina.parent;
    await figma.setCurrentPageAsync(pagina);
    const V = await variaveis();
    const fonte = { family: "IBM Plex Mono", style: "Regular" };
    await figma.loadFontAsync(fonte);
    const estilos = await figma.getLocalTextStylesAsync();
    for (const g of Object.values(GLIFO)) {
        g.id = estilos.find((s) => s.name === g.estilo)?.id;
        if (g.id) continue;
        const s = figma.createTextStyle();
        s.name = g.estilo;
        s.fontName = fonte;
        s.fontSize = g.tamanho;
        s.lineHeight = { unit: "PIXELS", value: g.h };
        s.description = "Só para o Carregando em ASCII (decisão (t)); no código, a ui-monospace do sistema.";
        g.id = s.id;
    }
    const cor = {
        ...figma.variables.setBoundVariableForPaint(
            { type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.4 } },
            "color",
            V["texto/apoio"],
        ),
        opacity: 0.6,
    };
    const origem = raiz.absoluteTransform;
    // a faixa: uma diagonal a 35% do caminho, repetida a cada 900 px de x + 1,4 × y
    const glifo = (x, y) => {
        const fase = ((x + y * 1.4) % 900) / 900;
        const d = Math.abs(fase - 0.35);
        return d < 0.012 ? "▓" : d < 0.035 ? "▒" : "░";
    };
    // a barra cinza; e a do antigo bloco escuro do título (no `texto/apoio`), que sobrou nos Carregando da T-06
    const doEsqueleto = (no) => [no, no.parent].some((n) => n?.name.startsWith("Esqueleto · "));
    const cinza = (no) =>
        no.type === "RECTANGLE" &&
        no.fills.some(
            (t) =>
                t.boundVariables?.color?.id === V["fundo/selecao"].id ||
                (t.boundVariables?.color?.id === V["texto/apoio"].id && doEsqueleto(no)),
        );
    const alvos = [];
    const visitar = (no) => {
        if (no.visible === false || MANTER.includes(no.name)) return;
        if (cinza(no)) alvos.push(no);
        else if ("children" in no) for (const filho of no.children) visitar(filho);
    };
    visitar(raiz);
    for (const r of alvos) {
        const g = r.height >= 18 ? GLIFO.grande : GLIFO.pequeno;
        const x0 = r.absoluteTransform[0][2] - origem[0][2];
        const y0 = r.absoluteTransform[1][2] - origem[1][2];
        const colunas = Math.max(1, Math.ceil(r.width / g.w));
        const linhas = Math.max(1, Math.ceil(r.height / g.h));
        const texto = [];
        for (let l = 0; l < linhas; l++) {
            let linha = "";
            for (let c = 0; c < colunas; c++) linha += glifo(x0 + c * g.w, y0 + l * g.h);
            texto.push(linha);
        }
        const caixa = figma.createFrame();
        caixa.fills = [];
        caixa.clipsContent = true;
        for (const canto of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) {
            const ligado = r.boundVariables?.[canto];
            if (ligado) caixa.setBoundVariable(canto, await figma.variables.getVariableByIdAsync(ligado.id));
        }
        ocupar(r, caixa, r.name.startsWith("Esqueleto · ") ? r.name : `Esqueleto · ${r.name}`);
        const t = figma.createText();
        caixa.appendChild(t);
        t.textStyleId = g.id;
        t.characters = texto.join("\n");
        t.fills = [cor];
        t.x = 0;
        t.y = Math.min(0, (caixa.height - g.h * linhas) / 2);
    }
    return { alvo, ascii: alvos.length };
}

export async function esqueleto(alvo, manter = MANTER) {
    const raiz = await figma.getNodeByIdAsync(alvo);
    if (!raiz) throw new Error(`Alvo não achado: ${alvo}`);
    let pagina = raiz;
    while (pagina.type !== "PAGE") pagina = pagina.parent;
    await figma.setCurrentPageAsync(pagina);

    const V = await variaveis();
    const tinta = figma.variables.setBoundVariableForPaint(
        { type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } },
        "color",
        V["fundo/selecao"],
    );
    const pintar = (no, raio) => {
        no.fills = [tinta];
        for (const canto of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) {
            no.setBoundVariable(canto, V[raio]);
        }
    };

    const feito = { texto: 0, bloco: 0 };
    const visitar = (no) => {
        if (no.visible === false || manter.includes(no.name)) return;
        if (no.type === "TEXT") {
            const tamanho = typeof no.fontSize === "number" ? no.fontSize : 14;
            const linhas = Math.max(1, Math.round(no.height / (tamanho * 1.45)));
            const caixa = figma.createFrame();
            caixa.fills = [];
            caixa.layoutMode = "VERTICAL";
            caixa.primaryAxisAlignItems = "CENTER";
            caixa.setBoundVariable("itemSpacing", V[tamanho >= 20 ? "espaco/3" : "espaco/2"]);
            ocupar(no, caixa);
            caixa.primaryAxisSizingMode = "FIXED";
            for (let i = 0; i < linhas; i++) {
                const barra = figma.createRectangle();
                caixa.appendChild(barra);
                barra.resize(
                    Math.max(1, caixa.width * (i === linhas - 1 && linhas > 1 ? 0.6 : 1)),
                    Math.round(tamanho * 0.75),
                );
                pintar(barra, "raio/chip");
            }
            feito.texto++;
            return;
        }
        if (["INSTANCE", "VECTOR", "BOOLEAN_OPERATION", "ELLIPSE"].includes(no.type)) {
            const bloco = figma.createRectangle();
            const redondo = Math.abs(no.width - no.height) < 2;
            ocupar(no, bloco);
            pintar(bloco, redondo ? "raio/pilula" : "raio/controle");
            feito.bloco++;
            return;
        }
        // a barra de um gráfico é um retângulo na cor do texto: vira cinza, no mesmo lugar
        if (
            no.type === "RECTANGLE" &&
            no.fills.some((t) =>
                ["texto/principal", "texto/apoio"].some((n) => t.boundVariables?.color?.id === V[n].id),
            )
        ) {
            no.fills = [tinta];
            feito.bloco++;
            return;
        }
        // um chip ou um selo feito à mão (um quadro baixo, com fundo ou contorno, só com texto ou
        // ícone dentro) é um bloco, como o componente que ele imita
        const temTinta = (campo) => Array.isArray(no[campo]) && no[campo].some((t) => t.visible !== false);
        // e um botão feito à mão na cor de ação também, mesmo com mais de um nível dentro
        const deAcao =
            Array.isArray(no.fills) &&
            no.fills.some((t) =>
                ["acao/primaria", "acao/destrutiva"].some((n) => t.boundVariables?.color?.id === V[n].id),
            );
        if (
            no.type === "FRAME" &&
            no.height <= 48 &&
            (deAcao ||
                ((temTinta("fills") || temTinta("strokes")) &&
                    no.children.every((c) => ["TEXT", "VECTOR", "BOOLEAN_OPERATION", "ELLIPSE"].includes(c.type))))
        ) {
            const bloco = figma.createRectangle();
            ocupar(no, bloco); // o `no` sai daqui: a altura vem do bloco, que ficou com ela
            pintar(bloco, bloco.height <= 28 ? "raio/pilula" : "raio/controle");
            feito.bloco++;
            return;
        }
        if ("children" in no) for (const filho of [...no.children]) visitar(filho);
    };
    visitar(raiz);
    return { alvo, feito, ...(await asciificar(alvo)) };
}
