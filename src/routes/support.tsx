import { createFileRoute } from "@tanstack/react-router";
import { DataTable, PillRow, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support · Boss Panel" }] }),
  component: SupportWall,
});

function SupportWall() {
  return (
    <>
      <WallHeader
        eyebrow="Support"
        title="Franchise Support Operations"
        description="Tickets, calls, meetings, escalations and SLA tracking."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Open Tickets" tone="warning" />
          <Stat label="Breached SLA" tone="destructive" />
          <Stat label="Avg First Response" />
          <Stat label="CSAT" tone="success" />
          <Stat label="Active Chats" />
          <Stat label="Scheduled Meetings" />
        </div>

        <Section title="Channels">
          <PillRow items={["Tickets","Calls","Meetings","WhatsApp","Email","Live Chat","Remote Support"]} />
        </Section>

        <Section title="Tickets">
          <DataTable
            caption="0 tickets"
            columns={["Ticket","Franchise","Subject","Channel","Priority","Owner","SLA","Status","Updated"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
