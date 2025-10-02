-- Drop the current policy that applies to wrong role
DROP POLICY IF EXISTS "Allow anonymous booking inserts" ON bookings;

-- Create policy explicitly for anon and authenticated roles
CREATE POLICY "Allow anonymous booking inserts"
ON bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);