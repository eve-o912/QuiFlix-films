import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http, WalletClient, createPublicClient } from 'viem';
import { lisk } from 'viem/chains';

export interface CustodialWallet {
  address: string;
  privateKey: string;
}

export interface StoredWallet {
  address: string;
  email: string;
  createdAt: number;
  encrypted?: string;
}

// AES-GCM encryption helpers for client-side encrypted storage
async function deriveKey(email: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pepper = process.env.NEXT_PUBLIC_CUSTODIAL_PEPPER || '';
  const material = await crypto.subtle.importKey(
    'raw',
    encoder.encode(email.toLowerCase().trim() + ':' + pepper),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' } as Pbkdf2Params,
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function toBase64(bytes: Uint8Array): string {
  if (typeof window !== 'undefined') {
    return btoa(String.fromCharCode(...Array.from(bytes)));
  }
  return Buffer.from(bytes).toString('base64');
}

function fromBase64(b64: string): Uint8Array {
  if (typeof window !== 'undefined') {
    const bin = atob(b64);
    return new Uint8Array([...bin].map(c => c.charCodeAt(0)));
  }
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

export async function encryptPrivateKeyForEmail(email: string, privateKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(email, salt);
  const plaintext = encoder.encode(privateKey);
  const ivBuf = (iv.byteOffset === 0 && iv.byteLength === iv.buffer.byteLength)
    ? iv.buffer
    : iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength);
  const ptBuf = (plaintext.byteOffset === 0 && plaintext.byteLength === plaintext.buffer.byteLength)
    ? plaintext.buffer
    : plaintext.buffer.slice(plaintext.byteOffset, plaintext.byteOffset + plaintext.byteLength);
  const ciphertextBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: ivBuf }, key, ptBuf);
  const ciphertext = new Uint8Array(ciphertextBuf as ArrayBuffer);
  return `${toBase64(salt)}.${toBase64(iv)}.${toBase64(ciphertext)}`;
}

export async function decryptPrivateKeyForEmail(email: string, payload: string): Promise<string> {
  const [saltB64, ivB64, ctB64] = payload.split('.');
  const salt = fromBase64(saltB64);
  const iv = fromBase64(ivB64);
  const ciphertext = fromBase64(ctB64);
  const key = await deriveKey(email, salt);
  const ivBuf = (iv.byteOffset === 0 && iv.byteLength === iv.buffer.byteLength)
    ? iv.buffer
    : iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength);
  const ctBuf = (ciphertext.byteOffset === 0 && ciphertext.byteLength === ciphertext.buffer.byteLength)
    ? ciphertext.buffer
    : ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBuf }, key, ctBuf);
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
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
    chain: lisk,
    transport: http('https://rpc.sepolia-api.lisk.com'),
  });
}

/**
 * Store wallet info in localStorage
 */
export async function createStoredWallet(email: string, wallet: CustodialWallet): Promise<StoredWallet> {
  const encrypted = await encryptPrivateKeyForEmail(email, wallet.privateKey);
  return {
    address: wallet.address,
    email: email.toLowerCase().trim(),
    createdAt: Date.now(),
    encrypted,
  };
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(address: string): Promise<string> {
  const publicClient = createPublicClient({
    chain: lisk,
    transport: http('https://rpc.sepolia-api.lisk.com'),
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
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Funding disabled outside development');
      return false;
    }
    const fundingPrivateKey = (process.env.NEXT_PUBLIC_DEV_FUNDING_PRIVATE_KEY as `0x${string}`) || '';
    if (!fundingPrivateKey) {
      console.warn('DEV funding key not set');
      return false;
    }
    const fundingClient = createWalletClientFromPrivateKey(fundingPrivateKey);
    
    const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
    
    const hash = await fundingClient.sendTransaction({
      account: fundingClient.account!,
      chain: lisk,
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