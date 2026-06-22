import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Check,
  CheckSquare2,
  CreditCard,
  Crown,
  FileSpreadsheet,
  Loader2,
  Square,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cartoesApi } from "../../api/cartoes/cartoes-api";
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
import { hasPremiumAtivo } from "../../lib/premium";
import { cn } from "../../lib/utils";
import { useAuth } from "../../providers/auth-provider";
import { formatCurrency } from "./utils";

const STANDARD_SHEETS = new Set(["Resumo", "Receitas", "Despesas"]);

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
  cartaoNome: string | null;
  mes: string;
  dataVencimento: string;
  paga: boolean;
  fixa: boolean;
  duplicata: boolean;
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
  return { mes: `${year}-${month}`, iso: `${year}-${month}-${day}` };
}

const PT_MONTHS: Record<string, string> = {
  janeiro: "01", fevereiro: "02", março: "03", abril: "04",
  maio: "05", junho: "06", julho: "07", agosto: "08",
  setembro: "09", outubro: "10", novembro: "11", dezembro: "12",
};

// Parses section headers like "Julho de 2026 — 3 lançamento(s)" → "2026-07"
function parseSectionMes(text: string): string | null {
  const m = text.match(/^(\w+)(?:\s+de)?\s+(\d{4})/i);
  if (!m) return null;
  const num = PT_MONTHS[m[1].toLowerCase()];
  return num ? `${m[2]}-${num}` : null;
}

function getWorksheet(xml: string, xmlName: string): string | null {
  const esc = xmlName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = xml.match(new RegExp(`<Worksheet ss:Name="${esc}">[\\s\\S]*?<\\/Worksheet>`));
  return m ? m[0] : null;
}

function getRows(wsXml: string): RegExpMatchArray[] {
  return [...wsXml.matchAll(/<Row[^/][^>]*>([\s\S]*?)<\/Row>/g)];
}

function getCells(rowContent: string): RegExpMatchArray[] {
  return [...rowContent.matchAll(/<Data ss:Type="([^"]+)">([^<]*)<\/Data>/g)];
}

function parseDespesasSheet(
  xml: string,
  defaultMes: string,
): Omit<LinhaImportacao, "duplicata">[] {
  const ws = getWorksheet(xml, "Despesas");
  if (!ws) return [];
  const result: Omit<LinhaImportacao, "duplicata">[] = [];
  let sectionMes = defaultMes;
  for (const [, row] of getRows(ws)) {
    const cells = getCells(row);
    // Section header: 1 cell like "Julho de 2026 — N lançamento(s)"
    if (cells.length === 1) {
      sectionMes =
        parseSectionMes(unescapeXml(cells[0]?.[2] ?? "")) ?? sectionMes;
      continue;
    }
    if (cells.length < 6) continue;
    const nome = unescapeXml(cells[2]?.[2] ?? "").trim();
    const valor =
      cells[5]?.[1] === "Number" ? parseFloat(cells[5]?.[2] ?? "") : NaN;
    if (!nome || isNaN(valor) || valor <= 0) continue;
    const fp = unescapeXml(cells[4]?.[2] ?? "").trim();
    if (!FORMAS_VALIDAS.has(fp)) continue;
    const pd = parseBrDate(unescapeXml(cells[1]?.[2] ?? "").trim());
    if (!pd) continue;
    result.push({
      nome,
      valor: Math.round(valor * 100) / 100,
      categoria: unescapeXml(cells[3]?.[2] ?? "").trim() || null,
      formaPagamento: fp as FormaPagamentoDespesa,
      cartaoNome: null,
      mes: pd.mes,
      dataVencimento: pd.iso,
      paga: unescapeXml(cells[6]?.[2] ?? "").trim().toLowerCase() === "sim",
      fixa: unescapeXml(cells[7]?.[2] ?? "").trim().toLowerCase() === "sim",
    });
  }
  return result;
}

// Card sheets: col 0=Mês, 1=Vencimento, 2=Nome(String), 3=Categoria, 4=Valor(Number), 5=Pago, 6=Vencida, 7=Fixa
function parseCartoesSheets(
  xml: string,
  defaultMes: string,
): Map<string, Omit<LinhaImportacao, "duplicata">[]> {
  const wsNames = [...xml.matchAll(/<Worksheet ss:Name="([^"]+)"/g)].map(
    (m) => m[1],
  );
  const cartaoXmlNames = wsNames.filter(
    (n) => !STANDARD_SHEETS.has(unescapeXml(n)),
  );
  const result = new Map<string, Omit<LinhaImportacao, "duplicata">[]>();
  for (const xmlName of cartaoXmlNames) {
    const displayName = unescapeXml(xmlName);
    const ws = getWorksheet(xml, xmlName);
    if (!ws) continue;
    const purchases: Omit<LinhaImportacao, "duplicata">[] = [];
    let sectionMes = defaultMes;
    for (const [, row] of getRows(ws)) {
      const cells = getCells(row);
      // Section header: 1 cell like "Julho de 2026 — N lançamento(s)"
      if (cells.length === 1) {
        sectionMes =
          parseSectionMes(unescapeXml(cells[0]?.[2] ?? "")) ?? sectionMes;
        continue;
      }
      if (cells.length < 5) continue;
      const nome = unescapeXml(cells[2]?.[2] ?? "").trim();
      // Filters out header rows ("Nome") and total rows (cells[2] is Number)
      if (!nome || cells[2]?.[1] !== "String") continue;
      const valor =
        cells[4]?.[1] === "Number" ? parseFloat(cells[4]?.[2] ?? "") : NaN;
      if (isNaN(valor) || valor <= 0) continue;
      const pd = parseBrDate(unescapeXml(cells[1]?.[2] ?? "").trim());
      if (!pd) continue;
      purchases.push({
        nome,
        valor: Math.round(valor * 100) / 100,
        categoria: unescapeXml(cells[3]?.[2] ?? "").trim() || null,
        formaPagamento: "CARTAO_CREDITO",
        cartaoNome: displayName,
        mes: pd.mes,
        dataVencimento: pd.iso,
        paga: unescapeXml(cells[5]?.[2] ?? "").trim().toLowerCase() === "sim",
        fixa: unescapeXml(cells[7]?.[2] ?? "").trim().toLowerCase() === "sim",
      });
    }
    if (purchases.length > 0) result.set(displayName, purchases);
  }
  return result;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMes: string;
  onSuccess: () => void;
};

export function ImportarDespesasDialog({
  open,
  onOpenChange,
  defaultMes,
  onSuccess,
}: Props) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "carregando" | "preview">(
    "upload",
  );
  const [loadingMsg, setLoadingMsg] = useState("");
  const [linhas, setLinhas] = useState<LinhaImportacao[]>([]);
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [novosCartoes, setNovosCartoes] = useState<Set<string>>(new Set());
  const [erro, setErro] = useState<string | null>(null);
  const [importando, setImportando] = useState(false);
  const [progresso, setProgresso] = useState<{
    atual: number;
    total: number;
  } | null>(null);

  const isPremium = hasPremiumAtivo(session?.usuario);

  async function handleFile(file: File) {
    setErro(null);
    setStep("carregando");
    setLoadingMsg("Lendo arquivo...");
    try {
      const xml = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target!.result as string);
        reader.onerror = reject;
        reader.readAsText(file, "UTF-8");
      });

      if (!xml.includes("<Worksheet")) {
        setErro(
          "Arquivo inválido. Envie um relatório .xls exportado pelo Fiorote.",
        );
        setStep("upload");
        return;
      }

      const diretas = parseDespesasSheet(xml, defaultMes);
      const porCartao = parseCartoesSheets(xml, defaultMes);

      const allRaw: Omit<LinhaImportacao, "duplicata">[] = [
        ...diretas,
        ...[...porCartao.values()].flat(),
      ];

      if (allRaw.length === 0) {
        setErro(
          "Nenhuma despesa encontrada. Verifique se o arquivo é um relatório exportado pelo Fiorote.",
        );
        setStep("upload");
        return;
      }

      setLoadingMsg("Verificando duplicatas e cartões...");

      const meses = [...new Set(allRaw.map((l) => l.mes))];
      const [despesasByMes, cartoesRes] = await Promise.all([
        Promise.all(
          meses.map((mes) => despesasApi.listar({ mes }).then((r) => r.despesas)),
        ),
        cartoesApi.listar(),
      ]);

      const existingKeys = new Set<string>();
      for (const list of despesasByMes) {
        for (const d of list) {
          const mesDespesa = d.mesReferencia.slice(0, 7);
          existingKeys.add(
            `${d.nome.toLowerCase().trim()}|${mesDespesa}|${d.valor}`,
          );
        }
      }

      const existingCardNamesLower = new Set(
        cartoesRes.cartoes.map((c) => c.nome.toLowerCase()),
      );
      const novos = new Set<string>();
      for (const [cardName] of porCartao) {
        if (!existingCardNamesLower.has(cardName.toLowerCase()))
          novos.add(cardName);
      }

      const linhasComDup: LinhaImportacao[] = allRaw.map((l) => ({
        ...l,
        duplicata: existingKeys.has(
          `${l.nome.toLowerCase().trim()}|${l.mes}|${l.valor}`,
        ),
      }));

      setLinhas(linhasComDup);
      setSelecionadas(
        new Set(
          linhasComDup
            .map((l, i) => (l.duplicata ? -1 : i))
            .filter((i) => i >= 0),
        ),
      );
      setNovosCartoes(novos);
      setStep("preview");
    } catch {
      setErro(
        "Não foi possível ler o arquivo. Certifique-se de enviar um .xls exportado pelo Fiorote.",
      );
      setStep("upload");
    }
  }

  function toggleSelecionada(idx: number) {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  function toggleNovas() {
    const indicesNovos = linhas
      .map((l, i) => (l.duplicata ? -1 : i))
      .filter((i) => i >= 0);
    const todasNovasSelecionadas = indicesNovos.every((i) =>
      selecionadas.has(i),
    );
    setSelecionadas(todasNovasSelecionadas ? new Set() : new Set(indicesNovos));
  }

  async function importar() {
    const para = linhas.filter((_, i) => selecionadas.has(i));
    if (para.length === 0) return;

    setImportando(true);
    setProgresso({ atual: 0, total: para.length });

    // Resolve card name → id, creating new cards as needed
    const cardMap = new Map<string, string>();
    try {
      const existingCartoes = await cartoesApi.listar();
      for (const c of existingCartoes.cartoes)
        cardMap.set(c.nome.toLowerCase(), c.id);
    } catch {
      // ignore — individual card creation below will still attempt
    }
    for (const cardName of novosCartoes) {
      if (!cardMap.has(cardName.toLowerCase())) {
        try {
          const newCard = await cartoesApi.criar({ nome: cardName });
          cardMap.set(cardName.toLowerCase(), newCard.id);
        } catch {
          // purchases for this card will individually fail below
        }
      }
    }

    let ok = 0;
    let fail = 0;
    for (let i = 0; i < para.length; i++) {
      const linha = para[i];
      setProgresso({ atual: i + 1, total: para.length });
      try {
        const cartaoCreditoId = linha.cartaoNome
          ? (cardMap.get(linha.cartaoNome.toLowerCase()) ?? null)
          : null;
        await despesasApi.criar({
          nome: linha.nome,
          valor: linha.valor,
          categoria: linha.categoria,
          formaPagamento: linha.formaPagamento,
          cartaoCreditoId,
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
    setProgresso(null);

    if (fail === 0) {
      toast.success(
        `${ok} despesa${ok !== 1 ? "s" : ""} importada${ok !== 1 ? "s" : ""} com sucesso.`,
      );
      onSuccess();
      fechar();
    } else {
      toast.warning(`${ok} importada${ok !== 1 ? "s" : ""}, ${fail} com erro.`);
      if (ok > 0) onSuccess();
    }
  }

  function fechar() {
    if (importando) return;
    onOpenChange(false);
    setTimeout(() => {
      setLinhas([]);
      setSelecionadas(new Set());
      setNovosCartoes(new Set());
      setErro(null);
      setStep("upload");
      setProgresso(null);
    }, 300);
  }

  const totalSelecionado = linhas
    .filter((_, i) => selecionadas.has(i))
    .reduce((s, l) => s + l.valor, 0);
  const qtdDuplicatas = linhas.filter((l) => l.duplicata).length;

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <DialogContent className="max-h-[calc(100vh-0.75rem)] max-w-[min(960px,calc(100vw-0.75rem))] gap-3 overflow-y-auto p-4">
        <DialogHeader className="space-y-0.5">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
            Importar despesas
          </DialogTitle>
          <DialogDescription className="text-xs">
            Importe despesas a partir de um relatório Excel exportado pelo
            Fiorote.
          </DialogDescription>
        </DialogHeader>

        {!isPremium ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950">
              <Crown className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                Recurso exclusivo Premium
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                A importação de despesas está disponível apenas para
                assinantes Premium.
              </p>
            </div>
            <Button
              className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
              onClick={() => {
                fechar();
                navigate("/app/premium");
              }}
            >
              <Crown className="h-4 w-4" />
              Conhecer o Premium
            </Button>
          </div>
        ) : step === "upload" ? (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Upload className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Clique ou arraste o arquivo aqui
                </p>
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
                const f = e.target.files?.[0];
                if (f) handleFile(f);
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
        ) : step === "carregando" ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{loadingMsg}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {linhas.length}
                  </span>{" "}
                  encontrada{linhas.length !== 1 ? "s" : ""} •{" "}
                  <span className="font-semibold text-primary">
                    {selecionadas.size}
                  </span>{" "}
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
                {qtdDuplicatas > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {qtdDuplicatas} já exist{qtdDuplicatas !== 1 ? "em" : "e"} e{" "}
                    foi{qtdDuplicatas !== 1 ? "ram" : ""} desmarcada
                    {qtdDuplicatas !== 1 ? "s" : ""}
                  </p>
                )}
                {novosCartoes.size > 0 && (
                  <p className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <CreditCard className="h-3 w-3" />
                    {novosCartoes.size === 1 ? "1 cartão novo" : `${novosCartoes.size} cartões novos`}{" "}
                    será{novosCartoes.size !== 1 ? "ão" : ""} criado
                    {novosCartoes.size !== 1 ? "s" : ""}:{" "}
                    {[...novosCartoes].join(", ")}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                onClick={toggleNovas}
              >
                {selecionadas.size > 0 ? (
                  <>
                    <CheckSquare2 className="h-3.5 w-3.5" /> Desmarcar novas
                  </>
                ) : (
                  <>
                    <Square className="h-3.5 w-3.5" /> Selecionar novas
                  </>
                )}
              </button>
            </div>

            <div className="max-h-100 overflow-y-auto rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="w-8 p-2" />
                    <th className="p-2">Nome</th>
                    <th className="hidden p-2 lg:table-cell">Origem</th>
                    <th className="hidden p-2 sm:table-cell">Categoria</th>
                    <th className="p-2">Vencimento</th>
                    <th className="p-2 text-right">Valor</th>
                    <th className="p-2 text-center">Paga</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((linha, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "cursor-pointer border-b border-border/50 last:border-0 transition-colors",
                        selecionadas.has(i)
                          ? "hover:bg-primary/5"
                          : "opacity-40 hover:opacity-60",
                        linha.duplicata && "bg-amber-500/5",
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
                      <td className="p-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-medium text-foreground">
                            {linha.nome}
                          </span>
                          {linha.duplicata && (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                              Já existe
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="hidden p-2 lg:table-cell">
                        {linha.cartaoNome ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CreditCard className="h-3 w-3 shrink-0" />
                            <span>{linha.cartaoNome}</span>
                            {novosCartoes.has(linha.cartaoNome) && (
                              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                                Novo
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60">
                            Direto
                          </span>
                        )}
                      </td>
                      <td className="hidden p-2 text-muted-foreground sm:table-cell">
                        {linha.categoria ?? "—"}
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
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Sim
                          </span>
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
                {importando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {progresso
                      ? `Importando ${progresso.atual} de ${progresso.total}...`
                      : "Importando..."}
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    Importar {selecionadas.size} despesa
                    {selecionadas.size !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
