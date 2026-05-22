import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Check, Menu, Settings, UserRound } from "lucide-react";
import { pagamentosApi } from "../api/pagamentos/pagamentos-api";
import { perfisApi } from "../api/perfis/perfis-api";
import type { PerfilFinanceiro } from "../api/perfis/types";
import { AdBanner } from "../components/ad-banner";
import { FloatingShare } from "../components/floating-share";
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
        <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
          <div className="border-b border-border bg-gradient-to-br from-primary/15 via-background to-emerald-500/10 p-5">
            <DialogHeader className="flex-row items-center gap-3 space-y-0 text-left">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                <UserRound className="h-6 w-6" />
              </span>
              <div>
                <DialogTitle>Selecionar perfil</DialogTitle>
                <DialogDescription>
                  Escolha qual área financeira deseja usar agora.
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>

          <div className="grid gap-2.5 p-5">
            <button
              className="flex w-full items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-left transition-colors hover:border-primary/45 hover:bg-primary/10"
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
              {!perfilFinanceiroId && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </button>

            {perfis.map((perfil) => (
              <button
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/35 hover:bg-accent"
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
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </button>
            ))}

            {!isPremium && (
              <p className="rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary">
                Perfis extras ficam disponíveis no plano VIP.
              </p>
            )}
          </div>

          <Button asChild className="mx-5 mb-5 w-[calc(100%-2.5rem)]" variant="outline">
            <Link to="/app/configuracoes" onClick={() => setProfileMenuOpen(false)}>
              <Settings className="h-4 w-4" />
              Gerenciar perfis
            </Link>
          </Button>
        </DialogContent>
      </Dialog>

      <Button
        aria-label="Abrir menu"
        className="fixed left-3 top-3 z-30 h-10 w-10 rounded-full px-0 text-muted-foreground shadow-lg lg:hidden"
        variant="outline"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-4.5 w-4.5" />
      </Button>

      <div className="flex min-h-dvh min-w-0 flex-col lg:min-h-0">
        <main className="flex-1 lg:min-h-0 lg:overflow-y-auto">
          <div className="mx-auto w-full max-w-8xl space-y-6 px-3 pb-5 pt-16 sm:px-5 sm:pb-6 lg:px-8 lg:py-7">
            {showAds && (
              <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                <AdBanner />
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
      <FloatingShare />
    </div>
  );
}

