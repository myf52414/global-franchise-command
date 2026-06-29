import { createFileRoute } from "@tanstack/react-router";
import { DataTable, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/compliance")({
  head: () => ({ meta: [{ title: "Compliance · Boss Panel" }] }),
  component: ComplianceWall,
});

function ComplianceWall() {
  return (
    <>
      <WallHeader
        eyebrow="Compliance"
        title="Compliance & Risk"
        description="KYC, tax, business licensing, audits and risk monitoring."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="KYC Verified" tone="success" />
          <Stat label="KYC Pending" tone="warning" />
          <Stat label="Documents Expiring" tone="warning" />
          <Stat label="Compliance Alerts" tone="destructive" />
          <Stat label="Avg. Risk Score" />
        </div>

        <Section title="Compliance Register">
          <DataTable
            caption="0 records"
            columns={["Franchise","Country","KYC","GST/VAT","Business License","Tax Filing","Expiry","Risk","Status"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
