import { createFileRoute } from "@tanstack/react-router";
import { DataTable, PillRow, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/communication")({
  head: () => ({ meta: [{ title: "Communication · Boss Panel" }] }),
  component: CommunicationWall,
});

function CommunicationWall() {
  return (
    <>
      <WallHeader
        eyebrow="Communication"
        title="Global Communication"
        description="Announcements, broadcasts, internal chat and video meetings."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Announcements (30d)" />
          <Stat label="Broadcasts Sent" />
          <Stat label="Unread Notifications" tone="warning" />
          <Stat label="Active Meetings" tone="info" />
        </div>
        <Section title="Channels">
          <PillRow items={["Announcements","Broadcast","Email","SMS","WhatsApp","Push","Internal Chat","Video Meetings"]} />
        </Section>
        <Section title="Outbox">
          <DataTable
            caption="0 messages"
            columns={["Subject","Channel","Audience","Sent By","Delivered","Read","Scheduled","Status"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
