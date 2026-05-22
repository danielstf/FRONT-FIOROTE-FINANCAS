import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { BarChart3, Check, Menu, Settings } from "lucide-react";
import { pagamentosApi } from "../api/pagamentos/pagamentos-api";
import { perfisApi } from "../api/perfis/perfis-api";
import type { PerfilFinanceiro } from "../api/perfis/types";
import { AdBanner } from "../components/ad-banner";
import { BrandLogo } from "../components/brand-logo";
import { Sidebar } from "../components/sidebar";
import { Avatar } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { hasPremiumAtivo } from "../lib/premium";
import { useAuth } from "../providers/auth-provider";

export function AppLayout() {
  const { session, perfilFinanceiroId, selecionarPerfilFinanceiro } = useAuth();
  const [showAds, setShowAds] = useState(!hasPremiumAtivo(session?.usuario));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [perfis, setPerfis] = useState<PerfilFinanceiro[]>([]);
  const perfilSelecionado =
    perfis.find((perfil) => perfil.id === perfilFinanceiroId) ?? null;
  const isPremium = hasPremiumAtivo(session?.usuario);

  useEffect(() => {
    async function carregarAnuncios() {
      try {
        const status = await pagamentosApi.consultarPremium();
        setShowAds(!status.premium && status.exibirAnuncios);
      } catch {
        setShowAds(!isPremium);
      }
    }

    void carregarAnuncios();
  }, [isPremium]);

  useEffect(() => {
    async function carregarPerfis() {
      if (!isPremium) {
        setPerfis([]);
        selecionarPerfilFinanceiro(null);
        return;
      }

      try {
        const data = await perfisApi.listar();
        setPerfis(data.perfis);

        if (
          perfilFinanceiroId &&
          !data.perfis.some((perfil) => perfil.id === perfilFinanceiroId)
        ) {
          selecionarPerfilFinanceiro(null);
        }
      } catch {
        setPerfis([]);
      }
    }

    void carregarPerfis();
  }, [isPremium, perfilFinanceiroId, selecionarPerfilFinanceiro]);

  function escolherPerfil(perfilId: string | null) {
    selecionarPerfilFinanceiro(perfilId);
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  }

  async function compartilharWhatsApp() {
    const url = window.location.origin;
    const text = encodeURIComponent(
      `Conheça o Fiorote Control para organizar receitas, despesas e relatórios financeiros: ${url}`,
    );

    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");

    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      setShareCopied(false);
    }
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground lg:grid lg:h-dvh lg:grid-cols-[260px_1fr] lg:divide-x lg:divide-sidebar-border lg:overflow-hidden">
      <Sidebar
        className="hidden lg:flex lg:flex-col"
        perfilSelecionado={perfilSelecionado}
        onProfileClick={() => setProfileMenuOpen(true)}
      />

      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="left-0 top-0 h-dvh max-h-dvh w-72 max-w-[calc(100%-2rem)] translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-y-0 border-l-0 p-0 shadow-2xl data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left">
          <Sidebar
            className="flex h-full flex-col border-r-0"
            perfilSelecionado={perfilSelecionado}
            onProfileClick={() => {
              setMobileMenuOpen(false);
              setProfileMenuOpen(true);
            }}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar perfil</DialogTitle>
            <DialogDescription>
              Alterne entre os perfis financeiros desta conta.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <button
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/35 hover:bg-accent"
              type="button"
              onClick={() => escolherPerfil(null)}
            >
              <Avatar value="user" label="Perfil principal" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">Perfil principal</p>
                <p className="truncate text-xs text-muted-foreground">
                  {session?.usuario.email}
                </p>
              </div>
              {!perfilFinanceiroId && <Check className="h-4 w-4 text-primary" />}
            </button>

            {perfis.map((perfil) => (
              <button
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/35 hover:bg-accent"
                key={perfil.id}
                type="button"
                onClick={() => escolherPerfil(perfil.id)}
              >
                <Avatar value={perfil.avatar} label={perfil.nome} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{perfil.nome}</p>
                  <p className="text-xs text-muted-foreground">Perfil financeiro</p>
                </div>
                {perfilFinanceiroId === perfil.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}

            {!isPremium && (
              <p className="rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary">
                Perfis extras ficam disponíveis no plano Premium.
              </p>
            )}
          </div>

          <Button asChild variant="outline">
            <Link to="/app/configuracoes" onClick={() => setProfileMenuOpen(false)}>
              <Settings className="h-4 w-4" />
              Gerenciar perfis
            </Link>
          </Button>
        </DialogContent>
      </Dialog>

      <div className="flex min-h-dvh min-w-0 flex-col lg:min-h-0">
        <header className="sticky top-0 z-20 flex h-17.5 items-center justify-between gap-3 border-b border-sidebar-border bg-card/95 px-3 shadow-sm backdrop-blur-md sm:px-5 lg:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              aria-label="Abrir menu"
              className="h-9 w-9 shrink-0 px-0 text-muted-foreground lg:hidden"
              variant="outline"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-4.5 w-4.5" />
            </Button>

            <BrandLogo compact className="lg:hidden" />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              className="group relative h-10 overflow-hidden border-emerald-500/25 bg-gradient-to-r from-emerald-500/12 via-primary/8 to-cyan-500/10 px-3 text-emerald-700 shadow-sm shadow-emerald-950/5 hover:border-emerald-500/40 hover:bg-emerald-500/15 hover:text-emerald-800 dark:text-emerald-300 dark:shadow-black/20 dark:hover:text-emerald-200 sm:min-w-[230px] sm:justify-start sm:px-4"
              variant="outline"
              onClick={compartilharWhatsApp}
              title="Compartilhar no WhatsApp"
            >
              <BarChart3 className="pointer-events-none absolute -right-1 -top-2 h-12 w-12 text-emerald-500/10 transition-transform duration-300 group-hover:scale-110 dark:text-emerald-300/10" />
              {shareCopied ? (
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-950/20">
                  <Check className="h-4 w-4" />
                </span>
              ) : (
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-950/20">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.04 2a9.84 9.84 0 0 0-8.42 14.9L2.5 22l5.23-1.1A9.84 9.84 0 1 0 12.04 2Zm0 1.8a8.04 8.04 0 0 1 6.75 12.4 8.02 8.02 0 0 1-9.96 2.9l-.28-.13-3.77.8.8-3.67-.16-.3A8.04 8.04 0 0 1 12.04 3.8Zm-3.3 4.2c-.2 0-.53.08-.8.38-.27.3-1.05 1.02-1.05 2.48s1.08 2.88 1.23 3.08c.15.2 2.1 3.33 5.18 4.53 2.56 1 3.08.8 3.64.75.56-.05 1.8-.73 2.05-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35-.3-.15-1.8-.9-2.08-1-.28-.1-.48-.15-.68.15-.2.3-.78 1-.95 1.2-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.65-.93-2.25-.25-.6-.5-.52-.68-.53h-.58Z" />
                  </svg>
                </span>
              )}
              <span className="relative hidden min-w-0 text-left sm:grid">
                <span className="truncate text-[11px] font-bold uppercase leading-none tracking-wider">
                  {shareCopied ? "Link copiado" : "Compartilhar"}
                </span>
                <span className="mt-0.5 truncate text-[11px] font-medium leading-none text-foreground/70">
                  Fiorote Controle Financeiro
                </span>
              </span>
            </Button>
            <span className="hidden rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary sm:inline-flex">
              {session?.usuario.plano ?? "FREE"}
            </span>
          </div>
        </header>

        <main className="flex-1 lg:min-h-0 lg:overflow-y-auto">
          <div className="mx-auto w-full max-w-8xl space-y-6 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-7">
            {showAds && (
              <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                <AdBanner />
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
