import z from "zod";
import { FuncaoAtribuicao } from "../entidades/funcoes-atribuicao.js";

export const definirAprovadorSchema = z.object({
    usuarioId: z.uuid(),
});

export const colaboradoresSchema = z.object({
    colaboradores: z.array(z.uuid()).min(1),
});

// A atribuição gravada, como está (o que a tela precisar, como o nome da pessoa, entra na C1, acrescentando: D5)
export const atribuicaoRespostaSchema = z.object({
    registroId: z.uuid(),
    usuarioId: z.uuid(),
    funcao: z.enum(FuncaoAtribuicao),
    atribuidoPorId: z.uuid(),
    atribuidoEm: z.date(),
});

export const colaboradoresAdicionadosRespostaSchema = z.object({
    adicionados: z.array(atribuicaoRespostaSchema),
    jaEramColaboradores: z.array(z.uuid()),
});

export const colaboradoresRemovidosRespostaSchema = z.object({
    removidos: z.array(atribuicaoRespostaSchema),
    naoEramColaboradores: z.array(z.uuid()),
});

export type AprovadorInput = z.infer<typeof definirAprovadorSchema>;
export type ColaboradoresInput = z.infer<typeof colaboradoresSchema>;
