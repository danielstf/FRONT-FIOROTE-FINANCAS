import {
  BarChart3,
  ChevronDown,
  CreditCard,
  Home,
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
    title: "Premium",
    href: "/app/premium",
    icon: CreditCard,
    section: "Conta",
    badge: "Pro",
  },
  { title: "Atendimento", href: "/app/sugestoes", icon: MessageSquareText },
  { title: "Configurações", href: "/app/configuracoes", icon: Settings },
];

type SidebarProps = {
  className?: string;
  logoMood?: "positive" | "negative" | "neutral";
  onNavigate?: () => void;
  perfilSelecionado?: PerfilFinanceiro | null;
  onProfileClick?: () => void;
};

export function Sidebar({
  className,
  logoMood = "neutral",
  onNavigate,
  perfilSelecionado,
  onProfileClick,
}: SidebarProps) {
  const { session } = useAuth();
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
          className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/25"
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
            "group relative flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13.5px] font-normal text-sidebar-foreground/50 transition-colors hover:bg-white/[0.06] hover:text-sidebar-foreground/85",
            isActive && "bg-primary/[0.12] font-medium text-primary",
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span className="absolute left-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary">
                {item.badge}
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
        <BrandLogo className="justify-start" mood={logoMood} size="sidebar" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">{renderedItems}</nav>

      <div className="border-t border-sidebar-border p-2.5">
        {session?.usuario && (
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
            type="button"
            onClick={onProfileClick}
          >
            <Avatar
              className="h-8 w-8"
              value={perfilSelecionado?.avatar}
              label={perfilSelecionado?.nome ?? session.usuario.nome}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-sidebar-foreground/80">
                {session.usuario.nome}
              </p>
              <p className="truncate text-[10.5px] text-sidebar-foreground/40">
                {perfilSelecionado?.nome ?? "Perfil principal"}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-sidebar-foreground/35" />
          </button>
        )}
      </div>
    </aside>
  );
}
