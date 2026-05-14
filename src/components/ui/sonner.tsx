import { Toaster as Sonner } from "sonner";
import { useTheme } from "../../providers/theme-provider";

export function Toaster() {
  const { theme } = useTheme();

  return (
    <Sonner
      closeButton
      richColors
      theme={theme}
      toastOptions={{
        classNames: {
          toast: "border border-border bg-popover text-popover-foreground shadow-md",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}
