import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../lib/utils";

const DAY_HEADERS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function parseIso(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return isNaN(d.getTime()) ? null : d;
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(value: string): string {
  const d = parseIso(value);
  if (!d) return "";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(d);
}

type DatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function DatePicker({ id, value, onChange, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const d = parseIso(value);
    return d
      ? new Date(d.getFullYear(), d.getMonth(), 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [calStyle, setCalStyle] = useState<CSSProperties>({});

  // Sincroniza o mês visualizado quando o valor muda externamente
  useEffect(() => {
    const d = parseIso(value);
    if (d) setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

  // Posiciona o calendário (fixed, relativo ao trigger)
  function updatePosition() {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const calW = 280;
    const calH = 320;
    const pad = 8;

    let top = rect.bottom + 4;
    if (top + calH > window.innerHeight - pad) {
      top = rect.top - calH - 4;
    }

    let left = rect.left;
    if (left + calW > window.innerWidth - pad) {
      left = window.innerWidth - calW - pad;
    }

    setCalStyle({ position: "fixed", top, left, width: calW, zIndex: 9999 });
  }

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleDaySelect(day: number) {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(toIso(d));
    setOpen(false);
  }

  function changeMonth(offset: number) {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1),
    );
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const selected = parseIso(value);

  const cells: Array<number | null> = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  return (
    // O wrapper inclui o trigger E o calendário — ambos na subárvore do Dialog
    // O Radix não bloqueia cliques dentro da subárvore do Dialog
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      {/* Trigger */}
      <div className="flex h-10 items-center overflow-hidden rounded-lg border border-input bg-background">
        <button
          id={id}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2 px-3 text-sm transition-colors hover:bg-accent"
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span
            className={cn(
              "flex-1 text-left",
              !value && "text-muted-foreground",
            )}
          >
            {value ? formatDisplay(value) : "Selecionar data"}
          </span>
        </button>

        {value && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange("")}
            className="flex h-10 w-9 shrink-0 items-center justify-center border-l border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Calendário — fixed dentro do DOM do wrapper (não usa portal) */}
      {open && (
        <div
          style={calStyle}
          className="rounded-xl border border-border bg-popover p-3 shadow-xl"
        >
          {/* Navegação de mês */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm font-semibold capitalize">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Cabeçalhos dos dias */}
          <div className="mb-1 grid grid-cols-7">
            {DAY_HEADERS.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
              >
                {d[0]}
              </div>
            ))}
          </div>

          {/* Grade de dias */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;

              const isSelected =
                selected !== null &&
                selected.getFullYear() === year &&
                selected.getMonth() === month &&
                selected.getDate() === day;

              const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDaySelect(day)}
                  className={cn(
                    "flex h-8 w-full items-center justify-center rounded-md text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                        ? "border border-primary/40 text-primary hover:bg-primary/10"
                        : "hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
