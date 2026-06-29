import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Btn, Card, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { Toolbar } from "@/components/boss/Toolbar";
import { EnterpriseTable, type Column } from "@/components/boss/EnterpriseTable";
import { StatusBadge } from "@/components/boss/StatusBadge";
import { RightPanel } from "@/components/boss/RightPanel";
import { BackendBanner } from "@/components/boss/BackendBanner";
import { useFranchises, type Franchise } from "@/lib/data-hooks";
import { useCan } from "@/lib/session";
import { useToast } from "@/lib/toast";
import { useShortcuts } from "@/lib/shortcuts";
import { Plus, Power, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/directory")({
  head: () => ({ meta: [{ title: "Franchise Directory · Boss Panel" }] }),
  component: DirectoryWall,
});

function DirectoryWall() {
  const { data: rows = [], isLoading, error } = useFranchises();
  const canSuspend = useCan("franchise.suspend");
  const canWrite = useCan("franchise.write");
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [tier, setTier] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<string>("revenueMtd");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [openId, setOpenId] = useState<string | null>(null);

  useShortcuts([
    { combo: "/", description: "Focus search", handler: () => (document.getElementById("dir-search") as HTMLInputElement)?.focus() },
  ]);

  const filtered = useMemo(() => {
    let r = rows;
    if (status) r = r.filter((f) => f.status === status);
    if (tier) r = r.filter((f) => f.tier === tier);
    if (country) r = r.filter((f) => f.country === country);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((f) =>
        f.company.toLowerCase().includes(q) ||
        f.owner.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q),
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
  }, [rows, status, tier, country, search, sortBy, sortDir]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const countries = useMemo(() => Array.from(new Set(rows.map((r) => r.country))).filter(Boolean), [rows]);

  const toggle = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelected((s) => s.size === paged.length ? new Set() : new Set(paged.map((r) => r.id)));
  const onSort = (id: string) => {
    if (id === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(id); setSortDir("desc"); }
  };

  const columns: Column<Franchise>[] = [
    { id: "code", header: "Code", sortable: true, cell: (f) => <span className="font-mono text-[11.5px] text-foreground">{f.code}</span> },
    { id: "company", header: "Franchise", sortable: true, cell: (f) => (
      <div><div className="font-medium text-foreground">{f.company}</div><div className="text-[11px] text-muted-foreground">{f.owner}</div></div>
    )},
    { id: "country", header: "Location", sortable: true, cell: (f) => <span className="text-muted-foreground">{[f.city, f.state, f.country].filter(Boolean).join(", ")}</span> },
    { id: "tier", header: "Tier", sortable: true, cell: (f) => <span className="capitalize text-foreground">{f.tier}</span> },
    { id: "status", header: "Status", sortable: true, cell: (f) => <StatusBadge status={f.status} /> },
    { id: "commissionPct", header: "Commission", sortable: true, cell: (f) => <span className="tabular-nums text-foreground">{f.commissionPct.toFixed(1)}%</span> },
    { id: "licenses", header: "Licenses", sortable: true, cell: (f) => <span className="tabular-nums">{f.licenses}</span> },
    { id: "revenueMtd", header: "Revenue MTD", sortable: true, cell: (f) => <span className="tabular-nums text-foreground">${f.revenueMtd.toLocaleString()}</span> },
    { id: "healthScore", header: "Health", sortable: true, cell: (f) => <HealthDot score={f.healthScore} /> },
    { id: "riskLevel", header: "Risk", sortable: true, cell: (f) => <StatusBadge status={f.riskLevel === "critical" || f.riskLevel === "high" ? "suspended" : f.riskLevel === "medium" ? "pending" : "active"}>{f.riskLevel}</StatusBadge> },
  ];

  const active = openId ? rows.find((r) => r.id === openId) ?? null : null;

  return (
    <>
      <WallHeader
        eyebrow="Directory"
        title="Franchise Master Directory"
        description="Single source of truth for every franchise globally, with health, risk and revenue at a glance."
        actions={<>
          <Btn variant="outline">Import CSV</Btn>
          <Btn variant="outline">Export</Btn>
          <Btn variant="primary" disabled={!canWrite}><Plus className="h-3.5 w-3.5" /> Add Franchise</Btn>
        </>}
      />
      <BackendBanner />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Total Franchises" />
          <Stat label="Active" tone="success" />
          <Stat label="Suspended" tone="destructive" />
          <Stat label="High Risk" tone="warning" />
          <Stat label="Avg Health Score" />
          <Stat label="Avg Commission %" />
        </div>

        <Section title="Directory">
          <div className="space-y-3">
            <Toolbar
              search={search}
              onSearch={(v) => { setSearch(v); setPage(1); }}
              searchPlaceholder="Search by code, company or owner…"
              selectedCount={selected.size}
              bulkActions={<>
                <Btn variant="ghost">Change Tier</Btn>
                <Btn variant="ghost" disabled={!canSuspend}><Power className="h-3.5 w-3.5" /> Suspend</Btn>
                <Btn variant="ghost">Export</Btn>
              </>}
              right={<>
                <SelectFilter value={status} onChange={(v) => { setStatus(v); setPage(1); }} label="Status"
                  options={["active","pending","onboarding","suspended","cancelled","terminated"]} />
                <SelectFilter value={tier} onChange={(v) => { setTier(v); setPage(1); }} label="Tier"
                  options={["bronze","silver","gold","platinum","diamond"]} />
                <SelectFilter value={country} onChange={(v) => { setCountry(v); setPage(1); }} label="Country" options={countries} />
              </>}
            />

            <EnterpriseTable<Franchise>
              columns={columns}
              rows={paged}
              loading={isLoading}
              error={error ? "Failed to load directory" : null}
              emptyTitle="No franchises in the directory"
              emptyDescription="Once approved applications are converted to franchises, they appear here. Use Add Franchise to onboard manually."
              selected={selected}
              onToggle={toggle}
              onToggleAll={toggleAll}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
              onRowClick={(r) => setOpenId(r.id)}
              pagination={{ page, pageSize, total: filtered.length, onPage: setPage, onPageSize: setPageSize }}
            />
          </div>
        </Section>
      </WallBody>

      <RightPanel
        open={!!active}
        onClose={() => setOpenId(null)}
        eyebrow={active?.code}
        title={active ? `${active.company}` : ""}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Btn variant="ghost">Open Profile</Btn>
            <Btn variant="outline" disabled={!canSuspend} onClick={() => { toast({ title: "Suspension queued", tone: "warning" }); setOpenId(null); }}>
              <Power className="h-3.5 w-3.5" /> Suspend
            </Btn>
            <Btn variant="primary">Edit</Btn>
          </div>
        }
      >
        {active && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={active.status} />
              <StatusBadge status={active.riskLevel === "critical" ? "suspended" : "active"}>
                Risk: {active.riskLevel}
              </StatusBadge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Owner" value={active.owner} />
              <MiniStat label="Tier" value={active.tier} />
              <MiniStat label="Commission" value={`${active.commissionPct.toFixed(1)}%`} />
              <MiniStat label="Licenses" value={active.licenses} />
              <MiniStat label="Revenue MTD" value={`$${active.revenueMtd.toLocaleString()}`} />
              <MiniStat label="Health Score" value={active.healthScore} />
            </div>

            <Card>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                <ShieldAlert className="h-3.5 w-3.5" /> Compliance & Risk
              </div>
              <div className="mt-2 rounded-md border border-dashed border-border px-3 py-5 text-center text-[12px] text-muted-foreground">
                Compliance signals appear here once KYC, GST/VAT and audit data is connected.
              </div>
            </Card>

            <Card>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Activity Timeline</div>
              <div className="mt-2 rounded-md border border-dashed border-border px-3 py-5 text-center text-[12px] text-muted-foreground">
                Every status change, license event and revenue milestone is recorded here.
              </div>
            </Card>
          </div>
        )}
      </RightPanel>
    </>
  );
}

function SelectFilter({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] capitalize text-foreground"
    >
      <option value="">All {label.toLowerCase()}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 px-3 py-2">
      <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-[13px] font-medium capitalize text-foreground">{value}</div>
    </div>
  );
}

function HealthDot({ score }: { score: number }) {
  const color =
    score >= 80 ? "var(--color-success)" :
    score >= 60 ? "var(--color-warning)" :
    "var(--destructive)";
  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="text-foreground">{score}</span>
    </span>
  );
}
