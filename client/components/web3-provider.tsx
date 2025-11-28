'use client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
// IMPORT UPDATED MAINNET CHAINS
import { baseMainnet, liskMainnet } from '@/lib/chains';

const config = createConfig({
  chains: [
    baseMainnet,
    liskMainnet         // Using MAINNET — removed liskSepolia testnet
  ],
  connectors: [
    injected({ shimDisconnect: false })
  ],
  transports: {
    [baseMainnet.id]: http('https://mainnet.base.org'),
    [liskMainnet.id]: http('https://rpc.api.lisk.com'),
  },
  ssr: true,
});

// Changed to named export
export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}


