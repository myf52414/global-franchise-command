import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Btn, Card, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { Toolbar } from "@/components/boss/Toolbar";
import { EnterpriseTable, type Column } from "@/components/boss/EnterpriseTable";
import { BackendBanner } from "@/components/boss/BackendBanner";
import { useTerritories, type Territory } from "@/lib/data-hooks";
import { useCan } from "@/lib/session";
import { useToast } from "@/lib/toast";
import { Globe2, Lock, Plus, Repeat } from "lucide-react";

export const Route = createFileRoute("/regions")({
  head: () => ({ meta: [{ title: "Territory & Regions · Boss Panel" }] }),
  component: RegionsWall,
});

function RegionsWall() {
  const { data: rows = [], isLoading, error } = useTerritories();
  const canAssign = useCan("territory.assign");
  const canTransfer = useCan("territory.transfer");
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [onlyLocked, setOnlyLocked] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<string>("population");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const regions = useMemo(() => Array.from(new Set(rows.map((r) => r.region))).filter(Boolean), [rows]);
  const countries = useMemo(() => Array.from(new Set(rows.map((r) => r.country))).filter(Boolean), [rows]);

  const filtered = useMemo(() => {
    let r = rows;
    if (region) r = r.filter((t) => t.region === region);
    if (country) r = r.filter((t) => t.country === country);
    if (onlyLocked) r = r.filter((t) => t.locked);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((t) =>
        t.city.toLowerCase().includes(q) ||
        t.state.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q) ||
        (t.assignedTo ?? "").toLowerCase().includes(q),
      );
    }
    r = [...r].sort((a, b) => {
      const av = (a as unknown as Record<string, string | number | null>)[sortBy] ?? "";
      const bv = (b as unknown as Record<string, string | number | null>)[sortBy] ?? "";
      if (av! < bv!) return sortDir === "asc" ? -1 : 1;
      if (av! > bv!) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [rows, region, country, onlyLocked, search, sortBy, sortDir]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggle = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelected((s) => s.size === paged.length ? new Set() : new Set(paged.map((r) => r.id)));
  const onSort = (id: string) => {
    if (id === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(id); setSortDir("desc"); }
  };

  const columns: Column<Territory>[] = [
    { id: "region", header: "Region", sortable: true, cell: (t) => <span className="text-foreground">{t.region}</span> },
    { id: "country", header: "Country", sortable: true, cell: (t) => t.country },
    { id: "state", header: "State", cell: (t) => t.state },
    { id: "city", header: "City", sortable: true, cell: (t) => t.city },
    { id: "assignedTo", header: "Assigned To", cell: (t) => t.assignedTo ?? <span className="text-muted-foreground">Unassigned</span> },
    { id: "population", header: "Population", sortable: true, cell: (t) => <span className="tabular-nums">{t.population.toLocaleString()}</span> },
    { id: "marketSize", header: "Market Size (USD)", sortable: true, cell: (t) => <span className="tabular-nums">${t.marketSize.toLocaleString()}</span> },
    { id: "locked", header: "Lock", cell: (t) => t.locked
      ? <span className="inline-flex items-center gap-1 text-[11.5px] text-foreground"><Lock className="h-3 w-3" /> Locked</span>
      : <span className="text-muted-foreground">Open</span> },
  ];

  return (
    <>
      <WallHeader
        eyebrow="Territory"
        title="Region & Territory Management"
        description="Manage regions, states, cities, locks, transfers and expansion plans across the globe."
        actions={<>
          <Btn variant="outline" disabled={!canTransfer}><Repeat className="h-3.5 w-3.5" /> Transfer</Btn>
          <Btn variant="primary" disabled={!canAssign}><Plus className="h-3.5 w-3.5" /> Assign Territory</Btn>
        </>}
      />
      <BackendBanner />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Regions" />
          <Stat label="Countries" />
          <Stat label="States" />
          <Stat label="Cities Assigned" />
          <Stat label="Locked" tone="info" />
          <Stat label="Pending Transfers" tone="warning" />
        </div>

        <Section title="Global Map">
          <Card>
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Coverage Map
              </div>
              <div className="text-[11.5px] text-muted-foreground">Renders from <code className="text-foreground">territories.country</code></div>
            </div>
            <div className="mt-4 grid h-72 place-items-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
              <div className="flex flex-col items-center gap-1.5">
                <Globe2 className="h-5 w-5" />
                World map renders once territories are configured
              </div>
            </div>
          </Card>
        </Section>

        <Section title="Territories">
          <div className="space-y-3">
            <Toolbar
              search={search}
              onSearch={(v) => { setSearch(v); setPage(1); }}
              searchPlaceholder="Search region, country, city or owner…"
              selectedCount={selected.size}
              bulkActions={<>
                <Btn variant="ghost" disabled={!canAssign}>Assign</Btn>
                <Btn variant="ghost" disabled={!canTransfer}>Transfer</Btn>
                <Btn variant="ghost">{onlyLocked ? "Unlock" : "Lock"}</Btn>
              </>}
              right={<>
                <select
                  value={region}
                  onChange={(e) => { setRegion(e.target.value); setPage(1); }}
                  className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground"
                >
                  <option value="">All regions</option>
                  {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <select
                  value={country}
                  onChange={(e) => { setCountry(e.target.value); setPage(1); }}
                  className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground"
                >
                  <option value="">All countries</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <label className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground">
                  <input type="checkbox" checked={onlyLocked} onChange={(e) => setOnlyLocked(e.target.checked)} className="accent-[color:var(--color-primary)]" />
                  Locked only
                </label>
              </>}
            />

            <EnterpriseTable<Territory>
              columns={columns}
              rows={paged}
              loading={isLoading}
              error={error ? "Failed to load territories" : null}
              emptyTitle="No territories defined"
              emptyDescription="Define regions and assign territories to franchises. Coverage, population and market sizing will surface here."
              selected={selected}
              onToggle={toggle}
              onToggleAll={toggleAll}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
              onRowClick={() => toast({ title: "Territory details", description: "Detail panel will open once a record is selected.", tone: "info" })}
              pagination={{ page, pageSize, total: filtered.length, onPage: setPage, onPageSize: setPageSize }}
            />
          </div>
        </Section>
      </WallBody>
    </>
  );
}
