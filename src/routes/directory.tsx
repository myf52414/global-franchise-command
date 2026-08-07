import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Btn, Section, WallBody, WallHeader } from "@/components/boss/Wall";
import { Toolbar } from "@/components/boss/Toolbar";
import { EnterpriseTable, type Column } from "@/components/boss/EnterpriseTable";
import { StatusBadge } from "@/components/boss/StatusBadge";
import { RightPanel } from "@/components/boss/RightPanel";
import { KpiCard, KpiGrid } from "@/components/boss/KpiCard";
import { FilterSelect } from "@/components/boss/FilterSelect";
import { BulkBar } from "@/components/boss/BulkBar";
import { ImportDialog } from "@/components/boss/ImportDialog";
import { ExportDialog } from "@/components/boss/ExportDialog";
import { HealthBar, HealthIndicator } from "@/components/boss/HealthIndicator";
import { ActivitySection, ComplianceSection } from "@/components/boss/DetailSections";
import { Tip } from "@/components/boss/Tooltip";
import { useFranchises, type Franchise } from "@/lib/data-hooks";
import { useCan } from "@/lib/session";
import { useToast } from "@/lib/toast";
import { useShortcuts } from "@/lib/shortcuts";
import {
  Award,
  Building2,
  Download,
  ExternalLink,
  HeartPulse,
  Pencil,
  Percent,
  Plus,
  Power,
  ShieldAlert,
  Upload,
} from "lucide-react";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "Franchise Directory · Software Vala Boss Panel" },
      { name: "description", content: "Global franchise master directory with health, risk, licensing and revenue signals." },
      { property: "og:title", content: "Franchise Directory · Software Vala Boss Panel" },
      { property: "og:description", content: "Global franchise master directory with health, risk, licensing and revenue signals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DirectoryWall,
});

const BACKEND_READY = false;

function DirectoryWall() {
  const { data: rows = [], isLoading, error, refetch, isFetching } = useFranchises();
  const canSuspend = useCan("franchise.suspend");
  const canWrite = useCan("franchise.write");
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [tier, setTier] = useState("");
  const [country, setCountry] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState("revenueMtd");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [openId, setOpenId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useShortcuts([
    {
      combo: "/",
      description: "Focus search",
      handler: () => (document.getElementById("dir-search") as HTMLInputElement)?.focus(),
    },
  ]);

  const filtered = useMemo(() => {
    let r = rows;
    if (status) r = r.filter((f) => f.status === status);
    if (tier) r = r.filter((f) => f.tier === tier);
    if (country) r = r.filter((f) => f.country === country);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (f) =>
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

  const kpis = useMemo(() => {
    const total = rows.length;
    const by = (s: string) => rows.filter((r) => r.status === s).length;
    const risky = rows.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical").length;
    const avg = (fn: (f: Franchise) => number) => (total ? rows.reduce((a, f) => a + fn(f), 0) / total : undefined);
    return {
      total,
      active: by("active"),
      suspended: by("suspended"),
      risky,
      health: avg((f) => f.healthScore),
      commission: avg((f) => f.commissionPct),
    };
  }, [rows]);

  const chips = [
    status ? { id: "status", label: `Status: ${status}`, onRemove: () => setStatus("") } : null,
    tier ? { id: "tier", label: `Tier: ${tier}`, onRemove: () => setTier("") } : null,
    country ? { id: "country", label: `Country: ${country}`, onRemove: () => setCountry("") } : null,
  ].filter(Boolean) as { id: string; label: string; onRemove: () => void }[];

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected((s) => (s.size === paged.length ? new Set() : new Set(paged.map((r) => r.id))));
  const onSort = (id: string) => {
    if (id === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(id);
      setSortDir("desc");
    }
  };

  const columns: Column<Franchise>[] = [
    { id: "code", header: "Code", sortable: true, cell: (f) => <span className="font-mono text-[11.5px] text-foreground">{f.code}</span> },
    {
      id: "company",
      header: "Franchise",
      sortable: true,
      cell: (f) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">{f.company}</div>
          <div className="truncate text-[11px] text-muted-foreground">{f.owner}</div>
        </div>
      ),
    },
    { id: "country", header: "Location", sortable: true, cell: (f) => <span className="text-muted-foreground">{[f.city, f.state, f.country].filter(Boolean).join(", ")}</span> },
    { id: "tier", header: "Tier", sortable: true, cell: (f) => <StatusBadge status="neutral">{f.tier}</StatusBadge> },
    { id: "status", header: "Status", sortable: true, cell: (f) => <StatusBadge status={f.status} /> },
    { id: "commissionPct", header: "Commission", sortable: true, cell: (f) => <span className="tabular-nums text-foreground">{f.commissionPct.toFixed(1)}%</span> },
    { id: "licenses", header: "Licenses", sortable: true, cell: (f) => <span className="tabular-nums">{f.licenses}</span> },
    { id: "revenueMtd", header: "Revenue MTD", sortable: true, cell: (f) => <span className="tabular-nums text-foreground">${f.revenueMtd.toLocaleString()}</span> },
    { id: "healthScore", header: "Health", sortable: true, cell: (f) => <HealthIndicator score={f.healthScore} /> },
    {
      id: "riskLevel",
      header: "Risk",
      sortable: true,
      cell: (f) => (
        <StatusBadge status={f.riskLevel === "critical" || f.riskLevel === "high" ? "suspended" : f.riskLevel === "medium" ? "pending" : "active"}>
          {f.riskLevel}
        </StatusBadge>
      ),
    },
  ];

  const active = openId ? rows.find((r) => r.id === openId) ?? null : null;

  const exportRows = (scope: "all" | "filtered" | "selected") =>
    (scope === "all" ? rows : scope === "filtered" ? filtered : filtered.filter((r) => selected.has(r.id))).map((f) => ({
      code: f.code,
      company: f.company,
      owner: f.owner,
      country: f.country,
      tier: f.tier,
      status: f.status,
      commissionPct: f.commissionPct,
      licenses: f.licenses,
      revenueMtd: f.revenueMtd,
      healthScore: f.healthScore,
      riskLevel: f.riskLevel,
    }));

  return (
    <>
      <WallHeader
        eyebrow="Directory"
        title="Franchise Master Directory"
        description="Single source of truth for every franchise globally, with health, risk and revenue at a glance."
        actions={
          <>
            <Btn variant="ghost" onClick={() => { void refetch(); toast({ title: "Directory refreshed", tone: "success" }); }} loading={isFetching && !isLoading}>
              Refresh
            </Btn>
            <Btn variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-3.5 w-3.5" /> Import CSV
            </Btn>
            <Btn variant="outline" onClick={() => setExportOpen(true)}>
              <Download className="h-3.5 w-3.5" /> Export
            </Btn>
            <Tip label={canWrite ? "Onboard a franchise manually" : "Requires the franchise.write permission"}>
              <Btn
                variant="primary"
                disabled={!canWrite}
                onClick={() =>
                  toast({
                    title: "Add franchise",
                    description: "Manual onboarding opens once the franchise database is connected.",
                    tone: "info",
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" /> Add Franchise
              </Btn>
            </Tip>
          </>
        }
      />
      <WallBody>
        <KpiGrid>
          <KpiCard label="Total Franchises" value={kpis.total || undefined} loading={isLoading} icon={<Building2 className="h-3.5 w-3.5" />} help="Every franchise record across all countries." />
          <KpiCard label="Active" value={kpis.active || undefined} tone="success" loading={isLoading} icon={<Award className="h-3.5 w-3.5" />} help="Franchises currently trading." />
          <KpiCard label="Suspended" value={kpis.suspended || undefined} tone="destructive" loading={isLoading} icon={<Power className="h-3.5 w-3.5" />} help="Temporarily blocked from operating." />
          <KpiCard label="High Risk" value={kpis.risky || undefined} tone="warning" loading={isLoading} icon={<ShieldAlert className="h-3.5 w-3.5" />} help="Risk level high or critical." />
          <KpiCard label="Avg Health Score" value={kpis.health !== undefined ? Math.round(kpis.health) : undefined} loading={isLoading} icon={<HeartPulse className="h-3.5 w-3.5" />} help="Composite of revenue, support and compliance signals." />
          <KpiCard label="Avg Commission %" value={kpis.commission !== undefined ? `${kpis.commission.toFixed(1)}%` : undefined} loading={isLoading} icon={<Percent className="h-3.5 w-3.5" />} help="Weighted average commission rate." />
        </KpiGrid>

        <Section title="Directory" description="Search, filter and act on the full franchise network.">
          <div className="space-y-3">
            <Toolbar
              id="dir-search"
              search={search}
              onSearch={(v) => { setSearch(v); setPage(1); }}
              searchPlaceholder="Search by code, company or owner…"
              searchLabel="Search franchises"
              filters={chips}
              onClearFilters={() => { setStatus(""); setTier(""); setCountry(""); setPage(1); }}
              right={
                <>
                  <FilterSelect label="Status" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={["active", "pending", "onboarding", "suspended", "cancelled", "terminated"]} />
                  <FilterSelect label="Tier" value={tier} onChange={(v) => { setTier(v); setPage(1); }} options={["bronze", "silver", "gold", "platinum", "diamond"]} />
                  <FilterSelect label="Country" value={country} onChange={(v) => { setCountry(v); setPage(1); }} options={countries} />
                </>
              }
            />

            <EnterpriseTable<Franchise>
              columns={columns}
              rows={paged}
              loading={isLoading}
              error={error ? "Failed to load directory" : null}
              emptyTitle="No franchises in the directory"
              emptyDescription="Once approved applications are converted to franchises, they appear here. Use Add Franchise or Import CSV to onboard manually."
              selected={selected}
              onToggle={toggle}
              onToggleAll={toggleAll}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
              onRowClick={(r) => setOpenId(r.id)}
              pagination={{ page, pageSize, total: filtered.length, onPage: setPage, onPageSize: setPageSize }}
            />

            <BulkBar
              ids={Array.from(selected)}
              entity="franchises"
              onClear={() => setSelected(new Set())}
              actions={[
                {
                  id: "tier",
                  label: "Change tier",
                  icon: <Award className="h-3.5 w-3.5" />,
                  disabled: !canWrite,
                  disabledReason: "Requires the franchise.write permission",
                  confirm: { title: "Change franchise tier", description: "Tier changes recalculate commission on the next cycle.", confirmLabel: "Change tier" },
                  run: () => "Tier change queued",
                },
                {
                  id: "suspend",
                  label: "Suspend",
                  tone: "destructive",
                  icon: <Power className="h-3.5 w-3.5" />,
                  disabled: !canSuspend,
                  disabledReason: "Requires the franchise.suspend permission",
                  confirm: { title: "Suspend franchises?", description: "Suspended franchises immediately lose portal and licence access.", confirmLabel: "Suspend" },
                  run: () => "Suspension queued",
                },
                {
                  id: "export",
                  label: "Export selection",
                  icon: <Download className="h-3.5 w-3.5" />,
                  run: () => { setExportOpen(true); return "Export dialog opened"; },
                },
              ]}
            />
          </div>
        </Section>
      </WallBody>

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entity="franchises"
        backendReady={BACKEND_READY}
        fields={[
          { key: "code", label: "Code", required: true },
          { key: "company", label: "Company", required: true },
          { key: "owner", label: "Owner", required: true },
          { key: "country", label: "Country", required: true },
          { key: "tier", label: "Tier" },
          { key: "commissionPct", label: "Commission %" },
        ]}
      />

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        entity="franchises"
        filename="franchise-directory"
        sheetName="Franchises"
        permission="franchise.read"
        counts={{ all: rows.length, filtered: filtered.length, selected: selected.size }}
        resolve={exportRows}
      />

      <RightPanel
        open={!!active}
        onClose={() => setOpenId(null)}
        eyebrow={active?.code}
        title={active ? active.company : ""}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Tip label="A full franchise profile page opens once the backend is connected">
              <Btn variant="ghost" disabled>
                <ExternalLink className="h-3.5 w-3.5" /> Open Profile
              </Btn>
            </Tip>
            <Btn
              variant="outline"
              disabled={!canSuspend}
              title={!canSuspend ? "Requires the franchise.suspend permission" : undefined}
              onClick={() => { toast({ title: "Suspension queued", description: `${active?.company} will be suspended on approval.`, tone: "warning" }); setOpenId(null); }}
            >
              <Power className="h-3.5 w-3.5" /> Suspend
            </Btn>
            <Tip label={canWrite ? "Edit franchise details" : "Requires the franchise.write permission"}>
              <Btn
                variant="primary"
                disabled={!canWrite}
                onClick={() => toast({ title: "Edit franchise", description: "Inline editing unlocks with the franchise database.", tone: "info" })}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Btn>
            </Tip>
          </div>
        }
      >
        {active && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={active.status} />
              <StatusBadge status={active.riskLevel === "critical" || active.riskLevel === "high" ? "suspended" : "active"}>
                Risk: {active.riskLevel}
              </StatusBadge>
              <StatusBadge status="neutral">{active.tier}</StatusBadge>
            </div>

            <HealthBar score={active.healthScore} />

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <MiniStat label="Owner" value={active.owner} />
              <MiniStat label="Location" value={[active.city, active.country].filter(Boolean).join(", ")} />
              <MiniStat label="Commission" value={`${active.commissionPct.toFixed(1)}%`} />
              <MiniStat label="Licenses" value={active.licenses} />
              <MiniStat label="Revenue MTD" value={`$${active.revenueMtd.toLocaleString()}`} />
              <MiniStat label="Products" value={active.productsAssigned} />
            </div>

            <ComplianceSection
              riskLevel={active.riskLevel}
              checks={[]}
              cta={
                <Btn variant="outline" onClick={() => toast({ title: "Request documents", description: "Document requests send once the backend is connected.", tone: "info" })}>
                  Request documents
                </Btn>
              }
            />

            <ActivitySection events={[]} />
          </div>
        )}
      </RightPanel>
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-surface-2 px-3 py-2">
      <div className="truncate text-[10.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-[13px] font-medium capitalize text-foreground">{value}</div>
    </div>
  );
}
