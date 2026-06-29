import { createFileRoute } from "@tanstack/react-router";
import { DataTable, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/commission")({
  head: () => ({ meta: [{ title: "Commission · Boss Panel" }] }),
  component: CommissionWall,
});

function CommissionWall() {
  return (
    <>
      <WallHeader
        eyebrow="Commission"
        title="Commission & Payouts"
        description="Commission slabs, royalty rules, payout cycles and statements."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Commission Payable" tone="warning" />
          <Stat label="Paid This Cycle" tone="success" />
          <Stat label="Held / On Review" />
          <Stat label="Avg Commission %" />
        </div>
        <Section title="Payout Ledger">
          <DataTable
            caption="0 payouts"
            columns={["Cycle","Franchise","Base","Rate","Adjustment","Tax","Payable","Status","Action"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
