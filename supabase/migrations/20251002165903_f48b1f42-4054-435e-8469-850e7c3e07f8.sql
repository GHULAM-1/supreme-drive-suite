-- Grant INSERT permission on bookings table to anon and authenticated roles
-- This is required for the RLS policy to work
GRANT INSERT ON TABLE public.bookings TO anon, authenticated;