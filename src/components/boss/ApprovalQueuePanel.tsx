import { useState } from "react";
import { CheckCircle2, ShieldCheck, XCircle, Clock, ShieldAlert } from "lucide-react";
import { Btn, Card } from "./Wall";
import { RightPanel } from "./RightPanel";
import { StatusBadge } from "./StatusBadge";
import {
  APPROVAL_KIND_LABEL,
  useApprovals,
  type ApprovalRequest,
} from "@/lib/approvals";
import { useToast } from "@/lib/toast";

export function ApprovalQueueButton({
  scope,
  canApprove,
  onOpen,
}: {
  scope: string;
  canApprove: boolean;
  onOpen: () => void;
}) {
  const { requests } = useApprovals();
  const pending = requests.filter((r) => r.status === "pending" && r.scope === scope).length;
  return (
    <Btn variant="outline" onClick={onOpen} title={canApprove ? "Review approvals" : "You lack approval permission"}>
      <ShieldCheck className="h-3.5 w-3.5" />
      Approvals
      {pending > 0 && (
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

export function ApprovalQueuePanel({
  open,
  onClose,
  scope,
  canApprove,
}: {
  open: boolean;
  onClose: () => void;
  scope: string;
  canApprove: boolean;
}) {
  const { requests, approve, reject } = useApprovals();
  const { toast } = useToast();
  const [note, setNote] = useState("");
  const scoped = requests.filter((r) => r.scope === scope);
  const pending = scoped.filter((r) => r.status === "pending");
  const decided = scoped.filter((r) => r.status !== "pending").slice(0, 20);

  const act = (r: ApprovalRequest, decision: "approve" | "reject") => {
    if (!canApprove) {
      toast({ title: "Permission denied", description: "You do not have approval rights for this scope.", tone: "destructive" });
      return;
    }
    if (decision === "approve") approve(r.id, note || undefined);
    else reject(r.id, note || undefined);
    toast({
      title: decision === "approve" ? "Approved" : "Rejected",
      description: `${APPROVAL_KIND_LABEL[r.kind]} · ${r.title}`,
      tone: decision === "approve" ? "success" : "warning",
    });
    setNote("");
  };

  return (
    <RightPanel
      open={open}
      onClose={onClose}
      eyebrow="Approvals"
      title={`Approval queue · ${scope}`}
      width="max-w-2xl"
    >
      <div className="space-y-6">
        {!canApprove && (
          <Card className="bg-surface-2">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5 text-[color:var(--color-warning)]" />
              Read-only. Your role cannot approve or reject changes in this scope.
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
                <RequestCard key={r.id} r={r}>
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder="Optional decision note (recorded in audit log)…"
                      className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] text-foreground outline-none focus:border-primary"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Btn variant="destructive" disabled={!canApprove} onClick={() => act(r, "reject")}>
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Btn>
                      <Btn variant="primary" disabled={!canApprove} onClick={() => act(r, "approve")}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Apply
                      </Btn>
                    </div>
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
                <RequestCard key={r.id} r={r} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </RightPanel>
  );
}

function RequestCard({
  r,
  compact,
  children,
}: {
  r: ApprovalRequest;
  compact?: boolean;
  children?: React.ReactNode;
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
          {r.targetIds.slice(0, 8).map((t) => (
            <span key={t} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
              {t}
            </span>
          ))}
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
