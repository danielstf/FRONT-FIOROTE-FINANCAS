import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, ReceiptText, AlertCircle } from "lucide-react";
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
      <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6 lg:p-8">
        {/* Accent bar lateral */}
        <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-destructive/60" />

        <div className="flex items-center gap-5 pl-2">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
            <ReceiptText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-card-foreground">
              Editar despesa
            </h1>
            <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
              Atualize vencimento, valor, categoria, recorrência ou forma de
              pagamento.
            </p>
          </div>
        </div>
      </section>

      {loading && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin shrink-0 text-primary" />
          <span>Carregando despesa...</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/8 px-5 py-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && despesa && <DespesaForm mode="edit" despesa={despesa} />}
    </div>
  );
}
