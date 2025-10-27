-- Create drivers table
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  license_number TEXT,
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  specializations TEXT[], -- e.g., ['chauffeur', 'close_protection']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on drivers
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Drivers policies
CREATE POLICY "Admins can manage drivers"
ON public.drivers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Anyone can view active drivers"
ON public.drivers
FOR SELECT
USING (is_active = true);

-- Update bookings table to add driver assignment and enhance status
ALTER TABLE public.bookings
ADD COLUMN driver_id UUID REFERENCES public.drivers(id),
ADD COLUMN route_notes TEXT,
ADD COLUMN internal_notes TEXT,
ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Update status column to use specific values
ALTER TABLE public.bookings
ALTER COLUMN status SET DEFAULT 'new';

-- Add check constraint for valid statuses
ALTER TABLE public.bookings
ADD CONSTRAINT valid_booking_status
CHECK (status IN ('new', 'confirmed', 'in_progress', 'completed', 'cancelled'));

-- Create index for faster queries
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_driver ON public.bookings(driver_id);
CREATE INDEX idx_bookings_pickup_date ON public.bookings(pickup_date);

-- Insert sample drivers
INSERT INTO public.drivers (name, email, phone, license_number, specializations) VALUES
('James Morrison', 'james@supremedrive.com', '+44 7700 900001', 'UK-DRV-001', ARRAY['chauffeur', 'close_protection']),
('Sarah Williams', 'sarah@supremedrive.com', '+44 7700 900002', 'UK-DRV-002', ARRAY['chauffeur']),
('Michael Chen', 'michael@supremedrive.com', '+44 7700 900003', 'UK-DRV-003', ARRAY['close_protection']);