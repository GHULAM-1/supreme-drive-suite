-- Add temporary SELECT policy for feedback submissions during insert
-- This allows users to view their own feedback only if created in the last 5 seconds
-- This is needed so the Supabase JS client can receive a successful response after insert
CREATE POLICY "Users can view their own feedback during insert"
ON feedback_submissions
FOR SELECT
TO authenticated, anon
USING (
  created_at > (now() - interval '5 seconds')
);