-- Drop the current policy that's not working
DROP POLICY IF EXISTS "Enable insert for all users" ON bookings;

-- Create a simple policy that applies to all roles by default
CREATE POLICY "Allow anonymous booking inserts"
ON bookings
FOR INSERT
WITH CHECK (true);