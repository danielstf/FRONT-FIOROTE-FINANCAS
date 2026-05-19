import { cn } from "../lib/utils";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  mood?: "positive" | "negative" | "neutral";
  size?: "default" | "large" | "sidebar";
};

export function BrandLogo({
  className,
  mood = "neutral",
  size = "default",
}: BrandLogoProps) {
  const isNegative = mood === "negative";
  const logoSrc = isNegative
    ? "/logo-fiorote-control-negative.png"
    : "/logo-fiorote-control-positive.png";
  const logoSize =
    size === "large"
      ? "h-24 w-auto max-w-[340px] sm:max-w-[420px]"
      : size === "sidebar"
        ? "h-20 w-auto max-w-[240px]"
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
