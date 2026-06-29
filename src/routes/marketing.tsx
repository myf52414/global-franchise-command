import { createFileRoute } from "@tanstack/react-router";
import { DataTable, PillRow, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/marketing")({
  head: () => ({ meta: [{ title: "Marketing · Boss Panel" }] }),
  component: MarketingWall,
});

function MarketingWall() {
  return (
    <>
      <WallHeader
        eyebrow="Marketing"
        title="Marketing Operations"
        description="Campaigns, coupons, banners and multi-channel outreach across franchises."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Active Campaigns" />
          <Stat label="Coupons Issued" />
          <Stat label="Leads Generated" tone="info" />
          <Stat label="Conversion %" tone="success" />
          <Stat label="Spend (MTD)" />
        </div>
        <Section title="Channels">
          <PillRow items={["Email","SMS","WhatsApp","Push","Social Media","Banners"]} />
        </Section>
        <Section title="Campaigns">
          <DataTable
            caption="0 campaigns"
            columns={["Campaign","Channel","Audience","Sent","Opens","Clicks","Conversions","Spend","Status"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
