import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export const statCardVariant = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export const statsContainerVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

type StatCardProps = {
  label: string;
  value: ReactNode;
  loading?: boolean;
  icon?: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
  className?: string;
  glowClassName?: string;
};

export function StatCard({
  label,
  value,
  loading,
  icon: Icon,
  iconClassName = "bg-primary/10 text-primary",
  valueClassName = "text-foreground",
  className,
  glowClassName,
}: StatCardProps) {
  return (
    <motion.div
      variants={statCardVariant}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-5 cursor-default",
        className,
      )}
    >
      {/* Linha de destaque no topo — para cards coloridos que não herdam do CSS global */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px z-10"
        style={{
          background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.45) 50%, transparent 100%)",
        }}
      />
      {glowClassName && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-0 top-0 h-20 w-20 -translate-y-4 translate-x-4 rounded-full blur-2xl",
            glowClassName,
          )}
        />
      )}

      {Icon && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              iconClassName,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
      )}

      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1.5 text-2xl font-bold tabular-nums", valueClassName)}>
        {loading ? "—" : value}
      </p>
    </motion.div>
  );
}
