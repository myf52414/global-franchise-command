import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { EnterpriseTable, type Column } from "@/components/boss/EnterpriseTable";
import { Toolbar } from "@/components/boss/Toolbar";
import { StatusBadge } from "@/components/boss/StatusBadge";
import { ExportMenu } from "@/components/boss/ExportMenu";
import { useDocumentRecords, useFranchises, useLicenses } from "@/lib/data-hooks";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance & Risk · Boss Panel" },
      {
        name: "description",
        content:
          "Live KYC, compliance clearance, document coverage and risk monitoring across every franchise.",
      },
      { property: "og:title", content: "Compliance & Risk · Boss Panel" },
      {
        property: "og:description",
        content: "KYC, compliance clearance, document coverage and risk monitoring.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ComplianceWall,
});

type Row = {
  id: string;
  franchise: string;
  country: string;
  licenses: number;
  kyc: boolean;
  compliance: boolean;
  documents: number;
  pendingDocs: number;
  nextExpiry: string | null;
  risk: string;
};

function ComplianceWall() {
  const franchises = useFranchises();
  const licenses = useLicenses();
  const documents = useDocumentRecords();
  const [search, setSearch] = useState("");

  const rows = useMemo<Row[]>(() => {
    return (franchises.data ?? []).map((f) => {
      const ls = (licenses.data ?? []).filter((l) => l.franchiseId === f.id);
      const docs = (documents.data ?? []).filter((d) => d.franchise === f.company);
      const expiries = ls.map((l) => l.expiresAt).sort();
      return {
        id: f.id,
        franchise: f.company,
        country: f.country,
        licenses: ls.length,
        kyc: ls.length > 0 && ls.every((l) => l.kycVerified),
        compliance: ls.length > 0 && ls.every((l) => l.complianceCleared),
        documents: docs.length,
        pendingDocs: docs.filter((d) => d.status === "pending_review").length,
        nextExpiry: expiries[0] ?? null,
        risk: f.riskLevel,
      };
    });
  }, [franchises.data, licenses.data, documents.data]);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => r.franchise.toLowerCase().includes(q) || r.country.toLowerCase().includes(q));
  }, [rows, search]);

  const isLoading = franchises.isLoading || licenses.isLoading || documents.isLoading;
  const error = franchises.error || licenses.error || documents.error;

  const soon = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10);
  const expiring = (licenses.data ?? []).filter((l) => l.expiresAt <= soon).length;
  const kycPending = (licenses.data ?? []).filter((l) => !l.kycVerified).length;
  const kycOk = (licenses.data ?? []).filter((l) => l.kycVerified).length;
  const highRisk = rows.filter((r) => r.risk === "high" || r.risk === "critical").length;

  const columns: Column<Row>[] = [
    { id: "franchise", header: "Franchise", cell: (r) => <span className="font-medium text-foreground">{r.franchise}</span> },
    { id: "country", header: "Country", cell: (r) => r.country },
    { id: "licenses", header: "Licenses", cell: (r) => <span className="tabular-nums">{r.licenses}</span> },
    {
      id: "kyc",
      header: "KYC",
      cell: (r) => <StatusBadge status={r.kyc ? "approved" : "pending"}>{r.kyc ? "verified" : "pending"}</StatusBadge>,
    },
    {
      id: "compliance",
      header: "Compliance",
      cell: (r) => (
        <StatusBadge status={r.compliance ? "approved" : "pending"}>
          {r.compliance ? "cleared" : "review"}
        </StatusBadge>
      ),
    },
    { id: "documents", header: "Documents", cell: (r) => <span className="tabular-nums">{r.documents}</span> },
    { id: "pendingDocs", header: "Pending Docs", cell: (r) => <span className="tabular-nums">{r.pendingDocs}</span> },
    { id: "nextExpiry", header: "Next Expiry", cell: (r) => <span className="text-muted-foreground">{r.nextExpiry ?? "—"}</span> },
    {
      id: "risk",
      header: "Risk",
      cell: (r) => (
        <StatusBadge status={r.risk === "low" ? "approved" : r.risk === "medium" ? "pending" : "rejected"}>
          {r.risk}
        </StatusBadge>
      ),
    },
  ];

  return (
    <>
      <WallHeader
        eyebrow="Compliance"
        title="Compliance & Risk"
        description="Live KYC status, compliance clearance, document coverage and licence expiry risk."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="KYC Verified" tone="success" value={kycOk || undefined} loading={isLoading} />
          <Stat label="KYC Pending" tone="warning" value={kycPending || undefined} loading={isLoading} />
          <Stat label="Expiring ≤ 60d" tone="warning" value={expiring || undefined} loading={isLoading} />
          <Stat
            label="Docs Pending Review"
            tone="warning"
            value={(documents.data ?? []).filter((d) => d.status === "pending_review").length || undefined}
            loading={isLoading}
          />
          <Stat label="High Risk Franchises" tone="destructive" value={highRisk || undefined} loading={isLoading} />
        </div>

        <Section title="Compliance Register">
          <div className="space-y-3">
            <Toolbar
              search={search}
              onSearch={setSearch}
              searchPlaceholder="Search franchise or country…"
              right={
                <ExportMenu<Row>
                  filename="compliance"
                  rows={filtered}
                  sheetName="Compliance"
                  permission="franchise.read"
                />
              }
            />
            <EnterpriseTable<Row>
              columns={columns}
              rows={filtered}
              loading={isLoading}
              error={error ? "Failed to load compliance data" : null}
              emptyTitle="No compliance records"
              emptyDescription="Franchises with licences and documents appear here automatically."
            />
          </div>
        </Section>
      </WallBody>
    </>
  );
}
