import { createFileRoute } from "@tanstack/react-router";
import { DataTable, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/countries")({
  head: () => ({ meta: [{ title: "Countries · Boss Panel" }] }),
  component: CountriesWall,
});

function CountriesWall() {
  return (
    <>
      <WallHeader
        eyebrow="Countries"
        title="Country Management"
        description="Define operating countries, market sizing, expansion plans and currency rules."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Active Countries" />
          <Stat label="Planned" />
          <Stat label="Total Population (Reach)" />
          <Stat label="Coverage %" />
        </div>
        <Section title="Countries">
          <DataTable
            caption="0 countries"
            columns={["Country","Code","Franchises","Population","Market Size","Coverage","Currency","Status","Expansion Plan"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
