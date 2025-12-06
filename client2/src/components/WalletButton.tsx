import { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { WalletSelection } from './WalletSelection';
import { Wallet, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function WalletButton() {
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [custodialAddress, setCustodialAddress] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { currentUser } = useAuth();

  // Check for custodial wallet when user logs in
  useEffect(() => {
    const checkCustodialWallet = async () => {
      if (currentUser) {
        // In production, fetch from your backend
        // For now, check localStorage or create one
        const savedWallet = localStorage.getItem(`wallet_${currentUser.uid}`);
        if (savedWallet) {
          setCustodialAddress(savedWallet);
        }
      } else {
        setCustodialAddress(null);
      }
    };
    checkCustodialWallet();
  }, [currentUser]);

  const handleDisconnect = () => {
    if (isConnected) {
      disconnect();
    }
    setCustodialAddress(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const displayAddress = address || custodialAddress;

  if (displayAddress) {
    return (
      <Button
        variant="outline"
        onClick={handleDisconnect}
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
        <LogOut className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setShowWalletDialog(true)} className="gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
      <WalletSelection 
        open={showWalletDialog} 
        onOpenChange={setShowWalletDialog}
        onWalletConnected={(walletAddress) => {
          // Save wallet address
          if (currentUser && walletAddress) {
            localStorage.setItem(`wallet_${currentUser.uid}`, walletAddress);
            setCustodialAddress(walletAddress);
          }
        }}
      />
    </>
  );
}
