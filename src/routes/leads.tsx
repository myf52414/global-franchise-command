import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { EnterpriseTable, type Column } from "@/components/boss/EnterpriseTable";
import { Toolbar } from "@/components/boss/Toolbar";
import { StatusBadge } from "@/components/boss/StatusBadge";
import { ExportMenu } from "@/components/boss/ExportMenu";
import { useLeads, type Lead } from "@/lib/data-hooks";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Franchise Leads · Boss Panel" },
      {
        name: "description",
        content:
          "Inbound franchise enquiries, source attribution and conversion pipeline for Software Vala partners.",
      },
    ],
  }),
  component: LeadsWall,
});

function LeadsWall() {
  const { data: rows = [], isLoading, error } = useLeads();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        (l.owner ?? "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const count = (stage: string) => rows.filter((l) => l.stage === stage).length;
  const converted = count("converted");
  const conversionRate = rows.length
    ? `${Math.round((converted / rows.length) * 100)}%`
    : undefined;

  const columns: Column<Lead>[] = [
    { id: "name", header: "Lead", cell: (l) => <span className="font-medium text-foreground">{l.name}</span> },
    { id: "company", header: "Company", cell: (l) => l.company },
    { id: "country", header: "Country", cell: (l) => l.country },
    { id: "source", header: "Source", cell: (l) => <span className="capitalize text-muted-foreground">{l.source}</span> },
    {
      id: "stage",
      header: "Stage",
      cell: (l) => (
        <StatusBadge
          status={
            l.stage === "converted"
              ? "approved"
              : l.stage === "dropped"
                ? "rejected"
                : l.stage === "qualified"
                  ? "issued"
                  : "pending"
          }
        >
          {l.stage.replace(/_/g, " ")}
        </StatusBadge>
      ),
    },
    { id: "owner", header: "Owner", cell: (l) => l.owner ?? <span className="text-muted-foreground">Unassigned</span> },
    { id: "score", header: "Score", cell: (l) => <span className="tabular-nums">{l.score}</span> },
    { id: "nextAction", header: "Next Action", cell: (l) => <span className="text-muted-foreground">{l.nextAction ?? "—"}</span> },
  ];

  return (
    <>
      <WallHeader
        eyebrow="Leads"
        title="Franchise Leads"
        description="Inbound franchise enquiries, source attribution and conversion pipeline."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="New Leads" value={count("new") || undefined} />
          <Stat label="Qualified" tone="info" value={count("qualified") || undefined} />
          <Stat label="In Discussion" value={count("in_discussion") || undefined} />
          <Stat label="Converted" tone="success" value={converted || undefined} />
          <Stat label="Dropped" tone="destructive" value={count("dropped") || undefined} />
          <Stat label="Conversion Rate" value={conversionRate} />
        </div>

        <Section title="Pipeline">
          <div className="space-y-3">
            <Toolbar
              search={search}
              onSearch={(v) => {
                setSearch(v);
                setPage(1);
              }}
              searchPlaceholder="Search lead, company, country or owner…"
              right={
                <ExportMenu<Lead>
                  filename="leads"
                  rows={filtered}
                  sheetName="Leads"
                  permission="franchise.read"
                />
              }
            />
            <EnterpriseTable<Lead>
              columns={columns}
              rows={paged}
              loading={isLoading}
              error={error ? "Failed to load leads" : null}
              emptyTitle="No leads yet"
              emptyDescription="Inbound enquiries appear here with source attribution and pipeline stage."
              pagination={{
                page,
                pageSize,
                total: filtered.length,
                onPage: setPage,
                onPageSize: setPageSize,
              }}
            />
          </div>
        </Section>
      </WallBody>
    </>
  );
}
