import type { AuditEntry } from "@/lib/data-hooks";
import { Card } from "./Wall";
import { Activity, ArrowUpRight } from "lucide-react";

export function AuditTimeline({
  entries,
  loading,
  emptyHint = "Every action will be recorded here with actor, timestamp and target.",
  onOpen,
  isOpenable,
}: {
  entries: AuditEntry[];
  loading?: boolean;
  emptyHint?: string;
  /** Called when user clicks an entry whose target is openable. */
  onOpen?: (target: string) => void;
  /** Decides whether an entry's target is a clickable record id. */
  isOpenable?: (target: string) => boolean;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Activity className="h-3.5 w-3.5" /> Audit Timeline
      </div>
      {loading ? (
        <div className="mt-3 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-md"
              style={{ background: "color-mix(in oklab, var(--color-border) 50%, transparent)" }}
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-3 rounded-md border border-dashed border-border px-3 py-6 text-center text-[12px] text-muted-foreground">
          {emptyHint}
        </div>
      ) : (
        <ol className="mt-3 space-y-3">
          {entries.map((e) => {
            const openable = !!onOpen && !!e.target && (isOpenable ? isOpenable(e.target) : true);
            const Row = (
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] text-foreground">
                  <span className="font-medium">{e.actor}</span>{" "}
                  <span className="text-muted-foreground">{e.action}</span>{" "}
                  <span className="font-mono text-[11.5px]">{e.target}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {e.at}
                  {e.meta ? ` · ${e.meta}` : ""}
                </div>
              </div>
            );
            return (
              <li key={e.id} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {openable ? (
                  <button
                    type="button"
                    onClick={() => onOpen?.(e.target)}
                    className="group -mx-1 -my-1 flex flex-1 items-start gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-surface-2"
                    title="Open record"
                  >
                    {Row}
                    <ArrowUpRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ) : (
                  Row
                )}
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
