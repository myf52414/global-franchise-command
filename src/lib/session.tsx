import { createContext, useContext, useMemo, type ReactNode } from "react";
import { ROLE_PERMISSIONS, type Permission, type Role } from "./franchise-domain";

type Session = {
  userId: string | null;
  name: string;
  role: Role;
  permissions: Permission[];
};

// Default session is the unauthenticated viewer surface.
// Replace with real session resolved from Lovable Cloud auth context.
const DEFAULT_SESSION: Session = {
  userId: null,
  name: "Boss Admin",
  role: "owner",
  permissions: ROLE_PERMISSIONS.owner,
};

const SessionCtx = createContext<Session>(DEFAULT_SESSION);

export function SessionProvider({ children }: { children: ReactNode }) {
  // TODO: replace with real auth — useQuery(["session"], getSessionFn)
  const value = useMemo<Session>(() => DEFAULT_SESSION, []);
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
