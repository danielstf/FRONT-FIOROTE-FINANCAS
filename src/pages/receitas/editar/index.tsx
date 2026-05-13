import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { getApiErrorMessage } from "../../../api/errors";
import { receitasApi } from "../../../api/receitas/receitas-api";
import { MonthPicker } from "../../../components/month-picker";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { normalizeRequiredText, toUppercaseText } from "../../../lib/text";

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

export function EditarReceitaPage() {
  const navigate = useNavigate();
  const { receitaId } = useParams();
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [mes, setMes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function carregarReceita() {
      if (!receitaId) return;

      setError("");
      setLoading(true);

      try {
        const receita = await receitasApi.obter(receitaId);
        setNome(toUppercaseText(receita.nome));
        setValor(moneyToInput(receita.valor));
        setMes(receita.mes);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    }

    void carregarReceita();
  }, [receitaId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!receitaId) return;

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

    setSaving(true);

    try {
      await receitasApi.editar(receitaId, {
        nome: nomeNormalizado,
        valor: valorNumerico,
        mes,
      });
      setMessage("Receita atualizada com sucesso.");
      window.setTimeout(() => navigate(`/app/receitas?mes=${mes}`), 700);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            Editar receita
          </h1>
          <p className="text-sm text-muted-foreground">
            Ajuste nome, valor ou mês do lançamento selecionado.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/app/receitas">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados da receita</CardTitle>
          <CardDescription>
            As alterações são salvas por `PUT /receitas/:receitaId`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando receita...
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(event) => setNome(toUppercaseText(event.target.value))}
                  placeholder="Ex: Salário, renda extra, venda"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor</Label>
                  <Input
                    id="valor"
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

              <Button className="w-full sm:w-fit" type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar alterações
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
