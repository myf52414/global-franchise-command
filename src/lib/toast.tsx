import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";

type Toast = {
  id: string;
  title: string;
  description?: string;
  tone: "success" | "info" | "warning" | "destructive";
};

const ToastCtx = createContext<{
  toast: (t: Omit<Toast, "id">) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4500);
  }, []);

  const remove = (id: string) => setToasts((p) => p.filter((x) => x.id !== id));

  const iconFor = (tone: Toast["tone"]) => {
    if (tone === "success") return <CheckCircle2 className="h-4 w-4 text-[color:var(--color-success)]" />;
    if (tone === "warning") return <TriangleAlert className="h-4 w-4 text-[color:var(--color-warning)]" />;
    if (tone === "destructive") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Info className="h-4 w-4 text-[color:var(--color-info)]" />;
  };

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-popover p-3 shadow-lg"
          >
            <div className="mt-0.5">{iconFor(t.tone)}</div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-popover-foreground">{t.title}</div>
              {t.description && (
                <div className="mt-0.5 text-[12px] text-muted-foreground">{t.description}</div>
              )}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
