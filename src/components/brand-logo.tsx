import { cn } from "../lib/utils";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  mood?: "positive" | "negative" | "neutral";
  size?: "default" | "large" | "sidebar" | "nav";
};

export function BrandLogo({
  compact = false,
  className,
  mood = "neutral",
  size = "default",
}: BrandLogoProps) {
  const isNegative = mood === "negative";
  const logoSrc = isNegative
    ? "/logo-fiorote-control-negative.png"
    : "/logo-fiorote-control-positive.png";
  const logoSize = compact
    ? "h-10 w-auto max-w-[150px] sm:max-w-[170px]"
    : size === "large"
      ? "h-24 w-auto max-w-[340px] sm:max-w-[420px]"
      : size === "nav"
        ? "h-11 w-auto max-w-[160px] sm:h-12 sm:max-w-[190px] lg:h-14 lg:max-w-[220px]"
      : size === "sidebar"
        ? "h-[72px] w-auto max-w-[230px]"
        : "h-14 w-auto max-w-[220px]";

  return (
    <div className={cn("flex min-w-0 items-center", className)}>
      <img
        alt={isNegative ? "Fiorote Control saldo negativo" : "Fiorote Control"}
        className={cn("shrink-0 object-contain drop-shadow-sm", logoSize)}
        src={logoSrc}
      />
    </div>
  );
}
