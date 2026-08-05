import type { ReactNode } from "react";
import { ArrowUpDown } from "lucide-react";
import { Pagination } from "./Toolbar";
import { Card } from "./Wall";

export type Column<T> = {
  id: string;
  header: string;
  width?: string;
  sortable?: boolean;
  cell: (row: T) => ReactNode;
};

export function EnterpriseTable<T extends { id: string }>({
  columns,
  rows,
  loading = false,
  error = null,
  emptyTitle = "No records yet",
  emptyDescription = "Connect the backend or adjust your filters to see results.",
  selectable = true,
  selected,
  onToggle,
  onToggleAll,
  sortBy,
  sortDir = "asc",
  onSort,
  onRowClick,
  pagination,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  selectable?: boolean;
  selected?: Set<string>;
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort?: (id: string) => void;
  onRowClick?: (row: T) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPage: (p: number) => void;
    onPageSize: (s: number) => void;
  };
}) {
  const allSelected =
    selectable && selected && rows.length > 0 && rows.every((r) => selected.has(r.id));

  const body = () => {
    if (loading) {
      return Array.from({ length: 6 }).map((_, i) => (
        <tr key={`s-${i}`} className="border-t border-border">
          {selectable && <td className="px-4 py-3"><Skel w="1rem" /></td>}
          {columns.map((c) => (
            <td key={c.id} className="px-4 py-3"><Skel /></td>
          ))}
        </tr>
      ));
    }
    if (error) {
      return (
        <tr>
          <td
            colSpan={columns.length + (selectable ? 1 : 0)}
            className="px-4 py-14 text-center"
          >
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[color:color-mix(in_oklab,var(--destructive)_12%,transparent)] text-destructive">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="mt-3 text-[13px] font-medium text-destructive">Couldn’t load records</div>
            <div className="mx-auto mt-1 max-w-md text-[12px] text-muted-foreground">{error}</div>
          </td>
        </tr>
      );
    }
    if (rows.length === 0) {
      return (
        <tr>
          <td
            colSpan={columns.length + (selectable ? 1 : 0)}
            className="px-4 py-16 text-center"
          >
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-dashed border-border-strong text-muted-foreground">
              <Inbox className="h-4 w-4" />
            </div>
            <div className="mt-3 text-[13px] font-medium text-foreground">{emptyTitle}</div>
            <div className="mx-auto mt-1 max-w-md text-[12px] text-muted-foreground">
              {emptyDescription}
            </div>
          </td>
        </tr>
      );
    }

    return rows.map((r) => (
      <tr
        key={r.id}
        tabIndex={onRowClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (!onRowClick) return;
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRowClick(r); }
        }}
        onClick={() => onRowClick?.(r)}
        aria-selected={selected?.has(r.id) ?? undefined}
        className={`border-t border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--color-ring)] ${
          selected?.has(r.id) ? "bg-accent/40" : "hover:bg-surface-2"
        } ${onRowClick ? "cursor-pointer" : ""}`}
      >
        {selectable && (
          <td className="w-9 px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selected?.has(r.id) ?? false}
              onChange={() => onToggle?.(r.id)}
              aria-label={`Select row ${r.id}`}
              className="h-3.5 w-3.5 accent-[color:var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
            />
          </td>
        )}
        {columns.map((c) => (
          <td key={c.id} className="px-4 py-2.5 text-[12.5px] text-foreground">
            {c.cell(r)}
          </td>
        ))}
      </tr>
    ));

  };

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {selectable && (
                <th className="w-9 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={!!allSelected}
                    onChange={() => onToggleAll?.()}
                    className="h-3.5 w-3.5 accent-[color:var(--color-primary)]"
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.id}
                  style={c.width ? { width: c.width } : undefined}
                  className="whitespace-nowrap px-4 py-2.5 font-medium"
                >
                  {c.sortable && onSort ? (
                    <button
                      onClick={() => onSort(c.id)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {c.header}
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                      {sortBy === c.id && (
                        <span className="text-[10px]">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{body()}</tbody>
        </table>
      </div>
      {pagination && <Pagination {...pagination} />}
    </Card>
  );
}

function Skel({ w = "70%" }: { w?: string }) {
  return (
    <span
      className="block h-3 animate-pulse rounded bg-surface-2"
      style={{ width: w, background: "color-mix(in oklab, var(--color-border) 60%, transparent)" }}
    />
  );
}
