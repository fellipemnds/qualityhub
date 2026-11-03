// O teste do protótipo sem navegador: o script roda num DOM de mentira, e o teste clica pelas jornadas
// com cada perfil, no celular e no computador. Uso: node docs/prototipo/teste-jornadas.js docs/prototipo/andon-b4.html
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync(process.argv[2], "utf8");
const js = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));

const valores = {}; // o que os campos "têm" quando o script lê
const ouvintes = {};
const elemento = (id) => ({
    id,
    get value() {
        return valores[id] ?? "";
    },
    set value(v) {
        valores[id] = v;
    },
    innerHTML: "",
    textContent: "",
    style: {},
    dataset: {},
    focus() {},
    setSelectionRange() {},
    addEventListener() {},
    scrollIntoView() {},
    closest: () => null,
    appendChild() {},
    selectionStart: 0,
});
const app = elemento("app");
const avisos = [];
const sandbox = {
    console,
    Date,
    Math,
    JSON,
    Object,
    Array,
    String,
    Number,
    RegExp,
    setTimeout: (f) => f(),
    localStorage: { getItem: () => null, setItem() {} },
    history: { pushState() {}, back() {} },
    matchMedia: () => ({ matches: global.DESK || false, addEventListener() {} }),
    getSelection: () => ({ selectAllChildren() {} }),
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    FormData: class {
        get(k) {
            return valores[`f-${k}`] ?? "";
        }
    },
    window: { addEventListener() {}, scrollTo() {} },
    document: {
        documentElement: { getAttribute: () => null, setAttribute() {}, removeAttribute() {} },
        body: { classList: { toggle() {} } },
        getElementById: (id) =>
            id === "app"
                ? app
                : id === "avisos"
                  ? { appendChild: (el) => avisos.push(el.innerHTML) }
                  : app.innerHTML.includes(`id="${id}"`)
                    ? elemento(id)
                    : null,
        createElement: () => ({ innerHTML: "", remove() {} }),
        querySelector: () => null,
        querySelectorAll: (sel) => (sel.includes("papel") ? (valores.papeis || []).map((value) => ({ value })) : []),
        addEventListener: (tipo, f) => {
            ouvintes[tipo] = f;
        },
    },
};
sandbox.window.document = sandbox.document;
vm.createContext(sandbox);
vm.runInContext(`${js}\n;globalThis.__E = () => E; globalThis.__set = (x) => { E = x; };`, sandbox);

let falhas = 0;
const ok = (cond, msg) => {
    if (!cond) {
        falhas++;
        console.log(`  ✗ ${msg}`);
    } else console.log(`  ✓ ${msg}`);
};
const E = () => sandbox.__E();
function clicar(acao, extra = {}) {
    const dataset = { acao, ...extra };
    const alvo = { dataset, classList: { contains: () => false }, getAttribute: (a) => extra[a] };
    const ultimo = avisos.length;
    ouvintes.click({ target: { closest: (s) => (s === "[data-acao]" ? alvo : null) } });
    if (!app.innerHTML) throw new Error(`tela vazia depois de ${acao}`);
    return avisos.slice(ultimo).join(" | ");
}
function mudar(reg, campo, valor) {
    ouvintes.change({ target: { dataset: { reg, campo }, value: valor } });
}
const entrar = (s) => {
    clicar("trocar-perfil");
    clicar("perfil", { id: s });
    ouvintes.submit({ preventDefault() {}, target: { id: "form-login" } });
};
const R = (id) => E().reg[id];
const tela = () => app.innerHTML;
const etapa = (id) => vm.runInContext(`etapaDe(R("${id}"))`, sandbox);
const pend = () => vm.runInContext("pendencias().map(p => p.grupo + ':' + p.id)", sandbox);

for (const desk of [false, true]) {
    global.DESK = desk;
    for (const k of Object.keys(valores)) delete valores[k];
    vm.runInContext(`desk = ${desk}; E = estadoInicial(); desenhar();`, sandbox);
    console.log(`\n══ ${desk ? "COMPUTADOR" : "CELULAR"} ══`);
    console.log("Todas as telas, com todos os perfis");
    for (const s of ["FS", "BL", "RS", "VD", "TM"]) {
        entrar(s);
        ok(E().usuario === s && E().tela !== "login", `${s} entra, na ${E().tela}`);
        for (const t of ["pendencias", "ncs", "eu", "relatorios", "usuarios", "setores"]) {
            clicar("aba-app", { tela: t });
            ok(tela().length > 100, `${s} vê ${t}`);
        }
        for (const id of Object.keys(E().reg)) {
            clicar("abrir", { id });
            for (const aba of ["resumo", "detalhes", "itens", "feed"])
                if (E().tela === "nc") clicar("aba", { id: aba });
            if (E().tela === "item") clicar("atividade", { id });
        }
        ok(true, `${s} abre as ${Object.keys(E().reg).length} NCs e itens`);
    }
    vm.runInContext("E = estadoInicial(); desenhar();", sandbox);

    console.log("Permissões");
    entrar("VD");
    clicar("abrir", { id: "NC-2026-0042" });
    ok(
        !tela().includes("Comentar") && !tela().includes('data-acao="submeter"'),
        "Vera só lê: sem comentar e sem enviar",
    );
    clicar("aba-app", { tela: "ncs" });
    ok(!tela().includes("Nova NC"), "Vera não cria NC");
    entrar("FS");
    ok(
        !pend().some((p) => p.startsWith("aprovar") || p.startsWith("triagem")),
        "Fulana (editora) não tem Aprovar nem Triagem",
    );
    entrar("BL");
    ok(
        pend().includes("triagem:NC-2026-0045") &&
            pend().includes("aprovar:NC-2026-0038") &&
            pend().includes("aprovar:IV-2026-0007") &&
            pend().includes("verificar:VE-2026-0001") &&
            pend().includes("mencoes:NC-2026-0042"),
        "Beltrana: triagem, aprovar, verificar e menção",
    );

    console.log("J1 · Registrar a NC com rascunho (Fulana)");
    entrar("FS");
    clicar("aba-app", { tela: "ncs" });
    clicar("nova");
    Object.assign(valores, {
        "f-titulo": "Vazamento de ar na linha 5",
        "f-descricao": "Vazamento de ar comprimido na conexão da pistola de pintura da linha 5",
    });
    clicar("salvar-rascunho");
    ok(
        pend().some((p) => p.startsWith("rascunhos:")),
        "o rascunho aparece nas pendências",
    );
    const rasc = pend()
        .find((p) => p.startsWith("rascunhos:"))
        .split(":")[1];
    clicar("abrir", { id: rasc });
    ok(
        E().tela === "nova" && E().form.titulo === "Vazamento de ar na linha 5",
        "Continuar rascunho abre o formulário preenchido",
    );
    clicar("publicar");
    ok(E().tela === "nova" && Object.keys(E().erros).length === 5, "publicar faltando campo mostra os erros");
    Object.assign(valores, {
        "f-detectada": "2026-11-03",
        "f-origem": "Operação",
        "f-setor": "Produção",
        "f-processo": "Pintura",
        "f-requisito": "IT-051, item 2.1",
    });
    clicar("publicar");
    const nova = E().ncId;
    ok(nova === "NC-2026-0046" && E().tela === "nc" && !R(rasc), `publica a ${nova}, sem o rascunho`);
    ok(etapa(nova) === "Aguardando classificação", "etapa: Aguardando classificação");

    console.log("J2 · Triagem e classificação (Beltrana)");
    entrar("BL");
    ok(pend().includes(`triagem:${nova}`), "a NC nova cai na triagem");
    clicar("abrir", { id: nova });
    clicar("aprovador", { id: nova });
    clicar("escolher-aprovador", { id: "BL" });
    ok(R(nova).aprovador === "BL" && !pend().includes(`triagem:${nova}`), "Beltrana vira a aprovadora; a triagem some");
    clicar("novo-filho", { id: "CL" });
    const cl = E().itemId;
    clicar("publicar-item", { id: cl });
    ok(E().folha?.tipo === "faltas", "publicar a classificação sem valor pede o que falta");
    clicar("fechar-folha");
    clicar("valor", { id: cl, campo: "gravidade", valor: "Maior" });
    clicar("publicar-item", { id: cl });
    const cl2 = E().itemId;
    ok(R(cl2)?.estado === "Aberta" && R(cl2).aprovador === "BL", `${cl2} publicada com a aprovadora da NC`);
    clicar("bloqueado", { id: cl2 });
    ok(E().folha?.lista?.includes("Escrever a justificativa"), "o envio bloqueado lista a justificativa");
    clicar("fechar-folha");
    mudar(cl2, "justificativa", "Para a pintura da linha 5.");
    clicar("submeter", { id: cl2 });
    ok(R(cl2).estado === "Em aprovação" && pend().includes(`aprovar:${cl2}`), "enviada; aparece no Aprovar dela mesma");
    clicar("aprovar", { id: cl2 });
    ok(R(cl2).estado === "Fechada" && etapa(nova) === "Em investigação", "aprovada; etapa: Em investigação");

    console.log("J3 · Contenção (Fulana preenche, Beltrana aprova)");
    entrar("FS");
    clicar("abrir", { id: "CT-2026-0020" });
    ok(tela().includes("Executada em"), "a contenção abre para editar");
    mudar("CT-2026-0020", "execucao", "2026-11-02");
    mudar("CT-2026-0020", "disposicao", "Corrigido");
    clicar("submeter", { id: "CT-2026-0020" });
    ok(R("CT-2026-0020").estado === "Em aprovação", "enviada para aprovação");
    entrar("BL");
    clicar("abrir", { id: "CT-2026-0020" });
    clicar("reprovar", { id: "CT-2026-0020" });
    valores.motivo = "";
    clicar("confirmar-reprovar");
    ok(E().folha?.erro, "reprovar sem motivo pede o motivo");
    valores.motivo = "Falta dizer onde o lote ficou";
    clicar("confirmar-reprovar");
    ok(
        R("CT-2026-0020").estado === "Aberta" && R("CT-2026-0020").reprovacao,
        "reprovada volta para aberta com o motivo",
    );
    entrar("FS");
    ok(pend().includes("corrigir:CT-2026-0020"), "Fulana vê o Corrigir");
    clicar("submeter", { id: "CT-2026-0020" });
    entrar("BL");
    clicar("aprovar", { id: "CT-2026-0020" });
    ok(R("CT-2026-0020").estado === "Fechada", "aprovada na segunda");

    console.log("J4 e J5 · Investigação com ação (Fulana e Beltrana)");
    entrar("FS");
    const iv = "IV-2026-0008";
    clicar("abrir", { id: iv });
    ok(tela().includes("Ishikawa") && tela().includes("Nova hipótese"), "o A3 abre com o Ishikawa e as hipóteses");
    ouvintes.change({
        target: { dataset: { reg: iv, ishikawa: "Método" }, value: "1. Conferência sem o certificado" },
    });
    clicar("hipotese", { id: iv, indice: "-1" });
    Object.assign(valores, {
        "h-desc": "A conferência não pede o certificado",
        "h-num": "1",
        "h-como": "Ver o checklist do recebimento",
        "h-classe": "Causa direta",
    });
    clicar("salvar-hipotese");
    ok(R(iv).campos.hipoteses.length === 1 && R(iv).campos.causaDireta, "a hipótese entra e a causa direta vem dela");
    mudar(iv, "causaRaiz", "O PR-03 não exige o certificado na conferência");
    clicar("nova-ac", { id: iv });
    const ac = E().itemId;
    mudar(ac, "descricao", "Incluir o certificado no checklist do recebimento");
    clicar("data-rapida", { id: ac, campo: "prazo", dias: "-15" });
    mudar(ac, "instrucoes", "Auditar 5 recebimentos");
    clicar("publicar-item", { id: ac });
    const ac2 = E().itemId;
    ok(R(ac2).campos.iv === iv, `${ac2} publicada e ligada à ${iv}`);
    ok(
        vm.runInContext(`faltas(R("${iv}"))`, sandbox).some((x) => x.includes(ac2)),
        "a investigação espera o plano da ação",
    );
    clicar("submeter", { id: ac2 });
    entrar("BL");
    clicar("aprovar", { id: ac2 });
    ok(R(ac2).planoAprovado && R(ac2).estado === "Aberta", "plano aprovado: a ação volta para aberta");
    entrar("FS");
    ok(vm.runInContext(`faltas(R("${iv}"))`, sandbox).length === 0, "a investigação não tem mais falta");
    clicar("submeter", { id: iv });
    entrar("BL");
    clicar("aprovar", { id: iv });
    ok(etapa("NC-2026-0044") === "Pronta para fechamento", "NC-2026-0044: Pronta para fechamento");

    console.log("J5 · Finalizar a execução (Fulana)");
    entrar("FS");
    clicar("abrir", { id: "AC-2026-0003" });
    clicar("bloqueado-fin", { id: "AC-2026-0003" });
    ok(E().folha?.lista?.length === 2, "finalizar sem data e evidência pede as duas");
    clicar("fechar-folha");
    clicar("data-rapida", { id: "AC-2026-0003", campo: "execucao", dias: "0" });
    mudar("AC-2026-0003", "evidencia", "Junta nova instalada");
    clicar("finalizar", { id: "AC-2026-0003" });
    clicar("confirmar-finalizar");
    const ve = Object.values(E().reg).find((r) => r.tipo === "VE" && r.campos.ac === "AC-2026-0003");
    ok(
        R("AC-2026-0003").estado === "Fechada" && ve?.estado === "Aberta" && ve.resp[0] === "BL",
        `a ${ve?.id} nasce para a Beltrana`,
    );

    console.log("J6 · Enviar para fechamento (Fulana) e J8 (Beltrana)");
    entrar("FS");
    ok(pend().includes("fechamento:NC-2026-0040"), "a NC-2026-0040 está no Enviar para fechamento");
    clicar("abrir", { id: "NC-2026-0040" });
    ok(vm.runInContext('faltas(R("NC-2026-0040"))', sandbox).length === 2, "faltam os riscos e as mudanças");
    mudar("NC-2026-0040", "riscos", "Sem risco novo");
    mudar("NC-2026-0040", "mudancas", "Checklist da troca de modelo revisado");
    clicar("submeter", { id: "NC-2026-0040" });
    ok(R("NC-2026-0040").estado === "Em aprovação", "enviada para fechamento");
    entrar("BL");
    clicar("aprovar", { id: "NC-2026-0040" });
    ok(etapa("NC-2026-0040") === "Fechada · ação em execução", "fechada · ação em execução");
    clicar("aprovar", { id: "NC-2026-0038" });
    ok(R("NC-2026-0038").estado === "Fechada", "NC-2026-0038 fechada");
    clicar("aprovar", { id: "IV-2026-0007" });

    console.log("J7 · Verificação, os três resultados (Beltrana)");
    const concluir = (id, res) => {
        clicar("abrir", { id });
        clicar("valor", { id, campo: "resultado", valor: res });
        mudar(id, "conclusao", "Conferido");
        clicar("data-rapida", { id, campo: "data", dias: "0" });
        clicar("concluir", { id });
        return clicar("confirmar-concluir");
    };
    let msg = concluir("VE-2026-0001", "NAO");
    ok(
        R("NC-2026-0036").estado === "Aberta" && R("NC-2026-0036").reaberta && R("IV-2026-0004").estado === "Aberta",
        `não eficaz reabre a IV e a NC (${msg})`,
    );
    msg = concluir(ve.id, "PARCIAL");
    const acNova = Object.values(E().reg).find(
        (r) => r.tipo === "AC" && r.estado === "Rascunho" && r.campos.iv === "IV-2026-0007",
    );
    ok(acNova?.resp.includes("FS"), `parcialmente eficaz cria a ação nova para a Fulana (${msg})`);

    console.log("J9 · Reabrir (Beltrana) e cancelar (Rui)");
    clicar("abrir", { id: "NC-2026-0031" });
    clicar("reabrir", { id: "NC-2026-0031" });
    valores.motivo = "A troca de etiqueta voltou";
    clicar("confirmar-reabrir");
    ok(
        R("NC-2026-0031").estado === "Aberta" && etapa("NC-2026-0031") === "Pronta para fechamento",
        "reaberta: volta para Pronta para fechamento",
    );
    entrar("RS");
    clicar("abrir", { id: "CT-2026-0019" });
    clicar("mais", { id: "CT-2026-0019" });
    clicar("cancelar");
    valores.motivo = "Lote já isolado pela outra contenção";
    clicar("confirmar-cancelar");
    ok(R("CT-2026-0019").estado === "Cancelada", "Rui cancela a contenção");
    clicar("abrir", { id: "IV-2026-0007" });
    ok(true, `Rui abre a IV-2026-0007 (${R("IV-2026-0007").estado})`);

    console.log("J10 · Comentar com menção (Fulana)");
    entrar("FS");
    clicar("abrir", { id: "NC-2026-0042" });
    clicar("aba", { id: "feed" });
    valores.comentario = "@Ciclano, o lote 42 já foi isolado?";
    sandbox.document.getElementById = (
        (orig) => (id) =>
            id === "comentario" ? { ...elemento("comentario"), value: valores.comentario } : orig(id)
    )(sandbox.document.getElementById);
    ouvintes.submit({ preventDefault() {}, target: { id: "form-comentario" } });
    ok(
        E().mencoes.some((m) => m.para === "CR"),
        "o Ciclano recebe a menção",
    );

    console.log("J11 · Usuários e setores (Tiago)");
    entrar("TM");
    ok(E().tela === "usuarios", "o Tiago começa nos Usuários");
    clicar("sel-usuario", { id: "BL" });
    clicar("inativar", { id: "BL" });
    ok(
        E().recusa?.itens?.length > 0 && pessoaAtiva("BL"),
        `inativar a Beltrana é recusado (${E().recusa?.itens?.length} itens)`,
    );
    clicar("novo-usuario");
    Object.assign(valores, {
        "u-nome": "Joana Prado",
        "u-email": "joana.prado@empresa.com.br",
        "u-setor": "Montagem",
        papeis: ["EDITOR"],
    });
    clicar("criar-usuario");
    ok(
        E().adminSel?.startsWith("convite:") && tela().includes("definir-senha?token="),
        "cria a Joana e mostra o convite",
    );
    clicar("aba-app", { tela: "setores" });
    clicar("sel-setor", { id: "Produção" });
    clicar("desativar-setor", { id: "Produção" });
    ok(E().recusa?.setor === "Produção", "desativar a Produção é recusado (tem gente)");
    clicar("sel-setor", { id: "Almoxarifado" });
    clicar("desativar-setor", { id: "Almoxarifado" });
    ok(!E().setores.find((s) => s.nome === "Almoxarifado").ativo, "o Almoxarifado, vazio, desativa");

    console.log("J12 · Relatórios (Rui)");
    entrar("RS");
    clicar("aba-app", { tela: "relatorios" });
    for (const p of ["Mês", "3M", "6M", "12M", "Ano", "Tudo"]) clicar("periodo", { id: p });
    ok(tela().includes("Eficácia") && tela().includes("Atrasadas"), "os quatro relatórios aparecem");
    clicar("rel-vencidas");
    ok(E().tela === "ncs" && E().filtro === "Vencidas", "Atrasadas leva à lista filtrada");

    console.log("Depois de tudo, todas as telas de novo");
    for (const s of ["FS", "BL", "RS", "VD", "TM"]) {
        entrar(s);
        for (const id of Object.keys(E().reg)) clicar("abrir", { id });
        for (const t of ["pendencias", "ncs", "eu", "relatorios", "usuarios", "setores"])
            clicar("aba-app", { tela: t });
    }
    ok(!/undefined|NaN|\[object Object\]/.test(tela()), "sem undefined, NaN ou [object Object] na última tela");
    clicar("recomecar");
    ok(E().tela === "login" && Object.keys(E().reg).length === 30, "Recomeçar volta ao login e aos dados do começo");
    sandbox.document.getElementById = (id) =>
        id === "app"
            ? app
            : id === "avisos"
              ? { appendChild: (el) => avisos.push(el.innerHTML) }
              : app.innerHTML.includes(`id="${id}"`)
                ? elemento(id)
                : null;
}
function pessoaAtiva(s) {
    return E().pessoas.find((p) => p.sigla === s).ativo;
}
console.log(falhas ? `\n${falhas} FALHAS` : "\nTUDO PASSOU");
process.exit(falhas ? 1 : 0);
