// Centralised data hooks — wired to the real Lovable Cloud backend through
// the server-function API layer in src/lib/api.functions.ts.

import { useQuery } from "@tanstack/react-query";
import type {
  ApplicationStage,
  FranchiseStatus,
  FranchiseTier,
  RiskLevel,
} from "./franchise-domain";
import {
  getRevenueKpis,
  listApplications,
  listAudit,
  listCommissionRules,
  listCommissions,
  listDocuments,
  listFranchises,
  listInvoices,
  listLeads,
  listLicenses,
  listTerritories,
} from "./api.functions";

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

export type Lead = {
  id: string;
  name: string;
  company: string;
  country: string;
  source: string;
  stage: string;
  owner: string | null;
  score: number;
  nextAction: string | null;
  createdAt: string;
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

export type DocumentRecord = {
  id: string;
  name: string;
  category: "kyc" | "compliance";
  kind: string;
  franchise: string | null;
  scope: string;
  targetId: string;
  targetLabel: string;
  size: number;
  status: string;
  uploadedAt: string;
};

const STALE = 30_000;

export const useApplications = () =>
  useQuery<Application[]>({
    queryKey: ["applications"],
    queryFn: () => listApplications() as Promise<Application[]>,
    staleTime: STALE,
  });

export const useFranchises = () =>
  useQuery<Franchise[]>({
    queryKey: ["franchises"],
    queryFn: () => listFranchises() as Promise<Franchise[]>,
    staleTime: STALE,
  });

export const useTerritories = () =>
  useQuery<Territory[]>({
    queryKey: ["territories"],
    queryFn: () => listTerritories() as Promise<Territory[]>,
    staleTime: STALE,
  });

export const useLeads = () =>
  useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: () => listLeads() as Promise<Lead[]>,
    staleTime: STALE,
  });

export const useLicenses = () =>
  useQuery<License[]>({
    queryKey: ["licenses"],
    queryFn: () => listLicenses() as Promise<License[]>,
    staleTime: STALE,
  });

export const useCommissionRules = () =>
  useQuery<CommissionRule[]>({
    queryKey: ["commission-rules"],
    queryFn: () => listCommissionRules() as Promise<CommissionRule[]>,
    staleTime: STALE,
  });

export const useCommissions = () =>
  useQuery<Commission[]>({
    queryKey: ["commissions"],
    queryFn: () => listCommissions() as Promise<Commission[]>,
    staleTime: STALE,
  });

export const useInvoices = () =>
  useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: () => listInvoices() as Promise<Invoice[]>,
    staleTime: STALE,
  });

export const useDocumentRecords = () =>
  useQuery<DocumentRecord[]>({
    queryKey: ["documents"],
    queryFn: () => listDocuments() as Promise<DocumentRecord[]>,
    staleTime: STALE,
  });

export const useRevenueKpis = () =>
  useQuery<RevenueKpis | null>({
    queryKey: ["revenue-kpis"],
    queryFn: () => getRevenueKpis() as Promise<RevenueKpis>,
    staleTime: STALE,
  });

export const useAuditTrail = (scope: string, targetId?: string) =>
  useQuery<AuditEntry[]>({
    queryKey: ["audit", scope, targetId ?? "*"],
    queryFn: () =>
      listAudit({ data: { scope, targetId } }) as Promise<AuditEntry[]>,
    staleTime: STALE,
  });
