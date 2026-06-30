import * as XLSX from "xlsx";

export type ExportColumn<T> = { key: keyof T | string; label: string };

export function exportCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  headers?: ExportColumn<T>[],
) {
  const cols = headers ?? (rows[0] ? Object.keys(rows[0]).map((k) => ({ key: k, label: k })) : []);
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = cols.map((c) => escape(c.label)).join(",");
  const body = rows
    .map((r) => cols.map((c) => escape((r as Record<string, unknown>)[c.key as string])).join(","))
    .join("\n");
  download(new Blob([head + "\n" + body], { type: "text/csv;charset=utf-8" }), filename);
}

export function exportXlsx<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  headers?: ExportColumn<T>[],
  sheetName = "Sheet1",
) {
  const cols = headers ?? (rows[0] ? Object.keys(rows[0]).map((k) => ({ key: k, label: k })) : []);
  const data = rows.map((r) => {
    const o: Record<string, unknown> = {};
    for (const c of cols) o[c.label] = (r as Record<string, unknown>)[c.key as string];
    return o;
  });
  const ws = XLSX.utils.json_to_sheet(data, { header: cols.map((c) => c.label) });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  download(
    new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    filename,
  );
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const fmtMoney = (n: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export const fmtNumber = (n: number) => new Intl.NumberFormat().format(n);

export const fmtPct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;
