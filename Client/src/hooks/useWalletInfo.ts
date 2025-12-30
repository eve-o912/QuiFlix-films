import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase.config';

export type WalletType = 'metamask' | 'coinbase' | 'custodial' | 'none';

export interface WalletInfo {
  address: string | null;
  walletType: WalletType;
  isConnected: boolean;
  chainId: number | undefined;
  chainName: string;
  isCustodial: boolean;
  custodialNetwork?: string;
}

/**
 * Custom hook that combines Wagmi's useAccount with Firebase custodial wallet lookup
 * Returns comprehensive wallet information including type (MetaMask, Coinbase, Custodial)
 */
export function useWalletInfo(): WalletInfo {
  const { address: externalAddress, isConnected: isExternalConnected, connector } = useAccount();
  const chainId = useChainId();
  const [custodialWallet, setCustodialWallet] = useState<{ address: string; network: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch custodial wallet from Firestore
  useEffect(() => {
    if (!userId) {
      setCustodialWallet(null);
      return;
    }

    const fetchCustodialWallet = async () => {
      try {
        // Check both 'wallets' and 'custodial_wallets' collections
        const walletDoc = await getDoc(doc(db, 'wallets', userId));
        if (walletDoc.exists()) {
          const data = walletDoc.data();
          setCustodialWallet({
            address: data.wallet_address,
            network: data.network || 'Lisk',
          });
          return;
        }

        const custodialDoc = await getDoc(doc(db, 'custodial_wallets', userId));
        if (custodialDoc.exists()) {
          const data = custodialDoc.data();
          setCustodialWallet({
            address: data.address,
            network: data.network || 'Lisk',
          });
        }
      } catch (error) {
        console.error('Error fetching custodial wallet:', error);
      }
    };

    fetchCustodialWallet();
  }, [userId]);

  // Determine wallet type based on connector
  const getWalletType = (): WalletType => {
    if (isExternalConnected && connector) {
      const connectorName = connector.name.toLowerCase();
      if (connectorName.includes('metamask')) return 'metamask';
      if (connectorName.includes('coinbase')) return 'coinbase';
      return 'metamask'; // Default for unknown external wallets
    }
    if (custodialWallet) return 'custodial';
    return 'none';
  };

  // Get chain name from chainId
  const getChainName = (): string => {
    const chainNames: Record<number, string> = {
      8453: 'Base',
      4202: 'Lisk Sepolia',
      1135: 'Lisk',
      534352: 'Scroll',
      42220: 'Celo',
      1: 'Ethereum',
      31337: 'Localhost',
    };
    return chainNames[chainId || 0] || 'Unknown';
  };

  const walletType = getWalletType();
  const isCustodial = walletType === 'custodial';
  
  return {
    address: externalAddress || custodialWallet?.address || null,
    walletType,
    isConnected: isExternalConnected || !!custodialWallet,
    chainId: isCustodial ? undefined : chainId,
    chainName: isCustodial ? (custodialWallet?.network || 'Lisk') : getChainName(),
    isCustodial,
    custodialNetwork: custodialWallet?.network,
  };
}
