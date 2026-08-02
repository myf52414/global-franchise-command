import { useState, type ReactNode } from "react";
import { Loader2, Lock, X } from "lucide-react";
import { ConfirmDialog } from "./Modal";
import { Tip } from "./Tooltip";
import { useToast } from "@/lib/toast";

export type BulkAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  tone?: "primary" | "outline" | "ghost" | "destructive";
  disabled?: boolean;
  /** Shown in a tooltip when disabled — never leave a dead button unexplained. */
  disabledReason?: string;
  confirm?: { title: string; description?: string; confirmLabel?: string };
  /** Return a message to show on success. Throw to surface the error state. */
  run: (ids: string[]) => Promise<string | void> | string | void;
};

/**
 * Sticky bulk-action toolbar. Appears above the viewport bottom whenever rows
 * are selected, with selection count, grouped actions, confirmation dialogs,
 * loading state and success/error toasts.
 */
export function BulkBar({
  ids,
  onClear,
  actions,
  entity = "records",
}: {
  ids: string[];
  onClear: () => void;
  actions: BulkAction[];
  entity?: string;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, setPending] = useState<BulkAction | null>(null);

  if (ids.length === 0) return null;

  const execute = async (a: BulkAction) => {
    setBusy(a.id);
    try {
      const msg = await a.run(ids);
      toast({
        title: msg || `${a.label} applied`,
        description: `${ids.length} ${entity} updated.`,
        tone: "success",
      });
      onClear();
    } catch (err) {
      toast({
        title: `${a.label} failed`,
        description: err instanceof Error ? err.message : "No changes were saved.",
        tone: "destructive",
      });
    } finally {
      setBusy(null);
      setPending(null);
    }
  };

  return (
    <>
      <div
        role="region"
        aria-label={`Bulk actions for ${ids.length} selected ${entity}`}
        className="pointer-events-none sticky bottom-4 z-40 flex justify-center px-2 duration-200 animate-in fade-in slide-in-from-bottom-2"
      >
        <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center gap-2 rounded-lg border border-border-strong bg-popover px-3 py-2 shadow-2xl">
          <span className="inline-flex items-center gap-2 rounded-md bg-primary px-2 py-1 text-[12px] font-semibold text-primary-foreground tabular-nums">
            {ids.length}
            <span className="font-medium opacity-90">selected</span>
          </span>

          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" />

          <div className="flex flex-wrap items-center gap-1.5">
            {actions.map((a) => {
              const btn = (
                <button
                  key={a.id}
                  type="button"
                  disabled={a.disabled || busy !== null}
                  aria-disabled={a.disabled || busy !== null}
                  onClick={() => (a.confirm ? setPending(a) : void execute(a))}
                  className={`inline-flex h-8 min-w-11 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-50 ${
                    a.tone === "destructive"
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : a.tone === "primary"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border bg-surface text-foreground hover:bg-surface-2"
                  }`}
                >
                  {busy === a.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : a.disabled ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    a.icon
                  )}
                  {busy === a.id ? "Working…" : a.label}
                </button>
              );
              return a.disabled && a.disabledReason ? (
                <Tip key={a.id} label={a.disabledReason}>{btn}</Tip>
              ) : (
                btn
              );
            })}
          </div>

          <button
            type="button"
            onClick={onClear}
            disabled={busy !== null}
            className="ml-auto inline-flex h-8 items-center gap-1 rounded-md px-2 text-[12px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!pending}
        busy={busy !== null}
        onClose={() => setPending(null)}
        onConfirm={() => pending && void execute(pending)}
        tone={pending?.tone === "destructive" ? "destructive" : "primary"}
        title={pending?.confirm?.title ?? "Confirm action"}
        description={pending?.confirm?.description}
        confirmLabel={pending?.confirm?.confirmLabel ?? pending?.label}
      >
        <p className="text-[12.5px] text-muted-foreground">
          This applies to <span className="font-medium text-foreground">{ids.length}</span> selected {entity} and is
          recorded in the audit trail.
        </p>
      </ConfirmDialog>
    </>
  );
}
