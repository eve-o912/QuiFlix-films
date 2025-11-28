import { createPublicClient, createWalletClient, http, getContract } from 'viem';
import { liskMainnet } from './chains'; // Updated from liskSepolia
import { privateKeyToAccount } from 'viem/accounts';

//  ───────────────────────────────────────────────
//  UPDATE THESE WITH YOUR DEPLOYED MAINNET CONTRACTS
//  ───────────────────────────────────────────────
export const CONTRACT_ADDRESSES = {
  QuiFlixNFT: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  QuiFlixContent: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
} as const;

// ABIs stay unchanged…
export const QUIFLIX_NFT_ABI = [ /* … */ ] as const;
export const QUIFLIX_CONTENT_ABI = [ /* … */ ] as const;

//  ───────────────────────────────────────────────
//  Public client for READ operations (MAINNET)
//  ───────────────────────────────────────────────
export const publicClient = createPublicClient({
  chain: liskMainnet,
  transport: http('https://rpc.api.lisk.com'),
});

// Contract Access Helpers
export const getQuiFlixNFTContract = () =>
  getContract({
    address: CONTRACT_ADDRESSES.QuiFlixNFT,
    abi: QUIFLIX_NFT_ABI,
    client: publicClient,
  });

export const getQuiFlixContentContract = () =>
  getContract({
    address: CONTRACT_ADDRESSES.QuiFlixContent,
    abi: QUIFLIX_CONTENT_ABI,
    client: publicClient,
  });

// Formatters
export const formatEther = (value: bigint) =>
  (Number(value) / 1e18).toFixed(4);

export const parseEther = (value: string) =>
  BigInt(Math.floor(parseFloat(value) * 1e18));

