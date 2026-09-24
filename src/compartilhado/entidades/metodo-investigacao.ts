export const MetodoInvestigacao = {
    A3_SPS: "A3_SPS",
} as const;

export type MetodoInvestigacao = (typeof MetodoInvestigacao)[keyof typeof MetodoInvestigacao];
