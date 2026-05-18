import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Crown,
  Loader2,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { adminApi } from "../../api/admin/admin-api";
import type { AdminResumoResponse } from "../../api/admin/types";
import { getApiErrorMessage } from "../../api/errors";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAuth } from "../../providers/auth-provider";
import { cn } from "../../lib/utils";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminResumoPage() {
  const { session } = useAuth();
  const [resumo, setResumo] = useState<AdminResumoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isAdmin = session?.usuario.role === "ADMIN";

  const percentualPremium = useMemo(() => {
    if (!resumo?.usuarios.total) return 0;
    return Math.round((resumo.usuarios.premium / resumo.usuarios.total) * 100);
  }, [resumo]);

  const totalMovimentos = resumo
    ? resumo.movimentos.receitas + resumo.movimentos.despesas
    : 0;

  async function carregarResumo() {
    if (!isAdmin) return;

    setLoading(true);
    setError("");

    try {
      const data = await adminApi.resumo();
      setResumo(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void carregarResumo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Acesso administrativo</CardTitle>
          <CardDescription>
            Esta área só pode ser visualizada por usuários administradores.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:p-7">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <ShieldAlert className="h-4 w-4" />
              Administração
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal lg:text-3xl">
                Relatório administrativo
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Visão geral de usuários, planos, perfis e movimentações do sistema.
              </p>
            </div>
          </div>

          <Button
            className="h-11 self-start px-5"
            type="button"
            variant="outline"
            onClick={carregarResumo}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar
          </Button>
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando relatório...
        </div>
      ) : resumo ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Usuários",
                value: resumo.usuarios.total,
                icon: Users,
                color: "text-blue-600 dark:text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                label: "Premium",
                value: resumo.usuarios.premium,
                icon: Crown,
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-500/10",
                helper: `${percentualPremium}% da base`,
              },
              {
                label: "Perfis",
                value: resumo.perfis.total,
                icon: WalletCards,
                color: "text-violet-600 dark:text-violet-400",
                bg: "bg-violet-500/10",
              },
              {
                label: "Movimentos",
                value: totalMovimentos,
                icon: TrendingUp,
                color: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-500/10",
              },
            ].map((item) => (
              <Card className="shadow-sm" key={item.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className={cn("mt-2 text-3xl", item.color)}>
                      {item.value}
                    </CardTitle>
                    {item.helper && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.helper}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-md",
                      item.bg,
                      item.color,
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Últimos usuários</CardTitle>
                <CardDescription>Cadastros mais recentes no sistema.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {resumo.ultimosUsuarios.map((usuario) => (
                  <div
                    className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    key={usuario.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{usuario.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {usuario.email}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span
                        className={cn(
                          "rounded-md border px-2 py-1 text-[10px] font-bold uppercase",
                          usuario.plano === "PREMIUM"
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "border-border bg-muted text-muted-foreground",
                        )}
                      >
                        {usuario.plano}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(usuario.criadoEm)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardDescription>Movimentos cadastrados</CardDescription>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {totalMovimentos}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 pt-0 text-sm">
                  <div className="rounded-md border border-border bg-background p-3">
                    <p className="text-muted-foreground">Receitas</p>
                    <p className="mt-1 text-xl font-semibold text-blue-600 dark:text-blue-400">
                      {resumo.movimentos.receitas}
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-background p-3">
                    <p className="text-muted-foreground">Despesas</p>
                    <p className="mt-1 text-xl font-semibold text-red-600 dark:text-red-400">
                      {resumo.movimentos.despesas}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardDescription>Usuários simultâneos</CardDescription>
                  <CardTitle>{resumo.simultaneos.atual ?? "Não medido"}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  {resumo.simultaneos.observacao}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
