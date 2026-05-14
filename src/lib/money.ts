export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function parseMoney(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return Number.NaN;
  }

  return Number(digits) / 100;
}

export function moneyToInput(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatMoneyInput(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^0+(?=\d{3})/, "");

  if (!digits) {
    return "";
  }

  return moneyToInput(Number(digits) / 100);
}
