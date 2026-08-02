import { useCallback, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  CloudOff,
  FileSpreadsheet,
  FileUp,
  Loader2,
  RotateCcw,
  TriangleAlert,
  Upload,
  XCircle,
} from "lucide-react";
import { Modal } from "./Modal";
import { Progress } from "./Progress";
import { Btn } from "./Wall";
import { useToast } from "@/lib/toast";

export type ImportField = { key: string; label: string; required?: boolean };
export type ParsedRow = { line: number; values: Record<string, string>; errors: string[] };

const MAX_BYTES = 5 * 1024 * 1024;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === ",") { row.push(cell); cell = ""; continue; }
    if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; continue; }
    if (c === "\r") continue;
    cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

type Step = "select" | "preview" | "importing" | "done" | "failed";

/**
 * Enterprise CSV import: file picker + drag & drop, header mapping check,
 * per-row validation, preview table, progress, success and error states.
 * When no backend is connected the commit step is disabled with a tooltip
 * rather than presenting a dead button.
 */
export function ImportDialog({
  open,
  onClose,
  title = "Import CSV",
  entity,
  fields,
  backendReady = false,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  entity: string;
  fields: ImportField[];
  backendReady?: boolean;
  onImport?: (rows: Record<string, string>[]) => Promise<void>;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("select");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [failure, setFailure] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep("select"); setFile(null); setRows([]); setHeaders([]);
    setFileError(null); setProgress(0); setFailure(null);
  }, []);

  const close = () => { if (step !== "importing") { reset(); onClose(); } };

  const validRows = useMemo(() => rows.filter((r) => r.errors.length === 0), [rows]);
  const invalidRows = useMemo(() => rows.filter((r) => r.errors.length > 0), [rows]);

  const handleFile = async (f: File) => {
    setFileError(null);
    if (!/\.csv$/i.test(f.name) && f.type !== "text/csv") {
      setFileError("Unsupported file type. Upload a .csv file exported from this panel.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setFileError("File is larger than 5 MB. Split the export into smaller batches.");
      return;
    }
    const text = await f.text();
    const grid = parseCsv(text);
    if (grid.length < 2) {
      setFileError("The file has no data rows. Include a header row plus at least one record.");
      return;
    }
    const head = grid[0].map((h) => h.trim());
    const missing = fields.filter((c) => c.required && !head.some((h) => h.toLowerCase() === c.label.toLowerCase() || h.toLowerCase() === c.key.toLowerCase()));
    if (missing.length) {
      setFileError(`Missing required column${missing.length > 1 ? "s" : ""}: ${missing.map((m) => m.label).join(", ")}`);
      return;
    }
    const index = (f2: ImportField) =>
      head.findIndex((h) => h.toLowerCase() === f2.label.toLowerCase() || h.toLowerCase() === f2.key.toLowerCase());

    const parsed: ParsedRow[] = grid.slice(1).map((r, i) => {
      const values: Record<string, string> = {};
      const errors: string[] = [];
      for (const fl of fields) {
        const idx = index(fl);
        const v = (idx >= 0 ? r[idx] ?? "" : "").trim();
        values[fl.key] = v;
        if (fl.required && !v) errors.push(`${fl.label} is required`);
      }
      return { line: i + 2, values, errors };
    });

    setFile(f);
    setHeaders(head);
    setRows(parsed);
    setStep("preview");
  };

  const commit = async () => {
    setStep("importing");
    setProgress(8);
    const timer = window.setInterval(() => setProgress((p) => Math.min(92, p + 7)), 120);
    try {
      await onImport?.(validRows.map((r) => r.values));
      window.clearInterval(timer);
      setProgress(100);
      setStep("done");
      toast({
        title: "Import complete",
        description: `${validRows.length.toLocaleString()} ${entity} imported${invalidRows.length ? `, ${invalidRows.length} skipped` : ""}.`,
        tone: "success",
      });
    } catch (err) {
      window.clearInterval(timer);
      setFailure(err instanceof Error ? err.message : "The import could not be completed.");
      setStep("failed");
      toast({ title: "Import failed", description: "No records were changed.", tone: "destructive" });
    }
  };

  const previewCols = fields.slice(0, 5);

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      description={`Bulk-create ${entity} from a CSV file. Rows are validated before anything is written.`}
      icon={<Upload className="h-4 w-4" />}
      size="lg"
      closeOnBackdrop={step !== "importing"}
      footer={
        step === "preview" ? (
          <>
            <span className="mr-auto text-[11.5px] text-muted-foreground">
              {validRows.length} valid · {invalidRows.length} with errors
            </span>
            <Btn variant="ghost" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" /> Choose another file
            </Btn>
            <Btn
              variant="primary"
              onClick={commit}
              disabled={validRows.length === 0 || !backendReady}
              title={
                !backendReady
                  ? "Importing writes records to the database. Connect the backend to enable this action."
                  : validRows.length === 0
                    ? "No valid rows to import"
                    : undefined
              }
            >
              <FileUp className="h-3.5 w-3.5" />
              Import {validRows.length} {entity}
            </Btn>
          </>
        ) : step === "done" || step === "failed" ? (
          <>
            <Btn variant="ghost" onClick={reset}>Import another file</Btn>
            <Btn variant="primary" onClick={close}>Done</Btn>
          </>
        ) : step === "select" ? (
          <Btn variant="ghost" onClick={close}>Cancel</Btn>
        ) : null
      }
    >
      {step === "select" && (
        <div className="space-y-4">
          {!backendReady && (
            <div className="flex items-start gap-2.5 rounded-md border border-[color:color-mix(in_oklab,var(--color-warning)_35%,transparent)] bg-[color:color-mix(in_oklab,var(--color-warning)_10%,transparent)] px-3 py-2.5 text-[12px] text-foreground">
              <CloudOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-warning)]" />
              <span>
                Backend not connected — you can validate and preview the file, but the final import
                step stays disabled until the database is available.
              </span>
            </div>
          )}
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f); }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface-2 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-accent/40 focus-within:ring-2 focus-within:ring-[color:var(--color-ring)]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" />
            </span>
            <span className="text-[13px] font-medium text-foreground">Drop a CSV file or browse</span>
            <span className="max-w-md text-[12px] text-muted-foreground">
              Max 5 MB. Required columns: {fields.filter((f) => f.required).map((f) => f.label).join(", ") || "none"}.
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              aria-label={`Choose a CSV file of ${entity}`}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }}
            />
          </label>

          {fileError && (
            <div role="alert" className="flex items-start gap-2 rounded-md border border-[color:color-mix(in_oklab,var(--destructive)_35%,transparent)] bg-[color:color-mix(in_oklab,var(--destructive)_8%,transparent)] px-3 py-2.5 text-[12px] text-destructive">
              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          <div className="rounded-md border border-border bg-surface-2 px-3 py-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Expected columns</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {fields.map((f) => (
                <span key={f.key} className="rounded-md border border-border bg-surface px-2 py-1 text-[11.5px] text-foreground">
                  {f.label}
                  {f.required && <span className="ml-1 text-destructive" aria-hidden="true">*</span>}
                  {f.required && <span className="sr-only"> (required)</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-[12px]">
            <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate font-medium text-foreground">{file?.name}</span>
            <span className="text-muted-foreground">· {rows.length} rows · {headers.length} columns</span>
            <span className="ml-auto flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-[color:color-mix(in_oklab,var(--color-success)_30%,transparent)] bg-[color:color-mix(in_oklab,var(--color-success)_12%,transparent)] px-2 py-0.5 text-[11.5px] text-[color:var(--color-success)]">
                <CheckCircle2 className="h-3 w-3" /> {validRows.length} valid
              </span>
              {invalidRows.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md border border-[color:color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color:color-mix(in_oklab,var(--destructive)_8%,transparent)] px-2 py-0.5 text-[11.5px] text-destructive">
                  <TriangleAlert className="h-3 w-3" /> {invalidRows.length} to skip
                </span>
              )}
            </span>
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-left text-[12px]">
              <caption className="sr-only">Import preview for {entity}</caption>
              <thead className="bg-surface-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="w-14 px-3 py-2 font-medium">Row</th>
                  {previewCols.map((c) => (
                    <th scope="col" key={c.key} className="whitespace-nowrap px-3 py-2 font-medium">{c.label}</th>
                  ))}
                  <th scope="col" className="px-3 py-2 font-medium">Validation</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r) => (
                  <tr key={r.line} className={`border-t border-border ${r.errors.length ? "bg-[color:color-mix(in_oklab,var(--destructive)_5%,transparent)]" : ""}`}>
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">{r.line}</td>
                    {previewCols.map((c) => (
                      <td key={c.key} className="max-w-[12rem] truncate px-3 py-2 text-foreground">{r.values[c.key] || "—"}</td>
                    ))}
                    <td className="px-3 py-2">
                      {r.errors.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[color:var(--color-success)]">
                          <CheckCircle2 className="h-3 w-3" /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <XCircle className="h-3 w-3" /> {r.errors.join("; ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 50 && (
            <p className="text-[11.5px] text-muted-foreground">Showing first 50 of {rows.length} rows. All rows are validated.</p>
          )}
        </div>
      )}

      {step === "importing" && (
        <div className="space-y-4 py-6">
          <div className="flex items-center gap-2 text-[13px] text-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Importing {validRows.length.toLocaleString()} {entity}…
          </div>
          <Progress value={progress} label="Writing records" />
          <p className="text-[12px] text-muted-foreground">Keep this dialog open until the import finishes.</p>
        </div>
      )}

      {step === "done" && (
        <div className="grid place-items-center gap-2 py-10 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:color-mix(in_oklab,var(--color-success)_14%,transparent)] text-[color:var(--color-success)]">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div className="text-[14px] font-medium text-foreground">Import complete</div>
          <p className="max-w-md text-[12.5px] text-muted-foreground">
            {validRows.length.toLocaleString()} {entity} imported
            {invalidRows.length > 0 && ` · ${invalidRows.length} rows skipped due to validation errors`}.
          </p>
        </div>
      )}

      {step === "failed" && (
        <div className="grid place-items-center gap-2 py-10 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:color-mix(in_oklab,var(--destructive)_12%,transparent)] text-destructive">
            <XCircle className="h-5 w-5" />
          </span>
          <div className="text-[14px] font-medium text-foreground">Import failed</div>
          <p className="max-w-md text-[12.5px] text-muted-foreground">{failure}</p>
        </div>
      )}
    </Modal>
  );
}
