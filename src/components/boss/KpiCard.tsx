import type { ReactNode } from "react";
import { HelpCircle, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Tip } from "./Tooltip";

export type KpiTone = "neutral" | "success" | "warning" | "destructive" | "info";

const TONE_TEXT: Record<KpiTone, string> = {
  neutral: "text-foreground",
  success: "text-[color:var(--color-success)]",
  warning: "text-[color:var(--color-warning)]",
  destructive: "text-destructive",
  info: "text-[color:var(--color-info)]",
};

const TONE_ICON: Record<KpiTone, string> = {
  neutral: "bg-surface-2 text-muted-foreground",
  success: "bg-[color:color-mix(in_oklab,var(--color-success)_14%,transparent)] text-[color:var(--color-success)]",
  warning: "bg-[color:color-mix(in_oklab,var(--color-warning)_14%,transparent)] text-[color:var(--color-warning)]",
  destructive: "bg-[color:color-mix(in_oklab,var(--destructive)_12%,transparent)] text-destructive",
  info: "bg-[color:color-mix(in_oklab,var(--color-info)_14%,transparent)] text-[color:var(--color-info)]",
};

/**
 * Enterprise KPI card: skeleton while loading, explicit no-data state, trend
 * indicator with growth %, optional icon and help tooltip.
 */
export function KpiCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
  trend,
  help,
  loading = false,
  refreshing = false,
  onClick,
}: {
  label: string;
  value?: ReactNode;
  hint?: string;
  tone?: KpiTone;
  icon?: ReactNode;
  trend?: { pct: number; label?: string } | null;
  help?: string;
  loading?: boolean;
  refreshing?: boolean;
  onClick?: () => void;
}) {
  const hasValue = value !== undefined && value !== null && value !== "";
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={`group relative w-full overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-[var(--shadow-card)] transition-all duration-200 ${
        onClick
          ? "hover:-translate-y-px hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
          : ""
      } ${refreshing ? "animate-pulse" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {help && (
            <Tip label={help}>
              <button
                type="button"
                tabIndex={0}
                aria-label={`About ${label}`}
                className="grid h-4 w-4 place-items-center rounded text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
                onClick={(e) => e.preventDefault()}
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </Tip>
          )}
        </div>
        {icon && (
          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${TONE_ICON[tone]}`} aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      {loading ? (
        <>
          <div className="mt-3 h-6 w-24 animate-pulse rounded bg-surface-2" />
          <div className="mt-2.5 h-3 w-16 animate-pulse rounded bg-surface-2" />
          <span className="sr-only">Loading {label}</span>
        </>
      ) : (
        <>
          <div
            className={`mt-2.5 text-[22px] font-semibold leading-none tracking-tight tabular-nums ${
              hasValue ? TONE_TEXT[tone] : "text-muted-foreground/50"
            }`}
          >
            {hasValue ? value : "—"}
          </div>
          <div className="mt-2 flex items-center gap-2">
            {trend ? <TrendPill pct={trend.pct} label={trend.label} /> : null}
            <span className="truncate text-[11px] text-muted-foreground">
              {hint ?? (hasValue ? "" : "No data yet")}
            </span>
          </div>
        </>
      )}
    </Wrapper>
  );
}

export function TrendPill({ pct, label }: { pct: number; label?: string }) {
  const up = pct > 0;
  const flat = pct === 0;
  const cls = flat
    ? "bg-surface-2 text-muted-foreground"
    : up
      ? "bg-[color:color-mix(in_oklab,var(--color-success)_14%,transparent)] text-[color:var(--color-success)]"
      : "bg-[color:color-mix(in_oklab,var(--destructive)_10%,transparent)] text-destructive";
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${cls}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {up ? "+" : ""}
      {pct.toFixed(1)}%
      <span className="sr-only">
        {flat ? "no change" : up ? "increase" : "decrease"} {label ? `versus ${label}` : ""}
      </span>
      {label && <span className="font-normal opacity-70">{label}</span>}
    </span>
  );
}

/** Grid wrapper so every wall lays KPIs out identically across breakpoints. */
export function KpiGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">{children}</div>;
}
