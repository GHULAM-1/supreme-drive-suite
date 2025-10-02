-- Add Close Protection fields to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'chauffeur' CHECK (service_type IN ('chauffeur', 'close_protection')),
ADD COLUMN IF NOT EXISTS protection_details JSONB,
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent'));

-- Update status to include 'in_review'
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_status_check CHECK (status IN ('new', 'in_review', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'));

-- Create index for service_type queries
CREATE INDEX IF NOT EXISTS idx_bookings_service_type ON public.bookings(service_type);
CREATE INDEX IF NOT EXISTS idx_bookings_priority ON public.bookings(priority);

-- Add comment for documentation
COMMENT ON COLUMN public.bookings.service_type IS 'Type of service: chauffeur or close_protection';
COMMENT ON COLUMN public.bookings.protection_details IS 'JSON data for close protection specific fields: date, start_time, duration_hours, primary_location, secondary_location, agents_required, risk_level, additional_notes';
COMMENT ON COLUMN public.bookings.source IS 'Source of the booking: web, phone, CloseProtectionForm, etc.';
COMMENT ON COLUMN public.bookings.priority IS 'Priority level: normal, high, urgent (set based on risk level for CP)';