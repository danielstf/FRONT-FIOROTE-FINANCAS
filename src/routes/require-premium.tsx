import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/auth-provider";
import { hasPremiumAtivo } from "../lib/premium";

export function RequirePremium({ children }: { children: ReactElement }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!hasPremiumAtivo(session?.usuario)) {
    return <Navigate to="/app/premium" replace state={{ from: location.pathname }} />;
  }

  return children;
}
