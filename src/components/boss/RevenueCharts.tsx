import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Invoice, RevenueStream } from "@/lib/data-hooks";
import { Card, Section } from "./Wall";
import { fmtMoney } from "@/lib/export";

type Range = "7d" | "30d" | "90d" | "ytd";

const STREAM_COLORS: Record<RevenueStream, string> = {
  royalty: "var(--color-primary)",
  subscription: "var(--color-info)",
  license: "var(--color-success)",
  renewal: "var(--color-warning)",
  product: "var(--color-accent, var(--color-primary))",
};

export function RevenueCharts({
  invoices,
  loading,
  error,
  range,
  onRangeChange,
}: {
  invoices: Invoice[];
  loading?: boolean;
  error?: boolean;
  range: Range;
  onRangeChange: (r: Range) => void;
}) {
  const paid = useMemo(() => invoices.filter((i) => i.status === "paid" || i.status === "issued"), [invoices]);

  const byCountry = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of paid) m.set(i.country || "—", (m.get(i.country || "—") ?? 0) + i.amount);
    return Array.from(m, ([country, amount]) => ({ country, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [paid]);

  const byStream = useMemo(() => {
    const m = new Map<RevenueStream, number>();
    for (const i of paid) m.set(i.type, (m.get(i.type) ?? 0) + i.amount);
    return Array.from(m, ([type, amount]) => ({ type, amount }));
  }, [paid]);

  const overTime = useMemo(() => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const cutoff = Date.now() - days * 86400_000;
    const buckets = new Map<string, number>();
    for (const i of paid) {
      const t = Date.parse(i.issuedAt);
      if (!Number.isFinite(t) || t < cutoff) continue;
      const key = new Date(t).toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + i.amount);
    }
    return Array.from(buckets, ([date, amount]) => ({ date, amount })).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }, [paid, range]);

  const empty = !loading && !error && paid.length === 0;

  return (
    <Section
      title="Revenue Breakdown"
      description="Live aggregates from the filtered invoice ledger. Charts respect search, status, type and country filters."
      actions={
        <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5">
          {(["7d", "30d", "90d", "ytd"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-2.5 py-1 text-[11.5px] font-medium uppercase tracking-wider rounded ${
                range === r ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Revenue Over Time" subtitle={`Paid + issued · last ${range.toUpperCase()}`}>
          <ChartShell loading={loading} error={error} empty={empty && true}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={overTime} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickFormatter={(v) => fmtMoney(v)} width={70} />
                <Tooltip formatter={(v: number) => fmtMoney(v)} contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="amount" stroke="var(--color-primary)" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartShell>
        </ChartCard>

        <ChartCard title="Revenue by Country" subtitle="Top 10 countries by gross revenue">
          <ChartShell loading={loading} error={error} empty={byCountry.length === 0}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCountry} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="country" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickFormatter={(v) => fmtMoney(v)} width={70} />
                <Tooltip formatter={(v: number) => fmtMoney(v)} contentStyle={tooltipStyle} />
                <Bar dataKey="amount" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartShell>
        </ChartCard>

        <ChartCard title="Revenue by Product / Stream" subtitle="Royalty, subscription, license, renewal, product">
          <ChartShell loading={loading} error={error} empty={byStream.length === 0}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Tooltip formatter={(v: number) => fmtMoney(v)} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Pie data={byStream} dataKey="amount" nameKey="type" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {byStream.map((s) => (
                    <Cell key={s.type} fill={STREAM_COLORS[s.type]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartShell>
        </ChartCard>
      </div>
    </Section>
  );
}

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--color-popover-foreground)",
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="mb-2">
        <div className="text-[12px] font-semibold text-foreground">{title}</div>
        {subtitle && <div className="text-[11px] text-muted-foreground">{subtitle}</div>}
      </div>
      {children}
    </Card>
  );
}

function ChartShell({
  loading, error, empty, children,
}: { loading?: boolean; error?: boolean; empty?: boolean; children: React.ReactNode }) {
  if (loading) return <Skeleton text="Loading chart…" />;
  if (error) return <Skeleton text="Failed to load chart data" tone="destructive" />;
  if (empty) return <Skeleton text="No revenue in this window" />;
  return <>{children}</>;
}

function Skeleton({ text, tone = "muted" }: { text: string; tone?: "muted" | "destructive" }) {
  return (
    <div
      className={`grid h-[220px] place-items-center rounded-md border border-dashed border-border text-[12px] ${
        tone === "destructive" ? "text-destructive" : "text-muted-foreground"
      }`}
    >
      {text}
    </div>
  );
}
