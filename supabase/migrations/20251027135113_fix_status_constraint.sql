-- Fix status constraint to use 'cancelled' (UK spelling) consistently
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_status_check CHECK (status IN ('new', 'in_review', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'));

-- Also update the old constraint if it exists
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS valid_booking_status;

ALTER TABLE public.bookings
ADD CONSTRAINT valid_booking_status CHECK (status IN ('new', 'confirmed', 'in_progress', 'completed', 'cancelled'));
