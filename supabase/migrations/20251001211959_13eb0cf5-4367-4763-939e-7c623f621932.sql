-- Enhanced Admin Portal Schema

-- Add role field to profiles if not exists (already exists, but ensure it's there)
-- Profiles table already has role field

-- Create user permissions table for granular access control
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  permission text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, permission)
);

-- Enable RLS on user permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage permissions
CREATE POLICY "Admins can manage permissions"
ON public.user_permissions
FOR ALL
USING (is_admin(auth.uid()));

-- Create job assignment history table
CREATE TABLE IF NOT EXISTS public.job_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  assigned_by uuid REFERENCES public.profiles(id),
  assigned_at timestamptz DEFAULT now(),
  unassigned_at timestamptz,
  notes text
);

-- Enable RLS on job assignments
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage job assignments
CREATE POLICY "Admins can manage job assignments"
ON public.job_assignments
FOR ALL
USING (is_admin(auth.uid()));

-- Create driver availability table
CREATE TABLE IF NOT EXISTS public.driver_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  start_time time,
  end_time time,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(driver_id, date)
);

-- Enable RLS on driver availability
ALTER TABLE public.driver_availability ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage driver availability
CREATE POLICY "Admins can manage driver availability"
ON public.driver_availability
FOR ALL
USING (is_admin(auth.uid()));

-- Create documents table for driver/vehicle documents
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('driver', 'vehicle')),
  entity_id uuid NOT NULL,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  expiry_date date,
  uploaded_by uuid REFERENCES public.profiles(id),
  uploaded_at timestamptz DEFAULT now(),
  is_verified boolean DEFAULT false
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage documents
CREATE POLICY "Admins can manage documents"
ON public.documents
FOR ALL
USING (is_admin(auth.uid()));

-- Create vehicle service history table
CREATE TABLE IF NOT EXISTS public.vehicle_service_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  service_type text NOT NULL,
  service_date date NOT NULL,
  cost numeric,
  mileage integer,
  next_service_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on vehicle service history
ALTER TABLE public.vehicle_service_history ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage vehicle service history
CREATE POLICY "Admins can manage vehicle service history"
ON public.vehicle_service_history
FOR ALL
USING (is_admin(auth.uid()));

-- Add new fields to bookings for enhanced tracking
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS distance_miles numeric,
  ADD COLUMN IF NOT EXISTS duration_minutes integer,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz,
  ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES public.profiles(id);

-- Add service status to vehicles
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS service_status text DEFAULT 'active' CHECK (service_status IN ('active', 'maintenance', 'out_of_service')),
  ADD COLUMN IF NOT EXISTS last_service_date date,
  ADD COLUMN IF NOT EXISTS next_service_date date,
  ADD COLUMN IF NOT EXISTS current_mileage integer;

-- Add performance tracking to drivers
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS total_jobs_completed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_rating numeric(3,2),
  ADD COLUMN IF NOT EXISTS last_active_date date;

-- Enhance audit logs with more details
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS ip_address inet,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS affected_entity_type text,
  ADD COLUMN IF NOT EXISTS affected_entity_id uuid;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON public.bookings(pickup_date);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON public.bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON public.bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_booking ON public.job_assignments(booking_id);
CREATE INDEX IF NOT EXISTS idx_driver_availability_date ON public.driver_availability(driver_id, date);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON public.documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Create view for job details (combining booking with driver and vehicle info)
CREATE OR REPLACE VIEW public.job_details AS
SELECT 
  b.*,
  d.name as driver_name,
  d.phone as driver_phone,
  d.email as driver_email,
  v.name as vehicle_name,
  v.category as vehicle_category,
  v.image_url as vehicle_image,
  v.capacity as vehicle_capacity
FROM public.bookings b
LEFT JOIN public.drivers d ON b.driver_id = d.id
LEFT JOIN public.vehicles v ON b.vehicle_id = v.id;