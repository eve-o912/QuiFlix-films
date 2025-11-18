'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { liskSepolia } from '@/lib/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { type State } from 'wagmi';

const config = createConfig({
  chains: [liskSepolia],
  connectors: [
    injected({
      shimDisconnect: false,
    })
  ],
  transports: {
    [liskSepolia.id]: http('https://rpc.sepolia-api.lisk.com'),
  },
  ssr: true, // Enable SSR support
});

interface Web3ProviderProps {
  children: ReactNode;
  initialState?: State;
}

export function Web3Provider({ children, initialState }: Web3ProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
