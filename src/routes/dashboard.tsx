import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  EmptyState,
  Section,
  Stat,
  WallBody,
  WallHeader,
} from "@/components/boss/Wall";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Franchise Dashboard · Software Vala Boss Panel" }] }),
  component: DashboardWall,
});

const KPIS: { label: string; tone?: "neutral" | "success" | "warning" | "destructive" | "info" }[] = [
  { label: "Total Franchises" },
  { label: "Active", tone: "success" },
  { label: "Pending", tone: "warning" },
  { label: "Suspended", tone: "destructive" },
  { label: "Cancelled" },
  { label: "Countries" },
  { label: "States" },
  { label: "Monthly Revenue", tone: "info" },
  { label: "Lifetime Revenue", tone: "info" },
  { label: "Total Customers" },
  { label: "Products Sold" },
  { label: "License Usage" },
  { label: "Support Tickets" },
  { label: "Team Members" },
  { label: "Renewal Due", tone: "warning" },
  { label: "Pending Approvals", tone: "warning" },
  { label: "Compliance Alerts", tone: "destructive" },
];

function DashboardWall() {
  return (
    <>
      <WallHeader
        eyebrow="Dashboard"
        title="Global Franchise Control Center"
        description="A single operational view across every franchise, country and revenue stream."
      />
      <WallBody>
        <Section title="Live KPIs" description="Real-time metrics from connected backend.">
          <div className="wall-grid">
            {KPIS.map((k) => (
              <Stat key={k.label} label={k.label} tone={k.tone} />
            ))}
          </div>
        </Section>

        <Section title="Live Activity Feed">
          <EmptyState
            icon={<Activity className="h-4 w-4" />}
            title="No activity yet"
            description="Once franchises start operating, real-time events (applications, approvals, payments, license activations) will stream here."
          />
        </Section>

        <Section title="At a Glance">
          <div className="grid gap-3 lg:grid-cols-3">
            <Card>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Revenue Trend
              </div>
              <div className="mt-6 grid h-40 place-items-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
                Connect revenue source to render chart
              </div>
            </Card>
            <Card>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Geographic Distribution
              </div>
              <div className="mt-6 grid h-40 place-items-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
                World map renders once franchises are added
              </div>
            </Card>
            <Card>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tier Mix
              </div>
              <div className="mt-6 grid h-40 place-items-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
                Awaiting franchise tier data
              </div>
            </Card>
          </div>
        </Section>
      </WallBody>
    </>
  );
}
