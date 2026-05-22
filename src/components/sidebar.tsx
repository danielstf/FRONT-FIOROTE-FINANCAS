import {
  BarChart3,
  ChevronDown,
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
        <p
          key={`section-${item.section}`}
          className="mb-1 mt-4 inline-flex rounded-md border border-sidebar-border bg-sidebar-accent px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-sidebar-accent-foreground"
        >
          {item.section}
        </p>,
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
            "group relative flex h-10 items-center gap-2.5 rounded-lg px-3 text-[13.5px] font-semibold text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive &&
              "border border-primary/20 bg-primary/[0.14] font-bold text-primary shadow-sm",
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{item.title}</span>
            {item.badge === "plan" && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-black leading-none",
                  planBadge === "VIP"
                    ? "border-amber-400/50 bg-amber-400/15 text-amber-600 dark:text-amber-300"
                    : "border-sidebar-border bg-sidebar-accent text-sidebar-foreground/65",
                )}
              >
                <Crown className="h-3 w-3" />
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
        "flex h-screen min-h-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="border-b border-sidebar-border px-5 py-5">
        <BrandLogo className="justify-start" size="sidebar" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">{renderedItems}</nav>

      <div className="grid gap-2 border-t border-sidebar-border p-2.5">
        {session?.usuario && (
          <button
            className="flex w-full items-center gap-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent/70 px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent"
            type="button"
            onClick={onProfileClick}
          >
            <Avatar
              className="h-8 w-8"
              value={perfilSelecionado?.avatar}
              label={perfilSelecionado?.nome ?? session.usuario.nome}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-bold text-sidebar-foreground">
                {session.usuario.nome}
              </p>
              <p className="truncate text-[10.5px] font-medium text-sidebar-foreground/60">
                {perfilSelecionado?.nome ?? "Perfil principal"}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-sidebar-foreground/60" />
          </button>
        )}
        <button
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-transparent px-3 text-sm font-bold text-destructive transition-colors hover:border-destructive/35 hover:bg-destructive/10 hover:text-destructive"
          type="button"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}



