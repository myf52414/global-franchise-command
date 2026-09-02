import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PillRow, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { EnterpriseTable, type Column } from "@/components/boss/EnterpriseTable";
import { Toolbar } from "@/components/boss/Toolbar";
import { StatusBadge } from "@/components/boss/StatusBadge";
import { ExportMenu } from "@/components/boss/ExportMenu";
import { useAuditTrail, useFranchises } from "@/lib/data-hooks";
import { ROLE_PERMISSIONS } from "@/lib/franchise-domain";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "User & Role Management · Boss Panel" },
      {
        name: "description",
        content:
          "Live operator activity, roles and permission coverage across the Software Vala franchise network.",
      },
      { property: "og:title", content: "User & Role Management · Boss Panel" },
      {
        property: "og:description",
        content: "Operator activity, roles and permission coverage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UsersWall,
});

type Row = {
  id: string;
  actor: string;
  actions: number;
  scopes: string;
  lastAction: string;
  lastActive: string;
};

function UsersWall() {
  const audit = useAuditTrail("global");
  const franchises = useFranchises();
  const [search, setSearch] = useState("");

  const rows = useMemo<Row[]>(() => {
    const m = new Map<string, { actions: number; scopes: Set<string>; lastAction: string; lastActive: string }>();
    for (const e of audit.data ?? []) {
      const cur = m.get(e.actor) ?? { actions: 0, scopes: new Set<string>(), lastAction: e.action, lastActive: e.at };
      cur.actions += 1;
      if (e.target) cur.scopes.add(e.target.split("-")[0] ?? "");
      if (e.at > cur.lastActive) {
        cur.lastActive = e.at;
        cur.lastAction = e.action;
      }
      m.set(e.actor, cur);
    }
    return [...m.entries()]
      .map(([actor, v]) => ({
        id: actor,
        actor,
        actions: v.actions,
        scopes: [...v.scopes].filter(Boolean).join(", ") || "—",
        lastAction: v.lastAction,
        lastActive: new Date(v.lastActive).toLocaleString(),
      }))
      .sort((a, b) => b.actions - a.actions);
  }, [audit.data]);

  const filtered = useMemo(
    () => (search ? rows.filter((r) => r.actor.toLowerCase().includes(search.toLowerCase())) : rows),
    [rows, search],
  );

  const today = new Date().toISOString().slice(0, 10);
  const activeToday = (audit.data ?? []).filter((e) => e.at.slice(0, 10) === today).length;

  const columns: Column<Row>[] = [
    { id: "actor", header: "Operator", cell: (r) => <span className="font-medium text-foreground">{r.actor}</span> },
    { id: "actions", header: "Actions", cell: (r) => <span className="tabular-nums">{r.actions}</span> },
    { id: "scopes", header: "Touched Records", cell: (r) => <span className="text-muted-foreground">{r.scopes}</span> },
    { id: "lastAction", header: "Last Action", cell: (r) => <span className="text-muted-foreground">{r.lastAction}</span> },
    { id: "lastActive", header: "Last Active", cell: (r) => <span className="text-muted-foreground">{r.lastActive}</span> },
    { id: "status", header: "Status", cell: () => <StatusBadge status="approved">active</StatusBadge> },
  ];

  return (
    <>
      <WallHeader
        eyebrow="Users"
        title="User & Role Management"
        description="Operators are derived from the live audit trail; roles below define the permission matrix in force."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Operators" value={rows.length || undefined} loading={audit.isLoading} />
          <Stat label="Actions Today" tone="success" value={activeToday || undefined} loading={audit.isLoading} />
          <Stat label="Roles Defined" value={Object.keys(ROLE_PERMISSIONS).length} />
          <Stat
            label="Franchises Covered"
            value={(franchises.data ?? []).length || undefined}
            loading={franchises.isLoading}
          />
        </div>

        <Section title="Roles & Permissions">
          <div className="space-y-3">
            {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
              <div key={role} className="space-y-1.5">
                <div className="text-[12px] font-medium capitalize text-foreground">{role.replace(/_/g, " ")}</div>
                <PillRow items={perms} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Operator Activity">
          <div className="space-y-3">
            <Toolbar
              search={search}
              onSearch={setSearch}
              searchPlaceholder="Search operator…"
              right={
                <ExportMenu<Row>
                  filename="operators"
                  rows={filtered}
                  sheetName="Operators"
                  permission="user.manage"
                />
              }
            />
            <EnterpriseTable<Row>
              columns={columns}
              rows={filtered}
              loading={audit.isLoading}
              error={audit.error ? "Failed to load operator activity" : null}
              emptyTitle="No operator activity"
              emptyDescription="Every recorded action attributes to an operator and appears here."
            />
          </div>
        </Section>
      </WallBody>
    </>
  );
}
