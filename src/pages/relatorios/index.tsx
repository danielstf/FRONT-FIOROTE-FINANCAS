import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PieChart,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import { dashboardApi } from "../../api/dashboard/dashboard-api";
import type { CategoriaDespesaResumo, MovimentoMensal } from "../../api/dashboard/types";
import { getApiErrorMessage } from "../../api/errors";
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
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils";

const chartColors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#a855f7",
];

const financialChartConfig: ChartConfig = {
  receitas: {
    label: "Receitas",
    color: "#2563eb",
  },
  despesas: {
    label: "Despesas",
    color: "#dc2626",
  },
};

type AreaMode = "todos" | "receitas" | "despesas";
type ReportMode = "anual" | "mensal";

function getCurrentYear() {
  return String(new Date().getFullYear());
}

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatMonth(value: string) {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
  })
    .format(date)
    .replace(".", "");
}

function buildPieGradient(items: CategoriaDespesaResumo[]) {
  const total = items.reduce((sum, item) => sum + item.total, 0);
  let cursor = 0;

  if (total <= 0) {
    return "conic-gradient(hsl(var(--muted)) 0deg 360deg)";
  }

  const slices = items.map((item, index) => {
    const start = cursor;
    const end = cursor + (item.total / total) * 360;
    cursor = end;

    return `${chartColors[index % chartColors.length]} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${slices.join(", ")})`;
}

export function RelatoriosPage() {
  const [ano, setAno] = useState(getCurrentYear);
  const [mes, setMes] = useState(getCurrentMonth);
  const [reportMode, setReportMode] = useState<ReportMode>("anual");
  const [areaMode, setAreaMode] = useState<AreaMode>("todos");
  const [movimentos, setMovimentos] = useState<MovimentoMensal[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDespesaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalReceitas = useMemo(
    () => movimentos.reduce((total, item) => total + item.receitas, 0),
    [movimentos],
  );
  const totalDespesas = useMemo(
    () => movimentos.reduce((total, item) => total + item.despesas, 0),
    [movimentos],
  );
  const saldoPeriodo = totalReceitas - totalDespesas;
  const maiorValorGrafico = Math.max(
    ...movimentos.map((item) => Math.max(item.receitas, item.despesas)),
    1,
  );
  const totalCategorias = categorias.reduce((total, item) => total + item.total, 0);
  const pieGradient = buildPieGradient(categorias);
  const areaChartData = movimentos.map((item) => ({
    mes: formatMonth(item.mes),
    receitas: item.receitas,
    despesas: item.despesas,
  }));

  async function carregarRelatorio(params?: { modo?: ReportMode; ano?: string; mes?: string }) {
    const modoSelecionado = params?.modo ?? reportMode;
    const anoSelecionado = params?.ano ?? ano;
    const mesSelecionado = params?.mes ?? mes;

    setError("");
    setLoading(true);

    try {
      const data = await dashboardApi.resumoFinanceiro({
        mes: modoSelecionado === "anual" ? `${anoSelecionado}-12` : mesSelecionado,
        meses: modoSelecionado === "anual" ? 12 : 1,
      });

      setMovimentos(data.graficos.linhaEvolucaoFinanceira);
      setCategorias(data.graficos.pizzaDespesasPorCategoria);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void carregarRelatorio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeYear(offset: number) {
    const nextYear = String(Number(ano) + offset);
    setAno(nextYear);
    void carregarRelatorio({ modo: reportMode, ano: nextYear, mes });
  }

  function changeMode(mode: ReportMode) {
    setReportMode(mode);
    void carregarRelatorio({ modo: mode, ano, mes });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm lg:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BarChart3 className="h-5 w-5" />
              </span>
              <h1 className="text-3xl font-semibold tracking-normal text-card-foreground">
                Relatórios
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Analise receitas, despesas, saldo e categorias por mês ou ano.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-background text-sm">
              {[
                { value: "anual", label: "Anual" },
                { value: "mensal", label: "Mensal" },
              ].map((item) => (
                <button
                  key={item.value}
                  className={cn(
                    "px-4 py-2 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                    reportMode === item.value &&
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  )}
                  type="button"
                  onClick={() => changeMode(item.value as ReportMode)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {reportMode === "anual" ? (
              <div className="space-y-2">
                <Label className="justify-center lg:justify-end">Ano</Label>
                <div className="grid h-11 w-56 grid-cols-[44px_1fr_44px] items-center overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                  <Button
                    aria-label="Ano anterior"
                    className="h-11 rounded-none border-0 px-0"
                    type="button"
                    variant="ghost"
                    onClick={() => changeYear(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="border-x border-border text-center text-sm font-semibold">
                    {ano}
                  </div>
                  <Button
                    aria-label="Proximo ano"
                    className="h-11 rounded-none border-0 px-0"
                    type="button"
                    variant="ghost"
                    onClick={() => changeYear(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="justify-center lg:justify-end">Mês</Label>
                <MonthPicker
                  value={mes}
                  onChange={(nextMonth) => {
                    setMes(nextMonth);
                    void carregarRelatorio({ modo: reportMode, ano, mes: nextMonth });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>
                Receitas {reportMode === "anual" ? "no ano" : "no mês"}
              </CardDescription>
              <CardTitle className="text-blue-600 dark:text-blue-400">
                {formatCurrency(totalReceitas)}
              </CardTitle>
            </div>
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>
                Despesas {reportMode === "anual" ? "no ano" : "no mês"}
              </CardDescription>
              <CardTitle className="text-red-600 dark:text-red-400">
                {formatCurrency(totalDespesas)}
              </CardTitle>
            </div>
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>
                Saldo {reportMode === "anual" ? "anual" : "mensal"}
              </CardDescription>
              <CardTitle
                className={cn(
                  saldoPeriodo >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {formatCurrency(saldoPeriodo)}
              </CardTitle>
            </div>
            <WalletCards className="h-5 w-5 text-primary" />
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Receitas x despesas</CardTitle>
            <CardDescription>
              Área interativa com receitas e despesas do período selecionado.
            </CardDescription>
          </div>
          <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-border bg-background text-sm">
            {[
              { value: "todos", label: "Todos" },
              { value: "receitas", label: "Receitas" },
              { value: "despesas", label: "Despesas" },
            ].map((item) => (
              <button
                key={item.value}
                className={cn(
                  "px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  areaMode === item.value &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
                type="button"
                onClick={() => setAreaMode(item.value as AreaMode)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-80 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando gráfico...
            </div>
          ) : (
            <ChartContainer className="h-80 w-full" config={financialChartConfig}>
              <BarChart
                accessibilityLayer
                data={areaChartData}
                margin={{ bottom: 0, left: 0, right: 10, top: 10 }}
              >
                <CartesianGrid
                  stroke="hsl(var(--border))"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="mes"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickLine={false}
                  tickMargin={10}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => String(label).toUpperCase()}
                      nameFormatter={(name) => financialChartConfig[name]?.label ?? name}
                    />
                  }
                />
                {(areaMode === "todos" || areaMode === "receitas") && (
                  <Bar
                    dataKey="receitas"
                    name="receitas"
                    fill="var(--color-receitas)"
                    radius={4}
                  />
                )}
                {(areaMode === "todos" || areaMode === "despesas") && (
                  <Bar
                    dataKey="despesas"
                    name="despesas"
                    fill="var(--color-despesas)"
                    radius={4}
                  />
                )}
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>
              Evolucao {reportMode === "anual" ? "anual" : "mensal"}
            </CardTitle>
            <CardDescription>
              Barras comparando receitas e despesas do período.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando relatorio...
              </div>
            ) : (
              <div className="grid gap-3">
                {movimentos.map((item) => (
                  <div
                    className="grid gap-2 rounded-lg border border-border bg-background p-3"
                    key={item.mes}
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="w-14 font-medium capitalize">
                        {formatMonth(item.mes)}
                      </span>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="text-blue-600 dark:text-blue-400">
                          {formatCurrency(item.receitas)}
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(item.despesas)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-3 rounded-full bg-muted">
                        <div
                          className="h-3 rounded-full bg-blue-500"
                          style={{
                            width: `${(item.receitas / maiorValorGrafico) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="h-3 rounded-full bg-muted">
                        <div
                          className="h-3 rounded-full bg-red-500"
                          style={{
                            width: `${(item.despesas / maiorValorGrafico) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
                <PieChart className="h-5 w-5" />
              </span>
              <div>
                <CardTitle>Despesas por categoria</CardTitle>
                <CardDescription>Distribuição do mês base do relatório.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando categorias...
              </div>
            ) : (
              <>
                <div className="mx-auto h-56 w-56 rounded-full border border-border shadow-inner">
                  <div
                    className="h-full w-full rounded-full"
                    style={{ background: pieGradient }}
                  />
                </div>
                <div className="space-y-2">
                  {categorias.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      Nenhuma despesa por categoria encontrada.
                    </p>
                  )}
                  {categorias.map((item, index) => (
                    <div
                      className="flex items-center justify-between gap-3 text-sm"
                      key={item.categoria}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-3 w-3 shrink-0 rounded-sm"
                          style={{
                            backgroundColor: chartColors[index % chartColors.length],
                          }}
                        />
                        <span className="truncate">{item.categoria}</span>
                      </span>
                      <span className="shrink-0 font-medium text-red-600 dark:text-red-400">
                        {totalCategorias > 0
                          ? `${((item.total / totalCategorias) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
