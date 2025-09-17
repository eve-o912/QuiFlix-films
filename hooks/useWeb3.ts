'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { getQuiFlixNFTContract, getQuiFlixContentContract, formatEther, parseEther } from '@/lib/web3';

export interface FilmMetadata {
  title: string;
  description: string;
  genre: string;
  duration: number;
  releaseDate: number;
  producer: string;
  ipfsHash: string;
  price: string;
  isActive: boolean;
}

export interface ContentMetadata {
  contentId: number;
  title: string;
  ipfsHash: string;
  producer: string;
  totalRevenue: string;
  totalViews: number;
  isActive: boolean;
  createdAt: number;
}

export const useWeb3 = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect wallet
  const connectWallet = async () => {
    try {
      await connect({ connector: injected() });
    } catch (err) {
      setError('Failed to connect wallet');
      console.error('Wallet connection error:', err);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    disconnect();
  };

  // Sign message for authentication
  const signAuthMessage = async () => {
    if (!address) throw new Error('Wallet not connected');
    
    const message = `QuiFlix Authentication\nWallet: ${address}\nTimestamp: ${Date.now()}`;
    return await signMessageAsync({ message });
  };

  return {
    address,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    signAuthMessage,
    setIsLoading,
    setError,
  };
};

export const useFilms = () => {
  const [films, setFilms] = useState<FilmMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all films (simplified - in production, you'd query events or use a subgraph)
  const fetchFilms = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const contract = getQuiFlixNFTContract();
      
      // For demo purposes, we'll create some mock films
      // In production, you'd query the blockchain for actual films
      const mockFilms: FilmMetadata[] = [
        {
          title: "Epic Action Movie",
          description: "An epic action movie with amazing stunts and explosions",
          genre: "Action",
          duration: 10800,
          releaseDate: Math.floor(Date.now() / 1000),
          producer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          ipfsHash: "QmEpicActionMovieHash123456789",
          price: "0.05",
          isActive: true,
        },
        {
          title: "Sci-Fi Adventure",
          description: "A thrilling sci-fi adventure through space and time",
          genre: "Sci-Fi",
          duration: 9000,
          releaseDate: Math.floor(Date.now() / 1000),
          producer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          ipfsHash: "QmSciFiAdventureHash123456789",
          price: "0.03",
          isActive: true,
        }
      ];
      
      setFilms(mockFilms);
    } catch (err) {
      setError('Failed to fetch films');
      console.error('Fetch films error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get film metadata by token ID
  const getFilmMetadata = async (tokenId: number): Promise<FilmMetadata | null> => {
    try {
      const contract = getQuiFlixNFTContract();
      const metadata = await contract.read.getFilmMetadata([BigInt(tokenId)]);
      
      return {
        title: metadata.title,
        description: metadata.description,
        genre: metadata.genre,
        duration: Number(metadata.duration),
        releaseDate: Number(metadata.releaseDate),
        producer: metadata.producer,
        ipfsHash: metadata.ipfsHash,
        price: formatEther(metadata.price),
        isActive: metadata.isActive,
      };
    } catch (err) {
      console.error('Get film metadata error:', err);
      return null;
    }
  };

  // Check NFT ownership
  const checkOwnership = async (tokenId: number, address: string): Promise<boolean> => {
    try {
      const contract = getQuiFlixNFTContract();
      const owner = await contract.read.ownerOf([BigInt(tokenId)]);
      return owner.toLowerCase() === address.toLowerCase();
    } catch (err) {
      console.error('Check ownership error:', err);
      return false;
    }
  };

  // Get royalty info
  const getRoyaltyInfo = async (tokenId: number, salePrice: string) => {
    try {
      const contract = getQuiFlixNFTContract();
      const [recipient, amount] = await contract.read.royaltyInfo([
        BigInt(tokenId),
        parseEther(salePrice)
      ]);
      
      return {
        recipient,
        amount: formatEther(amount),
      };
    } catch (err) {
      console.error('Get royalty info error:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  return {
    films,
    isLoading,
    error,
    fetchFilms,
    getFilmMetadata,
    checkOwnership,
    getRoyaltyInfo,
  };
};

export const useContent = () => {
  const [content, setContent] = useState<ContentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get content metadata
  const getContent = async (contentId: number): Promise<ContentMetadata | null> => {
    try {
      const contract = getQuiFlixContentContract();
      const contentData = await contract.read.getContent([BigInt(contentId)]);
      
      return {
        contentId: Number(contentData.contentId),
        title: contentData.title,
        ipfsHash: contentData.ipfsHash,
        producer: contentData.producer,
        totalRevenue: formatEther(contentData.totalRevenue),
        totalViews: Number(contentData.totalViews),
        isActive: contentData.isActive,
        createdAt: Number(contentData.createdAt),
      };
    } catch (err) {
      console.error('Get content error:', err);
      return null;
    }
  };

  return {
    content,
    isLoading,
    error,
    getContent,
  };
};
