-- Add 'both' as a valid service_type option for portfolio
-- First drop the existing constraint if it exists
ALTER TABLE portfolio 
DROP CONSTRAINT IF EXISTS portfolio_service_type_check;

-- Add new constraint allowing 'chauffeur', 'close_protection', and 'both'
ALTER TABLE portfolio 
ADD CONSTRAINT portfolio_service_type_check 
CHECK (service_type IN ('chauffeur', 'close_protection', 'both'));