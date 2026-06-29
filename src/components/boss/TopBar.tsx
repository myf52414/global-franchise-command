import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { WALLS } from "@/lib/walls";
import { Bell, Command, Download, Search, Upload, User2 } from "lucide-react";

export function TopBar() {
  const [query, setQuery] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      {/* Brand row */}
      <div className="flex h-14 items-center gap-4 px-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-[11px] font-bold tracking-tight">
            SV
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-foreground">Software Vala</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Boss Panel · Franchise Manager
            </div>
          </div>
        </Link>

        <div className="ml-6 hidden flex-1 items-center md:flex">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 w-full max-w-xl items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-left text-sm text-muted-foreground hover:border-border-strong"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 truncate">
              Search franchises, applications, licenses, users…
            </span>
            <span className="kbd">⌘</span>
            <span className="kbd">K</span>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <IconBtn label="Import"><Upload className="h-4 w-4" /></IconBtn>
          <IconBtn label="Export"><Download className="h-4 w-4" /></IconBtn>
          <IconBtn label="Command"><Command className="h-4 w-4" /></IconBtn>
          <IconBtn label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
          </IconBtn>
          <div className="ml-2 flex h-9 items-center gap-2 rounded-md border border-border bg-surface-2 pl-1 pr-3">
            <div className="grid h-7 w-7 place-items-center rounded bg-primary/10 text-primary">
              <User2 className="h-3.5 w-3.5" />
            </div>
            <div className="leading-tight">
              <div className="text-[12px] font-medium text-foreground">Boss Admin</div>
              <div className="text-[10px] text-muted-foreground">Global · Owner</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wall tabs */}
      <nav className="relative border-t border-border">
        <div
          ref={scrollerRef}
          className="flex overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {WALLS.map((w) => (
            <Link
              key={w.to}
              to={w.to}
              activeProps={{
                className:
                  "text-foreground border-primary",
              }}
              inactiveProps={{
                className:
                  "text-muted-foreground border-transparent hover:text-foreground",
              }}
              className="whitespace-nowrap border-b-2 px-3 py-2.5 text-[12.5px] font-medium transition-colors"
            >
              {w.label}
            </Link>
          ))}
        </div>
      </nav>

      {paletteOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mx-auto mt-24 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to wall, franchise, license, user…"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <span className="kbd">esc</span>
            </div>
            <ul className="max-h-80 overflow-y-auto p-1">
              {WALLS.filter((w) =>
                w.label.toLowerCase().includes(query.toLowerCase()),
              ).map((w) => (
                <li key={w.to}>
                  <Link
                    to={w.to}
                    onClick={() => setPaletteOpen(false)}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <span>{w.label}</span>
                    <span className="text-[11px] text-muted-foreground">Wall</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}

function IconBtn({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      title={label}
      aria-label={label}
      className="relative grid h-9 w-9 place-items-center rounded-md border border-transparent text-muted-foreground hover:border-border hover:bg-surface-2 hover:text-foreground"
    >
      {children}
    </button>
  );
}
