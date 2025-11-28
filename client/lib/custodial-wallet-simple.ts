import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http, WalletClient, createPublicClient } from 'viem';
import { liskMainnet } from './chains';   // Mainnet only

// ───────────────────────────────────────────────
// Wallet Types
// ───────────────────────────────────────────────
export interface CustodialWallet {
  address: string;
  privateKey: string;   // ⚠ You should NEVER expose this client-side
}

export interface StoredWallet {
  address: string;
  email: string;
  createdAt: number;
}

// ───────────────────────────────────────────────
// Hash generator (Email → Deterministic Wallet)
// ───────────────────────────────────────────────
// NOTE: Improving the hash ensures uniform 64 char privateKey generation
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Convert to 32-bit int
  }

  return Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64);
}

// ───────────────────────────────────────────────
// 1. Generate wallet deterministically using email
// ───────────────────────────────────────────────
export function generateWalletFromEmail(email: string): CustodialWallet {
  const secret = process.env.NEXT_PUBLIC_SECRET_SALT;

  if (!secret) {
    console.error("❗ Missing NEXT_PUBLIC_SECRET_SALT – deterministic wallet unsafe.");
  }

  const hash = simpleHash(`${email.toLowerCase().trim()}:${secret ?? ''}`);
  const privateKey = `0x${hash}` as `0x${string}`;

  const account = privateKeyToAccount(privateKey);

  return {
    address: account.address,
    privateKey,  // consider storing encrypted server-side instead
  };
}

// ───────────────────────────────────────────────
// 2. Generate a Random Wallet (non-email based)
// ───────────────────────────────────────────────
export function generateRandomWallet(): CustodialWallet {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  return { address: account.address, privateKey };
}

// ───────────────────────────────────────────────
// 3. Convert private key → Wallet Client
// ───────────────────────────────────────────────
export function createWalletClientFromPrivateKey(privateKey: string): WalletClient {
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  return createWalletClient({
    account,
    chain: liskMainnet,
    transport: http(liskMainnet.rpcUrls.default.http[0]),
  });
}

// ───────────────────────────────────────────────
// 4. Save wallet metadata (localStorage compatible)
// ───────────────────────────────────────────────
export function createStoredWallet(email: string): StoredWallet {
  const wallet = generateWalletFromEmail(email);

  return {
    address: wallet.address,
    email: email.toLowerCase().trim(),
    createdAt: Date.now(),
  };
}

// ───────────────────────────────────────────────
// 5. Get wallet balance (Mainnet)
// ───────────────────────────────────────────────
export async function getWalletBalance(address: string): Promise<string> {
  const publicClient = createPublicClient({
    chain: liskMainnet,
    transport: http(liskMainnet.rpcUrls.default.http[0]),
  });

  try {
    const bal = await publicClient.getBalance({ address: address as `0x${string}` });
    return (Number(bal) / 1e18).toFixed(4);
  } catch (err) {
    console.error("Balance fetch failed:", err);
    return "0.0000";
  }
}

// ───────────────────────────────────────────────
// 6. Disabled faucet (Mainnet cannot mint test ETH)
// ───────────────────────────────────────────────
export async function fundWalletWithTestETH(): Promise<boolean> {
  console.warn("⛔ fundWalletWithTestETH disabled — Mainnet does not support test ETH.");
  return false;
}


