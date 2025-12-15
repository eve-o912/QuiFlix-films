import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Wallet, Loader2, TrendingUp, Sparkles, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { USDC_ABI, CONTRACT_ADDRESSES } from '@/config/contracts';
import { USDC_ADDRESSES } from '@/config/web3';
import { db, auth } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { WalletSelection } from './WalletSelection';

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filmId: string;
  filmTitle: string;
  directPrice: number;
  nftPrice: number;
  investmentPricePerShare?: number;
  availableShares?: number;
}

export function PurchaseDialog({ 
  open, 
  onOpenChange, 
  filmId, 
  filmTitle, 
  directPrice,
  nftPrice,
  investmentPricePerShare = 0,
  availableShares = 0
}: PurchaseDialogProps) {
  const [purchaseType, setPurchaseType] = useState<'nft' | 'direct' | 'investment'>('nft');
  const [network, setNetwork] = useState<'base' | 'lisk' | 'scroll' | 'celo'>('base');
  const [shares, setShares] = useState(1);
  const [step, setStep] = useState<'select' | 'approve' | 'purchase'>('select');
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const investmentAvailable = availableShares > 0 && investmentPricePerShare > 0;
  
  const getPrice = () => {
    if (purchaseType === 'investment') return (investmentPricePerShare * shares).toFixed(2);
    if (purchaseType === 'nft') return nftPrice.toFixed(2);
    return directPrice.toFixed(2);
  };

  const handleApprove = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const price = getPrice();
      const amountInUSDC = parseUnits(price, 6);
      const contractAddress = purchaseType === 'nft' 
        ? CONTRACT_ADDRESSES[network].nft 
        : CONTRACT_ADDRESSES[network].content;

      setStep('approve');
      
      writeContract({
        address: USDC_ADDRESSES[network] as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [contractAddress, amountInUSDC],
      } as any);
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setStep('select');
    }
  };

  const recordPurchase = async (txHash: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const price = parseFloat(getPrice());

      if (purchaseType === 'investment') {
        // Record investment in Firebase
        await addDoc(collection(db, 'investments'), {
          investor_id: user.uid,
          film_id: filmId,
          shares_owned: shares,
          amount_invested: price,
          tx_hash: txHash,
          created_at: serverTimestamp(),
          earnings_claimed: 0,
        });
      } else {
        // Record purchase in Firebase
        await addDoc(collection(db, 'purchases'), {
          user_id: user.uid,
          film_id: filmId,
          purchase_type: purchaseType,
          amount: price,
          network: network,
          tx_hash: txHash,
          currency: 'USDC',
          created_at: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Failed to record purchase:', error);
    }
  };

  const handlePurchase = async () => {
    toast({
      title: "Purchase Initiated",
      description: "Your transaction is being processed on the blockchain.",
    });
    setStep('purchase');
    
    // Record in database (in production, this would be after actual tx confirmation)
    if (hash) {
      await recordPurchase(hash);
    }
  };

  if (isSuccess && step === 'approve') {
    setTimeout(() => {
      toast({
        title: "USDC Approved! ✓",
        description: "Now completing your purchase...",
      });
      handlePurchase();
    }, 1000);
  }

  if (isSuccess && step === 'purchase') {
    setTimeout(() => {
      const successMessage = purchaseType === 'investment' 
        ? `You now own ${shares} shares of ${filmTitle}. Earn when fans watch!`
        : `You now own ${filmTitle}. Enjoy your film!`;
      
      toast({
        title: "Purchase Successful! 🎉",
        description: successMessage,
      });
      setStep('select');
      reset();
      onOpenChange(false);
    }, 1000);
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        setStep('select');
        reset();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{filmTitle}</DialogTitle>
          <DialogDescription>
            Pick how you want to watch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Purchase Type Selection */}
          <div className="space-y-2">
            <RadioGroup value={purchaseType} onValueChange={(v) => setPurchaseType(v as 'nft' | 'direct' | 'investment')}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer">
                <RadioGroupItem value="direct" id="direct" />
                <Label htmlFor="direct" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Watch now</span>
                    </div>
                    <span className="text-primary font-semibold">${directPrice}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Stream anytime</p>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer">
                <RadioGroupItem value="nft" id="nft" />
                <Label htmlFor="nft" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Own it (NFT)</span>
                    </div>
                    <span className="text-primary font-semibold">${nftPrice}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Resell or collect</p>
                </Label>
              </div>

              {investmentAvailable && (
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer">
                  <RadioGroupItem value="investment" id="investment" />
                  <Label htmlFor="investment" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="font-medium">Back this film</span>
                      </div>
                      <span className="text-primary font-semibold">${investmentPricePerShare}/share</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{availableShares} shares left • earn when it sells</p>
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Shares Input for Investment */}
          {purchaseType === 'investment' && (
            <div className="space-y-2">
              <Label className="text-sm">How many shares?</Label>
              <Input
                type="number"
                min={1}
                max={availableShares}
                value={shares}
                onChange={(e) => setShares(Math.min(parseInt(e.target.value) || 1, availableShares))}
                className="bg-secondary border-border"
              />
            </div>
          )}

          {/* Network Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Pay with USDC on</Label>
            <RadioGroup value={network} onValueChange={(v) => setNetwork(v as 'base' | 'lisk' | 'scroll' | 'celo')}>
              <div className="flex gap-2">
                {['base', 'lisk', 'scroll', 'celo'].map((n) => (
                  <div key={n} className="flex-1">
                    <RadioGroupItem value={n} id={n} className="peer sr-only" />
                    <Label
                      htmlFor={n}
                      className="flex items-center justify-center rounded-lg border border-border p-2 cursor-pointer hover:bg-secondary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 text-sm capitalize"
                    >
                      {n}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-3 border-t border-border">
            <span className="text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{getPrice()} USDC</span>
          </div>

          {/* Purchase Button */}
          <Button
            onClick={isConnected ? handleApprove : () => setShowWalletDialog(true)}
            disabled={isPending || isConfirming}
            className="w-full"
            size="lg"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {step === 'approve' ? 'Approving...' : 'Processing...'}
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                {isConnected 
                  ? purchaseType === 'investment' 
                    ? `Back with ${getPrice()} USDC` 
                    : `Pay ${getPrice()} USDC`
                  : 'Connect wallet to pay'}
              </>
            )}
          </Button>

          {!isConnected && (
            <p className="text-xs text-center text-muted-foreground">
              Click above to connect your wallet
            </p>
          )}
        </div>

        <WalletSelection 
          open={showWalletDialog} 
          onOpenChange={setShowWalletDialog}
        />
      </DialogContent>
    </Dialog>
  );
}
