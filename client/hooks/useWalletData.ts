'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, QUIFLIX_NFT_ABI } from '@/lib/web3';

export const useWalletData = () => {
  const { address, isConnected, chain } = useAccount();
  const [error, setError] = useState<string | null>(null);

  // Get native balance (ETH) using wagmi's useBalance hook
  const { data: balanceData, isLoading: balanceLoading } = useBalance({
    address: address,
  });

  // Fetch NFT count using wagmi's useReadContract hook
  // This will automatically use the connected wallet's network
  const { 
    data: nftBalance, 
    isLoading: nftLoading,
    error: nftError,
    refetch 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.QuiFlixNFT as `0x${string}`,
    abi: QUIFLIX_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!isConnected,
      retry: false, // Don't retry on network errors
    },
  });

  // Handle errors
  useEffect(() => {
    if (nftError) {
      console.error('Error fetching NFT count:', nftError);
      setError('Unable to fetch NFT count. Please check your network connection.');
    } else {
      setError(null);
    }
  }, [nftError]);

  const nftCount = nftBalance ? Number(nftBalance) : 0;

  return {
    address,
    isConnected,
    chain,
    balance: balanceData?.formatted || '0',
    balanceSymbol: balanceData?.symbol || 'ETH',
    nftCount,
    isLoading: nftLoading || balanceLoading,
    error,
    refetch,
  };
};
