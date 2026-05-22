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

export function capitalizeName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/\p{L}+/gu, (word) => {
      return word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);
    });
}

export function capitalizeNameInput(value: string) {
  return value
    .toLocaleLowerCase("pt-BR")
    .replace(/\p{L}+/gu, (word) => {
      return word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);
    });
}
