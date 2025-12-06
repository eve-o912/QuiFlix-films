import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Wallet } from "https://esm.sh/ethers@6.11.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { network = 'base' } = await req.json();

    // Check if wallet already exists for this user and network
    const { data: existingWallet } = await supabaseClient
      .from('custodial_wallets')
      .select('wallet_address')
      .eq('user_id', user.id)
      .eq('network', network)
      .single();

    if (existingWallet) {
      console.log(`Wallet already exists for user ${user.id} on ${network}`);
      return new Response(
        JSON.stringify({ 
          wallet_address: existingWallet.wallet_address,
          message: 'Wallet already exists' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new wallet
    const wallet = Wallet.createRandom();
    const walletAddress = wallet.address;
    const privateKey = wallet.privateKey;

    // Simple encryption (in production, use proper encryption like AES-256)
    const encryptedPrivateKey = btoa(privateKey); // Base64 encoding for demo

    // Store wallet in database
    const { error: insertError } = await supabaseClient
      .from('custodial_wallets')
      .insert({
        user_id: user.id,
        wallet_address: walletAddress,
        encrypted_private_key: encryptedPrivateKey,
        network: network,
      });

    if (insertError) {
      console.error('Error storing wallet:', insertError);
      throw insertError;
    }

    console.log(`Generated wallet ${walletAddress} for user ${user.id} on ${network}`);

    return new Response(
      JSON.stringify({ 
        wallet_address: walletAddress,
        message: 'Wallet created successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-wallet function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
