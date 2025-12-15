import { generatePrivateKey, privateKeyToAccount, PrivateKeyAccount } from 'viem/accounts';
import { createWalletClient, http, WalletClient } from 'viem';
import { hardhat } from 'viem/chains';

// Use dynamic import for crypto in browser environment
let crypto: any;
if (typeof window === 'undefined') {
  // Node.js environment
  crypto = require('crypto');
} else {
  // Browser environment - use Web Crypto API
  crypto = {
    createHash: (algorithm: string) => ({
      update: (data: string) => ({
        digest: () => {
          // Simple hash for browser - in production, use a proper crypto library
          let hash = 0;
          for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
          }
          return Buffer.from(Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64), 'hex');
        }
      })
    }),
    randomBytes: (size: number) => {
      const array = new Uint8Array(size);
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(array);
      }
      return Buffer.from(array);
    },
    pbkdf2Sync: (password: string, salt: string, iterations: number, keylen: number, digest: string) => {
      // Simplified PBKDF2 for browser - in production, use a proper crypto library
      const key = new Uint8Array(keylen);
      const combined = password + salt;
      for (let i = 0; i < keylen; i++) {
        key[i] = combined.charCodeAt(i % combined.length) ^ (i + iterations) % 256;
      }
      return Buffer.from(key);
    },
    createCipher: (algorithm: string, key: Buffer) => ({
      update: (data: string, inputEncoding: string, outputEncoding: string) => {
        // Simple XOR cipher for browser - in production, use proper encryption
        let result = '';
        for (let i = 0; i < data.length; i++) {
          const char = data.charCodeAt(i) ^ key[i % key.length];
          result += char.toString(16).padStart(2, '0');
        }
        return result;
      },
      final: (encoding: string) => ''
    }),
    createDecipher: (algorithm: string, key: Buffer) => ({
      update: (data: string, inputEncoding: string, outputEncoding: string) => {
        // Simple XOR decipher for browser - in production, use proper decryption
        let result = '';
        for (let i = 0; i < data.length; i += 2) {
          const byte = parseInt(data.substr(i, 2), 16);
          const char = byte ^ key[(i / 2) % key.length];
          result += String.fromCharCode(char);
        }
        return result;
      },
      final: (encoding: string) => ''
    })
  };
}

export interface CustodialWallet {
  address: string;
  privateKey: string;
  publicKey: string;
}

export interface StoredWallet {
  address: string;
  encryptedPrivateKey: string;
  salt: string;
  email: string;
  createdAt: number;
}

/**
 * Generate a deterministic private key from email
 * This ensures the same email always generates the same wallet
 */
export function generateWalletFromEmail(email: string): CustodialWallet {
  // Use a combination of email and a secret to generate deterministic key
  const secret = process.env.WALLET_GENERATION_SECRET || process.env.NEXT_PUBLIC_WALLET_SECRET || 'quiflix-secret-key-2024';
  const combined = `${email.toLowerCase().trim()}:${secret}`;
  
  // Generate a hash from email + secret
  const hash = crypto.createHash('sha256').update(combined).digest();
  const privateKey = `0x${hash.toString('hex')}` as `0x${string}`;
  
  // Create account from private key
  const account = privateKeyToAccount(privateKey);
  
  return {
    address: account.address,
    privateKey: privateKey,
    publicKey: account.publicKey,
  };
}

/**
 * Generate a random wallet (not tied to email)
 */
export function generateRandomWallet(): CustodialWallet {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  
  return {
    address: account.address,
    privateKey: privateKey,
    publicKey: account.publicKey,
  };
}

/**
 * Encrypt private key with password/email combination
 */
export function encryptPrivateKey(privateKey: string, email: string): { encryptedPrivateKey: string; salt: string } {
  const salt = crypto.randomBytes(32).toString('hex');
  const key = crypto.pbkdf2Sync(email.toLowerCase().trim(), salt, 10000, 32, 'sha256');
  
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encryptedPrivateKey: encrypted,
    salt: salt
  };
}

/**
 * Decrypt private key with email
 */
export function decryptPrivateKey(encryptedPrivateKey: string, email: string, salt: string): string {
  const key = crypto.pbkdf2Sync(email.toLowerCase().trim(), salt, 10000, 32, 'sha256');
  
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Create a wallet client from private key
 */
export function createWalletClientFromPrivateKey(privateKey: string): WalletClient {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  return createWalletClient({
    account,
    chain: hardhat,
    transport: http('http://127.0.0.1:8545'),
  });
}

/**
 * Store wallet info (in production, this should go to a secure database)
 */
export function createStoredWallet(email: string): StoredWallet {
  const wallet = generateWalletFromEmail(email);
  const { encryptedPrivateKey, salt } = encryptPrivateKey(wallet.privateKey, email);
  
  return {
    address: wallet.address,
    encryptedPrivateKey,
    salt,
    email: email.toLowerCase().trim(),
    createdAt: Date.now()
  };
}

/**
 * Retrieve wallet from stored data
 */
export function retrieveWalletFromStored(storedWallet: StoredWallet): CustodialWallet {
  const privateKey = decryptPrivateKey(
    storedWallet.encryptedPrivateKey, 
    storedWallet.email, 
    storedWallet.salt
  );
  
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  return {
    address: account.address,
    privateKey: privateKey,
    publicKey: account.publicKey,
  };
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(address: string): Promise<string> {
  const { createPublicClient } = await import('viem');
  
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http('http://127.0.0.1:8545'),
  });
  
  try {
    const balance = await publicClient.getBalance({ address: address as `0x${string}` });
    return (Number(balance) / 1e18).toFixed(4);
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return '0.0000';
  }
}

/**
 * Fund wallet with test ETH (development only)
 */
export async function fundWalletWithTestETH(address: string, amount: string = '1'): Promise<boolean> {
  try {
    // In development, we can use a pre-funded hardhat account to send ETH
    const fundingPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat account #0
    const fundingClient = createWalletClientFromPrivateKey(fundingPrivateKey);
    const fundingAccount = privateKeyToAccount(fundingPrivateKey as `0x${string}`);
    
    const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
    
    const hash = await fundingClient.sendTransaction({
      account: fundingAccount,
      chain: hardhat,
      to: address as `0x${string}`,
      value: amountInWei,
    });
    
    console.log(`Funded wallet ${address} with ${amount} ETH. Transaction: ${hash}`);
    return true;
  } catch (error) {
    console.error('Error funding wallet:', error);
    return false;
  }
}