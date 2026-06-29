// Centralised data hooks. Wire these to Lovable Cloud (createServerFn +
// useSuspenseQuery) when the backend is enabled — UI does not change.

import { useQuery } from "@tanstack/react-query";
import type {
  ApplicationStage,
  FranchiseStatus,
  FranchiseTier,
  RiskLevel,
} from "./franchise-domain";

export type Application = {
  id: string;
  applicantName: string;
  company: string;
  country: string;
  state: string;
  city: string;
  stage: ApplicationStage;
  reviewer: string | null;
  kycVerified: boolean;
  paymentVerified: boolean;
  submittedAt: string;
};

export type Franchise = {
  id: string;
  code: string;
  company: string;
  owner: string;
  country: string;
  state: string;
  city: string;
  tier: FranchiseTier;
  status: FranchiseStatus;
  commissionPct: number;
  productsAssigned: number;
  licenses: number;
  revenueMtd: number;
  healthScore: number;
  riskLevel: RiskLevel;
};

export type Territory = {
  id: string;
  region: string;
  country: string;
  state: string;
  city: string;
  assignedTo: string | null;
  population: number;
  marketSize: number;
  locked: boolean;
};

export type LicenseStatus =
  | "active"
  | "suspended"
  | "expiring"
  | "expired"
  | "revoked"
  | "pending";

export type LicensePlan = "starter" | "growth" | "scale" | "enterprise";

export type License = {
  id: string;
  key: string;
  franchiseId: string;
  franchise: string;
  plan: LicensePlan;
  devices: number;
  devicesMax: number;
  domains: number;
  domainsMax: number;
  issuedAt: string;
  expiresAt: string;
  status: LicenseStatus;
  kycVerified: boolean;
  complianceCleared: boolean;
};

export type CommissionStatus =
  | "draft"
  | "pending"
  | "approved"
  | "paid"
  | "held"
  | "rejected";

export type CommissionRule = {
  id: string;
  name: string;
  scope: "global" | "country" | "tier" | "franchise";
  scopeValue: string | null;
  basis: "revenue" | "license" | "renewal" | "product";
  ratePct: number;
  minPayout: number;
  active: boolean;
  updatedAt: string;
};

export type Commission = {
  id: string;
  cycle: string;
  franchiseId: string;
  franchise: string;
  base: number;
  ratePct: number;
  adjustment: number;
  tax: number;
  payable: number;
  status: CommissionStatus;
  approver: string | null;
};

export type RevenueStream =
  | "royalty"
  | "subscription"
  | "license"
  | "renewal"
  | "product";

export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue" | "void";

export type Invoice = {
  id: string;
  number: string;
  franchiseId: string;
  franchise: string;
  type: RevenueStream;
  amount: number;
  tax: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  country: string;
};

export type RevenueKpis = {
  mtd: number;
  qtd: number;
  ytd: number;
  royalty: number;
  subscription: number;
  license: number;
  renewal: number;
  pending: number;
  tax: number;
};

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  meta?: string;
};

// Generic empty responder. Replace queryFn with real server fn calls.
// e.g. queryFn: () => useServerFn(getApplications)({ data: params })
function emptyResource<T>(key: string) {
  return useQuery<T[]>({
    queryKey: [key],
    queryFn: async () => [],
    staleTime: Infinity,
  });
}

export const useApplications = () => emptyResource<Application>("applications");
export const useFranchises = () => emptyResource<Franchise>("franchises");
export const useTerritories = () => emptyResource<Territory>("territories");

export const useLicenses = () => emptyResource<License>("licenses");
export const useCommissionRules = () => emptyResource<CommissionRule>("commission-rules");
export const useCommissions = () => emptyResource<Commission>("commissions");
export const useInvoices = () => emptyResource<Invoice>("invoices");

export const useRevenueKpis = () =>
  useQuery<RevenueKpis | null>({
    queryKey: ["revenue-kpis"],
    queryFn: async () => null,
    staleTime: Infinity,
  });

export const useAuditTrail = (scope: string, targetId?: string) =>
  useQuery<AuditEntry[]>({
    queryKey: ["audit", scope, targetId ?? "*"],
    queryFn: async () => [],
    staleTime: Infinity,
  });
