import { z } from "zod";

// Como um dia de calendário ("AAAA-MM-DD") é guardado: meia-noite UTC daquele dia, e lido de volta em UTC (TRD §6)
export const meiaNoiteUtc = (dia: string) => new Date(`${dia}T00:00:00Z`);

// Dia de calendário na entrada da API: só "AAAA-MM-DD". Recusa data com hora, número e dia inexistente — o
// z.coerce.date() aceitava os três, e transformava null em 01/01/1970 (B14)
export const diaDeCalendario = () => z.iso.date().transform(meiaNoiteUtc);
