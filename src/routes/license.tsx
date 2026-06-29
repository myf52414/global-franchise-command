import { createFileRoute } from "@tanstack/react-router";
import { Btn, DataTable, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/license")({
  head: () => ({ meta: [{ title: "License · Boss Panel" }] }),
  component: LicenseWall,
});

function LicenseWall() {
  return (
    <>
      <WallHeader
        eyebrow="License"
        title="License Management"
        description="Generate, activate, suspend, renew and audit franchise software licenses."
        actions={<>
          <Btn variant="outline">Bulk Generate</Btn>
          <Btn variant="primary"><Plus className="h-3.5 w-3.5" /> Generate License</Btn>
        </>}
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Active Licenses" tone="success" />
          <Stat label="Suspended" tone="destructive" />
          <Stat label="Expiring < 30d" tone="warning" />
          <Stat label="Expired" />
          <Stat label="Avg. Devices / License" />
          <Stat label="Avg. Domains / License" />
        </div>

        <Section title="Licenses">
          <DataTable
            caption="0 licenses"
            columns={["License Key","Franchise","Plan","Devices","Domains","Issued","Expires","Status","Action"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
