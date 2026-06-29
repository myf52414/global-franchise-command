import { createFileRoute } from "@tanstack/react-router";
import { DataTable, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/training")({
  head: () => ({ meta: [{ title: "Training · Boss Panel" }] }),
  component: TrainingWall,
});

function TrainingWall() {
  return (
    <>
      <WallHeader
        eyebrow="Training"
        title="Training & Certification"
        description="Courses, assessments, certificates and leaderboards across franchises."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Courses" />
          <Stat label="Enrolled" />
          <Stat label="Completed" tone="success" />
          <Stat label="Avg. Score" />
          <Stat label="Certificates Issued" />
        </div>

        <Section title="Courses">
          <DataTable
            caption="0 courses"
            columns={["Course","Type","Duration","Enrolled","Completion %","Avg Score","Certificate","Status"]}
          />
        </Section>

        <Section title="Leaderboard">
          <DataTable
            caption="0 entries"
            columns={["Rank","Franchise","User","Courses","Score","Certificates"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
