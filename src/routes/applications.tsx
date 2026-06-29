import { createFileRoute } from "@tanstack/react-router";
import { Btn, DataTable, PillRow, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/applications")({
  head: () => ({ meta: [{ title: "Franchise Applications · Boss Panel" }] }),
  component: ApplicationsWall,
});

function ApplicationsWall() {
  return (
    <>
      <WallHeader
        eyebrow="Applications"
        title="Franchise Applications"
        description="Review, verify and approve incoming franchise applications end-to-end."
        actions={<>
          <Btn variant="outline">Bulk Assign</Btn>
          <Btn variant="primary"><Plus className="h-3.5 w-3.5" /> New Application</Btn>
        </>}
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="New" />
          <Stat label="Under Review" tone="warning" />
          <Stat label="Interview" />
          <Stat label="KYC Pending" tone="warning" />
          <Stat label="Approved" tone="success" />
          <Stat label="Rejected" tone="destructive" />
        </div>

        <Section title="Workflow Stages">
          <PillRow items={[
            "Submitted","Reviewer Assigned","Background Verification","KYC",
            "Document Verification","Interview","Agreement","Digital Signature",
            "Payment Verification","Approved",
          ]} />
        </Section>

        <Section title="All Applications" description="Auto status flow with full audit timeline per application.">
          <DataTable
            caption="0 applications"
            columns={[
              "App ID","Applicant","Country","State","City",
              "Stage","Reviewer","KYC","Payment","Submitted","Action",
            ]}
          />
        </Section>
      </WallBody>
    </>
  );
}
