import { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { auth, db } from '@/firebase.config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from './ui/button';
import { WalletSelection } from './WalletSelection';
import { Wallet, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function WalletButton() {
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [custodialAddress, setCustodialAddress] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Check for custodial wallet on component mount and auth changes
  useEffect(() => {
    const checkCustodialWallet = async (userId: string) => {
      try {
        const walletsRef = collection(db, 'custodial_wallets');
        const q = query(
          walletsRef,
          where('user_id', '==', userId),
          where('network', '==', 'base'),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const walletData = querySnapshot.docs[0].data();
          setCustodialAddress(walletData.wallet_address);
        } else {
          setCustodialAddress(null);
        }
      } catch (error) {
        console.error('Error fetching custodial wallet:', error);
        setCustodialAddress(null);
      }
    };
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkCustodialWallet(user.uid);
      } else {
        setCustodialAddress(null);
      }
    });
    
    return () => unsubscribe();
  }, []);

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
        onWalletConnected={async () => {
          // Refresh custodial wallet status
          const user = auth.currentUser;
          if (user) {
            try {
              const walletsRef = collection(db, 'custodial_wallets');
              const q = query(
                walletsRef,
                where('user_id', '==', user.uid),
                where('network', '==', 'base'),
                limit(1)
              );
              
              const querySnapshot = await getDocs(q);
              
              if (!querySnapshot.empty) {
                const walletData = querySnapshot.docs[0].data();
                setCustodialAddress(walletData.wallet_address);
              }
            } catch (error) {
              console.error('Error refreshing wallet:', error);
            }
          }
        }}
      />
    </>
  );
}
