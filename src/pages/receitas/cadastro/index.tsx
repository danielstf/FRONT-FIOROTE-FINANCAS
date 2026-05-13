import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { ReceitaForm } from "../receita-form";

export function CadastroReceitaPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm lg:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-6 w-6" />
              </span>
              <h1 className="text-3xl font-semibold tracking-normal text-card-foreground">
                Nova receita
              </h1>
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">
              Cadastre entradas como salario, renda extra, vendas ou qualquer
              outro recebimento do mes.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/app/receitas">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </section>

      <ReceitaForm />
    </div>
  );
}
