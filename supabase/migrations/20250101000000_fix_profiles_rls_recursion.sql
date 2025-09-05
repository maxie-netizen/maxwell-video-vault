-- Fix infinite recursion in profiles RLS policies
-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can select all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create a function to check if user is admin without recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role in auth.users metadata or profiles
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND (raw_user_meta_data->>'role' = 'admin' OR email = 'admin@maxwell-video-vault.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin policies using the non-recursive function
CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admin can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin())
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RPC function for updating user avatar (bypasses RLS)
CREATE OR REPLACE FUNCTION public.update_user_avatar(user_id UUID, avatar_data TEXT)
RETURNS VOID AS $$
BEGIN
  -- Update the avatar_url for the specified user
  UPDATE public.profiles 
  SET avatar_url = avatar_data, updated_at = now()
  WHERE id = user_id;
  
  -- Check if any rows were affected
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
