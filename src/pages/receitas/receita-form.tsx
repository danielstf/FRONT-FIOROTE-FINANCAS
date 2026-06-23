import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lightbulb, Loader2, Repeat2, Save, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../api/errors";
import { receitasApi } from "../../api/receitas/receitas-api";
import type { Receita } from "../../api/receitas/types";
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
import { formatMoneyInput, moneyToInput, parseMoney } from "../../lib/money";
import { normalizeRequiredText, toUppercaseText } from "../../lib/text";
import { useAuth } from "../../providers/auth-provider";

type ReceitaFormProps = {
  mode?: "create" | "edit";
  receita?: Receita | null;
  defaultMonth?: string;
  onSuccess?: (mes: string) => void;
  onCancel?: () => void;
  showSuggestions?: boolean;
};

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function ReceitaForm({
  mode = "create",
  receita,
  defaultMonth,
  onSuccess,
  onCancel,
  showSuggestions = true,
}: ReceitaFormProps) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const isPremium = session?.usuario.plano === "PREMIUM";
  const [nome, setNome] = useState(receita?.nome ? toUppercaseText(receita.nome) : "");
  const [valor, setValor] = useState(receita ? moneyToInput(receita.valor) : "");
  const [mes, setMes] = useState(receita?.mes ?? defaultMonth ?? getCurrentMonth);
  const [fixa, setFixa] = useState(receita?.fixa ?? false);
  const [opcoes, setOpcoes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const data = await receitasApi.listarOpcoes();
        setOpcoes(data.opcoes.map(toUppercaseText));
      } catch {
        setOpcoes([]);
      }
    }

    void carregarOpcoes();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const valorNumerico = parseMoney(valor);
    const nomeNormalizado = normalizeRequiredText(nome);

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }

    if (!nomeNormalizado) {
      toast.error("Informe o nome da receita.");
      return;
    }

    if (fixa && !isPremium) {
      toast.error("Receita fixa é um recurso Premium.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "edit" && receita) {
        await receitasApi.editar(receita.id, {
          nome: nomeNormalizado,
          valor: valorNumerico,
          mes,
          fixa,
        });
      } else {
        await receitasApi.criar({
          nome: nomeNormalizado,
          valor: valorNumerico,
          mes,
          fixa,
        });
      }

      toast.success(mode === "edit" ? "Receita atualizada com sucesso." : "Receita cadastrada com sucesso.");

      if (onSuccess) {
        onSuccess(mes);
        return;
      }

      window.setTimeout(() => navigate(`/app/receitas?mes=${mes}`), 700);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Card className="overflow-hidden border-blue-500/15 shadow-sm">
        <CardHeader className="bg-gradient-to-br from-blue-500/10 via-background to-primary/5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Dados da receita</CardTitle>
              <CardDescription>
                Informe nome, valor e mês de referência da entrada.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="nome-receita">Nome</Label>
              <Input
                id="nome-receita"
                list="opcoes-receita"
                value={nome}
                onChange={(event) => setNome(toUppercaseText(event.target.value))}
                placeholder="Ex: Salário, renda extra, venda"
                required
              />
              <datalist id="opcoes-receita">
                {opcoes.map((opcao) => (
                  <option key={opcao} value={opcao} />
                ))}
              </datalist>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="valor-receita">Valor</Label>
                <Input
                  id="valor-receita"
                  inputMode="decimal"
                  value={valor}
                  onChange={(event) => setValor(formatMoneyInput(event.target.value))}
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Mês</Label>
                <MonthPicker value={mes} onChange={setMes} />
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/35 p-3">
              <input
                type="checkbox"
                checked={fixa}
                disabled={!isPremium}
                onChange={(event) => setFixa(event.target.checked)}
                className="mt-1 h-4 w-4 accent-blue-600 disabled:cursor-not-allowed"
              />
              <span>
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Repeat2 className="h-4 w-4" />
                  Receita fixa
                </span>
                <span className="text-xs text-muted-foreground">
                  {isPremium
                    ? "Use para entradas recorrentes que aparecem todos os meses."
                    : "Disponível somente para usuários Premium."}
                </span>
              </span>
            </label>

            {fixa && (
              <div className="flex items-start gap-2.5 rounded-lg border border-violet-500/25 bg-violet-500/8 p-3 text-xs text-violet-700 dark:text-violet-400">
                <Repeat2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  <strong>Receita fixa</strong> registra automaticamente <strong>60 meses</strong> a partir do mês escolhido.
                  Após o cadastro <strong>não é possível editar</strong> — para alterar, exclua e cadastre uma nova.
                  Ao excluir, esta e todas as recorrências seguintes serão removidas.
                </span>
              </div>
            )}

            {mode === "edit" && receita?.fixa && (
              <div className="flex items-start gap-2.5 rounded-lg border border-violet-500/25 bg-violet-500/8 p-3 text-xs text-violet-700 dark:text-violet-400">
                <Repeat2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  <strong>Receita fixa não pode ser editada.</strong> Para alterar, exclua e cadastre uma nova receita fixa a partir do mês desejado.
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {mode === "edit" ? "Editar" : "Salvar"}
              </Button>
              {!isPremium && (
                <Button asChild type="button" variant="outline">
                  <Link to="/app/premium">Ver Premium</Link>
                </Button>
              )}
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {showSuggestions && (
        <Card className="overflow-hidden border-primary/15 shadow-sm">
          <CardHeader className="bg-muted/35">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Lightbulb className="h-5 w-5" />
              </span>
              <div>
                <CardTitle>Sugestões</CardTitle>
                <CardDescription>Use uma opção salva para preencher rápido.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {opcoes.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setNome(toUppercaseText(opcao))}
                >
                  {opcao}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

