import { useReadContract, useAccount } from 'wagmi';
import { base, lisk } from 'wagmi/chains';
import { useEffect, useState } from 'react';

// Extended ABI with balanceOf function for NFT queries
const NFT_BALANCE_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Get NFT contract address from environment variables
// These should match your deployed contract addresses
const NFT_CONTRACT_ADDRESSES = {
  base: (import.meta.env.VITE_PUBLIC_QUIFLIX_NFT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  lisk: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Add your Lisk contract address
};

export interface NFTBalanceResult {
  balance: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch NFT balance for connected wallet using Wagmi
 * Queries the QuiFlixNFT contract's balanceOf function
 * 
 * @param chainId - Optional chain ID to query (defaults to current chain)
 * @returns NFT balance and query state
 */
export function useNFTBalance(chainId?: number): NFTBalanceResult {
  const { address } = useAccount();

  // Determine which contract to query based on chain
  const getContractAddress = (): `0x${string}` => {
    if (chainId === lisk.id || chainId === 4202) {
      return NFT_CONTRACT_ADDRESSES.lisk;
    }
    // Default to base or use environment variable
    return NFT_CONTRACT_ADDRESSES.base;
  };

  const contractAddress = getContractAddress();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    address: contractAddress,
    abi: NFT_BALANCE_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && contractAddress !== '0x0000000000000000000000000000000000000000',
      // Refetch every 30 seconds
      refetchInterval: 30000,
      // Refetch when window regains focus
      refetchOnWindowFocus: true,
    },
  });

  return {
    balance: data ? Number(data) : 0,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to fetch all NFT token IDs owned by an address
 * Useful for displaying the user's film collection
 * 
 * @param maxTokens - Maximum number of tokens to fetch (default: 100)
 * @returns Array of token IDs owned by the user
 */
export function useOwnedNFTs(maxTokens = 100) {
  const { address } = useAccount();
  const { balance } = useNFTBalance();
  const [ownedTokenIds, setOwnedTokenIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address || balance === 0) {
      setOwnedTokenIds([]);
      return;
    }

    const fetchTokenIds = async () => {
      setIsLoading(true);
      const tokenIds: number[] = [];
      
      // Fetch up to balance or maxTokens, whichever is smaller
      const tokensToFetch = Math.min(balance, maxTokens);
      
      // Note: This would require multiple contract calls
      // In production, consider batching with multicall or using The Graph for indexing
      for (let i = 0; i < tokensToFetch; i++) {
        // This would need to be implemented with useReadContract in a loop
        // or better yet, using a multicall pattern
        // For now, we'll leave this as a placeholder
      }

      setOwnedTokenIds(tokenIds);
      setIsLoading(false);
    };

    fetchTokenIds();
  }, [address, balance, maxTokens]);

  return { ownedTokenIds, isLoading };
}
