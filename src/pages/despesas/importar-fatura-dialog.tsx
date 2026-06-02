import { useRef, useState } from "react";
import { AlertTriangle, Check, CreditCard, FileText, Loader2, Repeat2, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { CartaoCredito } from "../../api/cartoes/types";
import { despesasApi } from "../../api/despesas/despesas-api";
import { getApiErrorMessage } from "../../api/errors";
import { getCardGradientStyle } from "../../lib/card-colors";
import { MonthPicker } from "../../components/month-picker";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { cn } from "../../lib/utils";
import {
  defaultExpenseCategories,
  getCategoryColor,
  getCategoryIcon,
} from "./category-icons";
import { formatCurrency, formatMonthName, getCurrentMonth } from "./utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartoes: CartaoCredito[];
  defaultMes: string;
  onSuccess: () => void;
};

type ItemParsed = {
  nome: string;
  valor: number;
  parcelaAtual?: number;
  totalParcelas?: number;
};

type ItemPreview = ItemParsed & { duplicado: boolean; categoria: string };

// ─── Extração de texto do PDF via pdfjs ────────────────────────
async function extrairTextoPdf(f: File): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const arrayBuffer = await f.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const paginas: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const itensOrdenados = content.items
      .filter((item) => "str" in item)
      .sort((a, b) => {
        const ay = "transform" in a ? -(a.transform as number[])[5] : 0;
        const by = "transform" in b ? -(b.transform as number[])[5] : 0;
        return ay - by;
      });

    let linhaAtual = "";
    let yAtual: number | null = null;
    const linhas: string[] = [];

    for (const item of itensOrdenados) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = "transform" in item ? -(item.transform as number[])[5] : 0;
      if (yAtual !== null && Math.abs(y - yAtual) > 3) {
        if (linhaAtual.trim()) linhas.push(linhaAtual.trim());
        linhaAtual = "";
      }
      linhaAtual += " " + item.str;
      yAtual = y;
    }
    if (linhaAtual.trim()) linhas.push(linhaAtual.trim());
    paginas.push(linhas.join("\n"));
  }

  return paginas.join("\n");
}

// ─── Parser de fatura ──────────────────────────────────────────
function parsearFatura(texto: string): ItemParsed[] {
  const linhas = texto
    .split(/[\n\r]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 4);

  const itens: ItemParsed[] = [];

  const reDataInicio =
    /^(\d{1,2}[/.-]\d{2}(?:[/.-]\d{2,4})?\s+|\d{1,2}\s+(?:jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\w*\s*(?:\d{2,4})?\s+)/i;

  const reValorFim = /(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})\s*$/;

  const reParcelamento =
    /\b(?:parc(?:ela)?\s*)?(\d{1,2})\s*(?:[/]|de)\s*(\d{1,2})\b/i;

  const excluirDescricao =
    /^(pagamento|pago|paga|estorno|crédito|credito|devolução|devolucao|reembolso|ajuste|cash\s*back|cashback|saque|juro|encargo|iof|anuidade|tarifa|taxa|multa|mora|saldo|débito\s*autom|debito\s*autom|parcelamento\s*fatura|fatura\s*anterior)/i;

  for (const linha of linhas) {
    const matchData = linha.match(reDataInicio);
    if (!matchData) continue;

    const matchValor = linha.match(reValorFim);
    if (!matchValor) continue;

    const posValor = linha.lastIndexOf(matchValor[1]);
    const sufixo = linha.slice(posValor + matchValor[1].length).trim();
    const prefixo = linha.slice(Math.max(0, posValor - 2), posValor).trim();
    if (/cr/i.test(sufixo) || prefixo === "-") continue;

    const valorStr = matchValor[1].replace(/\./g, "").replace(",", ".");
    const valor = parseFloat(valorStr);
    if (isNaN(valor) || valor <= 0 || valor > 50000) continue;

    const semData = linha.slice(matchData[0].length).trim();
    let nome = semData
      .slice(0, semData.lastIndexOf(matchValor[1]))
      .replace(/\s*R\$\s*$/, "")
      .replace(/^R\$\s*/, "")
      .trim();

    if (excluirDescricao.test(nome)) continue;
    if (/\blimite\b|\bdisponível\b|\bdisponivel\b/i.test(nome)) continue;

    const matchParc = nome.match(reParcelamento);
    let parcelaAtual: number | undefined;
    let totalParcelas: number | undefined;

    if (matchParc) {
      const pa = parseInt(matchParc[1]);
      const pt = parseInt(matchParc[2]);
      if (pa >= 1 && pt > 1 && pa <= pt) {
        parcelaAtual = pa;
        totalParcelas = pt;
        nome = nome.replace(matchParc[0], "").replace(/\s+/g, " ").trim();
      }
    }

    nome = nome.replace(/\s+/g, " ").trim();

    if (!nome || nome.length < 3) continue;
    if (/^\d{1,2}[/.-]\d{2}$/.test(nome) || /^\d+$/.test(nome)) continue;
    if (/^\d{1,3}(?:\.\d{3})*,\d{2}$/.test(nome)) continue;

    itens.push({ nome, valor, parcelaAtual, totalParcelas });
  }

  return itens.filter(
    (item, i, arr) =>
      arr.findIndex(
        (a) =>
          a.nome === item.nome &&
          Math.abs(a.valor - item.valor) < 0.01 &&
          a.parcelaAtual === item.parcelaAtual,
      ) === i,
  );
}

function parcelasRestantes(item: ItemParsed): number | undefined {
  if (!item.parcelaAtual || !item.totalParcelas) return undefined;
  return item.totalParcelas - item.parcelaAtual + 1;
}

// ─── Componente ────────────────────────────────────────────────
export function ImportarFaturaDialog({
  open,
  onOpenChange,
  cartoes,
  defaultMes,
  onSuccess,
}: Props) {
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [cartaoId, setCartaoId] = useState(() => cartoes[0]?.id ?? "");
  const [mes, setMes] = useState(defaultMes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [itens, setItens] = useState<ItemPreview[]>([]);
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [criando, setCriando] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [categoryPickerIndex, setCategoryPickerIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetar() {
    setStep("upload");
    setFile(null);
    setCartaoId(cartoes[0]?.id ?? "");
    setMes(defaultMes);
    setLoading(false);
    setError("");
    setItens([]);
    setSelecionados(new Set());
    setCriando(false);
    setCategoryPickerOpen(false);
    setCategoryPickerIndex(null);
  }

  function handleFile(f: File) {
    if (!f.type.includes("pdf") && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Selecione um arquivo PDF válido.");
      return;
    }
    setFile(f);
    setError("");
  }

  function setCategoriaItem(index: number, categoria: string) {
    setItens((prev) =>
      prev.map((item, i) => (i === index ? { ...item, categoria } : item)),
    );
  }

  function abrirCategoriaPicker(index: number, e: React.MouseEvent) {
    e.stopPropagation();
    setCategoryPickerIndex(index);
    setCategoryPickerOpen(true);
  }

  function selecionarCategoria(categoria: string) {
    if (categoryPickerIndex !== null) {
      setCategoriaItem(categoryPickerIndex, categoria);
    }
    setCategoryPickerOpen(false);
    setCategoryPickerIndex(null);
  }

  async function analisar() {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      const texto = await extrairTextoPdf(file);
      const extraidos = parsearFatura(texto);

      if (extraidos.length === 0) {
        setError(
          "Nenhuma despesa identificada. Verifique se o PDF é uma fatura válida e não está protegido por senha.",
        );
        setLoading(false);
        return;
      }

      const existentes = await despesasApi.listar({ mes });

      const itensMapeados: ItemPreview[] = extraidos.map((item) => ({
        ...item,
        categoria: "",
        duplicado: existentes.despesas.some((d) => {
          const dNome = d.nome.trim().toLowerCase().replace(/\s+/g, " ");
          const iNome = item.nome.trim().toLowerCase().replace(/\s+/g, " ");
          const valorIgual = Math.abs(d.valor - item.valor) < 0.01;
          if (!valorIgual) return false;
          if (dNome === iNome) return true;
          if (item.parcelaAtual !== undefined && iNome.length >= 3) {
            const charApos = dNome[iNome.length];
            if (dNome.startsWith(iNome) && (!charApos || charApos === " ")) return true;
            const charApos2 = iNome[dNome.length];
            if (iNome.startsWith(dNome) && (!charApos2 || charApos2 === " ")) return true;
          }
          return false;
        }),
      }));

      setItens(itensMapeados);
      setSelecionados(
        new Set(
          itensMapeados.map((_, i) => i).filter((i) => !itensMapeados[i].duplicado),
        ),
      );
      setStep("preview");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function importar() {
    const itensSelecionados = [...selecionados].map((i) => itens[i]);
    if (itensSelecionados.length === 0) return;

    setCriando(true);
    setError("");

    const isPastMonth = mes < getCurrentMonth();

    try {
      await Promise.all(
        itensSelecionados.map((item) => {
          const restantes = parcelasRestantes(item);
          return despesasApi.criar({
            nome: item.nome,
            valor: item.valor,
            categoria: item.categoria || null,
            formaPagamento: "CARTAO_CREDITO",
            cartaoCreditoId: cartaoId || null,
            mes,
            paga: isPastMonth && !restantes,
            numeroParcelas: restantes && restantes > 1 ? restantes : undefined,
          });
        }),
      );

      const count = itensSelecionados.length;
      toast.success(
        `${count} ${count === 1 ? "despesa importada" : "despesas importadas"} com sucesso.`,
      );
      onSuccess();
      onOpenChange(false);
      resetar();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setCriando(false);
    }
  }

  function toggleItem(index: number) {
    if (itens[index].duplicado) return;
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const totalSelecionado = [...selecionados].reduce(
    (sum, i) => sum + itens[i].valor,
    0,
  );
  const isPastMonth = mes < getCurrentMonth();
  const duplicados = itens.filter((i) => i.duplicado).length;
  const cartaoSelecionado = cartoes.find((c) => c.id === cartaoId);
  const itemEmEdicao = categoryPickerIndex !== null ? itens[categoryPickerIndex] : null;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) resetar();
          onOpenChange(o);
        }}
      >
        <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
          {/* ── Header ─────────────────────────────────── */}
          <div className="relative border-b border-border bg-linear-to-br from-primary/10 via-background to-background p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"
            />
            <DialogHeader className="flex-row items-center gap-4 space-y-0 text-left">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-base">Importar fatura PDF</DialogTitle>
                <DialogDescription className="text-sm">
                  {step === "upload"
                    ? "Envie o PDF da fatura para identificar as despesas automaticamente."
                    : `${itens.length} ${itens.length === 1 ? "despesa encontrada" : "despesas encontradas"} — revise antes de importar.`}
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>

          {/* ── Step 1: upload ─────────────────────────── */}
          {step === "upload" && (
            cartoes.length === 0 ? (
              /* Estado vazio — sem cartão cadastrado */
              <div className="flex flex-col items-center gap-5 px-6 py-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <CreditCard className="h-8 w-8" />
                </span>
                <div className="space-y-1.5">
                  <p className="text-base font-semibold">Nenhum cartão cadastrado</p>
                  <p className="text-sm text-muted-foreground">
                    Para importar uma fatura é necessário ter ao menos um cartão de crédito cadastrado.
                  </p>
                </div>
                <Button asChild className="mt-1 w-full max-w-xs">
                  <Link to="/app/cartoes" onClick={() => onOpenChange(false)}>
                    <CreditCard className="h-4 w-4" />
                    Cadastrar cartão
                  </Link>
                </Button>
              </div>
            ) : (
              /* Formulário de upload */
              <div className="space-y-5 p-5">
                {/* Drop zone */}
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all",
                    dragOver
                      ? "border-primary bg-primary/8 scale-[1.01]"
                      : "border-border hover:border-primary/50 hover:bg-muted/40",
                    file && "border-emerald-500/50 bg-emerald-500/5",
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files[0];
                    if (f) handleFile(f);
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                  {file ? (
                    <>
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{file.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(0)} KB · Clique para trocar
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Upload className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">Arraste o PDF aqui</p>
                        <p className="text-xs text-muted-foreground">ou clique para selecionar</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Mês de referência */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground">Mês de referência</p>
                  <MonthPicker value={mes} onChange={setMes} />
                </div>

                {/* Cartão — mini-cards */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Cartão de crédito</p>
                  <div className="flex flex-wrap gap-2">
                    {cartoes.map((cartao, index) => {
                      const isSelected = cartaoId === cartao.id;
                      return (
                        <button
                          key={cartao.id}
                          type="button"
                          onClick={() => setCartaoId(cartao.id)}
                          className={cn(
                            "relative overflow-hidden rounded-lg transition-all",
                            isSelected
                              ? "ring-2 ring-white/60 ring-offset-1 ring-offset-background scale-105 shadow-lg"
                              : "opacity-70 hover:opacity-100 hover:scale-[1.02]",
                          )}
                          style={{ background: getCardGradientStyle(index) }}
                          title={cartao.nome}
                        >
                          <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/40" />
                          <div aria-hidden className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 rounded-full bg-white/10" />
                          <div className="relative flex items-center gap-2 px-3 py-2 text-white">
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

                {error && (
                  <p className="flex items-center gap-2 rounded-lg border border-destructive/25 bg-destructive/8 px-3.5 py-2.5 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                  </p>
                )}

                <Button className="w-full" disabled={!file || loading} onClick={analisar}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Lendo fatura...</>
                  ) : (
                    <><FileText className="h-4 w-4" /> Analisar fatura</>
                  )}
                </Button>
              </div>
            )
          )}

          {/* ── Step 2: preview ────────────────────────── */}
          {step === "preview" && (
            <>
              {/* Banners */}
              {isPastMonth && (
                <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/8 px-5 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Mês passado — despesas à vista serão marcadas como{" "}
                  <strong className="ml-0.5">pagas</strong>.
                </div>
              )}
              {duplicados > 0 && (
                <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-5 py-2.5 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {duplicados}{" "}
                  {duplicados === 1 ? "item já cadastrado" : "itens já cadastrados"} em{" "}
                  {formatMonthName(mes)} — ignorado{duplicados === 1 ? "" : "s"}.
                </div>
              )}

              {/* Cartão selecionado (indicador compacto) */}
              {cartaoSelecionado && (
                <div
                  className="mx-5 mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow"
                  style={{ background: getCardGradientStyle(cartoes.findIndex((c) => c.id === cartaoSelecionado.id)) }}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  {cartaoSelecionado.nome}
                </div>
              )}

              {/* Lista de itens */}
              <div className="mt-3 max-h-80 overflow-y-auto divide-y divide-border/60">
                {itens.map((item, i) => {
                  const restantes = parcelasRestantes(item);
                  const CatIcon = item.categoria ? getCategoryIcon(item.categoria) : null;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-3 px-5 py-3 transition-colors",
                        item.duplicado ? "opacity-50" : "hover:bg-muted/30",
                      )}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                        checked={selecionados.has(i)}
                        disabled={item.duplicado}
                        onChange={() => toggleItem(i)}
                      />

                      {/* Nome + badges + categoria */}
                      <div
                        className={cn("min-w-0 flex-1", !item.duplicado && "cursor-pointer")}
                        onClick={() => toggleItem(i)}
                      >
                        <p className="truncate text-sm font-semibold leading-tight">{item.nome}</p>

                        {/* Badges */}
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {restantes && restantes > 1 && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/8 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                              <Repeat2 className="h-2.5 w-2.5" />
                              {item.parcelaAtual}/{item.totalParcelas} · {restantes} parcelas
                            </span>
                          )}
                          {item.duplicado && (
                            <span className="text-xs text-muted-foreground">Já cadastrada neste mês</span>
                          )}
                        </div>

                        {/* Botão de categoria */}
                        {!item.duplicado && (
                          <button
                            type="button"
                            onClick={(e) => abrirCategoriaPicker(i, e)}
                            className={cn(
                              "mt-1.5 flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition-all hover:bg-muted/60",
                              item.categoria
                                ? "border-primary/30 bg-primary/6 font-medium text-primary hover:border-primary/50"
                                : "border-border bg-background text-muted-foreground",
                            )}
                          >
                            {CatIcon && <CatIcon className="h-3 w-3" />}
                            <span>{item.categoria || "Categoria..."}</span>
                          </button>
                        )}
                      </div>

                      {/* Valor */}
                      <strong className="mt-0.5 shrink-0 text-sm font-bold text-red-500">
                        {formatCurrency(item.valor)}
                      </strong>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="space-y-3 border-t border-border p-5">
                {selecionados.size > 0 && (
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-2.5">
                    <p className="text-xs text-muted-foreground">
                      {selecionados.size}{" "}
                      {selecionados.size === 1 ? "despesa" : "despesas"} selecionada{selecionados.size === 1 ? "" : "s"}
                    </p>
                    <p className="text-sm font-bold text-red-500">{formatCurrency(totalSelecionado)}</p>
                  </div>
                )}

                {error && (
                  <p className="flex items-center gap-2 rounded-lg border border-destructive/25 bg-destructive/8 px-3.5 py-2.5 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={criando}
                    onClick={() => { setStep("upload"); setError(""); }}
                  >
                    Voltar
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={selecionados.size === 0 || criando}
                    onClick={importar}
                  >
                    {criando ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Importando...</>
                    ) : (
                      `Importar ${selecionados.size > 0 ? selecionados.size : ""} ${selecionados.size === 1 ? "despesa" : "despesas"}`
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal de categoria ─────────────────────────── */}
      <Dialog open={categoryPickerOpen} onOpenChange={setCategoryPickerOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-sm">
          <div className="relative border-b border-border bg-linear-to-br from-primary/10 via-background to-background px-5 py-4">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
            <DialogHeader className="space-y-0.5 text-left">
              <DialogTitle className="text-sm">Escolher categoria</DialogTitle>
              {itemEmEdicao && (
                <DialogDescription className="truncate text-xs">
                  {itemEmEdicao.nome}
                </DialogDescription>
              )}
            </DialogHeader>
          </div>

          <div className="grid grid-cols-4 gap-2 overflow-y-auto p-4 max-h-72 pr-3">
            {defaultExpenseCategories.map((cat) => {
              const Icon = getCategoryIcon(cat);
              const color = getCategoryColor(cat);
              const selected = itemEmEdicao?.categoria === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => selecionarCategoria(cat)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center text-[11px] font-medium transition-all",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-border/80 hover:bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      selected ? "bg-primary/15" : color,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="line-clamp-2 leading-tight">{cat}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <button
              type="button"
              onClick={() => selecionarCategoria("")}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Sem categoria
            </button>
            <Button variant="outline" className="h-7 px-3 text-xs" onClick={() => setCategoryPickerOpen(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
