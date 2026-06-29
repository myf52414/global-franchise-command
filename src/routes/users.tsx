import { createFileRoute } from "@tanstack/react-router";
import { DataTable, PillRow, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "User Management · Boss Panel" }] }),
  component: UsersWall,
});

function UsersWall() {
  return (
    <>
      <WallHeader
        eyebrow="Users"
        title="User & Role Management"
        description="Owners, managers, sales, support, finance, marketing — across every franchise."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Total Users" />
          <Stat label="Active Today" tone="success" />
          <Stat label="Locked" tone="destructive" />
          <Stat label="Pending Invitations" tone="warning" />
        </div>

        <Section title="Roles">
          <PillRow items={["Owner","Manager","Sales","Support","Finance","Marketing","Employee"]} />
        </Section>

        <Section title="All Users">
          <DataTable
            caption="0 users"
            columns={["User","Email","Franchise","Role","Last Login","Sessions","2FA","Status","Action"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
