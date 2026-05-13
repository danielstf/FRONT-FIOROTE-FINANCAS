import type { ComponentProps, CSSProperties, HTMLAttributes, ReactNode } from "react";
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  type TooltipContentProps,
  type TooltipValueType,
} from "recharts";
import { cn } from "../../lib/utils";

export const ChartTooltip = RechartsTooltip;

export type ChartConfig = Record<
  string,
  {
    color?: string;
    label?: ReactNode;
  }
>;

type ChartContainerProps = HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig;
};

type ChartTooltipContentProps = Partial<TooltipContentProps<TooltipValueType, string>> & {
  className?: string;
  formatter?: (value: TooltipValueType | undefined, name: string) => ReactNode;
  labelFormatter?: (label: string | number | undefined) => ReactNode;
  nameFormatter?: (name: string) => ReactNode;
};

export function ChartContainer({
  children,
  className,
  config,
  style,
  ...props
}: ChartContainerProps) {
  const chartStyle = Object.entries(config).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value.color) {
      acc[`--color-${key}`] = value.color;
    }

    return acc;
  }, {});

  return (
    <div
      className={cn(
        "flex aspect-video justify-center text-xs",
        "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border",
        "[&_.recharts-tooltip-cursor]:fill-muted [&_.recharts-tooltip-cursor]:opacity-30",
        className,
      )}
      style={{ ...(chartStyle as CSSProperties), ...style }}
      {...props}
    >
      <ResponsiveContainer height="100%" width="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function ChartTooltipContent({
  active,
  className,
  formatter,
  label,
  labelFormatter,
  nameFormatter,
  payload,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid min-w-[11rem] gap-2 rounded-md border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md",
        className,
      )}
    >
      {label !== undefined && (
        <div className="font-medium text-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item) => {
          const name = String(item.name ?? item.dataKey ?? "");
          const color = item.color ?? item.fill ?? "hsl(var(--muted-foreground))";

          return (
            <div
              className="flex items-center justify-between gap-4 text-muted-foreground"
              key={name}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span>{nameFormatter ? nameFormatter(name) : name}</span>
              </div>
              <span className="font-medium text-foreground">
                {formatter ? formatter(item.value, name) : item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type ChartTooltipProps = ComponentProps<typeof RechartsTooltip>;
