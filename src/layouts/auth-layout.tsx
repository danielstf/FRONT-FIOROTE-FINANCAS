import { ArrowLeft } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { BrandLogo } from "../components/brand-logo";
import { ThemeToggle } from "../components/theme-toggle";
import { Button } from "../components/ui/button";

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-5 py-8 lg:grid-cols-[1fr_460px] lg:px-8">
        <div className="hidden max-w-xl space-y-7 lg:block">
          <div className="flex items-center justify-between">
            <BrandLogo />
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao site
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-semibold leading-tight tracking-normal text-foreground">
              Minhas Finanças Fiorote
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Controle receitas, despesas e seu plano Premium em uma área simples,
              segura e organizada.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="font-semibold text-foreground">Receitas</p>
              <p className="mt-1 text-muted-foreground">Entradas no lugar certo</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="font-semibold text-foreground">Despesas</p>
              <p className="mt-1 text-muted-foreground">Controle recorrente</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="font-semibold text-foreground">Premium</p>
              <p className="mt-1 text-muted-foreground">Sem anúncios</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <BrandLogo className="lg:hidden" />
            <div className="flex items-center gap-2">
              <Button asChild className="hidden sm:inline-flex" variant="outline">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  Site
                </Link>
              </Button>
              <ThemeToggle />
            </div>
          </div>
          <Outlet />
        </div>
      </section>
    </main>
  );
}
