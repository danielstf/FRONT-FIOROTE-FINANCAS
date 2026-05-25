import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

type MonthPickerProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const months = Array.from({ length: 12 }, (_, index) => {
  const date = new Date(2026, index, 1);

  return {
    value: String(index + 1).padStart(2, "0"),
    label: new Intl.DateTimeFormat("pt-BR", { month: "short" })
      .format(date)
      .replace(".", ""),
  };
});

function parseMonth(value: string) {
  const [year, month] = value.split("-").map(Number);

  return {
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
    month: Number.isFinite(month) ? month : new Date().getMonth() + 1,
  };
}

function toMonthValue(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function formatMonthLabel(value: string) {
  const { year, month } = parseMonth(value);
  const date = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function MonthPicker({ value, onChange, className }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseMonth(value), [value]);
  const [viewYear, setViewYear] = useState(selected.year);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>();

  function updatePopoverPosition() {
    const trigger = rootRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const estimatedHeight = 224;
    const width = Math.min(280, window.innerWidth - viewportPadding * 2);
    const left = Math.min(
      Math.max(viewportPadding, rect.right - width),
      window.innerWidth - width - viewportPadding,
    );

    const top =
      rect.bottom + 8 + estimatedHeight <= window.innerHeight - viewportPadding
        ? rect.bottom + 8
        : Math.max(viewportPadding, rect.top - estimatedHeight - 8);

    setPopoverStyle({
      left,
      top,
      width,
      maxHeight: window.innerHeight - viewportPadding * 2,
    });
  }

  useLayoutEffect(() => {
    if (!open) return;

    updatePopoverPosition();
  }, [open, value, viewYear]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        rootRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function changeBy(offset: number) {
    const date = new Date(selected.year, selected.month - 1 + offset, 1);
    const nextValue = toMonthValue(date.getFullYear(), date.getMonth() + 1);

    setViewYear(date.getFullYear());
    onChange(nextValue);
  }

  function selectMonth(month: string) {
    onChange(`${viewYear}-${month}`);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative w-full min-w-0", className)}>
      <div className="grid h-10 grid-cols-[40px_1fr_40px] items-center overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <Button
          aria-label="Mês anterior"
          className="h-10 rounded-none border-0 px-0 text-muted-foreground hover:text-foreground"
          type="button"
          variant="ghost"
          onClick={() => changeBy(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <button
          className="h-10 min-w-0 truncate border-x border-border px-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:px-3 sm:text-sm"
          type="button"
          onClick={() => {
            setViewYear(selected.year);
            setOpen((current) => !current);
          }}
        >
          {formatMonthLabel(value)}
        </button>

        <Button
          aria-label="Próximo mês"
          className="h-10 rounded-none border-0 px-0 text-muted-foreground hover:text-foreground"
          type="button"
          variant="ghost"
          onClick={() => changeBy(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {open &&
        popoverStyle &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-50 overflow-y-auto rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-xl"
            style={popoverStyle}
          >
            <div className="mb-3 flex items-center justify-between">
              <Button
                aria-label="Ano anterior"
                className="h-8 w-8 px-0"
                type="button"
                variant="outline"
                onClick={() => setViewYear((year) => year - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold">{viewYear}</span>
              <Button
                aria-label="Próximo ano"
                className="h-8 w-8 px-0"
                type="button"
                variant="outline"
                onClick={() => setViewYear((year) => year + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {months.map((month) => {
                const selectedMonth =
                  selected.year === viewYear &&
                  selected.month === Number(month.value);

                return (
                  <button
                    key={month.value}
                    className={cn(
                      "min-w-0 rounded-md border border-border bg-background px-2 py-2 text-sm font-medium capitalize transition-colors hover:bg-accent hover:text-accent-foreground",
                      selectedMonth &&
                        "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    )}
                    type="button"
                    onClick={() => selectMonth(month.value)}
                  >
                    {month.label}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

