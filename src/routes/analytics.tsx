import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import {
  useCommissions,
  useFranchises,
  useInvoices,
  useLeads,
  useLicenses,
  useRevenueKpis,
} from "@/lib/data-hooks";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Franchise Analytics · Boss Panel" },
      {
        name: "description",
        content:
          "Live analytics across revenue, franchises, licences, leads and commissions for Software Vala.",
      },
      { property: "og:title", content: "Franchise Analytics · Boss Panel" },
      {
        property: "og:description",
        content: "Live analytics across revenue, franchises, licences and leads.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyticsWall,
});

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function Panel({
  title,
  rows,
  loading,
}: {
  title: string;
  rows: { label: string; value: string }[];
  loading?: boolean;
}) {
  return (
    <Card>
      <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <dl className="mt-3 space-y-2">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-5 animate-pulse rounded bg-surface-2" />
            ))
          : rows.length === 0
            ? <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-[12px] text-muted-foreground">No data yet</div>
            : rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-3 text-[12.5px]">
                  <dt className="text-muted-foreground">{r.label}</dt>
                  <dd className="tabular-nums font-medium text-foreground">{r.value}</dd>
                </div>
              ))}
      </dl>
    </Card>
  );
}

function AnalyticsWall() {
  const kpis = useRevenueKpis();
  const franchises = useFranchises();
  const licenses = useLicenses();
  const leads = useLeads();
  const invoices = useInvoices();
  const commissions = useCommissions();

  const loading =
    kpis.isLoading || franchises.isLoading || licenses.isLoading || leads.isLoading || invoices.isLoading || commissions.isLoading;

  const f = franchises.data ?? [];
  const l = licenses.data ?? [];
  const ld = leads.data ?? [];
  const inv = invoices.data ?? [];
  const com = commissions.data ?? [];

  const revenuePerFranchise = f.length ? (kpis.data?.ytd ?? 0) / f.length : 0;
  const activeRate = f.length ? Math.round((f.filter((x) => x.status === "active").length / f.length) * 100) : 0;
  const renewalRate = l.length ? Math.round((l.filter((x) => x.status === "active").length / l.length) * 100) : 0;
  const conversion = ld.length ? Math.round((ld.filter((x) => x.stage === "converted").length / ld.length) * 100) : 0;

  const byCountry = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of inv) m.set(i.country || "—", (m.get(i.country || "—") ?? 0) + i.amount);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, v]) => ({ label, value: money(v) }));
  }, [inv]);

  const bySource = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of ld) m.set(x.source, (m.get(x.source) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([label, v]) => ({ label, value: String(v) }));
  }, [ld]);

  const byTier = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of f) m.set(x.tier, (m.get(x.tier) ?? 0) + 1);
    return [...m.entries()].map(([label, v]) => ({ label, value: String(v) }));
  }, [f]);

  const byPlan = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of l) m.set(x.plan, (m.get(x.plan) ?? 0) + 1);
    return [...m.entries()].map(([label, v]) => ({ label, value: String(v) }));
  }, [l]);

  const topFranchises = useMemo(
    () =>
      [...f]
        .sort((a, b) => b.revenueMtd - a.revenueMtd)
        .slice(0, 5)
        .map((x) => ({ label: x.company, value: money(x.revenueMtd) })),
    [f],
  );

  const commissionStatus = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of com) m.set(c.status, (m.get(c.status) ?? 0) + c.payable);
    return [...m.entries()].map(([label, v]) => ({ label, value: money(v) }));
  }, [com]);

  return (
    <>
      <WallHeader
        eyebrow="Analytics"
        title="Franchise Analytics"
        description="Live analytics computed from real revenue, franchise, licence and lead records."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Revenue YTD" tone="success" value={kpis.data?.ytd ? money(kpis.data.ytd) : undefined} loading={loading} />
          <Stat label="Revenue / Franchise" tone="info" value={revenuePerFranchise ? money(revenuePerFranchise) : undefined} loading={loading} />
          <Stat label="Active Franchise Rate" value={f.length ? `${activeRate}%` : undefined} loading={loading} />
          <Stat label="License Health" tone="success" value={l.length ? `${renewalRate}%` : undefined} loading={loading} />
          <Stat label="Lead Conversion" value={ld.length ? `${conversion}%` : undefined} loading={loading} />
        </div>

        <Section title="Analytics Panels" description="Every panel is derived from live backend records.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Panel title="Revenue by Country" rows={byCountry} loading={loading} />
            <Panel title="Top Franchises (MTD)" rows={topFranchises} loading={loading} />
            <Panel
              title="Revenue Mix"
              loading={loading}
              rows={
                kpis.data
                  ? [
                      { label: "Royalty", value: money(kpis.data.royalty) },
                      { label: "Subscription", value: money(kpis.data.subscription) },
                      { label: "License", value: money(kpis.data.license) },
                      { label: "Renewal", value: money(kpis.data.renewal) },
                    ]
                  : []
              }
            />
            <Panel title="Franchises by Tier" rows={byTier} loading={loading} />
            <Panel title="Licenses by Plan" rows={byPlan} loading={loading} />
            <Panel title="Leads by Source" rows={bySource} loading={loading} />
            <Panel title="Commission by Status" rows={commissionStatus} loading={loading} />
            <Panel
              title="Receivables"
              loading={loading}
              rows={
                kpis.data
                  ? [
                      { label: "Pending", value: money(kpis.data.pending) },
                      { label: "Tax Collected", value: money(kpis.data.tax) },
                      { label: "Invoices", value: String(inv.length) },
                    ]
                  : []
              }
            />
            <Panel
              title="Coverage"
              loading={loading}
              rows={[
                { label: "Franchises", value: String(f.length) },
                { label: "Licenses", value: String(l.length) },
                { label: "Leads", value: String(ld.length) },
              ]}
            />
          </div>
        </Section>
      </WallBody>
    </>
  );
}
