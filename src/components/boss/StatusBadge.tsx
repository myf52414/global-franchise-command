import type { ReactNode } from "react";
import { STATUS_TONE } from "@/lib/franchise-domain";

const TONE: Record<string, string> = {
  success:
    "bg-[color:color-mix(in_oklab,var(--color-success)_14%,transparent)] text-[color:var(--color-success)] border-[color:color-mix(in_oklab,var(--color-success)_30%,transparent)]",
  warning:
    "bg-[color:color-mix(in_oklab,var(--color-warning)_14%,transparent)] text-[color:var(--color-warning)] border-[color:color-mix(in_oklab,var(--color-warning)_30%,transparent)]",
  destructive:
    "bg-[color:color-mix(in_oklab,var(--destructive)_12%,transparent)] text-destructive border-[color:color-mix(in_oklab,var(--destructive)_28%,transparent)]",
  info:
    "bg-[color:color-mix(in_oklab,var(--color-info)_14%,transparent)] text-[color:var(--color-info)] border-[color:color-mix(in_oklab,var(--color-info)_30%,transparent)]",
  neutral:
    "bg-surface-2 text-muted-foreground border-border",
};

export function StatusBadge({
  status,
  children,
}: {
  status: keyof typeof STATUS_TONE | string;
  children?: ReactNode;
}) {
  const tone = (STATUS_TONE as Record<string, keyof typeof TONE>)[status] ?? "neutral";
  const label = children ?? String(status).replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${TONE[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
