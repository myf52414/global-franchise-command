import { useRef, useState } from "react";
import { z } from "zod";
import {
  Eye,
  FileText,
  Loader2,
  ShieldCheck,
  ShieldX,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Btn, Card } from "./Wall";
import { Modal } from "./Modal";
import { StatusBadge } from "./StatusBadge";
import { PanelEmpty, PanelSection } from "./DetailSections";
import { Tip } from "./Tooltip";

// ---------------------------------------------------------------------------
// KYC review workflow primitives — shared by the Documents wall and the
// franchise detail panel. All state is real, persisted on the documents table
// (kyc_status / reviewer / reviewed_at / review_note / submitted_by).
// ---------------------------------------------------------------------------

export const KYC_DOC_KINDS = ["kyc_id", "kyc_address", "incorporation", "tax", "other"] as const;
export type KycDocKind = (typeof KYC_DOC_KINDS)[number];

export const KYC_DOC_KIND_LABEL: Record<KycDocKind, string> = {
  kyc_id: "Government ID",
  kyc_address: "Address Proof",
  incorporation: "Incorporation",
  tax: "Tax Certificate",
  other: "Other",
};

export const MAX_KYC_BYTES = 10 * 1024 * 1024;
export const ALLOWED_KYC_TYPES = ["application/pdf", "image/png", "image/jpeg"];

export type KycStatus = "not_submitted" | "submitted" | "under_review" | "approved" | "rejected";
export type KycReviewAction = "under_review" | "approved" | "rejected";

export type KycReviewableDoc = {
  id: string;
  name: string;
  kind: string;
  size: number;
  category: "kyc" | "compliance";
  franchise: string | null;
  targetLabel: string;
  uploadedAt: string;
  kycStatus: string;
  reviewer?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  submittedBy?: string | null;
  local?: boolean;
};

/** Roll a franchise's KYC documents up to a single workflow state. */
export function deriveKycStatus(docs: { kycStatus: string }[]): KycStatus {
  if (docs.length === 0) return "not_submitted";
  if (docs.some((d) => d.kycStatus === "rejected")) return "rejected";
  if (docs.some((d) => d.kycStatus === "under_review")) return "under_review";
  if (docs.some((d) => d.kycStatus === "submitted")) return "submitted";
  return "approved";
}

const KYC_BADGE: Record<KycStatus, { status: string; label: string }> = {
  not_submitted: { status: "cancelled", label: "Not submitted" },
  submitted: { status: "submitted", label: "Submitted" },
  under_review: { status: "reviewer_assigned", label: "Under review" },
  approved: { status: "approved", label: "Approved" },
  rejected: { status: "rejected", label: "Rejected" },
};

export function KycStatusBadge({ value }: { value: KycStatus }) {
  const b = KYC_BADGE[value];
  return <StatusBadge status={b.status}>{b.label}</StatusBadge>;
}

export function toKycStatus(raw: string): KycStatus {
  return (KYC_BADGE[raw as KycStatus] ? raw : "submitted") as KycStatus;
}

const fmtSize = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

// ---------------------------------------------------------------------------
// Submit dialog
// ---------------------------------------------------------------------------

type SubmitDoc = { file: File; kind: KycDocKind };

const kycSubmitSchema = z.object({
  franchiseId: z.string().min(1, "Select a franchise"),
  docs: z
    .array(
      z.object({
        name: z.string().min(1).max(160),
        size: z.number().int().positive().max(MAX_KYC_BYTES, "Each file must be 10 MB or smaller"),
        type: z.string().refine((t) => ALLOWED_KYC_TYPES.includes(t), "Only PDF, PNG or JPEG files"),
        kind: z.enum(KYC_DOC_KINDS),
      }),
    )
    .min(1, "Upload at least one KYC document"),
});

export function KycSubmitDialog({
  open,
  onClose,
  franchises,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  franchises: Array<{ id: string; company: string }>;
  onSubmit: (payload: {
    franchiseId: string;
    franchise: string;
    docs: Array<{ name: string; size: number; type: string; kind: KycDocKind }>;
  }) => Promise<void>;
}) {
  const [docs, setDocs] = useState<SubmitDoc[]>([]);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setDocs([]);
    setErrors({});
    setBusy(false);
  };

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const next: SubmitDoc[] = [];
    let rejected: string | undefined;
    for (const f of Array.from(files)) {
      if (!ALLOWED_KYC_TYPES.includes(f.type)) {
        rejected = `${f.name}: only PDF, PNG or JPEG files are accepted`;
        continue;
      }
      if (f.size > MAX_KYC_BYTES) {
        rejected = `${f.name}: file is larger than 10 MB`;
        continue;
      }
      next.push({ file: f, kind: "kyc_id" });
    }
    setDocs((cur) => [...cur, ...next]);
    if (next.length) rejected = undefined;
    setErrors((e) => ({ ...e, docs: rejected }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = kycSubmitSchema.safeParse({
      franchiseId: fd.get("franchiseId"),
      docs: docs.map((d) => ({ name: d.file.name, size: d.file.size, type: d.file.type, kind: d.kind })),
    });
    if (!parsed.success) {
      const map: Record<string, string | undefined> = {};
      for (const issue of parsed.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    const franchise = franchises.find((f) => f.id === parsed.data.franchiseId);
    if (!franchise) {
      setErrors({ franchiseId: "Select a franchise" });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await onSubmit({
        franchiseId: parsed.data.franchiseId,
        franchise: franchise.company,
        docs: parsed.data.docs,
      });
      reset();
      onClose();
    } catch {
      setErrors({ form: "Submission failed — the backend rejected the request. Try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Submit KYC documents"
      description="Files go straight into the review queue against the selected franchise. Every submission is recorded in the audit trail."
      icon={<ShieldCheck className="h-4 w-4" />}
      footer={
        <>
          <Btn
            variant="ghost"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={busy}
          >
            Cancel
          </Btn>
          <Btn variant="primary" type="submit" form="kyc-submit-form" disabled={busy}>
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {busy ? "Submitting…" : "Submit for review"}
          </Btn>
        </>
      }
    >
      <form id="kyc-submit-form" onSubmit={submit} className="space-y-4">
        <div>
          <label
            htmlFor="kyc-franchise"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Franchise <span className="text-destructive">*</span>
          </label>
          <select
            id="kyc-franchise"
            name="franchiseId"
            defaultValue=""
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
            aria-invalid={!!errors.franchiseId}
          >
            <option value="" disabled>
              Select a franchise…
            </option>
            {franchises.map((f) => (
              <option key={f.id} value={f.id}>
                {f.company}
              </option>
            ))}
          </select>
          {errors.franchiseId && <p className="mt-1 text-[11.5px] text-destructive">{errors.franchiseId}</p>}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Documents <span className="text-destructive">*</span>
            </span>
            <span className="text-[11px] text-muted-foreground">PDF / PNG / JPEG · max 10 MB each</span>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid w-full place-items-center gap-1.5 rounded-md border border-dashed border-border-strong bg-surface-2/60 px-4 py-6 text-center transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
          >
            <UploadCloud className="h-5 w-5 text-muted-foreground" />
            <span className="text-[12.5px] font-medium text-foreground">Add files</span>
            <span className="text-[11px] text-muted-foreground">
              Government ID, address proof, incorporation, tax certificate…
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            className="sr-only"
            aria-label="Upload KYC documents"
            onChange={(e) => addFiles(e.target.files)}
          />
          {errors.docs && <p className="mt-1 text-[11.5px] text-destructive">{errors.docs}</p>}

          {docs.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {docs.map((d, i) => (
                <li
                  key={`${d.file.name}-${i}`}
                  className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">{d.file.name}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{fmtSize(d.file.size)}</span>
                  <select
                    value={d.kind}
                    onChange={(e) =>
                      setDocs((cur) => cur.map((x, j) => (j === i ? { ...x, kind: e.target.value as KycDocKind } : x)))
                    }
                    aria-label={`Document type for ${d.file.name}`}
                    className="shrink-0 rounded border border-border bg-surface px-1.5 py-1 text-[11.5px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
                  >
                    {KYC_DOC_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {KYC_DOC_KIND_LABEL[k]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setDocs((cur) => cur.filter((_, j) => j !== i))}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted-foreground hover:bg-surface hover:text-destructive"
                    aria-label={`Remove ${d.file.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {errors.form && (
          <Card className="border-[color:color-mix(in_oklab,var(--destructive)_30%,transparent)]">
            <p className="text-[11.5px] text-destructive">{errors.form}</p>
          </Card>
        )}
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Review dialog
// ---------------------------------------------------------------------------

export function KycReviewDialog({
  doc,
  onClose,
  onDecide,
}: {
  doc: KycReviewableDoc | null;
  onClose: () => void;
  onDecide: (action: KycReviewAction, note: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<KycReviewAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decide = async (action: KycReviewAction) => {
    setBusy(action);
    setError(null);
    try {
      await onDecide(action, note.trim());
      setNote("");
      onClose();
    } catch {
      setError("The decision could not be saved. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const decidable = !!doc && !doc.local && doc.kycStatus !== "approved" && doc.kycStatus !== "rejected";

  return (
    <Modal
      open={!!doc}
      onClose={() => {
        setNote("");
        onClose();
      }}
      title="Review KYC document"
      description={doc?.franchise ? `${doc.franchise} · ${doc.targetLabel || "Franchise record"}` : undefined}
      icon={<Eye className="h-4 w-4" />}
      size="md"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Btn variant="ghost" onClick={() => { setNote(""); onClose(); }}>
            Close
          </Btn>
          {decidable && doc?.kycStatus === "submitted" && (
            <Btn variant="outline" disabled={!!busy} onClick={() => decide("under_review")}>
              {busy === "under_review" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Start review
            </Btn>
          )}
          {decidable && (
            <>
              <Btn variant="destructive" disabled={!!busy} onClick={() => decide("rejected")}>
                {busy === "rejected" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <ShieldX className="h-3.5 w-3.5" /> Reject
              </Btn>
              <Btn variant="primary" disabled={!!busy} onClick={() => decide("approved")}>
                {busy === "approved" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <ShieldCheck className="h-3.5 w-3.5" /> Approve
              </Btn>
            </>
          )}
        </div>
      }
    >
      {doc && (
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-surface-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate text-[13px] font-medium text-foreground">{doc.name}</span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11.5px]">
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="text-foreground">{KYC_DOC_KIND_LABEL[doc.kind as KycDocKind] ?? doc.kind}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Size</dt>
                <dd className="text-foreground">{fmtSize(doc.size)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Submitted</dt>
                <dd className="text-foreground">{doc.uploadedAt}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Submitted by</dt>
                <dd className="text-foreground">{doc.submittedBy ?? "—"}</dd>
              </div>
              {doc.reviewer && (
                <>
                  <div>
                    <dt className="text-muted-foreground">Reviewed by</dt>
                    <dd className="text-foreground">{doc.reviewer}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Reviewed at</dt>
                    <dd className="text-foreground">{doc.reviewedAt ?? "—"}</dd>
                  </div>
                </>
              )}
            </dl>
            {doc.reviewNote && (
              <p className="mt-2 border-t border-border pt-2 text-[11.5px] text-muted-foreground">
                Previous note: {doc.reviewNote}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <KycStatusBadge value={toKycStatus(doc.kycStatus)} />
            {doc.local && <span className="text-[11px] text-muted-foreground">Session record — decisions apply to saved documents</span>}
          </div>

          <div>
            <label
              htmlFor="kyc-review-note"
              className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Review note
            </label>
            <textarea
              id="kyc-review-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Why is this being approved or rejected? Recorded in the audit trail."
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
            />
          </div>

          {error && <p className="text-[11.5px] text-destructive">{error}</p>}
        </div>
      )}
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Franchise-panel section
// ---------------------------------------------------------------------------

export function KycFranchiseSection({
  docs,
  loading,
  canReview,
  canSubmit,
  onReview,
  onSubmitKyc,
}: {
  docs: KycReviewableDoc[];
  loading?: boolean;
  canReview: boolean;
  canSubmit: boolean;
  onReview: (doc: KycReviewableDoc) => void;
  onSubmitKyc: () => void;
}) {
  const status = deriveKycStatus(docs);
  const pending = docs.filter((d) => !d.local && (d.kycStatus === "submitted" || d.kycStatus === "under_review"));

  return (
    <PanelSection
      title="KYC Verification"
      icon={<ShieldCheck className="h-3.5 w-3.5" />}
      actions={
        <Tip label="Rolled up from this franchise's KYC documents in the review workflow">
          <span tabIndex={0} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]">
            <KycStatusBadge value={status} />
          </span>
        </Tip>
      }
    >
      {loading ? (
        <div className="space-y-2" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-md bg-surface-2" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <PanelEmpty
          icon={<FileText className="h-4 w-4" />}
          title="No KYC documents on file"
          description="Submit government ID, address proof and incorporation papers to start the verification workflow."
          action={
            <Btn variant="outline" disabled={!canSubmit} onClick={onSubmitKyc}>
              <UploadCloud className="h-3.5 w-3.5" /> Submit KYC
            </Btn>
          }
        />
      ) : (
        <>
          <ul className="space-y-1.5">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2">
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium text-foreground">{d.name}</div>
                  <div className="truncate text-[10.5px] text-muted-foreground">
                    {KYC_DOC_KIND_LABEL[d.kind as KycDocKind] ?? d.kind}
                    {d.reviewer ? ` · reviewed by ${d.reviewer}` : d.submittedBy ? ` · by ${d.submittedBy}` : ""}
                    {d.reviewedAt ? ` · ${d.reviewedAt}` : ""}
                  </div>
                </div>
                <KycStatusBadge value={toKycStatus(d.kycStatus)} />
                {canReview && (
                  <Tip
                    label={
                      d.local
                        ? "Session record — review it from the Documents wall"
                        : d.kycStatus === "approved" || d.kycStatus === "rejected"
                          ? "Already decided — the decision is locked in the audit trail"
                          : "Open review"
                    }
                  >
                    <Btn
                      variant="ghost"
                      disabled={d.local || d.kycStatus === "approved" || d.kycStatus === "rejected"}
                      onClick={() => onReview(d)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Review
                    </Btn>
                  </Tip>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            {pending.length > 0 ? (
              <span className="text-[11.5px] text-muted-foreground">
                {pending.length} document{pending.length === 1 ? "" : "s"} awaiting a decision
              </span>
            ) : (
              <span className="text-[11.5px] text-muted-foreground">All decisions recorded</span>
            )}
            <Btn variant="outline" disabled={!canSubmit} onClick={onSubmitKyc}>
              <UploadCloud className="h-3.5 w-3.5" /> Submit more
            </Btn>
          </div>
        </>
      )}
    </PanelSection>
  );
}
