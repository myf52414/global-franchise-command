import { createFileRoute } from "@tanstack/react-router";
import { Card, PillRow, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding · Boss Panel" }] }),
  component: OnboardingWall,
});

const STEPS = [
  "Agreement Signed","Payment Cleared","Account Provisioned",
  "License Issued","Products Assigned","Territory Locked",
  "Team Onboarded","Training Started","Go-Live",
];

function OnboardingWall() {
  return (
    <>
      <WallHeader
        eyebrow="Onboarding"
        title="Franchise Onboarding"
        description="Standardised onboarding journey from signed agreement to go-live."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="In Onboarding" />
          <Stat label="Awaiting Payment" tone="warning" />
          <Stat label="Awaiting Training" tone="warning" />
          <Stat label="Go-Live This Week" tone="success" />
          <Stat label="Avg. Time to Go-Live" />
        </div>

        <Section title="Standard Journey">
          <PillRow items={STEPS} />
        </Section>

        <Section title="Active Onboardings">
          <Card padded={false}>
            <div className="px-4 py-16 text-center text-[12.5px] text-muted-foreground">
              No franchises are currently onboarding. New approvals from the Applications wall will appear here.
            </div>
          </Card>
        </Section>
      </WallBody>
    </>
  );
}
