import { ReceiptText } from "lucide-react";
import { DespesaForm } from "../despesa-form";

export function CadastroDespesaPage() {
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
              Nova despesa
            </h1>
            <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
              Cadastre contas, vencimentos, mês de referência e parcelamento com
              precisão.
            </p>
          </div>
        </div>
      </section>

      <DespesaForm mode="create" />
    </div>
  );
}

