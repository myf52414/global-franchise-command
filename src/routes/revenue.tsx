import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Btn, Card, Stat, Section, WallBody, WallHeader } from "@/components/boss/Wall";
import { Toolbar } from "@/components/boss/Toolbar";
import { EnterpriseTable, type Column } from "@/components/boss/EnterpriseTable";
import { StatusBadge } from "@/components/boss/StatusBadge";
import { BackendBanner } from "@/components/boss/BackendBanner";
import { ExportMenu } from "@/components/boss/ExportMenu";
import { RevenueCharts } from "@/components/boss/RevenueCharts";
import {
  useInvoices,
  useRevenueKpis,
  type Invoice,
  type InvoiceStatus,
  type RevenueStream,
} from "@/lib/data-hooks";
import { useCan } from "@/lib/session";
import { useShortcuts } from "@/lib/shortcuts";
import { fmtMoney } from "@/lib/export";
import { RefreshCw } from "lucide-react";

export const Route = createFileRoute("/revenue")({
  head: () => ({ meta: [{ title: "Revenue · Boss Panel" }] }),
  component: RevenueWall,
});

const TYPES: RevenueStream[] = ["royalty", "subscription", "license", "renewal", "product"];
const STATUSES: InvoiceStatus[] = ["draft", "issued", "paid", "overdue", "void"];
const TABS: { id: InvoiceStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...STATUSES.map((s) => ({ id: s, label: s[0].toUpperCase() + s.slice(1) })),
];

function RevenueWall() {
  const canRead = useCan("revenue.read");
  const kpisQ = useRevenueKpis();
  const { data: rows = [], isLoading, error, refetch, isFetching } = useInvoices();

  const [tab, setTab] = useState<InvoiceStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<RevenueStream | "">("");
  const [country, setCountry] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<string>("issuedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useShortcuts([
    { combo: "/", description: "Focus search", handler: () => (document.getElementById("rev-search") as HTMLInputElement)?.focus() },
  ]);

  const countries = useMemo(() => Array.from(new Set(rows.map((r) => r.country))).filter(Boolean), [rows]);

  const filtered = useMemo(() => {
    let r = rows;
    if (tab !== "all") r = r.filter((i) => i.status === tab);
    if (type) r = r.filter((i) => i.type === type);
    if (country) r = r.filter((i) => i.country === country);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (i) => i.number.toLowerCase().includes(q) || i.franchise.toLowerCase().includes(q),
      );
    }
    r = [...r].sort((a, b) => {
      const av = (a as unknown as Record<string, string | number>)[sortBy] ?? "";
      const bv = (b as unknown as Record<string, string | number>)[sortBy] ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [rows, tab, type, country, search, sortBy, sortDir]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggle = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelected((s) => s.size === paged.length ? new Set() : new Set(paged.map((r) => r.id)));

  const onSort = (id: string) => {
    if (id === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(id); setSortDir("asc"); }
  };

  const columns: Column<Invoice>[] = [
    { id: "number", header: "Invoice #", sortable: true, cell: (r) => <span className="font-mono text-[11.5px]">{r.number}</span> },
    { id: "franchise", header: "Franchise", sortable: true, cell: (r) => <span className="font-medium text-foreground">{r.franchise}</span> },
    { id: "type", header: "Type", sortable: true, cell: (r) => <span className="capitalize">{r.type}</span> },
    { id: "amount", header: "Amount", sortable: true, cell: (r) => fmtMoney(r.amount) },
    { id: "tax", header: "Tax", sortable: true, cell: (r) => fmtMoney(r.tax) },
    { id: "status", header: "Status", sortable: true, cell: (r) => <StatusBadge status={r.status} /> },
    { id: "issuedAt", header: "Issued", sortable: true, cell: (r) => <span className="text-muted-foreground">{r.issuedAt}</span> },
    { id: "dueAt", header: "Due", sortable: true, cell: (r) => <span className="text-muted-foreground">{r.dueAt}</span> },
  ];

  if (!canRead) {
    return (
      <>
        <WallHeader eyebrow="Revenue" title="Revenue & Financial Operations" />
        <WallBody>
          <Card className="grid place-items-center px-6 py-16 text-center">
            <div className="text-[14px] font-medium text-foreground">Restricted</div>
            <div className="mt-1 max-w-md text-[12.5px] text-muted-foreground">
              Your role does not include <span className="font-mono">revenue.read</span>. Contact a global admin to request access.
            </div>
          </Card>
        </WallBody>
      </>
    );
  }

  const kpi = kpisQ.data;
  const v = (n?: number) => (n != null && n > 0 ? fmtMoney(n) : undefined);

  return (
    <>
      <WallHeader
        eyebrow="Revenue"
        title="Revenue & Financial Operations"
        description="Consolidated revenue across royalty, subscription, license, renewals and invoices — sortable, exportable, audited."
        actions={<>
          <Btn variant="ghost" onClick={() => { refetch(); kpisQ.refetch(); }}>
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Btn>
          <Btn variant="outline" onClick={() => exportCsv("revenue-invoices.csv", filtered)}>
            <Download className="h-3.5 w-3.5" /> Export
          </Btn>
        </>}
      />
      <BackendBanner />
      <WallBody>
        <div className="wall-grid">
          <Stat label="MTD Revenue" tone="info" value={v(kpi?.mtd)} />
          <Stat label="QTD Revenue" tone="info" value={v(kpi?.qtd)} />
          <Stat label="YTD Revenue" tone="info" value={v(kpi?.ytd)} />
          <Stat label="Royalty Collected" value={v(kpi?.royalty)} />
          <Stat label="Subscription Revenue" value={v(kpi?.subscription)} />
          <Stat label="License Revenue" value={v(kpi?.license)} />
          <Stat label="Renewal Revenue" value={v(kpi?.renewal)} />
          <Stat label="Pending Payments" tone="warning" value={v(kpi?.pending)} />
          <Stat label="Tax Collected" value={v(kpi?.tax)} />
        </div>

        <Section title="Revenue Over Time">
          <Card>
            <div className="grid h-48 place-items-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
              {kpisQ.isLoading
                ? "Loading ledger…"
                : kpisQ.error
                  ? "Failed to load revenue trend"
                  : "Chart renders from live ledger"}
            </div>
          </Card>
        </Section>

        <Section title="Invoices">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-1 border-b border-border">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setPage(1); }}
                  className={`relative -mb-px border-b-2 px-3 py-2 text-[12.5px] font-medium transition-colors ${
                    tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                  <span className="ml-1.5 rounded bg-surface-2 px-1.5 py-0.5 text-[10.5px] text-muted-foreground">
                    {t.id === "all" ? rows.length : rows.filter((r) => r.status === t.id).length}
                  </span>
                </button>
              ))}
            </div>

            <Toolbar
              search={search}
              onSearch={(v) => { setSearch(v); setPage(1); }}
              searchPlaceholder="Search invoice # or franchise…"
              selectedCount={selected.size}
              bulkActions={<>
                <Btn variant="ghost" onClick={() => exportCsv("invoices-selected.csv", rows.filter((r) => selected.has(r.id)))}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Btn>
              </>}
              right={<>
                <select
                  value={type}
                  onChange={(e) => { setType(e.target.value as RevenueStream | ""); setPage(1); }}
                  className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground"
                >
                  <option value="">All types</option>
                  {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
                <select
                  value={country}
                  onChange={(e) => { setCountry(e.target.value); setPage(1); }}
                  className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground"
                >
                  <option value="">All countries</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Btn variant="ghost" onClick={() => exportCsv("invoices.csv", filtered)}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Btn>
              </>}
            />

            <EnterpriseTable<Invoice>
              columns={columns}
              rows={paged}
              loading={isLoading}
              error={error ? "Failed to load invoices" : null}
              emptyTitle="No invoices yet"
              emptyDescription="Once revenue is recorded, invoices appear here with sortable totals, status and due dates."
              selected={selected}
              onToggle={toggle}
              onToggleAll={toggleAll}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
              pagination={{ page, pageSize, total: filtered.length, onPage: setPage, onPageSize: setPageSize }}
            />
          </div>
        </Section>
      </WallBody>
    </>
  );
}
