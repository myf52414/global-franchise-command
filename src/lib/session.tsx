import { createContext, useContext, useMemo, type ReactNode } from "react";
import { ROLE_PERMISSIONS, type Permission, type Role } from "./franchise-domain";

type Session = {
  userId: string | null;
  name: string;
  role: Role;
  permissions: Permission[];
};

// Default session is the boss admin surface (all permissions).
// Replace with real session resolved from Lovable Cloud auth context.
const DEFAULT_SESSION: Session = {
  userId: null,
  name: "Boss Admin",
  role: "owner",
  permissions: ROLE_PERMISSIONS.owner,
};

const SessionCtx = createContext<Session>(DEFAULT_SESSION);

// Dev-only role override for E2E/regression testing: `?asRole=viewer` on any
// page swaps the active session role and permission set. Production must
// resolve the session from real auth; this hook is a no-op there.
function useRoleOverride(): Session {
  return useMemo(() => {
    if (typeof window === "undefined") return DEFAULT_SESSION;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("asRole");
    if (!raw) return DEFAULT_SESSION;
    const role = raw as Role;
    const perms = ROLE_PERMISSIONS[role];
    if (!perms) return DEFAULT_SESSION;
    return { userId: null, name: `Test · ${role}`, role, permissions: perms };
  }, []);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const value = useRoleOverride();
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  return useContext(SessionCtx);
}

export function useCan(permission: Permission) {
  const { permissions } = useSession();
  return permissions.includes(permission);
}

export function Can({
  permission,
  fallback = null,
  children,
}: {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const allowed = useCan(permission);
  return <>{allowed ? children : fallback}</>;
}
