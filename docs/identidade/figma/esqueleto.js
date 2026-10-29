// Esqueleto: transforma uma cópia de tela no seu estado Carregando, com a cara da própria tela
// (pedido de Matthew, 2026-10-28: as barras no meio não lembravam a tela). Cada texto vira uma
// barra por linha, e cada cópia de componente (botão, chip, avatar) ou ícone vira um bloco do mesmo
// tamanho; tudo no `fundo/selecao`, com o raio do `raio/*`. O que estiver dentro de um nó com o
// nome na lista `manter` (a doca, a barra do celular) fica como está.
//
// Como rodar: o Claude passa este arquivo para o `use_figma` sem o `export` e com a chamada no
// fim: `return await esqueleto("123:456")`. O alvo é o id da cópia que vai virar o Carregando:
// a troca não tem volta, então nunca no quadro original.

export async function esqueleto(alvo, manter = ["Shell/Doca", "Shell/Barra inferior", "Barra superior"]) {
    const raiz = await figma.getNodeByIdAsync(alvo);
    if (!raiz) throw new Error(`Alvo não achado: ${alvo}`);
    let pagina = raiz;
    while (pagina.type !== "PAGE") pagina = pagina.parent;
    await figma.setCurrentPageAsync(pagina);

    const V = {};
    for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
        for (const id of c.variableIds) {
            const v = await figma.variables.getVariableByIdAsync(id);
            V[v.name] = v;
        }
    }
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
    // o lugar do original no pai: a mesma posição, o mesmo tamanho e o mesmo encaixe no auto layout
    const ocupar = (original, novo) => {
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
        novo.name = `Esqueleto · ${original.name}`;
        original.remove();
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
    return { alvo, feito };
}
