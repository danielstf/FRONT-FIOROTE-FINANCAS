import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Tags,
  Check,
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
import { DatePicker } from "../../components/date-picker";
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
import { useAuth } from "../../providers/auth-provider";
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
  const { session } = useAuth();
  const isPremium = session?.usuario.plano === "PREMIUM";
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
  const [escopoEdicao, setEscopoEdicao] = useState<"selecionado" | "proximos">(
    "selecionado",
  );
  const [numeroParcelas, setNumeroParcelas] = useState(
    despesa?.numeroParcelas ? String(despesa.numeroParcelas) : "",
  );
  const [categorias, setCategorias] = useState<string[]>(fallbackCategorias);
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"dados" | "categoria">("dados");
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

    if (fixa && parcelas !== undefined) {
      toast.error("Escolha despesa fixa ou parcelada. As duas opções não podem ficar ativas juntas.");
      return;
    }

    if (formaPagamento === "CARTAO_CREDITO" && !cartaoCreditoId) {
      toast.error("Selecione o cartão de crédito desta despesa.");
      return;
    }

    if (fixa && !isPremium) {
      toast.error("Despesa fixa é um recurso Premium.");
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
        if (despesa.fixa && escopoEdicao === "proximos") {
          await despesasApi.excluir(despesa.id, {
            escopo: "todas",
            mes,
          });
          await despesasApi.criar({
            ...payload,
            fixa: true,
            numeroParcelas: undefined,
          });
          toast.success("Despesa atualizada deste mês em diante.");
        } else {
          await despesasApi.editar(despesa.id, payload);
          toast.success("Despesa atualizada com sucesso.");
        }
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

  function irParaCategoria() {
    const valorNumerico = parseMoney(valor);
    const parcelas = numeroParcelas ? Number(numeroParcelas) : undefined;
    const nomeNormalizado = normalizeRequiredText(nome);

    if (!nomeNormalizado) {
      toast.error("Informe o nome da despesa.");
      return;
    }

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }

    if (parcelas !== undefined && (!Number.isInteger(parcelas) || parcelas <= 1)) {
      toast.error("Para parcelar, informe 2 parcelas ou mais.");
      return;
    }

    if (fixa && parcelas !== undefined) {
      toast.error("Escolha despesa fixa ou parcelada antes de continuar.");
      return;
    }

    if (formaPagamento === "CARTAO_CREDITO" && !cartaoCreditoId) {
      toast.error("Selecione o cartão de crédito desta despesa.");
      return;
    }

    if (fixa && !isPremium) {
      toast.error("Despesa fixa é um recurso Premium.");
      return;
    }

    setStep("categoria");
  }

  return (
    <>
      <form className="grid gap-3" onSubmit={handleSubmit}>
      {(mode === "edit" || step === "dados") && (
      <Card className="overflow-hidden border-primary/10 shadow-sm">
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
                <DatePicker
                  id="dataVencimento"
                  value={dataVencimento}
                  onChange={setDataVencimento}
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
              <div className="animate-in fade-in-0 slide-in-from-top-1 space-y-2 rounded-lg border border-border bg-card p-2.5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <Label>Cartão de crédito</Label>
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
                {cartoes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhum cartão cadastrado. Use o botão + para cadastrar sem sair daqui.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
                    {cartoes.map((cartao, index) => {
                      const gradients = [
                        "from-blue-600 via-blue-500 to-blue-400",
                        "from-violet-600 via-violet-500 to-violet-400",
                        "from-rose-600 via-rose-500 to-rose-400",
                        "from-emerald-600 via-emerald-500 to-emerald-400",
                        "from-amber-600 via-amber-500 to-amber-400",
                        "from-cyan-600 via-cyan-500 to-cyan-400",
                        "from-indigo-600 via-indigo-500 to-indigo-400",
                        "from-pink-600 via-pink-500 to-pink-400",
                      ];
                      const gradient = gradients[index % gradients.length];
                      const selected = cartaoCreditoId === cartao.id;
                      return (
                        <button
                          key={cartao.id}
                          type="button"
                          onClick={() => setCartaoCreditoId(cartao.id)}
                          className={cn(
                            `group relative aspect-[1.586/1] overflow-hidden rounded-lg bg-linear-to-br ${gradient} text-white shadow-sm transition-all`,
                            selected
                              ? "ring-2 ring-white/70 ring-offset-1 ring-offset-background brightness-110 scale-[1.04]"
                              : "opacity-55 hover:opacity-80 hover:scale-[1.02]",
                          )}
                        >
                          {/* Círculo decorativo */}
                          <div aria-hidden className="pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full bg-white/12" />
                          <div aria-hidden className="pointer-events-none absolute -bottom-5 -left-5 h-12 w-12 rounded-full bg-black/10" />

                          {/* Chip EMV */}
                          <div className="absolute left-2 top-2 h-2.5 w-3.5 overflow-hidden rounded-sm bg-amber-300/90">
                            <div className="absolute inset-x-0 top-[38%] h-px bg-amber-700/45" />
                            <div className="absolute inset-y-0 left-[40%] w-px bg-amber-700/30" />
                          </div>

                          {/* Nome — destaque principal */}
                          <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
                            <p className="truncate text-[9px] font-extrabold leading-tight tracking-tight">
                              {cartao.nome}
                            </p>
                          </div>

                          {/* Check quando selecionado */}
                          {selected && (
                            <div className="absolute right-1.5 top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-white/40">
                              <Check className="h-2 w-2" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-3 rounded-lg border border-border bg-muted/35 p-2.5 md:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={fixa}
                  disabled={!isPremium}
                  onChange={(event) => {
                    setFixa(event.target.checked);
                    if (event.target.checked) setNumeroParcelas("");
                  }}
                  className="mt-1 h-4 w-4 accent-blue-600 disabled:cursor-not-allowed"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Repeat2 className="h-4 w-4" />
                    Despesa fixa
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isPremium
                      ? "Use para contas recorrentes sem parcelamento."
                      : "Disponível somente para usuários Premium."}
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
                  onChange={(event) => {
                    setNumeroParcelas(event.target.value);
                    if (event.target.value) setFixa(false);
                  }}
                  placeholder="Ex: 6"
                  disabled={mode === "edit" || fixa}
                />
                {fixa && (
                  <p className="text-xs text-muted-foreground">
                    Despesa fixa não pode ser parcelada.
                  </p>
                )}
              </div>
            </div>

            {mode === "edit" && despesa?.fixa && (
              <div className="grid gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                <p className="font-medium text-foreground">Como deseja editar?</p>
                <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-background p-3">
                  <input
                    className="mt-1 h-4 w-4 accent-primary"
                    type="radio"
                    name="escopo-edicao-despesa"
                    checked={escopoEdicao === "selecionado"}
                    onChange={() => setEscopoEdicao("selecionado")}
                  />
                  <span>
                    <span className="block font-medium">Somente a selecionada</span>
                    <span className="text-xs text-muted-foreground">
                      Cria uma alteração apenas para este mês.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-background p-3">
                  <input
                    className="mt-1 h-4 w-4 accent-primary"
                    type="radio"
                    name="escopo-edicao-despesa"
                    checked={escopoEdicao === "proximos"}
                    onChange={() => setEscopoEdicao("proximos")}
                  />
                  <span>
                    <span className="block font-medium">
                      Esta e as próximas
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Mantém meses anteriores e aplica o novo valor daqui para frente.
                    </span>
                  </span>
                </label>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              {mode === "create" ? (
                <Button type="button" onClick={irParaCategoria}>
                  <ArrowRight className="h-4 w-4" />
                  Próximo
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Editar
                </Button>
              )}
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
      )}

      {(mode === "edit" || step === "categoria") && (
      <Card className="self-start overflow-hidden border-primary/10 shadow-sm">
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
          {mode === "create" && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/35 p-2 text-xs text-muted-foreground">
              <span>Etapa 2 de 2</span>
              <Button className="h-8 px-2 text-xs" type="button" variant="outline" onClick={() => setStep("dados")}>
                Voltar aos dados
              </Button>
            </div>
          )}
          <div className="grid max-h-[40vh] grid-cols-2 gap-1.5 overflow-y-auto rounded-lg border border-border bg-muted/25 p-1.5 sm:grid-cols-3">
            {categorias.map((opcao) => {
              const Icon = getCategoryIcon(opcao);
              const selected = categoria === opcao;

              return (
                <button
                  key={opcao}
                  type="button"
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg border border-border bg-background px-2.5 py-2.5 text-left shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5",
                    selected &&
                      "border-primary/50 bg-primary/8 ring-2 ring-primary/15",
                  )}
                  onClick={() => setCategoria(toUppercaseText(opcao))}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                      getCategoryColor(opcao),
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 truncate text-xs font-medium leading-snug">
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
          {mode === "create" && (
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setStep("dados")}>
                Voltar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      )}

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
