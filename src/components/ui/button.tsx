import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
};

const variants = {
  default:
    "border border-primary/30 bg-primary text-primary-foreground shadow-lg shadow-primary/20 before:bg-white/15 hover:bg-primary/95 hover:shadow-xl hover:shadow-primary/25 focus-visible:ring-ring",
  outline:
    "border border-input bg-background text-foreground shadow-sm before:bg-primary/5 hover:border-primary/40 hover:bg-background hover:text-foreground hover:shadow-md hover:shadow-primary/10 focus-visible:ring-ring",
  ghost:
    "text-foreground before:bg-accent hover:bg-transparent hover:text-accent-foreground focus-visible:ring-ring",
  secondary:
    "border border-border bg-secondary text-secondary-foreground shadow-sm before:bg-white/10 hover:bg-secondary/90 hover:shadow-md focus-visible:ring-ring",
  destructive:
    "border border-destructive/30 bg-destructive text-white shadow-lg shadow-destructive/20 before:bg-white/15 hover:bg-destructive/95 hover:shadow-xl hover:shadow-destructive/25 focus-visible:ring-destructive",
};

export function Button({
  asChild = false,
  className,
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      type={type}
      className={cn(
        "relative isolate inline-flex h-9 items-center justify-center gap-1.5 overflow-hidden rounded-md px-3 text-[13px] font-semibold tracking-normal transition-all duration-200 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:opacity-0 before:transition-opacity after:pointer-events-none after:absolute after:inset-x-2 after:top-0 after:h-px after:bg-white/35 after:opacity-0 after:transition-opacity hover:-translate-y-0.5 hover:before:opacity-100 hover:after:opacity-100 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
