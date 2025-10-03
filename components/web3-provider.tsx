'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { lisk } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { type State } from 'wagmi';

const config = createConfig({
  chains: [lisk],
  connectors: [injected()],
  transports: {
    [lisk.id]: http('https://rpc.sepolia-api.lisk.com'),
  },
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
