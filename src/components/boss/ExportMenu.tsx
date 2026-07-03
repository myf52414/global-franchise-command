import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText, Loader2, Lock } from "lucide-react";
import { Btn } from "./Wall";
import { exportCsv, exportXlsx, type ExportColumn } from "@/lib/export";
import { useToast } from "@/lib/toast";
import { useCan } from "@/lib/session";
import type { Permission } from "@/lib/franchise-domain";

export type ExportFormat = "csv" | "xlsx";

export function ExportMenu<T extends Record<string, unknown>>({
  filename,
  rows,
  columns,
  label = "Export",
  disabled,
  sheetName,
  permission,
}: {
  filename: string;
  rows: T[] | (() => Promise<T[]> | T[]);
  columns?: ExportColumn<T>[];
  label?: string;
  disabled?: boolean;
  sheetName?: string;
  permission?: Permission;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const allowed = useCan(permission ?? "franchise.read");
  const gated = permission ? !allowed : false;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const run = async (fmt: ExportFormat) => {
    setOpen(false);
    setBusy(fmt);
    try {
      const data = typeof rows === "function" ? await rows() : rows;
      if (!data || data.length === 0) {
        toast({ title: "Nothing to export", description: "No rows match the current filters.", tone: "warning" });
        return;
      }
      const base = filename.replace(/\.(csv|xlsx)$/i, "");
      if (fmt === "csv") exportCsv(`${base}.csv`, data, columns);
      else exportXlsx(`${base}.xlsx`, data, columns, sheetName);
      toast({ title: "Export ready", description: `${data.length.toLocaleString()} rows · ${fmt.toUpperCase()}`, tone: "success" });
    } catch (err) {
      toast({
        title: "Export failed",
        description: err instanceof Error ? err.message : "Unknown error",
        tone: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div ref={ref} className="relative">
      <Btn variant="ghost" disabled={disabled || !!busy} onClick={() => setOpen((o) => !o)}>
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        {busy ? `Exporting ${busy.toUpperCase()}…` : label}
        <ChevronDown className="h-3 w-3" />
      </Btn>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1 w-44 overflow-hidden rounded-md border border-border bg-popover shadow-lg"
        >
          <MenuItem onClick={() => run("csv")} icon={<FileText className="h-3.5 w-3.5" />}>
            Export as CSV
          </MenuItem>
          <MenuItem onClick={() => run("xlsx")} icon={<FileSpreadsheet className="h-3.5 w-3.5" />}>
            Export as Excel
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({ children, icon, onClick }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-popover-foreground hover:bg-surface-2"
    >
      {icon}
      {children}
    </button>
  );
}
