import { createFileRoute } from "@tanstack/react-router";
import { Card, Section, WallBody, WallHeader } from "@/components/boss/Wall";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Boss Panel" }] }),
  component: SettingsWall,
});

const GROUPS: { title: string; items: string[] }[] = [
  { title: "Business Rules", items: ["Company Rules","Commission Rules","Royalty Rules","Territory Rules","Approval Workflow"] },
  { title: "Templates", items: ["Email Templates","WhatsApp Templates","SMS Templates","Document Templates","Notification Rules"] },
  { title: "Platform", items: ["Branding","Automation","Audit Settings","Security","API Keys","Integrations"] },
  { title: "System", items: ["Backup","Logs","System Health","Version Control"] },
];

function SettingsWall() {
  return (
    <>
      <WallHeader
        eyebrow="Settings"
        title="Platform Settings"
        description="Configure rules, templates, security, integrations and system operations."
      />
      <WallBody>
        {GROUPS.map((g) => (
          <Section key={g.title} title={g.title}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {g.items.map((i) => (
                <Card key={i}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">{i}</div>
                      <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                        Configure {i.toLowerCase()}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        ))}
      </WallBody>
    </>
  );
}
