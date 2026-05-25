import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CreditCard,
  Loader2,
  PencilLine,
  Plus,
  ReceiptText,
  Repeat2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { despesasApi } from "../../api/despesas/despesas-api";
import type { Despesa, FormaPagamentoDespesa } from "../../api/despesas/types";
import { getApiErrorMessage } from "../../api/errors";
import { MonthPicker } from "../../components/month-picker";
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
  const [status, setStatus] = useState<StatusFilter>("todas");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [despesaEditando, setDespesaEditando] = useState<Despesa | null>(null);
  const [despesaExcluindo, setDespesaExcluindo] = useState<Despesa | null>(null);
  const [escopoExclusao, setEscopoExclusao] = useState<"mes" | "todas">("mes");
  const [error, setError] = useState("");

  const maiorDespesa = useMemo(() => {
    return despesas.reduce<Despesa | null>((maior, despesa) => {
      if (!maior || despesa.valor > maior.valor) return despesa;
      return maior;
    }, null);
  }, [despesas]);
  const despesaExcluindoParcelada = Boolean(despesaExcluindo?.parcelamentoId);
  const despesaExcluindoRecorrente = Boolean(despesaExcluindo?.fixa);
  const despesaExcluindoComEscopo =
    despesaExcluindoParcelada || despesaExcluindoRecorrente;

  async function carregarDespesas(
    mesSelecionado = mes,
    formaSelecionada = formaPagamento,
    statusSelecionado = status,
  ) {
    setError("");
    setLoading(true);

    try {
      const data = await despesasApi.listar({
        mes: mesSelecionado,
        formaPagamento: formaSelecionada || undefined,
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

  useEffect(() => {
    void carregarDespesas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfilFinanceiroId]);

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
            <ReceiptText className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Despesas</h1>
            <p className="text-xs text-muted-foreground capitalize">{formatMonthName(mes)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={formaPagamento}
            onChange={(event) => {
              const value = event.target.value as FormaPagamentoDespesa | "";
              setFormaPagamento(value);
              void carregarDespesas(mes, value, status);
            }}
            className="h-10 text-sm"
          >
            <option value="">Forma: Todas</option>
            {formasPagamentoOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(event) => {
              const value = event.target.value as StatusFilter;
              setStatus(value);
              void carregarDespesas(mes, formaPagamento, value);
            }}
            className="h-10 text-sm"
          >
            <option value="todas">Status: Todas</option>
            <option value="pendentes">Pendentes</option>
            <option value="pagas">Pagas</option>
            <option value="vencidas">Vencidas</option>
          </Select>
          <div className="w-40">
            <MonthPicker
              value={mes}
              onChange={(value) => { setMes(value); void carregarDespesas(value, formaPagamento, status); }}
            />
          </div>
          <Button
            variant="destructive"
            className="h-10 gap-2"
            onClick={() => setCadastroAberto(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova despesa</span>
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/6 p-5">
          <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-20 w-20 -translate-y-4 translate-x-4 rounded-full bg-red-500/15 blur-2xl" />
          <p className="text-xs font-medium text-muted-foreground">Total do mês</p>
          <p className="mt-2 text-2xl font-bold text-red-500">{loading ? "—" : formatCurrency(total)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground">Pendentes</p>
          <p className="mt-2 text-2xl font-bold text-red-500">{loading ? "—" : formatCurrency(totalPendente)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground">Pagas</p>
          <p className="mt-2 text-2xl font-bold text-emerald-500">{loading ? "—" : formatCurrency(totalPago)}</p>
        </div>
        <div className={cn("rounded-2xl border bg-card p-5", contasVencidas > 0 ? "border-destructive/30 bg-destructive/5" : "border-border")}>
          <p className="text-xs font-medium text-muted-foreground">Vencidas</p>
          <p className={cn("mt-2 text-2xl font-bold", contasVencidas > 0 ? "text-destructive" : "text-foreground")}>
            {loading ? "—" : contasVencidas}
          </p>
        </div>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/8 px-5 py-4 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── LIST ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <ReceiptText className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-semibold">Contas cadastradas</p>
          </div>
          <p className="text-xs text-muted-foreground">{despesas.length} {despesas.length === 1 ? "item" : "itens"}</p>
        </div>

        {loading && (
          <div className="flex items-center gap-2.5 p-5 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        )}

        {!loading && despesas.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
              <ReceiptText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Nenhuma despesa encontrada.</p>
              <p className="mt-1 text-xs text-muted-foreground">Cadastre uma conta para iniciar o controle.</p>
            </div>
            <Button variant="destructive" className="mt-1 h-9 gap-2 text-sm" onClick={() => setCadastroAberto(true)}>
              <Plus className="h-3.5 w-3.5" /> Cadastrar despesa
            </Button>
          </div>
        )}

        {!loading && despesas.length > 0 && (
            <div className="divide-y divide-border/60">
              {despesas.map((despesa) => {
                const CategoryIcon = getCategoryIcon(despesa.categoria);

                return (
                  <div
                    key={despesa.id}
                    className={cn(
                      "flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between",
                      despesa.vencida && !despesa.paga && "bg-destructive/4",
                    )}
                  >
                    <div className="flex gap-3">
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
                        <strong className="text-lg font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(despesa.valor)}
                        </strong>
                        <p className="text-xs text-muted-foreground">
                          {despesa.paga ? "Quitada" : "Pendente"}
                        </p>
                      </div>

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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
    </div>
  );
}
