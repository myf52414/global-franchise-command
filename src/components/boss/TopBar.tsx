import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { WALLS } from "@/lib/walls";
import { usePendingApprovals, type ApprovalRequest } from "@/lib/approvals";
import { useToast } from "@/lib/toast";
import { useSession } from "@/lib/session";
import {
  Bell,
  Check,
  ChevronDown,
  Command,
  Download,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  User2,
  Menu,
} from "lucide-react";

type MenuKey = "import" | "export" | "notifications" | "user" | null;

export function TopBar({ onOpenMenu }: { onOpenMenu?: () => void }) {

  const [query, setQuery] = useState("");
  
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menu, setMenu] = useState<MenuKey>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const pending = usePendingApprovals();
  const session = useSession();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

  const toggle = (k: MenuKey) => setMenu((m) => (m === k ? null : k));




  const notifications = useMemo(
    () =>
      pending.map((p: ApprovalRequest) => ({
        id: p.id,
        title: `${p.kind === "license.renew" ? "License renewal" : "Commission bulk edit"} awaiting approval`,
        description: `Requested by ${p.requestedBy}`,
        to: p.kind === "license.renew" ? "/license" : "/commission",
      })),
    [pending],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <button
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          onClick={onOpenMenu}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Link to="/dashboard" className="flex shrink-0 items-center gap-2 lg:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow font-bold text-primary-foreground">
            SV
          </span>
        </Link>

        <div className="hidden flex-1 items-center md:flex">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 w-56 items-center gap-2 rounded-full border border-border bg-surface px-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/50 lg:w-72 2xl:w-96"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">
              Search franchises, applications, licenses, users…
            </span>
            <span className="kbd hidden 2xl:inline-flex">⌘K</span>
          </button>
        </div>


        <div ref={menuRef} className="ml-auto flex items-center gap-1.5">
          {/* Import */}
          <div className="relative hidden lg:block">
            <IconBtn label="Import Center" active={menu === "import"} onClick={() => toggle("import")}>
              <Upload className="h-4 w-4" />
            </IconBtn>
            {menu === "import" && (
              <MenuPanel title="Import Center" hint="Bulk import data into Franchise Manager">
                {IMPORT_TARGETS.map((t) => (
                  <MenuRow
                    key={t.to}
                    label={t.label}
                    description={t.description}
                    onClick={() => {
                      setMenu(null);
                      navigate({ to: t.to });
                      toast({
                        title: `${t.label} · Import`,
                        description: "Open the wall's Import action to upload a CSV.",
                        tone: "info",
                      });
                    }}
                  />
                ))}
              </MenuPanel>
            )}
          </div>

          {/* Export */}
          <div className="relative hidden lg:block">
            <IconBtn label="Export Center" active={menu === "export"} onClick={() => toggle("export")}>
              <Download className="h-4 w-4" />
            </IconBtn>
            {menu === "export" && (
              <MenuPanel title="Export Center" hint="Jump to a wall to export CSV or Excel">
                {EXPORT_TARGETS.map((t) => (
                  <MenuRow
                    key={t.to}
                    label={t.label}
                    description={t.description}
                    onClick={() => {
                      setMenu(null);
                      navigate({ to: t.to });
                    }}
                  />
                ))}
              </MenuPanel>
            )}
          </div>

          {/* Command palette */}
          <div className="hidden lg:block"><IconBtn label="Command Palette (⌘K)" onClick={() => setPaletteOpen(true)}>
            <Command className="h-4 w-4" />
          </IconBtn></div>

          {/* Notifications */}
          <div className="relative">
            <IconBtn label="Notifications" active={menu === "notifications"} onClick={() => toggle("notifications")}>
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-destructive px-1 text-[9px] font-semibold leading-none text-destructive-foreground">
                  {notifications.length}
                </span>
              )}
            </IconBtn>
            {menu === "notifications" && (
              <MenuPanel
                title="Notifications"
                hint={
                  notifications.length === 0
                    ? "You're all caught up."
                    : `${notifications.length} pending approval${notifications.length === 1 ? "" : "s"}`
                }
              >
                {notifications.length === 0 ? (
                  <div className="px-3 py-6 text-center text-[12px] text-muted-foreground">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <MenuRow
                      key={n.id}
                      label={n.title}
                      description={n.description}
                      icon={<ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                      onClick={() => {
                        setMenu(null);
                        navigate({ to: n.to });
                      }}
                    />
                  ))
                )}
              </MenuPanel>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => toggle("user")}
              className="group ml-1 flex h-10 shrink-0 items-center gap-2.5 rounded-full border border-border bg-surface py-1 pl-1 pr-2 shadow-sm transition-all duration-200 hover:border-primary/40 sm:pr-3"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menu === "user"}
            >
              <span className="relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-accent-pink via-primary to-primary-glow text-[11px] font-bold text-primary-foreground ring-1 ring-primary-foreground/10">
                SV
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent-emerald ring-2 ring-background" />
              </span>
              <div className="hidden leading-tight sm:block">
                <div className="max-w-[120px] truncate text-[12px] font-semibold text-foreground">{session.name}</div>
                <div className="mt-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-primary">{session.role}</div>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${menu === "user" ? "rotate-180" : ""}`}
              />
            </button>
            {menu === "user" && (
              <MenuPanel
                title={session.name}
                hint={`${session.permissions.length} permissions · ${session.role}`}
                align="right"
              >
                <MenuRow
                  label="Settings"
                  description="Roles, permissions, integrations"
                  icon={<Settings className="h-3.5 w-3.5" />}
                  onClick={() => {
                    setMenu(null);
                    navigate({ to: "/settings" });
                  }}
                />
                <MenuRow
                  label="Sign out"
                  description="End this session"
                  icon={<LogOut className="h-3.5 w-3.5" />}
                  onClick={() => {
                    setMenu(null);
                    toast({
                      title: "Sign out",
                      description: "Connect Lovable Cloud auth to enable sign out.",
                      tone: "info",
                    });
                  }}
                />
              </MenuPanel>
            )}
          </div>
        </div>
      </div>




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
                    onClick={() => {
                      setPaletteOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <span>{w.label}</span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      {currentPath === w.to && <Check className="h-3 w-3" />}
                      Wall
                    </span>
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

const EXPORT_TARGETS = [
  { to: "/revenue", label: "Revenue", description: "Invoices, royalty, subscription, renewals" },
  { to: "/commission", label: "Commission", description: "Rules and ledger" },
  { to: "/license", label: "License", description: "Inventory, renewals, KYC status" },
  { to: "/directory", label: "Franchise Directory", description: "All active franchises" },
  { to: "/applications", label: "Applications", description: "Pipeline and status" },
] as const;

const IMPORT_TARGETS = [
  { to: "/directory", label: "Franchise Directory", description: "Bulk upload franchises" },
  { to: "/applications", label: "Applications", description: "Import lead pipeline" },
  { to: "/products", label: "Products", description: "Catalog and SKUs" },
  { to: "/users", label: "Users", description: "Team members and roles" },
] as const;

function IconBtn({
  children,
  label,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={active}
      onClick={onClick}
      className={`relative grid h-9 w-9 place-items-center rounded-full border text-muted-foreground transition-colors hover:border-border hover:bg-surface-2 hover:text-foreground ${
        active ? "border-border bg-surface-2 text-foreground" : "border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

function MenuPanel({
  title,
  hint,
  align = "right",
  children,
}: {
  title: string;
  hint?: string;
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <div
      role="menu"
      className={`absolute z-50 mt-1 w-72 overflow-hidden rounded-md border border-border bg-popover shadow-xl ${
        align === "right" ? "right-0" : "left-0"
      }`}
    >
      <div className="border-b border-border px-3 py-2">
        <div className="text-[12.5px] font-semibold text-popover-foreground">{title}</div>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      <div className="max-h-80 overflow-y-auto p-1">{children}</div>
    </div>
  );
}

function MenuRow({
  label,
  description,
  icon,
  onClick,
}: {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-[12.5px] text-popover-foreground hover:bg-surface-2"
    >
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[11px] text-muted-foreground">{description}</span>
        )}
      </span>
    </button>
  );
}
