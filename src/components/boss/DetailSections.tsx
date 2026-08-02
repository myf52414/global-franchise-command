import type { ReactNode } from "react";
import {
  Activity,
  BadgeCheck,
  CircleDashed,
  Clock,
  FileCheck2,
  Landmark,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Card } from "./Wall";
import { StatusBadge } from "./StatusBadge";
import { Tip } from "./Tooltip";

/* ---------------------------------- shared --------------------------------- */

export function PanelSection({
  title,
  icon,
  actions,
  children,
}: {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {icon}
          {title}
        </h3>
        {actions}
      </div>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-7 w-7 shrink-0 animate-pulse rounded-md bg-surface-2" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PanelEmpty({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center gap-2 rounded-md border border-dashed border-border-strong bg-surface-2/60 px-4 py-7 text-center">
      <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground">
        {icon ?? <CircleDashed className="h-4 w-4" />}
      </span>
      <span className="text-[12.5px] font-medium text-foreground">{title}</span>
      {description && <span className="max-w-xs text-[11.5px] leading-snug text-muted-foreground">{description}</span>}
      {action && <span className="mt-1">{action}</span>}
    </div>
  );
}

/* ------------------------------- compliance -------------------------------- */

export type ComplianceCheck = {
  id: string;
  label: string;
  state: "verified" | "pending" | "expired" | "missing";
  detail?: string;
  at?: string;
};

const CHECK_ICON: Record<ComplianceCheck["state"], ReactNode> = {
  verified: <ShieldCheck className="h-3.5 w-3.5" />,
  pending: <Clock className="h-3.5 w-3.5" />,
  expired: <ShieldAlert className="h-3.5 w-3.5" />,
  missing: <CircleDashed className="h-3.5 w-3.5" />,
};

const CHECK_STATUS: Record<ComplianceCheck["state"], string> = {
  verified: "active",
  pending: "pending",
  expired: "suspended",
  missing: "cancelled",
};

export function ComplianceSection({
  checks,
  riskLevel,
  loading = false,
  cta,
}: {
  checks: ComplianceCheck[];
  riskLevel?: string;
  loading?: boolean;
  cta?: ReactNode;
}) {
  return (
    <PanelSection
      title="Compliance & Risk"
      icon={<ShieldAlert className="h-3.5 w-3.5" />}
      actions={
        riskLevel ? (
          <Tip label={`Composite risk rating derived from KYC, tax and audit signals`}>
            <span tabIndex={0} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]">
              <StatusBadge status={riskLevel === "critical" || riskLevel === "high" ? "suspended" : riskLevel === "medium" ? "pending" : "active"}>
                {riskLevel} risk
              </StatusBadge>
            </span>
          </Tip>
        ) : null
      }
    >
      {loading ? (
        <PanelSkeleton rows={3} />
      ) : checks.length === 0 ? (
        <PanelEmpty
          icon={<FileCheck2 className="h-4 w-4" />}
          title="No compliance records yet"
          description="KYC, GST/VAT and audit checks appear here as soon as documents are submitted."
          action={cta}
        />
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            {checks.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-2.5 rounded-md border border-border bg-surface-2 px-3 py-2.5"
              >
                <span
                  className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md ${
                    c.state === "verified"
                      ? "bg-[color:color-mix(in_oklab,var(--color-success)_14%,transparent)] text-[color:var(--color-success)]"
                      : c.state === "pending"
                        ? "bg-[color:color-mix(in_oklab,var(--color-warning)_14%,transparent)] text-[color:var(--color-warning)]"
                        : c.state === "expired"
                          ? "bg-[color:color-mix(in_oklab,var(--destructive)_12%,transparent)] text-destructive"
                          : "bg-surface text-muted-foreground"
                  }`}
                  aria-hidden="true"
                >
                  {CHECK_ICON[c.state]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12.5px] font-medium text-foreground">{c.label}</span>
                    <StatusBadge status={CHECK_STATUS[c.state]}>{c.state}</StatusBadge>
                  </div>
                  {c.detail && <div className="mt-0.5 text-[11.5px] text-muted-foreground">{c.detail}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <Landmark className="h-3 w-3" /> Verification timeline
            </div>
            <ol className="space-y-2">
              {checks
                .filter((c) => c.at)
                .map((c) => (
                  <li key={`t-${c.id}`} className="flex items-start gap-2.5">
                    <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground">
                      <BadgeCheck className="h-2.5 w-2.5" />
                    </span>
                    <span className="text-[12px] text-foreground">
                      {c.label}{" "}
                      <span className="text-muted-foreground">
                        · {c.state} · <time dateTime={c.at}>{c.at}</time>
                      </span>
                    </span>
                  </li>
                ))}
              {checks.every((c) => !c.at) && (
                <li className="text-[11.5px] text-muted-foreground">No dated verification events yet.</li>
              )}
            </ol>
          </div>
        </>
      )}
    </PanelSection>
  );
}

/* -------------------------------- activity --------------------------------- */

export type ActivityEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail?: string;
  status?: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function ActivitySection({
  events,
  loading = false,
  cta,
  title = "Activity Timeline",
}: {
  events: ActivityEvent[];
  loading?: boolean;
  cta?: ReactNode;
  title?: string;
}) {
  return (
    <PanelSection title={title} icon={<Activity className="h-3.5 w-3.5" />}>
      {loading ? (
        <PanelSkeleton rows={4} />
      ) : events.length === 0 ? (
        <PanelEmpty
          icon={<Activity className="h-4 w-4" />}
          title="No activity recorded"
          description="Status changes, license events and revenue milestones will stream into this timeline."
          action={cta}
        />
      ) : (
        <ol className="relative space-y-3 pl-1">
          <span className="absolute left-[13px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />
          {events.map((e) => (
            <li key={e.id} className="relative flex items-start gap-3">
              <span
                className="z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-surface text-[10px] font-semibold text-muted-foreground"
                aria-hidden="true"
                title={e.actor}
              >
                {initials(e.actor) || <Activity className="h-3 w-3" />}
              </span>
              <div className="min-w-0 flex-1 rounded-md border border-border bg-surface-2 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-[12.5px] font-medium text-foreground">{e.action}</span>
                  {e.status && <StatusBadge status={e.status} />}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <span>{e.actor}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={e.at}>{e.at}</time>
                </div>
                {e.detail && <div className="mt-1 text-[11.5px] text-muted-foreground">{e.detail}</div>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </PanelSection>
  );
}
