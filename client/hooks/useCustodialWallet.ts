'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  CustodialWallet, 
  StoredWallet, 
  generateWalletFromEmail, 
  createStoredWallet, 
  getWalletBalance,
  fundWalletWithTestETH,
  createWalletClientFromPrivateKey
} from '@/lib/custodial-wallet-simple';
import { WalletClient } from 'viem';

export interface CustodialWalletState {
  wallet: CustodialWallet | null;
  walletClient: WalletClient | null;
  balance: string;
  isLoading: boolean;
  error: string | null;
}

export const useCustodialWallet = () => {
  const { currentUser, userLoggedIn } = useAuth();
  const [state, setState] = useState<CustodialWalletState>({
    wallet: null,
    walletClient: null,
    balance: '0.0000',
    isLoading: false,
    error: null
  });

  // Generate or retrieve wallet when user logs in
  useEffect(() => {
    if (userLoggedIn && currentUser?.email) {
      initializeWallet(currentUser.email);
    } else {
      // Clear wallet when user logs out
      setState(prev => ({
        ...prev,
        wallet: null,
        walletClient: null,
        balance: '0.0000'
      }));
    }
  }, [userLoggedIn, currentUser]);

  const initializeWallet = async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Check if we're on the client side before accessing localStorage
      if (typeof window === 'undefined') {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Check if wallet exists in localStorage
      const storedWalletKey = `custodial_wallet_${email}`;
      const storedWalletData = localStorage.getItem(storedWalletKey);
      
      let wallet: CustodialWallet;
      
      if (storedWalletData) {
        // Wallet exists, retrieve it
        const storedWallet: StoredWallet = JSON.parse(storedWalletData);
        wallet = generateWalletFromEmail(email); // We can regenerate since it's deterministic
      } else {
        // Create new wallet and store it
        wallet = generateWalletFromEmail(email);
        const storedWallet = createStoredWallet(email);
        localStorage.setItem(storedWalletKey, JSON.stringify(storedWallet));
        
        // Fund new wallet with test ETH in development
        if (process.env.NODE_ENV === 'development') {
          await fundWalletWithTestETH(wallet.address, '1.0');
        }
      }
      
      // Create wallet client
      const walletClient = createWalletClientFromPrivateKey(wallet.privateKey);
      
      // Get balance
      const balance = await getWalletBalance(wallet.address);
      
      setState(prev => ({
        ...prev,
        wallet,
        walletClient,
        balance,
        isLoading: false
      }));
      
    } catch (error) {
      console.error('Error initializing custodial wallet:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to initialize wallet',
        isLoading: false
      }));
    }
  };

  const refreshBalance = async () => {
    if (!state.wallet) return;
    
    try {
      const balance = await getWalletBalance(state.wallet.address);
      setState(prev => ({ ...prev, balance }));
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  const fundWallet = async (amount: string = '1.0') => {
    if (!state.wallet) return false;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const success = await fundWalletWithTestETH(state.wallet.address, amount);
      if (success) {
        await refreshBalance();
      }
      setState(prev => ({ ...prev, isLoading: false }));
      return success;
    } catch (error) {
      console.error('Error funding wallet:', error);
      setState(prev => ({ ...prev, isLoading: false, error: 'Failed to fund wallet' }));
      return false;
    }
  };

  const sendTransaction = async (to: string, value: string) => {
    if (!state.walletClient || !state.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const amountInWei = BigInt(Math.floor(parseFloat(value) * 1e18));
      
      const hash = await state.walletClient.sendTransaction({
        account: state.walletClient.account!,
        chain: state.walletClient.chain,
        to: to as `0x${string}`,
        value: amountInWei,
      });
      
      // Refresh balance after transaction
      await refreshBalance();
      
      setState(prev => ({ ...prev, isLoading: false }));
      return hash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Transaction failed' 
      }));
      throw error;
    }
  };

  const signMessage = async (message: string) => {
    if (!state.walletClient || !state.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const signature = await state.walletClient.signMessage({
        account: state.walletClient.account!,
        message: message,
      });
      
      setState(prev => ({ ...prev, isLoading: false }));
      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to sign message' 
      }));
      throw error;
    }
  };

  const signTypedData = async (domain: any, types: any, primaryType: string, message: any) => {
    if (!state.walletClient || !state.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const signature = await state.walletClient.signTypedData({
        account: state.walletClient.account!,
        domain,
        types,
        primaryType,
        message,
      });
      
      setState(prev => ({ ...prev, isLoading: false }));
      return signature;
    } catch (error) {
      console.error('Error signing typed data:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to sign typed data' 
      }));
      throw error;
    }
  };

  const writeContract = async (contractConfig: {
    address: `0x${string}`;
    abi: any;
    functionName: string;
    args?: any[];
    value?: bigint;
  }) => {
    if (!state.walletClient || !state.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const hash = await state.walletClient.writeContract({
        account: state.walletClient.account!,
        chain: state.walletClient.chain,
        ...contractConfig,
        args: (contractConfig.args ?? []) as readonly any[],
      });
      
      // Refresh balance after contract interaction
      await refreshBalance();
      
      setState(prev => ({ ...prev, isLoading: false }));
      return hash;
    } catch (error) {
      console.error('Error writing to contract:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Contract interaction failed' 
      }));
      throw error;
    }
  };

  const clearWallet = () => {
    // Check if we're on the client side before accessing localStorage
    if (typeof window !== 'undefined' && currentUser?.email) {
      const storedWalletKey = `custodial_wallet_${currentUser.email}`;
      localStorage.removeItem(storedWalletKey);
    }
    
    setState({
      wallet: null,
      walletClient: null,
      balance: '0.0000',
      isLoading: false,
      error: null
    });
  };

  return {
    // Wallet data
    wallet: state.wallet,
    walletClient: state.walletClient,
    address: state.wallet?.address,
    balance: state.balance,
    
    // State
    isLoading: state.isLoading,
    error: state.error,
    isConnected: !!state.wallet,
    
    // Actions
    refreshBalance,
    fundWallet,
    sendTransaction,
    signMessage,
    signTypedData,
    writeContract,
    clearWallet,
    
    // Utilities
    formatAddress: (addr?: string) => {
      const address = addr || state.wallet?.address;
      return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
    }
  };
};
