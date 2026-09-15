const assinantes = new Map<string, Array<(dados: unknown) => void | Promise<void>>>();

function assinar(tipoDeEvento: string, funcao: (dados: unknown) => void | Promise<void>) {
    const existe = assinantes.has(tipoDeEvento);

    if (!existe) {
        assinantes.set(tipoDeEvento, []);
    }

    const lista = assinantes.get(tipoDeEvento);

    if (lista !== undefined) {
        lista.push(funcao);
    }
}

async function publicar(tipoDeEvento: string, dados: unknown) {
    const lista = assinantes.get(tipoDeEvento);

    if (lista === undefined) {
        return;
    }

    for (const funcao of lista) {
        await funcao(dados);
    }
}