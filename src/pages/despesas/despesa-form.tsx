import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Repeat2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { cartoesApi } from "../../api/cartoes/cartoes-api";
import type { CartaoCredito } from "../../api/cartoes/types";
import type { Despesa, FormaPagamentoDespesa } from "../../api/despesas/types";
import { despesasApi } from "../../api/despesas/despesas-api";
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import {
  normalizeOptionalText,
  normalizeRequiredText,
  toUppercaseText,
} from "../../lib/text";
import { formatMoneyInput } from "../../lib/money";
import { cn } from "../../lib/utils";
import { defaultExpenseCategories, getCategoryIcon } from "./category-icons";
import {
  dateToMonth,
  getCurrentMonth,
  moneyToInput,
  parseMoney,
} from "./utils";

type DespesaFormProps = {
  mode: "create" | "edit";
  despesa?: Despesa | null;
  defaultMonth?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const fallbackCategorias = defaultExpenseCategories.map(toUppercaseText);

export function DespesaForm({
  mode,
  despesa,
  defaultMonth,
  onSuccess,
  onCancel,
}: DespesaFormProps) {
  const navigate = useNavigate();
  const [nome, setNome] = useState(despesa?.nome ? toUppercaseText(despesa.nome) : "");
  const [valor, setValor] = useState(despesa ? moneyToInput(despesa.valor) : "");
  const [categoria, setCategoria] = useState(
    despesa?.categoria ? toUppercaseText(despesa.categoria) : "",
  );
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoDespesa>(
    despesa?.formaPagamento ?? "DINHEIRO",
  );
  const [cartaoCreditoId, setCartaoCreditoId] = useState(despesa?.cartaoCreditoId ?? "");
  const [mes, setMes] = useState(
    despesa?.mesReferencia
      ? dateToMonth(despesa.mesReferencia)
      : defaultMonth || getCurrentMonth(),
  );
  const [dataVencimento, setDataVencimento] = useState(
    despesa?.dataVencimento ? despesa.dataVencimento.slice(0, 10) : "",
  );
  const [fixa, setFixa] = useState(despesa?.fixa ?? false);
  const [numeroParcelas, setNumeroParcelas] = useState(
    despesa?.numeroParcelas ? String(despesa.numeroParcelas) : "",
  );
  const [categorias, setCategorias] = useState<string[]>(fallbackCategorias);
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const data = await despesasApi.listarOpcoes();
        setCategorias(
          Array.from(new Set([...data.categorias, ...fallbackCategorias].map(toUppercaseText))),
        );
      } catch {
        setCategorias(fallbackCategorias);
      }
    }

    void carregarOpcoes();
  }, []);

  useEffect(() => {
    async function carregarCartoes() {
      try {
        const data = await cartoesApi.listar();
        setCartoes(
          data.cartoes.map((cartao) => ({
            ...cartao,
            nome: toUppercaseText(cartao.nome),
          })),
        );
      } catch {
        setCartoes([]);
      }
    }

    void carregarCartoes();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const valorNumerico = parseMoney(valor);
    const parcelas = numeroParcelas ? Number(numeroParcelas) : undefined;
    const nomeNormalizado = normalizeRequiredText(nome);
    const categoriaNormalizada = normalizeOptionalText(categoria);

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setError("Informe um valor maior que zero.");
      toast.error("Informe um valor maior que zero.");
      return;
    }

    if (!nomeNormalizado) {
      setError("Informe o nome da despesa.");
      toast.error("Informe o nome da despesa.");
      return;
    }

    if (parcelas !== undefined && (!Number.isInteger(parcelas) || parcelas <= 1)) {
      setError("Para parcelar, informe 2 parcelas ou mais.");
      toast.error("Para parcelar, informe 2 parcelas ou mais.");
      return;
    }

    if (formaPagamento === "CARTAO_CREDITO" && !cartaoCreditoId) {
      setError("Selecione o cartao de credito desta despesa.");
      toast.error("Selecione o cartão de crédito desta despesa.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome: nomeNormalizado,
        valor: valorNumerico,
        categoria: categoriaNormalizada,
        formaPagamento,
        cartaoCreditoId:
          formaPagamento === "CARTAO_CREDITO" ? cartaoCreditoId : null,
        mes,
        dataVencimento: dataVencimento || null,
        fixa,
        numeroParcelas: mode === "create" ? parcelas : undefined,
      };

      if (mode === "edit" && despesa) {
        await despesasApi.editar(despesa.id, payload);
        setMessage("Despesa atualizada com sucesso.");
        toast.success("Despesa atualizada com sucesso.");
      } else {
        await despesasApi.criar(payload);
        setMessage(
          parcelas ? "Despesas parceladas cadastradas com sucesso." : "Despesa cadastrada com sucesso.",
        );
        toast.success(
          parcelas
            ? "Despesas parceladas cadastradas com sucesso."
            : "Despesa cadastrada com sucesso.",
        );
      }

      if (onSuccess) {
        onSuccess();
        return;
      }

      window.setTimeout(() => navigate("/app/despesas"), 700);
    } catch (requestError) {
      const errorMessage = getApiErrorMessage(requestError);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]"
      onSubmit={handleSubmit}
    >
      <Card className="overflow-hidden shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Dados da despesa</CardTitle>
              <CardDescription>
                Cadastre vencimento, mes de referencia, recorrencia e parcelamento.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(180px,0.65fr)]">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(event) => setNome(toUppercaseText(event.target.value))}
                  placeholder="Ex: Internet, aluguel, mercado"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  inputMode="decimal"
                  value={valor}
                  onChange={(event) => setValor(formatMoneyInput(event.target.value))}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 rounded-lg border border-border bg-muted/35 p-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label>Mes de referencia</Label>
                <MonthPicker value={mes} onChange={setMes} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Vencimento</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  value={dataVencimento}
                  onChange={(event) => setDataVencimento(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma</Label>
                <Select
                  id="formaPagamento"
                  value={formaPagamento}
                  onChange={(event) => {
                    const value = event.target.value as FormaPagamentoDespesa;
                    setFormaPagamento(value);
                    if (value === "DINHEIRO") setCartaoCreditoId("");
                  }}
                >
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="CARTAO_CREDITO">Cartão de crédito</option>
                </Select>
              </div>
            </div>

            {formaPagamento === "CARTAO_CREDITO" && (
              <div className="animate-in fade-in-0 slide-in-from-top-1 space-y-2 rounded-lg border border-border bg-card p-4 shadow-sm">
                <Label htmlFor="cartaoCreditoId">Cartão de crédito</Label>
                <Select
                  id="cartaoCreditoId"
                  value={cartaoCreditoId}
                  onChange={(event) => setCartaoCreditoId(event.target.value)}
                  required
                >
                  <option value="">Selecione um cartão</option>
                  {cartoes.map((cartao) => (
                    <option key={cartao.id} value={cartao.id}>
                      {cartao.nome}
                    </option>
                  ))}
                </Select>
                {cartoes.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Cadastre um cartão em Cartões para usar despesas no crédito.
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 rounded-lg border border-border bg-muted/35 p-4 md:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={fixa}
                  onChange={(event) => setFixa(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-emerald-600"
                  disabled={Boolean(numeroParcelas)}
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Repeat2 className="h-4 w-4" />
                    Despesa fixa
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Use para contas recorrentes sem parcelamento.
                  </span>
                </span>
              </label>

              <div className="space-y-2">
                <Label htmlFor="numeroParcelas">Parcelas</Label>
                <Input
                  id="numeroParcelas"
                  type="number"
                  min="2"
                  value={numeroParcelas}
                  onChange={(event) => {
                    setNumeroParcelas(event.target.value);
                    if (event.target.value) setFixa(false);
                  }}
                  placeholder="Ex: 6"
                  disabled={mode === "edit"}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary">
                {message}
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {mode === "edit" ? "Salvar alteracoes" : "Salvar despesa"}
              </Button>
              {onCancel ? (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/app/despesas">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="self-start overflow-hidden shadow-sm lg:sticky lg:top-4">
        <CardHeader className="p-5">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle>Categoria</CardTitle>
              <CardDescription>
                Escolha um tipo para organizar melhor seus relatorios.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-5 pt-0">
          <div className="grid max-h-[min(52vh,520px)] gap-2 overflow-y-auto rounded-lg border border-border bg-muted/25 p-2 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
            {categorias.map((opcao) => {
              const Icon = getCategoryIcon(opcao);
              const selected = categoria === opcao;

              return (
                <button
                  key={opcao}
                  type="button"
                  className={cn(
                    "group flex min-h-12 items-center gap-3 rounded-md border border-border bg-background p-2.5 text-left text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-destructive/35 hover:bg-destructive/5 hover:shadow-md",
                    selected &&
                      "border-destructive/50 bg-destructive/10 text-destructive ring-2 ring-destructive/10",
                  )}
                  onClick={() => setCategoria(toUppercaseText(opcao))}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-destructive/10 group-hover:text-destructive",
                      selected && "bg-destructive/10 text-destructive",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 truncate font-medium">{opcao}</span>
                </button>
              );
            })}
          </div>
          <Input
            value={categoria}
            onChange={(event) => setCategoria(toUppercaseText(event.target.value))}
            placeholder="Ou digite uma categoria personalizada"
          />
        </CardContent>
      </Card>
    </form>
  );
}
