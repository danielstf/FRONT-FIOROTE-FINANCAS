import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, MessageSquareText } from "lucide-react";
import { pagamentosApi } from "../api/pagamentos/pagamentos-api";
import { AdBanner } from "../components/ad-banner";
import { BrandLogo } from "../components/brand-logo";
import { Sidebar } from "../components/sidebar";
import { ThemeToggle } from "../components/theme-toggle";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { useAuth } from "../providers/auth-provider";

export function AppLayout() {
  const { session } = useAuth();
  const [showAds, setShowAds] = useState(session?.usuario.plano !== "PREMIUM");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function carregarAnuncios() {
      try {
        const status = await pagamentosApi.consultarPremium();
        setShowAds(session?.usuario.plano !== "PREMIUM" && status.exibirAnuncios);
      } catch {
        setShowAds(session?.usuario.plano !== "PREMIUM");
      }
    }

    void carregarAnuncios();
  }, [session?.usuario.plano]);

  return (
    <div className="h-screen overflow-hidden bg-muted/35 text-foreground lg:grid lg:grid-cols-[280px_1fr]">
      <Sidebar className="hidden lg:flex lg:flex-col" />

      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="left-0 top-0 h-screen max-h-screen w-80 max-w-[calc(100%-2rem)] translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-y-0 border-l-0 p-0 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left">
          <Sidebar
            className="flex h-full flex-col border-r-0"
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="flex min-h-0 min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              aria-label="Abrir menu"
              className="h-9 w-9 px-0 lg:hidden"
              variant="outline"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <BrandLogo compact className="lg:hidden" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {session?.usuario.nome}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session?.usuario.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-normal text-primary sm:inline-flex">
              {session?.usuario.plano ?? "FREE"}
            </span>
            <Button
              asChild
              aria-label="Enviar sugestão, reclamação ou elogio"
              className="h-9 w-9 px-0"
              title="Atendimento"
              variant="outline"
            >
              <Link to="/app/sugestoes">
                <MessageSquareText className="h-4 w-4" />
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl space-y-5 p-4 lg:p-6">
            {showAds && <AdBanner />}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
