import {
  BarChart3,
  BookOpen,
  CreditCard,
  Crown,
  Home,
  MessageSquareText,
  ReceiptText,
  Settings,
  ShieldAlert,
  WalletCards,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAuth } from "../providers/auth-provider";
import { BrandLogo } from "./brand-logo";

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
  { title: "Tutoriais", href: "/app/tutoriais", icon: BookOpen },
  { title: "Suporte", href: "/app/sugestoes", icon: MessageSquareText },
  { title: "Configurações", href: "/app/configuracoes", icon: Settings },
];

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function Sidebar({
  className,
  onNavigate,
}: SidebarProps) {
  const { session } = useAuth();

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
                item.badge === "plan" && isVip
                  ? "text-amber-400"
                  : isActive
                    ? "text-primary"
                    : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/80",
              )}
            />
            <span className="flex-1 leading-none">{item.title}</span>
            {item.badge === "plan" && (
              isVip ? (
                <Crown className="h-3.5 w-3.5 fill-amber-400/30 text-amber-400" />
              ) : (
                <span className="inline-flex items-center rounded-md bg-sidebar-foreground/8 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-sidebar-foreground/40">
                  Free
                </span>
              )
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

      </aside>
    </>
  );
}
