import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Tags,
  CreditCard,
  Loader2,
  Plus,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  normalizeOptionalText,
  normalizeRequiredText,
  toUppercaseText,
} from "../../lib/text";
import { formatMoneyInput } from "../../lib/money";
import { cn } from "../../lib/utils";
import {
  defaultExpenseCategories,
  getCategoryColor,
  getCategoryIcon,
} from "./category-icons";
import {
  dateToMonth,
  formasPagamentoOptions,
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

function getCategoriaKey(categoria: string) {
  return categoria
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function mergeCategorias(categoriasApi: string[]) {
  const categoriasUnicas = new Map<string, string>();

  [...categoriasApi, ...fallbackCategorias].forEach((categoria) => {
    const categoriaNormalizada = toUppercaseText(categoria);
    const key = getCategoriaKey(categoriaNormalizada);

    if (key && !categoriasUnicas.has(key)) {
      categoriasUnicas.set(key, categoriaNormalizada);
    }
  });

  return Array.from(categoriasUnicas.values());
}

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
  const [cartaoModalAberto, setCartaoModalAberto] = useState(false);
  const [novoCartaoNome, setNovoCartaoNome] = useState("");
  const [salvandoCartao, setSalvandoCartao] = useState(false);

  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const data = await despesasApi.listarOpcoes();
        setCategorias(mergeCategorias(data.categorias));
      } catch {
        setCategorias(fallbackCategorias);
      }
    }

    void carregarOpcoes();
  }, []);

  useEffect(() => {
    void carregarCartoes();
  }, []);

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

  async function cadastrarCartao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nomeNormalizado = normalizeRequiredText(novoCartaoNome);

    if (!nomeNormalizado) {
      toast.error("Informe o nome do cartão.");
      return;
    }

    setSalvandoCartao(true);

    try {
      const cartao = await cartoesApi.criar({ nome: nomeNormalizado });
      const cartaoNormalizado = {
        ...cartao,
        nome: toUppercaseText(cartao.nome),
      };

      setCartoes((current) => [cartaoNormalizado, ...current]);
      setCartaoCreditoId(cartao.id);
      setNovoCartaoNome("");
      setCartaoModalAberto(false);
      toast.success("Cartão cadastrado com sucesso.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSalvandoCartao(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const valorNumerico = parseMoney(valor);
    const parcelas = numeroParcelas ? Number(numeroParcelas) : undefined;
    const nomeNormalizado = normalizeRequiredText(nome);
    const categoriaNormalizada = normalizeOptionalText(categoria);

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }

    if (!nomeNormalizado) {
      toast.error("Informe o nome da despesa.");
      return;
    }

    if (parcelas !== undefined && (!Number.isInteger(parcelas) || parcelas <= 1)) {
      toast.error("Para parcelar, informe 2 parcelas ou mais.");
      return;
    }

    if (formaPagamento === "CARTAO_CREDITO" && !cartaoCreditoId) {
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
        toast.success("Despesa atualizada com sucesso.");
      } else {
        await despesasApi.criar(payload);
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
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="grid gap-3" onSubmit={handleSubmit}>
      <Card className="order-2 overflow-hidden shadow-sm">
        <CardHeader className="p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <CreditCard className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-base uppercase tracking-normal">
                Dados da despesa
              </CardTitle>
              <CardDescription className="text-xs">
                Cadastre vencimento, mês de referência, recorrência e parcelamento.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1.35fr)_minmax(160px,0.65fr)]">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(event) => setNome(toUppercaseText(event.target.value))}
                  placeholder="Ex: Internet, aluguel, mercado"
                  required
                />
              </div>
              <div className="space-y-1.5">
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

            <div className="grid gap-3 rounded-lg border border-border bg-muted/35 p-2.5 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Mês de referência</Label>
                <MonthPicker value={mes} onChange={setMes} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dataVencimento">Vencimento</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  value={dataVencimento}
                  onChange={(event) => setDataVencimento(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="formaPagamento">Forma</Label>
                <Select
                  id="formaPagamento"
                  value={formaPagamento}
                  onChange={(event) => {
                    const value = event.target.value as FormaPagamentoDespesa;
                    setFormaPagamento(value);
                    if (value !== "CARTAO_CREDITO") setCartaoCreditoId("");
                  }}
                >
                  {formasPagamentoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {formaPagamento === "CARTAO_CREDITO" && (
              <div className="animate-in fade-in-0 slide-in-from-top-1 space-y-1.5 rounded-lg border border-border bg-card p-2.5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="cartaoCreditoId">Cartão de crédito</Label>
                  <Button
                    className="h-8 px-2 text-xs"
                    type="button"
                    variant="outline"
                    onClick={() => setCartaoModalAberto(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Novo cartão
                  </Button>
                </div>
                <div className="flex gap-2">
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
                    <Button
                      aria-label="Cadastrar cartão"
                      className="h-10 w-10 shrink-0 px-0"
                      type="button"
                      onClick={() => setCartaoModalAberto(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {cartoes.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Nenhum cartão cadastrado. Use o botão de + para cadastrar sem sair daqui.
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-3 rounded-lg border border-border bg-muted/35 p-2.5 md:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={fixa}
                  onChange={(event) => setFixa(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-emerald-600"
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

              <div className="space-y-1.5">
                <Label htmlFor="numeroParcelas">Parcelas</Label>
                <Input
                  id="numeroParcelas"
                  type="number"
                  min="2"
                  value={numeroParcelas}
                  onChange={(event) => setNumeroParcelas(event.target.value)}
                  placeholder="Ex: 6"
                  disabled={mode === "edit"}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {mode === "edit" ? "Salvar alterações" : "Salvar despesa"}
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

      <Card className="order-1 self-start overflow-hidden shadow-sm">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Tags className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <CardTitle className="text-base uppercase tracking-normal">
                Categoria
              </CardTitle>
              <CardDescription className="text-xs">
                Escolha uma categoria para organizar seus relatórios.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0">
          <div className="grid max-h-[26vh] gap-1.5 overflow-y-auto rounded-lg border border-border bg-muted/25 p-1.5 sm:grid-cols-4 lg:grid-cols-8 xl:grid-cols-10">
            {categorias.map((opcao) => {
              const Icon = getCategoryIcon(opcao);
              const selected = categoria === opcao;

              return (
                <button
                  key={opcao}
                  type="button"
                  className={cn(
                    "group flex min-h-7 items-center gap-1 rounded-md border border-border bg-background px-1 py-0.5 text-left leading-none shadow-sm transition-all hover:border-destructive/35 hover:bg-destructive/5",
                    selected &&
                      "border-destructive/50 bg-destructive/10 text-destructive ring-2 ring-destructive/10",
                  )}
                  onClick={() => setCategoria(toUppercaseText(opcao))}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors",
                      getCategoryColor(opcao),
                      selected && "ring-2 ring-destructive/20",
                    )}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                  <span className="min-w-0 truncate text-[9px] font-medium uppercase leading-none">
                    {opcao}
                  </span>
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

      <Dialog open={cartaoModalAberto} onOpenChange={setCartaoModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo cartão</DialogTitle>
            <DialogDescription>
              Cadastre um cartão para usar nesta despesa no crédito.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={cadastrarCartao}>
            <div className="space-y-2">
              <Label htmlFor="novo-cartao-nome">Nome do cartão</Label>
              <Input
                id="novo-cartao-nome"
                value={novoCartaoNome}
                onChange={(event) =>
                  setNovoCartaoNome(toUppercaseText(event.target.value))
                }
                placeholder="Ex: Nubank, Itaú, Caixa"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCartaoModalAberto(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={salvandoCartao}>
                {salvandoCartao ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Cadastrar cartão
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
