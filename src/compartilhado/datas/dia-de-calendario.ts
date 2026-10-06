import { z } from "zod";

// Como um dia de calendário ("AAAA-MM-DD") é guardado: meia-noite UTC daquele dia, e lido de volta em UTC (TRD §6)
export const meiaNoiteUtc = (dia: string) => new Date(`${dia}T00:00:00Z`);

// Dia de calendário na API, nos dois sentidos, sempre "AAAA-MM-DD". Na entrada (decode), vira a meia-noite UTC do dia,
// e recusa data com hora, número e dia inexistente: o z.coerce.date() aceitava os três, e transformava null em
// 01/01/1970 (B14). Na saída (encode, pelo schema de resposta), a data volta a "AAAA-MM-DD", sem hora (B22)
export const diaDeCalendario = () =>
    z.codec(z.iso.date(), z.date(), {
        decode: (dia) => meiaNoiteUtc(dia),
        encode: (dia) => dia.toISOString().slice(0, 10),
    });
