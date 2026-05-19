import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Check, Menu, Settings } from "lucide-react";
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
import { useAuth } from "../providers/auth-provider";

export function AppLayout() {
  const { session, perfilFinanceiroId, selecionarPerfilFinanceiro } = useAuth();
  const [showAds, setShowAds] = useState(session?.usuario.plano !== "PREMIUM");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [perfis, setPerfis] = useState<PerfilFinanceiro[]>([]);
  const [logoMood, setLogoMood] = useState<"positive" | "negative" | "neutral">(
    "neutral",
  );
  const perfilSelecionado =
    perfis.find((perfil) => perfil.id === perfilFinanceiroId) ?? null;
  const isPremium = session?.usuario.plano === "PREMIUM";

  useEffect(() => {
    async function carregarAnuncios() {
      try {
        const status = await pagamentosApi.consultarPremium();
        setShowAds(session?.usuario.plano !== "PREMIUM" && status.exibirAnuncios);
      } catch {
        setShowAds(session?.usuario.plano !== "PREMIUM");
      }
    }

    void carregarAnuncios();
  }, [session?.usuario.plano]);

  useEffect(() => {
    function atualizarLogo(event: Event) {
      const saldo = Number((event as CustomEvent<number>).detail);

      if (!Number.isFinite(saldo)) return;
      setLogoMood(saldo >= 0 ? "positive" : "negative");
    }

    window.addEventListener("fiorote-saldo-change", atualizarLogo);
    return () => window.removeEventListener("fiorote-saldo-change", atualizarLogo);
  }, []);

  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const appleIcon = document.querySelector<HTMLLinkElement>(
      'link[rel="apple-touch-icon"]',
    );
    const iconHref =
      logoMood === "negative"
        ? "/logo-rosto-negative.svg"
        : "/logo-rosto-positive.svg";

    if (favicon) {
      favicon.href = iconHref;
    }

    if (appleIcon) {
      appleIcon.href = iconHref;
    }
  }, [logoMood]);

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

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground lg:grid lg:h-dvh lg:grid-cols-[260px_1fr] lg:divide-x lg:divide-sidebar-border lg:overflow-hidden">
      <Sidebar
        className="hidden lg:flex lg:flex-col"
        logoMood={logoMood}
        perfilSelecionado={perfilSelecionado}
        onProfileClick={() => setProfileMenuOpen(true)}
      />

      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="left-0 top-0 h-dvh max-h-dvh w-72 max-w-[calc(100%-2rem)] translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-y-0 border-l-0 p-0 shadow-2xl data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left">
          <Sidebar
            className="flex h-full flex-col border-r-0"
            logoMood={logoMood}
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

            <BrandLogo compact className="lg:hidden" mood={logoMood} />
          </div>

          <div className="flex shrink-0 items-center gap-2">
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
