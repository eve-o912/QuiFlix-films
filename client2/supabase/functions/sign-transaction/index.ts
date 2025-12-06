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

    const { transaction, network = 'base' } = await req.json();

    if (!transaction) {
      throw new Error('Transaction data required');
    }

    // Get user's wallet
    const { data: walletData, error: walletError } = await supabaseClient
      .from('custodial_wallets')
      .select('wallet_address, encrypted_private_key')
      .eq('user_id', user.id)
      .eq('network', network)
      .single();

    if (walletError || !walletData) {
      throw new Error('Wallet not found');
    }

    // Decrypt private key (reverse the simple base64 encoding)
    const privateKey = atob(walletData.encrypted_private_key);
    const wallet = new Wallet(privateKey);

    // Sign the transaction
    const signedTx = await wallet.signTransaction(transaction);

    console.log(`Transaction signed for user ${user.id} on ${network}`);

    return new Response(
      JSON.stringify({ 
        signedTransaction: signedTx,
        wallet_address: walletData.wallet_address 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sign-transaction function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
