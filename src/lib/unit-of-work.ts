import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "./prisma.js";

export type ClientePrisma = Prisma.TransactionClient;

export async function transacao<T>(
    operacao: (tx: ClientePrisma) => Promise<T>
): Promise<T> {
    return prisma.$transaction(operacao);
}