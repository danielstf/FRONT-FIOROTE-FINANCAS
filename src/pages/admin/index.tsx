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
import { useEffect, useMemo, useState } from "react";
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
import { cn } from "../../lib/utils";
import { useAuth } from "../../providers/auth-provider";

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

  const metrics = [
    {
      label: "Usuários",
      value: resumo?.usuarios.total ?? 0,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Premium",
      value: resumo?.usuarios.premium ?? 0,
      icon: Crown,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      helper: `${percentualPremium}% da base`,
    },
    {
      label: "Perfis",
      value: resumo?.perfis.total ?? 0,
      icon: WalletCards,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      label: "Movimentos",
      value: totalMovimentos,
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between lg:p-7">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <ShieldAlert className="h-4 w-4" />
              Administração
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal lg:text-3xl">
                Relatório administrativo
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Visão geral de usuários, planos, perfis e movimentações do
                sistema.
              </p>
            </div>
          </div>

          <Button
            className="h-10 shrink-0 gap-2 self-start px-4 text-sm"
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
        <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          Carregando relatório...
        </div>
      ) : resumo ? (
        <>
          {/* Métricas */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((item) => (
              <Card
                className={cn(
                  "relative overflow-hidden shadow-sm transition-shadow hover:shadow-md",
                  `border-l-4 ${item.border}`,
                )}
                key={item.label}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                  <div className="space-y-1 min-w-0">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">
                      {item.label}
                    </CardDescription>
                    <CardTitle className={cn("text-3xl font-bold", item.color)}>
                      {item.value}
                    </CardTitle>
                    {item.helper && (
                      <p className="text-xs text-muted-foreground">
                        {item.helper}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
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

          {/* Conteúdo principal */}
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            {/* Últimos usuários */}
            <Card className="shadow-sm">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">Últimos usuários</CardTitle>
                <CardDescription>
                  Cadastros mais recentes no sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-border p-0">
                {resumo.ultimosUsuarios.map((usuario) => (
                  <div
                    className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                    key={usuario.id}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {usuario.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {usuario.nome}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {usuario.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          usuario.plano === "PREMIUM"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground",
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

            {/* Cards laterais */}
            <div className="space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium uppercase tracking-wide">
                    Movimentos cadastrados
                  </CardDescription>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {totalMovimentos}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 pt-0">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                    <p className="text-xs text-muted-foreground">Receitas</p>
                    <p className="mt-1.5 text-xl font-bold text-blue-600 dark:text-blue-400">
                      {resumo.movimentos.receitas}
                    </p>
                  </div>
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                    <p className="text-xs text-muted-foreground">Despesas</p>
                    <p className="mt-1.5 text-xl font-bold text-red-600 dark:text-red-400">
                      {resumo.movimentos.despesas}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium uppercase tracking-wide">
                    Usuários simultâneos
                  </CardDescription>
                  <CardTitle className="text-2xl">
                    {resumo.simultaneos.atual}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    Ativos nos últimos{" "}
                    <span className="font-semibold text-foreground">
                      {resumo.simultaneos.janelaMinutos} min
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
