import { useState } from "react";
import { CheckCircle2, ShieldCheck, XCircle, Clock, ShieldAlert, Lock, Loader2, AlertCircle } from "lucide-react";
import { Btn, Card } from "./Wall";
import { RightPanel } from "./RightPanel";
import { StatusBadge } from "./StatusBadge";
import {
  APPROVAL_KIND_LABEL,
  useApprovals,
  type ApprovalRequest,
} from "@/lib/approvals";
import { useToast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ApprovalQueueButton({
  scope,
  canView,
  canApprove,
  onOpen,
}: {
  scope: string;
  canView: boolean;
  canApprove?: boolean;
  onOpen: () => void;
}) {
  const { requests } = useApprovals();
  const pending = requests.filter((r) => r.status === "pending" && r.scope === scope).length;
  const title = !canView
    ? "You lack permission to view approvals"
    : canApprove
    ? "Review approvals"
    : "View approvals (read-only)";
  return (
    <Btn
      variant="outline"
      onClick={canView ? onOpen : undefined}
      disabled={!canView}
      aria-disabled={!canView}
      title={title}
    >
      {canView ? <ShieldCheck className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
      Approvals
      {canView && pending > 0 && (
        <span
          className="ml-1 rounded-full px-1.5 py-[1px] text-[10.5px] font-semibold text-primary-foreground"
          style={{ background: "var(--color-primary)" }}
        >
          {pending}
        </span>
      )}
    </Btn>
  );
}

type Pending = { r: ApprovalRequest; decision: "approve" | "reject" } | null;

export function ApprovalQueuePanel({
  open,
  onClose,
  scope,
  canView,
  canApprove,
  onOpenTarget,
}: {
  open: boolean;
  onClose: () => void;
  scope: string;
  canView: boolean;
  canApprove: boolean;
  onOpenTarget?: (targetId: string) => void;
}) {
  const { requests, approve, reject } = useApprovals();
  const { toast } = useToast();
  const [pendingDecision, setPendingDecision] = useState<Pending>(null);

  const scoped = canView ? requests.filter((r) => r.scope === scope) : [];
  const pending = scoped.filter((r) => r.status === "pending");
  const decided = scoped.filter((r) => r.status !== "pending").slice(0, 20);

  const finalizeDecision = async (note: string) => {
    if (!pendingDecision) return;
    const { r, decision } = pendingDecision;
    // Simulate server round-trip; replace with createServerFn call.
    await new Promise((res) => setTimeout(res, 600));
    if (decision === "approve") approve(r.id, note);
    else reject(r.id, note);
    toast({
      title: decision === "approve" ? "Approved" : "Rejected",
      description: `${APPROVAL_KIND_LABEL[r.kind]} · ${r.title}`,
      tone: decision === "approve" ? "success" : "warning",
    });
  };

  return (
    <>
      <RightPanel
        open={open}
        onClose={onClose}
        eyebrow="Approvals"
        title={`Approval queue · ${scope}`}
        width="max-w-2xl"
      >
        <div className="space-y-6">
          {!canView ? (
            <Card className="bg-surface-2">
              <div className="flex items-start gap-2 text-[12.5px] text-foreground">
                <Lock className="mt-0.5 h-4 w-4 text-[color:var(--color-warning)]" />
                <div>
                  <div className="font-medium">Access restricted</div>
                  <div className="text-[12px] text-muted-foreground">
                    Your role does not include permission to view the {scope} approvals queue.
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <>
              {!canApprove && (
                <Card className="bg-surface-2">
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <ShieldAlert className="h-3.5 w-3.5 text-[color:var(--color-warning)]" />
                    Read-only. Your role can view but not approve or reject changes in this scope.
                  </div>
                </Card>
              )}

              {pending.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Pending · {pending.length}
                  </div>
                  <div className="space-y-3">
                    {pending.map((r) => (
                      <RequestCard key={r.id} r={r} onOpenTarget={onOpenTarget}>
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <Btn
                            variant="destructive"
                            disabled={!canApprove}
                            onClick={() => setPendingDecision({ r, decision: "reject" })}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Btn>
                          <Btn
                            variant="primary"
                            disabled={!canApprove}
                            onClick={() => setPendingDecision({ r, decision: "approve" })}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Apply
                          </Btn>
                        </div>
                      </RequestCard>
                    ))}
                  </div>
                </div>
              )}

              {pending.length === 0 && (
                <Card>
                  <div className="rounded-md border border-dashed border-border px-3 py-8 text-center text-[12.5px] text-muted-foreground">
                    No approvals waiting. Submitted changes will queue here for reviewers with the correct permission.
                  </div>
                </Card>
              )}

              {decided.length > 0 && (
                <div>
                  <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Recent decisions</div>
                  <div className="space-y-2">
                    {decided.map((r) => (
                      <RequestCard key={r.id} r={r} compact onOpenTarget={onOpenTarget} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </RightPanel>

      <DecisionDialog
        pending={pendingDecision}
        onClose={() => setPendingDecision(null)}
        onConfirm={finalizeDecision}
      />
    </>
  );
}

function RequestCard({
  r,
  compact,
  children,
  onOpenTarget,
}: {
  r: ApprovalRequest;
  compact?: boolean;
  children?: React.ReactNode;
  onOpenTarget?: (targetId: string) => void;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <StatusBadge status={r.status === "pending" ? "pending" : r.status} />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {APPROVAL_KIND_LABEL[r.kind]}
            </span>
          </div>
          <div className="mt-1 text-[13px] font-medium text-foreground">{r.title}</div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">{r.summary}</div>
        </div>
        <div className="text-right text-[11px] text-muted-foreground">
          <div>by {r.requestedBy}</div>
          <div className="font-mono">{r.requestedAt}</div>
        </div>
      </div>
      {r.targetIds.length > 0 && !compact && (
        <div className="mt-2 flex flex-wrap gap-1">
          {r.targetIds.slice(0, 8).map((t) =>
            onOpenTarget ? (
              <button
                key={t}
                type="button"
                onClick={() => onOpenTarget(t)}
                className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                title="Open record"
              >
                {t}
              </button>
            ) : (
              <span key={t} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                {t}
              </span>
            ),
          )}
          {r.targetIds.length > 8 && (
            <span className="text-[10.5px] text-muted-foreground">+{r.targetIds.length - 8} more</span>
          )}
        </div>
      )}
      {r.status !== "pending" && (
        <div className="mt-2 text-[11.5px] text-muted-foreground">
          {r.status === "approved" ? "Approved" : "Rejected"} by <span className="text-foreground">{r.decidedBy}</span> · {r.decidedAt}
          {r.note && <> · "{r.note}"</>}
        </div>
      )}
      {children}
    </Card>
  );
}

function DecisionDialog({
  pending,
  onClose,
  onConfirm,
}: {
  pending: Pending;
  onClose: () => void;
  onConfirm: (note: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = !!pending;
  const decision = pending?.decision;
  const trimmed = note.trim();
  const noteInvalid = trimmed.length < 4;

  const reset = () => {
    setNote("");
    setError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const confirm = async () => {
    if (!pending || noteInvalid) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(trimmed);
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px]">
            {decision === "approve" ? (
              <CheckCircle2 className="h-4 w-4 text-[color:var(--color-success)]" />
            ) : (
              <XCircle className="h-4 w-4 text-[color:var(--color-destructive)]" />
            )}
            {decision === "approve" ? "Approve change" : "Reject change"}
          </DialogTitle>
          <DialogDescription className="text-[12.5px]">
            {pending && (
              <>
                {APPROVAL_KIND_LABEL[pending.r.kind]} · <span className="text-foreground">{pending.r.title}</span>
                <div className="mt-1 text-muted-foreground">{pending.r.summary}</div>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-[11.5px] font-medium text-foreground">
            Decision note <span className="text-destructive">*</span>
            <span className="ml-1 text-[11px] font-normal text-muted-foreground">
              (recorded in audit log · min 4 chars)
            </span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            disabled={submitting}
            placeholder={
              decision === "approve"
                ? "Reason for approval, verification steps, references…"
                : "Reason for rejection, missing info, required follow-up…"
            }
            className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] text-foreground outline-none focus:border-primary disabled:opacity-60"
          />
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-2 text-[12px] text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Btn variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Btn>
          <Btn
            variant={decision === "approve" ? "primary" : "destructive"}
            onClick={confirm}
            disabled={submitting || noteInvalid}
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting…
              </>
            ) : decision === "approve" ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Confirm approval
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" /> Confirm rejection
              </>
            )}
          </Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
