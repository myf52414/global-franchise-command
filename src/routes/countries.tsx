import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";
import { EnterpriseTable, type Column } from "@/components/boss/EnterpriseTable";
import { Toolbar } from "@/components/boss/Toolbar";
import { ExportMenu } from "@/components/boss/ExportMenu";
import {
  useFranchises,
  useInvoices,
  useLicenses,
  useTerritories,
} from "@/lib/data-hooks";

export const Route = createFileRoute("/countries")({
  head: () => ({
    meta: [
      { title: "Countries · Boss Panel" },
      {
        name: "description",
        content:
          "Country-level franchise coverage, licenses, territories and revenue for Software Vala.",
      },
      { property: "og:title", content: "Countries · Boss Panel" },
      {
        property: "og:description",
        content: "Country coverage, licenses, territories and revenue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CountriesWall,
});

type CountryRow = {
  id: string;
  country: string;
  franchises: number;
  active: number;
  licenses: number;
  territories: number;
  revenue: number;
  invoices: number;
};

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function CountriesWall() {
  const franchises = useFranchises();
  const invoices = useInvoices();
  const licenses = useLicenses();
  const territories = useTerritories();
  const [search, setSearch] = useState("");

  const rows = useMemo<CountryRow[]>(() => {
    const map = new Map<string, CountryRow>();
    const get = (c: string) => {
      const key = c || "Unassigned";
      if (!map.has(key))
        map.set(key, {
          id: key,
          country: key,
          franchises: 0,
          active: 0,
          licenses: 0,
          territories: 0,
          revenue: 0,
          invoices: 0,
        });
      return map.get(key)!;
    };
    for (const f of franchises.data ?? []) {
      const r = get(f.country);
      r.franchises += 1;
      if (f.status === "active") r.active += 1;
    }
    for (const l of licenses.data ?? []) {
      const franchise = (franchises.data ?? []).find((f) => f.id === l.franchiseId);
      get(franchise?.country ?? "").licenses += 1;
    }
    for (const t of territories.data ?? []) get(t.country).territories += 1;
    for (const i of invoices.data ?? []) {
      const r = get(i.country);
      r.invoices += 1;
      r.revenue += i.amount;
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [franchises.data, invoices.data, licenses.data, territories.data]);

  const filtered = useMemo(
    () => (search ? rows.filter((r) => r.country.toLowerCase().includes(search.toLowerCase())) : rows),
    [rows, search],
  );

  const isLoading =
    franchises.isLoading || invoices.isLoading || licenses.isLoading || territories.isLoading;
  const error = franchises.error || invoices.error || licenses.error || territories.error;

  const totalRevenue = rows.reduce((a, r) => a + r.revenue, 0);
  const top = rows[0];

  const columns: Column<CountryRow>[] = [
    { id: "country", header: "Country", cell: (r) => <span className="font-medium text-foreground">{r.country}</span> },
    { id: "franchises", header: "Franchises", cell: (r) => <span className="tabular-nums">{r.franchises}</span> },
    { id: "active", header: "Active", cell: (r) => <span className="tabular-nums">{r.active}</span> },
    { id: "licenses", header: "Licenses", cell: (r) => <span className="tabular-nums">{r.licenses}</span> },
    { id: "territories", header: "Territories", cell: (r) => <span className="tabular-nums">{r.territories}</span> },
    { id: "invoices", header: "Invoices", cell: (r) => <span className="tabular-nums">{r.invoices}</span> },
    { id: "revenue", header: "Revenue", cell: (r) => <span className="tabular-nums">{money(r.revenue)}</span> },
  ];

  return (
    <>
      <WallHeader
        eyebrow="Countries"
        title="Country Coverage"
        description="Live country-level rollup of franchises, licenses, territories and billed revenue."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Countries Live" value={rows.length || undefined} loading={isLoading} />
          <Stat label="Franchises" value={(franchises.data ?? []).length || undefined} loading={isLoading} />
          <Stat label="Licenses" tone="info" value={(licenses.data ?? []).length || undefined} loading={isLoading} />
          <Stat label="Billed Revenue" tone="success" value={totalRevenue ? money(totalRevenue) : undefined} loading={isLoading} />
          <Stat label="Top Country" value={top?.country} hint={top ? money(top.revenue) : undefined} loading={isLoading} />
        </div>

        <Section title="Country Rollup">
          <div className="space-y-3">
            <Toolbar
              search={search}
              onSearch={setSearch}
              searchPlaceholder="Search country…"
              right={
                <ExportMenu<CountryRow>
                  filename="countries"
                  rows={filtered}
                  sheetName="Countries"
                  permission="franchise.read"
                />
              }
            />
            <EnterpriseTable<CountryRow>
              columns={columns}
              rows={filtered}
              loading={isLoading}
              error={error ? "Failed to load country data" : null}
              emptyTitle="No country data"
              emptyDescription="Countries appear here as soon as franchises, licenses or invoices exist."
            />
          </div>
        </Section>
      </WallBody>
    </>
  );
}
