import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Wallet } from 'ethers';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const signTransaction = functions.https.onRequest(async (req, res) => {
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
      throw new Error('Unauthorized: No token provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Parse request body
    const { transaction, network = 'base' } = req.body;

    if (!transaction) {
      throw new Error('Transaction data required');
    }

    // Get user's wallet from Firestore
    const walletDoc = await db
      .collection('custodial_wallets')
      .where('user_id', '==', userId)
      .where('network', '==', network)
      .limit(1)
      .get();

    if (walletDoc.empty) {
      throw new Error('Wallet not found');
    }

    const walletData = walletDoc.docs[0].data();

    // Decrypt private key (reverse the simple base64 encoding)
    const privateKey = Buffer.from(walletData.encrypted_private_key, 'base64').toString('utf-8');
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