// Acabar: liga às variáveis o que um quadro tem de solto (a cor, o texto, o espaço e o raio).
// É o primeiro conserto de uma tela que vem do wireframe para o mockup (B3, do item 6 em diante);
// o valor-solto.js confere depois. O que não tem par (um espaço de 56, por exemplo) volta numa
// lista, para decidir à mão: nada é inventado.
//
// Como rodar: o Claude passa este arquivo para o `use_figma` sem o `export` e com a chamada no
// fim: `return await acabar("123:456")`. O alvo é o id de um nó (uma tela, um componente).
//
// As regras:
// - cor: a semântica da coleção Cor mais perto no modo Claro, entre as que servem para aquilo
//   (fundo de quadro, texto ou borda); a distância é a do RGB;
// - texto: o estilo de texto mais perto pelo tamanho e, no empate, pelo peso;
// - espaço: o degrau do `espaco/*` (ou do `layout/*`, como a folga da doca) mais perto, se a
//   diferença for de até 4 px;
// - raio: o de meia altura ou mais é `raio/pilula`; até 4 é `raio/chip`, até 7 `raio/controle`,
//   até 16 `raio/card`, até 24 `raio/folha` (os cantos da folha que sobe no celular).
// As cópias de componente ficam de fora (o principal é acabado onde mora), e as máscaras também.

export async function acabar(alvo) {
    const raiz = await figma.getNodeByIdAsync(alvo);
    if (!raiz) throw new Error(`Alvo não achado: ${alvo}`);
    let pagina = raiz;
    while (pagina.type !== "PAGE") pagina = pagina.parent;
    await figma.setCurrentPageAsync(pagina);

    const colecoes = await figma.variables.getLocalVariableCollectionsAsync();
    const cor = colecoes.find((c) => c.name === "Cor");
    const claro = cor.modes.find((m) => m.name === "Claro").modeId;
    const V = {};
    for (const c of colecoes.filter((c) => c.name === "Cor" || c.name === "Medida")) {
        for (const id of c.variableIds) {
            const v = await figma.variables.getVariableByIdAsync(id);
            V[v.name] = v;
        }
    }
    const resolver = async (v) => {
        let x = v.valuesByMode[claro] ?? Object.values(v.valuesByMode)[0];
        while (x && x.type === "VARIABLE_ALIAS") {
            const a = await figma.variables.getVariableByIdAsync(x.id);
            x = Object.values(a.valuesByMode)[0];
        }
        return x;
    };
    const RGB = {};
    for (const nome of Object.keys(V)) if (V[nome].resolvedType === "COLOR") RGB[nome] = await resolver(V[nome]);
    const CANDIDATOS = {
        fundo: ["fundo/pagina", "fundo/card", "fundo/lateral", "fundo/selecao", "acao/primaria", "acao/destrutiva"],
        texto: [
            "texto/principal",
            "texto/apoio",
            "acao/primaria-texto",
            "acao/destrutiva",
            "estado/aberta",
            "estado/fechada",
            "estado/vencida",
            "estado/vence-em-breve",
            "estado/em-aprovacao",
        ],
        borda: ["borda/padrao", "borda/controle", "foco/anel", "texto/principal", "acao/destrutiva"],
        icone: [
            "texto/principal",
            "texto/apoio",
            "acao/primaria-texto",
            "estado/aberta",
            "estado/fechada",
            "estado/vencida",
            "estado/vence-em-breve",
            "estado/em-aprovacao",
            "estado/rascunho",
        ],
    };
    const maisPerto = (c, tipo) => {
        let melhor = null,
            dist = Infinity;
        for (const nome of CANDIDATOS[tipo]) {
            const o = RGB[nome];
            const d = (o.r - c.r) ** 2 + (o.g - c.g) ** 2 + (o.b - c.b) ** 2;
            if (d < dist) [melhor, dist] = [nome, d];
        }
        return melhor;
    };
    const estilos = await figma.getLocalTextStylesAsync();
    for (const s of estilos) await figma.loadFontAsync(s.fontName);
    const peso = (estilo) => ({ Regular: 400, Medium: 500, SemiBold: 600, "Semi Bold": 600, Bold: 700 })[estilo] ?? 400;
    const estiloMaisPerto = (tamanho, p) =>
        estilos
            .filter((s) => !s.name.startsWith("Marca/"))
            .map((s) => [s, Math.abs(s.fontSize - tamanho) * 10 + Math.abs(peso(s.fontName.style) - p) / 100])
            .sort((a, b) => a[1] - b[1])[0][0];
    const ESPACOS = Object.keys(V)
        .filter((n) => n.startsWith("espaco/") || n.startsWith("layout/"))
        .map((n) => [n, V[n].valuesByMode[Object.keys(V[n].valuesByMode)[0]]]);
    const espacoPerto = (valor) => {
        const [nome, val] = ESPACOS.map(([n, v]) => [n, v]).sort(
            (a, b) => Math.abs(a[1] - valor) - Math.abs(b[1] - valor),
        )[0];
        return Math.abs(val - valor) <= 4 ? nome : null;
    };
    // raio de meia altura ou mais é pílula (a doca, os itens dela)
    const raioPerto = (r, altura) =>
        r >= altura / 2 - 1 || r >= 100
            ? "raio/pilula"
            : r <= 4
              ? "raio/chip"
              : r <= 7
                ? "raio/controle"
                : r <= 16
                  ? "raio/card"
                  : r <= 24
                    ? "raio/folha"
                    : null;

    const feito = { cor: 0, texto: 0, espaco: 0, raio: 0 };
    const sobras = [];
    // o setBoundVariableForPaint devolve a tinta com opacidade 100%: a transparência (um véu, por exemplo) volta à mão
    const tingir = (paint, nome) => ({
        ...figma.variables.setBoundVariableForPaint(
            { ...paint, color: { r: RGB[nome].r, g: RGB[nome].g, b: RGB[nome].b } },
            "color",
            V[nome],
        ),
        opacity: paint.opacity ?? 1,
    });
    const ligarTintas = (no, campo, tipo) => {
        const tintas = no[campo];
        if (!Array.isArray(tintas) || !tintas.length) return;
        let mudou = false;
        const novas = tintas.map((t) => {
            if (t.type !== "SOLID" || t.boundVariables?.color || t.visible === false) return t;
            mudou = true;
            feito.cor++;
            return tingir(t, maisPerto(t.color, tipo));
        });
        if (mudou) no[campo] = novas;
    };
    const ligarEspaco = (no, campo) => {
        const v = no[campo];
        if (typeof v !== "number" || v <= 0 || no.boundVariables?.[campo]) return;
        const nome = espacoPerto(v);
        if (nome) {
            no.setBoundVariable(campo, V[nome]);
            feito.espaco++;
        } else sobras.push(`${no.name}: ${campo} ${v}`);
    };
    const visitar = async (no) => {
        if (no.visible === false || no.type === "INSTANCE" || no.isMask) return;
        if (no.type === "TEXT") {
            if (!no.textStyleId && typeof no.fontSize === "number" && no.fontName !== figma.mixed) {
                await figma.loadFontAsync(no.fontName);
                await no.setTextStyleIdAsync(estiloMaisPerto(no.fontSize, peso(no.fontName.style)).id);
                feito.texto++;
            }
            ligarTintas(no, "fills", "texto");
            return;
        }
        if (no.type === "VECTOR" || no.type === "BOOLEAN_OPERATION" || no.type === "LINE") {
            ligarTintas(no, "fills", "icone");
            ligarTintas(no, "strokes", "icone");
        } else if (no.type !== "SECTION") {
            ligarTintas(no, "fills", "fundo");
            ligarTintas(no, "strokes", "borda");
        }
        if ("layoutMode" in no && no.layoutMode !== "NONE") {
            if (no.primaryAxisAlignItems !== "SPACE_BETWEEN") ligarEspaco(no, "itemSpacing");
            if (no.layoutWrap === "WRAP") ligarEspaco(no, "counterAxisSpacing");
            for (const lado of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]) ligarEspaco(no, lado);
        }
        if ("topLeftRadius" in no && no.type !== "SECTION") {
            for (const canto of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) {
                const r = no[canto];
                if (!(r > 0) || no.boundVariables?.[canto]) continue;
                const nome = raioPerto(r, Math.min(no.width, no.height));
                if (nome) {
                    no.setBoundVariable(canto, V[nome]);
                    feito.raio++;
                } else sobras.push(`${no.name}: raio ${r}`);
            }
        }
        if ("children" in no) for (const filho of no.children) await visitar(filho);
    };
    await visitar(raiz);
    return { alvo, feito, sobras: [...new Set(sobras)] };
}
