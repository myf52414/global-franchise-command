import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { EnterpriseTable, type Column } from "@/components/boss/EnterpriseTable";
import { Toolbar } from "@/components/boss/Toolbar";
import { StatusBadge } from "@/components/boss/StatusBadge";
import { ExportMenu } from "@/components/boss/ExportMenu";
import { useFranchises, useLicenses } from "@/lib/data-hooks";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Product Assignment · Boss Panel" },
      {
        name: "description",
        content:
          "Live view of products and licence plans assigned to every Software Vala franchise.",
      },
      { property: "og:title", content: "Product Assignment · Boss Panel" },
      {
        property: "og:description",
        content: "Products and licence plans assigned per franchise.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductsWall,
});

type Row = {
  id: string;
  franchise: string;
  country: string;
  tier: string;
  products: number;
  plans: string;
  licenses: number;
  status: string;
};

function ProductsWall() {
  const franchises = useFranchises();
  const licenses = useLicenses();
  const [search, setSearch] = useState("");

  const rows = useMemo<Row[]>(
    () =>
      (franchises.data ?? []).map((f) => {
        const ls = (licenses.data ?? []).filter((l) => l.franchiseId === f.id);
        return {
          id: f.id,
          franchise: f.company,
          country: f.country,
          tier: f.tier,
          products: f.productsAssigned,
          plans: [...new Set(ls.map((l) => l.plan))].join(", ") || "—",
          licenses: ls.length,
          status: f.status,
        };
      }),
    [franchises.data, licenses.data],
  );

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => r.franchise.toLowerCase().includes(q) || r.country.toLowerCase().includes(q));
  }, [rows, search]);

  const isLoading = franchises.isLoading || licenses.isLoading;
  const assigned = rows.filter((r) => r.products > 0).length;
  const totalProducts = rows.reduce((a, r) => a + r.products, 0);
  const unassigned = rows.length - assigned;

  const columns: Column<Row>[] = [
    { id: "franchise", header: "Franchise", cell: (r) => <span className="font-medium text-foreground">{r.franchise}</span> },
    { id: "country", header: "Country", cell: (r) => r.country },
    { id: "tier", header: "Tier", cell: (r) => <span className="capitalize text-muted-foreground">{r.tier}</span> },
    { id: "products", header: "Products", cell: (r) => <span className="tabular-nums">{r.products}</span> },
    { id: "plans", header: "License Plans", cell: (r) => <span className="capitalize text-muted-foreground">{r.plans}</span> },
    { id: "licenses", header: "Licenses", cell: (r) => <span className="tabular-nums">{r.licenses}</span> },
    {
      id: "status",
      header: "Status",
      cell: (r) => (
        <StatusBadge status={r.status === "active" ? "approved" : r.status === "suspended" ? "rejected" : "pending"}>
          {r.status}
        </StatusBadge>
      ),
    },
  ];

  return (
    <>
      <WallHeader
        eyebrow="Products"
        title="Product Assignment"
        description="Live product and licence-plan coverage for every franchise in the network."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Assigned Products" value={totalProducts || undefined} loading={isLoading} />
          <Stat label="Franchises With Products" tone="success" value={assigned || undefined} loading={isLoading} />
          <Stat label="Without Products" tone="warning" value={unassigned || undefined} loading={isLoading} />
          <Stat label="Active Licenses" tone="info" value={(licenses.data ?? []).length || undefined} loading={isLoading} />
        </div>

        <Section title="Assignments">
          <div className="space-y-3">
            <Toolbar
              search={search}
              onSearch={setSearch}
              searchPlaceholder="Search franchise or country…"
              right={
                <ExportMenu<Row>
                  filename="product-assignments"
                  rows={filtered}
                  sheetName="Assignments"
                  permission="franchise.read"
                />
              }
            />
            <EnterpriseTable<Row>
              columns={columns}
              rows={filtered}
              loading={isLoading}
              error={franchises.error || licenses.error ? "Failed to load assignments" : null}
              emptyTitle="No assignments"
              emptyDescription="Products assigned to franchises appear here automatically."
            />
          </div>
        </Section>
      </WallBody>
    </>
  );
}
