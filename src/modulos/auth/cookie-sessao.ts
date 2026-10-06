// O cookie da sessão (TRD §4.1), num lugar só: quem grava (login) e quem apaga (logout, sair de todos) precisam do
// mesmo nome e do mesmo Path, senão o navegador trata como cookies diferentes e não apaga
export const COOKIE_SESSAO = "qh_sessao";

// Path "/" até as rotas ganharem o prefixo /api na A5; aí vira "/api"
export const OPCOES_COOKIE_SESSAO = { httpOnly: true, secure: true, sameSite: "strict", path: "/" } as const;
