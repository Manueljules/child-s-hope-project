
-- User roles for admin gate
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- Site content: single-row key/value JSON blob edited by admins
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT ALL ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write" ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Success stories (admin-editable content)
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  tag text,
  excerpt text,
  body text,
  image_url text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stories TO anon, authenticated;
GRANT ALL ON public.stories TO authenticated;
GRANT ALL ON public.stories TO service_role;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read stories" ON public.stories FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "admin manage stories" ON public.stories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Donation destination accounts (where money goes) — admin only
CREATE TABLE public.donation_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  bank_name text,
  account_name text,
  account_number text,
  swift_code text,
  currency text NOT NULL DEFAULT 'UGX',
  mobile_money_provider text,
  mobile_money_number text,
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.donation_accounts TO anon, authenticated;
GRANT ALL ON public.donation_accounts TO authenticated;
GRANT ALL ON public.donation_accounts TO service_role;
ALTER TABLE public.donation_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read accounts" ON public.donation_accounts FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "admin manage accounts" ON public.donation_accounts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Donations log
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  donor_name text,
  donor_email text,
  donor_phone text,
  donor_country text,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'UGX',
  frequency text NOT NULL DEFAULT 'one',
  donation_type text NOT NULL DEFAULT 'one',
  payment_method text,
  status text NOT NULL DEFAULT 'pending',
  anonymous boolean NOT NULL DEFAULT false,
  dedication text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.donations TO anon, authenticated;
GRANT SELECT, UPDATE ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can donate" ON public.donations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read donations" ON public.donations FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update donations" ON public.donations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Seed a couple of default content keys
INSERT INTO public.site_content (key, value) VALUES
  ('founder_message', '{"name":"Founder Name","title":"Founder & Executive Director","body":"When I founded The Saints Childcare Foundation Uganda, I made a promise to every orphaned and vulnerable child we would meet: you will not be forgotten. Every classroom we build, every meal we serve, and every scholarship we award is a step towards a country where a child''s postcode never decides their future. Thank you for standing with us.","image_url":""}'),
  ('cofounder_message', '{"name":"Cofounder Name","title":"Cofounder & Programs Director","body":"Change is stubborn work. It happens one child, one family, one village at a time. What keeps our team going is the resilience we witness every day — girls returning to school, mothers starting businesses, and communities rebuilding themselves. Your support turns that resilience into lasting opportunity.","image_url":""}'),
  ('impact_stats', '{"children_served":5000,"meals_provided":120000,"schools_assisted":14,"districts_reached":22}'),
  ('hero', '{"eyebrow":"The Saints Childcare Foundation Uganda","title":"MAKE A CHILD JUST BETTER.","subtitle":"Every child deserves love, education, protection, and a real opportunity to achieve their dreams."}');
