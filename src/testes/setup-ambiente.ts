import { inject } from "vitest";

process.env.DATABASE_URL = inject("urlBanco");
process.env.JWT_SECRET = "segredo-de-teste";
