import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { EnterpriseTable, type Column } from "@/components/boss/EnterpriseTable";
import { Toolbar } from "@/components/boss/Toolbar";
import { StatusBadge } from "@/components/boss/StatusBadge";
import { ExportMenu } from "@/components/boss/ExportMenu";
import { useDocuments, type StoredDocument } from "@/lib/approvals";
import { useDocumentRecords } from "@/lib/data-hooks";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Documents · Boss Panel" }] }),
  component: DocumentsWall,
});

const CATEGORIES = ["all", "kyc", "compliance"] as const;

function DocumentsWall() {
  const local = useDocuments();
  const { data: stored = [] } = useDocumentRecords();
  const documents = useMemo<StoredDocument[]>(() => {
    const fromDb: StoredDocument[] = stored.map((d) => ({
      id: d.id,
      name: d.name,
      size: d.size,
      type: "application/pdf",
      kind: d.kind,
      category: d.category,
      scope: d.scope,
      targetId: d.targetId,
      targetLabel: d.targetLabel,
      franchise: d.franchise ?? undefined,
      uploadedBy: "—",
      uploadedAt: d.uploadedAt,
      status:
        d.status === "verified"
          ? "verified"
          : d.status === "attached"
            ? "attached"
            : "pending_review",
    }));
    const seen = new Set(fromDb.map((d) => `${d.name}|${d.targetId}`));
    return [...local.filter((d) => !seen.has(`${d.name}|${d.targetId}`)), ...fromDb];
  }, [local, stored]);
  const [tab, setTab] = useState<(typeof CATEGORIES)[number]>("all");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    let r = documents;
    if (tab !== "all") r = r.filter((d) => d.category === tab);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.franchise ?? "").toLowerCase().includes(q) ||
          d.targetId.toLowerCase().includes(q),
      );
    }
    return r;
  }, [documents, tab, search]);

  const counters = useMemo(
    () => ({
      total: documents.length,
      kyc: documents.filter((d) => d.category === "kyc").length,
      compliance: documents.filter((d) => d.category === "compliance").length,
      pending: documents.filter((d) => d.status === "pending_review").length,
      verified: documents.filter((d) => d.status === "verified").length,
    }),
    [documents],
  );

  const columns: Column<StoredDocument>[] = [
    {
      id: "name",
      header: "Document",
      cell: (d) => (
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate font-medium text-foreground">{d.name}</span>
        </div>
      ),
    },
    { id: "category", header: "Category", cell: (d) => <span className="capitalize">{d.category}</span> },
    { id: "kind", header: "Kind", cell: (d) => <span className="text-muted-foreground">{d.kind.replace(/_/g, " ")}</span> },
    { id: "franchise", header: "Franchise", cell: (d) => <span>{d.franchise ?? "—"}</span> },
    {
      id: "targetId",
      header: "Linked to",
      cell: (d) => (
        <Link
          to={d.scope === "license" ? "/license" : "/commission"}
          className="font-mono text-[11.5px] text-primary hover:underline"
        >
          {d.targetLabel}
        </Link>
      ),
    },
    { id: "size", header: "Size", cell: (d) => <span className="text-muted-foreground">{(d.size / 1024).toFixed(0)} KB</span> },
    { id: "uploadedAt", header: "Uploaded", cell: (d) => <span className="text-muted-foreground">{d.uploadedAt}</span> },
    { id: "status", header: "Status", cell: (d) => <StatusBadge status={d.status === "verified" ? "approved" : d.status === "pending_review" ? "pending" : "issued"}>{d.status.replace("_", " ")}</StatusBadge> },
  ];

  return (
    <>
      <WallHeader
        eyebrow="Documents"
        title="Document Vault"
        description="Every KYC and compliance file uploaded through License creation and renewal, linked to its exact record."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Total Documents" value={counters.total || undefined} />
          <Stat label="KYC" value={counters.kyc || undefined} />
          <Stat label="Compliance" value={counters.compliance || undefined} />
          <Stat label="Pending Review" tone="warning" value={counters.pending || undefined} />
          <Stat label="Verified" tone="success" value={counters.verified || undefined} />
        </div>

        <Section title="All Documents">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-1 border-b border-border">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setTab(c)}
                  className={`relative -mb-px border-b-2 px-3 py-2 text-[12.5px] font-medium capitalize transition-colors ${
                    tab === c
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                  <span className="ml-1.5 rounded bg-surface-2 px-1.5 py-0.5 text-[10.5px] text-muted-foreground">
                    {c === "all" ? documents.length : documents.filter((d) => d.category === c).length}
                  </span>
                </button>
              ))}
            </div>

            <Toolbar
              search={search}
              onSearch={setSearch}
              searchPlaceholder="Search document, franchise, record…"
              right={
                <ExportMenu<StoredDocument>
                  filename="documents"
                  rows={rows}
                  sheetName="Documents"
                  permission="franchise.read"
                />
              }
            />

            {rows.length === 0 ? (
              <Card>
                <div className="py-8 text-center text-[12.5px] text-muted-foreground">
                  Documents uploaded via License create or renewal appear here, linked to their license record.
                </div>
              </Card>
            ) : (
              <EnterpriseTable<StoredDocument>
                columns={columns}
                rows={rows}
                emptyTitle="No documents"
                emptyDescription="Nothing matches the current filters."
              />
            )}
          </div>
        </Section>
      </WallBody>
    </>
  );
}
