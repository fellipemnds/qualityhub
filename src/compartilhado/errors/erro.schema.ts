import z from "zod";

// Formato de todo erro da API (TRD §7.1), declarado nas rotas como "4xx". O "error" varia com a origem (validação
// da rota, .parse() de um service, lista de uma guarda), por isso unknown; e some quando não há detalhe, por isso
// optional
export const erroSchema = z.object({
    mensagem: z.string(),
    error: z.unknown().optional(),
});
