import { createFileRoute } from "@tanstack/react-router";
import { Card, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { ExportMenu } from "@/components/boss/ExportMenu";
import { FileText } from "lucide-react";
import {
  useApplications,
  useCommissions,
  useDocumentRecords,
  useFranchises,
  useInvoices,
  useLeads,
  useLicenses,
  useTerritories,
} from "@/lib/data-hooks";
import type { Permission } from "@/lib/franchise-domain";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Report Center · Boss Panel" },
      {
        name: "description",
        content:
          "Generate and export live franchise, revenue, licence, commission and compliance reports.",
      },
      { property: "og:title", content: "Report Center · Boss Panel" },
      {
        property: "og:description",
        content: "Generate and export live operational reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsWall,
});

function ReportCard({
  title,
  rows,
  filename,
  permission,
  loading,
}: {
  title: string;
  rows: Record<string, unknown>[];
  filename: string;
  permission: Permission;
  loading?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-foreground">{title}</div>
          <div className="mt-1 text-[11.5px] text-muted-foreground">
            {loading ? "Loading…" : `${rows.length.toLocaleString()} live records · CSV · Excel`}
          </div>
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
          <FileText className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <ExportMenu
          filename={filename}
          rows={rows}
          sheetName={title}
          label="Generate"
          permission={permission}
          disabled={loading}
        />
      </div>
    </Card>
  );
}

function ReportsWall() {
  const franchises = useFranchises();
  const applications = useApplications();
  const licenses = useLicenses();
  const commissions = useCommissions();
  const invoices = useInvoices();
  const leads = useLeads();
  const territories = useTerritories();
  const documents = useDocumentRecords();

  const loading =
    franchises.isLoading ||
    applications.isLoading ||
    licenses.isLoading ||
    commissions.isLoading ||
    invoices.isLoading ||
    leads.isLoading ||
    territories.isLoading ||
    documents.isLoading;

  const reports = [
    { title: "Revenue Report", rows: invoices.data ?? [], filename: "revenue-report", permission: "revenue.read" as Permission },
    { title: "Commission Report", rows: commissions.data ?? [], filename: "commission-report", permission: "commission.read" as Permission },
    { title: "License Report", rows: licenses.data ?? [], filename: "license-report", permission: "license.read" as Permission },
    { title: "Franchise Report", rows: franchises.data ?? [], filename: "franchise-report", permission: "franchise.read" as Permission },
    { title: "Application Report", rows: applications.data ?? [], filename: "application-report", permission: "franchise.read" as Permission },
    { title: "Lead Report", rows: leads.data ?? [], filename: "lead-report", permission: "franchise.read" as Permission },
    { title: "Territory Report", rows: territories.data ?? [], filename: "territory-report", permission: "franchise.read" as Permission },
    { title: "Document Report", rows: documents.data ?? [], filename: "document-report", permission: "franchise.read" as Permission },
  ];

  const totalRecords = reports.reduce((a, r) => a + r.rows.length, 0);

  return (
    <>
      <WallHeader
        eyebrow="Reports"
        title="Report Center"
        description="Every report is generated from live backend records — no snapshots, no stale files."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Report Types" value={reports.length} />
          <Stat label="Records Available" value={totalRecords || undefined} loading={loading} />
          <Stat label="Invoices" value={(invoices.data ?? []).length || undefined} loading={loading} />
          <Stat label="Licenses" value={(licenses.data ?? []).length || undefined} loading={loading} />
        </div>

        <Section title="Standard Reports" description="Exports respect your role permissions.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {reports.map((r) => (
              <ReportCard
                key={r.title}
                title={r.title}
                rows={r.rows as unknown as Record<string, unknown>[]}
                filename={r.filename}
                permission={r.permission}
                loading={loading}
              />
            ))}
          </div>
        </Section>
      </WallBody>
    </>
  );
}
