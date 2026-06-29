// Universal status / role / permission primitives.
// All values are exhaustive unions so the UI never silently drifts from the DB.

export type FranchiseStatus =
  | "active"
  | "pending"
  | "onboarding"
  | "suspended"
  | "cancelled"
  | "terminated";

export type ApplicationStage =
  | "submitted"
  | "reviewer_assigned"
  | "background_verification"
  | "kyc"
  | "document_verification"
  | "interview"
  | "agreement"
  | "digital_signature"
  | "payment_verification"
  | "approved"
  | "rejected";

export type FranchiseTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type Role =
  | "owner"
  | "global_admin"
  | "regional_admin"
  | "country_manager"
  | "approver"
  | "finance"
  | "support"
  | "viewer";

export type Permission =
  | "franchise.read"
  | "franchise.write"
  | "franchise.suspend"
  | "application.review"
  | "application.approve"
  | "application.reject"
  | "territory.assign"
  | "territory.transfer"
  | "license.generate"
  | "license.revoke"
  | "revenue.read"
  | "commission.read"
  | "commission.approve"
  | "user.invite"
  | "user.manage"
  | "settings.manage";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    "franchise.read","franchise.write","franchise.suspend",
    "application.review","application.approve","application.reject",
    "territory.assign","territory.transfer",
    "license.generate","license.revoke",
    "revenue.read","commission.read","commission.approve",
    "user.invite","user.manage","settings.manage",
  ],
  global_admin: [
    "franchise.read","franchise.write","franchise.suspend",
    "application.review","application.approve","application.reject",
    "territory.assign","territory.transfer",
    "license.generate","license.revoke",
    "revenue.read","commission.read","commission.approve",
    "user.invite","user.manage",
  ],
  regional_admin: [
    "franchise.read","franchise.write",
    "application.review","application.approve",
    "territory.assign",
    "license.generate",
    "revenue.read","commission.read",
  ],
  country_manager: [
    "franchise.read","application.review","territory.assign","revenue.read",
  ],
  approver: ["application.review","application.approve","application.reject"],
  finance: ["revenue.read","commission.read","commission.approve"],
  support: ["franchise.read"],
  viewer: ["franchise.read","revenue.read"],
};

export const STATUS_TONE: Record<
  string,
  "success" | "warning" | "destructive" | "info" | "neutral"
> = {
  active: "success",
  pending: "warning",
  onboarding: "info",
  suspended: "destructive",
  cancelled: "neutral",
  terminated: "destructive",
  submitted: "neutral",
  reviewer_assigned: "info",
  background_verification: "info",
  kyc: "warning",
  document_verification: "warning",
  interview: "info",
  agreement: "info",
  digital_signature: "info",
  payment_verification: "warning",
  approved: "success",
  rejected: "destructive",
  // License statuses
  expiring: "warning",
  expired: "destructive",
  revoked: "destructive",
  // Commission / invoice statuses
  draft: "neutral",
  paid: "success",
  held: "warning",
  issued: "info",
  overdue: "destructive",
  void: "neutral",
};

export const STAGE_LABEL: Record<ApplicationStage, string> = {
  submitted: "Submitted",
  reviewer_assigned: "Reviewer Assigned",
  background_verification: "Background Verification",
  kyc: "KYC",
  document_verification: "Document Verification",
  interview: "Interview",
  agreement: "Agreement",
  digital_signature: "Digital Signature",
  payment_verification: "Payment Verification",
  approved: "Approved",
  rejected: "Rejected",
};

export const APPLICATION_PIPELINE: ApplicationStage[] = [
  "submitted",
  "reviewer_assigned",
  "background_verification",
  "kyc",
  "document_verification",
  "interview",
  "agreement",
  "digital_signature",
  "payment_verification",
  "approved",
];
