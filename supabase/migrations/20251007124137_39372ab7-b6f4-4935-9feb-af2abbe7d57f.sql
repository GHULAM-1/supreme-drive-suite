-- Standardize existing driver specializations data
-- This fixes inconsistent capitalization and formatting

UPDATE public.drivers
SET specializations = ARRAY(
  SELECT DISTINCT CASE
    -- Standardize "chauffeur" variations
    WHEN LOWER(spec) IN ('chauffeur', 'chauffeurs') THEN 'Chauffeur'
    -- Standardize "close protection" variations
    WHEN LOWER(REPLACE(spec, '_', ' ')) IN ('close protection', 'closeprotection', 'close_protection') THEN 'Close Protection'
    -- Standardize "executive" variations
    WHEN LOWER(spec) IN ('executive', 'executive transport') THEN 'Executive'
    -- Standardize "long distance" variations
    WHEN LOWER(REPLACE(spec, '_', ' ')) IN ('long distance', 'longdistance', 'long_distance') THEN 'Long Distance'
    -- Keep any other values but capitalize first letter
    ELSE INITCAP(spec)
  END
  FROM UNNEST(specializations) AS spec
  WHERE spec IS NOT NULL AND spec != ''
)
WHERE specializations IS NOT NULL AND array_length(specializations, 1) > 0;