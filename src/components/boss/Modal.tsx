import { useEffect, useRef, type ReactNode } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Btn } from "./Wall";

/**
 * Accessible modal dialog: Escape to close, focus trap, restores focus on
 * close, scroll-locked body, responsive (bottom sheet on mobile).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  size = "md",
  footer,
  children,
  closeOnBackdrop = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  footer?: ReactNode;
  children?: ReactNode;
  closeOnBackdrop?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    const t = window.setTimeout(() => focusables()[0]?.focus(), 20);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      restore.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const width = { sm: "sm:max-w-md", md: "sm:max-w-2xl", lg: "sm:max-w-4xl" }[size];

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px] animate-in fade-in duration-150"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[92dvh] w-full ${width} flex-col overflow-hidden rounded-t-xl border border-border bg-surface shadow-2xl duration-200 animate-in fade-in slide-in-from-bottom-4 sm:rounded-xl sm:slide-in-from-bottom-0 sm:zoom-in-95`}
      >
        <header className="flex items-start gap-3 border-b border-border px-5 py-4">
          {icon && (
            <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
            {description && (
              <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface-2 px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/** Confirmation dialog with loading state and tone-aware confirm button. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  busy = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "destructive";
  busy?: boolean;
  children?: ReactNode;
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      description={description}
      size="sm"
      closeOnBackdrop={!busy}
      icon={<AlertTriangle className="h-4 w-4" />}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Btn>
          <Btn variant={tone} onClick={onConfirm} disabled={busy}>
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {busy ? "Working…" : confirmLabel}
          </Btn>
        </>
      }
    >
      {children ?? (
        <p className="text-[12.5px] text-muted-foreground">
          This action will be recorded in the audit trail.
        </p>
      )}
    </Modal>
  );
}
