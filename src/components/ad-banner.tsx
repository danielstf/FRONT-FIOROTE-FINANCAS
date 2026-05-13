import { Megaphone } from "lucide-react";
import { appAds } from "../config/ads";
import { Button } from "./ui/button";

export function AdBanner() {
  const ad = appAds[0];

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
