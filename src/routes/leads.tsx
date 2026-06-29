import { createFileRoute } from "@tanstack/react-router";
import { DataTable, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/leads")({
  head: () => ({ meta: [{ title: "Leads · Boss Panel" }] }),
  component: LeadsWall,
});

function LeadsWall() {
  return (
    <>
      <WallHeader
        eyebrow="Leads"
        title="Franchise Leads"
        description="Inbound franchise enquiries, source attribution and conversion pipeline."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="New Leads" />
          <Stat label="Qualified" tone="info" />
          <Stat label="In Discussion" />
          <Stat label="Converted" tone="success" />
          <Stat label="Dropped" tone="destructive" />
          <Stat label="Conversion Rate" />
        </div>

        <Section title="Pipeline">
          <DataTable
            caption="0 leads"
            columns={["Lead ID","Name","Country","Source","Stage","Owner","Score","Created","Next Action"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
