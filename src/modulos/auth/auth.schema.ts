import { z } from "zod";
import { Papel } from "../../compartilhado/entidades/papeis.js";
import { TelaInicial } from "../../compartilhado/entidades/tela-inicial.js";

// Schema usado para definir a senha
export const definirSenhaSchema = z.object({
    token: z.string().min(32).max(128),
    // O bcrypt só usa os primeiros 72 bytes: duas senhas que começam igual valeriam a mesma. Em bytes, não em caracteres
    // (letra com acento ocupa 2); o .max(72) é o que o OpenAPI mostra
    senha: z
        .string()
        .min(12)
        .max(72)
        .refine((senha) => Buffer.byteLength(senha) <= 72, "A senha pode ter no máximo 72 bytes."),
});

// Schema usado para definir os inputs do Login
export const loginSchema = z.object({
    email: z.email(),
    senha: z.string().min(1).max(128),
    manterConectado: z.boolean().default(false),
});

// null volta para o padrão do papel
export const alterarEuSchema = z.object({
    telaInicial: z.enum(TelaInicial).nullable(),
});

// O que a pessoa vê de si mesma, e só isso: o schema é a lista do que pode sair. Mesmo que a consulta passe a trazer a
// senha ou as datas internas, elas não saem na resposta. A tela inicial é null para quem não tem papel nenhum
export const euRespostaSchema = z.object({
    id: z.uuid(),
    nome: z.string(),
    email: z.string(),
    setor: z.object({ id: z.number().int(), nome: z.string() }),
    papeis: z.array(z.enum(Papel)),
    telaInicial: z.enum(TelaInicial).nullable(),
    telasIniciais: z.array(z.enum(TelaInicial)),
});

export type DefinirSenhaInput = z.infer<typeof definirSenhaSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AlterarEuInput = z.infer<typeof alterarEuSchema>;
