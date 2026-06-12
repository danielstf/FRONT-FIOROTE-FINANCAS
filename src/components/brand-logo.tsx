import { cn } from "../lib/utils";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  size?: "default" | "large" | "sidebar" | "nav";
};

export function BrandLogo({
  compact = false,
  className,
  size = "default",
}: BrandLogoProps) {
  const logoSize = compact
    ? "h-10 w-auto max-w-[170px]"
    : size === "large"
      ? "h-28 w-auto max-w-[440px]"
      : size === "sidebar"
        ? "h-20 w-auto max-w-[230px]"
        : size === "nav"
          ? "h-12 w-auto max-w-[220px] sm:h-14 sm:max-w-[260px]"
          : "h-14 w-auto max-w-[240px]";

  return (
    <div
      aria-label="FIOROTE controle financeiro"
      className={cn("flex min-w-0 items-center", className)}
    >
      <img
        alt="FIOROTE controle financeiro"
        className={cn("shrink-0 object-contain dark:hidden", logoSize)}
        src="/logo-completo.svg"
      />
      <img
        alt="FIOROTE controle financeiro"
        className={cn("hidden shrink-0 object-contain dark:block", logoSize)}
        src="/logo-fiorote-controle-financeiro-transparent-tight.png"
      />
    </div>
  );
}
