import { ReceiptText } from "lucide-react";
import { DespesaForm } from "../despesa-form";

export function CadastroDespesaPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5 lg:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <ReceiptText className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-normal text-card-foreground">
              Nova despesa
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
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
