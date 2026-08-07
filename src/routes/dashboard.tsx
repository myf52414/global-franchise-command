import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Section, Stat, WallBody, WallHeader, Btn } from "@/components/boss/Wall";
import { useShortcuts } from "@/lib/shortcuts";
import { useToast } from "@/lib/toast";
import { Activity, ArrowUpRight, ShieldAlert, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Franchise Dashboard · Software Vala Boss Panel" }] }),
  component: DashboardWall,
});

const KPI_GROUPS: {
  title: string;
  items: { label: string; tone?: "neutral" | "success" | "warning" | "destructive" | "info"; hint?: string }[];
}[] = [
  {
    title: "Franchise Network",
    items: [
      { label: "Total Franchises", hint: "Across all countries" },
      { label: "Active", tone: "success" },
      { label: "Pending", tone: "warning" },
      { label: "Suspended", tone: "destructive" },
      { label: "Cancelled" },
      { label: "Countries" },
      { label: "States / Regions" },
      { label: "Team Members" },
    ],
  },
  {
    title: "Revenue & Operations",
    items: [
      { label: "Monthly Revenue", tone: "info" },
      { label: "Lifetime Revenue", tone: "info" },
      { label: "Total Customers" },
      { label: "Products Sold" },
      { label: "License Usage" },
      { label: "Renewal Due", tone: "warning" },
    ],
  },
  {
    title: "Attention",
    items: [
      { label: "Support Tickets" },
      { label: "Pending Approvals", tone: "warning" },
      { label: "Compliance Alerts", tone: "destructive" },
    ],
  },
];

function DashboardWall() {
  const { toast } = useToast();
  useShortcuts([
    { combo: "shift+n", description: "New franchise", handler: () => toast({ title: "New franchise", description: "Opens the application intake.", tone: "info" }) },
    { combo: "shift+r", description: "Refresh dashboard", handler: () => toast({ title: "Dashboard refreshed", tone: "success" }) },
  ]);

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
              <Btn variant="primary"><Sparkles className="h-3.5 w-3.5" /> Review Applications</Btn>
            </Link>
          </>
        }
      />
      <WallBody>
        {KPI_GROUPS.map((g) => (
          <Section key={g.title} title={g.title}>
            <div className="wall-grid">
              {g.items.map((k) => (
                <Stat key={k.label} label={k.label} tone={k.tone} hint={k.hint} />
              ))}
            </div>
          </Section>
        ))}

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
                <Btn variant="ghost">Open Revenue <ArrowUpRight className="h-3.5 w-3.5" /></Btn>
              </div>
              <div className="mt-5 grid h-56 place-items-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
                Chart will render when revenue ledger is connected
              </div>
            </Card>
            <Card>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Geographic Distribution
              </div>
              <div className="mt-5 grid h-56 place-items-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
                World map renders from <code className="text-foreground">franchises.country</code>
              </div>
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
              <ul className="mt-4 space-y-3">
                <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-[12px] text-muted-foreground">
                  Events stream here once franchises start operating.
                </li>
              </ul>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <ShieldAlert className="h-4 w-4 text-[color:var(--color-warning)]" />
                Compliance Watchlist
              </div>
              <ul className="mt-4 space-y-3">
                <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-[12px] text-muted-foreground">
                  No compliance alerts. Risk scoring runs nightly.
                </li>
              </ul>
            </Card>
            <Card>
              <div className="text-[13px] font-semibold text-foreground">Pending Approvals</div>
              <ul className="mt-4 space-y-2 text-[12.5px] text-muted-foreground">
                <li className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2">
                  <span>Applications</span>
                  <Link to="/applications" className="text-[12px] text-foreground hover:underline">Open</Link>
                </li>
                <li className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2">
                  <span>License Renewals</span>
                  <Link to="/license" className="text-[12px] text-foreground hover:underline">Open</Link>
                </li>
                <li className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2">
                  <span>Commission Payouts</span>
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
