import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id: string;
  company_name: string;
  phone: string;
  email: string;
  office_address: string;
  availability: string;
  whatsapp_number: string | null;
  light_logo_url: string | null;
  dark_logo_url: string | null;
  favicon_url: string | null;
  accent_color: string;
  notification_emails: string[];
  notify_new_booking: boolean;
  notify_new_enquiry: boolean;
  privacy_policy_url: string | null;
  terms_url: string | null;
  footer_tagline: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

const defaultSettings: SiteSettings = {
  id: "",
  company_name: "Supreme Drive Suite",
  phone: "+44 800 123 4567",
  email: "info@supremedrivesuite.co.uk",
  office_address: "123 Luxury Lane, London, UK",
  availability: "24 hours a day, 7 days a week, 365 days a year",
  whatsapp_number: "+447900123456",
  light_logo_url: null,
  dark_logo_url: null,
  favicon_url: null,
  accent_color: "#D4AF37",
  notification_emails: [],
  notify_new_booking: true,
  notify_new_enquiry: true,
  privacy_policy_url: "/privacy",
  terms_url: "/terms",
  footer_tagline: "Luxury chauffeur and close protection services",
  facebook_url: null,
  instagram_url: null,
  linkedin_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useSiteSettings = () => {
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      // Force fresh data with cache-busting filter
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .gte('created_at', '1970-01-01') // Cache-buster: always true
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as SiteSettings | null;
    },
    staleTime: 0, // Don't cache - always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
  });

  return {
    settings: settings || defaultSettings,
    isLoading,
    error,
  };
};
