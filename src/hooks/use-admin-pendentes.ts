import { useEffect, useState } from "react";
import { adminApi } from "../api/admin/admin-api";
import { useAuth } from "../providers/auth-provider";

export function useAdminPendentes() {
  const { session } = useAuth();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (session?.usuario.role !== "ADMIN") return;

    adminApi.pendentes()
      .then((res) => setTotal(res.total))
      .catch(() => {});
  }, [session?.usuario.role]);

  function recarregar() {
    if (session?.usuario.role !== "ADMIN") return;
    adminApi.pendentes()
      .then((res) => setTotal(res.total))
      .catch(() => {});
  }

  return { total, recarregar };
}
