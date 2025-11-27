import { defineChain } from 'viem';

// Base Mainnet
export const baseMainnet = defineChain({
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
    public: { http: ['https://mainnet.base.org'] }
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://basescan.org' }
  }
});

// Lisk Mainnet
export const liskMainnet = defineChain({
  id: 1135,
  name: 'Lisk',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.api.lisk.com'] },
    public: { http: ['https://rpc.api.lisk.com'] }
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://blockscout.lisk.com' }
  }
});

// Base Sepolia Testnet (for testing)
export const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] }
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' }
  },
  testnet: true
});
