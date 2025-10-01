-- Fix security definer view issue
-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS public.job_details;

-- Create view for job details (combining booking with driver and vehicle info)
-- This view will use the permissions of the querying user, not the view creator
CREATE VIEW public.job_details AS
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