import {
  BarChart3,
  CreditCard,
  Home,
  LogOut,
  ReceiptText,
  Settings,
  WalletCards,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../providers/auth-provider";
import { cn } from "../lib/utils";
import { BrandLogo } from "./brand-logo";
import { Button } from "./ui/button";

const menuItems = [
  { title: "Dashboard", href: "/app", icon: Home, end: true },
  { title: "Receitas", href: "/app/receitas", icon: WalletCards },
  { title: "Despesas", href: "/app/despesas", icon: ReceiptText },
  { title: "Cartoes", href: "/app/cartoes", icon: CreditCard },
  { title: "Relatorios", href: "/app/relatorios", icon: BarChart3 },
  { title: "Premium", href: "/app/premium", icon: CreditCard },
  { title: "Configuracoes", href: "/app/configuracoes", icon: Settings },
];

export function Sidebar() {
  const { logout, session } = useAuth();

  return (
    <aside className="hidden h-screen min-h-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="border-b border-sidebar-border p-5">
        <div className="space-y-3">
          <BrandLogo />
          <p className="rounded-md bg-sidebar-accent px-3 py-2 text-xs font-medium text-sidebar-accent-foreground">
            Plano {session?.usuario.plano ?? "FREE"}
          </p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Button className="w-full justify-start" variant="ghost" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
