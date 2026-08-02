import { useState } from "react";
import { CheckCircle2, Download, FileSpreadsheet, FileText, Loader2, Lock, XCircle } from "lucide-react";
import { Modal } from "./Modal";
import { Progress } from "./Progress";
import { Btn } from "./Wall";
import { exportCsv, exportXlsx, type ExportColumn } from "@/lib/export";
import { useToast } from "@/lib/toast";
import { useCan } from "@/lib/session";
import type { Permission } from "@/lib/franchise-domain";

type Format = "csv" | "xlsx";
type Scope = "all" | "filtered" | "selected";
type Phase = "config" | "running" | "done" | "failed" | "empty";

/**
 * Full export experience: format choice, row scope, progress, success/empty/
 * failure states and toasts. RBAC-gated — a missing permission renders a
 * disabled action with an explanatory tooltip instead of a dead button.
 */
export function ExportDialog<T extends Record<string, unknown>>({
  open,
  onClose,
  filename,
  entity,
  columns,
  sheetName,
  permission,
  counts,
  resolve,
}: {
  open: boolean;
  onClose: () => void;
  filename: string;
  entity: string;
  columns?: ExportColumn<T>[];
  sheetName?: string;
  permission?: Permission;
  counts: { all: number; filtered: number; selected: number };
  resolve: (scope: Scope) => T[] | Promise<T[]>;
}) {
  const { toast } = useToast();
  const allowed = useCan(permission ?? "franchise.read");
  const gated = permission ? !allowed : false;

  const [format, setFormat] = useState<Format>("csv");
  const [scope, setScope] = useState<Scope>("filtered");
  const [phase, setPhase] = useState<Phase>("config");
  const [progress, setProgress] = useState(0);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (phase === "running") return;
    setPhase("config"); setProgress(0); setError(null);
    onClose();
  };

  const run = async () => {
    if (gated) {
      toast({ title: "Export blocked", description: `You need the "${permission}" permission.`, tone: "destructive" });
      return;
    }
    setPhase("running");
    setProgress(10);
    const timer = window.setInterval(() => setProgress((p) => Math.min(90, p + 12)), 100);
    try {
      const rows = await resolve(scope);
      window.clearInterval(timer);
      if (!rows || rows.length === 0) {
        setPhase("empty");
        toast({ title: "Nothing to export", description: "No rows match the selected scope.", tone: "warning" });
        return;
      }
      const base = filename.replace(/\.(csv|xlsx)$/i, "");
      if (format === "csv") exportCsv(`${base}.csv`, rows, columns);
      else exportXlsx(`${base}.xlsx`, rows, columns, sheetName);
      setCount(rows.length);
      setProgress(100);
      setPhase("done");
      toast({ title: "Export ready", description: `${rows.length.toLocaleString()} rows · ${format.toUpperCase()}`, tone: "success" });
    } catch (err) {
      window.clearInterval(timer);
      setError(err instanceof Error ? err.message : "Unknown error");
      setPhase("failed");
      toast({ title: "Export failed", description: "Nothing was downloaded.", tone: "destructive" });
    }
  };

  const scopes: { id: Scope; label: string; hint: string; count: number }[] = [
    { id: "selected", label: "Selected rows", hint: "Only the rows you ticked", count: counts.selected },
    { id: "filtered", label: "Current view", hint: "Matches active search & filters", count: counts.filtered },
    { id: "all", label: "All records", hint: "Ignores filters", count: counts.all },
  ];

  return (
    <Modal
      open={open}
      onClose={close}
      title={`Export ${entity}`}
      description="Choose a file format and which rows to include."
      icon={<Download className="h-4 w-4" />}
      closeOnBackdrop={phase !== "running"}
      footer={
        phase === "config" ? (
          <>
            <Btn variant="ghost" onClick={close}>Cancel</Btn>
            <Btn
              variant="primary"
              onClick={run}
              disabled={gated}
              title={gated ? `Requires the "${permission}" permission` : undefined}
            >
              {gated ? <Lock className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
              Export {format.toUpperCase()}
            </Btn>
          </>
        ) : phase === "running" ? null : (
          <>
            <Btn variant="ghost" onClick={() => setPhase("config")}>Export again</Btn>
            <Btn variant="primary" onClick={close}>Done</Btn>
          </>
        )
      }
    >
      {phase === "config" && (
        <div className="space-y-5">
          {gated && (
            <div role="alert" className="flex items-start gap-2 rounded-md border border-[color:color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color:color-mix(in_oklab,var(--destructive)_7%,transparent)] px-3 py-2.5 text-[12px] text-destructive">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>Your role cannot export {entity}. Ask an administrator for the “{permission}” permission.</span>
            </div>
          )}

          <fieldset>
            <legend className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">File format</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <FormatCard active={format === "csv"} onClick={() => setFormat("csv")} icon={<FileText className="h-4 w-4" />} title="CSV" hint="Universal, opens anywhere" />
              <FormatCard active={format === "xlsx"} onClick={() => setFormat("xlsx")} icon={<FileSpreadsheet className="h-4 w-4" />} title="Excel (.xlsx)" hint="Formatted worksheet" />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Rows to include</legend>
            <div className="space-y-1.5">
              {scopes.map((s) => (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                    scope === s.id ? "border-primary/50 bg-accent/50" : "border-border bg-surface hover:bg-surface-2"
                  } ${s.count === 0 ? "opacity-60" : ""}`}
                >
                  <input
                    type="radio"
                    name="export-scope"
                    className="h-3.5 w-3.5 accent-[color:var(--color-primary)]"
                    checked={scope === s.id}
                    disabled={s.count === 0}
                    onChange={() => setScope(s.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-medium text-foreground">{s.label}</span>
                    <span className="block text-[11.5px] text-muted-foreground">{s.hint}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-[12px] text-muted-foreground">{s.count.toLocaleString()}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {phase === "running" && (
        <div className="space-y-4 py-6">
          <div className="flex items-center gap-2 text-[13px] text-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Preparing your {format.toUpperCase()} file…
          </div>
          <Progress value={progress} label="Building export" />
        </div>
      )}

      {phase === "done" && (
        <ResultBlock tone="success" icon={<CheckCircle2 className="h-5 w-5" />} title="Export downloaded"
          text={`${count.toLocaleString()} ${entity} exported as ${format.toUpperCase()}. Check your downloads folder.`} />
      )}
      {phase === "empty" && (
        <ResultBlock tone="warning" icon={<FileText className="h-5 w-5" />} title="Nothing to export"
          text={`No ${entity} match the selected scope. Adjust your filters and try again.`} />
      )}
      {phase === "failed" && (
        <ResultBlock tone="destructive" icon={<XCircle className="h-5 w-5" />} title="Export failed" text={error ?? "Unknown error"} />
      )}
    </Modal>
  );
}

function FormatCard({ active, onClick, icon, title, hint }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] ${
        active ? "border-primary/50 bg-accent/50" : "border-border bg-surface hover:bg-surface-2"
      }`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${active ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"}`}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[12.5px] font-medium text-foreground">{title}</span>
        <span className="block text-[11.5px] text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}

function ResultBlock({ tone, icon, title, text }: { tone: "success" | "warning" | "destructive"; icon: React.ReactNode; title: string; text: string }) {
  const cls = {
    success: "bg-[color:color-mix(in_oklab,var(--color-success)_14%,transparent)] text-[color:var(--color-success)]",
    warning: "bg-[color:color-mix(in_oklab,var(--color-warning)_14%,transparent)] text-[color:var(--color-warning)]",
    destructive: "bg-[color:color-mix(in_oklab,var(--destructive)_12%,transparent)] text-destructive",
  }[tone];
  return (
    <div className="grid place-items-center gap-2 py-10 text-center">
      <span className={`grid h-11 w-11 place-items-center rounded-full ${cls}`}>{icon}</span>
      <div className="text-[14px] font-medium text-foreground">{title}</div>
      <p className="max-w-md text-[12.5px] text-muted-foreground">{text}</p>
    </div>
  );
}
