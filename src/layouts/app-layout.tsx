import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Check, Menu, Settings, UserRound, X } from "lucide-react";
import { pagamentosApi } from "../api/pagamentos/pagamentos-api";
import { perfisApi } from "../api/perfis/perfis-api";
import type { PerfilFinanceiro } from "../api/perfis/types";
import { AdBanner } from "../components/ad-banner";
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
  const location = useLocation();
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
    <div className="min-h-dvh overflow-x-hidden text-foreground lg:grid lg:h-dvh lg:grid-cols-[240px_1fr] lg:overflow-hidden">
      {/* ── Sidebar desktop ─────────────────────────── */}
      <Sidebar
        className="hidden lg:flex lg:flex-col border-r-0"
        perfilSelecionado={perfilSelecionado}
        onProfileClick={() => setProfileMenuOpen(true)}
      />

      {/* ── Mobile sidebar overlay ──────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              key="drawer"
              className="fixed left-0 top-0 z-50 h-dvh w-64 lg:hidden"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            >
              <Sidebar
                className="flex h-full flex-col border-r-0"
                perfilSelecionado={perfilSelecionado}
                onProfileClick={() => {
                  setMobileMenuOpen(false);
                  setProfileMenuOpen(true);
                }}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Dialog: perfil ──────────────────────────── */}
      <Dialog open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-md">
          <div className="relative border-b border-border bg-linear-to-br from-primary/10 via-background to-background p-6">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
            <DialogHeader className="flex-row items-center gap-4 space-y-0 text-left">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-base">Selecionar perfil</DialogTitle>
                <DialogDescription className="text-sm">
                  Escolha qual área financeira usar agora.
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>
          <div className="grid gap-2 p-4">
            <button
              className="group flex w-full items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-left transition-all duration-150 hover:border-primary/35 hover:bg-primary/10"
              type="button"
              onClick={() => escolherPerfil(null)}
            >
              <Avatar value="user" label="Perfil principal" className="h-8 w-8" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Perfil principal</p>
                <p className="truncate text-xs text-muted-foreground">{session?.usuario.email}</p>
              </div>
              {!perfilFinanceiroId && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
            {perfis.map((perfil) => (
              <button
                className="group flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3.5 text-left transition-all duration-150 hover:border-border/80 hover:bg-accent"
                key={perfil.id}
                type="button"
                onClick={() => escolherPerfil(perfil.id)}
              >
                <Avatar value={perfil.avatar} label={perfil.nome} className="h-8 w-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{perfil.nome}</p>
                  <p className="text-xs text-muted-foreground">Perfil financeiro</p>
                </div>
                {perfilFinanceiroId === perfil.id && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            ))}
            {!isPremium && (
              <p className="rounded-lg border border-primary/20 bg-primary/8 px-3.5 py-2.5 text-xs text-primary">
                Perfis extras ficam disponíveis no plano VIP.
              </p>
            )}
          </div>
          <div className="border-t border-border p-4">
            <Button asChild className="w-full" variant="outline">
              <Link to="/app/configuracoes" onClick={() => setProfileMenuOpen(false)}>
                <Settings className="h-3.5 w-3.5" />
                Gerenciar perfis
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Mobile top bar ──────────────────────────── */}
      <div className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <button
          aria-label="Abrir menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <div className="flex-1" />
        {session?.usuario && (
          <button
            className="flex h-8 items-center gap-2 rounded-lg border border-border/70 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => setProfileMenuOpen(true)}
          >
            <Avatar
              className="h-5 w-5"
              value={perfilSelecionado?.avatar}
              label={perfilSelecionado?.nome ?? session.usuario.nome}
            />
            <span className="max-w-30 truncate">{session.usuario.nome}</span>
          </button>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          ÁREA DE CONTEÚDO PRINCIPAL
      ══════════════════════════════════════════════ */}
      {/* content-area: aplica grids + diagonais via CSS puro, sem div filho */}
      <div className="content-area relative flex min-h-dvh min-w-0 flex-col lg:min-h-0 lg:overflow-hidden">

        {/* ── Orbs animados (mesmos valores do sidebar) ── */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -right-10 -top-10 h-44 w-44 rounded-full blur-3xl animate-float-slow bg-primary/20 dark:bg-primary/18"
          />
          <div
            className="absolute -bottom-14 left-1/3 h-52 w-52 rounded-full blur-3xl animate-drift bg-primary/12 dark:bg-primary/10"
            style={{ animationDelay: "-3s" }}
          />
          <div
            className="absolute right-1/4 top-1/3 h-28 w-28 rounded-full blur-2xl animate-float bg-primary/8 dark:bg-primary/6"
            style={{ animationDelay: "-1.5s" }}
          />
        </div>

        {/* ── Conteúdo scrollável ── */}
        <main className="relative flex-1 lg:min-h-0 lg:overflow-y-auto">
          {showAds && (
            <div className="mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6 lg:px-8 lg:pt-5">
              <div className="overflow-hidden rounded-xl border border-border/50 shadow-sm">
                <AdBanner />
              </div>
            </div>
          )}
          <div className={`mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 ${showAds ? "pt-4" : "pt-20 lg:pt-8"}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
