import { Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function FloatingShare() {
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);

  async function compartilharWhatsApp() {
    const url = window.location.origin;
    const text = encodeURIComponent(
      `Conheça o Fiorote Controle Financeiro para organizar receitas, despesas e relatórios financeiros: ${url}`,
    );

    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function fechar() {
    setHidden(true);
  }

  if (hidden) return null;

  return (
    <div className="fixed bottom-4 right-4 z-30 w-[min(320px,calc(100vw-2rem))] rounded-xl border border-emerald-500/25 bg-card/95 p-3 text-card-foreground shadow-2xl shadow-black/15 backdrop-blur-md">
      <button
        aria-label="Fechar compartilhamento"
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        type="button"
        onClick={fechar}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3 pr-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
          {copied ? (
            <Check className="h-5 w-5" />
          ) : (
            <svg
              aria-hidden="true"
              className="h-5 w-5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12.04 2a9.84 9.84 0 0 0-8.42 14.9L2.5 22l5.23-1.1A9.84 9.84 0 1 0 12.04 2Zm0 1.8a8.04 8.04 0 0 1 6.75 12.4 8.02 8.02 0 0 1-9.96 2.9l-.28-.13-3.77.8.8-3.67-.16-.3A8.04 8.04 0 0 1 12.04 3.8Zm-3.3 4.2c-.2 0-.53.08-.8.38-.27.3-1.05 1.02-1.05 2.48s1.08 2.88 1.23 3.08c.15.2 2.1 3.33 5.18 4.53 2.56 1 3.08.8 3.64.75.56-.05 1.8-.73 2.05-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35-.3-.15-1.8-.9-2.08-1-.28-.1-.48-.15-.68.15-.2.3-.78 1-.95 1.2-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.65-.93-2.25-.25-.6-.5-.52-.68-.53h-.58Z" />
            </svg>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">
            {copied ? "Link copiado" : "Compartilhe o Fiorote"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Envie pelo WhatsApp para quem também quer organizar as finanças.
          </p>
        </div>
      </div>

      <Button
        className="mt-3 w-full border-emerald-500/30 bg-emerald-500 text-white hover:bg-emerald-600"
        type="button"
        onClick={compartilharWhatsApp}
      >
        Compartilhar no WhatsApp
      </Button>
    </div>
  );
}
