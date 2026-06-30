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
  useLicenses,
  useAuditTrail,
  type License,
  type LicensePlan,
  type LicenseStatus,
} from "@/lib/data-hooks";
import { useCan } from "@/lib/session";
import { useToast } from "@/lib/toast";
import { useShortcuts } from "@/lib/shortcuts";
import { ExportMenu } from "@/components/boss/ExportMenu";
import { fmtNumber } from "@/lib/export";
import { FileCheck2, KeyRound, Paperclip, Plus, RefreshCw, ShieldAlert, ShieldCheck, UploadCloud, X } from "lucide-react";

export const Route = createFileRoute("/license")({
  head: () => ({ meta: [{ title: "License · Boss Panel" }] }),
  component: LicenseWall,
});

const PLANS: LicensePlan[] = ["starter", "growth", "scale", "enterprise"];
const STATUSES: LicenseStatus[] = ["active", "pending", "suspended", "expiring", "expired", "revoked"];

const TABS: { id: LicenseStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...STATUSES.map((s) => ({ id: s, label: s[0].toUpperCase() + s.slice(1) })),
];

function LicenseWall() {
  const { data: rows = [], isLoading, error, refetch, isFetching } = useLicenses();
  const canGenerate = useCan("license.generate");
  const canRevoke = useCan("license.revoke");
  const { toast } = useToast();

  const [tab, setTab] = useState<LicenseStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<LicensePlan | "">("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<string>("issuedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState<License | null>(null);

  useShortcuts([
    { combo: "shift+n", description: "Generate license", handler: () => canGenerate && setNewOpen(true) },
    { combo: "/", description: "Focus search", handler: () => (document.getElementById("lic-search") as HTMLInputElement)?.focus() },
  ]);

  const filtered = useMemo(() => {
    let r = rows;
    if (tab !== "all") r = r.filter((l) => l.status === tab);
    if (plan) r = r.filter((l) => l.plan === plan);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (l) =>
          l.key.toLowerCase().includes(q) ||
          l.franchise.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q),
      );
    }
    r = [...r].sort((a, b) => {
      const av = (a as unknown as Record<string, string | number | null>)[sortBy] ?? "";
      const bv = (b as unknown as Record<string, string | number | null>)[sortBy] ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [rows, tab, plan, search, sortBy, sortDir]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const counters = useMemo(() => ({
    active: rows.filter((l) => l.status === "active").length,
    suspended: rows.filter((l) => l.status === "suspended").length,
    expiring: rows.filter((l) => l.status === "expiring").length,
    expired: rows.filter((l) => l.status === "expired").length,
  }), [rows]);

  const toggle = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelected((s) => s.size === paged.length ? new Set() : new Set(paged.map((r) => r.id)));

  const columns: Column<License>[] = [
    { id: "key", header: "License Key", sortable: true, cell: (r) => <span className="font-mono text-[11.5px]">{r.key}</span> },
    { id: "franchise", header: "Franchise", sortable: true, cell: (r) => <span className="font-medium text-foreground">{r.franchise}</span> },
    { id: "plan", header: "Plan", sortable: true, cell: (r) => <span className="capitalize">{r.plan}</span> },
    { id: "devices", header: "Devices", sortable: true, cell: (r) => <span className="text-muted-foreground">{fmtNumber(r.devices)} / {fmtNumber(r.devicesMax)}</span> },
    { id: "domains", header: "Domains", cell: (r) => <span className="text-muted-foreground">{fmtNumber(r.domains)} / {fmtNumber(r.domainsMax)}</span> },
    { id: "issuedAt", header: "Issued", sortable: true, cell: (r) => <span className="text-muted-foreground">{r.issuedAt}</span> },
    { id: "expiresAt", header: "Expires", sortable: true, cell: (r) => <span className="text-muted-foreground">{r.expiresAt}</span> },
    { id: "kycVerified", header: "KYC", cell: (r) => r.kycVerified
      ? <StatusBadge status="approved">Verified</StatusBadge>
      : <StatusBadge status="kyc">Pending</StatusBadge> },
    { id: "status", header: "Status", sortable: true, cell: (r) => <StatusBadge status={r.status} /> },
  ];

  const onSort = (id: string) => {
    if (id === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(id); setSortDir("asc"); }
  };

  const active = openId ? rows.find((r) => r.id === openId) ?? null : null;

  return (
    <>
      <WallHeader
        eyebrow="License"
        title="License Management"
        description="Generate, activate, suspend, renew and audit franchise software licenses with KYC and compliance gates."
        actions={<>
          <Btn variant="ghost" onClick={() => refetch()}><RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh</Btn>
          <Btn variant="outline" disabled={!canGenerate}>Bulk Generate</Btn>
          <Btn variant="primary" disabled={!canGenerate} onClick={() => setNewOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Generate License
          </Btn>
        </>}
      />
      <BackendBanner />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Active Licenses" tone="success" value={counters.active || undefined} />
          <Stat label="Suspended" tone="destructive" value={counters.suspended || undefined} />
          <Stat label="Expiring < 30d" tone="warning" value={counters.expiring || undefined} />
          <Stat label="Expired" value={counters.expired || undefined} />
          <Stat label="Avg. Devices / License" />
          <Stat label="Avg. Domains / License" />
        </div>

        <Section title="Licenses">
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
              searchPlaceholder="Search license key, franchise…"
              selectedCount={selected.size}
              bulkActions={<>
                <Btn variant="ghost" disabled={!canGenerate}>Renew</Btn>
                <Btn variant="ghost" disabled={!canRevoke}>Suspend</Btn>
                <Btn variant="ghost" disabled={!canRevoke}>Revoke</Btn>
                <ExportMenu<License>
                  filename="licenses-selected"
                  rows={rows.filter((r) => selected.has(r.id))}
                  sheetName="Selected"
                  label="Export Selected"
                />
              </>}
              right={<>
                <select
                  value={plan}
                  onChange={(e) => { setPlan(e.target.value as LicensePlan | ""); setPage(1); }}
                  className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground"
                >
                  <option value="">All plans</option>
                  {PLANS.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
                </select>
                <ExportMenu<License>
                  filename="licenses"
                  rows={filtered}
                  sheetName="Licenses"
                />
              </>}
            />

            <EnterpriseTable<License>
              columns={columns}
              rows={paged}
              loading={isLoading}
              error={error ? "Failed to load licenses" : null}
              emptyTitle="No licenses issued yet"
              emptyDescription="Generated licenses appear here with usage, KYC and compliance status."
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

      <LicenseDetailPanel
        license={active}
        onClose={() => setOpenId(null)}
        canRevoke={canRevoke}
        onAction={(label) => { toast({ title: label, tone: "success" }); setOpenId(null); }}
        onRenew={() => { if (active) { setRenewTarget(active); setOpenId(null); } }}
      />

      <GenerateLicensePanel
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onSubmit={(d) => {
          toast({
            title: "License generated",
            description: `${d.franchise} · ${d.plan} · ${d.kycDocs.length + d.complianceDocs.length} doc(s)`,
            tone: "success",
          });
          setNewOpen(false);
        }}
      />

      <RenewLicensePanel
        license={renewTarget}
        onClose={() => setRenewTarget(null)}
        canRenew={canGenerate}
        onSubmit={(d) => {
          toast({
            title: "Renewal submitted",
            description: `${renewTarget?.franchise ?? ""} · until ${d.expiresAt} · ${d.complianceDocs.length} doc(s)`,
            tone: "success",
          });
          setRenewTarget(null);
        }}
      />
    </>
  );
}

function LicenseDetailPanel({
  license, onClose, canRevoke, onAction, onRenew,
}: { license: License | null; onClose: () => void; canRevoke: boolean; onAction: (label: string) => void; onRenew: () => void }) {
  const { data: audit = [], isLoading } = useAuditTrail("license", license?.id);
  return (
    <RightPanel
      open={!!license}
      onClose={onClose}
      eyebrow="License"
      title={license ? `${license.franchise} · ${license.key}` : ""}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Btn variant="ghost" onClick={onRenew}>Renew</Btn>
          <Btn variant="outline" disabled={!canRevoke} onClick={() => onAction("License suspended")}>Suspend</Btn>
          <Btn variant="destructive" disabled={!canRevoke} onClick={() => onAction("License revoked")}>Revoke</Btn>
        </div>
      }
    >
      {license && (
        <div className="space-y-5">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Status</div>
                <div className="mt-2"><StatusBadge status={license.status} /></div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Plan</div>
                <div className="mt-2 text-[13px] font-semibold capitalize text-foreground">{license.plan}</div>
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                {license.kycVerified ? <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--color-success)]" /> : <ShieldAlert className="h-3.5 w-3.5 text-[color:var(--color-warning)]" />} KYC
              </div>
              <div className="mt-2 text-[13px] text-foreground">
                {license.kycVerified ? "Verified" : "Pending verification"}
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                {license.complianceCleared ? <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--color-success)]" /> : <ShieldAlert className="h-3.5 w-3.5 text-[color:var(--color-warning)]" />} Compliance
              </div>
              <div className="mt-2 text-[13px] text-foreground">
                {license.complianceCleared ? "Cleared" : "Review required"}
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <KeyRound className="h-3.5 w-3.5" /> Allocation
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-[12.5px]">
              <Row k="Devices" v={`${license.devices} / ${license.devicesMax}`} />
              <Row k="Domains" v={`${license.domains} / ${license.domainsMax}`} />
              <Row k="Issued" v={license.issuedAt} />
              <Row k="Expires" v={license.expiresAt} />
            </dl>
          </Card>

          <AuditTimeline entries={audit} loading={isLoading} />
        </div>
      )}
    </RightPanel>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="text-foreground">{v}</dd>
    </div>
  );
}

const genSchema = z.object({
  franchise: z.string().trim().min(2, "Franchise is required").max(160),
  plan: z.enum(["starter", "growth", "scale", "enterprise"]),
  devicesMax: z.coerce.number().int().min(1, "Must be ≥ 1").max(100000),
  domainsMax: z.coerce.number().int().min(1, "Must be ≥ 1").max(10000),
  expiresAt: z.string().min(1, "Expiry date is required"),
  kycVerified: z.coerce.boolean().optional(),
});

function GenerateLicensePanel({
  open, onClose, onSubmit,
}: { open: boolean; onClose: () => void; onSubmit: (d: z.infer<typeof genSchema>) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = genSchema.safeParse({
      franchise: fd.get("franchise"),
      plan: fd.get("plan"),
      devicesMax: fd.get("devicesMax"),
      domainsMax: fd.get("domainsMax"),
      expiresAt: fd.get("expiresAt"),
      kycVerified: fd.get("kycVerified") === "on",
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
      open={open}
      onClose={onClose}
      eyebrow="New"
      title="Generate license"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" type="submit" form="lic-form">Generate</Btn>
        </div>
      }
    >
      <form id="lic-form" onSubmit={submit} className="space-y-4">
        <LField label="Franchise" name="franchise" error={errors.franchise} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <LField label="Plan" name="plan" as="select" options={PLANS} error={errors.plan} required />
          <LField label="Expiry Date" name="expiresAt" type="date" error={errors.expiresAt} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <LField label="Max Devices" name="devicesMax" type="number" error={errors.devicesMax} required />
          <LField label="Max Domains" name="domainsMax" type="number" error={errors.domainsMax} required />
        </div>
        <label className="flex items-center gap-2 text-[12.5px] text-foreground">
          <input type="checkbox" name="kycVerified" className="h-3.5 w-3.5 accent-[color:var(--color-primary)]" />
          Mark KYC as verified for this franchise
        </label>
        <Card className="bg-surface-2">
          <div className="text-[11.5px] text-muted-foreground">
            License keys are issued after KYC and compliance gates pass. Each issuance is recorded in the audit log with actor, IP and request metadata.
          </div>
        </Card>
      </form>
    </RightPanel>
  );
}

function LField({
  label, name, error, required, type = "text", as, options,
}: {
  label: string; name: string; error?: string; required?: boolean;
  type?: string; as?: "select"; options?: readonly string[];
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
        <select name={name} className={cls} defaultValue="">
          <option value="" disabled>Select…</option>
          {(options ?? []).map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
        </select>
      ) : (
        <input name={name} type={type} className={cls} />
      )}
    </label>
  );
}
