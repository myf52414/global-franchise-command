import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Btn, Card, PillRow, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { Toolbar } from "@/components/boss/Toolbar";
import { EnterpriseTable, type Column } from "@/components/boss/EnterpriseTable";
import { StatusBadge } from "@/components/boss/StatusBadge";
import { RightPanel } from "@/components/boss/RightPanel";
import { BackendBanner } from "@/components/boss/BackendBanner";
import {
  APPLICATION_PIPELINE,
  STAGE_LABEL,
  type ApplicationStage,
} from "@/lib/franchise-domain";
import { useApplications, type Application } from "@/lib/data-hooks";
import { useCan } from "@/lib/session";
import { useToast } from "@/lib/toast";
import { useShortcuts } from "@/lib/shortcuts";
import { CheckCircle2, Plus, UserCog, XCircle } from "lucide-react";

export const Route = createFileRoute("/applications")({
  head: () => ({ meta: [{ title: "Franchise Applications · Boss Panel" }] }),
  component: ApplicationsWall,
});

const TABS: { id: ApplicationStage | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...APPLICATION_PIPELINE.map((s) => ({ id: s, label: STAGE_LABEL[s] })),
];

function ApplicationsWall() {
  const { data: rows = [], isLoading, error } = useApplications();
  const canApprove = useCan("application.approve");
  const canReject = useCan("application.reject");
  const { toast } = useToast();

  const [tab, setTab] = useState<ApplicationStage | "all">("all");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<string>("submittedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  useShortcuts([
    { combo: "shift+n", description: "New application", handler: () => setNewOpen(true) },
    { combo: "/", description: "Focus search", handler: () => (document.getElementById("apps-search") as HTMLInputElement)?.focus() },
  ]);

  const filtered = useMemo(() => {
    let r = rows;
    if (tab !== "all") r = r.filter((a) => a.stage === tab);
    if (country) r = r.filter((a) => a.country === country);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (a) =>
          a.applicantName.toLowerCase().includes(q) ||
          a.company.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q),
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
  }, [rows, tab, country, search, sortBy, sortDir]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected((s) =>
      s.size === paged.length ? new Set() : new Set(paged.map((r) => r.id)),
    );

  const columns: Column<Application>[] = [
    { id: "id", header: "App ID", sortable: true, cell: (r) => <span className="font-mono text-[11.5px] text-foreground">{r.id}</span> },
    { id: "applicantName", header: "Applicant", sortable: true, cell: (r) => (
      <div><div className="font-medium text-foreground">{r.applicantName}</div><div className="text-[11px] text-muted-foreground">{r.company}</div></div>
    )},
    { id: "country", header: "Location", sortable: true, cell: (r) => <span className="text-muted-foreground">{[r.city, r.state, r.country].filter(Boolean).join(", ")}</span> },
    { id: "stage", header: "Stage", sortable: true, cell: (r) => <StatusBadge status={r.stage}>{STAGE_LABEL[r.stage]}</StatusBadge> },
    { id: "reviewer", header: "Reviewer", cell: (r) => r.reviewer ?? <span className="text-muted-foreground">Unassigned</span> },
    { id: "kycVerified", header: "KYC", cell: (r) => r.kycVerified ? <StatusBadge status="approved">Verified</StatusBadge> : <StatusBadge status="kyc">Pending</StatusBadge> },
    { id: "paymentVerified", header: "Payment", cell: (r) => r.paymentVerified ? <StatusBadge status="approved">Cleared</StatusBadge> : <StatusBadge status="payment_verification">Pending</StatusBadge> },
    { id: "submittedAt", header: "Submitted", sortable: true, cell: (r) => <span className="text-muted-foreground">{r.submittedAt}</span> },
  ];

  const onSort = (id: string) => {
    if (id === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(id); setSortDir("asc"); }
  };

  const countries = useMemo(() => Array.from(new Set(rows.map((r) => r.country))).filter(Boolean), [rows]);

  const active = openId ? rows.find((r) => r.id === openId) ?? null : null;

  return (
    <>
      <WallHeader
        eyebrow="Applications"
        title="Franchise Applications"
        description="Review, verify and approve incoming applications with a full audit trail."
        actions={<>
          <Btn variant="outline" disabled={selected.size === 0}>Bulk Assign Reviewer</Btn>
          <Btn variant="primary" onClick={() => setNewOpen(true)}><Plus className="h-3.5 w-3.5" /> New Application</Btn>
        </>}
      />
      <BackendBanner />
      <WallBody>
        <div className="wall-grid">
          <Stat label="New" />
          <Stat label="Under Review" tone="warning" />
          <Stat label="KYC Pending" tone="warning" />
          <Stat label="Awaiting Signature" tone="info" />
          <Stat label="Approved" tone="success" />
          <Stat label="Rejected" tone="destructive" />
        </div>

        <Section title="Workflow Pipeline">
          <PillRow items={APPLICATION_PIPELINE.map((s) => STAGE_LABEL[s])} />
        </Section>

        <Section title="Applications">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-1 border-b border-border">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setPage(1); }}
                  className={`relative -mb-px border-b-2 px-3 py-2 text-[12.5px] font-medium transition-colors ${
                    tab === t.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                  <span className="ml-1.5 rounded bg-surface-2 px-1.5 py-0.5 text-[10.5px] text-muted-foreground">
                    {t.id === "all" ? rows.length : rows.filter((r) => r.stage === t.id).length}
                  </span>
                </button>
              ))}
            </div>

            <Toolbar
              search={search}
              onSearch={(v) => { setSearch(v); setPage(1); }}
              searchPlaceholder="Search applicant, company or App ID…"
              selectedCount={selected.size}
              bulkActions={<>
                <Btn variant="ghost">Assign</Btn>
                <Btn variant="ghost">Move stage</Btn>
                <Btn variant="ghost">Export</Btn>
              </>}
              right={<>
                <select
                  value={country}
                  onChange={(e) => { setCountry(e.target.value); setPage(1); }}
                  className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-foreground"
                >
                  <option value="">All countries</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Btn variant="outline">More filters</Btn>
                <Btn variant="ghost">Export</Btn>
              </>}
            />

            <EnterpriseTable<Application>
              columns={columns}
              rows={paged}
              loading={isLoading}
              error={error ? "Failed to load applications" : null}
              emptyTitle="No applications yet"
              emptyDescription="Once franchise applications are submitted, they will appear here with their full review and audit trail."
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
        eyebrow="Application"
        title={active ? `${active.applicantName} · ${active.company}` : ""}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Btn variant="ghost">Assign Reviewer</Btn>
            <Btn variant="outline" disabled={!canReject}>
              <XCircle className="h-3.5 w-3.5" /> Reject
            </Btn>
            <Btn
              variant="primary"
              disabled={!canApprove}
              onClick={() => { toast({ title: "Approval recorded", tone: "success" }); setOpenId(null); }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Advance
            </Btn>
          </div>
        }
      >
        {active && (
          <div className="space-y-5">
            <Card>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Current stage</div>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge status={active.stage}>{STAGE_LABEL[active.stage]}</StatusBadge>
                <span className="text-[11.5px] text-muted-foreground">Submitted {active.submittedAt}</span>
              </div>
            </Card>

            <Card>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Pipeline</div>
              <ol className="mt-3 space-y-2">
                {APPLICATION_PIPELINE.map((s) => {
                  const reached = APPLICATION_PIPELINE.indexOf(s) <= APPLICATION_PIPELINE.indexOf(active.stage);
                  return (
                    <li key={s} className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${reached ? "bg-primary" : "bg-border-strong"}`} />
                      <span className={`text-[12.5px] ${reached ? "text-foreground" : "text-muted-foreground"}`}>{STAGE_LABEL[s]}</span>
                    </li>
                  );
                })}
              </ol>
            </Card>

            <Card>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                <UserCog className="h-3.5 w-3.5" /> Reviewer
              </div>
              <div className="mt-2 text-[13px] text-foreground">{active.reviewer ?? "Unassigned"}</div>
            </Card>

            <Card>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Audit Timeline</div>
              <div className="mt-3 rounded-md border border-dashed border-border px-3 py-6 text-center text-[12px] text-muted-foreground">
                Timeline entries will appear here for every reviewer action, status change, document upload and signature event.
              </div>
            </Card>
          </div>
        )}
      </RightPanel>

      <NewApplicationPanel open={newOpen} onClose={() => setNewOpen(false)} />
    </>
  );
}

const newAppSchema = z.object({
  applicantName: z.string().trim().min(2, "Name is required").max(120),
  company: z.string().trim().min(2, "Company is required").max(160),
  email: z.string().trim().email("Invalid email").max(255),
  country: z.string().trim().min(2, "Country is required").max(80),
  city: z.string().trim().min(2, "City is required").max(80),
  notes: z.string().trim().max(1000).optional(),
});

function NewApplicationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const canCreate = useCan("application.review");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = newAppSchema.safeParse({
      applicantName: fd.get("applicantName"),
      company: fd.get("company"),
      email: fd.get("email"),
      country: fd.get("country"),
      city: fd.get("city"),
      notes: fd.get("notes"),
    });
    if (!result.success) {
      const map: Record<string, string> = {};
      for (const issue of result.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    // TODO: mutation -> useServerFn(createApplication)
    toast({ title: "Application submitted", description: `${result.data.company} added to intake.`, tone: "success" });
    onClose();
  };

  return (
    <RightPanel
      open={open}
      onClose={onClose}
      eyebrow="New"
      title="Create franchise application"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" type="submit" form="new-app-form" disabled={!canCreate}>
            Submit Application
          </Btn>
        </div>
      }
    >
      <form id="new-app-form" onSubmit={submit} className="space-y-4">
        <Field label="Applicant Name" name="applicantName" error={errors.applicantName} required />
        <Field label="Company / Brand" name="company" error={errors.company} required />
        <Field label="Email" name="email" type="email" error={errors.email} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country" name="country" error={errors.country} required />
          <Field label="City" name="city" error={errors.city} required />
        </div>
        <Field label="Notes" name="notes" textarea error={errors.notes} />
      </form>
    </RightPanel>
  );
}

function Field({
  label, name, error, required, type = "text", textarea,
}: { label: string; name: string; error?: string; required?: boolean; type?: string; textarea?: boolean }) {
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
      {textarea ? (
        <textarea name={name} rows={3} maxLength={1000} className={cls} />
      ) : (
        <input name={name} type={type} maxLength={255} className={cls} />
      )}
    </label>
  );
}
