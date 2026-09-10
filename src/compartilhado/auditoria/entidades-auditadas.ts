export const Entidades = {
    NAO_CONFORMIDADE: "NaoConformidade",
    CONTENCAO: "Contencao",
    INVESTIGACAO: "Investigacao",
    ACAO: "Acao",
    VERIFICACAO: "Verificacao",
    USUARIO: "Usuario",
    SETOR: "Setor",
    APROVACAO: "Aprovacao",
    ANEXO: "Anexo",
    COMENTARIO: "Comentario"
} as const;

export type Entidade = typeof Entidades[keyof typeof Entidades];