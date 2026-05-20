import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/auth-provider";

function hasPremiumAtivo(session: ReturnType<typeof useAuth>["session"]) {
  if (!session || session.usuario.plano !== "PREMIUM") return false;
  if (!session.usuario.premiumExpiraEm) return true;

  return new Date(session.usuario.premiumExpiraEm).getTime() > Date.now();
}

export function RequirePremium({ children }: { children: ReactElement }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!hasPremiumAtivo(session)) {
    return <Navigate to="/app/premium" replace state={{ from: location.pathname }} />;
  }

  return children;
}
