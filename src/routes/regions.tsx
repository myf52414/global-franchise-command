import { createFileRoute } from "@tanstack/react-router";
import { Card, DataTable, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/regions")({
  head: () => ({ meta: [{ title: "Territory & Regions · Boss Panel" }] }),
  component: RegionsWall,
});

function RegionsWall() {
  return (
    <>
      <WallHeader
        eyebrow="Territory"
        title="Region & Territory Management"
        description="Region, state and city level territory assignment, locking and transfers."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Regions" />
          <Stat label="States" />
          <Stat label="Cities Assigned" />
          <Stat label="Locked Territories" tone="info" />
          <Stat label="Pending Transfers" tone="warning" />
        </div>

        <Section title="Global Map">
          <Card>
            <div className="grid h-72 place-items-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
              World map renders once territories are configured
            </div>
          </Card>
        </Section>

        <Section title="Territories">
          <DataTable
            caption="0 territories"
            columns={["Region","Country","State","City","Assigned To","Population","Market Size","Status","Action"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
