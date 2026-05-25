import {
  BarChart3,
  ChevronRight,
  CreditCard,
  Crown,
  Home,
  LogOut,
  MessageSquareText,
  ReceiptText,
  Settings,
  ShieldAlert,
  WalletCards,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import type { PerfilFinanceiro } from "../api/perfis/types";
import { cn } from "../lib/utils";
import { useAuth } from "../providers/auth-provider";
import { BrandLogo } from "./brand-logo";
import { Avatar } from "./ui/avatar";

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
  const planBadge = session?.usuario.plano === "PREMIUM" ? "VIP" : "FREE";
  const isVip = planBadge === "VIP";

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
        <div key={`section-${item.section}`} className="mt-5 mb-1.5 flex items-center gap-2 px-3">
          <span className="h-px flex-1 bg-sidebar-border/60" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/35">
            {item.section}
          </span>
          <span className="h-px flex-1 bg-sidebar-border/60" />
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
            "group relative flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-sidebar-foreground/60 transition-all duration-150 hover:bg-white/[0.06] hover:text-sidebar-foreground",
            isActive &&
              "bg-primary/[0.12] font-semibold text-primary hover:bg-primary/[0.16] hover:text-primary",
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            <item.icon
              className={cn(
                "h-[15px] w-[15px] flex-shrink-0 transition-colors",
                isActive ? "text-primary" : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/80",
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
    <aside
      className={cn(
        "flex h-screen min-h-0 flex-col bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex shrink-0 items-center border-b border-sidebar-border/50 px-4 py-3">
        <BrandLogo className="justify-start" size="nav" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
        {renderedItems}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-sidebar-border/50 p-2 space-y-1">
        {session?.usuario && (
          <button
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 hover:bg-white/[0.06]"
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
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/30 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}

        <button
          className="flex h-8 w-full items-center justify-center gap-2 rounded-lg text-[12px] font-medium text-sidebar-foreground/40 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive"
          type="button"
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
