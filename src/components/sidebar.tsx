import { useState } from "react";
import {
  BarChart3,
  CreditCard,
  Crown,
  Home,
  LogOut,
  Mail,
  MessageSquareText,
  ReceiptText,
  Settings,
  Share2,
  ShieldAlert,
  WalletCards,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import type { PerfilFinanceiro } from "../api/perfis/types";
import { cn } from "../lib/utils";
import { useAuth } from "../providers/auth-provider";
import { BrandLogo } from "./brand-logo";
import { Avatar } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const menuItems = [
  { title: "Dashboard", href: "/app", icon: Home, end: true },
  {
    title: "Receitas",
    href: "/app/receitas",
    icon: WalletCards,
    section: "Finanças",
  },
  { title: "Despesas", href: "/app/despesas", icon: ReceiptText },
  { title: "Cartões", href: "/app/cartoes", icon: CreditCard },
  { title: "Relatórios", href: "/app/relatorios", icon: BarChart3 },
  {
    title: "VIP",
    href: "/app/premium",
    icon: Crown,
    section: "Conta",
    badge: "plan",
  },
  { title: "Atendimento", href: "/app/sugestoes", icon: MessageSquareText },
  { title: "Configurações", href: "/app/configuracoes", icon: Settings },
];

const APP_URL = window.location.origin;
const SHARE_TEXT =
  "Conheça o Fiorote Controle Financeiro para organizar receitas, despesas e relatórios financeiros";

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
  perfilSelecionado?: PerfilFinanceiro | null;
  onProfileClick?: () => void;
};

export function Sidebar({
  className,
  onNavigate,
  perfilSelecionado,
  onProfileClick,
}: SidebarProps) {
  const { session, logout } = useAuth();
  const [shareOpen, setShareOpen] = useState(false);

  const planBadge = session?.usuario.plano === "PREMIUM" ? "VIP" : "FREE";
  const isVip = planBadge === "VIP";

  function abrirWhatsApp() {
    const encoded = encodeURIComponent(`${SHARE_TEXT}: ${APP_URL}`);
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
  }

  function abrirEmail() {
    const subject = encodeURIComponent("Conheça o Fiorote Controle Financeiro");
    const body = encodeURIComponent(
      `Olá!\n\nTe indico o Fiorote, um app para controle financeiro pessoal.\n\n${SHARE_TEXT}.\n\nAcesse: ${APP_URL}`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  const items =
    session?.usuario.role === "ADMIN"
      ? [
          ...menuItems,
          {
            title: "Gestão",
            href: "/app/gestao",
            icon: ShieldAlert,
            section: "Admin",
          },
          { title: "Relatório admin", href: "/app/admin", icon: BarChart3 },
        ]
      : menuItems;

  const renderedItems: React.ReactNode[] = [];
  let lastSection: string | undefined = undefined;

  items.forEach((item) => {
    if (item.section && item.section !== lastSection) {
      lastSection = item.section;
      renderedItems.push(
        <div
          key={`section-${item.section}`}
          className="mt-5 mb-1 px-3"
        >
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5">
            <span className="h-1 w-1 rounded-full bg-primary/60" />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-primary/70">
              {item.section}
            </span>
          </span>
        </div>,
      );
    }

    renderedItems.push(
      <NavLink
        key={item.href}
        to={item.href}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "group relative flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-sidebar-foreground/60 transition-all duration-150 hover:bg-sidebar-foreground/6 hover:text-sidebar-foreground",
            isActive &&
              "bg-primary/15 font-semibold text-primary hover:bg-primary/20 hover:text-primary dark:bg-primary/12 dark:hover:bg-primary/16",
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span className="absolute left-0 top-1/2 h-4 w-0.75 -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            <item.icon
              className={cn(
                "h-3.75 w-3.75 shrink-0 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/80",
              )}
            />
            <span className="flex-1 leading-none">{item.title}</span>
            {item.badge === "plan" && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-black leading-none tracking-wide",
                  isVip
                    ? "bg-amber-400/15 text-amber-400"
                    : "bg-sidebar-accent text-sidebar-foreground/50",
                )}
              >
                <Crown className="h-2.5 w-2.5" />
                {planBadge}
              </span>
            )}
          </>
        )}
      </NavLink>,
    );
  });

  return (
    <>
      <aside
        className={cn(
          "sidebar-bg relative flex h-screen min-h-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground",
          className,
        )}
      >
        {/* ── Orbs animados ── */}
        {/* Orb superior esquerdo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-primary/25 blur-3xl animate-float-slow dark:bg-primary/18"
        />
        {/* Orb inferior direito */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-14 -right-8 h-52 w-52 rounded-full bg-primary/15 blur-3xl animate-drift dark:bg-primary/10"
          style={{ animationDelay: "-3s" }}
        />
        {/* Orb médio — acento */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/3 h-28 w-28 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl animate-float dark:bg-primary/6"
          style={{ animationDelay: "-1.5s" }}
        />

        {/* Logo */}
        <div className="relative flex shrink-0 items-center border-b-0 px-4 py-3">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-r from-primary/12 via-primary/5 to-transparent dark:from-primary/8 dark:via-primary/3"
          />
          <BrandLogo className="relative justify-start" size="nav" />
        </div>

        {/* Nav */}
        <nav className="relative flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
          {renderedItems}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t-0 p-2">
          {session?.usuario && (
            <div className="flex items-center gap-1">
              <button
                className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-150 hover:bg-sidebar-foreground/6"
                type="button"
                onClick={onProfileClick}
              >
                <Avatar
                  className="h-7 w-7 shrink-0 ring-1 ring-sidebar-border"
                  value={perfilSelecionado?.avatar}
                  label={perfilSelecionado?.nome ?? session.usuario.nome}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-sidebar-foreground/90 leading-tight">
                    {session.usuario.nome}
                  </p>
                  <p className="truncate text-[10.5px] text-sidebar-foreground/45 leading-tight mt-0.5">
                    {perfilSelecionado?.nome ?? "Perfil principal"}
                  </p>
                </div>
              </button>

              <button
                aria-label="Compartilhar app"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/35 transition-all duration-150 hover:bg-sidebar-foreground/6 hover:text-sidebar-foreground/70"
                type="button"
                onClick={() => setShareOpen(true)}
              >
                <Share2 className="h-4 w-4" />
              </button>

              <button
                aria-label="Sair"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/35 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive"
                type="button"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Share dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-sm">
          {/* Header */}
          <div className="relative border-b border-border bg-linear-to-br from-primary/10 via-background to-background p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"
            />
            <DialogHeader className="flex-row items-center gap-4 space-y-0 text-left">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Share2 className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-base">Compartilhar Fiorote</DialogTitle>
                <DialogDescription className="text-sm">
                  Indique para amigos e família.
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>

          {/* Opções */}
          <div className="flex flex-col gap-1.5 p-4">
            {/* WhatsApp */}
            <button
              className="flex w-full items-center gap-4 rounded-xl border border-border p-3.5 text-left transition-all duration-150 hover:border-emerald-500/40 hover:bg-emerald-500/5"
              type="button"
              onClick={abrirWhatsApp}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <svg
                  aria-hidden
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.04 2a9.84 9.84 0 0 0-8.42 14.9L2.5 22l5.23-1.1A9.84 9.84 0 1 0 12.04 2Zm0 1.8a8.04 8.04 0 0 1 6.75 12.4 8.02 8.02 0 0 1-9.96 2.9l-.28-.13-3.77.8.8-3.67-.16-.3A8.04 8.04 0 0 1 12.04 3.8Zm-3.3 4.2c-.2 0-.53.08-.8.38-.27.3-1.05 1.02-1.05 2.48s1.08 2.88 1.23 3.08c.15.2 2.1 3.33 5.18 4.53 2.56 1 3.08.8 3.64.75.56-.05 1.8-.73 2.05-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35-.3-.15-1.8-.9-2.08-1-.28-.1-.48-.15-.68.15-.2.3-.78 1-.95 1.2-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.65-.93-2.25-.25-.6-.5-.52-.68-.53h-.58Z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Enviar mensagem com o link</p>
              </div>
            </button>

            {/* E-mail */}
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
    </>
  );
}
