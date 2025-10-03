import { createPublicClient, createWalletClient, http, getContract } from 'viem';
import { lisk } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Contract addresses (from our local deployment)
export const CONTRACT_ADDRESSES = {
  QuiFlixNFT: process.env.NEXT_PUBLIC_QUIFLIX_NFT_CONTRACT_ADDRESS,
  QuiFlixContent: process.env.NEXT_PUBLIC_QUIFLIX_CONTENT_CONTRACT_ADDRESS,
} as const;

// Contract ABIs (simplified for frontend)
export const QUIFLIX_NFT_ABI = [
  {
    "inputs": [
      {"name": "_title", "type": "string"},
      {"name": "_description", "type": "string"},
      {"name": "_genre", "type": "string"},
      {"name": "_duration", "type": "uint256"},
      {"name": "_releaseDate", "type": "uint256"},
      {"name": "_ipfsHash", "type": "string"},
      {"name": "_price", "type": "uint256"},
      {"name": "_tokenURI", "type": "string"}
    ],
    "name": "createFilm",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_tokenId", "type": "uint256"}],
    "name": "purchaseFilm",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_tokenId", "type": "uint256"}],
    "name": "getFilmMetadata",
    "outputs": [
      {
        "components": [
          {"name": "title", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "genre", "type": "string"},
          {"name": "duration", "type": "uint256"},
          {"name": "releaseDate", "type": "uint256"},
          {"name": "producer", "type": "address"},
          {"name": "ipfsHash", "type": "string"},
          {"name": "price", "type": "uint256"},
          {"name": "isActive", "type": "bool"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_tokenId", "type": "uint256"},
      {"name": "_salePrice", "type": "uint256"}
    ],
    "name": "royaltyInfo",
    "outputs": [
      {"name": "", "type": "address"},
      {"name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "tokenId", "type": "uint256"},
      {"indexed": true, "name": "producer", "type": "address"},
      {"indexed": false, "name": "title", "type": "string"},
      {"indexed": false, "name": "price", "type": "uint256"}
    ],
    "name": "FilmCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "tokenId", "type": "uint256"},
      {"indexed": true, "name": "buyer", "type": "address"},
      {"indexed": false, "name": "price", "type": "uint256"}
    ],
    "name": "FilmPurchased",
    "type": "event"
  }
] as const;

export const QUIFLIX_CONTENT_ABI = [
  {
    "inputs": [
      {"name": "_title", "type": "string"},
      {"name": "_ipfsHash", "type": "string"}
    ],
    "name": "createContent",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_contentId", "type": "uint256"}],
    "name": "recordView",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_contentId", "type": "uint256"}],
    "name": "getContent",
    "outputs": [
      {
        "components": [
          {"name": "contentId", "type": "uint256"},
          {"name": "title", "type": "string"},
          {"name": "ipfsHash", "type": "string"},
          {"name": "producer", "type": "address"},
          {"name": "totalRevenue", "type": "uint256"},
          {"name": "totalViews", "type": "uint256"},
          {"name": "isActive", "type": "bool"},
          {"name": "createdAt", "type": "uint256"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Create public client for read operations
export const publicClient = createPublicClient({
  chain: lisk,
  transport: http('https://rpc.sepolia-api.lisk.com'),
});

// Helper function to get contract instances
export const getQuiFlixNFTContract = () => {
  return getContract({
    address: CONTRACT_ADDRESSES.QuiFlixNFT as `0x${string}`,
    abi: QUIFLIX_NFT_ABI,
    client: publicClient,
  });
};

export const getQuiFlixContentContract = () => {
  return getContract({
    address: CONTRACT_ADDRESSES.QuiFlixContent as `0x${string}`,
    abi: QUIFLIX_CONTENT_ABI,
    client: publicClient,
  });
};

// Utility functions
export const formatEther = (value: bigint) => {
  return (Number(value) / 1e18).toFixed(4);
};

export const parseEther = (value: string) => {
  return BigInt(Math.floor(parseFloat(value) * 1e18));
};
