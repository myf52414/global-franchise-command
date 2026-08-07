-- FRANCHISES
CREATE TABLE public.franchises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  company text NOT NULL,
  owner text NOT NULL,
  country text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  tier text NOT NULL DEFAULT 'bronze',
  status text NOT NULL DEFAULT 'pending',
  commission_pct numeric NOT NULL DEFAULT 0,
  products_assigned integer NOT NULL DEFAULT 0,
  licenses integer NOT NULL DEFAULT 0,
  revenue_mtd numeric NOT NULL DEFAULT 0,
  health_score integer NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.franchises TO anon, authenticated;
GRANT ALL ON public.franchises TO service_role;
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "panel_all_franchises" ON public.franchises FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- APPLICATIONS
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name text NOT NULL,
  company text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  stage text NOT NULL DEFAULT 'submitted',
  reviewer text,
  kyc_verified boolean NOT NULL DEFAULT false,
  payment_verified boolean NOT NULL DEFAULT false,
  submitted_at date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO anon, authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "panel_all_applications" ON public.applications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- TERRITORIES
CREATE TABLE public.territories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  assigned_to text,
  population bigint NOT NULL DEFAULT 0,
  market_size numeric NOT NULL DEFAULT 0,
  locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.territories TO anon, authenticated;
GRANT ALL ON public.territories TO service_role;
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "panel_all_territories" ON public.territories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- LEADS
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'website',
  stage text NOT NULL DEFAULT 'new',
  owner text,
  score integer NOT NULL DEFAULT 0,
  next_action text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "panel_all_leads" ON public.leads FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- LICENSES
CREATE TABLE public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  franchise_id uuid REFERENCES public.franchises(id) ON DELETE SET NULL,
  franchise text NOT NULL DEFAULT '',
  plan text NOT NULL DEFAULT 'starter',
  devices integer NOT NULL DEFAULT 0,
  devices_max integer NOT NULL DEFAULT 10,
  domains integer NOT NULL DEFAULT 0,
  domains_max integer NOT NULL DEFAULT 3,
  issued_at date NOT NULL DEFAULT current_date,
  expires_at date NOT NULL DEFAULT (current_date + 365),
  status text NOT NULL DEFAULT 'active',
  kyc_verified boolean NOT NULL DEFAULT false,
  compliance_cleared boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.licenses TO anon, authenticated;
GRANT ALL ON public.licenses TO service_role;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "panel_all_licenses" ON public.licenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- COMMISSION RULES
CREATE TABLE public.commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scope text NOT NULL DEFAULT 'global',
  scope_value text,
  basis text NOT NULL DEFAULT 'revenue',
  rate_pct numeric NOT NULL DEFAULT 0,
  min_payout numeric NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commission_rules TO anon, authenticated;
GRANT ALL ON public.commission_rules TO service_role;
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "panel_all_commission_rules" ON public.commission_rules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- COMMISSIONS
CREATE TABLE public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle text NOT NULL,
  franchise_id uuid REFERENCES public.franchises(id) ON DELETE SET NULL,
  franchise text NOT NULL DEFAULT '',
  base numeric NOT NULL DEFAULT 0,
  rate_pct numeric NOT NULL DEFAULT 0,
  adjustment numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  payable numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  approver text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commissions TO anon, authenticated;
GRANT ALL ON public.commissions TO service_role;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "panel_all_commissions" ON public.commissions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- INVOICES
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  franchise_id uuid REFERENCES public.franchises(id) ON DELETE SET NULL,
  franchise text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'royalty',
  amount numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'issued',
  issued_at date NOT NULL DEFAULT current_date,
  due_at date NOT NULL DEFAULT (current_date + 30),
  country text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO anon, authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "panel_all_invoices" ON public.invoices FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- DOCUMENTS
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'kyc',
  kind text NOT NULL DEFAULT 'other',
  franchise text,
  scope text NOT NULL DEFAULT 'license',
  target_id text NOT NULL DEFAULT '',
  target_label text NOT NULL DEFAULT '',
  size integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending_review',
  uploaded_at date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO anon, authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "panel_all_documents" ON public.documents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- AUDIT LOG
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  at timestamptz NOT NULL DEFAULT now(),
  actor text NOT NULL DEFAULT 'system',
  action text NOT NULL,
  target text NOT NULL DEFAULT '',
  scope text NOT NULL DEFAULT 'global',
  meta text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_log TO anon, authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "panel_all_audit_log" ON public.audit_log FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_licenses_franchise ON public.licenses(franchise_id);
CREATE INDEX idx_commissions_franchise ON public.commissions(franchise_id);
CREATE INDEX idx_invoices_franchise ON public.invoices(franchise_id);
CREATE INDEX idx_audit_scope ON public.audit_log(scope, target);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER t_franchises BEFORE UPDATE ON public.franchises FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_applications BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_territories BEFORE UPDATE ON public.territories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_leads BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_licenses BEFORE UPDATE ON public.licenses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_commission_rules BEFORE UPDATE ON public.commission_rules FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_commissions BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_invoices BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ STARTER DATA ============
INSERT INTO public.franchises (id, code, company, owner, country, state, city, tier, status, commission_pct, products_assigned, licenses, revenue_mtd, health_score, risk_level) VALUES
('11111111-1111-4111-8111-000000000001','SV-IN-MH-001','Vala Systems Mumbai','Rahul Mehta','India','Maharashtra','Mumbai','gold','active',12.5,14,6,845000,88,'low'),
('11111111-1111-4111-8111-000000000002','SV-IN-GJ-002','Vala Systems Ahmedabad','Priya Shah','India','Gujarat','Ahmedabad','silver','active',10,9,4,412000,74,'medium'),
('11111111-1111-4111-8111-000000000003','SV-AE-DU-003','Vala Gulf FZE','Omar Farid','UAE','Dubai','Dubai','platinum','active',15,21,11,1260000,92,'low'),
('11111111-1111-4111-8111-000000000004','SV-IN-KA-004','Vala Systems Bengaluru','Anita Rao','India','Karnataka','Bengaluru','gold','onboarding',12,7,2,168000,61,'medium'),
('11111111-1111-4111-8111-000000000005','SV-UK-LN-005','Vala UK Ltd','James Corden','United Kingdom','England','London','bronze','suspended',8,3,1,0,34,'high');

INSERT INTO public.applications (applicant_name, company, country, state, city, stage, reviewer, kyc_verified, payment_verified, submitted_at) VALUES
('Sneha Kulkarni','Kulkarni Retail','India','Maharashtra','Pune','document_verification','Rahul Mehta',true,false,current_date - 6),
('Vikram Singh','VS Technologies','India','Delhi','New Delhi','kyc','Anita Rao',false,false,current_date - 3),
('Fatima Al Nuaimi','Nuaimi Holdings','UAE','Abu Dhabi','Abu Dhabi','interview','Omar Farid',true,true,current_date - 12),
('Daniel Brooks','Brooks Digital','United Kingdom','England','Manchester','submitted',NULL,false,false,current_date - 1),
('Arjun Nair','Nair Softwares','India','Kerala','Kochi','approved','Rahul Mehta',true,true,current_date - 24);

INSERT INTO public.territories (region, country, state, city, assigned_to, population, market_size, locked) VALUES
('West India','India','Maharashtra','Mumbai','Vala Systems Mumbai',20411000,48000000,true),
('West India','India','Gujarat','Ahmedabad','Vala Systems Ahmedabad',8450000,17500000,true),
('South India','India','Karnataka','Bengaluru','Vala Systems Bengaluru',13600000,39000000,false),
('South India','India','Kerala','Kochi',NULL,2120000,6100000,false),
('Middle East','UAE','Dubai','Dubai','Vala Gulf FZE',3600000,52000000,true),
('Europe','United Kingdom','England','London','Vala UK Ltd',9540000,71000000,false),
('North India','India','Delhi','New Delhi',NULL,32900000,44000000,false);

INSERT INTO public.leads (name, company, country, source, stage, owner, score, next_action) VALUES
('Meera Joshi','Joshi Enterprises','India','website','qualified','Anita Rao',72,'Schedule discovery call'),
('Hassan Khan','Khan Trading','UAE','referral','in_discussion','Omar Farid',85,'Send franchise deck'),
('Lucy Palmer','Palmer Group','United Kingdom','event','new',NULL,41,'Assign owner'),
('Rohit Verma','Verma Infotech','India','ads','converted','Rahul Mehta',94,'Move to onboarding');

INSERT INTO public.licenses (key, franchise_id, franchise, plan, devices, devices_max, domains, domains_max, issued_at, expires_at, status, kyc_verified, compliance_cleared) VALUES
('SV-GLD-8F3A21','11111111-1111-4111-8111-000000000001','Vala Systems Mumbai','scale',24,50,4,10,current_date - 200, current_date + 165,'active',true,true),
('SV-SLV-2B9C44','11111111-1111-4111-8111-000000000002','Vala Systems Ahmedabad','growth',11,25,2,5,current_date - 310, current_date + 25,'expiring',true,true),
('SV-PLT-77DE10','11111111-1111-4111-8111-000000000003','Vala Gulf FZE','enterprise',63,100,9,25,current_date - 120, current_date + 245,'active',true,true),
('SV-GLD-51AC08','11111111-1111-4111-8111-000000000004','Vala Systems Bengaluru','starter',3,10,1,3,current_date - 20, current_date + 345,'pending',false,false),
('SV-BRZ-9917EF','11111111-1111-4111-8111-000000000005','Vala UK Ltd','starter',1,10,1,3,current_date - 400, current_date - 35,'expired',false,false);

INSERT INTO public.commission_rules (name, scope, scope_value, basis, rate_pct, min_payout, active) VALUES
('Global base royalty','global',NULL,'revenue',10,500,true),
('India tier uplift','country','India','revenue',12.5,500,true),
('Platinum partner rate','tier','platinum','revenue',15,1000,true),
('License renewal bonus','global',NULL,'renewal',5,250,true);

INSERT INTO public.commissions (cycle, franchise_id, franchise, base, rate_pct, adjustment, tax, payable, status, approver) VALUES
('2026-07','11111111-1111-4111-8111-000000000001','Vala Systems Mumbai',845000,12.5,0,19012.5,86612.5,'approved','Rahul Mehta'),
('2026-07','11111111-1111-4111-8111-000000000002','Vala Systems Ahmedabad',412000,10,-2000,7416,32784,'pending',NULL),
('2026-07','11111111-1111-4111-8111-000000000003','Vala Gulf FZE',1260000,15,5000,0,194000,'paid','Omar Farid'),
('2026-06','11111111-1111-4111-8111-000000000001','Vala Systems Mumbai',790000,12.5,0,17775,80975,'paid','Rahul Mehta');

INSERT INTO public.invoices (number, franchise_id, franchise, type, amount, tax, status, issued_at, due_at, country) VALUES
('INV-2026-0341','11111111-1111-4111-8111-000000000001','Vala Systems Mumbai','royalty',105625,19012.5,'paid',current_date - 20, current_date + 10,'India'),
('INV-2026-0342','11111111-1111-4111-8111-000000000002','Vala Systems Ahmedabad','subscription',41200,7416,'issued',current_date - 12, current_date + 18,'India'),
('INV-2026-0343','11111111-1111-4111-8111-000000000003','Vala Gulf FZE','license',189000,0,'paid',current_date - 30, current_date,'UAE'),
('INV-2026-0344','11111111-1111-4111-8111-000000000005','Vala UK Ltd','renewal',24000,4800,'overdue',current_date - 55, current_date - 25,'United Kingdom'),
('INV-2026-0345','11111111-1111-4111-8111-000000000004','Vala Systems Bengaluru','product',16800,3024,'draft',current_date - 2, current_date + 28,'India');

INSERT INTO public.documents (name, category, kind, franchise, scope, target_id, target_label, size, status) VALUES
('mumbai-gst-certificate.pdf','kyc','tax_id','Vala Systems Mumbai','license','SV-GLD-8F3A21','SV-GLD-8F3A21',284000,'verified'),
('mumbai-owner-passport.pdf','kyc','identity','Vala Systems Mumbai','license','SV-GLD-8F3A21','SV-GLD-8F3A21',512000,'verified'),
('gulf-trade-licence.pdf','compliance','trade_licence','Vala Gulf FZE','license','SV-PLT-77DE10','SV-PLT-77DE10',735000,'verified'),
('ahmedabad-renewal-agreement.pdf','compliance','agreement','Vala Systems Ahmedabad','license','SV-SLV-2B9C44','SV-SLV-2B9C44',198000,'pending_review');

INSERT INTO public.audit_log (actor, action, target, scope, meta) VALUES
('Rahul Mehta','license.generate','SV-GLD-8F3A21','license','Scale plan issued for Mumbai'),
('Omar Farid','commission.approve','2026-07 / Vala Gulf FZE','commission','Approved and marked paid'),
('Anita Rao','application.review','Vikram Singh','application','Moved to KYC stage'),
('System','invoice.overdue','INV-2026-0344','revenue','Payment overdue by 25 days');