-- Confirm email for user to allow login
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'neemaghanbarinia@gmail.com';