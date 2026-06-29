import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function RightPanel({
  open,
  onClose,
  title,
  eyebrow,
  width = "max-w-xl",
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  width?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full ${width} flex flex-col border-l border-border bg-surface shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {eyebrow && (
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                {eyebrow}
              </div>
            )}
            <h2 className="mt-0.5 truncate text-[15px] font-semibold text-foreground">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md border border-transparent text-muted-foreground hover:border-border hover:bg-surface-2 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <footer className="border-t border-border bg-surface-2 px-5 py-3">{footer}</footer>
        )}
      </aside>
    </div>
  );
}
