import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Check, Loader2, LogOut, Mail, Menu, Settings, Share2, UserRound, X } from "lucide-react";
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
  const { session, authLoading, perfilFinanceiroId, selecionarPerfilFinanceiro, logout } = useAuth();
  const [showAds, setShowAds] = useState(!hasPremiumAtivo(session?.usuario));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [perfis, setPerfis] = useState<PerfilFinanceiro[]>([]);
  const perfilSelecionado =
    perfis.find((perfil) => perfil.id === perfilFinanceiroId) ?? null;
  const isPremium = hasPremiumAtivo(session?.usuario);
  const [shareOpen, setShareOpen] = useState(false);
  const appContextLoading = authLoading;

  function abrirWhatsApp() {
    const text = encodeURIComponent(
      `Conheça o Fiorote Controle Financeiro para organizar receitas, despesas e relatórios financeiros: ${window.location.origin}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function abrirEmail() {
    const subject = encodeURIComponent("Conheça o Fiorote Controle Financeiro");
    const body = encodeURIComponent(
      `Olá!\n\nTe indico o Fiorote, um app para controle financeiro pessoal.\n\nAcesse: ${window.location.origin}`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  useEffect(() => {
    async function carregarAnuncios() {
      if (authLoading) return;

      try {
        const status = await pagamentosApi.consultarPremium();
        setShowAds(!status.premium && status.exibirAnuncios);
      } catch {
        setShowAds(!isPremium);
      }
    }
    void carregarAnuncios();
  }, [authLoading, isPremium]);

  useEffect(() => {
    let ignore = false;

    async function carregarPerfis() {
      if (authLoading) return;

      if (!isPremium) {
        if (ignore) return;
        setPerfis([]);
        selecionarPerfilFinanceiro(null);
        return;
      }
      try {
        const data = await perfisApi.listar();
        if (ignore) return;
        setPerfis(data.perfis);
        if (
          perfilFinanceiroId &&
          !data.perfis.some((perfil) => perfil.id === perfilFinanceiroId)
        ) {
          selecionarPerfilFinanceiro(null);
        }
      } catch {
        if (ignore) return;
        setPerfis([]);
      }
    }
    void carregarPerfis();

    return () => {
      ignore = true;
    };
  }, [authLoading, isPremium, perfilFinanceiroId, selecionarPerfilFinanceiro]);

  function escolherPerfil(perfilId: string | null) {
    selecionarPerfilFinanceiro(perfilId);
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-dvh overflow-x-hidden text-foreground lg:grid lg:h-dvh lg:grid-cols-[240px_1fr] lg:overflow-hidden">
      {/* ── Sidebar desktop ─────────────────────────── */}
      <Sidebar className="hidden lg:flex lg:flex-col border-r-0" />

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
            <DialogHeader className="flex flex-row items-center gap-4 space-y-0 text-left">
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

      {/* ── Dialog: compartilhar ──────────────────── */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-sm">
          <div className="relative border-b border-border bg-linear-to-br from-primary/10 via-background to-background p-6">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
            <DialogHeader className="flex flex-row items-center gap-4 space-y-0 text-left">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Share2 className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-base">Compartilhar Fiorote</DialogTitle>
                <DialogDescription className="text-sm">Indique para amigos e família.</DialogDescription>
              </div>
            </DialogHeader>
          </div>
          <div className="flex flex-col gap-1.5 p-4">
            <button
              className="flex w-full items-center gap-4 rounded-xl border border-border p-3.5 text-left transition-all duration-150 hover:border-emerald-500/40 hover:bg-emerald-500/5"
              type="button"
              onClick={abrirWhatsApp}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <svg aria-hidden className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2a9.84 9.84 0 0 0-8.42 14.9L2.5 22l5.23-1.1A9.84 9.84 0 1 0 12.04 2Zm0 1.8a8.04 8.04 0 0 1 6.75 12.4 8.02 8.02 0 0 1-9.96 2.9l-.28-.13-3.77.8.8-3.67-.16-.3A8.04 8.04 0 0 1 12.04 3.8Zm-3.3 4.2c-.2 0-.53.08-.8.38-.27.3-1.05 1.02-1.05 2.48s1.08 2.88 1.23 3.08c.15.2 2.1 3.33 5.18 4.53 2.56 1 3.08.8 3.64.75.56-.05 1.8-.73 2.05-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35-.3-.15-1.8-.9-2.08-1-.28-.1-.48-.15-.68.15-.2.3-.78 1-.95 1.2-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.65-.93-2.25-.25-.6-.5-.52-.68-.53h-.58Z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Enviar mensagem com o link</p>
              </div>
            </button>
            <button
              className="flex w-full items-center gap-4 rounded-xl border border-border p-3.5 text-left transition-all duration-150 hover:border-blue-500/40 hover:bg-blue-500/5"
              type="button"
              onClick={abrirEmail}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Mail className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">E-mail</p>
                <p className="text-xs text-muted-foreground">Compartilhar por e-mail</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Mobile top bar ──────────────────────────── */}
      <div className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center gap-1.5 border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <button
          aria-label="Abrir menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <div className="flex-1" />
        {session?.usuario && (
          <>
            <button
              className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setProfileMenuOpen(true)}
            >
              <Avatar
                className="h-5 w-5"
                value={perfilSelecionado?.avatar}
                label={perfilSelecionado?.nome ?? session.usuario.nome}
              />
              <span className="max-w-28 truncate">{perfilSelecionado?.nome ?? session.usuario.nome}</span>
            </button>
            <button
              aria-label="Compartilhar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setShareOpen(true)}
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              aria-label="Sair"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
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

        {/* ── Desktop top bar ─────────────────────────── */}
        <div className="relative z-10 hidden h-12 shrink-0 items-center justify-end gap-1 px-5 lg:flex">
          {session?.usuario && (
            <button
              className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-foreground/6 hover:text-sidebar-foreground"
              onClick={() => setProfileMenuOpen(true)}
            >
              <Avatar
                className="h-5 w-5"
                value={perfilSelecionado?.avatar}
                label={perfilSelecionado?.nome ?? session.usuario.nome}
              />
              <span>{perfilSelecionado?.nome ?? session.usuario.nome}</span>
            </button>
          )}
          <button
            aria-label="Compartilhar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/40 transition-colors hover:bg-sidebar-foreground/6 hover:text-sidebar-foreground"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            aria-label="Sair"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </button>
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
            {appContextLoading ? (
              <div className="flex min-h-[45vh] items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </div>
            ) : (
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
