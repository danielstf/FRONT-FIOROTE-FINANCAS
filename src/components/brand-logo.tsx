import { cn } from "../lib/utils";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  mood?: "positive" | "negative" | "neutral";
  size?: "default" | "large" | "sidebar";
};

export function BrandLogo({
  compact = false,
  className,
  mood = "neutral",
  size = "default",
}: BrandLogoProps) {
  const isNegative = mood === "negative";
  const logoSrc = isNegative ? "/logo-real-negative.png" : "/logo-real-positive.png";
  const iconSize =
    size === "large"
      ? "h-20 w-20"
      : size === "sidebar"
        ? "h-16 w-16"
        : "h-14 w-14";
  const titleSize =
    size === "large"
      ? "text-3xl sm:text-4xl"
      : size === "sidebar"
        ? "text-xl xl:text-2xl"
        : "text-xl";
  const subtitleSize = size === "sidebar" ? "text-xs xl:text-sm" : "text-xs";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        alt={isNegative ? "Fiorote Control saldo negativo" : "Fiorote Control"}
        className={cn("shrink-0 object-contain drop-shadow-sm", iconSize)}
        src={logoSrc}
      />

      {!compact && (
        <span className="min-w-0 leading-none">
          <span
            className={cn(
              "block font-black uppercase tracking-normal text-foreground drop-shadow-sm",
              titleSize,
            )}
          >
            Fiorote
          </span>
          <span
            className={cn(
              "block text-center font-extrabold uppercase tracking-[0.26em]",
              isNegative ? "text-red-600" : "text-primary",
              subtitleSize,
            )}
          >
            Control
          </span>
        </span>
      )}
    </div>
  );
}
