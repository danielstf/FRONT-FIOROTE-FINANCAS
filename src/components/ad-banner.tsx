import { useEffect } from "react";
import { Megaphone } from "lucide-react";
import { appAds } from "../config/ads";
import { Button } from "./ui/button";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const adsenseClient = "ca-pub-2022032035131535";
const adsenseSlot = import.meta.env.VITE_GOOGLE_ADSENSE_SLOT as string | undefined;

export function AdBanner() {
  const ad = appAds[0];

  useEffect(() => {
    if (!adsenseSlot) return;

    // Injeta o script do AdSense apenas quando o banner é exibido
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    try {
      window.adsbygoogle = window.adsbygoogle ?? [];
      window.adsbygoogle.push({});
    } catch (error) {
      if (import.meta.env.DEV) console.warn("AdSense load failed:", error);
    }
  }, []);

  if (adsenseSlot) {
    return (
      <div className="rounded-lg border border-border bg-card p-2 shadow-sm">
        <ins
          className="adsbygoogle block min-h-24"
          data-ad-client={adsenseClient}
          data-ad-format="auto"
          data-ad-slot={adsenseSlot}
          data-full-width-responsive="true"
          style={{ display: "block" }}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-foreground">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background text-primary">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{ad.title}</p>
            <p className="text-muted-foreground">{ad.description}</p>
          </div>
        </div>
        <Button asChild className="shrink-0" variant="outline">
          <a href={ad.href}>{ad.cta}</a>
        </Button>
      </div>
    </div>
  );
}
