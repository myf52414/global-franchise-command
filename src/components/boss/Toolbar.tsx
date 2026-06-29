import type { ReactNode } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export type FilterChip = { id: string; label: string };

export function Toolbar({
  search,
  onSearch,
  searchPlaceholder = "Search…",
  filters,
  onClearFilters,
  right,
  selectedCount = 0,
  bulkActions,
}: {
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterChip[];
  onClearFilters?: () => void;
  right?: ReactNode;
  selectedCount?: number;
  bulkActions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-2">
      <div className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-full flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground"
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.map((f) => (
            <span
              key={f.id}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-1 text-[11.5px] text-foreground"
            >
              {f.label}
            </span>
          ))}
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="text-[11.5px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {selectedCount > 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-[12px] text-foreground">
            <span className="font-medium">{selectedCount} selected</span>
            {bulkActions}
          </div>
        ) : (
          right
        )}
      </div>
    </div>
  );
}

export function FilterDropdown({
  label,
  active,
  children,
}: {
  label: string;
  active?: boolean;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[12px] font-medium transition-colors ${
        active
          ? "border-primary/40 bg-primary/5 text-foreground"
          : "border-border bg-surface text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      <ChevronDown className="h-3 w-3 opacity-70" />
      {children}
    </button>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
  onPageSize,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-2 px-4 py-2.5 text-[12px] text-muted-foreground">
      <div>
        Showing <span className="text-foreground">{start}</span>–
        <span className="text-foreground">{end}</span> of{" "}
        <span className="text-foreground">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5">
          Rows
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-7 rounded border border-border bg-surface px-1.5 text-[12px] text-foreground"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="h-7 rounded border border-border bg-surface px-2 text-[12px] text-foreground disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-1">
            <span className="text-foreground">{page}</span> / {totalPages}
          </span>
          <button
            onClick={() => onPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="h-7 rounded border border-border bg-surface px-2 text-[12px] text-foreground disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
