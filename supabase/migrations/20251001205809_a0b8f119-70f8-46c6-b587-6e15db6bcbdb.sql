-- Enhanced pricing rules with more granular options
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS base_fee NUMERIC DEFAULT 0;
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS minimum_fare NUMERIC DEFAULT 0;
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS wait_time_per_hour NUMERIC DEFAULT 0;
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS vehicle_category TEXT;

-- Create fixed routes table for airport runs etc
CREATE TABLE IF NOT EXISTS fixed_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  fixed_price NUMERIC NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fixed_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active fixed routes"
ON fixed_routes FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage fixed routes"
ON fixed_routes FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Create FAQ table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active FAQs"
ON faqs FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage FAQs"
ON faqs FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON audit_logs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Create pricing extras table
CREATE TABLE IF NOT EXISTS pricing_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extra_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pricing_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pricing extras"
ON pricing_extras FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage pricing extras"
ON pricing_extras FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Insert sample data
INSERT INTO pricing_extras (extra_name, price, description) VALUES
  ('Child Seat', 15.00, 'Premium child safety seat'),
  ('Additional Stop', 20.00, 'Extra stop along the route'),
  ('Meet & Greet', 25.00, 'Driver meets you at arrivals'),
  ('Refreshments', 10.00, 'Bottled water and snacks')
ON CONFLICT DO NOTHING;

INSERT INTO faqs (question, answer, category, display_order) VALUES
  ('How do I book a chauffeur?', 'You can book through our online booking form, call us at 0800 123 4567, or email us. We recommend booking at least 24 hours in advance for guaranteed availability.', 'Booking', 1),
  ('What payment methods do you accept?', 'We accept all major credit cards, debit cards, and bank transfers. Payment is typically due before your journey, though corporate accounts can arrange monthly billing.', 'Pricing', 2),
  ('Can I cancel or modify my booking?', 'Yes, you can cancel or modify up to 24 hours before your scheduled pickup time without charge. Cancellations within 24 hours may incur a fee.', 'Cancellations', 3),
  ('What areas do you cover?', 'We provide service throughout the UK, including all major cities and airports. Long-distance and international travel can be arranged.', 'Services', 4),
  ('Are your chauffeurs vetted?', 'Yes, all our chauffeurs undergo thorough background checks, hold professional licenses, and receive ongoing training in security and customer service.', 'Services', 5)
ON CONFLICT DO NOTHING;

INSERT INTO fixed_routes (route_name, pickup_location, dropoff_location, fixed_price) VALUES
  ('Heathrow to Central London', 'London Heathrow Airport', 'Central London', 85.00),
  ('Gatwick to Central London', 'London Gatwick Airport', 'Central London', 95.00),
  ('Stansted to Central London', 'London Stansted Airport', 'Central London', 105.00),
  ('Luton to Central London', 'London Luton Airport', 'Central London', 90.00)
ON CONFLICT DO NOTHING;