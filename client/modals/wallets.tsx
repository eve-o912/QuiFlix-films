'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/hooks/useWeb3';
import { useRouter } from 'next/navigation';

interface WalletsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
  trigger?: React.ReactNode;
}

export function WalletsModal({ open, onOpenChange, redirectTo, trigger }: WalletsModalProps) {
  const { connectWallet, isConnected } = useWeb3();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
      if (redirectTo) {
        router.push(redirectTo);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleContinueWithGoogle = () => {
    // For now, just redirect without wallet connection
    if (redirectTo) {
      router.push(redirectTo);
    }
    onOpenChange(false);
  };

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Your Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to access QuiFlix or continue with Google to get started without crypto.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting || isConnected}
                className="w-full"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    or
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleContinueWithGoogle}
                className="w-full"
              >
                Continue with Google
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              No wallet? No problem. Buy directly and claim your NFT anytime.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
