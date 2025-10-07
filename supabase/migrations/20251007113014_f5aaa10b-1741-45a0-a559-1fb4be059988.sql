-- Add WhatsApp number field to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN whatsapp_number text;

-- Update existing record with a default WhatsApp number
UPDATE public.site_settings 
SET whatsapp_number = '+447900123456'
WHERE whatsapp_number IS NULL;