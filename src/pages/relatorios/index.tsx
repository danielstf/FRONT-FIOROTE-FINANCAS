import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  Download,
  FileSpreadsheet,
  Loader2,
  PieChart,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
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
  saldoFinal: { label: "Saldo", color: "#0f9f6e" },
};

const pieColors = ["#dc2626", "#f97316", "#eab308", "#8b5cf6", "#2563eb", "#0f9f6e"];

function mesAtual() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

function anoAtual() {
  return String(new Date().getFullYear());
}

function mesesDoAno(ano: string) {
  return Array.from({ length: 12 }, (_, index) => {
    return `${ano}-${String(index + 1).padStart(2, "0")}`;
  });
}

function formatMonth(value: string, withYear = true) {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: withYear ? "long" : "short",
    year: withYear ? "numeric" : undefined,
  })
    .format(date)
    .replace(".", "");

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function excelValue(value: string | number | boolean | null | undefined) {
  if (typeof value === "number") return String(value).replace(".", ",");
  if (typeof value === "boolean") return value ? "Sim" : "Não";

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function excelTable(
  title: string,
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>,
  amount?: { index: number; color: string },
) {
  const head = headers.map((item) => `<th>${excelValue(item)}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell, index) => {
            const style = index === amount?.index ? `color:${amount.color};font-weight:700;` : "";
            return `<td style="${style}">${excelValue(cell)}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("");

  return `<h2>${excelValue(title)}</h2><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function excelChart(rows: MovimentoMensal[]) {
  const max = Math.max(...rows.map((item) => Math.max(item.receitas, item.despesas)), 1);
  const body = rows
    .map((item) => {
      const receita = "█".repeat(Math.max(1, Math.round((item.receitas / max) * 24)));
      const despesa = "█".repeat(Math.max(1, Math.round((item.despesas / max) * 24)));

      return `<tr>
        <td>${excelValue(formatMonth(item.mes))}</td>
        <td style="color:#2563eb;font-weight:700;">${excelValue(item.receitas)}</td>
        <td style="color:#dc2626;font-weight:700;">${excelValue(item.despesas)}</td>
        <td style="color:#2563eb;font-weight:700;">${receita}</td>
        <td style="color:#dc2626;font-weight:700;">${despesa}</td>
      </tr>`;
    })
    .join("");

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
      const resumo = await dashboardApi.resumoFinanceiro({ mes: nextMes, meses });
      setData(resumo);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void carregarResumo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const movimentos = data?.graficos.linhaEvolucaoFinanceira ?? [];
  const categorias = data?.graficos.pizzaDespesasPorCategoria ?? [];
  const totalReceitas = movimentos.reduce((sum, item) => sum + item.receitas, 0);
  const totalDespesas = movimentos.reduce((sum, item) => sum + item.despesas, 0);
  const saldo = totalReceitas - totalDespesas;
  const maiorDespesa = data?.graficos.barrasMaioresGastos[0] ?? null;
  const chartData = movimentos.map((item) => ({
    ...item,
    label: formatMonth(item.mes, false),
  }));
  const categoriaData = categorias.map((item) => ({
    name: item.categoria,
    value: item.total,
  }));
  const exportMonths = useMemo(
    () => (exportMode === "ano" ? mesesDoAno(exportYear) : [...selectedMonths].sort()),
    [exportMode, exportYear, selectedMonths],
  );

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
        Promise.all(exportMonths.map((mes) => dashboardApi.resumoFinanceiro({ mes, meses: 1 }))),
        Promise.all(exportMonths.map((mes) => receitasApi.listar({ mes }))),
        Promise.all(exportMonths.map((mes) => despesasApi.listar({ mes }))),
      ]);
      const linhas = resumos.flatMap((item) => item.graficos.linhaEvolucaoFinanceira);
      const receitas = receitasPorMes.flatMap((item) => item.receitas);
      const despesas = despesasPorMes.flatMap((item) => item.despesas);
      const label =
        exportMode === "ano" ? `Ano ${exportYear}` : `${exportMonths.length} meses selecionados`;
      const html = `
        <html>
          <head>
            <meta charset="UTF-8" />
            <style>
              body { font-family: Arial, sans-serif; color: #0f172a; }
              h1 { color: #0f172a; }
              h2 { margin-top: 24px; }
              table { border-collapse: collapse; margin-bottom: 18px; }
              th { background: #f1f5f9; }
              th, td { border: 1px solid #cbd5e1; padding: 6px 8px; }
            </style>
          </head>
          <body>
            <h1>Relatório Fiorote Control - ${excelValue(label)}</h1>
            ${excelTable("Resumo", ["Mês", "Receitas", "Despesas", "Saldo final"], linhas.map((item) => [formatMonth(item.mes), item.receitas, item.despesas, item.saldoFinal]))}
            ${excelChart(linhas)}
            ${excelTable("Receitas", ["Data", "Nome", "Valor", "Fixa", "Parcela"], receitas.map((item) => [item.data, item.nome, item.valor, item.fixa, item.parcelaAtual && item.numeroParcelas ? `${item.parcelaAtual}/${item.numeroParcelas}` : ""]), { index: 2, color: "#2563eb" })}
            ${excelTable("Despesas", ["Vencimento", "Nome", "Categoria", "Forma", "Valor", "Paga", "Fixa", "Parcela"], despesas.map((item) => [item.dataVencimento, item.nome, item.categoria, item.formaPagamento, item.valor, item.paga, item.fixa, item.parcelaAtual && item.numeroParcelas ? `${item.parcelaAtual}/${item.numeroParcelas}` : ""]), { index: 4, color: "#dc2626" })}
          </body>
        </html>
      `;
      const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);
      link.download = `relatorio-fiorote-${label.toLowerCase().replaceAll(" ", "-")}.xls`;
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
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Carregando indicadores financeiros.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="h-36 animate-pulse rounded-lg border border-border bg-muted" key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Relatórios indisponíveis
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            {viewMode === "ano"
              ? `Visão anual de ${ano} com gráficos, categorias e exportação Excel.`
              : `Visão mensal de ${formatMonth(viewMonth)} com categorias e indicadores do mês.`}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-background text-sm">
            <button
              className={cn(
                "px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-accent",
                viewMode === "ano" && "bg-primary text-primary-foreground hover:bg-primary",
              )}
              type="button"
              onClick={() => alternarVisualizacao("ano")}
            >
              Ano
            </button>
            <button
              className={cn(
                "px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-accent",
                viewMode === "mes" && "bg-primary text-primary-foreground hover:bg-primary",
              )}
              type="button"
              onClick={() => alternarVisualizacao("mes")}
            >
              Mês
            </button>
          </div>

          {viewMode === "ano" ? (
            <Select
              className="sm:w-32"
              value={ano}
              onChange={(event) => {
                const nextYear = event.target.value;
                setAno(nextYear);
                void carregarResumo(`${nextYear}-12`, 12);
              }}
            >
              {Array.from({ length: 7 }, (_, index) => String(new Date().getFullYear() - 3 + index)).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          ) : (
            <MonthPicker
              className="sm:w-64"
              value={viewMonth}
              onChange={(month) => {
                setViewMonth(month);
                setAno(month.slice(0, 4));
                void carregarResumo(month, 1);
              }}
            />
          )}

          <Button type="button" onClick={() => setExportOpen(true)}>
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Receitas" value={formatCurrency(totalReceitas)} icon={ArrowUpRight} color="text-blue-600" />
        <Metric title="Despesas" value={formatCurrency(totalDespesas)} icon={ArrowDownRight} color="text-red-600" />
        <Metric title="Saldo" value={formatCurrency(saldo)} icon={WalletCards} color={saldo >= 0 ? "text-emerald-600" : "text-red-600"} />
        <Metric title="Maior gasto" value={maiorDespesa ? formatCurrency(maiorDespesa.valor) : "R$ 0,00"} icon={TrendingUp} color="text-amber-600" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5 text-primary" />
              Receitas x despesas
            </CardTitle>
            <CardDescription>
              {viewMode === "ano"
                ? "Comparativo mensal com barras no padrão dos charts do sistema."
                : "Comparativo do mês selecionado."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-80 w-full" config={chartConfig}>
              <BarChart accessibilityLayer data={chartData} margin={{ left: 0, right: 12, top: 12 }}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PieChart className="h-5 w-5 text-primary" />
              Despesas por categoria
            </CardTitle>
            <CardDescription>
              Distribuição das categorias no {viewMode === "ano" ? "ano selecionado" : "mês selecionado"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-80 w-full" config={{ total: { label: "Total" } }}>
              <RechartsPieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                      nameFormatter={(name) => name}
                    />
                  }
                />
                <Pie data={categoriaData} dataKey="value" innerRadius={58} nameKey="name" outerRadius={98} paddingAngle={3}>
                  {categoriaData.map((item, index) => (
                    <Cell fill={pieColors[index % pieColors.length]} key={item.name} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução do saldo
          </CardTitle>
          <CardDescription>
            {viewMode === "ano" ? "Área com saldo final mês a mês." : "Saldo final do mês selecionado."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-72 w-full" config={chartConfig}>
            <AreaChart accessibilityLayer data={chartData} margin={{ left: 0, right: 12, top: 12 }}>
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
              <Area dataKey="saldoFinal" fill="var(--color-saldoFinal)" fillOpacity={0.18} stroke="var(--color-saldoFinal)" strokeWidth={2} type="monotone" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarRange className="h-5 w-5 text-primary" />
            Resumo {viewMode === "ano" ? "mês a mês" : "do mês"}
          </CardTitle>
          <CardDescription>Receitas, despesas e saldo final por competência.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {movimentos.map((item) => (
            <div className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-4" key={item.mes}>
              <p className="font-semibold">{formatMonth(item.mes)}</p>
              <p className="text-sm text-blue-600">{formatCurrency(item.receitas)}</p>
              <p className="text-sm text-red-600">{formatCurrency(item.despesas)}</p>
              <p className={cn("text-sm font-semibold", item.saldoFinal >= 0 ? "text-emerald-600" : "text-red-600")}>
                {formatCurrency(item.saldoFinal)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Exportar relatório Excel</DialogTitle>
            <DialogDescription>
              Escolha se deseja exportar o ano inteiro ou somente meses selecionados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-background text-sm">
              {[
                { value: "ano", label: "Ano inteiro" },
                { value: "meses", label: "Meses selecionados" },
              ].map((item) => (
                <button
                  className={cn(
                    "px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-accent",
                    exportMode === item.value && "bg-primary text-primary-foreground hover:bg-primary",
                  )}
                  key={item.value}
                  type="button"
                  onClick={() => setExportMode(item.value as ExportMode)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Ano</Label>
              <Select
                value={exportYear}
                onChange={(event) => {
                  const nextYear = event.target.value;
                  setExportYear(nextYear);
                  setSelectedMonths((months) => months.map((month) => `${nextYear}-${month.slice(5, 7)}`));
                }}
              >
                {Array.from({ length: 7 }, (_, index) => String(new Date().getFullYear() - 3 + index)).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </div>

            {exportMode === "meses" && (
              <>
                <div className="space-y-2">
                  <Label>Adicionar mês rápido</Label>
                  <MonthPicker value={mesBase} onChange={setMesBase} />
                  <Button
                    className="w-full"
                    type="button"
                    variant="outline"
                    onClick={() => toggleMonth(mesBase)}
                  >
                    Alternar mês selecionado
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {mesesDoAno(exportYear).map((month) => (
                    <button
                      className={cn(
                        "rounded-md border border-border bg-background px-2 py-2 text-sm font-semibold capitalize transition-colors hover:bg-accent",
                        selectedMonths.includes(month) && "border-primary bg-primary text-primary-foreground hover:bg-primary",
                      )}
                      key={month}
                      type="button"
                      onClick={() => toggleMonth(month)}
                    >
                      {formatMonth(month, false)}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setExportOpen(false)}>
                Cancelar
              </Button>
              <Button disabled={exporting} type="button" onClick={exportarExcel}>
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

function Metric({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: typeof ArrowUpRight;
  color: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className={cn("flex items-center gap-2 break-words text-2xl", color)}>
          <Icon className="h-5 w-5" />
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
