import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CreditCard,
  Filter,
  Loader2,
  PencilLine,
  Plus,
  ReceiptText,
  Repeat2,
  Search,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cartoesApi } from "../../api/cartoes/cartoes-api";
import type { CartaoCredito } from "../../api/cartoes/types";
import { getCardGradientStyle } from "../../lib/card-colors";
import { despesasApi } from "../../api/despesas/despesas-api";
import type { Despesa, FormaPagamentoDespesa } from "../../api/despesas/types";
import { getApiErrorMessage } from "../../api/errors";
import { MonthPicker } from "../../components/month-picker";
import { EmptyState } from "../../components/empty-state";
import { PageHeader } from "../../components/page-header";
import { StatCard, statsContainerVariant } from "../../components/stat-card";
import { Button } from "../../components/ui/button";
import { Select } from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

import { cn } from "../../lib/utils";
import { pageVariants, sectionVariants, listContainerVariants, listItemVariants } from "../../lib/motion";
import { useAuth } from "../../providers/auth-provider";
import { DespesaForm } from "./despesa-form";
import { getCategoryColor, getCategoryIcon } from "./category-icons";
import {
  formaPagamentoLabel,
  formasPagamentoOptions,
  formatCurrency,
  formatDate,
  formatMonthName,
  getCurrentMonth,
} from "./utils";

type StatusFilter = "todas" | "pendentes" | "pagas" | "vencidas";

function ajustarDataParaMes(dataIso: string | null, mesDestino: string) {
  if (!dataIso) return dataIso;

  const [, month] = mesDestino.split("-").map(Number);
  const [datePart] = dataIso.split("T");
  const [, , day] = datePart.split("-").map(Number);
  const [yearText] = mesDestino.split("-");
  const ultimoDia = new Date(Number(yearText), month, 0).getDate();
  const diaSeguro = Math.min(day || 1, ultimoDia);

  return `${mesDestino}-${String(diaSeguro).padStart(2, "0")}T00:00:00.000Z`;
}

export function DespesasPage() {
  const { perfilFinanceiroId } = useAuth();
  const [mes, setMes] = useState(getCurrentMonth);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPendente, setTotalPendente] = useState(0);
  const [totalPago, setTotalPago] = useState(0);
  const [contasVencidas, setContasVencidas] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoDespesa | "">("");
  const [cartaoId, setCartaoId] = useState("");
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [status, setStatus] = useState<StatusFilter>("todas");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [despesaEditando, setDespesaEditando] = useState<Despesa | null>(null);
  const [despesaExcluindo, setDespesaExcluindo] = useState<Despesa | null>(null);
  const [escopoExclusao, setEscopoExclusao] = useState<"mes" | "todas">("mes");
  const [error, setError] = useState("");
  const [busca, setBusca] = useState("");

  const despesasFiltradas = busca.trim()
    ? despesas.filter((d) => d.nome.toLowerCase().includes(busca.trim().toLowerCase()))
    : despesas;

  const filtrosAtivos = [formaPagamento, cartaoId, status !== "todas" ? status : "", busca.trim()].filter(Boolean).length;

  const despesaExcluindoParcelada = Boolean(despesaExcluindo?.parcelamentoId);
  const despesaExcluindoRecorrente = Boolean(despesaExcluindo?.fixa);
  const despesaExcluindoComEscopo =
    despesaExcluindoParcelada || despesaExcluindoRecorrente;

  async function carregarDespesas(
    mesSelecionado = mes,
    formaSelecionada = formaPagamento,
    statusSelecionado = status,
    cartaoSelecionado = cartaoId,
  ) {
    setError("");
    setLoading(true);

    try {
      const data = await despesasApi.listar({
        mes: mesSelecionado,
        formaPagamento: formaSelecionada || undefined,
        cartaoCreditoId: cartaoSelecionado || undefined,
        paga:
          statusSelecionado === "pagas"
            ? true
            : statusSelecionado === "pendentes"
              ? false
              : undefined,
        somenteVencidas: statusSelecionado === "vencidas" || undefined,
      });

      setDespesas(data.despesas);
      setTotal(data.total);
      setTotalPendente(data.totalPendente);
      setTotalPago(data.totalPago);
      setContasVencidas(data.contasVencidas);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  function limparFiltros() {
    setFormaPagamento("");
    setCartaoId("");
    setStatus("todas");
    setBusca("");
    void carregarDespesas(mes, "", "todas", "");
  }

  async function alternarPagamento(despesa: Despesa) {
    setBusyId(despesa.id);
    setError("");

    try {
      await despesasApi.alterarPagamento(despesa.id, !despesa.paga, mes);
      toast.success(
        despesa.paga ? "Despesa marcada como pendente." : "Despesa marcada como paga.",
      );
      await carregarDespesas();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  }

  async function excluirDespesa() {
    if (!despesaExcluindo) return;
    setBusyId(despesaExcluindo.id);
    setError("");

    try {
      await despesasApi.excluir(despesaExcluindo.id, {
        escopo: despesaExcluindoComEscopo ? escopoExclusao : undefined,
        mes,
      });
      toast.success(
        despesaExcluindoParcelada && escopoExclusao === "todas"
          ? "Parcelas excluídas com sucesso."
          : despesaExcluindoParcelada && escopoExclusao === "mes"
            ? "Parcela removida deste mês."
          : despesaExcluindoRecorrente && escopoExclusao === "mes"
            ? "Despesa removida deste mês."
          : "Despesa excluída com sucesso.",
      );
      setDespesaExcluindo(null);
      await carregarDespesas();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  }

  function toggleSelectionMode() {
    setSelectionMode((v) => !v);
    setSelectedIds(new Set());
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function excluirSelecionadas() {
    setBulkDeleting(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) => {
          const d = despesas.find((x) => x.id === id);
          return despesasApi.excluir(id, {
            escopo: d?.parcelamentoId || d?.fixa ? "mes" : undefined,
            mes,
          });
        }),
      );
      const count = selectedIds.size;
      toast.success(`${count} ${count === 1 ? "despesa excluída" : "despesas excluídas"} com sucesso.`);
      setBulkDeleteOpen(false);
      setSelectionMode(false);
      setSelectedIds(new Set());
      await carregarDespesas();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setBulkDeleting(false);
    }
  }

  useEffect(() => {
    void carregarDespesas();
    cartoesApi.listar().then((d) => setCartoes(d.cartoes)).catch(() => {});
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
          icon={ReceiptText}
          iconClassName="bg-red-500/10 text-red-500"
          title="Despesas"
          subtitle={formatMonthName(mes)}
          right={
            <Button
              variant="destructive"
              className="h-10 gap-2"
              onClick={() => setCadastroAberto(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova despesa</span>
            </Button>
          }
        />
      </motion.div>

      {/* ── Barra de filtros ── */}
      <motion.div
        variants={sectionVariants}
        className="overflow-hidden rounded-2xl border border-border bg-card"
      >
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Filtros
            {filtrosAtivos > 0 && (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {filtrosAtivos}
              </span>
            )}
          </div>
          <div className="flex-1" />
          {filtrosAtivos > 0 && (
            <button
              type="button"
              onClick={limparFiltros}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Limpar filtros
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          {/* Mês */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mês</span>
            <div className="w-40">
              <MonthPicker
                value={mes}
                onChange={(value) => { setMes(value); void carregarDespesas(value, formaPagamento, status, cartaoId); }}
              />
            </div>
          </div>

          <div className="h-10 w-px bg-border/60" />

          {/* Status */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
            <div className="flex items-center gap-1">
              {(["todas", "pendentes", "pagas", "vencidas"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setStatus(s); void carregarDespesas(mes, formaPagamento, s, cartaoId); }}
                  className={cn(
                    "h-8 rounded-lg px-3 text-xs font-semibold capitalize transition-all",
                    status === s
                      ? s === "vencidas"
                        ? "bg-destructive/15 text-destructive"
                        : s === "pagas"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : s === "pendentes"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="h-10 w-px bg-border/60" />

          {/* Forma de pagamento */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Forma de pagamento</span>
            <Select
              value={formaPagamento}
              onChange={(event) => {
                const value = event.target.value as FormaPagamentoDespesa | "";
                setFormaPagamento(value);
                if (value !== "CARTAO_CREDITO") setCartaoId("");
                void carregarDespesas(mes, value, status, value !== "CARTAO_CREDITO" ? "" : cartaoId);
              }}
              className="h-8 text-xs"
            >
              <option value="">Todas as formas</option>
              {formasPagamentoOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>

          <div className="h-10 w-px bg-border/60" />

          {/* Busca por nome */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Buscar despesa</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome da despesa..."
                className="h-8 w-52 rounded-lg border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Cartão de crédito — mini-cards com cor correspondente */}
          {cartoes.length > 0 && formaPagamento === "CARTAO_CREDITO" && (
            <>
              <div className="h-10 w-px bg-border/60" />
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cartão de crédito</span>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Opção Todos */}
                  <button
                    type="button"
                    onClick={() => { setCartaoId(""); void carregarDespesas(mes, formaPagamento, status, ""); }}
                    className={cn(
                      "relative overflow-hidden rounded-lg border-2 px-3 py-1.5 text-xs font-semibold transition-all",
                      cartaoId === ""
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground hover:border-border/80 hover:text-foreground",
                    )}
                  >
                    Todos
                  </button>

                  {/* Mini-card por cartão */}
                  {cartoes.map((cartao, index) => {
                    const isSelected = cartaoId === cartao.id;
                    return (
                      <button
                        key={cartao.id}
                        type="button"
                        onClick={() => {
                          setCartaoId(cartao.id);
                          setFormaPagamento("CARTAO_CREDITO");
                          void carregarDespesas(mes, "CARTAO_CREDITO", status, cartao.id);
                        }}
                        className={cn(
                          "relative overflow-hidden rounded-lg transition-all",
                          isSelected
                            ? "ring-2 ring-white/60 ring-offset-1 ring-offset-background scale-105 shadow-lg"
                            : "opacity-70 hover:opacity-100 hover:scale-102",
                        )}
                        style={{ background: getCardGradientStyle(index) }}
                        title={cartao.nome}
                      >
                        {/* Linha brilho topo */}
                        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/40" />
                        {/* Círculo decorativo */}
                        <div aria-hidden className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 rounded-full bg-white/10" />

                        <div className="relative flex items-center gap-2 px-3 py-2 text-white">
                          {/* Chip mini */}
                          <div className="h-3.5 w-5 shrink-0 overflow-hidden rounded-xs bg-amber-300/90">
                            <div className="h-px w-full bg-amber-700/40 mt-[45%]" />
                          </div>
                          <span className="text-[11px] font-bold tracking-wide truncate max-w-20">
                            {cartao.nome}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div
        variants={statsContainerVariant}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Total do mês"
          value={formatCurrency(total)}
          loading={loading}
          valueClassName="text-red-500"
          className="border-red-500/20 bg-red-500/6"
          glowClassName="bg-red-500/15"
        />
        <StatCard
          label="Pendentes"
          value={formatCurrency(totalPendente)}
          loading={loading}
          valueClassName="text-red-500"
        />
        <StatCard
          label="Pagas"
          value={formatCurrency(totalPago)}
          loading={loading}
          valueClassName="text-emerald-500"
        />
        <StatCard
          label="Vencidas"
          value={contasVencidas}
          loading={loading}
          valueClassName={contasVencidas > 0 ? "text-destructive" : "text-foreground"}
          className={contasVencidas > 0 ? "border-destructive/30 bg-destructive/5" : undefined}
        />
      </motion.div>

      {/* ── ERROR ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/8 px-5 py-4 text-sm text-destructive"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LIST ── */}
      <motion.div variants={sectionVariants} className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          {selectionMode ? (
            <>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-primary"
                  checked={selectedIds.size === despesasFiltradas.length && despesasFiltradas.length > 0}
                  ref={(el) => { if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < despesasFiltradas.length; }}
                  onChange={() =>
                    selectedIds.size === despesasFiltradas.length
                      ? setSelectedIds(new Set())
                      : setSelectedIds(new Set(despesasFiltradas.map((d) => d.id)))
                  }
                />
                <p className="text-sm font-semibold">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} selecionada${selectedIds.size !== 1 ? "s" : ""}`
                    : "Selecionar itens"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedIds.size > 0 && (
                  <Button
                    variant="destructive"
                    className="h-8 gap-1.5 px-3 text-xs"
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir {selectedIds.size}
                  </Button>
                )}
                <Button variant="outline" className="h-8 px-3 text-xs" onClick={toggleSelectionMode}>
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <ReceiptText className="h-3.5 w-3.5" />
                </div>
                <p className="text-sm font-semibold">Contas cadastradas</p>
              </div>
              <div className="flex items-center gap-3">
                {despesas.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectionMode}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Selecionar
                  </button>
                )}
                <p className="text-xs text-muted-foreground">
                  {busca.trim() && despesasFiltradas.length !== despesas.length
                    ? `${despesasFiltradas.length} de ${despesas.length} ${despesas.length === 1 ? "item" : "itens"}`
                    : `${despesas.length} ${despesas.length === 1 ? "item" : "itens"}`}
                </p>
              </div>
            </>
          )}
        </div>

        {loading && (
          <div className="flex items-center gap-2.5 p-5 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        )}

        {!loading && despesas.length === 0 && (
          <EmptyState
            icon={ReceiptText}
            title="Nenhuma despesa encontrada."
            description="Cadastre uma conta para iniciar o controle."
            action={
              <Button variant="destructive" className="h-9 gap-2 text-sm" onClick={() => setCadastroAberto(true)}>
                <Plus className="h-3.5 w-3.5" /> Cadastrar despesa
              </Button>
            }
          />
        )}

        {!loading && despesas.length > 0 && despesasFiltradas.length === 0 && (
          <EmptyState
            icon={Search}
            title="Nenhuma despesa encontrada."
            description={`Nenhuma despesa com o nome "${busca}".`}
            action={
              <button
                type="button"
                onClick={() => setBusca("")}
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Limpar busca
              </button>
            }
          />
        )}

        {!loading && despesasFiltradas.length > 0 && (
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-border/60"
          >
            {despesasFiltradas.map((despesa) => {
                const CategoryIcon = getCategoryIcon(despesa.categoria);

                return (
                  <motion.div
                    key={despesa.id}
                    variants={listItemVariants}
                    role={selectionMode ? "button" : undefined}
                    onClick={selectionMode ? () => toggleSelect(despesa.id) : undefined}
                    className={cn(
                      "flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between",
                      despesa.vencida && !despesa.paga && "bg-destructive/4",
                      selectionMode && "cursor-pointer select-none",
                      selectionMode && selectedIds.has(despesa.id) && "bg-primary/5 hover:bg-primary/8",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {selectionMode && (
                        <input
                          type="checkbox"
                          className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                          checked={selectedIds.has(despesa.id)}
                          onChange={() => toggleSelect(despesa.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          despesa.vencida && !despesa.paga
                            ? "bg-destructive/10 text-destructive"
                            : getCategoryColor(despesa.categoria),
                        )}
                      >
                        {despesa.vencida && !despesa.paga ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <CategoryIcon className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-foreground">
                            {despesa.nome}
                          </p>
                          {despesa.paga && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                              <ThumbsUp className="h-3 w-3 fill-current" />
                              Paga
                            </span>
                          )}
                          {despesa.vencida && !despesa.paga && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                              Vencida
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1">
                            <span
                              className={cn(
                                "inline-flex h-4 w-4 items-center justify-center rounded-md",
                                getCategoryColor(despesa.categoria),
                              )}
                            >
                              <CategoryIcon className="h-2.5 w-2.5" />
                            </span>
                            {despesa.categoria ?? "Sem categoria"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1">
                            <CreditCard className="h-3 w-3 text-blue-500" />
                            {despesa.cartaoCredito
                              ? despesa.cartaoCredito.nome
                              : formaPagamentoLabel[despesa.formaPagamento]}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1">
                            <CalendarDays className="h-3 w-3 text-amber-500" />
                            {formatDate(despesa.dataVencimento)}
                          </span>
                          {despesa.fixa && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-primary">
                              <Repeat2 className="h-3 w-3" />
                              Fixa
                            </span>
                          )}
                          {despesa.parcelaAtual && despesa.numeroParcelas && (
                            <span className="rounded-md border border-border bg-card px-2 py-1">
                              Parcela {despesa.parcelaAtual}/{despesa.numeroParcelas}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <div className="text-right">
                        <strong className="text-lg font-bold text-red-500">
                          {formatCurrency(despesa.valor)}
                        </strong>
                        <p className="text-xs text-muted-foreground">
                          {despesa.paga ? "Quitada" : "Pendente"}
                        </p>
                      </div>

                      {!selectionMode && (
                        <div className="flex gap-1.5">
                          <Button
                            aria-label={despesa.paga ? "Despesa paga" : "Marcar despesa como paga"}
                            className={cn(
                              "h-9 w-9 rounded-lg px-0",
                              despesa.paga
                                ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
                                : "border-rose-500/25 bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:text-rose-400",
                            )}
                            title={
                              despesa.paga
                                ? "Despesa paga"
                                : "Despesa pendente. Clique para marcar como paga"
                            }
                            variant="outline"
                            onClick={() => alternarPagamento(despesa)}
                            disabled={busyId === despesa.id}
                          >
                            {busyId === despesa.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : despesa.paga ? (
                              <ThumbsUp className="h-4 w-4 fill-current" />
                            ) : (
                              <ThumbsDown className="h-4 w-4 fill-current" />
                            )}
                          </Button>
                          <Button
                            aria-label="Editar despesa"
                            className="h-9 w-9 rounded-lg border-blue-500/25 px-0 text-blue-700 hover:bg-blue-500/10 dark:text-blue-400"
                            title="Editar"
                            variant="outline"
                            onClick={() =>
                              setDespesaEditando(
                                despesa.fixa
                                  ? {
                                      ...despesa,
                                      mesReferencia: `${mes}-01T00:00:00.000Z`,
                                      dataVencimento: ajustarDataParaMes(
                                        despesa.dataVencimento,
                                        mes,
                                      ),
                                    }
                                  : despesa,
                              )
                            }
                          >
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button
                            aria-label="Excluir despesa"
                            className="h-9 w-9 rounded-lg border-destructive/25 bg-destructive/5 px-0 text-destructive hover:bg-destructive/10"
                            title="Excluir"
                            variant="outline"
                            onClick={() => {
                              setEscopoExclusao("mes");
                              setDespesaExcluindo(despesa);
                            }}
                            disabled={busyId === despesa.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </motion.div>
        )}
      </motion.div>

      {/* ── DIALOG: cadastro ── */}
      <Dialog open={cadastroAberto} onOpenChange={setCadastroAberto}>
        <DialogContent className="max-h-[calc(100vh-0.75rem)] max-w-[min(1180px,calc(100vw-0.75rem))] gap-2 overflow-y-auto p-3">
          <DialogHeader className="space-y-0.5">
            <DialogTitle className="text-xl">Nova despesa</DialogTitle>
            <DialogDescription className="text-xs">
              Cadastre uma conta sem sair da lista de despesas.
            </DialogDescription>
          </DialogHeader>
          <DespesaForm
            mode="create"
            defaultMonth={mes}
            onCancel={() => setCadastroAberto(false)}
            onSuccess={() => {
              setCadastroAberto(false);
              void carregarDespesas();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* ── DIALOG: edição ── */}
      <Dialog
        open={Boolean(despesaEditando)}
        onOpenChange={(open) => {
          if (!open) setDespesaEditando(null);
        }}
      >
        <DialogContent className="max-h-[calc(100vh-0.75rem)] max-w-[min(1180px,calc(100vw-0.75rem))] gap-2 overflow-y-auto p-3">
          <DialogHeader className="space-y-0.5">
            <DialogTitle className="text-xl">Editar despesa</DialogTitle>
            <DialogDescription className="text-xs">
              Atualize a conta sem sair da lista de despesas.
            </DialogDescription>
          </DialogHeader>
          {despesaEditando && (
            <DespesaForm
              key={despesaEditando.id}
              mode="edit"
              despesa={despesaEditando}
              onCancel={() => setDespesaEditando(null)}
              onSuccess={() => {
                setDespesaEditando(null);
                void carregarDespesas();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── DIALOG: exclusão em massa ── */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir despesas selecionadas</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Despesas fixas e parceladas terão apenas a ocorrência deste mês removida.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Itens selecionados</span>
              <span className="font-semibold">{selectedIds.size}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <strong className="text-base font-bold text-red-500">
                {formatCurrency(
                  despesas
                    .filter((d) => selectedIds.has(d.id))
                    .reduce((sum, d) => sum + d.valor, 0),
                )}
              </strong>
            </div>

            {despesas.some(
              (d) => selectedIds.has(d.id) && (d.fixa || d.parcelamentoId),
            ) && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/8 p-3 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-xs leading-relaxed">
                  A seleção contém despesas fixas ou parceladas. Apenas a ocorrência deste mês será removida — as demais permanecerão.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkDeleteOpen(false)}
              disabled={bulkDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={excluirSelecionadas}
              disabled={bulkDeleting}
            >
              {bulkDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir {selectedIds.size} {selectedIds.size === 1 ? "despesa" : "despesas"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG: exclusão ── */}
      <Dialog
        open={Boolean(despesaExcluindo)}
        onOpenChange={(open) => {
          if (!open) setDespesaExcluindo(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir despesa</DialogTitle>
            <DialogDescription>
              {despesaExcluindoParcelada
                ? "Esta despesa faz parte de um parcelamento. Escolha se deseja remover apenas esta parcela ou excluir o parcelamento."
                : despesaExcluindoRecorrente
                  ? "Esta despesa é fixa. Escolha se deseja remover apenas a selecionada ou esta e as próximas."
                : "Esta ação remove a despesa selecionada definitivamente."}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
            <p className="font-semibold text-foreground">{despesaExcluindo?.nome}</p>
            <p className="mt-0.5 font-medium text-red-600 dark:text-red-400">
              {formatCurrency(despesaExcluindo?.valor ?? 0)}
            </p>

            {despesaExcluindoParcelada &&
              despesaExcluindo?.parcelaAtual &&
              despesaExcluindo.numeroParcelas && (
                <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/8 p-3 text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="text-xs leading-relaxed">
                    Você está excluindo a parcela {despesaExcluindo.parcelaAtual}/
                    {despesaExcluindo.numeroParcelas}. Se escolher excluir todas,
                    todas as {despesaExcluindo.numeroParcelas} parcelas vinculadas
                    a este parcelamento serão removidas.
                  </p>
                </div>
              )}

            {despesaExcluindoComEscopo && (
              <div className="mt-3 grid gap-2">
                {(["mes", "todas"] as const).map((opcao) => (
                  <label
                    key={opcao}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted/40"
                  >
                    <input
                      className="mt-1 h-4 w-4 accent-primary"
                      type="radio"
                      name="escopoExclusao"
                      value={opcao}
                      checked={escopoExclusao === opcao}
                      onChange={() => setEscopoExclusao(opcao)}
                    />
                    <span>
                      <span className="block text-sm font-semibold text-foreground">
                        {opcao === "mes"
                          ? despesaExcluindoParcelada
                            ? "Remover somente esta parcela"
                            : "Remover somente a selecionada"
                          : despesaExcluindoParcelada
                            ? "Excluir parcelamento"
                            : "Excluir esta e as próximas"}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {opcao === "mes"
                          ? despesaExcluindoParcelada
                            ? "Mantém as outras parcelas deste parcelamento."
                            : "Mantém a despesa fixa para os próximos meses."
                          : despesaExcluindoParcelada
                            ? "Remove todas as parcelas vinculadas."
                            : "Mantém os meses anteriores e remove esta recorrência daqui para frente."}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDespesaExcluindo(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={excluirDespesa}
              disabled={busyId === despesaExcluindo?.id}
            >
              {busyId === despesaExcluindo?.id && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {despesaExcluindoParcelada && escopoExclusao === "todas"
                ? "Excluir todas as parcelas"
                : despesaExcluindoParcelada && escopoExclusao === "mes"
                  ? "Remover esta parcela"
                : despesaExcluindoRecorrente && escopoExclusao === "mes"
                  ? "Remover selecionada"
                : despesaExcluindoRecorrente && escopoExclusao === "todas"
                  ? "Excluir esta e próximas"
                : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
