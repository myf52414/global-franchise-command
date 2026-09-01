import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PillRow, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { EnterpriseTable, type Column } from "@/components/boss/EnterpriseTable";
import { Toolbar } from "@/components/boss/Toolbar";
import { StatusBadge } from "@/components/boss/StatusBadge";
import { ExportMenu } from "@/components/boss/ExportMenu";
import { Progress } from "@/components/boss/Progress";
import { useApplications, useFranchises, useLicenses } from "@/lib/data-hooks";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Franchise Onboarding · Boss Panel" },
      {
        name: "description",
        content:
          "Track every approved franchise from agreement to go-live with live onboarding progress.",
      },
      { property: "og:title", content: "Franchise Onboarding · Boss Panel" },
      {
        property: "og:description",
        content: "Live onboarding journey from agreement to go-live.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnboardingWall,
});

const STEPS = [
  "Agreement Signed",
  "Payment Cleared",
  "Account Provisioned",
  "License Issued",
  "Products Assigned",
  "Territory Locked",
];

type Row = {
  id: string;
  applicant: string;
  company: string;
  country: string;
  stage: string;
  kyc: boolean;
  payment: boolean;
  licenseIssued: boolean;
  progress: number;
  submittedAt: string;
};

function OnboardingWall() {
  const applications = useApplications();
  const franchises = useFranchises();
  const licenses = useLicenses();
  const [search, setSearch] = useState("");

  const rows = useMemo<Row[]>(() => {
    return (applications.data ?? [])
      .filter((a) => a.stage !== "rejected")
      .map((a) => {
        const franchise = (franchises.data ?? []).find((f) => f.company === a.company);
        const licenseIssued = !!franchise && (licenses.data ?? []).some((l) => l.franchiseId === franchise.id);
        const done =
          [true, a.kycVerified, a.paymentVerified, !!franchise, licenseIssued, franchise ? franchise.productsAssigned > 0 : false].filter(
            Boolean,
          ).length;
        return {
          id: a.id,
          applicant: a.applicantName,
          company: a.company,
          country: a.country,
          stage: a.stage,
          kyc: a.kycVerified,
          payment: a.paymentVerified,
          licenseIssued,
          progress: Math.round((done / 6) * 100),
          submittedAt: a.submittedAt,
        };
      });
  }, [applications.data, franchises.data, licenses.data]);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.applicant.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const isLoading = applications.isLoading || franchises.isLoading || licenses.isLoading;
  const error = applications.error || franchises.error || licenses.error;

  const inOnboarding = rows.filter((r) => r.progress < 100).length;
  const awaitingPayment = rows.filter((r) => !r.payment).length;
  const awaitingKyc = rows.filter((r) => !r.kyc).length;
  const live = rows.filter((r) => r.progress === 100).length;

  const columns: Column<Row>[] = [
    { id: "applicant", header: "Applicant", cell: (r) => <span className="font-medium text-foreground">{r.applicant}</span> },
    { id: "company", header: "Company", cell: (r) => r.company },
    { id: "country", header: "Country", cell: (r) => r.country },
    {
      id: "stage",
      header: "Stage",
      cell: (r) => <StatusBadge status={r.stage === "approved" ? "approved" : "pending"}>{r.stage.replace(/_/g, " ")}</StatusBadge>,
    },
    { id: "kyc", header: "KYC", cell: (r) => <StatusBadge status={r.kyc ? "approved" : "pending"}>{r.kyc ? "done" : "pending"}</StatusBadge> },
    {
      id: "payment",
      header: "Payment",
      cell: (r) => <StatusBadge status={r.payment ? "approved" : "pending"}>{r.payment ? "cleared" : "pending"}</StatusBadge>,
    },
    {
      id: "licenseIssued",
      header: "License",
      cell: (r) => <StatusBadge status={r.licenseIssued ? "approved" : "pending"}>{r.licenseIssued ? "issued" : "pending"}</StatusBadge>,
    },
    {
      id: "progress",
      header: "Progress",
      width: "160px",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Progress value={r.progress} />
          <span className="tabular-nums text-[11.5px] text-muted-foreground">{r.progress}%</span>
        </div>
      ),
    },
    { id: "submittedAt", header: "Submitted", cell: (r) => <span className="text-muted-foreground">{r.submittedAt}</span> },
  ];

  return (
    <>
      <WallHeader
        eyebrow="Onboarding"
        title="Franchise Onboarding"
        description="Live onboarding journey computed from applications, franchises and issued licences."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="In Onboarding" value={inOnboarding || undefined} loading={isLoading} />
          <Stat label="Awaiting Payment" tone="warning" value={awaitingPayment || undefined} loading={isLoading} />
          <Stat label="Awaiting KYC" tone="warning" value={awaitingKyc || undefined} loading={isLoading} />
          <Stat label="Fully Live" tone="success" value={live || undefined} loading={isLoading} />
          <Stat label="Total Tracked" value={rows.length || undefined} loading={isLoading} />
        </div>

        <Section title="Standard Journey">
          <PillRow items={STEPS} />
        </Section>

        <Section title="Active Onboardings">
          <div className="space-y-3">
            <Toolbar
              search={search}
              onSearch={setSearch}
              searchPlaceholder="Search applicant, company or country…"
              right={
                <ExportMenu<Row>
                  filename="onboarding"
                  rows={filtered}
                  sheetName="Onboarding"
                  permission="franchise.read"
                />
              }
            />
            <EnterpriseTable<Row>
              columns={columns}
              rows={filtered}
              loading={isLoading}
              error={error ? "Failed to load onboarding data" : null}
              emptyTitle="No onboardings"
              emptyDescription="Approved applications appear here with live progress."
            />
          </div>
        </Section>
      </WallBody>
    </>
  );
}
