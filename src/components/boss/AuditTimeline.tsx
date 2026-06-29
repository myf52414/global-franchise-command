import type { AuditEntry } from "@/lib/data-hooks";
import { Card } from "./Wall";
import { Activity } from "lucide-react";

export function AuditTimeline({
  entries,
  loading,
  emptyHint = "Every action will be recorded here with actor, timestamp and target.",
}: {
  entries: AuditEntry[];
  loading?: boolean;
  emptyHint?: string;
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
          {entries.map((e) => (
            <li key={e.id} className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0">
                <div className="text-[12.5px] text-foreground">
                  <span className="font-medium">{e.actor}</span>{" "}
                  <span className="text-muted-foreground">{e.action}</span>{" "}
                  <span className="font-mono text-[11.5px]">{e.target}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">{e.at}{e.meta ? ` · ${e.meta}` : ""}</div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
