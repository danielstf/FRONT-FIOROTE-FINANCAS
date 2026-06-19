export const CARD_GRADIENTS = [
  { from: "#1A56DB", to: "#1E3A8A", label: "Azul" },       // 0
  { from: "#059669", to: "#065F46", label: "Verde" },       // 1
  { from: "#DC2626", to: "#9B1C1C", label: "Vermelho" },   // 2
  { from: "#7C3AED", to: "#4C1D95", label: "Roxo" },       // 3
  { from: "#D97706", to: "#92400E", label: "Âmbar" },      // 4
  { from: "#0891B2", to: "#0369A1", label: "Ciano" },      // 5
  { from: "#DB2777", to: "#9D174D", label: "Rosa" },       // 6
  { from: "#4338CA", to: "#3730A3", label: "Índigo" },     // 7
  { from: "#F59E0B", to: "#B45309", label: "Amarelo" },    // 8
  { from: "#8B5CF6", to: "#5B21B6", label: "Violeta" },   // 9
] as const;

export function getCardGradient(index: number) {
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
}

export function getCardGradientStyle(index: number) {
  const g = getCardGradient(index);
  return `linear-gradient(135deg, ${g.from}, ${g.to})`;
}
