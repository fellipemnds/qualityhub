// Valor solto: lista toda cor, espaço, raio e texto sem variável (ou sem estilo)
// numa página ou num nó do Figma. É a regra 4 do "pronto" do `ui-ux.md` §2.2.
//
// Como rodar: o Claude passa este arquivo para o `use_figma` (o conector do
// Figma) sem o `export` e com a chamada no fim: `return await valorSolto("Átomos")`.
// O alvo é o nome de uma página ou o id de um nó ("443:42"). A resposta é o
// total, a contagem por tipo e os primeiros achados, com o caminho de cada um.
//
// O que conta como solto:
// - cor: preenchimento ou traço sólido sem variável (gradiente também);
// - espaço: gap e padding acima de 0 sem variável (o `espaco/*`);
// - raio: canto acima de 0 sem variável (o `raio/*`);
// - texto: sem estilo de texto.
//
// O que fica de fora: o que está escondido, as seções (organizam a página) e o
// conteúdo das cópias de componente, que vem do componente principal e é
// conferido onde ele mora.
// ponytail: uma cor trocada à mão numa cópia escapa; conferir as cópias se isso aparecer.

export async function valorSolto(alvo, limite = 60) {
    const raiz = /^\d+:\d+$/.test(alvo)
        ? await figma.getNodeByIdAsync(alvo)
        : figma.root.children.find((p) => p.name === alvo);
    if (!raiz) throw new Error(`Alvo não achado: ${alvo}`);
    let pagina = raiz;
    while (pagina.type !== "PAGE") pagina = pagina.parent;
    await figma.setCurrentPageAsync(pagina);

    const achados = [];
    let copiasPuladas = 0;

    const caminho = (no) => {
        const nomes = [];
        for (let n = no; n && n.type !== "PAGE"; n = n.parent) nomes.unshift(n.name);
        return nomes.join(" › ");
    };
    const anotar = (no, tipo, detalhe) => achados.push({ id: no.id, tipo, detalhe, caminho: caminho(no) });

    const conferirTintas = (no, campo) => {
        const tintas = no[campo];
        if (!Array.isArray(tintas)) return;
        for (const t of tintas) {
            if (t.visible === false) continue;
            if (t.type === "SOLID" && !t.boundVariables?.color) {
                const hex = [t.color.r, t.color.g, t.color.b]
                    .map((v) =>
                        Math.round(v * 255)
                            .toString(16)
                            .padStart(2, "0"),
                    )
                    .join("");
                anotar(no, "cor", `${campo} #${hex}`);
            } else if (t.type.startsWith("GRADIENT")) {
                anotar(no, "cor", `${campo} com gradiente`);
            }
        }
    };

    const solto = (no, campo) => {
        const valor = no[campo];
        return typeof valor === "number" && valor > 0 && !no.boundVariables?.[campo];
    };
    const conferirMedida = (no, campo, tipo) => {
        if (solto(no, campo)) anotar(no, tipo, `${campo} ${no[campo]}`);
    };
    const CANTOS = ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"];

    const visitar = (no) => {
        if (no.visible === false) return;
        if (no.type === "INSTANCE") {
            copiasPuladas++;
            return;
        }
        // a máscara usa só a transparência da tinta, nunca a cor
        if (no.type !== "SECTION" && !no.isMask) {
            conferirTintas(no, "fills");
            conferirTintas(no, "strokes");
        }
        if ("layoutMode" in no && no.layoutMode !== "NONE") {
            if (no.primaryAxisAlignItems !== "SPACE_BETWEEN") conferirMedida(no, "itemSpacing", "espaço");
            if (no.layoutWrap === "WRAP") conferirMedida(no, "counterAxisSpacing", "espaço");
            for (const lado of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"])
                conferirMedida(no, lado, "espaço");
        }
        if ("topLeftRadius" in no && no.type !== "SECTION") {
            const soltos = CANTOS.filter((canto) => solto(no, canto)).map((canto) => no[canto]);
            if (soltos.length) anotar(no, "raio", `${[...new Set(soltos)].join("/")} em ${soltos.length} canto(s)`);
        }
        if (no.type === "TEXT" && (no.textStyleId === "" || no.textStyleId === figma.mixed)) {
            anotar(no, "texto", `sem estilo (“${no.characters.slice(0, 30)}”)`);
        }
        if ("children" in no) for (const filho of no.children) visitar(filho);
    };

    if (raiz.type === "PAGE") for (const filho of raiz.children) visitar(filho);
    else visitar(raiz);

    const porTipo = {};
    for (const a of achados) porTipo[a.tipo] = (porTipo[a.tipo] ?? 0) + 1;
    return { alvo, total: achados.length, porTipo, copiasPuladas, achados: achados.slice(0, limite) };
}
