import { useId, type ReactNode } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

export type FilterChip = { id: string; label: string; onRemove?: () => void };

export function Toolbar({
  id,
  search,
  onSearch,
  searchPlaceholder = "Search…",
  searchLabel = "Search records",
  filters,
  onClearFilters,
  right,
  selectedCount = 0,
  bulkActions,
}: {
  id?: string;
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  filters?: FilterChip[];
  onClearFilters?: () => void;
  right?: ReactNode;
  selectedCount?: number;
  bulkActions?: ReactNode;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div
      role="search"
      className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-2 lg:flex-row lg:flex-wrap lg:items-center"
    >
      <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-[color:var(--color-ring)] lg:min-w-[240px]">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <label htmlFor={inputId} className="sr-only">
          {searchLabel}
        </label>
        <input
          id={inputId}
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-full min-w-0 flex-1 bg-transparent text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Active filters">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          {filters.map((f) => (
            <span
              key={f.id}
              className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-accent/50 px-2 py-1 text-[11.5px] font-medium capitalize text-foreground"
            >
              {f.label}
              {f.onRemove && (
                <button
                  type="button"
                  onClick={f.onRemove}
                  aria-label={`Remove filter ${f.label}`}
                  className="ml-0.5 rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="rounded px-1 text-[11.5px] text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
        {selectedCount > 0 && bulkActions ? (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-accent/50 px-2 py-1 text-[12px] text-foreground">
            <span className="font-medium tabular-nums">{selectedCount} selected</span>
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
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      {...rest}
      aria-pressed={active}
      className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] ${
        active
          ? "border-primary/40 bg-accent/50 text-foreground"
          : "border-border bg-surface text-muted-foreground hover:bg-surface-2 hover:text-foreground"
      }`}
    >
      {label}
      <ChevronDown className="h-3 w-3 opacity-70" aria-hidden="true" />
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
  const sizeId = useId();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const btn =
    "inline-flex h-9 min-w-11 items-center justify-center gap-1 rounded-md border border-border bg-surface px-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] disabled:pointer-events-none disabled:opacity-50";


  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-2 px-4 py-2.5 text-[12px] text-muted-foreground"
    >
      <div aria-live="polite">
        Showing <span className="font-medium text-foreground tabular-nums">{start}</span>–
        <span className="font-medium text-foreground tabular-nums">{end}</span> of{" "}
        <span className="font-medium text-foreground tabular-nums">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor={sizeId} className="flex items-center gap-1.5">
          Rows
          <select
            id={sizeId}
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-9 rounded-md border border-border bg-surface px-1.5 text-[12px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            aria-label="Previous page"
            className={btn}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Prev</span>
          </button>
          <span className="px-1 tabular-nums">
            <span className="font-medium text-foreground">{page}</span> / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            aria-label="Next page"
            className={btn}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

      </div>
    </nav>
  );
}
