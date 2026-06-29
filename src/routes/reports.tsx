import { createFileRoute } from "@tanstack/react-router";
import { Btn, Card, Section, WallBody, WallHeader } from "@/components/boss/Wall";
import { Download, FileText } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports · Boss Panel" }] }),
  component: ReportsWall,
});

const REPORTS = [
  "Revenue Reports","Sales Reports","Commission Reports","Franchise Reports",
  "License Reports","Customer Reports","Support Reports","Tax Reports",
];

function ReportsWall() {
  return (
    <>
      <WallHeader
        eyebrow="Reports"
        title="Report Center"
        description="Generate, schedule and export operational reports."
        actions={<>
          <Btn variant="outline"><Download className="h-3.5 w-3.5" /> Export Center</Btn>
          <Btn variant="primary">New Report</Btn>
        </>}
      />
      <WallBody>
        <Section title="Standard Reports">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {REPORTS.map((r) => (
              <Card key={r}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-foreground">{r}</div>
                    <div className="mt-1 text-[11.5px] text-muted-foreground">PDF · Excel · CSV</div>
                  </div>
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-accent text-accent-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Btn variant="outline">Generate</Btn>
                  <Btn variant="ghost">Schedule</Btn>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Recent Exports">
          <Card padded={false}>
            <div className="px-4 py-14 text-center text-[12.5px] text-muted-foreground">
              No exports yet. Generated reports will appear here with status and download links.
            </div>
          </Card>
        </Section>
      </WallBody>
    </>
  );
}
