-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;

-- Recreate the policy with explicit permissions for both anonymous and authenticated users
CREATE POLICY "Anyone can create bookings" 
ON bookings 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;