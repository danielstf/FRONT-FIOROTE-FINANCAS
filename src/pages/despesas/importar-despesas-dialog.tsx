import { useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckSquare2,
  FileSpreadsheet,
  Loader2,
  Square,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { despesasApi } from "../../api/despesas/despesas-api";
import type { FormaPagamentoDespesa } from "../../api/despesas/types";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { cn } from "../../lib/utils";
import { formatCurrency, formaPagamentoLabel } from "./utils";

const FORMAS_VALIDAS = new Set<string>([
  "DINHEIRO",
  "CARTAO_CREDITO",
  "CARTAO_DEBITO",
  "VALE_ALIMENTACAO",
  "VALE_REFEICAO",
  "BOLETO",
]);

type LinhaImportacao = {
  nome: string;
  valor: number;
  categoria: string | null;
  formaPagamento: FormaPagamentoDespesa;
  mes: string;
  dataVencimento: string | null;
  paga: boolean;
  fixa: boolean;
};

function unescapeXml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseBrDate(val: string): { mes: string; iso: string } | null {
  const m = val.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, day, month, year] = m;
  return {
    mes: `${year}-${month}`,
    iso: `${year}-${month}-${day}`,   // API espera YYYY-MM-DD, sem hora
  };
}

function parseSpreadsheetML(xml: string, defaultMes: string): LinhaImportacao[] {
  // Localiza a aba "Despesas"
  const wsMatch = xml.match(/<Worksheet ss:Name="Despesas">([\s\S]*?)<\/Worksheet>/);
  if (!wsMatch) return [];

  const worksheet = wsMatch[1];
  // Extrai apenas linhas não auto-fechadas (as linhas de gap são <Row ss:Height="5"/>)
  const rowMatches = [...worksheet.matchAll(/<Row[^/][^>]*>([\s\S]*?)<\/Row>/g)];
  const result: LinhaImportacao[] = [];

  for (const [, rowContent] of rowMatches) {
    // Extrai os valores de cada célula: tipo + conteúdo
    const cells = [...rowContent.matchAll(/<Data ss:Type="([^"]+)">([^<]*)<\/Data>/g)];

    // Linhas de cabeçalho de seção (1 célula com MergeAcross) e linhas de total têm < 6 células
    if (cells.length < 6) continue;

    const nome = unescapeXml(cells[2]?.[2] ?? "").trim();
    const valorStr = cells[5]?.[2] ?? "";
    const isNumber = cells[5]?.[1] === "Number";
    const valor = isNumber ? parseFloat(valorStr) : NaN;

    if (!nome || isNaN(valor) || valor <= 0) continue;

    const formaPagamento = unescapeXml(cells[4]?.[2] ?? "").trim();
    if (!FORMAS_VALIDAS.has(formaPagamento)) continue;

    const dateStr = unescapeXml(cells[1]?.[2] ?? "").trim();
    const parsed = parseBrDate(dateStr);

    result.push({
      nome,
      valor: Math.round(valor * 100) / 100,
      categoria: unescapeXml(cells[3]?.[2] ?? "").trim() || null,
      formaPagamento: formaPagamento as FormaPagamentoDespesa,
      mes: parsed?.mes ?? defaultMes,
      dataVencimento: parsed?.iso ?? null,
      paga: unescapeXml(cells[6]?.[2] ?? "").trim().toLowerCase() === "sim",
      fixa: unescapeXml(cells[7]?.[2] ?? "").trim().toLowerCase() === "sim",
    });
  }

  return result;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMes: string;
  onSuccess: () => void;
};

export function ImportarDespesasDialog({ open, onOpenChange, defaultMes, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [linhas, setLinhas] = useState<LinhaImportacao[]>([]);
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [erro, setErro] = useState<string | null>(null);
  const [importando, setImportando] = useState(false);
  const [step, setStep] = useState<"upload" | "preview">("upload");

  function handleFile(file: File) {
    setErro(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xml = e.target!.result as string;

        if (!xml.includes("<Worksheet")) {
          setErro(
            "Arquivo inválido. Envie um relatório .xls exportado pelo Fiorote.",
          );
          return;
        }

        const parsed = parseSpreadsheetML(xml, defaultMes);

        if (parsed.length === 0) {
          setErro(
            "Nenhuma despesa encontrada. Verifique se o arquivo é um relatório exportado pelo Fiorote.",
          );
          return;
        }

        setLinhas(parsed);
        setSelecionadas(new Set(parsed.map((_, i) => i)));
        setStep("preview");
      } catch {
        setErro(
          "Não foi possível ler o arquivo. Certifique-se de enviar um .xls exportado pelo Fiorote.",
        );
      }
    };
    reader.readAsText(file, "UTF-8");
  }

  function toggleSelecionada(idx: number) {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function toggleTodas() {
    if (selecionadas.size === linhas.length) {
      setSelecionadas(new Set());
    } else {
      setSelecionadas(new Set(linhas.map((_, i) => i)));
    }
  }

  async function importar() {
    const para = linhas.filter((_, i) => selecionadas.has(i));
    if (para.length === 0) return;

    setImportando(true);
    let ok = 0;
    let fail = 0;

    for (const linha of para) {
      try {
        await despesasApi.criar({
          nome: linha.nome,
          valor: linha.valor,
          categoria: linha.categoria,
          formaPagamento: linha.formaPagamento,
          mes: linha.mes,
          dataVencimento: linha.dataVencimento,
          paga: linha.paga,
          fixa: linha.fixa,
        });
        ok++;
      } catch {
        fail++;
      }
    }

    setImportando(false);

    if (fail === 0) {
      toast.success(
        `${ok} despesa${ok !== 1 ? "s" : ""} importada${ok !== 1 ? "s" : ""} com sucesso.`,
      );
      onSuccess();
      fechar();
    } else {
      toast.warning(
        `${ok} importada${ok !== 1 ? "s" : ""}, ${fail} com erro. Verifique os dados.`,
      );
      if (ok > 0) onSuccess();
    }
  }

  function fechar() {
    if (importando) return;
    onOpenChange(false);
    setTimeout(() => {
      setLinhas([]);
      setSelecionadas(new Set());
      setErro(null);
      setStep("upload");
    }, 300);
  }

  const totalSelecionado = linhas
    .filter((_, i) => selecionadas.has(i))
    .reduce((s, l) => s + l.valor, 0);

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <DialogContent className="max-h-[calc(100vh-0.75rem)] max-w-[min(920px,calc(100vw-0.75rem))] gap-3 overflow-y-auto p-4">
        <DialogHeader className="space-y-0.5">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
            Importar despesas
          </DialogTitle>
          <DialogDescription className="text-xs">
            Importe despesas a partir de um relatório Excel exportado pelo Fiorote.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Upload className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Clique ou arraste o arquivo aqui</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Suporta .xls e .xlsx exportados pelo relatório
                </p>
              </div>
            </button>

            <input
              ref={inputRef}
              type="file"
              accept=".xls,.xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />

            {erro && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/8 p-3 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {erro}
              </div>
            )}
          </div>
        )}

        {step === "preview" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{linhas.length}</span>{" "}
                despesa{linhas.length !== 1 ? "s" : ""} encontrada{linhas.length !== 1 ? "s" : ""}{" "}
                •{" "}
                <span className="font-semibold text-foreground">{selecionadas.size}</span>{" "}
                selecionada{selecionadas.size !== 1 ? "s" : ""}
                {selecionadas.size > 0 && (
                  <>
                    {" "}•{" "}
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(totalSelecionado)}
                    </span>
                  </>
                )}
              </p>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                onClick={toggleTodas}
              >
                {selecionadas.size === linhas.length ? (
                  <>
                    <CheckSquare2 className="h-3.5 w-3.5" /> Desmarcar todas
                  </>
                ) : (
                  <>
                    <Square className="h-3.5 w-3.5" /> Selecionar todas
                  </>
                )}
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="w-8 p-2" />
                    <th className="p-2">Nome</th>
                    <th className="hidden p-2 sm:table-cell">Categoria</th>
                    <th className="hidden p-2 sm:table-cell">Forma</th>
                    <th className="p-2">Vencimento</th>
                    <th className="p-2 text-right">Valor</th>
                    <th className="p-2 text-center">Paga</th>
                    <th className="hidden p-2 text-center sm:table-cell">Fixa</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((linha, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "cursor-pointer border-b border-border/50 last:border-0 transition-colors",
                        selecionadas.has(i)
                          ? "hover:bg-primary/8"
                          : "opacity-40 hover:opacity-60",
                      )}
                      onClick={() => toggleSelecionada(i)}
                    >
                      <td className="p-2 text-center">
                        {selecionadas.has(i) ? (
                          <Check className="mx-auto h-3.5 w-3.5 text-primary" />
                        ) : (
                          <X className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </td>
                      <td className="p-2 font-medium text-foreground">{linha.nome}</td>
                      <td className="hidden p-2 text-muted-foreground sm:table-cell">
                        {linha.categoria ?? "—"}
                      </td>
                      <td className="hidden p-2 text-muted-foreground sm:table-cell">
                        {formaPagamentoLabel[linha.formaPagamento]}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {linha.dataVencimento
                          ? `${linha.dataVencimento.slice(8, 10)}/${linha.dataVencimento.slice(5, 7)}`
                          : "—"}
                      </td>
                      <td className="p-2 text-right font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(linha.valor)}
                      </td>
                      <td className="p-2 text-center">
                        {linha.paga ? (
                          <span className="text-emerald-600 dark:text-emerald-400">Sim</span>
                        ) : (
                          <span className="text-muted-foreground">Não</span>
                        )}
                      </td>
                      <td className="hidden p-2 text-center sm:table-cell">
                        {linha.fixa ? (
                          <span className="text-amber-600 dark:text-amber-400">Sim</span>
                        ) : (
                          <span className="text-muted-foreground">Não</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("upload")}
                disabled={importando}
              >
                Voltar
              </Button>
              <Button
                type="button"
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={importar}
                disabled={importando || selecionadas.size === 0}
              >
                {importando && <Loader2 className="h-4 w-4 animate-spin" />}
                <FileSpreadsheet className="h-4 w-4" />
                Importar {selecionadas.size} despesa{selecionadas.size !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
