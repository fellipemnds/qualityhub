// O formatador não guarda a hora: só o fuso e o formato. Criá-lo uma vez, na carga, é seguro — diferente do B9, a data
// entra a cada chamada
const formatador = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

// O dia de hoje no fuso do negócio, como "AAAA-MM-DD" (TRD §6, B11). Todo cálculo de "dia" passa por aqui: o servidor
// roda em UTC e, entre 21 h e meia-noite de Brasília, ele já está no dia seguinte.
// Com o Node 26 (Temporal), o corpo vira: Temporal.Now.plainDateISO("America/Sao_Paulo").toString()
export function hojeEmSaoPaulo(): string {
    const partes = formatador.formatToParts(new Date());

    const peca = (tipo: Intl.DateTimeFormatPartTypes) => {
        const valor = partes.find((parte) => parte.type === tipo)?.value;

        if (valor === undefined) {
            throw new Error(`O Intl não devolveu a peça "${tipo}" da data`);
        }

        return valor;
    };

    return `${peca("year")}-${peca("month")}-${peca("day")}`;
}
