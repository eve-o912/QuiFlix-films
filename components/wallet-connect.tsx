'use client';

import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function WalletConnect() {
  const { address, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="flex items-center gap-2">
        <div className="h-2 w-2 bg-green-500 rounded-full" />
        {formatAddress(address!)}
      </Badge>
      
      <Button
        variant="outline"
        size="sm"
        onClick={copyAddress}
        className="flex items-center gap-1"
      >
        {copied ? (
          <Check className="h-3 w-3" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={disconnectWallet}
        className="flex items-center gap-1"
      >
        <LogOut className="h-3 w-3" />
      </Button>
    </div>
  );
}
