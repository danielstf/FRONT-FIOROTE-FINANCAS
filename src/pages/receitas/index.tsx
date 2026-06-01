import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../api/errors";
import { receitasApi } from "../../api/receitas/receitas-api";
import type { Receita } from "../../api/receitas/types";
import { MonthPicker } from "../../components/month-picker";
import { EmptyState } from "../../components/empty-state";
import { PageHeader } from "../../components/page-header";
import { StatCard, statsContainerVariant } from "../../components/stat-card";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { formatCurrency, formatMonthName, getCurrentMonth } from "../../lib/format";
import { pageVariants, sectionVariants, listContainerVariants, listItemVariants } from "../../lib/motion";
import { useAuth } from "../../providers/auth-provider";
import { ReceitaForm } from "./receita-form";

function formatMonth(value: string) {
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}

export function ReceitasPage() {
  const { perfilFinanceiroId } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMonth = searchParams.get("mes") ?? getCurrentMonth();
  const [mes, setMes] = useState(initialMonth);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [receitaEditando, setReceitaEditando] = useState<Receita | null>(null);
  const [receitaExcluindo, setReceitaExcluindo] = useState<Receita | null>(null);
  const [escopoExclusao, setEscopoExclusao] = useState<"mes" | "todas">("mes");
  const [error, setError] = useState("");

  const maiorReceita = useMemo(
    () => receitas.reduce<Receita | null>((m, r) => (!m || r.valor > m.valor ? r : m), null),
    [receitas],
  );

  async function carregarReceitas(mesSelecionado = mes) {
    setError("");
    setLoading(true);
    try {
      const data = await receitasApi.listar({ mes: mesSelecionado });
      setReceitas(data.receitas);
      setTotal(data.total);
      setSearchParams({ mes: mesSelecionado });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function excluirReceita() {
    if (!receitaExcluindo) return;
    setError("");
    setDeletingId(receitaExcluindo.id);
    try {
      await receitasApi.excluir(receitaExcluindo.id, {
        escopo: receitaExcluindo.fixa ? escopoExclusao : undefined,
        mes,
      });
      toast.success(
        receitaExcluindo.fixa && escopoExclusao === "mes"
          ? "Receita removida deste mês."
          : receitaExcluindo.fixa
            ? "Receita removida deste mês em diante."
            : "Receita excluída com sucesso.",
      );
      setReceitaExcluindo(null);
      await carregarReceitas(mes);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    void carregarReceitas(initialMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfilFinanceiroId]);

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* ── Page header ── */}
      <motion.div variants={sectionVariants}>
        <PageHeader
          icon={TrendingUp}
          iconClassName="bg-blue-500/10 text-blue-500"
          title="Receitas"
          subtitle={formatMonthName(mes)}
          right={
            <>
              <div className="w-44">
                <MonthPicker
                  value={mes}
                  onChange={(m) => { setMes(m); void carregarReceitas(m); }}
                />
              </div>
              <Button className="h-10 gap-2" onClick={() => setCadastroAberto(true)}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova receita</span>
              </Button>
            </>
          }
        />
      </motion.div>

      {/* ── Stats ── */}
      <motion.div
        variants={statsContainerVariant}
        className="grid gap-3 sm:grid-cols-3"
      >
        <StatCard
          label="Total do mês"
          value={formatCurrency(total)}
          loading={loading}
          valueClassName="text-blue-500"
          className="border-blue-500/20 bg-blue-500/6"
          glowClassName="bg-blue-500/15"
        />
        <StatCard
          label="Lançamentos"
          value={receitas.length}
          loading={loading}
        />
        <StatCard
          label="Maior receita"
          value={maiorReceita ? formatCurrency(maiorReceita.valor) : "R$ 0,00"}
          loading={loading}
          valueClassName="text-blue-500 truncate"
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── List ── */}
      <motion.div variants={sectionVariants} className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-semibold text-foreground">Entradas do mês</p>
          </div>
          <p className="text-xs text-muted-foreground capitalize">{formatMonthName(mes)}</p>
        </div>

        {loading && (
          <div className="flex items-center gap-2.5 p-5 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        )}

        {!loading && receitas.length === 0 && (
          <EmptyState
            icon={WalletCards}
            title="Nenhuma receita neste mês."
            description="Comece cadastrando uma entrada."
            action={
              <Button className="h-9 gap-2 text-sm" onClick={() => setCadastroAberto(true)}>
                <Plus className="h-3.5 w-3.5" /> Cadastrar receita
              </Button>
            }
          />
        )}

        {!loading && receitas.length > 0 && (
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-border/60"
          >
            {receitas.map((receita) => (
              <motion.div
                key={receita.id}
                variants={listItemVariants}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{receita.nome}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatMonth(receita.mes)}
                    </span>
                    {receita.fixa && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Fixa
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-blue-500">
                  {formatCurrency(receita.valor)}
                </span>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    aria-label="Editar receita"
                    className="h-8 w-8 rounded-lg px-0"
                    variant="outline"
                    title="Editar"
                    onClick={() => setReceitaEditando(receita.fixa ? { ...receita, mes } : receita)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    aria-label="Excluir receita"
                    className="h-8 w-8 rounded-lg px-0 text-destructive hover:text-destructive"
                    variant="outline"
                    title="Excluir"
                    disabled={deletingId === receita.id}
                    onClick={() => { setEscopoExclusao("mes"); setReceitaExcluindo(receita); }}
                  >
                    {deletingId === receita.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* ── Dialog: Cadastro ── */}
      <Dialog open={cadastroAberto} onOpenChange={setCadastroAberto}>
        <DialogContent className="max-h-[calc(100vh-1rem)] max-w-4xl overflow-y-auto p-0">
          <div className="relative border-b border-border p-5">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
                Nova receita
              </DialogTitle>
              <DialogDescription>Cadastre uma entrada sem sair da lista.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-5">
            <ReceitaForm
              defaultMonth={mes}
              onCancel={() => setCadastroAberto(false)}
              onSuccess={(mesCriado) => { setCadastroAberto(false); setMes(mesCriado); void carregarReceitas(mesCriado); }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Edição ── */}
      <Dialog open={Boolean(receitaEditando)} onOpenChange={(open) => { if (!open) setReceitaEditando(null); }}>
        <DialogContent className="max-h-[calc(100vh-1rem)] max-w-4xl overflow-y-auto p-0">
          <div className="relative border-b border-border p-5">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-4.5 w-4.5 text-blue-500" />
                Editar receita
              </DialogTitle>
              <DialogDescription>Atualize esta entrada sem sair da lista.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-5">
            {receitaEditando && (
              <ReceitaForm
                key={receitaEditando.id}
                mode="edit"
                receita={receitaEditando}
                onCancel={() => setReceitaEditando(null)}
                onSuccess={(mesEditado) => { setReceitaEditando(null); setMes(mesEditado); void carregarReceitas(mesEditado); }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Exclusão ── */}
      <Dialog open={Boolean(receitaExcluindo)} onOpenChange={(open) => { if (!open) setReceitaExcluindo(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir receita</DialogTitle>
            <DialogDescription>
              {receitaExcluindo?.fixa
                ? "Escolha se deseja remover apenas este mês ou encerrar a receita fixa deste mês em diante."
                : "Esta ação remove a receita definitivamente."}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-sm font-semibold text-foreground">{receitaExcluindo?.nome}</p>
            <p className="mt-0.5 text-sm font-bold text-blue-500">{formatCurrency(receitaExcluindo?.valor ?? 0)}</p>
          </div>
          {receitaExcluindo?.fixa && (
            <div className="grid gap-2">
              {(["mes", "todas"] as const).map((opcao) => (
                <label key={opcao} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted/40">
                  <input
                    className="mt-1 h-4 w-4 accent-primary"
                    checked={escopoExclusao === opcao}
                    name="escopo-receita"
                    type="radio"
                    onChange={() => setEscopoExclusao(opcao)}
                  />
                  <span>
                    <span className="block text-sm font-semibold">
                      {opcao === "mes" ? "Somente a selecionada" : "Esta e as próximas"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {opcao === "mes"
                        ? `Remove apenas ${formatMonth(mes)}.`
                        : "Mantém os meses anteriores e encerra a recorrência."}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setReceitaExcluindo(null)}>Cancelar</Button>
            <Button variant="destructive" disabled={deletingId === receitaExcluindo?.id} onClick={excluirReceita}>
              {deletingId === receitaExcluindo?.id && <Loader2 className="h-4 w-4 animate-spin" />}
              {receitaExcluindo?.fixa && escopoExclusao === "mes"
                ? "Excluir selecionada"
                : receitaExcluindo?.fixa
                  ? "Excluir esta e próximas"
                  : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
