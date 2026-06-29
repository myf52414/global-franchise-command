import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Btn, Card, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { Toolbar } from "@/components/boss/Toolbar";
import { EnterpriseTable, type Column } from "@/components/boss/EnterpriseTable";
import { StatusBadge } from "@/components/boss/StatusBadge";
import { RightPanel } from "@/components/boss/RightPanel";
import { BackendBanner } from "@/components/boss/BackendBanner";
import { AuditTimeline } from "@/components/boss/AuditTimeline";
import {
  useCommissionRules,
  useCommissions,
  useAuditTrail,
  type Commission,
  type CommissionRule,
  type CommissionStatus,
} from "@/lib/data-hooks";
import { useCan } from "@/lib/session";
import { useToast } from "@/lib/toast";
import { useShortcuts } from "@/lib/shortcuts";
import { exportCsv, fmtMoney, fmtPct } from "@/lib/export";
import { CheckCircle2, Download, Pencil, Plus, RefreshCw, ShieldOff, XCircle } from "lucide-react";

export const Route = createFileRoute("/commission")({
  head: () => ({ meta: [{ title: "Commission · Boss Panel" }] }),
  component: CommissionWall,
});

const STATUSES: CommissionStatus[] = ["draft", "pending", "approved", "paid", "held", "rejected"];
const TABS: { id: CommissionStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...STATUSES.map((s) => ({ id: s, label: s[0].toUpperCase() + s.slice(1) })),
];

function CommissionWall() {
  const { data: rules = [], isLoading: rulesLoading } = useCommissionRules();
  const { data: rows = [], isLoading, error, refetch, isFetching } = useCommissions();
  const canApprove = useCan("commission.approve");
  const { toast } = useToast();

  const [tab, setTab] = useState<CommissionStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [cycle, setCycle] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<string>("cycle");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [openId, setOpenId] = useState<string | null>(null);
  const [ruleOpen, setRuleOpen] = useState<CommissionRule | "new" | null>(null);

  useShortcuts([
    { combo: "shift+n", description: "New rule", handler: () => canApprove && setRuleOpen("new") },
  ]);

  const cycles = useMemo(() => Array.from(new Set(rows.map((r) => r.cycle))), [rows]);

  const filtered = useMemo(() => {
    let r = rows;
    if (tab !== "all") r = r.filter((c) => c.status === tab);
    if (cycle) r = r.filter((c) => c.cycle === cycle);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (c) => c.franchise.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
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
  }, [rows, tab, cycle, search, sortBy, sortDir]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totals = useMemo(() => ({
    payable: rows.filter((c) => c.status === "pending" || c.status === "approved").reduce((s, c) => s + c.payable, 0),
    paid: rows.filter((c) => c.status === "paid").reduce((s, c) => s + c.payable, 0),
    held: rows.filter((c) => c.status === "held").reduce((s, c) => s + c.payable, 0),
  }), [rows]);

  const toggle = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelected((s) => s.size === paged.length ? new Set() : new Set(paged.map((r) => r.id)));

  const onSort = (id: string) => {
    if (id === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(id); setSortDir("asc"); }
  };

  const columns: Column<Commission>[] = [
    { id: "cycle", header: "Cycle", sortable: true, cell: (r) => <span className="font-mono text-[11.5px]">{r.cycle}</span> },
    { id: "franchise", header: "Franchise", sortable: true, cell: (r) => <span className="font-medium text-foreground">{r.franchise}</span> },
    { id: "base", header: "Base", sortable: true, cell: (r) => fmtMoney(r.base) },
    { id: "ratePct", header: "Rate", sortable: true, cell: (r) => fmtPct(r.ratePct) },
    { id: "adjustment", header: "Adjustment", cell: (r) => <span className={r.adjustment < 0 ? "text-destructive" : "text-foreground"}>{fmtMoney(r.adjustment)}</span> },
    { id: "tax", header: "Tax", cell: (r) => fmtMoney(r.tax) },
    { id: "payable", header: "Payable", sortable: true, cell: (r) => <span className="font-semibold text-foreground">{fmtMoney(r.payable)}</span> },
    { id: "status", header: "Status", sortable: true, cell: (r) => <StatusBadge status={r.status} /> },
    { id: "approver", header: "Approver", cell: (r) => r.approver ?? <span className="text-muted-foreground">—</span> },
  ];

  const active = openId ? rows.find((r) => r.id === openId) ?? null : null;

  const bulkAction = (label: string) => {
    toast({ title: label, description: `${selected.size} record(s)`, tone: "success" });
    setSelected(new Set());
  };

  return (
    <>
      <WallHeader
        eyebrow="Commission"
        title="Commission & Payouts"
        description="Commission slabs, royalty rules, payout cycles and statements with full audit trail and RBAC."
        actions={<>
          <Btn variant="ghost" onClick={() => refetch()}><RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh</Btn>
          <Btn variant="outline" disabled={!canApprove} onClick={() => setRuleOpen("new")}>
            <Plus className="h-3.5 w-3.5" /> New Rule
          </Btn>
          <Btn variant="primary" disabled={!canApprove}>Run Payout Cycle</Btn>
        </>}
      />
      <BackendBanner />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Commission Payable" tone="warning" value={totals.payable ? fmtMoney(totals.payable) : undefined} />
          <Stat label="Paid This Cycle" tone="success" value={totals.paid ? fmtMoney(totals.paid) : undefined} />
          <Stat label="Held / On Review" value={totals.held ? fmtMoney(totals.held) : undefined} />
          <Stat label="Avg Commission %" />
        </div>

        <Section
          title="Commission Rules"
          description="Global, country, tier and franchise-scoped rules. Edits create new versions and are logged."
          actions={
            <Btn variant="outline" disabled={!canApprove} onClick={() => setRuleOpen("new")}>
              <Plus className="h-3.5 w-3.5" /> Add Rule
            </Btn>
          }
        >
          <RulesTable rules={rules} loading={rulesLoading} canEdit={canApprove} onEdit={(r) => setRuleOpen(r)} />
        </Section>

        <Section title="Payout Ledger">
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
              searchPlaceholder="Search franchise or payout ID…"
              selectedCount={selected.size}
              bulkActions={<>
                <Btn variant="ghost" disabled={!canApprove} onClick={() => bulkAction("Marked approved")}><CheckCircle2 className="h-3.5 w-3.5" /> Approve</Btn>
                <Btn variant="ghost" disabled={!canApprove} onClick={() => bulkAction("Marked paid")}>Mark Paid</Btn>
                <Btn variant="ghost" disabled={!canApprove} onClick={() => bulkAction("Held for review")}><ShieldOff className="h-3.5 w-3.5" /> Hold</Btn>
                <Btn variant="ghost" disabled={!canApprove} onClick={() => bulkAction("Rejected")}><XCircle className="h-3.5 w-3.5" /> Reject</Btn>
                <Btn variant="ghost" onClick={() => exportCsv("commissions-selected.csv", rows.filter((r) => selected.has(r.id)))}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Btn>
              </>}
              right={<>
                <select
                  value={cycle}
                  onChange={(e) => { setCycle(e.target.value); setPage(1); }}
                  className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground"
                >
                  <option value="">All cycles</option>
                  {cycles.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Btn variant="ghost" onClick={() => exportCsv("commissions.csv", filtered)}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Btn>
              </>}
            />

            <EnterpriseTable<Commission>
              columns={columns}
              rows={paged}
              loading={isLoading}
              error={error ? "Failed to load commissions" : null}
              emptyTitle="No payouts yet"
              emptyDescription="Once a commission cycle runs, payouts appear here. Each row tracks base, adjustments, tax and approver."
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

      <CommissionDetailPanel
        commission={active}
        onClose={() => setOpenId(null)}
        canApprove={canApprove}
        onAction={(label) => { toast({ title: label, tone: "success" }); setOpenId(null); }}
      />

      <RuleFormPanel
        target={ruleOpen}
        onClose={() => setRuleOpen(null)}
        onSubmit={(d) => { toast({ title: "Rule saved", description: d.name, tone: "success" }); setRuleOpen(null); }}
      />
    </>
  );
}

function RulesTable({
  rules, loading, canEdit, onEdit,
}: { rules: CommissionRule[]; loading: boolean; canEdit: boolean; onEdit: (r: CommissionRule) => void }) {
  const cols: Column<CommissionRule>[] = [
    { id: "name", header: "Name", cell: (r) => <span className="font-medium text-foreground">{r.name}</span> },
    { id: "scope", header: "Scope", cell: (r) => <span className="capitalize">{r.scope}{r.scopeValue ? ` · ${r.scopeValue}` : ""}</span> },
    { id: "basis", header: "Basis", cell: (r) => <span className="capitalize">{r.basis}</span> },
    { id: "ratePct", header: "Rate", cell: (r) => fmtPct(r.ratePct) },
    { id: "minPayout", header: "Min Payout", cell: (r) => fmtMoney(r.minPayout) },
    { id: "active", header: "Status", cell: (r) => r.active ? <StatusBadge status="active" /> : <StatusBadge status="draft" /> },
    { id: "updatedAt", header: "Updated", cell: (r) => <span className="text-muted-foreground">{r.updatedAt}</span> },
    { id: "edit", header: "", cell: (r) => (
      <Btn variant="ghost" disabled={!canEdit} onClick={() => onEdit(r)}>
        <Pencil className="h-3.5 w-3.5" /> Edit
      </Btn>
    ) },
  ];
  return (
    <EnterpriseTable<CommissionRule>
      columns={cols}
      rows={rules}
      loading={loading}
      selectable={false}
      emptyTitle="No commission rules defined"
      emptyDescription="Add your first rule to start calculating commissions for franchises."
    />
  );
}

function CommissionDetailPanel({
  commission, onClose, canApprove, onAction,
}: { commission: Commission | null; onClose: () => void; canApprove: boolean; onAction: (label: string) => void }) {
  const { data: audit = [], isLoading } = useAuditTrail("commission", commission?.id);
  return (
    <RightPanel
      open={!!commission}
      onClose={onClose}
      eyebrow="Payout"
      title={commission ? `${commission.franchise} · ${commission.cycle}` : ""}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Btn variant="outline" disabled={!canApprove} onClick={() => onAction("Held for review")}>Hold</Btn>
          <Btn variant="destructive" disabled={!canApprove} onClick={() => onAction("Rejected")}>Reject</Btn>
          <Btn variant="primary" disabled={!canApprove} onClick={() => onAction("Approved")}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
          </Btn>
        </div>
      }
    >
      {commission && (
        <div className="space-y-5">
          <Card>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Payable</div>
            <div className="mt-2 text-[24px] font-semibold tracking-tight text-foreground">
              {fmtMoney(commission.payable)}
            </div>
            <div className="mt-1"><StatusBadge status={commission.status} /></div>
          </Card>
          <Card>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Breakdown</div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-[12.5px]">
              <KV k="Base" v={fmtMoney(commission.base)} />
              <KV k="Rate" v={fmtPct(commission.ratePct)} />
              <KV k="Adjustment" v={fmtMoney(commission.adjustment)} />
              <KV k="Tax" v={fmtMoney(commission.tax)} />
              <KV k="Approver" v={commission.approver ?? "—"} />
              <KV k="Cycle" v={commission.cycle} />
            </dl>
          </Card>
          <AuditTimeline entries={audit} loading={isLoading} />
        </div>
      )}
    </RightPanel>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="text-foreground">{v}</dd>
    </div>
  );
}

const ruleSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  scope: z.enum(["global", "country", "tier", "franchise"]),
  scopeValue: z.string().trim().max(120).optional(),
  basis: z.enum(["revenue", "license", "renewal", "product"]),
  ratePct: z.coerce.number().min(0, "≥ 0").max(100, "≤ 100"),
  minPayout: z.coerce.number().min(0, "≥ 0").max(1_000_000),
  active: z.coerce.boolean().optional(),
});

function RuleFormPanel({
  target, onClose, onSubmit,
}: { target: CommissionRule | "new" | null; onClose: () => void; onSubmit: (d: z.infer<typeof ruleSchema>) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const existing = target && target !== "new" ? target : null;
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = ruleSchema.safeParse({
      name: fd.get("name"),
      scope: fd.get("scope"),
      scopeValue: fd.get("scopeValue") || undefined,
      basis: fd.get("basis"),
      ratePct: fd.get("ratePct"),
      minPayout: fd.get("minPayout"),
      active: fd.get("active") === "on",
    });
    if (!result.success) {
      const map: Record<string, string> = {};
      for (const issue of result.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    onSubmit(result.data);
  };
  return (
    <RightPanel
      open={!!target}
      onClose={onClose}
      eyebrow={existing ? "Edit" : "New"}
      title={existing ? `Edit rule · ${existing.name}` : "New commission rule"}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" type="submit" form="rule-form">Save Rule</Btn>
        </div>
      }
    >
      <form id="rule-form" onSubmit={submit} className="space-y-4" key={existing?.id ?? "new"}>
        <RField label="Rule Name" name="name" defaultValue={existing?.name} error={errors.name} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <RField label="Scope" name="scope" as="select" options={["global","country","tier","franchise"]} defaultValue={existing?.scope} error={errors.scope} required />
          <RField label="Scope Value" name="scopeValue" defaultValue={existing?.scopeValue ?? ""} placeholder="e.g. India, Gold" error={errors.scopeValue} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <RField label="Basis" name="basis" as="select" options={["revenue","license","renewal","product"]} defaultValue={existing?.basis} error={errors.basis} required />
          <RField label="Rate (%)" name="ratePct" type="number" step="0.01" defaultValue={existing?.ratePct} error={errors.ratePct} required />
          <RField label="Min Payout" name="minPayout" type="number" step="1" defaultValue={existing?.minPayout} error={errors.minPayout} required />
        </div>
        <label className="flex items-center gap-2 text-[12.5px] text-foreground">
          <input type="checkbox" name="active" defaultChecked={existing?.active ?? true} className="h-3.5 w-3.5 accent-[color:var(--color-primary)]" />
          Activate rule immediately
        </label>
        <Card className="bg-surface-2">
          <div className="text-[11.5px] text-muted-foreground">
            Rule changes are versioned and audited. Existing payouts retain the rule version they were calculated with.
          </div>
        </Card>
      </form>
    </RightPanel>
  );
}

function RField({
  label, name, error, required, type = "text", as, options, defaultValue, placeholder, step,
}: {
  label: string; name: string; error?: string; required?: boolean;
  type?: string; as?: "select"; options?: readonly string[];
  defaultValue?: string | number; placeholder?: string; step?: string;
}) {
  const cls =
    "w-full rounded-md border bg-surface px-2.5 py-2 text-[12.5px] text-foreground outline-none transition-colors focus:border-primary " +
    (error ? "border-destructive" : "border-border");
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11.5px] font-medium text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </span>
        {error && <span className="text-[11px] text-destructive">{error}</span>}
      </div>
      {as === "select" ? (
        <select name={name} className={cls} defaultValue={defaultValue as string ?? ""}>
          <option value="" disabled>Select…</option>
          {(options ?? []).map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
        </select>
      ) : (
        <input name={name} type={type} step={step} placeholder={placeholder} defaultValue={defaultValue} className={cls} />
      )}
    </label>
  );
}
