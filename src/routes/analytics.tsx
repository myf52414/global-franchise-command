import { createFileRoute } from "@tanstack/react-router";
import { Card, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Boss Panel" }] }),
  component: AnalyticsWall,
});

const PANELS = [
  "Revenue","Sales","Customers","Products","Countries",
  "Growth","Conversion","Retention","Renewals","Support","Marketing","Forecast",
];

function AnalyticsWall() {
  return (
    <>
      <WallHeader
        eyebrow="Analytics"
        title="Franchise Analytics"
        description="Deep analytics across every operational and financial dimension."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="MAU" />
          <Stat label="Revenue / Franchise" tone="info" />
          <Stat label="Retention" tone="success" />
          <Stat label="Forecast Accuracy" />
        </div>

        <Section title="Analytics Panels">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {PANELS.map((p) => (
              <Card key={p}>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {p}
                </div>
                <div className="mt-4 grid h-36 place-items-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
                  Awaiting data
                </div>
              </Card>
            ))}
          </div>
        </Section>
      </WallBody>
    </>
  );
}
