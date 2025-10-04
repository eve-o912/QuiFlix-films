import { defineChain } from 'viem'

export const liskSepolia = defineChain({
  id: 4202,
  name: 'Lisk Sepolia',
  network: 'lisk-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia-api.lisk.com'],
    },
    public: {
      http: ['https://rpc.sepolia-api.lisk.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Lisk Sepolia Explorer', url: 'https://sepolia-blockscout.lisk.com' },
  },
  testnet: true,
})
