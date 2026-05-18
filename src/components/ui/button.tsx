import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
};

const variants = {
  default:
    "border border-primary/20 bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 hover:shadow-md focus-visible:ring-ring",
  outline:
    "border border-input bg-background text-foreground shadow-sm hover:border-primary/35 hover:bg-accent hover:text-accent-foreground hover:shadow-md focus-visible:ring-ring",
  ghost:
    "text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring",
  secondary:
    "border border-border bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md focus-visible:ring-ring",
  destructive:
    "border border-destructive/20 bg-destructive text-white shadow-sm shadow-destructive/20 hover:bg-destructive/90 hover:shadow-md focus-visible:ring-destructive",
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
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-all duration-200 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
