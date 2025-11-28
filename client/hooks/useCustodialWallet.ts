'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { WalletClient, formatUnits, createPublicClient, http } from 'viem';
import { baseMainnet, liskMainnet } from '@/lib/chains';

// Token addresses - CORRECTED
const TOKEN_ADDRESSES = {
  8453: { // Base
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
  },
  1135: { // Lisk
    USDC: '0xf242275d3a6527d877f2c927a82d9b057609cc71', // ✅ CORRECTED
    USDT: '0x05D032ac25d322df992303dCa074EE7392C117b9'
  }
};

// ERC20 ABI
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  }
] as const;

// Add token balance interface
interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  address: string;
}

export interface CustodialWalletState {
  wallet: CustodialWallet | null;
  walletClient: WalletClient | null;
  balance: string;
  tokenBalances: TokenBalance[];
  isLoading: boolean;
  error: string | null;
}

export function useCustodialWallet() {
  const { currentUser, userLoggedIn } = useAuth();
  const [state, setState] = useState<CustodialWalletState>({
    wallet: null,
    walletClient: null,
    balance: '0.0000',
    tokenBalances: [],
    isLoading: false,
    error: null
  });

  // Function to fetch token balances
  const getTokenBalances = useCallback(async (address: string, chainId: number): Promise<TokenBalance[]> => {
    const tokens = TOKEN_ADDRESSES[chainId as keyof typeof TOKEN_ADDRESSES];
    if (!tokens) return [];

    // Create public client for the specific chain
    const chain = chainId === 8453 ? baseMainnet : chainId === 1135 ? liskMainnet : null;
    if (!chain) return [];

    const publicClient = createPublicClient({
      chain,
      transport: http()
    });

    const balances: TokenBalance[] = [];

    try {
      // Get USDC balance if available
      if (tokens.USDC && tokens.USDC !== '0x') {
        const [balance, decimals] = await Promise.all([
          publicClient.readContract({
            address: tokens.USDC as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
          }),
          publicClient.readContract({
            address: tokens.USDC as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'decimals'
          })
        ]);

        balances.push({
          symbol: 'USDC',
          balance: formatUnits(balance as bigint, decimals as number),
          decimals: decimals as number,
          address: tokens.USDC
        });
      }

      // Get USDT balance if available
      if (tokens.USDT && tokens.USDT !== '0x') {
        const [balance, decimals] = await Promise.all([
          publicClient.readContract({
            address: tokens.USDT as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
          }),
          publicClient.readContract({
            address: tokens.USDT as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'decimals'
          })
        ]);

        balances.push({
          symbol: 'USDT',
          balance: formatUnits(balance as bigint, decimals as number),
          decimals: decimals as number,
          address: tokens.USDT
        });
      }
    } catch (error) {
      console.error('Error fetching token balances:', error);
    }

    return balances;
  }, []);

  const initializeWallet = useCallback(async (email: string) => {
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
        wallet = generateWalletFromEmail(email);
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
      
      // Get token balances on mainnet chains
      const chainId = walletClient.chain?.id || 1135;
      let tokenBalances: TokenBalance[] = [];
      
      // Only fetch token balances on mainnet (Base or Lisk)
      if (chainId === 8453 || chainId === 1135) {
        tokenBalances = await getTokenBalances(wallet.address, chainId);
      }
      
      setState(prev => ({
        ...prev,
        wallet,
        walletClient,
        balance,
        tokenBalances,
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
  }, [getTokenBalances]);

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
        balance: '0.0000',
        tokenBalances: []
      }));
    }
  }, [userLoggedIn, currentUser?.email, initializeWallet]);

  // Refresh balance - now fetches token balances too
  const refreshBalance = useCallback(async () => {
    if (!state.wallet || !state.walletClient) return;
    
    try {
      const balance = await getWalletBalance(state.wallet.address);
      
      // Get token balances if on mainnet
      const chainId = state.walletClient.chain?.id;
      let tokenBalances: TokenBalance[] = [];
      
      if (chainId && (chainId === 8453 || chainId === 1135)) {
        tokenBalances = await getTokenBalances(state.wallet.address, chainId);
      }
      
      setState(prev => ({ ...prev, balance, tokenBalances }));
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  }, [state.wallet, state.walletClient, getTokenBalances]);

  const fundWallet = useCallback(async (amount: string = '1.0') => {
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
  }, [state.wallet, refreshBalance]);

  const sendTransaction = useCallback(async (to: string, value: string) => {
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
  }, [state.walletClient, state.wallet, refreshBalance]);

  // Function to send tokens (USDC/USDT)
  const sendToken = useCallback(async (tokenSymbol: 'USDC' | 'USDT', to: string, amount: string) => {
    if (!state.walletClient || !state.wallet) {
      throw new Error('Wallet not initialized');
    }

    const chainId = state.walletClient.chain?.id;
    if (!chainId) {
      throw new Error('Chain not detected');
    }

    const tokens = TOKEN_ADDRESSES[chainId as keyof typeof TOKEN_ADDRESSES];
    if (!tokens || !tokens[tokenSymbol]) {
      throw new Error(`${tokenSymbol} not supported on this network`);
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const tokenAddress = tokens[tokenSymbol];
      
      // Get token decimals
      const publicClient = createPublicClient({
        chain: state.walletClient.chain!,
        transport: http()
      });

      const decimals = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals'
      }) as number;

      // Convert amount to token units
      const amountInUnits = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));

      // Send transaction
      const hash = await state.walletClient.writeContract({
        account: state.walletClient.account!,
        chain: state.walletClient.chain,
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to as `0x${string}`, amountInUnits]
      });

      // Refresh balances after transaction
      await refreshBalance();

      setState(prev => ({ ...prev, isLoading: false }));
      return hash;
    } catch (error) {
      console.error('Error sending token:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Token transfer failed' 
      }));
      throw error;
    }
  }, [state.walletClient, state.wallet, refreshBalance]);

  const signMessage = useCallback(async (message: string) => {
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
  }, [state.walletClient, state.wallet]);

  const signTypedData = useCallback(async (domain: any, types: any, primaryType: string, message: any) => {
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
  }, [state.walletClient, state.wallet]);

  const writeContract = useCallback(async (contractConfig: {
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
  }, [state.walletClient, state.wallet, refreshBalance]);

  const clearWallet = useCallback(() => {
    // Check if we're on the client side before accessing localStorage
    if (typeof window !== 'undefined' && currentUser?.email) {
      const storedWalletKey = `custodial_wallet_${currentUser.email}`;
      localStorage.removeItem(storedWalletKey);
    }
    
    setState({
      wallet: null,
      walletClient: null,
      balance: '0.0000',
      tokenBalances: [],
      isLoading: false,
      error: null
    });
  }, [currentUser?.email]);

  return {
    // Wallet data
    wallet: state.wallet,
    walletClient: state.walletClient,
    address: state.wallet?.address,
    balance: state.balance,
    tokenBalances: state.tokenBalances,
    
    // State
    isLoading: state.isLoading,
    error: state.error,
    isConnected: !!state.wallet,
    
    // Actions
    refreshBalance,
    fundWallet,
    sendTransaction,
    sendToken,
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
}
