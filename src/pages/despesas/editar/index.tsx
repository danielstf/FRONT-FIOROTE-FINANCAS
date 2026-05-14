import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, ReceiptText } from "lucide-react";
import { despesasApi } from "../../../api/despesas/despesas-api";
import type { Despesa } from "../../../api/despesas/types";
import { getApiErrorMessage } from "../../../api/errors";
import { DespesaForm } from "../despesa-form";

export function EditarDespesaPage() {
  const { despesaId } = useParams();
  const [despesa, setDespesa] = useState<Despesa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function carregarDespesa() {
      if (!despesaId) return;

      setError("");
      setLoading(true);

      try {
        const data = await despesasApi.obter(despesaId);
        setDespesa(data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    }

    void carregarDespesa();
  }, [despesaId]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5 lg:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <ReceiptText className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-normal text-card-foreground">
              Editar despesa
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Atualize vencimento, valor, categoria, recorrência ou forma de
              pagamento.
            </p>
          </div>
        </div>
      </section>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando despesa...
        </div>
      )}
      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {!loading && despesa && <DespesaForm mode="edit" despesa={despesa} />}
    </div>
  );
}
