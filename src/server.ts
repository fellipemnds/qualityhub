import { prisma } from "./lib/prisma.js";

async function main() {
    const setor = await prisma.setor.findFirstOrThrow({
        where: { nome: "Recursos Humanos"},
    });

    const nc = await prisma.naoConformidade.create({
        data: {
            numero: "NC-2026-001",
            titulo: "Férias canceladas fora do prazo",
            descricao:
                "As férias estavam programadas para 20/07/2026. Em 02/07 o gestor solicitou cancelamento, sem respeitar a antecedência mínima.",
            requisitoViolado: "PR de RH - prazo mínimo de 20 dias para alteração de férias",
            origem: "OPERACAO",
            dataOcorrencia: new Date("2026-07-02"),
            setorId: setor.id,
        }
    })

    console.log("NC criada: ", nc);
}

main();