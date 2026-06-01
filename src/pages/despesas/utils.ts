import type { FormaPagamentoDespesa } from "../../api/despesas/types";
export { formatCurrency, formatDate, formatMonthName, getCurrentMonth } from "../../lib/format";
export { moneyToInput, parseMoney } from "../../lib/money";
import { getCurrentMonth } from "../../lib/format";

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

