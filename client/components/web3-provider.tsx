'use client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { liskSepolia } from '@/lib/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { type State } from 'wagmi';

// Import the mainnet chains
import { baseMainnet, liskMainnet } from '@/lib/chains'; // You'll create this

const config = createConfig({
  chains: [
    liskSepolia,      // Keep testnet for testing
    baseMainnet,      // Add Base mainnet
    liskMainnet       // Add Lisk mainnet
  ],
  connectors: [
    injected({
      shimDisconnect: false,
    })
  ],
  transports: {
    [liskSepolia.id]: http('https://rpc.sepolia-api.lisk.com'),
    [baseMainnet.id]: http('https://mainnet.base.org'),
    [liskMainnet.id]: http('https://rpc.api.lisk.com'),
  },
  ssr: true,
});

// ... rest of your code stays the same

