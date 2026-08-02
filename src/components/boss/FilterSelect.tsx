import { useId } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Labelled, accessible filter select. Visible label on desktop, always
 * announced to screen readers, clear focus ring and an active state so the
 * user can see which filters are applied.
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[] | string[];
  allLabel?: string;
  className?: string;
}) {
  const id = useId();
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const active = value !== "";

  return (
    <div className={`flex min-w-0 items-center gap-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="hidden shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground lg:block"
      >
        {label}
      </label>
      <span className="relative inline-flex">
        <select
          id={id}
          value={value}
          aria-label={`Filter by ${label}`}
          onChange={(e) => onChange(e.target.value)}
          className={`h-9 w-full min-w-[8.5rem] appearance-none rounded-md border bg-surface py-0 pl-2.5 pr-7 text-[12.5px] capitalize text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] ${
            active ? "border-primary/50 bg-accent/40 font-medium" : "border-border hover:bg-surface-2"
          }`}
        >
          <option value="">{allLabel ?? `All ${label.toLowerCase()}`}</option>
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </span>
    </div>
  );
}
