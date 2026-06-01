import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";

type PageHeaderProps = {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
};

export function PageHeader({
  icon: Icon,
  iconClassName = "bg-primary/10 text-primary",
  title,
  subtitle,
  right,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            iconClassName,
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {right && (
        <div className="flex flex-wrap items-center gap-2">{right}</div>
      )}
    </div>
  );
}
