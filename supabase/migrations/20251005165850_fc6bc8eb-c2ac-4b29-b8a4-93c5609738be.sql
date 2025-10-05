-- Create site_settings table
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text NOT NULL DEFAULT 'Luxury Chauffeur Services',
  phone text NOT NULL DEFAULT '+44 800 123 4567',
  email text NOT NULL DEFAULT 'info@luxurychauffeur.co.uk',
  office_address text NOT NULL DEFAULT '123 Luxury Lane, London, UK',
  availability text NOT NULL DEFAULT '24 hours a day, 7 days a week, 365 days a year',
  light_logo_url text,
  dark_logo_url text,
  favicon_url text,
  accent_color text DEFAULT '#D4AF37',
  notify_new_booking boolean DEFAULT true,
  notify_new_enquiry boolean DEFAULT true,
  notification_emails text[] DEFAULT ARRAY[]::text[],
  privacy_policy_url text DEFAULT '/privacy',
  terms_url text DEFAULT '/terms',
  footer_tagline text DEFAULT 'Luxury chauffeur services for discerning clients',
  instagram_url text,
  facebook_url text,
  linkedin_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read site settings (needed for public site)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Policy: Only admins can update site settings
CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (is_admin(auth.uid()));

-- Policy: Only admins can insert site settings
CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION update_site_settings_updated_at();

-- Insert default settings
INSERT INTO public.site_settings (id) VALUES (gen_random_uuid());