import { cn } from "../lib/utils";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  size?: "default" | "large" | "sidebar";
};

export function BrandLogo({
  compact = false,
  className,
  size = "default",
}: BrandLogoProps) {
  const logoSize =
    size === "large"
      ? "h-10 sm:h-14 lg:h-16"
      : size === "sidebar"
        ? "h-16 xl:h-20"
        : "h-11 sm:h-12";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {compact ? (
        <img
          alt="Fiorote Control"
          className="h-10 w-10 shrink-0 object-contain"
          src="/logo-fiorote-control-icon.png"
        />
      ) : (
        <>
          <img
            alt="Fiorote Control"
            className={cn("w-auto object-contain dark:hidden", logoSize)}
            src="/logo-fiorote-control.png"
          />
          <img
            alt="Fiorote Control"
            className={cn("hidden w-auto object-contain dark:block", logoSize)}
            src="/logo-fiorote-control-dark.png"
          />
        </>
      )}
    </div>
  );
}
