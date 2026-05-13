export function toUppercaseText(value: string) {
  return value.toLocaleUpperCase("pt-BR");
}

export function normalizeRequiredText(value: string) {
  return toUppercaseText(value.trim());
}

export function normalizeOptionalText(value: string) {
  const normalized = normalizeRequiredText(value);
  return normalized || null;
}
