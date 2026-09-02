import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error("DATABASE_URL não está definida no .env");
}

const adapter = new PrismaPg({ connectionString }); // interno
export const prisma = new PrismaClient({ adapter }); // público por causa do export