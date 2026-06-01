import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Download,
  FileSpreadsheet,
  Loader2,
  PieChart,
  TrendingUp,
  WalletCards,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  XAxis,
} from "recharts";
import { dashboardApi } from "../../api/dashboard/dashboard-api";
import type { MovimentoMensal } from "../../api/dashboard/types";
import { despesasApi } from "../../api/despesas/despesas-api";
import { getApiErrorMessage } from "../../api/errors";
import { receitasApi } from "../../api/receitas/receitas-api";
import { MonthPicker } from "../../components/month-picker";
import { PageHeader } from "../../components/page-header";
import { StatCard, statsContainerVariant } from "../../components/stat-card";
import { Button } from "../../components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import { formatCurrency } from "../../lib/money";
import { pageVariants, sectionVariants } from "../../lib/motion";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";

type ExportMode = "ano" | "meses";
type ViewMode = "ano" | "mes";

const chartConfig: ChartConfig = {
  receitas: { label: "Receitas", color: "#2563eb" },
  despesas: { label: "Despesas", color: "#dc2626" },
};

const pieColors = ["#dc2626", "#f97316", "#eab308", "#8b5cf6", "#2563eb", "#0f9f6e"];

function mesAtual() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

function anoAtual() { return String(new Date().getFullYear()); }

function mesesDoAno(ano: string) {
  return Array.from({ length: 12 }, (_, index) => `${ano}-${String(index + 1).padStart(2, "0")}`);
}

function formatMonth(value: string, withYear = true) {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: withYear ? "long" : "short",
    year: withYear ? "numeric" : undefined,
  }).format(date).replace(".", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function excelValue(value: string | number | boolean | null | undefined) {
  if (typeof value === "number") return String(value).replace(".", ",");
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function formatDateBR(value: string | null | undefined): string {
  if (!value) return "—";
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
}

function excelSummaryTable(linhas: MovimentoMensal[]) {
  const hasEst = linhas.some((l) => l.projecao);
  const nota = hasEst
    ? `<p style="font-size:12px;color:#92400e;background:#fffbeb;border-left:3px solid #d97706;padding:6px 10px;margin:0 0 10px;">⚠ Linhas marcadas como <strong>Estimativa</strong> são projeções de meses futuros baseadas nos lançamentos fixos cadastrados.</p>`
    : "";
  const head = `<tr><th>Mês</th><th>Tipo</th><th>Receitas (R$)</th><th>Despesas (R$)</th><th>Saldo Final (R$)</th></tr>`;
  const body = linhas.map((item) => {
    const est = item.projecao;
    const rowBg = est ? "background:#fffbeb;" : "";
    const tipoStyle = est ? "color:#d97706;font-weight:700;" : "color:#16a34a;font-weight:700;";
    const saldoColor = item.saldoFinal >= 0 ? "#16a34a" : "#dc2626";
    return `<tr style="${rowBg}">
      <td>${excelValue(formatMonth(item.mes))}</td>
      <td style="${tipoStyle}">${est ? "Estimativa" : "Real"}</td>
      <td style="color:#1d4ed8;font-weight:700;">${excelValue(item.receitas)}</td>
      <td style="color:#dc2626;font-weight:700;">${excelValue(item.despesas)}</td>
      <td style="color:${saldoColor};font-weight:700;">${excelValue(item.saldoFinal)}</td>
    </tr>`;
  }).join("");
  return `<h2>Resumo Financeiro</h2>${nota}<table><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

function excelChart(linhas: MovimentoMensal[]) {
  const max = Math.max(...linhas.map((r) => Math.max(r.receitas, r.despesas)), 1);
  const W = 180;
  const body = linhas.map((item) => {
    const rW = Math.max(2, Math.round((item.receitas / max) * W));
    const dW = Math.max(2, Math.round((item.despesas / max) * W));
    const est = item.projecao;
    const tipoStyle = est ? "color:#d97706;font-weight:700;" : "color:#16a34a;font-weight:700;";
    return `<tr>
      <td>${excelValue(formatMonth(item.mes))}</td>
      <td style="${tipoStyle}">${est ? "Estimativa" : "Real"}</td>
      <td style="color:#1d4ed8;font-weight:700;text-align:right;">${excelValue(item.receitas)}</td>
      <td style="padding:3px 6px;min-width:200px;"><div style="background:#2563eb;height:16px;width:${rW}px;border-radius:2px;"></div></td>
      <td style="color:#dc2626;font-weight:700;text-align:right;">${excelValue(item.despesas)}</td>
      <td style="padding:3px 6px;min-width:200px;"><div style="background:#dc2626;height:16px;width:${dW}px;border-radius:2px;"></div></td>
    </tr>`;
  }).join("");
  const legend = `<p style="font-size:12px;margin:0 0 8px;"><span style="color:#1d4ed8;font-weight:700;">■ Receitas (azul)</span>&nbsp;&nbsp;<span style="color:#dc2626;font-weight:700;">■ Despesas (vermelho)</span>&nbsp;&nbsp;<span style="color:#16a34a;font-weight:700;">● Real</span>&nbsp;<span style="color:#d97706;font-weight:700;">● Estimativa</span></p>`;
  return `<h2>Gráfico Receitas × Despesas</h2>${legend}<table><thead><tr><th>Mês</th><th>Tipo</th><th style="color:#1d4ed8;">Receitas (R$)</th><th style="color:#1d4ed8;">Barra</th><th style="color:#dc2626;">Despesas (R$)</th><th style="color:#dc2626;">Barra</th></tr></thead><tbody>${body}</tbody></table>`;
}

type ReceitaExcel = { data?: string | null; nome: string; valor: number; fixa: boolean; parcelaAtual?: number | null; numeroParcelas?: number | null };
type DespesaExcel = { dataVencimento?: string | null; nome: string; categoria?: string | null; formaPagamento?: string | null; valor: number; paga: boolean; fixa: boolean; parcelaAtual?: number | null; numeroParcelas?: number | null };

function excelReceitasPorMes(grupos: Array<{ mes: string; receitas: ReceitaExcel[] }>) {
  let body = "";
  for (const { mes, receitas } of grupos) {
    const total = receitas.reduce((s, r) => s + r.valor, 0);
    body += `<tr style="background:#1e40af;"><td colspan="5" style="font-weight:700;color:#fff;padding:7px 10px;font-size:13px;">${excelValue(formatMonth(mes))} — ${receitas.length} lançamento(s)</td></tr>`;
    if (receitas.length === 0) {
      body += `<tr><td colspan="5" style="color:#94a3b8;font-style:italic;">Nenhuma receita neste mês.</td></tr>`;
    } else {
      for (const r of receitas) {
        body += `<tr>
          <td>${formatDateBR(r.data)}</td>
          <td>${excelValue(r.nome)}</td>
          <td style="color:#1d4ed8;font-weight:700;">${excelValue(r.valor)}</td>
          <td>${r.fixa ? "Sim" : "Não"}</td>
          <td>${r.parcelaAtual && r.numeroParcelas ? `${r.parcelaAtual}/${r.numeroParcelas}` : "—"}</td>
        </tr>`;
      }
      body += `<tr style="background:#dbeafe;"><td colspan="2" style="font-weight:700;text-align:right;color:#1e40af;">Total ${excelValue(formatMonth(mes, false))}:</td><td style="color:#1d4ed8;font-weight:700;" colspan="3">${excelValue(total)}</td></tr>`;
    }
  }
  return `<h2>Receitas por Mês</h2><table><thead><tr><th>Data</th><th>Nome</th><th>Valor</th><th>Fixa</th><th>Parcela</th></tr></thead><tbody>${body}</tbody></table>`;
}

function excelDespesasPorMes(grupos: Array<{ mes: string; despesas: DespesaExcel[] }>) {
  let body = "";
  for (const { mes, despesas } of grupos) {
    const total = despesas.reduce((s, d) => s + d.valor, 0);
    body += `<tr style="background:#991b1b;"><td colspan="8" style="font-weight:700;color:#fff;padding:7px 10px;font-size:13px;">${excelValue(formatMonth(mes))} — ${despesas.length} lançamento(s)</td></tr>`;
    if (despesas.length === 0) {
      body += `<tr><td colspan="8" style="color:#94a3b8;font-style:italic;">Nenhuma despesa neste mês.</td></tr>`;
    } else {
      for (const d of despesas) {
        body += `<tr>
          <td>${formatDateBR(d.dataVencimento)}</td>
          <td>${excelValue(d.nome)}</td>
          <td>${excelValue(d.categoria)}</td>
          <td>${excelValue(d.formaPagamento)}</td>
          <td style="color:#dc2626;font-weight:700;">${excelValue(d.valor)}</td>
          <td>${d.paga ? "Sim" : "Não"}</td>
          <td>${d.fixa ? "Sim" : "Não"}</td>
          <td>${d.parcelaAtual && d.numeroParcelas ? `${d.parcelaAtual}/${d.numeroParcelas}` : "—"}</td>
        </tr>`;
      }
      body += `<tr style="background:#fee2e2;"><td colspan="4" style="font-weight:700;text-align:right;color:#991b1b;">Total ${excelValue(formatMonth(mes, false))}:</td><td style="color:#dc2626;font-weight:700;" colspan="4">${excelValue(total)}</td></tr>`;
    }
  }
  return `<h2>Despesas por Mês</h2><table><thead><tr><th>Vencimento</th><th>Nome</th><th>Categoria</th><th>Forma</th><th>Valor</th><th>Paga</th><th>Fixa</th><th>Parcela</th></tr></thead><tbody>${body}</tbody></table>`;
}

export function RelatoriosPage() {
  const [ano, setAno] = useState(anoAtual);
  const [viewMode, setViewMode] = useState<ViewMode>("ano");
  const [viewMonth, setViewMonth] = useState(mesAtual);
  const [data, setData] = useState<Awaited<ReturnType<typeof dashboardApi.resumoFinanceiro>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportMode, setExportMode] = useState<ExportMode>("ano");
  const [exportYear, setExportYear] = useState(anoAtual);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([mesAtual()]);

  async function carregarResumo(nextMes = `${ano}-12`, meses = 12) {
    try {
      setLoading(true);
      setError(null);
      const resumo = await dashboardApi.resumoFinanceiro({ mes: nextMes, meses, relatorio: true });
      setData(resumo);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void carregarResumo(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const movimentos = data?.graficos.linhaEvolucaoFinanceira ?? [];
  const categorias = data?.graficos.pizzaDespesasPorCategoria ?? [];
  // Separa meses com dados reais dos meses futuros (estimativa).
  const movimentosReais = movimentos.filter((m) => !m.projecao);
  const totalReceitas = movimentosReais.reduce((sum, item) => sum + item.receitas, 0);
  const totalDespesas = movimentosReais.reduce((sum, item) => sum + item.despesas, 0);
  const saldo = totalReceitas - totalDespesas;
  const totalReceitasPrevistas = movimentos.reduce((sum, item) => sum + item.receitas, 0);
  const totalDespesasPrevistas = movimentos.reduce((sum, item) => sum + item.despesas, 0);
  const saldoPrevisto = totalReceitasPrevistas - totalDespesasPrevistas;
  const temProjecao = movimentos.some((m) => m.projecao);
  const maiorDespesa = data?.graficos.barrasMaioresGastos[0] ?? null;
  const chartData = movimentos.map((item) => ({ ...item, label: formatMonth(item.mes, false) }));
  const categoriaData = categorias.map((item) => ({ name: item.categoria, value: item.total }));

  const exportMonths = useMemo(
    () => (exportMode === "ano" ? mesesDoAno(exportYear) : [...selectedMonths].sort()),
    [exportMode, exportYear, selectedMonths],
  );

  // Insights calculados apenas sobre meses com dados reais (sem projecao).
  const melhorMes = useMemo(() => {
    if (!movimentosReais.length) return null;
    return movimentosReais.reduce((best, item) => item.saldoFinal > best.saldoFinal ? item : best, movimentosReais[0]);
  }, [movimentosReais]);

  const mesesPositivos = movimentosReais.filter((m) => m.saldoFinal >= 0).length;
  const taxaEconomia = totalReceitas > 0 ? ((saldo / totalReceitas) * 100) : 0;
  const maiorCategoria = categoriaData.length > 0
    ? categoriaData.reduce((a, b) => b.value > a.value ? b : a, categoriaData[0])
    : null;

  function alternarVisualizacao(mode: ViewMode) {
    setViewMode(mode);
    void carregarResumo(mode === "ano" ? `${ano}-12` : viewMonth, mode === "ano" ? 12 : 1);
  }

  function toggleMonth(month: string) {
    const next = selectedMonths.includes(month)
      ? selectedMonths.filter((item) => item !== month)
      : [...selectedMonths, month].sort();
    setSelectedMonths(next.length ? next : [month]);
  }

  async function exportarExcel() {
    try {
      setExporting(true);
      setError(null);
      const [resumos, receitasPorMes, despesasPorMes] = await Promise.all([
        Promise.all(exportMonths.map((mes) => dashboardApi.resumoFinanceiro({ mes, meses: 1, relatorio: true }))),
        Promise.all(exportMonths.map((mes) => receitasApi.listar({ mes, relatorio: true }))),
        Promise.all(exportMonths.map((mes) => despesasApi.listar({ mes, relatorio: true }))),
      ]);
      const linhas = resumos.flatMap((item) => item.graficos.linhaEvolucaoFinanceira);
      const receitasGrupos = exportMonths.map((mes, i) => ({ mes, receitas: receitasPorMes[i].receitas }));
      const despesasGrupos = exportMonths.map((mes, i) => ({ mes, despesas: despesasPorMes[i].despesas }));
      const label = exportMode === "ano" ? `Ano ${exportYear}` : `${exportMonths.length} meses selecionados`;
      const css = `body{font-family:Calibri,Arial,sans-serif;color:#0f172a;font-size:13px;}h1{color:#1e3a5f;font-size:20px;margin-bottom:4px;}h2{margin-top:28px;margin-bottom:8px;color:#1e293b;font-size:14px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;}p.sub{color:#64748b;font-size:12px;margin:0 0 6px;}table{border-collapse:collapse;margin-bottom:10px;width:100%;}th{background:#1e40af;color:#fff;text-align:left;font-size:12px;padding:8px 10px;border:1px solid #1e3a8a;}td{border:1px solid #e2e8f0;padding:6px 10px;font-size:12px;vertical-align:middle;}tr:nth-child(even) td{background:#f8fafc;}`;
      const html = `<html><head><meta charset="UTF-8"/><style>${css}</style></head><body><h1>Relatório Fiorote Controle Financeiro</h1><p class="sub">Período: ${excelValue(label)} · Gerado em ${formatDateBR(new Date().toISOString())}</p>${excelSummaryTable(linhas)}${excelChart(linhas)}${excelReceitasPorMes(receitasGrupos)}${excelDespesasPorMes(despesasGrupos)}</body></html>`;
      const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `fiorote-${label.toLowerCase().replaceAll(" ", "-")}.xls`;
      link.click();
      URL.revokeObjectURL(link.href);
      setExportOpen(false);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <PageHeader icon={BarChart3} title="Relatórios" subtitle="Carregando indicadores..." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-muted" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-16 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Relatórios indisponíveis</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

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
          icon={BarChart3}
          title="Relatórios"
          subtitle={viewMode === "ano" ? `Visão anual de ${ano}` : `Visão de ${formatMonth(viewMonth)}`}
          right={<>
            <div className="flex overflow-hidden rounded-lg border border-border bg-background text-sm">
              {(["ano", "mes"] as const).map((mode) => (
                <button
                  key={mode}
                  className={cn(
                    "px-4 py-2 font-semibold text-muted-foreground transition-colors hover:bg-accent capitalize",
                    viewMode === mode && "bg-primary text-primary-foreground hover:bg-primary",
                  )}
                  type="button"
                  onClick={() => alternarVisualizacao(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>

            {viewMode === "ano" ? (
              <Select
                className="h-10 w-24 text-sm"
                value={ano}
                onChange={(e) => { const y = e.target.value; setAno(y); void carregarResumo(`${y}-12`, 12); }}
              >
                {Array.from({ length: 7 }, (_, i) => String(new Date().getFullYear() - 3 + i)).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            ) : (
              <div className="w-44">
                <MonthPicker
                  value={viewMonth}
                  onChange={(m) => { setViewMonth(m); setAno(m.slice(0, 4)); void carregarResumo(m, 1); }}
                />
              </div>
            )}

            <Button onClick={() => setExportOpen(true)} className="h-10 gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </Button>
          </>}
        />
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}

      {/* ── Metrics ── */}
      <motion.div variants={statsContainerVariant} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Receitas reais", value: formatCurrency(totalReceitas), icon: ArrowUpRight, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Despesas reais", value: formatCurrency(totalDespesas), icon: ArrowDownRight, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Saldo real", value: formatCurrency(saldo), icon: WalletCards, color: saldo >= 0 ? "text-emerald-500" : "text-red-500", bg: saldo >= 0 ? "bg-emerald-500/10" : "bg-red-500/10" },
          { label: "Maior gasto único", value: maiorDespesa ? formatCurrency(maiorDespesa.valor) : "R$ 0,00", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            icon={Icon}
            iconClassName={cn("h-7 w-7", bg, color)}
            valueClassName={cn("text-xl", color)}
          />
        ))}
      </motion.div>

      {/* ── Previsão (apenas quando há meses futuros no período) ── */}
      {temProjecao && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Projeção financeira
            </span>
            <p className="text-xs text-muted-foreground">
              Estimativa considerando todos os lançamentos agendados
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Receitas previstas</p>
              <p className="mt-0.5 text-lg font-bold text-blue-500">{formatCurrency(totalReceitasPrevistas)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Despesas previstas</p>
              <p className="mt-0.5 text-lg font-bold text-red-500">{formatCurrency(totalDespesasPrevistas)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo previsto</p>
              <p className={cn("mt-0.5 text-lg font-bold", saldoPrevisto >= 0 ? "text-emerald-500" : "text-red-500")}>
                {formatCurrency(saldoPrevisto)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Insights ── */}
      {movimentos.length > 1 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-semibold">Insights do período</p>
          </div>
          <div className="grid gap-0 divide-y divide-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-muted-foreground">Taxa de economia</p>
              <p className={cn("mt-1.5 text-2xl font-bold", taxaEconomia >= 0 ? "text-emerald-500" : "text-red-500")}>
                {taxaEconomia.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {taxaEconomia >= 20
                  ? "Excelente controle financeiro!"
                  : taxaEconomia >= 0
                    ? "Atenção: economia baixa."
                    : "Despesas acima das receitas."}
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-muted-foreground">Meses positivos</p>
              <p className="mt-1.5 text-2xl font-bold text-foreground">{mesesPositivos}/{movimentos.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {mesesPositivos === movimentos.length
                  ? "Todos os meses no positivo!"
                  : `${movimentos.length - mesesPositivos} meses negativos no período.`}
              </p>
            </div>
            {melhorMes && (
              <div className="px-5 py-4">
                <p className="text-xs font-medium text-muted-foreground">Melhor mês</p>
                <p className="mt-1.5 text-xl font-bold text-emerald-500 capitalize">
                  {formatMonth(melhorMes.mes, false)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Saldo de {formatCurrency(melhorMes.saldoFinal)}
                </p>
              </div>
            )}
            {maiorCategoria && (
              <div className="px-5 py-4">
                <p className="text-xs font-medium text-muted-foreground">Maior categoria</p>
                <p className="mt-1.5 text-xl font-bold text-red-500">{maiorCategoria.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(maiorCategoria.value)} no período
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Receitas x Despesas</p>
              <p className="text-xs text-muted-foreground">
                {viewMode === "ano" ? "Comparativo mensal" : "Visão do mês"}
              </p>
            </div>
          </div>
          <div className="p-5">
            <ChartContainer className="h-72 w-full" config={chartConfig}>
              <BarChart accessibilityLayer data={chartData} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis axisLine={false} dataKey="label" tickLine={false} tickMargin={10} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                      nameFormatter={(name) => chartConfig[name]?.label ?? name}
                    />
                  }
                />
                <Bar dataKey="receitas" fill="var(--color-receitas)" radius={4} />
                <Bar dataKey="despesas" fill="var(--color-despesas)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PieChart className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Despesas por categoria</p>
              <p className="text-xs text-muted-foreground">Distribuição do período</p>
            </div>
          </div>
          <div className="p-5">
            <ChartContainer className="h-44 w-full" config={{ total: { label: "Total" } }}>
              <RechartsPieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                      nameFormatter={(name) => name}
                    />
                  }
                />
                <Pie data={categoriaData} dataKey="value" innerRadius={46} nameKey="name" outerRadius={78} paddingAngle={3}>
                  {categoriaData.map((item, index) => (
                    <Cell fill={pieColors[index % pieColors.length]} key={item.name} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ChartContainer>
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {categoriaData.map((item, index) => {
                const totalCat = categoriaData.reduce((s, c) => s + c.value, 0);
                const pct = totalCat ? Math.round((item.value / totalCat) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 px-2.5 py-1.5 text-xs">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                      <span className="truncate font-medium">{item.name}</span>
                    </span>
                    <span className="shrink-0 text-muted-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Resumo mês a mês ── */}
      <motion.div variants={sectionVariants} className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <p className="text-sm font-semibold">Resumo {viewMode === "ano" ? "mês a mês" : "do mês"}</p>
        </div>
        {/* Cabeçalho da tabela */}
        <div className="grid grid-cols-4 items-center gap-2 border-b border-border/60 bg-muted/30 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Mês</span>
          <span>Receitas</span>
          <span>Despesas</span>
          <span>Saldo</span>
        </div>
        <div className="divide-y divide-border/60">
          {movimentos.map((item) => (
            <div
              key={item.mes}
              className={cn(
                "grid grid-cols-4 items-center gap-2 px-5 py-3 text-sm transition-colors hover:bg-muted/20",
                item.projecao && "opacity-60",
              )}
            >
              <p className="flex items-center gap-1.5 font-medium text-foreground capitalize">
                {formatMonth(item.mes, false)}
                {item.projecao && (
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                    Est.
                  </span>
                )}
              </p>
              <p className="text-blue-500">{formatCurrency(item.receitas)}</p>
              <p className="text-red-500">{formatCurrency(item.despesas)}</p>
              <p className={cn("font-semibold", item.saldoFinal >= 0 ? "text-emerald-500" : "text-red-500")}>
                {formatCurrency(item.saldoFinal)}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Export dialog ── */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>

        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Exportar relatório Excel</DialogTitle>
            <DialogDescription>Escolha o período para exportar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex overflow-hidden rounded-lg border border-border bg-background text-sm">
              {[{ value: "ano", label: "Ano inteiro" }, { value: "meses", label: "Meses selecionados" }].map((item) => (
                <button
                  key={item.value}
                  className={cn("flex-1 px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-accent", exportMode === item.value && "bg-primary text-primary-foreground hover:bg-primary")}
                  type="button"
                  onClick={() => setExportMode(item.value as ExportMode)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Ano</Label>
              <Select value={exportYear} onChange={(e) => { const y = e.target.value; setExportYear(y); setSelectedMonths((ms) => ms.map((m) => `${y}-${m.slice(5, 7)}`)); }}>
                {Array.from({ length: 7 }, (_, i) => String(new Date().getFullYear() - 3 + i)).map((y) => <option key={y} value={y}>{y}</option>)}
              </Select>
            </div>
            {exportMode === "meses" && (
              <div className="grid grid-cols-3 gap-2">
                {mesesDoAno(exportYear).map((month) => (
                  <button
                    key={month}
                    className={cn("rounded-lg border border-border bg-background px-2 py-2 text-sm font-medium capitalize transition-colors hover:bg-accent", selectedMonths.includes(month) && "border-primary bg-primary text-primary-foreground hover:bg-primary")}
                    type="button"
                    onClick={() => toggleMonth(month)}
                  >
                    {formatMonth(month, false)}
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setExportOpen(false)}>Cancelar</Button>
              <Button disabled={exporting} onClick={exportarExcel}>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Gerar Excel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
