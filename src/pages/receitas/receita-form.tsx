import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Loader2, Save, TrendingUp } from "lucide-react";
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
import { normalizeRequiredText, toUppercaseText } from "../../lib/text";

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

function parseMoney(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

function moneyToInput(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
  const [nome, setNome] = useState(receita?.nome ? toUppercaseText(receita.nome) : "");
  const [valor, setValor] = useState(receita ? moneyToInput(receita.valor) : "");
  const [mes, setMes] = useState(receita?.mes ?? defaultMonth ?? getCurrentMonth);
  const [opcoes, setOpcoes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
    setError("");
    setMessage("");

    const valorNumerico = parseMoney(valor);
    const nomeNormalizado = normalizeRequiredText(nome);

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    if (!nomeNormalizado) {
      setError("Informe o nome da receita.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "edit" && receita) {
        await receitasApi.editar(receita.id, {
          nome: nomeNormalizado,
          valor: valorNumerico,
          mes,
        });
      } else {
        await receitasApi.criar({
          nome: nomeNormalizado,
          valor: valorNumerico,
          mes,
        });
      }

      setMessage(
        mode === "edit"
          ? "Receita atualizada com sucesso."
          : "Receita cadastrada com sucesso.",
      );

      if (onSuccess) {
        onSuccess(mes);
        return;
      }

      window.setTimeout(() => navigate(`/app/receitas?mes=${mes}`), 700);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Dados da receita</CardTitle>
              <CardDescription>
                Informe nome, valor e mes de referencia da entrada.
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
                placeholder="Ex: Salario, renda extra, venda"
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
                  onChange={(event) => setValor(event.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Mes</Label>
                <MonthPicker value={mes} onChange={setMes} />
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
                {mode === "edit" ? "Salvar alteracoes" : "Salvar receita"}
              </Button>
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
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Lightbulb className="h-5 w-5" />
              </span>
              <div>
                <CardTitle>Sugestoes</CardTitle>
                <CardDescription>Use uma opcao da API para preencher rapido.</CardDescription>
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
