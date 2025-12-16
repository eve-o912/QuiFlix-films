import { createConfig, http } from 'wagmi';
import { base, mainnet, scroll } from 'wagmi/chains';
import { injected, coinbaseWallet } from 'wagmi/connectors';

// Lisk Network Configuration
export const lisk = {
  id: 1135,
  name: 'Lisk',
  network: 'lisk',
  nativeCurrency: {
    decimals: 18,
    name: 'Lisk',
    symbol: 'LSK',
  },
  rpcUrls: {
    default: { http: ['https://rpc.api.lisk.com'] },
    public: { http: ['https://rpc.api.lisk.com'] },
  },
  blockExplorers: {
    default: { name: 'Lisk Explorer', url: 'https://blockscout.lisk.com' },
  },
} as const;

// Celo Network Configuration
export const celo = {
  id: 42220,
  name: 'Celo',
  network: 'celo',
  nativeCurrency: {
    decimals: 18,
    name: 'Celo',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: { http: ['https://forno.celo.org'] },
    public: { http: ['https://forno.celo.org'] },
  },
  blockExplorers: {
    default: { name: 'Celo Explorer', url: 'https://celoscan.io' },
  },
} as const;

// USDC Contract Addresses
export const USDC_ADDRESSES = {
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  lisk: '0x05D032ac25d322df992303dCa074EE7392C117b9',
  scroll: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
  celo: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
} as const;

export const config = createConfig({
  chains: [base, lisk, scroll, celo, mainnet],
  connectors: [
    injected({
      target: 'metaMask',
    }),
    coinbaseWallet({
      appName: 'QuiFlix',
    }),
  ],
  transports: {
    [base.id]: http(),
    [lisk.id]: http(),
    [scroll.id]: http(),
    [celo.id]: http(),
    [mainnet.id]: http(),
  },
});
