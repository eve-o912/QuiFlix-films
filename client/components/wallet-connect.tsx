'use client';

import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

export function WalletConnect() {
  const { isConnected, connectWallet } = useWeb3();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button disabled className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  if (isConnected) {
    return null; // Header handles connected state
  }

  return (
    <Button onClick={connectWallet} className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
