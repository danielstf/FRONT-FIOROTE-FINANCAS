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
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
import { cn } from "../../lib/utils";

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

function excelTable(title: string, headers: string[], rows: Array<Array<string | number | boolean | null | undefined>>, amount?: { index: number; color: string }) {
  const head = headers.map((item) => `<th>${excelValue(item)}</th>`).join("");
  const body = rows.map((row) =>
    `<tr>${row.map((cell, index) => {
      const style = index === amount?.index ? `color:${amount.color};font-weight:700;` : "";
      return `<td style="${style}">${excelValue(cell)}</td>`;
    }).join("")}</tr>`,
  ).join("");
  return `<h2>${excelValue(title)}</h2><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function excelChart(rows: MovimentoMensal[]) {
  const max = Math.max(...rows.map((item) => Math.max(item.receitas, item.despesas)), 1);
  const body = rows.map((item) => {
    const receita = "█".repeat(Math.max(1, Math.round((item.receitas / max) * 24)));
    const despesa = "█".repeat(Math.max(1, Math.round((item.despesas / max) * 24)));
    return `<tr><td>${excelValue(formatMonth(item.mes))}</td><td style="color:#2563eb;font-weight:700;">${excelValue(item.receitas)}</td><td style="color:#dc2626;font-weight:700;">${excelValue(item.despesas)}</td><td style="color:#2563eb;font-weight:700;">${receita}</td><td style="color:#dc2626;font-weight:700;">${despesa}</td></tr>`;
  }).join("");
  return `<h2>Gráfico receitas x despesas</h2><table><thead><tr><th>Mês</th><th>Receitas</th><th>Despesas</th><th>Receitas</th><th>Despesas</th></tr></thead><tbody>${body}</tbody></table>`;
}

export function RelatoriosPage() {
  const [ano, setAno] = useState(anoAtual);
  const [viewMode, setViewMode] = useState<ViewMode>("ano");
  const [viewMonth, setViewMonth] = useState(mesAtual);
  const [mesBase, setMesBase] = useState(mesAtual);
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
  const totalReceitas = movimentos.reduce((sum, item) => sum + item.receitas, 0);
  const totalDespesas = movimentos.reduce((sum, item) => sum + item.despesas, 0);
  const saldo = totalReceitas - totalDespesas;
  const maiorDespesa = data?.graficos.barrasMaioresGastos[0] ?? null;
  const chartData = movimentos.map((item) => ({ ...item, label: formatMonth(item.mes, false) }));
  const categoriaData = categorias.map((item) => ({ name: item.categoria, value: item.total }));

  const exportMonths = useMemo(
    () => (exportMode === "ano" ? mesesDoAno(exportYear) : [...selectedMonths].sort()),
    [exportMode, exportYear, selectedMonths],
  );

  // Insights calculados
  const melhorMes = useMemo(() => {
    if (!movimentos.length) return null;
    return movimentos.reduce((best, item) => item.saldoFinal > best.saldoFinal ? item : best, movimentos[0]);
  }, [movimentos]);

  const mesesPositivos = movimentos.filter((m) => m.saldoFinal >= 0).length;
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
      const receitas = receitasPorMes.flatMap((item) => item.receitas);
      const despesas = despesasPorMes.flatMap((item) => item.despesas);
      const label = exportMode === "ano" ? `Ano ${exportYear}` : `${exportMonths.length} meses selecionados`;
      const html = `<html><head><meta charset="UTF-8"/><style>body{font-family:Arial,sans-serif;color:#0f172a;}h1{color:#0f172a;margin-bottom:6px;}p{color:#475569;}h2{margin-top:24px;color:#111827;}table{border-collapse:collapse;margin-bottom:18px;width:100%;}th{background:#e0f2fe;color:#0f172a;text-align:left;}th,td{border:1px solid #cbd5e1;padding:7px 9px;}tr:nth-child(even){background:#f8fafc;}</style></head><body><h1>Relatório Fiorote Controle Financeiro - ${excelValue(label)}</h1><p>Resumo gerado com receitas, despesas, saldo final e lançamentos detalhados.</p>${excelTable("Resumo financeiro",["Mês","Receitas","Despesas","Saldo final"],linhas.map((item)=>[formatMonth(item.mes),item.receitas,item.despesas,item.saldoFinal]))}${excelChart(linhas)}${excelTable("Receitas",["Data","Nome","Valor","Fixa","Parcela"],receitas.map((item)=>[item.data,item.nome,item.valor,item.fixa,item.parcelaAtual&&item.numeroParcelas?`${item.parcelaAtual}/${item.numeroParcelas}`:""]),{index:2,color:"#2563eb"})}${excelTable("Despesas",["Vencimento","Nome","Categoria","Forma","Valor","Paga","Fixa","Parcela"],despesas.map((item)=>[item.dataVencimento,item.nome,item.categoria,item.formaPagamento,item.valor,item.paga,item.fixa,item.parcelaAtual&&item.numeroParcelas?`${item.parcelaAtual}/${item.numeroParcelas}`:""]),{index:4,color:"#dc2626"})}</body></html>`;
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
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Relatórios</h1>
            <p className="text-xs text-muted-foreground">Carregando indicadores...</p>
          </div>
        </div>
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
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Relatórios</h1>
            <p className="text-xs text-muted-foreground">
              {viewMode === "ano" ? `Visão anual de ${ano}` : `Visão de ${formatMonth(viewMonth)}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      {/* ── Metrics ── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Receitas", value: formatCurrency(totalReceitas), icon: ArrowUpRight, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Despesas", value: formatCurrency(totalDespesas), icon: ArrowDownRight, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Saldo", value: formatCurrency(saldo), icon: WalletCards, color: saldo >= 0 ? "text-emerald-500" : "text-red-500", bg: saldo >= 0 ? "bg-emerald-500/10" : "bg-red-500/10" },
          { label: "Maior gasto único", value: maiorDespesa ? formatCurrency(maiorDespesa.valor) : "R$ 0,00", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", bg, color)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className={cn("mt-2 text-xl font-bold", color)}>{value}</p>
          </div>
        ))}
      </div>

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
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <p className="text-sm font-semibold">Resumo {viewMode === "ano" ? "mês a mês" : "do mês"}</p>
        </div>
        <div className="divide-y divide-border/60">
          {movimentos.map((item) => (
            <div key={item.mes} className="grid grid-cols-4 items-center gap-2 px-5 py-3 text-sm">
              <p className="font-medium text-foreground capitalize">{formatMonth(item.mes, false)}</p>
              <p className="text-blue-500">{formatCurrency(item.receitas)}</p>
              <p className="text-red-500">{formatCurrency(item.despesas)}</p>
              <p className={cn("font-semibold", item.saldoFinal >= 0 ? "text-emerald-500" : "text-red-500")}>
                {formatCurrency(item.saldoFinal)}
              </p>
            </div>
          ))}
        </div>
      </div>

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
    </div>
  );
}
