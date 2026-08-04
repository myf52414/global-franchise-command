import { Database } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function BackendBanner() {
  return (
    <div className="mx-auto mt-4 grid w-[calc(100%-2rem)] max-w-[1536px] grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-2xl border border-[color:color-mix(in_oklab,var(--color-info)_30%,transparent)] bg-[color:color-mix(in_oklab,var(--color-info)_8%,transparent)] px-4 py-3 text-[12.5px] text-foreground sm:w-[calc(100%-3rem)] sm:grid-cols-[auto_minmax(0,1fr)_auto] lg:w-[calc(100%-4rem)]">
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
        className="col-start-2 w-fit shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-[11.5px] font-medium text-foreground hover:bg-surface-2 sm:col-start-3 sm:row-start-1"
      >
        Open Settings
      </Link>
    </div>
  );
}
