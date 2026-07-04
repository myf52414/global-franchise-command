import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuditEntry } from "./data-hooks";
import { useSession } from "./session";

// In-memory approval + document workflow. Wire submit/approve/reject and
// registerDocuments to createServerFn once the backend is enabled — the
// shape stays identical.

export type ApprovalKind = "license.renew" | "commission.bulk_edit";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ApprovalRequest = {
  id: string;
  kind: ApprovalKind;
  scope: string; // "license" | "commission"
  targetIds: string[];
  title: string;
  summary: string;
  payload: Record<string, unknown>;
  requestedBy: string;
  requestedAt: string;
  status: ApprovalStatus;
  decidedBy?: string;
  decidedAt?: string;
  note?: string;
};

export type LocalAuditEntry = AuditEntry & { scope: string; targetId?: string };

export type StoredDocument = {
  id: string;
  name: string;
  size: number;
  type: string;
  kind: string;
  category: "kyc" | "compliance";
  scope: string;
  targetId: string;
  targetLabel: string;
  franchise?: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "attached" | "pending_review" | "verified";
};

type RegisterDocsInput = {
  scope: string;
  targetId: string;
  targetLabel: string;
  franchise?: string;
  status?: StoredDocument["status"];
  action: string; // audit action verb, e.g. "attached KYC + compliance docs on license create"
  docs: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    kind: string;
    category: "kyc" | "compliance";
  }>;
};

type Ctx = {
  requests: ApprovalRequest[];
  audit: LocalAuditEntry[];
  documents: StoredDocument[];
  submit: (r: Omit<ApprovalRequest, "id" | "requestedBy" | "requestedAt" | "status">) => ApprovalRequest;
  approve: (id: string, note?: string) => void;
  reject: (id: string, note?: string) => void;
  registerDocuments: (input: RegisterDocsInput) => StoredDocument[];
};

const ApprovalsCtx = createContext<Ctx | null>(null);

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const nowIso = () => new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

const KIND_LABEL: Record<ApprovalKind, string> = {
  "license.renew": "License renewal",
  "commission.bulk_edit": "Commission bulk edit",
};

export function ApprovalsProvider({ children }: { children: ReactNode }) {
  const { name } = useSession();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [audit, setAudit] = useState<LocalAuditEntry[]>([]);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);

  const appendAudit = useCallback(
    (entries: LocalAuditEntry[]) => setAudit((cur) => [...entries, ...cur]),
    [],
  );

  const submit: Ctx["submit"] = useCallback(
    (r) => {
      const req: ApprovalRequest = {
        ...r,
        id: uid(),
        requestedBy: name,
        requestedAt: nowIso(),
        status: "pending",
      };
      setRequests((cur) => [req, ...cur]);
      appendAudit(
        req.targetIds.length
          ? req.targetIds.map((t) => ({
              id: uid(),
              at: req.requestedAt,
              actor: name,
              action: `requested ${KIND_LABEL[req.kind]}`,
              target: t,
              meta: req.summary,
              scope: req.scope,
              targetId: t,
            }))
          : [{
              id: uid(),
              at: req.requestedAt,
              actor: name,
              action: `requested ${KIND_LABEL[req.kind]}`,
              target: req.title,
              meta: req.summary,
              scope: req.scope,
            }],
      );
      return req;
    },
    [name, appendAudit],
  );

  const decide = useCallback(
    (id: string, status: "approved" | "rejected", note?: string) => {
      setRequests((cur) => {
        const req = cur.find((r) => r.id === id);
        if (!req || req.status !== "pending") return cur;
        const decidedAt = nowIso();
        const updated: ApprovalRequest = {
          ...req,
          status,
          decidedBy: name,
          decidedAt,
          note,
        };
        appendAudit(
          (req.targetIds.length ? req.targetIds : [req.title]).map((t) => ({
            id: uid(),
            at: decidedAt,
            actor: name,
            action: `${status} ${KIND_LABEL[req.kind]}`,
            target: t,
            meta: note,
            scope: req.scope,
            targetId: req.targetIds.length ? t : undefined,
          })),
        );
        // On approval of a license renewal, promote its attached docs from
        // pending_review → verified so the Documents wall reflects the change.
        if (status === "approved" && req.kind === "license.renew") {
          setDocuments((cur) =>
            cur.map((d) =>
              req.targetIds.includes(d.targetId) && d.status === "pending_review"
                ? { ...d, status: "verified" }
                : d,
            ),
          );
        }
        return cur.map((r) => (r.id === id ? updated : r));
      });
    },
    [name, appendAudit],
  );

  const registerDocuments: Ctx["registerDocuments"] = useCallback(
    ({ scope, targetId, targetLabel, franchise, status = "attached", action, docs }) => {
      if (docs.length === 0) return [];
      const at = nowIso();
      const stored: StoredDocument[] = docs.map((d) => ({
        ...d,
        scope,
        targetId,
        targetLabel,
        franchise,
        uploadedBy: name,
        uploadedAt: at,
        status,
      }));
      setDocuments((cur) => [...stored, ...cur]);
      appendAudit([
        {
          id: uid(),
          at,
          actor: name,
          action,
          target: targetId,
          meta: `${docs.length} document${docs.length === 1 ? "" : "s"}: ${docs.map((d) => d.name).join(", ")}`,
          scope,
          targetId,
        },
      ]);
      return stored;
    },
    [name, appendAudit],
  );

  const value = useMemo<Ctx>(
    () => ({
      requests,
      audit,
      documents,
      submit,
      approve: (id, note) => decide(id, "approved", note),
      reject: (id, note) => decide(id, "rejected", note),
      registerDocuments,
    }),
    [requests, audit, documents, submit, decide, registerDocuments],
  );

  return <ApprovalsCtx.Provider value={value}>{children}</ApprovalsCtx.Provider>;
}

export function useApprovals() {
  const ctx = useContext(ApprovalsCtx);
  if (!ctx) throw new Error("useApprovals must be inside <ApprovalsProvider>");
  return ctx;
}

export function usePendingApprovals(scope?: string) {
  const { requests } = useApprovals();
  return useMemo(
    () =>
      requests.filter(
        (r) => r.status === "pending" && (!scope || r.scope === scope),
      ),
    [requests, scope],
  );
}

export function useLocalAudit(scope: string, targetId?: string): AuditEntry[] {
  const { audit } = useApprovals();
  return useMemo(
    () =>
      audit
        .filter((a) => a.scope === scope && (!targetId || a.targetId === targetId))
        .map(({ scope: _s, targetId: _t, ...e }) => e),
    [audit, scope, targetId],
  );
}

export function useMergedAudit(
  serverEntries: AuditEntry[],
  scope: string,
  targetId?: string,
): AuditEntry[] {
  const local = useLocalAudit(scope, targetId);
  return useMemo(() => [...local, ...serverEntries], [local, serverEntries]);
}

export function useDocuments(filter?: { scope?: string; targetId?: string; category?: StoredDocument["category"] }) {
  const { documents } = useApprovals();
  return useMemo(() => {
    if (!filter) return documents;
    return documents.filter(
      (d) =>
        (!filter.scope || d.scope === filter.scope) &&
        (!filter.targetId || d.targetId === filter.targetId) &&
        (!filter.category || d.category === filter.category),
    );
  }, [documents, filter]);
}

export const APPROVAL_KIND_LABEL = KIND_LABEL;
