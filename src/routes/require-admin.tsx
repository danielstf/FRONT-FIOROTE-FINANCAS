import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/auth-provider";

export function RequireAdmin({ children }: { children: ReactElement }) {
  const { session } = useAuth();

  if (session?.usuario.role !== "ADMIN") {
    return <Navigate to="/app" replace />;
  }

  return children;
}
