import { prisma } from "./compartilhado/prisma/cliente.js";
import { criarAdminPeloTerminal } from "./modulos/usuario/criar-admin-terminal.js";

// O arquivo é a X5 (CONSTRAINTS.md §5): só liga a casca ao teclado e à tela, e o resto mora na casca, testada.

const codigo = await criarAdminPeloTerminal({
    entrada: process.stdin,
    saida: process.stdout,
    urlDoSistema: process.env.URL_DO_SISTEMA,
});

await prisma.$disconnect();

process.exit(codigo);
