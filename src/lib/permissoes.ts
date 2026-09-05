import type { PerfilUsuario } from "../generated/prisma/enums.js";

export function podeGerenciarUsuarios(perfil: PerfilUsuario) {
    return perfil === "ADMIN";
}

export function podeClassificar(perfil: PerfilUsuario) {
    return perfil === "QA";
}

export function podeAprovarPortao(perfil: PerfilUsuario) {
    return perfil === "QA";
}

export function podeAutorizarConcessao(perfil: PerfilUsuario) {
    return perfil === "DIRETORIA";
}
