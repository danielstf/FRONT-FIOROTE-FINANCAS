import type { FormaPagamentoDespesa } from "../../api/despesas/types";
export { formatCurrency, moneyToInput, parseMoney } from "../../lib/money";

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
  CARTAO_CREDITO: "Cartão de crédito",
  CARTAO_DEBITO: "Cartão de débito",
  VALE_ALIMENTACAO: "Vale alimentação",
  VALE_REFEICAO: "Vale refeição",
  BOLETO: "Boleto",
};

export const formasPagamentoOptions = Object.entries(formaPagamentoLabel).map(
  ([value, label]) => ({
    value: value as FormaPagamentoDespesa,
    label,
  }),
);
