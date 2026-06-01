export { formatCurrency } from "./money";

export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function formatMonthName(value: string) {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

export function formatDate(value: string | null) {
  if (!value) return "Sem vencimento";

  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) return "Data inválida";

  return new Intl.DateTimeFormat("pt-BR").format(new Date(year, month - 1, day));
}
