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

// Generic empty responder. Replace queryFn with real server fn calls.
// e.g. queryFn: () => useServerFn(getApplications)({ data: params })
function emptyResource<T>(_key: string) {
  return useQuery<T[]>({
    queryKey: [_key],
    queryFn: async () => [],
    // Until backend is wired we don't actively refetch.
    staleTime: Infinity,
  });
}

export const useApplications = () => emptyResource<Application>("applications");
export const useFranchises = () => emptyResource<Franchise>("franchises");
export const useTerritories = () => emptyResource<Territory>("territories");
