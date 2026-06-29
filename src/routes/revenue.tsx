import { createFileRoute } from "@tanstack/react-router";
import { Card, DataTable, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/revenue")({
  head: () => ({ meta: [{ title: "Revenue · Boss Panel" }] }),
  component: RevenueWall,
});

function RevenueWall() {
  return (
    <>
      <WallHeader
        eyebrow="Revenue"
        title="Revenue & Financial Operations"
        description="Consolidated revenue across royalty, subscription, license, renewals and invoices."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="MTD Revenue" tone="info" />
          <Stat label="QTD Revenue" tone="info" />
          <Stat label="YTD Revenue" tone="info" />
          <Stat label="Royalty Collected" />
          <Stat label="Subscription Revenue" />
          <Stat label="License Revenue" />
          <Stat label="Renewal Revenue" />
          <Stat label="Pending Payments" tone="warning" />
          <Stat label="Tax Collected" />
        </div>

        <Section title="Revenue Over Time">
          <Card>
            <div className="grid h-48 place-items-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
              Chart renders from live ledger
            </div>
          </Card>
        </Section>

        <Section title="Invoices">
          <DataTable
            caption="0 invoices"
            columns={["Invoice #","Franchise","Type","Amount","Tax","Status","Issued","Due","Action"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
