import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, Section, Stat, WallBody, WallHeader, Btn } from "@/components/boss/Wall";
import { useShortcuts } from "@/lib/shortcuts";
import { useToast } from "@/lib/toast";
import {
  useApplications,
  useAuditTrail,
  useCommissions,
  useFranchises,
  useInvoices,
  useLicenses,
  useTerritories,
} from "@/lib/data-hooks";
import { Activity, ArrowUpRight, ShieldAlert, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Franchise Dashboard · Software Vala Boss Panel" },
      {
        name: "description",
        content:
          "Live franchise network, revenue, licensing and compliance metrics across every country in one control center.",
      },
    ],
  }),
  component: DashboardWall,
});

const usd = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1000
      ? `$${(n / 1000).toFixed(1)}K`
      : `$${n.toFixed(0)}`;

function DashboardWall() {
  const { toast } = useToast();
  const { data: franchises = [] } = useFranchises();
  const { data: applications = [] } = useApplications();
  const { data: territories = [] } = useTerritories();
  const { data: licenses = [] } = useLicenses();
  const { data: invoices = [] } = useInvoices();
  const { data: commissions = [] } = useCommissions();
  const { data: audit = [] } = useAuditTrail("global");

  useShortcuts([
    {
      combo: "shift+n",
      description: "New franchise",
      handler: () =>
        toast({ title: "New franchise", description: "Opens the application intake.", tone: "info" }),
    },
    { combo: "shift+r", description: "Refresh dashboard", handler: () => toast({ title: "Dashboard refreshed", tone: "success" }) },
  ]);

  const byStatus = (s: string) => franchises.filter((f) => f.status === s).length;
  const revenueMtd = franchises.reduce((a, f) => a + f.revenueMtd, 0);
  const lifetime = invoices.reduce((a, i) => a + i.amount, 0);
  const renewalDue = licenses.filter((l) => l.status === "expiring" || l.status === "expired").length;
  const pendingApprovals =
    applications.filter((a) => !["approved", "rejected"].includes(a.stage)).length +
    commissions.filter((c) => c.status === "pending").length;
  const complianceAlerts = franchises.filter(
    (f) => f.riskLevel === "high" || f.riskLevel === "critical",
  ).length;

  const trend = useMemo(() => {
    const buckets = new Map<string, number>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      buckets.set(d.toISOString().slice(0, 7), 0);
    }
    invoices.forEach((inv) => {
      const k = inv.issuedAt.slice(0, 7);
      if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + inv.amount);
    });
    return Array.from(buckets, ([month, amount]) => ({ month: month.slice(5), amount }));
  }, [invoices]);

  const geo = useMemo(() => {
    const m = new Map<string, number>();
    franchises.forEach((f) => m.set(f.country, (m.get(f.country) ?? 0) + 1));
    return Array.from(m, ([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count);
  }, [franchises]);

  const watchlist = franchises
    .filter((f) => f.riskLevel === "high" || f.riskLevel === "critical" || f.status === "suspended")
    .slice(0, 5);

  return (
    <>
      <WallHeader
        eyebrow="Dashboard"
        title="Global Franchise Control Center"
        description="A single operational view across every franchise, country and revenue stream."
        actions={
          <>
            <Btn variant="ghost" onClick={() => toast({ title: "Dashboard refreshed", tone: "success" })}>
              Refresh
            </Btn>
            <Btn variant="outline">Export Snapshot</Btn>
            <Link to="/applications">
              <Btn variant="primary">
                <Sparkles className="h-3.5 w-3.5" /> Review Applications
              </Btn>
            </Link>
          </>
        }
      />
      <WallBody>
        <Section title="Franchise Network">
          <div className="wall-grid">
            <Stat label="Total Franchises" value={franchises.length || undefined} hint="Across all countries" />
            <Stat label="Active" tone="success" value={byStatus("active") || undefined} />
            <Stat label="Pending" tone="warning" value={byStatus("pending") || undefined} />
            <Stat label="Suspended" tone="destructive" value={byStatus("suspended") || undefined} />
            <Stat label="Cancelled" value={byStatus("cancelled") || undefined} />
            <Stat label="Countries" value={new Set(franchises.map((f) => f.country)).size || undefined} />
            <Stat label="States / Regions" value={new Set(territories.map((t) => t.region)).size || undefined} />
            <Stat label="Applications" value={applications.length || undefined} />
          </div>
        </Section>

        <Section title="Revenue & Operations">
          <div className="wall-grid">
            <Stat label="Monthly Revenue" tone="info" value={revenueMtd ? usd(revenueMtd) : undefined} />
            <Stat label="Lifetime Revenue" tone="info" value={lifetime ? usd(lifetime) : undefined} />
            <Stat label="Invoices" value={invoices.length || undefined} />
            <Stat label="Products Assigned" value={franchises.reduce((a, f) => a + f.productsAssigned, 0) || undefined} />
            <Stat
              label="License Usage"
              value={licenses.length ? `${licenses.reduce((a, l) => a + l.devices, 0)} / ${licenses.reduce((a, l) => a + l.devicesMax, 0)}` : undefined}
            />
            <Stat label="Renewal Due" tone="warning" value={renewalDue || undefined} />
          </div>
        </Section>

        <Section title="Attention">
          <div className="wall-grid">
            <Stat label="Overdue Invoices" value={invoices.filter((i) => i.status === "overdue").length || undefined} tone="destructive" />
            <Stat label="Pending Approvals" tone="warning" value={pendingApprovals || undefined} />
            <Stat label="Compliance Alerts" tone="destructive" value={complianceAlerts || undefined} />
          </div>
        </Section>

        <Section title="At a Glance">
          <div className="grid gap-3 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Revenue Trend · 12 months
                  </div>
                  <div className="mt-1 text-[13px] text-foreground">All currencies normalised to USD</div>
                </div>
                <Link to="/revenue">
                  <Btn variant="ghost">
                    Open Revenue <ArrowUpRight className="h-3.5 w-3.5" />
                  </Btn>
                </Link>
              </div>
              <div className="mt-5 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} tickFormatter={(v: number) => usd(v)} width={56} />
                    <RTooltip
                      cursor={{ stroke: "var(--color-border)" }}
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => usd(v)}
                    />
                    <Area type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={2} fill="url(#revFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Geographic Distribution
              </div>
              {geo.length === 0 ? (
                <div className="mt-5 grid h-56 place-items-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
                  No franchises yet
                </div>
              ) : (
                <ul className="mt-5 space-y-3">
                  {geo.map((g) => (
                    <li key={g.country}>
                      <div className="flex items-center justify-between text-[12.5px]">
                        <span className="text-foreground">{g.country}</span>
                        <span className="tabular-nums text-muted-foreground">{g.count}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(g.count / geo[0]!.count) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </Section>

        <Section title="Operational Streams">
          <div className="grid gap-3 lg:grid-cols-3">
            <Card>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <Activity className="h-4 w-4 text-[color:var(--color-info)]" />
                Live Activity Feed
              </div>
              <ul className="mt-4 space-y-2">
                {audit.length === 0 ? (
                  <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-[12px] text-muted-foreground">
                    Events stream here once franchises start operating.
                  </li>
                ) : (
                  audit.slice(0, 6).map((e) => (
                    <li key={e.id} className="rounded-md border border-border bg-surface-2 px-3 py-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[12.5px] text-foreground">{e.action}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {new Date(e.at).toISOString().slice(0, 10)}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                        {e.actor} · {e.target}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <ShieldAlert className="h-4 w-4 text-[color:var(--color-warning)]" />
                Compliance Watchlist
              </div>
              <ul className="mt-4 space-y-2">
                {watchlist.length === 0 ? (
                  <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-[12px] text-muted-foreground">
                    No compliance alerts. Risk scoring runs nightly.
                  </li>
                ) : (
                  watchlist.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2 text-[12.5px]"
                    >
                      <span className="truncate text-foreground">{f.company}</span>
                      <span className="shrink-0 capitalize text-[color:var(--color-warning)]">
                        {f.status === "suspended" ? "suspended" : `${f.riskLevel} risk`}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </Card>
            <Card>
              <div className="text-[13px] font-semibold text-foreground">Pending Approvals</div>
              <ul className="mt-4 space-y-2 text-[12.5px] text-muted-foreground">
                <li className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2">
                  <span>Applications ({applications.filter((a) => !["approved", "rejected"].includes(a.stage)).length})</span>
                  <Link to="/applications" className="text-[12px] text-foreground hover:underline">Open</Link>
                </li>
                <li className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2">
                  <span>License Renewals ({renewalDue})</span>
                  <Link to="/license" className="text-[12px] text-foreground hover:underline">Open</Link>
                </li>
                <li className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2">
                  <span>Commission Payouts ({commissions.filter((c) => c.status === "pending").length})</span>
                  <Link to="/commission" className="text-[12px] text-foreground hover:underline">Open</Link>
                </li>
              </ul>
            </Card>
          </div>
        </Section>
      </WallBody>
    </>
  );
}
