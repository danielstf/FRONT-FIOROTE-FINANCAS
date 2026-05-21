import type { LoginResponse } from "../api/auth/types";

export function hasPremiumAtivo(usuario?: LoginResponse["usuario"] | null) {
  if (!usuario || usuario.plano !== "PREMIUM" || !usuario.premiumExpiraEm) {
    return false;
  }

  return new Date(usuario.premiumExpiraEm).getTime() > Date.now();
}
