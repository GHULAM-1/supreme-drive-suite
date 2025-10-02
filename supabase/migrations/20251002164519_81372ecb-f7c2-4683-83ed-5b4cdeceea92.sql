-- Drop all existing INSERT policies on bookings
DROP POLICY IF EXISTS "Allow public booking creation" ON bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;

-- Create a new explicitly PERMISSIVE policy for anonymous and authenticated users
CREATE POLICY "Enable insert for all users"
ON bookings
AS PERMISSIVE
FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);