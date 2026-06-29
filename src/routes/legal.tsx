import { createFileRoute } from "@tanstack/react-router";
import { DataTable, PillRow, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/legal")({
  head: () => ({ meta: [{ title: "Legal · Boss Panel" }] }),
  component: LegalWall,
});

function LegalWall() {
  return (
    <>
      <WallHeader
        eyebrow="Legal"
        title="Legal & Agreements"
        description="Master franchise agreements, NDAs, policies and digital signatures."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Agreements Active" tone="success" />
          <Stat label="Awaiting Signature" tone="warning" />
          <Stat label="Expiring < 90d" tone="warning" />
          <Stat label="Disputes Open" tone="destructive" />
        </div>

        <Section title="Document Types">
          <PillRow items={["Franchise Agreement","NDA","Addendum","Policy","Termination","Renewal"]} />
        </Section>

        <Section title="Legal Register">
          <DataTable
            caption="0 documents"
            columns={["Document","Franchise","Type","Effective","Expiry","Signed By","Signature","Status"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
