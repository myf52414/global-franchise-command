import { createFileRoute } from "@tanstack/react-router";
import { DataTable, PillRow, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Documents · Boss Panel" }] }),
  component: DocumentsWall,
});

function DocumentsWall() {
  return (
    <>
      <WallHeader
        eyebrow="Documents"
        title="Document Vault"
        description="Centralised vault for every legal, financial and compliance document."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Total Documents" />
          <Stat label="Signed" tone="success" />
          <Stat label="Awaiting Signature" tone="warning" />
          <Stat label="Expiring" tone="warning" />
        </div>
        <Section title="Categories">
          <PillRow items={[
            "Agreement","Invoice","Certificate","KYC",
            "Business Registration","PAN","GST","NDA","Policies",
          ]} />
        </Section>
        <Section title="All Documents">
          <DataTable
            caption="0 documents"
            columns={["Document","Type","Franchise","Owner","Signed","Expiry","Version","Status"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
