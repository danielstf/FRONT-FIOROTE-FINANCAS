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
import { defaultExpenseCategories, getCategoryColor, getCategoryIcon } from "../despesas/category-icons";
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

// ── SpreadsheetML (multi-aba com cores) ────────────────────────────────────

function xe(s: string | null | undefined): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function brDate(v: string | null | undefined): string {
  if (!v) return "";
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : v;
}

type XCell = { v: string | number; t?: "s" | "n"; s?: string; span?: number };

function xc(c: XCell): string {
  const sa = c.s ? ` ss:StyleID="${c.s}"` : "";
  const ma = c.span && c.span > 1 ? ` ss:MergeAcross="${c.span - 1}"` : "";
  const type = c.t === "n" ? "Number" : "String";
  const val = c.t === "n" ? c.v : xe(String(c.v));
  return `<Cell${sa}${ma}><Data ss:Type="${type}">${val}</Data></Cell>`;
}

function xrow(...cells: XCell[]): string {
  return `<Row>${cells.map(xc).join("")}</Row>`;
}

function xgap(): string { return `<Row ss:Height="5"/>`; }

function xws(name: string, rows: string[], cols?: number[]): string {
  const colDefs = (cols ?? []).map((w) => `<Column ss:Width="${w}"/>`).join("");
  return `<Worksheet ss:Name="${xe(name)}"><Table>${colDefs}${rows.join("")}</Table></Worksheet>`;
}

const XML_STYLES = `<Styles>
<Style ss:ID="Default"><Alignment ss:Vertical="Center"/></Style>
<Style ss:ID="sh"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/><Interior ss:Color="#1e40af" ss:Pattern="Solid"/></Style>
<Style ss:ID="sh_r"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/><Interior ss:Color="#991b1b" ss:Pattern="Solid"/></Style>
<Style ss:ID="sh_c"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/><Interior ss:Color="#374151" ss:Pattern="Solid"/></Style>
<Style ss:ID="sm_r"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1e40af" ss:Pattern="Solid"/></Style>
<Style ss:ID="sm_d"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#991b1b" ss:Pattern="Solid"/></Style>
<Style ss:ID="sm_c"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#374151" ss:Pattern="Solid"/></Style>
<Style ss:ID="st_r"><Font ss:Bold="1" ss:Color="#1e40af"/><Interior ss:Color="#dbeafe" ss:Pattern="Solid"/></Style>
<Style ss:ID="st_d"><Font ss:Bold="1" ss:Color="#991b1b"/><Interior ss:Color="#fee2e2" ss:Pattern="Solid"/></Style>
<Style ss:ID="st_c"><Font ss:Bold="1" ss:Color="#1e293b"/><Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/></Style>
<Style ss:ID="vr"><Font ss:Bold="1" ss:Color="#1d4ed8"/></Style>
<Style ss:ID="vd"><Font ss:Bold="1" ss:Color="#dc2626"/></Style>
<Style ss:ID="vp"><Font ss:Bold="1" ss:Color="#16a34a"/></Style>
<Style ss:ID="vo"><Font ss:Bold="1" ss:Color="#d97706"/></Style>
<Style ss:ID="alt"><Interior ss:Color="#f8fafc" ss:Pattern="Solid"/></Style>
<Style ss:ID="it"><Font ss:Italic="1" ss:Color="#94a3b8"/></Style>
<Style ss:ID="bd"><Font ss:Bold="1"/></Style>
</Styles>`;

function s(v: string | null | undefined, style?: string, span?: number): XCell {
  return { v: String(v ?? ""), t: "s", s: style, span };
}
function n(v: number, style?: string, span?: number): XCell {
  return { v: Math.round(v * 100) / 100, t: "n", s: style, span };
}

// ── Aba Resumo ─────────────────────────────────────────────────────────────

function wsResumo(linhas: MovimentoMensal[]): string {
  const rows: string[] = [];
  rows.push(xrow(s("Mês", "sh"), s("Tipo", "sh"), s("Receitas (R$)", "sh"), s("Despesas (R$)", "sh"), s("Saldo Final (R$)", "sh")));
  linhas.forEach((item, i) => {
    const alt = i % 2 === 1 ? "alt" : undefined;
    rows.push(xrow(s(formatMonth(item.mes), alt), s(item.projecao ? "Estimativa" : "Real", item.projecao ? "vo" : "vp"), n(item.receitas, "vr"), n(item.despesas, "vd"), n(item.saldoFinal, item.saldoFinal >= 0 ? "vp" : "vd")));
  });
  const tR = linhas.reduce((a, i) => a + i.receitas, 0);
  const tD = linhas.reduce((a, i) => a + i.despesas, 0);
  const tS = tR - tD;
  rows.push(xrow(s("TOTAL", "st_r", 2), n(tR, "st_r"), n(tD, "st_d"), n(tS, tS >= 0 ? "vp" : "vd")));
  return xws("Resumo", rows, [130, 90, 120, 120, 120]);
}

// ── Aba Receitas ───────────────────────────────────────────────────────────

function wsReceitas(grupos: Array<{ mes: string; receitas: Array<{ data?: string | null; nome: string; valor: number; fixa: boolean }> }>): string {
  const rows: string[] = [];
  rows.push(xrow(s("Mês", "sh"), s("Data", "sh"), s("Nome", "sh"), s("Valor (R$)", "sh"), s("Fixa", "sh")));
  for (const { mes, receitas } of grupos) {
    rows.push(xrow(s(`${formatMonth(mes)} — ${receitas.length} lançamento(s)`, "sm_r", 5)));
    if (receitas.length === 0) {
      rows.push(xrow(s("Nenhuma receita neste mês.", "it", 5)));
    } else {
      receitas.forEach((r, i) => {
        const alt = i % 2 === 1 ? "alt" : undefined;
        rows.push(xrow(s(formatMonth(mes, false), alt), s(brDate(r.data), alt), s(r.nome, alt), n(r.valor, "vr"), s(r.fixa ? "Sim" : "Não", alt)));
      });
      rows.push(xrow(s(`Total ${formatMonth(mes, false)}`, "st_r", 3), n(receitas.reduce((a, r) => a + r.valor, 0), "st_r"), s("", "st_r")));
    }
    rows.push(xgap());
  }
  return xws("Receitas", rows, [110, 90, 210, 120, 60]);
}

// ── Aba Despesas ───────────────────────────────────────────────────────────

function wsDespesas(grupos: Array<{ mes: string; despesas: Array<{ dataVencimento?: string | null; nome: string; categoria?: string | null; formaPagamento?: string | null; valor: number; paga: boolean; fixa: boolean }> }>): string {
  const rows: string[] = [];
  rows.push(xrow(s("Mês", "sh_r"), s("Vencimento", "sh_r"), s("Nome", "sh_r"), s("Categoria", "sh_r"), s("Forma Pagamento", "sh_r"), s("Valor (R$)", "sh_r"), s("Paga", "sh_r"), s("Fixa", "sh_r")));
  for (const { mes, despesas } of grupos) {
    rows.push(xrow(s(`${formatMonth(mes)} — ${despesas.length} lançamento(s)`, "sm_d", 8)));
    if (despesas.length === 0) {
      rows.push(xrow(s("Nenhuma despesa neste mês.", "it", 8)));
    } else {
      despesas.forEach((d, i) => {
        const alt = i % 2 === 1 ? "alt" : undefined;
        rows.push(xrow(s(formatMonth(mes, false), alt), s(brDate(d.dataVencimento), alt), s(d.nome, alt), s(d.categoria ?? "", alt), s(d.formaPagamento ?? "", alt), n(d.valor, "vd"), s(d.paga ? "Sim" : "Não", d.paga ? "vp" : "vo"), s(d.fixa ? "Sim" : "Não", alt)));
      });
      rows.push(xrow(s(`Total ${formatMonth(mes, false)}`, "st_d", 5), n(despesas.reduce((a, d) => a + d.valor, 0), "st_d"), s("", "st_d"), s("", "st_d")));
    }
    rows.push(xgap());
  }
  return xws("Despesas", rows, [110, 90, 210, 130, 140, 120, 60, 60]);
}

// ── Abas por Cartão ────────────────────────────────────────────────────────

type DespesaCartaoXml = { dataVencimento?: string | null; nome: string; categoria?: string | null; valor: number; paga: boolean; vencida: boolean; fixa: boolean; cartaoCreditoId: string | null; cartaoCredito: { id: string; nome: string } | null };

function wsCartoes(grupos: Array<{ mes: string; despesas: DespesaCartaoXml[] }>): string[] {
  const byCard = new Map<string, { nome: string; items: Array<{ mes: string } & DespesaCartaoXml> }>();
  for (const { mes, despesas } of grupos) {
    for (const d of despesas) {
      if (!d.cartaoCreditoId || !d.cartaoCredito) continue;
      const key = d.cartaoCreditoId;
      if (!byCard.has(key)) byCard.set(key, { nome: d.cartaoCredito.nome, items: [] });
      byCard.get(key)!.items.push({ mes, ...d });
    }
  }
  if (byCard.size === 0) return [];

  return [...byCard.values()].map(({ nome, items }) => {
    const porMes = new Map<string, typeof items>();
    for (const d of items) {
      if (!porMes.has(d.mes)) porMes.set(d.mes, []);
      porMes.get(d.mes)!.push(d);
    }

    const rows: string[] = [];
    rows.push(xrow(s("Mês", "sh_c"), s("Vencimento", "sh_c"), s("Nome", "sh_c"), s("Categoria", "sh_c"), s("Valor (R$)", "sh_c"), s("Pago", "sh_c"), s("Vencida", "sh_c"), s("Fixa", "sh_c")));

    let gTotal = 0, gPago = 0, gPendente = 0;

    for (const [mes, despMes] of [...porMes.entries()].sort()) {
      rows.push(xrow(s(`${formatMonth(mes)} — ${despMes.length} lançamento(s)`, "sm_c", 8)));
      const sorted = [...despMes].sort((a, b) => (a.dataVencimento ?? "").localeCompare(b.dataVencimento ?? ""));
      sorted.forEach((d, i) => {
        const alt = i % 2 === 1 ? "alt" : undefined;
        const valSt = d.paga ? "vp" : d.vencida ? "vd" : "vo";
        rows.push(xrow(s(formatMonth(mes, false), alt), s(brDate(d.dataVencimento), alt), s(d.nome, alt), s(d.categoria ?? "", alt), n(d.valor, valSt), s(d.paga ? "Sim" : "Não", d.paga ? "vp" : "vo"), s(d.vencida ? "Sim" : "Não", d.vencida ? "vd" : alt), s(d.fixa ? "Sim" : "Não", alt)));
      });
      const mT = sorted.reduce((a, d) => a + d.valor, 0);
      const mP = sorted.filter((d) => d.paga).reduce((a, d) => a + d.valor, 0);
      gTotal += mT; gPago += mP; gPendente += mT - mP;
      rows.push(xrow(s(`Total ${formatMonth(mes, false)}`, "st_c", 4), n(mT, "vd"), n(mP, "vp"), s("", "st_c"), s("", "st_c")));
      rows.push(xgap());
    }

    rows.push(xrow(s("TOTAL GERAL", "st_c", 4), n(gTotal, "vd"), n(gPago, "vp"), n(gPendente, gPendente > 0 ? "vo" : "st_c"), s("", "st_c")));
    return xws(nome.slice(0, 31), rows, [110, 90, 210, 130, 120, 60, 60, 60]);
  });
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
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
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
      const despesasGrupos = exportMonths.map((mes, i) => ({
        mes,
        despesas: despesasPorMes[i].despesas.filter((d) => {
          if (selectedCategories.length === 0) return true;
          const cat = (d.categoria ?? "Outros").toLowerCase();
          return selectedCategories.some((sc) => sc.toLowerCase() === cat);
        }),
      }));
      const label = exportMode === "ano" ? `Ano ${exportYear}` : `${exportMonths.length} meses selecionados`;
      const abasCartoes = wsCartoes(despesasGrupos).join("");
      const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel">${XML_STYLES}${wsResumo(linhas)}${wsReceitas(receitasGrupos)}${wsDespesas(despesasGrupos)}${abasCartoes}</Workbook>`;
      const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            {/* Cabeçalho: um mês por coluna */}
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="sticky left-0 z-10 bg-muted/30 px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Métrica
                </th>
                {movimentos.map((item) => (
                  <th
                    key={item.mes}
                    className={cn(
                      "px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap",
                      item.projecao && "opacity-60",
                    )}
                  >
                    <span className="capitalize">{formatMonth(item.mes, false)}</span>
                    {item.projecao && (
                      <span className="ml-1 rounded bg-amber-500/15 px-1 py-0.5 text-[9px] font-bold text-amber-600">
                        Est.
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {/* Receitas */}
              <tr className="transition-colors hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-card px-5 py-3 text-xs font-semibold uppercase tracking-wider text-blue-500">
                  Receitas
                </td>
                {movimentos.map((item) => (
                  <td key={item.mes} className={cn("px-4 py-3 text-center font-medium text-blue-500 tabular-nums whitespace-nowrap", item.projecao && "opacity-60")}>
                    {formatCurrency(item.receitas)}
                  </td>
                ))}
              </tr>
              {/* Despesas */}
              <tr className="bg-muted/10 transition-colors hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-card px-5 py-3 text-xs font-semibold uppercase tracking-wider text-red-500">
                  Despesas
                </td>
                {movimentos.map((item) => (
                  <td key={item.mes} className={cn("px-4 py-3 text-center font-medium text-red-500 tabular-nums whitespace-nowrap", item.projecao && "opacity-60")}>
                    {formatCurrency(item.despesas)}
                  </td>
                ))}
              </tr>
              {/* Saldo */}
              <tr className="transition-colors hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-card px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Saldo
                </td>
                {movimentos.map((item) => (
                  <td
                    key={item.mes}
                    className={cn(
                      "px-4 py-3 text-center font-bold tabular-nums whitespace-nowrap",
                      item.projecao && "opacity-60",
                      item.saldoFinal >= 0 ? "text-emerald-500" : "text-red-500",
                    )}
                  >
                    {formatCurrency(item.saldoFinal)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
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

            {/* Filtro por categoria */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Categorias de despesa</Label>
              <button
                type="button"
                onClick={() => setCategoryFilterOpen(true)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <span className={cn("truncate", selectedCategories.length === 0 ? "text-muted-foreground" : "font-medium text-foreground")}>
                  {selectedCategories.length === 0
                    ? "Todas as categorias"
                    : selectedCategories.length === 1
                      ? selectedCategories[0]
                      : `${selectedCategories.length} categorias selecionadas`}
                </span>
                {selectedCategories.length > 0 && (
                  <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {selectedCategories.length}
                  </span>
                )}
              </button>
            </div>

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

      {/* ── Dialog: seletor de categorias ── */}
      <Dialog open={categoryFilterOpen} onOpenChange={setCategoryFilterOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrar por categoria</DialogTitle>
            <DialogDescription>
              Selecione as categorias a incluir no relatório. Sem seleção = todas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2 py-1 max-h-80 overflow-y-auto pr-1">
            {defaultExpenseCategories.map((cat) => {
              const Icon = getCategoryIcon(cat);
              const color = getCategoryColor(cat);
              const selected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center text-[11px] font-medium transition-all",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-border/80 hover:bg-muted/50 text-muted-foreground",
                  )}
                >
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", selected ? "bg-primary/15" : color)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="leading-tight line-clamp-2">{cat}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setSelectedCategories([])}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Limpar seleção
            </button>
            <Button onClick={() => setCategoryFilterOpen(false)}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
