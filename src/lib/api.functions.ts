import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Read endpoints — one per wall resource.
// ---------------------------------------------------------------------------

export const listFranchises = createServerFn({ method: "GET" }).handler(async () => {
  const { panelClient } = await import("./api.server");
  const { data, error } = await panelClient()
    .from("franchises")
    .select("*")
    .order("company");
  if (error) throw new Error(error.message);
  return (data ?? []).map((f) => ({
    id: f.id,
    code: f.code,
    company: f.company,
    owner: f.owner,
    country: f.country,
    state: f.state,
    city: f.city,
    tier: f.tier,
    status: f.status,
    commissionPct: Number(f.commission_pct),
    productsAssigned: f.products_assigned,
    licenses: f.licenses,
    revenueMtd: Number(f.revenue_mtd),
    healthScore: f.health_score,
    riskLevel: f.risk_level,
  }));
});

export const listApplications = createServerFn({ method: "GET" }).handler(async () => {
  const { panelClient } = await import("./api.server");
  const { data, error } = await panelClient()
    .from("applications")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((a) => ({
    id: a.id,
    applicantName: a.applicant_name,
    company: a.company,
    country: a.country,
    state: a.state,
    city: a.city,
    stage: a.stage,
    reviewer: a.reviewer,
    kycVerified: a.kyc_verified,
    paymentVerified: a.payment_verified,
    submittedAt: a.submitted_at,
  }));
});

export const listTerritories = createServerFn({ method: "GET" }).handler(async () => {
  const { panelClient } = await import("./api.server");
  const { data, error } = await panelClient()
    .from("territories")
    .select("*")
    .order("population", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((t) => ({
    id: t.id,
    region: t.region,
    country: t.country,
    state: t.state,
    city: t.city,
    assignedTo: t.assigned_to,
    population: Number(t.population),
    marketSize: Number(t.market_size),
    locked: t.locked,
  }));
});

export const listLeads = createServerFn({ method: "GET" }).handler(async () => {
  const { panelClient } = await import("./api.server");
  const { data, error } = await panelClient()
    .from("leads")
    .select("*")
    .order("score", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    company: l.company,
    country: l.country,
    source: l.source,
    stage: l.stage,
    owner: l.owner,
    score: l.score,
    nextAction: l.next_action,
    createdAt: l.created_at,
  }));
});

export const listLicenses = createServerFn({ method: "GET" }).handler(async () => {
  const { panelClient } = await import("./api.server");
  const { data, error } = await panelClient()
    .from("licenses")
    .select("*")
    .order("issued_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((l) => ({
    id: l.id,
    key: l.key,
    franchiseId: l.franchise_id ?? "",
    franchise: l.franchise,
    plan: l.plan,
    devices: l.devices,
    devicesMax: l.devices_max,
    domains: l.domains,
    domainsMax: l.domains_max,
    issuedAt: l.issued_at,
    expiresAt: l.expires_at,
    status: l.status,
    kycVerified: l.kyc_verified,
    complianceCleared: l.compliance_cleared,
  }));
});

export const listCommissionRules = createServerFn({ method: "GET" }).handler(async () => {
  const { panelClient } = await import("./api.server");
  const { data, error } = await panelClient()
    .from("commission_rules")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    scope: r.scope,
    scopeValue: r.scope_value,
    basis: r.basis,
    ratePct: Number(r.rate_pct),
    minPayout: Number(r.min_payout),
    active: r.active,
    updatedAt: (r.updated_at ?? "").slice(0, 10),
  }));
});

export const listCommissions = createServerFn({ method: "GET" }).handler(async () => {
  const { panelClient } = await import("./api.server");
  const { data, error } = await panelClient()
    .from("commissions")
    .select("*")
    .order("cycle", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((c) => ({
    id: c.id,
    cycle: c.cycle,
    franchiseId: c.franchise_id ?? "",
    franchise: c.franchise,
    base: Number(c.base),
    ratePct: Number(c.rate_pct),
    adjustment: Number(c.adjustment),
    tax: Number(c.tax),
    payable: Number(c.payable),
    status: c.status,
    approver: c.approver,
  }));
});

export const listInvoices = createServerFn({ method: "GET" }).handler(async () => {
  const { panelClient } = await import("./api.server");
  const { data, error } = await panelClient()
    .from("invoices")
    .select("*")
    .order("issued_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((i) => ({
    id: i.id,
    number: i.number,
    franchiseId: i.franchise_id ?? "",
    franchise: i.franchise,
    type: i.type,
    amount: Number(i.amount),
    tax: Number(i.tax),
    status: i.status,
    issuedAt: i.issued_at,
    dueAt: i.due_at,
    country: i.country,
  }));
});

export const getRevenueKpis = createServerFn({ method: "GET" }).handler(async () => {
  const { panelClient } = await import("./api.server");
  const { data, error } = await panelClient().from("invoices").select("*");
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const sum = (f: (r: (typeof rows)[number]) => boolean) =>
    rows.filter(f).reduce((a, r) => a + Number(r.amount), 0);
  const d = (r: (typeof rows)[number]) => new Date(r.issued_at);
  return {
    mtd: sum((r) => d(r).getFullYear() === year && d(r).getMonth() === month),
    qtd: sum(
      (r) =>
        d(r).getFullYear() === year &&
        Math.floor(d(r).getMonth() / 3) === Math.floor(month / 3),
    ),
    ytd: sum((r) => d(r).getFullYear() === year),
    royalty: sum((r) => r.type === "royalty"),
    subscription: sum((r) => r.type === "subscription"),
    license: sum((r) => r.type === "license"),
    renewal: sum((r) => r.type === "renewal"),
    pending: sum((r) => r.status === "issued" || r.status === "overdue"),
    tax: rows.reduce((a, r) => a + Number(r.tax), 0),
  };
});

export const listDocuments = createServerFn({ method: "GET" }).handler(async () => {
  const { panelClient } = await import("./api.server");
  const { data, error } = await panelClient()
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((doc) => ({
    id: doc.id,
    name: doc.name,
    category: doc.category,
    kind: doc.kind,
    franchise: doc.franchise,
    scope: doc.scope,
    targetId: doc.target_id,
    targetLabel: doc.target_label,
    size: doc.size,
    status: doc.status,
    uploadedAt: doc.uploaded_at,
  }));
});

export const listAudit = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ scope: z.string(), targetId: z.string().optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { panelClient } = await import("./api.server");
    let q = panelClient().from("audit_log").select("*").order("at", { ascending: false });
    if (data.scope !== "global") q = q.eq("scope", data.scope);
    if (data.targetId) q = q.eq("target", data.targetId);
    const { data: rows, error } = await q.limit(100);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id,
      at: r.at,
      actor: r.actor,
      action: r.action,
      target: r.target,
      meta: r.meta ?? undefined,
    }));
  });

// ---------------------------------------------------------------------------
// Write endpoints
// ---------------------------------------------------------------------------

export const writeAudit = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        actor: z.string().min(1).max(120),
        action: z.string().min(1).max(120),
        target: z.string().max(200).default(""),
        scope: z.string().max(60).default("global"),
        meta: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { panelClient } = await import("./api.server");
    const { error } = await panelClient().from("audit_log").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createLicense = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        key: z.string().min(4).max(64),
        franchiseId: z.string().uuid().nullable().optional(),
        franchise: z.string().max(200).default(""),
        plan: z.enum(["starter", "growth", "scale", "enterprise"]),
        devicesMax: z.number().int().min(1).max(10000),
        domainsMax: z.number().int().min(1).max(10000),
        expiresAt: z.string(),
        kycVerified: z.boolean().default(false),
        complianceCleared: z.boolean().default(false),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { panelClient } = await import("./api.server");
    const { data: row, error } = await panelClient()
      .from("licenses")
      .insert({
        key: data.key,
        franchise_id: data.franchiseId ?? null,
        franchise: data.franchise,
        plan: data.plan,
        devices_max: data.devicesMax,
        domains_max: data.domainsMax,
        expires_at: data.expiresAt,
        kyc_verified: data.kycVerified,
        compliance_cleared: data.complianceCleared,
        status: data.kycVerified && data.complianceCleared ? "active" : "pending",
      })
      .select("id, key")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const renewLicense = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), expiresAt: z.string() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { panelClient } = await import("./api.server");
    const { error } = await panelClient()
      .from("licenses")
      .update({ expires_at: data.expiresAt, status: "active" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveDocuments = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        documents: z
          .array(
            z.object({
              name: z.string().min(1).max(300),
              category: z.enum(["kyc", "compliance"]),
              kind: z.string().max(80).default("other"),
              franchise: z.string().max(200).nullable().optional(),
              scope: z.string().max(40).default("license"),
              targetId: z.string().max(120).default(""),
              targetLabel: z.string().max(120).default(""),
              size: z.number().int().min(0).max(50_000_000).default(0),
            }),
          )
          .min(1)
          .max(50),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { panelClient } = await import("./api.server");
    const { error } = await panelClient().from("documents").insert(
      data.documents.map((d) => ({
        name: d.name,
        category: d.category,
        kind: d.kind,
        franchise: d.franchise ?? null,
        scope: d.scope,
        target_id: d.targetId,
        target_label: d.targetLabel,
        size: d.size,
      })),
    );
    if (error) throw new Error(error.message);
    return { ok: true, count: data.documents.length };
  });

export const setCommissionStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        ids: z.array(z.string().uuid()).min(1).max(500),
        status: z.enum(["draft", "pending", "approved", "paid", "held", "rejected"]),
        approver: z.string().max(120).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { panelClient } = await import("./api.server");
    const { error } = await panelClient()
      .from("commissions")
      .update({ status: data.status, approver: data.approver ?? null })
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true, count: data.ids.length };
  });

export const upsertCommissionRule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(1).max(160),
        scope: z.enum(["global", "country", "tier", "franchise"]),
        scopeValue: z.string().max(120).nullable().optional(),
        basis: z.enum(["revenue", "license", "renewal", "product"]),
        ratePct: z.number().min(0).max(100),
        minPayout: z.number().min(0).max(10_000_000),
        active: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { panelClient } = await import("./api.server");
    const payload = {
      name: data.name,
      scope: data.scope,
      scope_value: data.scopeValue ?? null,
      basis: data.basis,
      rate_pct: data.ratePct,
      min_payout: data.minPayout,
      active: data.active,
    };
    const db = panelClient();
    const { error } = data.id
      ? await db.from("commission_rules").update(payload).eq("id", data.id)
      : await db.from("commission_rules").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
