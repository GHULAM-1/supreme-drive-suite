-- Promote user to admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'neemaghanbarinia@gmail.com';