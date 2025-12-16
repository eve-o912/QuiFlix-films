import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const RIFTFI_RAMP_URL = 'https://ramp.riftfi.xyz';

export const riftfiRamp = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // Verify Firebase Auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Parse request body
    const { action, ...params } = req.body;

    console.log(`RiftFi ${action} request for user ${userId}:`, params);

    // Get user's wallet address from Firestore
    const walletQuery = await db
      .collection('custodial_wallets')
      .where('user_id', '==', userId)
      .where('network', '==', 'base')
      .limit(1)
      .get();

    if (walletQuery.empty) {
      throw new Error('No wallet found. Please create a wallet first.');
    }

    const walletData = walletQuery.docs[0].data();
    const walletAddress = walletData.wallet_address;

    let response: Response;

    switch (action) {
      case 'exchange-rate':
        // Get current exchange rates
        response = await fetch(`${RIFTFI_RAMP_URL}/exchange-rate`);
        break;

      case 'onramp':
        // Onramp: Fiat (KES) to Crypto (USDC)
        // User pays with M-Pesa, receives USDC in their wallet
        const onrampPayload = {
          account_number: params.phoneNumber, // User's M-Pesa phone number
          amount: params.amount.toString(), // KES amount
          chain: 'BASE',
          asset: 'USDC',
          address: walletAddress, // Where to send USDC
          network: params.network || 'Safaricom',
          country_code: 'KES',
          callback_url: `${functions.config().firebase.function_url}/riftfiWebhook`
        };

        console.log('Onramp payload:', onrampPayload);

        response = await fetch(`${RIFTFI_RAMP_URL}/onramp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(onrampPayload),
        });
        break;

      case 'offramp':
        // Offramp: Crypto (USDC) to Fiat (KES)
        // User sends USDC, receives KES via M-Pesa
        const offrampPayload = {
          transaction_hash: params.txHash, // On-chain tx hash of USDC transfer
          amount: params.amount.toString(), // KES amount to disburse
          account_number: params.phoneNumber, // Recipient M-Pesa number
          network: params.network || 'Safaricom',
          country_code: 'KES',
          chain: 'BASE',
          asset: 'USDC',
          callback_url: `${functions.config().firebase.function_url}/riftfiWebhook`
        };

        console.log('Offramp payload:', offrampPayload);

        response = await fetch(`${RIFTFI_RAMP_URL}/offramp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(offrampPayload),
        });
        break;

      case 'status':
        // Check transaction status
        response = await fetch(`${RIFTFI_RAMP_URL}/transaction/${params.transactionId}`);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('RiftFi API error:', data);
      throw new Error(data.message || data.error || 'RiftFi API request failed');
    }

    console.log(`RiftFi ${action} response:`, data);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error in riftfi-ramp function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
});