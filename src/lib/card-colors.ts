export const CARD_GRADIENTS = [
  { from: "#2563eb", to: "#60a5fa", label: "Azul" },
  { from: "#7c3aed", to: "#a78bfa", label: "Violeta" },
  { from: "#dc2626", to: "#f87171", label: "Vermelho" },
  { from: "#059669", to: "#34d399", label: "Verde" },
  { from: "#d97706", to: "#fbbf24", label: "Âmbar" },
  { from: "#0891b2", to: "#22d3ee", label: "Ciano" },
  { from: "#4338ca", to: "#818cf8", label: "Índigo" },
  { from: "#db2777", to: "#f472b6", label: "Rosa" },
] as const;

export function getCardGradient(index: number) {
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
}

export function getCardGradientStyle(index: number) {
  const g = getCardGradient(index);
  return `linear-gradient(135deg, ${g.from}, ${g.to})`;
}
