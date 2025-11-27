import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http, WalletClient, createPublicClient } from 'viem';
import { liskMainnet } from './chains'; // Changed from liskSepolia to liskMainnet

export interface CustodialWallet {
  address: string;
  privateKey: string;
}

export interface StoredWallet {
  address: string;
  email: string;
  createdAt: number;
}

/**
 * Simple hash function for browser compatibility
 */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to hex and pad to 64 characters
  const hexHash = Math.abs(hash).toString(16);
  return hexHash.padStart(64, '0').slice(0, 64);
}

/**
 * Generate a deterministic private key from email
 * This ensures the same email always generates the same wallet
 */
export function generateWalletFromEmail(email: string): CustodialWallet {
  const secret = process.env.NEXT_PUBLIC_SECRET_SALT;
  const combined = `${email.toLowerCase().trim()}:${secret}`;
  
  // Generate a deterministic hash
  const hash = simpleHash(combined);
  const privateKey = `0x${hash}` as `0x${string}`;
  
  // Create account from private key
  const account = privateKeyToAccount(privateKey);
  
  return {
    address: account.address,
    privateKey: privateKey,
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
  };
}

/**
 * Create a wallet client from private key
 */
export function createWalletClientFromPrivateKey(privateKey: string): WalletClient {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  return createWalletClient({
    account,
    chain: liskMainnet, // Changed from liskSepolia
    transport: http(liskMainnet.rpcUrls.default.http[0]),
  });
}

/**
 * Store wallet info in localStorage
 */
export function createStoredWallet(email: string): StoredWallet {
  const wallet = generateWalletFromEmail(email);
  
  return {
    address: wallet.address,
    email: email.toLowerCase().trim(),
    createdAt: Date.now()
  };
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(address: string): Promise<string> {
  const publicClient = createPublicClient({
    chain: liskMainnet, // Changed from liskSepolia
    transport: http(liskMainnet.rpcUrls.default.http[0]),
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
 * Fund wallet with test ETH (development only - won't work on mainnet)
 */
export async function fundWalletWithTestETH(address: string, amount: string = '1'): Promise<boolean> {
  // Note: This function won't work on mainnet - only for testing on testnet/local
  console.warn('fundWalletWithTestETH is disabled on mainnet');
  return false;
}
