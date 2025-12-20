import { useState } from 'react';
import { useConnect } from 'wagmi';
import { auth } from '@/firebase.config';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Wallet, Shield, Loader2, CreditCard, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WalletSelectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWalletConnected?: () => void;
}

export function WalletSelection({ open, onOpenChange, onWalletConnected }: WalletSelectionProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { connect, connectors } = useConnect();

  const handleCustodialWallet = async () => {
    setLoading('custodial');
    try {
      const user = auth.currentUser;
      
      if (!user) {
        toast({
          title: 'Sign in first',
          description: 'You need an account to create a wallet',
          variant: 'destructive',
        });
        setLoading(null);
        return;
      }

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Call Firebase Cloud Function
      const response = await fetch('YOUR_FIREBASE_FUNCTION_URL/generateWallet', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ network: 'base' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate wallet');
      }

      const data = await response.json();

      toast({
        title: 'Wallet ready!',
        description: `Address: ${data.wallet_address.slice(0, 6)}...${data.wallet_address.slice(-4)}`,
      });

      onWalletConnected?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Something went wrong',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleExternalWallet = async (type: 'metamask' | 'coinbase') => {
    setLoading(type);
    
    // Find connector by type - use 'injected' for MetaMask and 'coinbaseWalletSDK' for Coinbase
    const connector = type === 'metamask' 
      ? connectors.find(c => c.id === 'injected' || c.id === 'metaMask' || c.name?.toLowerCase().includes('metamask'))
      : connectors.find(c => c.id === 'coinbaseWalletSDK' || c.name?.toLowerCase().includes('coinbase'));

    if (!connector) {
      const walletName = type === 'metamask' ? 'MetaMask' : 'Coinbase Wallet';
      toast({
        title: `${walletName} not found`,
        description: `Please install ${walletName} extension to continue`,
        variant: 'destructive',
      });
      setLoading(null);
      return;
    }

    try {
      await connect({ connector }, {
        onSuccess: () => {
          toast({
            title: 'Connected!',
            description: 'You\'re all set to buy films',
          });
          onWalletConnected?.();
          onOpenChange(false);
          setLoading(null);
        },
        onError: (error) => {
          toast({
            title: 'Connection failed',
            description: error.message || 'Could not connect wallet',
            variant: 'destructive',
          });
          setLoading(null);
        }
      });
    } catch (error: any) {
      toast({
        title: 'Connection failed',
        description: error.message || 'Could not connect wallet',
        variant: 'destructive',
      });
      setLoading(null);
    }
  };

  const handleOnramp = () => {
    window.open('https://www.moonpay.com/buy/usdc', '_blank');
    toast({
      title: 'Buying USDC',
      description: 'Complete your purchase, then come back and connect',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-xl">How do you want to pay?</DialogTitle>
          <DialogDescription>
            Pick your preferred wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Custodial - Easiest */}
          <Button
            variant="outline"
            onClick={handleCustodialWallet}
            disabled={loading !== null}
            className="w-full h-auto p-4 justify-start gap-4 hover:border-primary/50"
          >
            <div className="rounded-lg bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium">QuiFlix Wallet</p>
              <p className="text-sm text-muted-foreground">No setup needed</p>
            </div>
            {loading === 'custodial' && <Loader2 className="h-4 w-4 animate-spin" />}
          </Button>

          {/* MetaMask */}
          <Button
            variant="outline"
            onClick={() => handleExternalWallet('metamask')}
            disabled={loading !== null}
            className="w-full h-auto p-4 justify-start gap-4 hover:border-primary/50"
          >
            <div className="rounded-lg bg-orange-500/10 p-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="h-5 w-5" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium">MetaMask</p>
              <p className="text-sm text-muted-foreground">Browser extension</p>
            </div>
            {loading === 'metamask' && <Loader2 className="h-4 w-4 animate-spin" />}
          </Button>

          {/* Coinbase */}
          <Button
            variant="outline"
            onClick={() => handleExternalWallet('coinbase')}
            disabled={loading !== null}
            className="w-full h-auto p-4 justify-start gap-4 hover:border-primary/50"
          >
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Wallet className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium">Coinbase Wallet</p>
              <p className="text-sm text-muted-foreground">Mobile or extension</p>
            </div>
            {loading === 'coinbase' && <Loader2 className="h-4 w-4 animate-spin" />}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Buy USDC */}
          <Button
            variant="ghost"
            onClick={handleOnramp}
            className="w-full h-auto p-4 justify-start gap-4"
          >
            <div className="rounded-lg bg-green-500/10 p-2">
              <CreditCard className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium">Buy USDC first</p>
              <p className="text-sm text-muted-foreground">Card, bank, or M-Pesa</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
