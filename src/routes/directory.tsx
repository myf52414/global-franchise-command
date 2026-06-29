import { createFileRoute } from "@tanstack/react-router";
import { DataTable, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/directory")({
  head: () => ({ meta: [{ title: "Franchise Directory · Boss Panel" }] }),
  component: DirectoryWall,
});

function DirectoryWall() {
  return (
    <>
      <WallHeader
        eyebrow="Directory"
        title="Franchise Master Directory"
        description="Single source of truth for every franchise globally."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Total Franchises" />
          <Stat label="Active" tone="success" />
          <Stat label="Suspended" tone="destructive" />
          <Stat label="High Risk" tone="warning" />
          <Stat label="Avg Health Score" />
          <Stat label="Avg Commission" />
        </div>

        <Section title="Directory">
          <DataTable
            caption="0 franchises"
            columns={[
              "Code","Company","Owner","Country","State","City",
              "Tier","Status","Commission","Products","License","Revenue",
              "Health","Risk","Actions",
            ]}
          />
        </Section>
      </WallBody>
    </>
  );
}
