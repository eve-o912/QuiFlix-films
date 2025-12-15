import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Wallet } from 'ethers';

// Initialize Firebase Admin
admin.initializeApp();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const generateWallet = functions.https.onRequest(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders);
    res.status(204).send('');
    return;
  }

  // Set CORS headers for main request
  res.set(corsHeaders);

  try {
    // Verify Firebase Auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get network from request body
    const { network = 'base' } = req.body;

    // Reference to Firestore
    const db = admin.firestore();
    const walletsRef = db.collection('custodial_wallets');

    // Check if wallet already exists for this user and network
    const existingWalletQuery = await walletsRef
      .where('user_id', '==', userId)
      .where('network', '==', network)
      .limit(1)
      .get();

    if (!existingWalletQuery.empty) {
      const existingWallet = existingWalletQuery.docs[0].data();
      console.log(`Wallet already exists for user ${userId} on ${network}`);
      
      res.status(200).json({
        wallet_address: existingWallet.wallet_address,
        message: 'Wallet already exists'
      });
      return;
    }

    // Generate new wallet
    const wallet = Wallet.createRandom();
    const walletAddress = wallet.address;
    const privateKey = wallet.privateKey;

    // Simple encryption (in production, use proper encryption like AES-256-GCM)
    // Consider using Google Cloud KMS for production
    const encryptedPrivateKey = Buffer.from(privateKey).toString('base64');

    // Store wallet in Firestore
    await walletsRef.add({
      user_id: userId,
      wallet_address: walletAddress,
      encrypted_private_key: encryptedPrivateKey,
      network: network,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Generated wallet ${walletAddress} for user ${userId} on ${network}`);

    res.status(200).json({
      wallet_address: walletAddress,
      message: 'Wallet created successfully'
    });

  } catch (error) {
    console.error('Error in generate-wallet function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(400).json({ error: errorMessage });
  }
});
