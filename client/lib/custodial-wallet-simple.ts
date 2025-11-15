import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http, WalletClient, createPublicClient } from 'viem';
import { liskSepolia } from './chains';

export interface CustodialWallet {
  address: string;
  privateKey: string;
}

export interface StoredWallet {
  address: string;
  email: string;
  createdAt: number;
}

// ERC-20 minimal ABI (balanceOf, decimals)
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
];

// Token addresses can be provided via environment variables. Default to empty string
export const USDT_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS || '';
export const USDC_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '';

// Minimal ERC-721 ABI for transferring NFTs
export const ERC721_ABI = [
  {
    constant: false,
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    type: 'function',
  },
];

// ERC-721 Enumerable minimal ABI: balanceOf + tokenOfOwnerByIndex + tokenURI (optional)
const ERC721_ENUMERABLE_ABI = [
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: 'uri', type: 'string' }],
    type: 'function',
  },
];

/**
 * Get owned NFTs for a given address across a list of ERC-721 contracts.
 * This attempts to use ERC-721 Enumerable's tokenOfOwnerByIndex. If the contract
 * doesn't implement enumeration, it will skip that contract.
 */
export async function getOwnedNfts(address: string, contractAddresses: string[]): Promise<Array<{ contract: string; tokenId: string; tokenURI?: string }>> {
  const publicClient = createPublicClient({
    chain: liskSepolia,
    transport: http(liskSepolia.rpcUrls.default.http[0]),
  });

  const results: Array<{ contract: string; tokenId: string; tokenURI?: string }> = [];

  for (const contract of contractAddresses) {
    if (!contract) continue;

    try {
      const balanceRaw = await publicClient.readContract({
        address: contract as `0x${string}`,
        abi: ERC721_ENUMERABLE_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      }) as bigint;

      const balance = Number(balanceRaw ?? 0);
      for (let i = 0; i < balance; i++) {
        try {
          const tokenIdRaw = await publicClient.readContract({
            address: contract as `0x${string}`,
            abi: ERC721_ENUMERABLE_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [address as `0x${string}`, BigInt(i)],
          }) as bigint;

          const tokenId = tokenIdRaw.toString();

          // try to read tokenURI (optional)
          let tokenURI: string | undefined = undefined;
          try {
            const uri = await publicClient.readContract({
              address: contract as `0x${string}`,
              abi: ERC721_ENUMERABLE_ABI,
              functionName: 'tokenURI',
              args: [BigInt(tokenId)],
            }) as string;
            tokenURI = uri;
          } catch (err) {
            // tokenURI not available or failed - ignore
          }

          results.push({ contract, tokenId, tokenURI });
        } catch (err) {
          // tokenOfOwnerByIndex likely not supported or failed for this index - skip
        }
      }
    } catch (err) {
      // balanceOf failed or contract doesn't implement expected functions - skip contract
      console.warn(`Skipping contract ${contract} for NFT enumeration:`, err);
    }
  }

  return results;
}

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
  const secret = process.env.NEXT_PUBLIC_SECRET_SALT; // In production, use environment variable
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
    chain: liskSepolia,
    transport: http(liskSepolia.rpcUrls.default.http[0]),
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
    chain: liskSepolia,
    transport: http(liskSepolia.rpcUrls.default.http[0]),
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
 * Get ERC-20 token balance for `address` for the token at `tokenAddress`.
 * Returns a formatted string (human readable) with 4 decimals.
 */
export async function getTokenBalance(address: string, tokenAddress: string): Promise<string> {
  if (!tokenAddress) return '0.0000';

  const publicClient = createPublicClient({
    chain: liskSepolia,
    transport: http(liskSepolia.rpcUrls.default.http[0]),
  });

  try {
    // Read decimals
    const decimals = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'decimals',
      args: [],
    }) as bigint | number;

    // Read balanceOf
    const balanceRaw = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    }) as bigint;

    const dec = typeof decimals === 'bigint' ? Number(decimals) : Number(decimals);
    const bn = BigInt(balanceRaw as bigint);

    if (dec === 0) {
      return bn.toString();
    }

    // Compute 10^dec as a BigInt without using bigint literals (10n) or the ** operator
    let divisor = BigInt(1);
    const base = BigInt(10);
    for (let i = 0; i < dec; i++) {
      divisor *= base;
    }

    const whole = bn / divisor;
    const fraction = bn % divisor;

    const fractionFloat = Number(fraction) / Number(divisor);
    const value = Number(whole) + fractionFloat;

    return value.toFixed(4);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0.0000';
  }
}

/**
 * Fund wallet with test ETH (development only)
 */
export async function fundWalletWithTestETH(address: string, amount: string = '1'): Promise<boolean> {
  // This helper previously used a hardcoded Hardhat key. For deployments to real networks
  // we avoid auto-funding. If you want to enable funding in development, provide
  // a TEST_FUNDING_PRIVATE_KEY environment variable (dev only).
  const fundingPrivateKey = process.env.TEST_FUNDING_PRIVATE_KEY;
  if (!fundingPrivateKey) {
    console.warn('TEST_FUNDING_PRIVATE_KEY not set - skipping auto-fund');
    return false;
  }

  try {
    const fundingClient = createWalletClientFromPrivateKey(fundingPrivateKey);

    const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));

    const hash = await fundingClient.sendTransaction({
      account: fundingClient.account!,
      chain: liskSepolia,
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