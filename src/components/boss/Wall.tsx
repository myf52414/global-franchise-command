import type { ReactNode } from "react";
import { ChevronRight, Filter, Plus, RefreshCw } from "lucide-react";

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
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border bg-surface px-6 py-5">
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
        {actions ?? (
          <>
            <Btn variant="ghost"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Btn>
            <Btn variant="outline"><Filter className="h-3.5 w-3.5" /> Filter</Btn>
            <Btn variant="primary"><Plus className="h-3.5 w-3.5" /> New</Btn>
          </>
        )}
      </div>
    </div>
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
      className={`rounded-lg border border-border bg-card ${padded ? "p-4" : ""} ${className}`}
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
}: {
  label: string;
  value?: ReactNode;
  hint?: string;
  tone?: "neutral" | "success" | "warning" | "destructive" | "info";
}) {
  const toneClass = {
    neutral: "text-foreground",
    success: "text-[color:var(--color-success)]",
    warning: "text-[color:var(--color-warning)]",
    destructive: "text-destructive",
    info: "text-[color:var(--color-info)]",
  }[tone];
  return (
    <Card>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`mt-2 text-[22px] font-semibold leading-none tracking-tight ${toneClass}`}>
        {value ?? <span className="text-muted-foreground/60">—</span>}
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">
        {hint ?? "Awaiting data source"}
      </div>
    </Card>
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
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>Connect data source to populate</span>
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
              <td
                colSpan={columns.length}
                className="px-4 py-16 text-center text-muted-foreground"
              >
                No records yet — table is wired and waiting for the backend.
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
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "destructive";
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-md px-2.5 h-8 text-[12.5px] font-medium transition-colors disabled:opacity-50";
  const styles = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-border bg-surface text-foreground hover:bg-surface-2",
    ghost:
      "text-muted-foreground hover:text-foreground hover:bg-surface-2",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  }[variant];
  return (
    <button {...rest} className={`${base} ${styles} ${rest.className ?? ""}`}>
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
