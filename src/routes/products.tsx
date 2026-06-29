import { createFileRoute } from "@tanstack/react-router";
import { DataTable, PillRow, Section, Stat, WallBody, WallHeader } from "@/components/boss/Wall";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Product Assignment · Boss Panel" }] }),
  component: ProductsWall,
});

function ProductsWall() {
  return (
    <>
      <WallHeader
        eyebrow="Products"
        title="Product Assignment"
        description="Assign products, categories, pricing and regional rules to franchises."
      />
      <WallBody>
        <div className="wall-grid">
          <Stat label="Total Products" />
          <Stat label="Assigned" />
          <Stat label="Regional Rules" />
          <Stat label="Discount Rules" />
        </div>

        <Section title="Catalog Types">
          <PillRow items={["Digital","Offline","SaaS","Marketplace"]} />
        </Section>

        <Section title="Assignments">
          <DataTable
            caption="0 assignments"
            columns={["Product","Category","Franchise","Region","Price","Discount","Stock","Type","Status"]}
          />
        </Section>
      </WallBody>
    </>
  );
}
