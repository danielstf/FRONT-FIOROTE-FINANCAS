import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Crown,
  Loader2,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { adminApi } from "../../api/admin/admin-api";
import type { AdminResumoResponse, AdminUsuarioDetalhe } from "../../api/admin/types";
import { getApiErrorMessage } from "../../api/errors";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { cn } from "../../lib/utils";
import { useAuth } from "../../providers/auth-provider";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDateShort(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
}

function statusPagamentoBadge(status: string) {
  const map: Record<string, string> = {
    APPROVED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    CANCELLED: "bg-red-500/15 text-red-600 dark:text-red-400",
    REJECTED: "bg-red-500/15 text-red-600 dark:text-red-400",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

export function AdminResumoPage() {
  const { session } = useAuth();
  const [resumo, setResumo] = useState<AdminResumoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busca, setBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<AdminUsuarioDetalhe[]>([]);
  const [usuarioModal, setUsuarioModal] = useState<AdminUsuarioDetalhe | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAdmin = session?.usuario.role === "ADMIN";

  async function pesquisarUsuario(termo: string) {
    if (!termo.trim()) { setResultados([]); return; }
    setBuscando(true);
    try {
      const data = await adminApi.buscarUsuario(termo.trim());
      setResultados(data.usuarios);
    } catch {
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  }

  function handleBuscaChange(valor: string) {
    setBusca(valor);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void pesquisarUsuario(valor), 400);
  }

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

      {/* ── Busca de usuário ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Buscar usuário</CardTitle>
          <CardDescription>Pesquise por nome ou e-mail.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={busca}
              onChange={(e) => handleBuscaChange(e.target.value)}
              placeholder="Nome ou e-mail..."
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
            {busca && (
              <button
                type="button"
                onClick={() => { setBusca(""); setResultados([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {buscando && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Buscando...
            </div>
          )}

          {!buscando && busca && resultados.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhum usuário encontrado.</p>
          )}

          {resultados.length > 0 && (
            <div className="divide-y divide-border rounded-lg border border-border">
              {resultados.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUsuarioModal(u)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {u.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{u.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                    u.plano === "PREMIUM"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground",
                  )}>
                    {u.plano}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modal detalhe do usuário ── */}
      <Dialog open={Boolean(usuarioModal)} onOpenChange={(open) => { if (!open) setUsuarioModal(null); }}>
        <DialogContent className="max-h-[calc(100vh-2rem)] max-w-lg overflow-y-auto">
          {usuarioModal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                    {usuarioModal.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="truncate text-lg">{usuarioModal.nome}</DialogTitle>
                    <p className="truncate text-sm text-muted-foreground">{usuarioModal.email}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-1">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold uppercase",
                    usuarioModal.plano === "PREMIUM"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground",
                  )}>
                    {usuarioModal.plano}
                  </span>
                  {usuarioModal.role === "ADMIN" && (
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase text-primary">
                      Admin
                    </span>
                  )}
                  {usuarioModal.loginGoogle && (
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                      Google
                    </span>
                  )}
                  {usuarioModal.exibirAnuncios && (
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase text-amber-600 dark:text-amber-400">
                      Vê anúncios
                    </span>
                  )}
                </div>

                {/* Datas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Cadastro
                    </div>
                    <p className="mt-1 text-sm font-semibold">{formatDateShort(usuarioModal.criadoEm)}</p>
                  </div>
                  <div className={cn(
                    "rounded-xl border p-3",
                    usuarioModal.premiumExpiraEm && new Date(usuarioModal.premiumExpiraEm) > new Date()
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-border bg-muted/30",
                  )}>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Crown className="h-3.5 w-3.5" />
                      Premium expira
                    </div>
                    <p className="mt-1 text-sm font-semibold">{formatDateShort(usuarioModal.premiumExpiraEm)}</p>
                  </div>
                </div>

                {/* Contagens */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Despesas", value: usuarioModal.contagens.despesas, icon: TrendingDown, color: "text-red-500" },
                    { label: "Receitas", value: usuarioModal.contagens.receitas, icon: TrendingUp, color: "text-emerald-500" },
                    { label: "Cartões", value: usuarioModal.contagens.cartoesCredito, icon: CreditCard, color: "text-blue-500" },
                    { label: "Perfis", value: usuarioModal.contagens.perfisFinanceiros, icon: WalletCards, color: "text-violet-500" },
                    { label: "Pagamentos", value: usuarioModal.contagens.pagamentosPremium, icon: ReceiptText, color: "text-amber-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-1 rounded-xl border border-border bg-muted/30 p-3">
                      <item.icon className={cn("h-4 w-4", item.color)} />
                      <p className="text-lg font-bold">{item.value}</p>
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Histórico de pagamentos */}
                {usuarioModal.pagamentos.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Últimos pagamentos
                    </p>
                    <div className="divide-y divide-border rounded-lg border border-border">
                      {usuarioModal.pagamentos.map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                          <div className="flex items-center gap-2">
                            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", statusPagamentoBadge(p.status))}>
                              {p.status}
                            </span>
                            <span className="text-xs text-muted-foreground">{p.tipo}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-semibold">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.valor)}
                            </span>
                            <span className="text-muted-foreground">{formatDateShort(p.criadoEm)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {usuarioModal.pagamentos.length === 0 && (
                  <p className="text-xs text-muted-foreground">Sem histórico de pagamentos.</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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

