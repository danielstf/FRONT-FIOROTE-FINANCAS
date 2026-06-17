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
import { useAdminPendentes } from "../hooks/use-admin-pendentes";
import { BrandLogo } from "./brand-logo";

type ColorKey = "blue" | "emerald" | "rose" | "violet" | "amber" | "cyan" | "slate" | "orange";

type ColorDef = {
  icon: string;
  iconBg: string;
  activeIcon: string;
  activeIconBg: string;
  activeText: string;
  activeBorder: string;
  activeRowBg: string;
};

const colorDefs: Record<ColorKey, ColorDef> = {
  blue: {
    icon: "text-blue-400/55",
    iconBg: "bg-blue-500/8 group-hover:bg-blue-500/14",
    activeIcon: "text-blue-400",
    activeIconBg: "bg-blue-500/20",
    activeText: "text-blue-400",
    activeBorder: "bg-blue-500",
    activeRowBg: "bg-blue-500/10 hover:bg-blue-500/14",
  },
  emerald: {
    icon: "text-emerald-400/55",
    iconBg: "bg-emerald-500/8 group-hover:bg-emerald-500/14",
    activeIcon: "text-emerald-400",
    activeIconBg: "bg-emerald-500/20",
    activeText: "text-emerald-400",
    activeBorder: "bg-emerald-500",
    activeRowBg: "bg-emerald-500/10 hover:bg-emerald-500/14",
  },
  rose: {
    icon: "text-rose-400/55",
    iconBg: "bg-rose-500/8 group-hover:bg-rose-500/14",
    activeIcon: "text-rose-400",
    activeIconBg: "bg-rose-500/20",
    activeText: "text-rose-400",
    activeBorder: "bg-rose-500",
    activeRowBg: "bg-rose-500/10 hover:bg-rose-500/14",
  },
  violet: {
    icon: "text-violet-400/55",
    iconBg: "bg-violet-500/8 group-hover:bg-violet-500/14",
    activeIcon: "text-violet-400",
    activeIconBg: "bg-violet-500/20",
    activeText: "text-violet-400",
    activeBorder: "bg-violet-500",
    activeRowBg: "bg-violet-500/10 hover:bg-violet-500/14",
  },
  amber: {
    icon: "text-amber-400/55",
    iconBg: "bg-amber-500/8 group-hover:bg-amber-500/14",
    activeIcon: "text-amber-400",
    activeIconBg: "bg-amber-500/20",
    activeText: "text-amber-400",
    activeBorder: "bg-amber-500",
    activeRowBg: "bg-amber-500/10 hover:bg-amber-500/14",
  },
  cyan: {
    icon: "text-cyan-400/55",
    iconBg: "bg-cyan-500/8 group-hover:bg-cyan-500/14",
    activeIcon: "text-cyan-400",
    activeIconBg: "bg-cyan-500/20",
    activeText: "text-cyan-400",
    activeBorder: "bg-cyan-500",
    activeRowBg: "bg-cyan-500/10 hover:bg-cyan-500/14",
  },
  slate: {
    icon: "text-slate-400/55",
    iconBg: "bg-slate-500/8 group-hover:bg-slate-500/14",
    activeIcon: "text-slate-300",
    activeIconBg: "bg-slate-500/20",
    activeText: "text-slate-300",
    activeBorder: "bg-slate-400",
    activeRowBg: "bg-slate-500/10 hover:bg-slate-500/14",
  },
  orange: {
    icon: "text-orange-400/55",
    iconBg: "bg-orange-500/8 group-hover:bg-orange-500/14",
    activeIcon: "text-orange-400",
    activeIconBg: "bg-orange-500/20",
    activeText: "text-orange-400",
    activeBorder: "bg-orange-500",
    activeRowBg: "bg-orange-500/10 hover:bg-orange-500/14",
  },
};

type MenuItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  section?: string;
  badge?: "plan" | "pendentes";
  colorKey: ColorKey;
};

const menuItems: MenuItem[] = [
  { title: "Dashboard",     href: "/app",               icon: Home,               end: true, colorKey: "blue"    },
  { title: "Receitas",      href: "/app/receitas",       icon: WalletCards,        section: "Finanças", colorKey: "emerald" },
  { title: "Despesas",      href: "/app/despesas",       icon: ReceiptText,                   colorKey: "rose"    },
  { title: "Cartões",       href: "/app/cartoes",        icon: CreditCard,                    colorKey: "violet"  },
  { title: "Relatórios",    href: "/app/relatorios",     icon: BarChart3,                     colorKey: "amber"   },
  { title: "VIP",           href: "/app/premium",        icon: Crown,              section: "Conta", badge: "plan", colorKey: "amber" },
  { title: "Tutoriais",     href: "/app/tutoriais",      icon: BookOpen,                      colorKey: "cyan"    },
  { title: "Suporte",       href: "/app/sugestoes",      icon: MessageSquareText,             colorKey: "blue"    },
  { title: "Configurações", href: "/app/configuracoes",  icon: Settings,                      colorKey: "slate"   },
];

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const { session } = useAuth();
  const { total: pendentes } = useAdminPendentes();

  const isVip = session?.usuario.plano === "PREMIUM";

  const items: MenuItem[] =
    session?.usuario.role === "ADMIN"
      ? [
          ...menuItems,
          {
            title: "Gestão",
            href: "/app/gestao",
            icon: ShieldAlert,
            section: "Admin",
            badge: "pendentes" as const,
            colorKey: "rose" as ColorKey,
          },
          {
            title: "Relatório admin",
            href: "/app/admin",
            icon: BarChart3,
            colorKey: "orange" as ColorKey,
          },
        ]
      : menuItems;

  const renderedItems: React.ReactNode[] = [];
  let lastSection: string | undefined = undefined;

  items.forEach((item) => {
    if (item.section && item.section !== lastSection) {
      lastSection = item.section;
      renderedItems.push(
        <div key={`section-${item.section}`} className="mt-5 mb-1 px-3">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-sidebar-foreground/5 px-2 py-0.5">
            <span className="h-1 w-1 rounded-full bg-sidebar-foreground/25" />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-sidebar-foreground/35">
              {item.section}
            </span>
          </span>
        </div>,
      );
    }

    const c = colorDefs[item.colorKey];

    renderedItems.push(
      <NavLink
        key={item.href}
        to={item.href}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "group relative flex h-9 items-center gap-2.5 rounded-lg px-2 text-[13px] font-medium transition-all duration-150",
            isActive
              ? cn(c.activeRowBg, c.activeText, "font-semibold")
              : "text-sidebar-foreground/55 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground/80",
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-4 w-0.75 -translate-y-1/2 rounded-r-full",
                  c.activeBorder,
                )}
              />
            )}

            {/* Icon box */}
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150",
                isActive ? c.activeIconBg : c.iconBg,
              )}
            >
              <item.icon
                className={cn(
                  "h-3.75 w-3.75 transition-colors",
                  item.badge === "plan" && isVip && !isActive
                    ? "fill-amber-400/25 text-amber-400/70"
                    : item.badge === "plan" && isVip && isActive
                      ? "fill-amber-400/40 text-amber-400"
                      : isActive
                        ? c.activeIcon
                        : c.icon,
                )}
              />
            </span>

            <span className="flex-1 leading-none">{item.title}</span>

            {/* Plan badge */}
            {item.badge === "plan" && (
              isVip ? (
                <Crown className="h-3.5 w-3.5 fill-amber-400/30 text-amber-400" />
              ) : (
                <span className="inline-flex items-center rounded-md bg-sidebar-foreground/8 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-sidebar-foreground/35">
                  Free
                </span>
              )
            )}

            {/* Pendentes badge */}
            {item.badge === "pendentes" && pendentes > 0 && (
              <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                {pendentes > 99 ? "99+" : pendentes}
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
        "sidebar-bg relative flex h-screen min-h-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      {/* Orbs animados */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-primary/25 blur-3xl animate-float-slow dark:bg-primary/18"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-14 -right-8 h-52 w-52 rounded-full bg-primary/15 blur-3xl animate-drift dark:bg-primary/10"
        style={{ animationDelay: "-3s" }}
      />
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
  );
}
