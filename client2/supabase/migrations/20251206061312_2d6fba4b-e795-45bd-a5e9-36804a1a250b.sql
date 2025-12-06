
-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own wallets" ON public.custodial_wallets;

-- Create a more restrictive policy that uses a security definer function
-- This ensures users can only see their wallet address and network, never the private key

-- Create a security definer function to get wallet info safely
CREATE OR REPLACE FUNCTION public.get_user_wallet_info(p_user_id uuid, p_network text DEFAULT 'base')
RETURNS TABLE (
  id uuid,
  wallet_address text,
  network text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cw.id,
    cw.wallet_address,
    cw.network,
    cw.created_at
  FROM public.custodial_wallets cw
  WHERE cw.user_id = p_user_id
    AND cw.network = p_network;
$$;

-- Create a view that excludes the encrypted_private_key column
CREATE OR REPLACE VIEW public.safe_wallet_view AS
SELECT 
  id,
  user_id,
  wallet_address,
  network,
  created_at
FROM public.custodial_wallets;

-- Enable RLS on the base table but with NO policies for regular users
-- This means authenticated users cannot directly query the table
-- They must use the view or the security definer function

-- Revoke direct access to the custodial_wallets table from authenticated users
REVOKE ALL ON public.custodial_wallets FROM authenticated;
REVOKE ALL ON public.custodial_wallets FROM anon;

-- Grant service_role full access (for edge functions)
GRANT ALL ON public.custodial_wallets TO service_role;

-- Grant access to the safe view
GRANT SELECT ON public.safe_wallet_view TO authenticated;

-- Enable RLS on the view
ALTER VIEW public.safe_wallet_view SET (security_invoker = true);

-- Create RLS policy on the underlying table that only service_role can bypass
-- Regular users have no access to the base table at all
CREATE POLICY "Only service role can access wallets"
ON public.custodial_wallets
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create a policy for the view access
CREATE POLICY "Users can view own wallet via view"
ON public.custodial_wallets
FOR SELECT
TO authenticated
USING (false);  -- Deny all direct access, force use of view/function
