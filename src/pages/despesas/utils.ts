import type { FormaPagamentoDespesa } from "../../api/despesas/types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function parseMoney(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

export function moneyToInput(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(value: string | null) {
  if (!value) return "Sem vencimento";

  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function formatMonthName(value: string) {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function dateToMonth(value?: string | null) {
  if (!value) return getCurrentMonth();

  return value.slice(0, 7);
}

export const formaPagamentoLabel: Record<FormaPagamentoDespesa, string> = {
  DINHEIRO: "Dinheiro",
  CARTAO_CREDITO: "Cartao de credito",
};
