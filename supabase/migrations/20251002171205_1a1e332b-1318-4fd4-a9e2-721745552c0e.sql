-- Create a secure function to insert close protection bookings
CREATE OR REPLACE FUNCTION public.insert_close_protection_booking(
  p_service_type text,
  p_pickup_location text,
  p_dropoff_location text,
  p_pickup_date date,
  p_pickup_time time,
  p_passengers integer,
  p_luggage integer,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_additional_requirements text,
  p_protection_details jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id uuid;
BEGIN
  INSERT INTO public.bookings (
    service_type,
    pickup_location,
    dropoff_location,
    pickup_date,
    pickup_time,
    passengers,
    luggage,
    customer_name,
    customer_email,
    customer_phone,
    additional_requirements,
    protection_details,
    status,
    source
  ) VALUES (
    p_service_type,
    p_pickup_location,
    p_dropoff_location,
    p_pickup_date,
    p_pickup_time,
    p_passengers,
    p_luggage,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_additional_requirements,
    p_protection_details,
    'new',
    'close_protection_form'
  )
  RETURNING id INTO v_booking_id;
  
  RETURN v_booking_id;
END;
$$;

-- Make function accessible to anonymous users
GRANT EXECUTE ON FUNCTION public.insert_close_protection_booking TO anon;
GRANT EXECUTE ON FUNCTION public.insert_close_protection_booking TO authenticated;