import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Wallet } from 'ethers';

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const signTransaction = functions.https.onRequest(async (req, res) => {
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

    // Get transaction and network from request body
    const { transaction, network = 'base' } = req.body;

    if (!transaction) {
      res.status(400).json({ error: 'Transaction data required' });
      return;
    }

    // Reference to Firestore
    const db = admin.firestore();
    const walletsRef = db.collection('custodial_wallets');

    // Get user's wallet
    const walletQuery = await walletsRef
      .where('user_id', '==', userId)
      .where('network', '==', network)
      .limit(1)
      .get();

    if (walletQuery.empty) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }

    const walletData = walletQuery.docs[0].data();

    // Decrypt private key (reverse the simple base64 encoding)
    // In production, use Google Cloud KMS for decryption
    const privateKey = Buffer.from(walletData.encrypted_private_key, 'base64').toString();
    const wallet = new Wallet(privateKey);

    // Sign the transaction
    const signedTx = await wallet.signTransaction(transaction);

    console.log(`Transaction signed for user ${userId} on ${network}`);

    res.status(200).json({
      signedTransaction: signedTx,
      wallet_address: walletData.wallet_address
    });

  } catch (error) {
    console.error('Error in sign-transaction function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(400).json({ error: errorMessage });
  }
});
