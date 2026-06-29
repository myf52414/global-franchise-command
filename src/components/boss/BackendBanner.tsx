import { Database } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function BackendBanner() {
  return (
    <div className="mx-6 mt-4 flex items-start gap-3 rounded-lg border border-[color:color-mix(in_oklab,var(--color-info)_30%,transparent)] bg-[color:color-mix(in_oklab,var(--color-info)_8%,transparent)] px-4 py-3 text-[12.5px] text-foreground">
      <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-md bg-[color:color-mix(in_oklab,var(--color-info)_14%,transparent)] text-[color:var(--color-info)]">
        <Database className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-foreground">
          Backend not connected
        </div>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          All walls are wired with real query hooks, RBAC, validation and audit timelines.
          Connect Lovable Cloud to populate the franchise database, applications, licenses, revenue and audit log.
        </p>
      </div>
      <Link
        to="/settings"
        className="shrink-0 rounded-md border border-border bg-surface px-2.5 py-1 text-[11.5px] font-medium text-foreground hover:bg-surface-2"
      >
        Open Settings
      </Link>
    </div>
  );
}
