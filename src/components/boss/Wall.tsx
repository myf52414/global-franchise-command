import type { ReactNode } from "react";
import { ChevronRight, Filter, Inbox, Loader2, Plus, RefreshCw } from "lucide-react";
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
    <div className="relative flex flex-wrap items-end justify-between gap-4 overflow-hidden border-b border-border bg-surface bg-[radial-gradient(70%_140%_at_0%_0%,color-mix(in_oklab,var(--color-primary)_22%,transparent),transparent_70%),radial-gradient(50%_120%_at_100%_0%,color-mix(in_oklab,var(--color-accent-pink)_12%,transparent),transparent_70%)] px-6 py-6">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <span>Boss Panel</span>
            <ChevronRight className="h-3 w-3" />
            <span>Franchise Manager</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{eyebrow}</span>
          </div>
        )}
        <h1 className="text-[20px] font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions ?? <DefaultWallActions title={title} />}
      </div>
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
  return <div className="space-y-6 px-6 py-6">{children}</div>;
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
