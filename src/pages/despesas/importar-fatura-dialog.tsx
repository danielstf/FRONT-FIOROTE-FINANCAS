import { useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CalendarDays,
  Check,
  CreditCard,
  FileText,
  ImageIcon,
  KeyRound,
  Loader2,
  Repeat2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
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
  dataTexto?: string;
  categoria?: string;
};

type ItemPreview = ItemParsed & { duplicado: boolean; categoria: string };

const ACCEPT = "application/pdf,.pdf,image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif";
const MAX_MB = 20;

// ─── Helpers ───────────────────────────────────────────────────
function parcelasRestantes(item: ItemParsed): number | undefined {
  if (!item.parcelaAtual || !item.totalParcelas) return undefined;
  return item.totalParcelas - item.parcelaAtual + 1;
}

function dataTextoParaISO(dataTexto: string, mes: string): string | null {
  const t = dataTexto.trim();
  const m4 = t.match(/^(\d{1,2})[/.-](\d{2})[/.-](\d{4})$/);
  if (m4) return `${m4[3]}-${m4[2].padStart(2, "0")}-${m4[1].padStart(2, "0")}`;
  const m2 = t.match(/^(\d{1,2})[/.-](\d{2})[/.-](\d{2})$/);
  if (m2) return `${2000 + parseInt(m2[3])}-${m2[2].padStart(2, "0")}-${m2[1].padStart(2, "0")}`;
  const m1 = t.match(/^(\d{1,2})[/.-](\d{2})$/);
  if (m1) return `${mes.slice(0, 4)}-${m1[2].padStart(2, "0")}-${m1[1].padStart(2, "0")}`;
  return null;
}

// ─── PDF com senha ─────────────────────────────────────────────
async function configurarWorkerPdf() {
  const { GlobalWorkerOptions } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
}

async function verificarSenhaPdf(file: File): Promise<boolean> {
  const { getDocument } = await import("pdfjs-dist");
  await configurarWorkerPdf();
  const buffer = await file.arrayBuffer();
  try {
    await getDocument({ data: buffer }).promise;
    return false;
  } catch (err) {
    return (err as { name?: string }).name === "PasswordException";
  }
}

async function renderizarPdfParaImagens(file: File, senha: string): Promise<string[]> {
  const { getDocument } = await import("pdfjs-dist");
  await configurarWorkerPdf();
  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer, password: senha }).promise;
  const paginas: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 3.0 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, canvas, viewport }).promise;
    paginas.push(canvas.toDataURL("image/jpeg", 0.92).split(",")[1]);
  }

  return paginas;
}

// ─── OpenAI ────────────────────────────────────────────────────
async function analisarComOpenAI(
  file: File,
  categorias: string[],
  imagensPdf?: string[],
): Promise<ItemParsed[]> {
  const apiKey = (import.meta.env.VITE_OPENAI_API_KEY as string | undefined) ?? "";
  if (!apiKey) throw new Error("Chave OpenAI não configurada. Adicione VITE_OPENAI_API_KEY no .env");

  const prompt = `Você é um especialista em leitura de faturas de cartão de crédito e extratos bancários brasileiros.

TAREFA: Extraia TODOS os lançamentos de compras e despesas presentes na imagem/fatura. Não pule nenhum item.

=== O QUE EXTRAIR ===
- Toda compra ou serviço cobrado no cartão
- Compras parceladas (ex: "2/12", "2 de 12", "PARC 02/12") — extraia a parcela atual com seu valor
- Assinaturas, mensalidades, serviços recorrentes
- Compras internacionais (converta o valor em R$ mostrado na fatura)

=== O QUE IGNORAR COMPLETAMENTE ===
- Pagamentos, créditos, estornos, devoluções
- IOF, juros, multas, encargos, tarifas, anuidades
- Totais, subtotais, resumos, saldos
- Linhas de cabeçalho ou rodapé

=== FORMATO DO JSON DE SAÍDA ===
Retorne SOMENTE o JSON abaixo, sem markdown, sem explicação, sem texto adicional:
{
  "despesas": [
    {
      "nome": "Nome limpo do estabelecimento",
      "valor": 123.45,
      "data": "DD/MM",
      "parcelaAtual": 2,
      "totalParcelas": 12,
      "categoria": "Categoria"
    }
  ]
}

=== REGRAS CRÍTICAS ===
VALORES:
- Converta o formato brasileiro: "1.234,56" → 1234.56 (ponto = separador de milhar, vírgula = decimal)
- O campo "valor" deve ser sempre número com PONTO decimal (ex: 199.90), nunca string, nunca vírgula
- Use o valor da PARCELA ATUAL, não o total parcelado

PARCELAS:
- Se o extrato mostrar "2/12" ou "02 DE 12" → parcelaAtual: 2, totalParcelas: 12
- Se não for parcelado → omita parcelaAtual e totalParcelas

DATA:
- Formato DD/MM extraído exatamente como aparece na fatura
- Se não houver data → omita o campo "data"
- Lançamentos no mesmo estabelecimento em datas diferentes → liste separadamente

NOME:
- Limpo e legível, sem códigos, sem número de parcela, sem asteriscos
- Exemplos: "AMAZON", "UBER", "SUPERMERCADO BOM PREÇO", "NETFLIX"

CATEGORIA (use exatamente uma das opções): ${categorias.join(", ")}
- Se incerto → use "Outros"`;

  let imageContent: { type: "image_url"; image_url: { url: string; detail?: "high" | "low" | "auto" } }[];

  if (imagensPdf && imagensPdf.length > 0) {
    imageContent = imagensPdf.map((img) => ({
      type: "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${img}`, detail: "high" as const },
    }));
  } else {
    if (file.size > MAX_MB * 1024 * 1024)
      throw new Error(`Arquivo muito grande. O limite é ${MAX_MB} MB.`);
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    const mimeType = file.type || "image/jpeg";
    imageContent = [{ type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" as const } }];
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            ...imageContent,
            { type: "text", text: prompt },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? "Erro ao comunicar com a OpenAI.");
  }

  const result = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = result.choices?.[0]?.message?.content ?? "";

  let parsed: { despesas?: unknown[] };
  try {
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(match ? match[0] : cleaned) as { despesas?: unknown[] };
  } catch {
    throw new Error("A IA retornou um formato inválido. Tente novamente.");
  }

  const lista = Array.isArray(parsed.despesas) ? parsed.despesas : [];

  return (lista as Record<string, unknown>[])
    .filter((d) => d.nome && typeof d.valor === "number" && (d.valor as number) > 0)
    .map((d) => ({
      nome: String(d.nome).trim(),
      valor: Number(d.valor),
      parcelaAtual: d.parcelaAtual != null ? Number(d.parcelaAtual) : undefined,
      totalParcelas: d.totalParcelas != null ? Number(d.totalParcelas) : undefined,
      dataTexto: d.data ? String(d.data) : undefined,
      categoria: d.categoria ? String(d.categoria) : undefined,
    }));
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
  const [cartaoError, setCartaoError] = useState(false);
  const [senhaRequired, setSenhaRequired] = useState(false);
  const [senha, setSenha] = useState("");
  const [senhaErro, setSenhaErro] = useState(false);
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
    setCartaoError(false);
    setSenhaRequired(false);
    setSenha("");
    setSenhaErro(false);
    setItens([]);
    setSelecionados(new Set());
    setCriando(false);
    setCategoryPickerOpen(false);
    setCategoryPickerIndex(null);
  }

  function handleFile(f: File) {
    const isImage = f.type.startsWith("image/");
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isImage && !isPdf) {
      setError("Selecione um PDF ou imagem (JPG, PNG, WEBP).");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Arquivo muito grande. O limite é ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    setError("");
    setSenhaRequired(false);
    setSenha("");
    setSenhaErro(false);

    if (isPdf) {
      verificarSenhaPdf(f).then((precisaSenha) => setSenhaRequired(precisaSenha)).catch(() => {});
    }
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
    if (categoryPickerIndex !== null) setCategoriaItem(categoryPickerIndex, categoria);
    setCategoryPickerOpen(false);
    setCategoryPickerIndex(null);
  }

  async function analisar() {
    if (!file) return;
    if (!cartaoId) { setCartaoError(true); return; }
    setCartaoError(false);
    setLoading(true);
    setError("");

    try {
      let imagensPdf: string[] | undefined;
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        try {
          imagensPdf = await renderizarPdfParaImagens(file, senhaRequired ? senha : "");
        } catch (err) {
          if ((err as { name?: string }).name === "PasswordException") {
            setSenhaErro(true);
            setError("Senha incorreta. Verifique e tente novamente.");
            setLoading(false);
            return;
          }
          throw err;
        }
      }

      const extraidos = await analisarComOpenAI(file, defaultExpenseCategories, imagensPdf);

      if (extraidos.length === 0) {
        setError("Nenhuma despesa identificada. Verifique se o arquivo contém uma fatura válida.");
        setLoading(false);
        return;
      }

      const existentes = await despesasApi.listar({ mes });

      const itensMapeados: ItemPreview[] = extraidos.map((item) => ({
        ...item,
        categoria: item.categoria ?? "",
        duplicado: existentes.despesas.some((d) => {
          const dNome = d.nome.trim().toLowerCase().replace(/\s+/g, " ");
          const iNome = item.nome.trim().toLowerCase().replace(/\s+/g, " ");
          if (Math.abs(d.valor - item.valor) >= 0.01) return false;

          let nomeIgual = dNome === iNome;
          if (!nomeIgual && item.parcelaAtual !== undefined && iNome.length >= 3) {
            const c1 = dNome[iNome.length];
            if (dNome.startsWith(iNome) && (!c1 || c1 === " ")) nomeIgual = true;
            const c2 = iNome[dNome.length];
            if (!nomeIgual && iNome.startsWith(dNome) && (!c2 || c2 === " ")) nomeIgual = true;
          }
          if (!nomeIgual) return false;

          if (item.dataTexto && d.dataVencimento) {
            const isoItem = dataTextoParaISO(item.dataTexto, mes);
            if (isoItem && isoItem.slice(5, 10) !== d.dataVencimento.slice(5, 10)) return false;
          }

          return true;
        }),
      }));

      setItens(itensMapeados);
      setSelecionados(
        new Set(itensMapeados.map((_, i) => i).filter((i) => !itensMapeados[i].duplicado)),
      );
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : getApiErrorMessage(err));
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
            dataVencimento: item.dataTexto ? dataTextoParaISO(item.dataTexto, mes) : null,
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

  const totalSelecionado = [...selecionados].reduce((sum, i) => sum + itens[i].valor, 0);
  const isPastMonth = mes < getCurrentMonth();
  const duplicados = itens.filter((i) => i.duplicado).length;
  const cartaoSelecionado = cartoes.find((c) => c.id === cartaoId);
  const itemEmEdicao = categoryPickerIndex !== null ? itens[categoryPickerIndex] : null;
  const isImage = file ? file.type.startsWith("image/") : false;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) resetar(); onOpenChange(o); }}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-lg">

          {/* ── Header ── */}
          <div className="relative overflow-hidden bg-linear-to-135deg from-primary/18 via-primary/6 to-background px-6 pt-6 pb-5">
            {/* Orbs decorativos */}
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute left-1/4 -top-4 h-24 w-24 rounded-full bg-primary/12 blur-2xl" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

            <DialogHeader className="space-y-4 text-left">
              {/* Título + ícone */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div aria-hidden className="absolute inset-0 rounded-2xl bg-primary/25 blur-lg" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/12 shadow-lg shadow-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <Bot className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full border-2 border-background bg-emerald-500 p-0.5 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle className="text-base font-bold leading-tight">
                      Importar fatura com IA
                    </DialogTitle>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      GPT-4o mini
                    </span>
                  </div>
                  <DialogDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {step === "upload"
                      ? "Envie a fatura — a IA lê, identifica e categoriza tudo automaticamente."
                      : `${itens.length} ${itens.length === 1 ? "despesa encontrada" : "despesas encontradas"} — revise e confirme o que deseja importar.`}
                  </DialogDescription>
                </div>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  step === "upload" ? "bg-primary text-primary-foreground" : "bg-emerald-500 text-white",
                )}>
                  {step === "preview" ? <Check className="h-3 w-3" /> : "1"}
                </div>
                <span className={cn(
                  "text-[11px] font-semibold transition-colors",
                  step === "upload" ? "text-foreground" : "text-emerald-600 dark:text-emerald-400",
                )}>
                  Arquivo
                </span>
                <div className="relative flex-1">
                  <div className="h-px bg-border" />
                  {step === "preview" && (
                    <div className="absolute inset-0 h-px bg-emerald-500/50" />
                  )}
                </div>
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  step === "preview" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}>
                  2
                </div>
                <span className={cn(
                  "text-[11px] font-semibold transition-colors",
                  step === "preview" ? "text-foreground" : "text-muted-foreground",
                )}>
                  Revisão
                </span>
              </div>
            </DialogHeader>
          </div>

          {/* ── Step 1: upload ── */}
          {step === "upload" && (
            cartoes.length === 0 ? (
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
              <div className="space-y-4 p-5">

                {/* Drop zone */}
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed p-7 text-center transition-all duration-200",
                    dragOver
                      ? "border-primary bg-primary/8 scale-[1.01]"
                      : file
                        ? "border-emerald-500/60 bg-emerald-500/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/40",
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT}
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />

                  {file ? (
                    <>
                      <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-b from-emerald-500/5 to-transparent" />
                      <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10">
                        {isImage ? <ImageIcon className="h-7 w-7" /> : <FileText className="h-7 w-7" />}
                        <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-emerald-500 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      </span>
                      <div>
                        <p className="max-w-60 truncate text-sm font-semibold text-foreground">{file.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(0)} KB · clique para trocar
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/8 text-primary">
                        <Upload className="h-7 w-7" />
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold">Arraste a fatura aqui</p>
                        <p className="text-xs text-muted-foreground">ou clique para selecionar o arquivo</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {["PDF", "JPG", "PNG", "WEBP"].map((ext) => (
                          <span key={ext} className="rounded-md border border-border bg-muted/50 px-2 py-0.5 font-medium">
                            {ext}
                          </span>
                        ))}
                        <span className="text-muted-foreground/50">· até {MAX_MB}MB</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Senha do PDF */}
                {senhaRequired && file && (
                  <div className="overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/6">
                    <div className="flex items-center gap-2 border-b border-amber-500/20 px-3.5 py-2.5">
                      <KeyRound className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                        PDF protegido por senha
                      </p>
                    </div>
                    <div className="p-3.5 space-y-1.5">
                      <input
                        type="password"
                        value={senha}
                        onChange={(e) => { setSenha(e.target.value); setSenhaErro(false); }}
                        placeholder="Digite a senha do PDF"
                        className={cn(
                          "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-offset-0 transition-all",
                          senhaErro
                            ? "border-destructive focus:ring-destructive/30"
                            : "border-amber-500/30 focus:ring-amber-500/20",
                        )}
                      />
                      {senhaErro && (
                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                          <X className="h-3 w-3" />
                          Senha incorreta. Tente novamente.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Mês + Cartão */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Mês */}
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      Mês de referência
                    </p>
                    <MonthPicker value={mes} onChange={setMes} />
                  </div>

                  {/* Cartão */}
                  <div className="space-y-1.5">
                    <p className={cn(
                      "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider",
                      cartaoError ? "text-destructive" : "text-muted-foreground",
                    )}>
                      <CreditCard className="h-3 w-3" />
                      Cartão
                      {cartaoError && <span className="font-normal normal-case tracking-normal">— obrigatório</span>}
                    </p>
                    <div className={cn(
                      "flex flex-wrap gap-1.5 rounded-xl p-1.5 transition-all",
                      cartaoError && "bg-destructive/4 outline-2 outline-destructive/40",
                    )}>
                      {cartoes.map((cartao, index) => {
                        const isSelected = cartaoId === cartao.id;
                        return (
                          <button
                            key={cartao.id}
                            type="button"
                            onClick={() => { setCartaoId(cartao.id); setCartaoError(false); }}
                            className={cn(
                              "relative overflow-hidden rounded-lg transition-all",
                              isSelected
                                ? "scale-105 shadow-lg ring-2 ring-white/60 ring-offset-1 ring-offset-background"
                                : "opacity-70 hover:opacity-100 hover:scale-[1.02]",
                            )}
                            style={{ background: getCardGradientStyle(index) }}
                            title={cartao.nome}
                          >
                            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/40" />
                            <div aria-hidden className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 rounded-full bg-white/10" />
                            <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-white">
                              <div className="h-3 w-4 shrink-0 overflow-hidden rounded-sm bg-amber-300/90">
                                <div className="mt-[45%] h-px w-full bg-amber-700/40" />
                              </div>
                              <span className="max-w-18 truncate text-[10px] font-bold tracking-wide">
                                {cartao.nome}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Erro */}
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/8 px-3.5 py-3 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Botão analisar */}
                <Button
                  className="relative w-full gap-2 overflow-hidden"
                  disabled={!file || loading}
                  onClick={analisar}
                >
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/8 to-transparent" />
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analisando fatura com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analisar com IA
                    </>
                  )}
                </Button>
              </div>
            )
          )}

          {/* ── Step 2: preview ── */}
          {step === "preview" && (
            <>
              {/* Banners de contexto */}
              {isPastMonth && (
                <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/8 px-5 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Mês passado — despesas à vista serão marcadas como <strong className="ml-0.5">pagas</strong>.
                </div>
              )}
              {duplicados > 0 && (
                <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-5 py-2.5 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {duplicados} {duplicados === 1 ? "item já cadastrado" : "itens já cadastrados"} em {formatMonthName(mes)} — ignorado{duplicados === 1 ? "" : "s"}.
                </div>
              )}

              {/* Barra de info: cartão + mês */}
              <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3">
                {cartaoSelecionado && (
                  <div
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-white shadow"
                    style={{ background: getCardGradientStyle(cartoes.findIndex((c) => c.id === cartaoSelecionado.id)) }}
                  >
                    <CreditCard className="h-3 w-3" />
                    {cartaoSelecionado.nome}
                  </div>
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  {formatMonthName(mes)}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {itens.length} {itens.length === 1 ? "item" : "itens"} identificados
                </span>
              </div>

              {/* Lista de itens */}
              <div className="max-h-72 divide-y divide-border/50 overflow-y-auto">
                {itens.map((item, i) => {
                  const restantes = parcelasRestantes(item);
                  const CatIcon = item.categoria ? getCategoryIcon(item.categoria) : null;
                  const catColor = item.categoria ? getCategoryColor(item.categoria) : "bg-muted text-muted-foreground";

                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-3 px-5 py-3 transition-colors",
                        item.duplicado ? "opacity-40" : "hover:bg-muted/30",
                        !item.duplicado && selecionados.has(i) && "bg-primary/3",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                        checked={selecionados.has(i)}
                        disabled={item.duplicado}
                        onChange={() => toggleItem(i)}
                      />

                      {/* Ícone de categoria */}
                      {CatIcon && (
                        <span className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                          catColor,
                        )}>
                          <CatIcon className="h-3.5 w-3.5" />
                        </span>
                      )}

                      <div
                        className={cn("min-w-0 flex-1", !item.duplicado && "cursor-pointer")}
                        onClick={() => toggleItem(i)}
                      >
                        <p className="truncate text-sm font-semibold leading-tight">{item.nome}</p>

                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          {item.dataTexto && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              <CalendarDays className="h-2.5 w-2.5" />
                              {item.dataTexto}
                            </span>
                          )}
                          {restantes && restantes > 1 && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/8 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              <Repeat2 className="h-2.5 w-2.5" />
                              {item.parcelaAtual}/{item.totalParcelas} · {restantes} restantes
                            </span>
                          )}
                          {item.duplicado && (
                            <span className="text-[10px] text-muted-foreground">Já cadastrada</span>
                          )}
                        </div>

                        {!item.duplicado && (
                          <button
                            type="button"
                            onClick={(e) => abrirCategoriaPicker(i, e)}
                            className={cn(
                              "mt-1.5 flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] transition-all hover:bg-muted/60",
                              item.categoria
                                ? "border-primary/25 bg-primary/6 font-medium text-primary hover:border-primary/40"
                                : "border-border bg-background text-muted-foreground",
                            )}
                          >
                            {CatIcon && <CatIcon className="h-2.5 w-2.5" />}
                            <span>{item.categoria || "Definir categoria..."}</span>
                          </button>
                        )}
                      </div>

                      <strong className="mt-0.5 shrink-0 text-sm font-bold text-red-500">
                        {formatCurrency(item.valor)}
                      </strong>
                    </div>
                  );
                })}
              </div>

              {/* Rodapé */}
              <div className="space-y-3 border-t border-border p-5">
                {selecionados.size > 0 && (
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-2.5">
                    <p className="text-xs text-muted-foreground">
                      {selecionados.size} {selecionados.size === 1 ? "despesa selecionada" : "despesas selecionadas"}
                    </p>
                    <p className="text-sm font-bold text-red-500">{formatCurrency(totalSelecionado)}</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/8 px-3.5 py-2.5 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
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
                    className="flex-1 gap-2"
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

      {/* ── Modal de categoria ── */}
      <Dialog open={categoryPickerOpen} onOpenChange={setCategoryPickerOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-sm">
          <div className="relative border-b border-border bg-linear-to-br from-primary/10 via-background to-background px-5 py-4">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
            <DialogHeader className="space-y-0.5 text-left">
              <DialogTitle className="text-sm">Escolher categoria</DialogTitle>
              {itemEmEdicao && (
                <DialogDescription className="truncate text-xs">{itemEmEdicao.nome}</DialogDescription>
              )}
            </DialogHeader>
          </div>

          <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto p-4 pr-3">
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
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", selected ? "bg-primary/15" : color)}>
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
