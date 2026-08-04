import type { ReactNode } from "react";
import { Activity, ChevronRight, Filter, Inbox, Loader2, Plus, RefreshCw, Sparkles } from "lucide-react";
import { useToast } from "@/lib/toast";
import { KpiCard } from "./KpiCard";


export function WallHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
      <section className="hero-surface relative overflow-hidden p-5 sm:p-7 lg:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-accent-pink/40 blur-3xl" />
        <div className="relative grid grid-cols-1 items-end gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/15 px-3 py-1 text-[11px] font-medium text-primary-foreground backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>Boss Panel</span>
              <ChevronRight className="h-3 w-3 opacity-70" />
              <span>Franchise Manager</span>
              {eyebrow && <ChevronRight className="h-3 w-3 opacity-70" />}
              {eyebrow && <span className="truncate">{eyebrow}</span>}
            </div>
            <h1 className="mt-4 text-2xl font-semibold leading-tight text-primary-foreground sm:text-3xl lg:text-[34px]">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 max-w-2xl text-sm text-primary-foreground/80 sm:text-[15px]">{description}</p>
            )}
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-[11px] font-medium text-primary-foreground">
              <Activity className="h-3 w-3" />
              Live workspace
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end [&>button]:border-primary-foreground/20 [&>button]:bg-primary-foreground/10 [&>button]:text-primary-foreground [&>button]:shadow-none [&>button:hover]:bg-primary-foreground/20 [&>button:last-child]:border-primary-foreground [&>button:last-child]:bg-primary-foreground [&>button:last-child]:text-primary [&>button:last-child:hover]:bg-primary-foreground/90">
            {actions ?? <DefaultWallActions title={title} />}
          </div>
        </div>
      </section>
    </div>
  );
}

function DefaultWallActions({ title }: { title: string }) {
  const { toast } = useToast();
  return (
    <>
      <Btn
        variant="ghost"
        onClick={() =>
          toast({ title: `${title} refreshed`, tone: "success" })
        }
      >
        <RefreshCw className="h-3.5 w-3.5" /> Refresh
      </Btn>
      <Btn
        variant="outline"
        onClick={() =>
          toast({
            title: "Filters",
            description: "Use the toolbar filters inside each section.",
            tone: "info",
          })
        }
      >
        <Filter className="h-3.5 w-3.5" /> Filter
      </Btn>
      <Btn
        variant="primary"
        onClick={() =>
          toast({
            title: `New ${title.toLowerCase()}`,
            description: "Creation flow will be enabled with the backend.",
            tone: "info",
          })
        }
      >
        <Plus className="h-3.5 w-3.5" /> New
      </Btn>
    </>
  );
}

export function WallBody({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</div>;
}

export function Section({
  title,
  description,
  actions,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      {(title || actions) && (
        <div className="flex items-end justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] ${padded ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
  trend,
  help,
  loading,
  onClick,
}: {
  label: string;
  value?: ReactNode;
  hint?: string;
  tone?: "neutral" | "success" | "warning" | "destructive" | "info";
  icon?: ReactNode;
  trend?: { pct: number; label?: string } | null;
  help?: string;
  loading?: boolean;
  onClick?: () => void;
}) {
  return (
    <KpiCard
      label={label}
      value={value}
      hint={hint}
      tone={tone}
      icon={icon}
      trend={trend}
      help={help}
      loading={loading}
      onClick={onClick}
    />
  );
}


export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="grid place-items-center px-6 py-12 text-center">
      <div className="grid h-10 w-10 place-items-center rounded-md border border-dashed border-border-strong text-muted-foreground">
        {icon ?? <Plus className="h-4 w-4" />}
      </div>
      <div className="mt-3 text-[14px] font-medium text-foreground">{title}</div>
      {description && (
        <p className="mt-1 max-w-md text-[12.5px] text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}

export function DataTable({
  columns,
  caption,
}: {
  columns: string[];
  caption?: string;
}) {
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="text-[12px] text-muted-foreground">
          {caption ?? "0 records"}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-surface-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {columns.map((c) => (
                <th key={c} className="whitespace-nowrap px-4 py-2.5 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className="px-4 py-14 text-center">
                <div className="mx-auto grid h-9 w-9 place-items-center rounded-md border border-dashed border-border-strong text-muted-foreground">
                  <Inbox className="h-4 w-4" />
                </div>
                <div className="mt-2 text-[13px] font-medium text-foreground">
                  No records yet
                </div>
                <div className="mx-auto mt-1 max-w-md text-[12px] text-muted-foreground">
                  Records will appear here once the backend is connected or data is imported.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function Btn({
  children,
  variant = "outline",
  loading = false,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "destructive";
  loading?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 h-9 min-w-9 text-[12.5px] font-medium transition-all duration-150 select-none active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--color-surface)] disabled:pointer-events-none disabled:opacity-50";
  const styles = {
    primary:
      "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
    outline:
      "border border-border bg-surface text-foreground hover:border-border-strong hover:bg-surface-2",
    ghost:
      "text-muted-foreground hover:text-foreground hover:bg-surface-2",
    destructive:
      "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  }[variant];
  return (
    <button
      type={rest.type ?? "button"}
      {...rest}
      disabled={rest.disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${styles} ${rest.className ?? ""}`}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}


export function PillRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span
          key={i}
          className="rounded-md border border-border bg-surface-2 px-2 py-1 text-[11.5px] text-foreground"
        >
          {i}
        </span>
      ))}
    </div>
  );
}
