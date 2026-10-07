// Tetos de entrada (auditoria L4): sem eles, o único limite era o do corpo inteiro, 1 MB, e um texto desse tamanho seria
// gravado e devolvido em toda resposta. Dois valores com nome, para mudar num lugar só (Matthew, 2026-10-07). Se um campo
// ganhar formatação (JSON do Tiptap, C4), o teto dele é revisto: a marcação ocupa espaço
export const TEXTO_CURTO = 200;
export const TEXTO_LONGO = 5000;
