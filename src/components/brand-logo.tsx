import { WalletCards } from "lucide-react";
import { cn } from "../lib/utils";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <WalletCards className="h-5 w-5" />
      </div>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-foreground">
            Minhas Finanças
          </p>
          <p className="truncate text-xs font-medium uppercase text-primary">
            Fiorote
          </p>
        </div>
      )}
    </div>
  );
}
