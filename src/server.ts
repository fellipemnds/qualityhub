import { prisma } from "./lib/prisma.js";

async function main() {
    // Buscar todas as NCs
    const todas = await prisma.naoConformidade.findMany();
    console.log("Todas as NCs:", todas.length);

    // Buscar uma pelo número
    const nc = await prisma.naoConformidade.findUnique({
        where: { numero: "NC-2026-001" },
    });
    console.log("NC encontrada:", nc?.titulo);

    // Buscar trazendo o setor junto
    const comSetor = await prisma.naoConformidade.findMany({
        include: { setor: true },
    });
    console.log("Setor da primeira NC: ", comSetor[0]?.setor.nome);

    // Filtrar por estado
    const abertas = await prisma.naoConformidade.findMany({
        where: { estado: "ABERTA" },
    });
    console.log("NCs abertas:", abertas.length);
}

main();