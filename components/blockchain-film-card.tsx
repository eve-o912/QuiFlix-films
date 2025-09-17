'use client';

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Play, Star, Wallet, Loader2, CheckCircle } from "lucide-react";
import { useWeb3, useFilms, FilmMetadata } from '@/hooks/useWeb3';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, QUIFLIX_NFT_ABI, parseEther } from '@/lib/web3';

interface BlockchainFilmCardProps {
  film: FilmMetadata;
  tokenId: number;
  onPlay?: () => void;
}

export function BlockchainFilmCard({ film, tokenId, onPlay }: BlockchainFilmCardProps) {
  const { address, isConnected } = useWeb3();
  const { checkOwnership } = useFilms();
  const [isOwned, setIsOwned] = useState(false);
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Check ownership when component mounts or address changes
  React.useEffect(() => {
    if (address && isConnected) {
      setIsCheckingOwnership(true);
      checkOwnership(tokenId, address).then((owned) => {
        setIsOwned(owned);
        setIsCheckingOwnership(false);
      });
    }
  }, [address, isConnected, tokenId, checkOwnership]);

  const handlePurchase = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsPurchasing(true);
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.QuiFlixNFT,
        abi: QUIFLIX_NFT_ABI,
        functionName: 'purchaseFilm',
        args: [BigInt(tokenId)],
        value: parseEther(film.price),
      });
    } catch (err) {
      console.error('Purchase error:', err);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    } else {
      // Default behavior - redirect to watch page
      window.location.href = `/watch/${tokenId}`;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src="/placeholder.svg" // In production, use IPFS gateway URL
          alt={film.title}
          className="object-cover w-full h-full transition-transform group-hover:scale-105"
        />
        
        {/* Ownership Badge */}
        {isOwned && (
          <Badge className="absolute top-2 right-2 bg-green-600 text-white">
            <CheckCircle className="mr-1 h-3 w-3" />
            Owned
          </Badge>
        )}
        
        {/* Loading Badge */}
        {isCheckingOwnership && (
          <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Checking
          </Badge>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {isOwned ? (
            <Button onClick={handlePlay} size="lg" className="bg-primary hover:bg-primary/90">
              <Play className="mr-2 h-5 w-5" />
              Watch Now
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handlePurchase} 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
                disabled={isPurchasing || isConfirming}
              >
                {isPurchasing || isConfirming ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                {isPurchasing ? 'Purchasing...' : isConfirming ? 'Confirming...' : `Buy NFT - ${film.price} ETH`}
              </Button>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-1">{film.title}</h3>
            <p className="text-muted-foreground text-sm mb-2">
              {formatDate(film.releaseDate)} • {film.genre} • {formatDuration(film.duration)}
            </p>
            <p className="text-muted-foreground text-xs line-clamp-2">
              {film.description}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">4.5</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {!isOwned && (
          <div className="flex gap-2 w-full">
            <Button 
              onClick={handlePurchase} 
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isPurchasing || isConfirming || !isConnected}
            >
              {isPurchasing || isConfirming ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="mr-2 h-4 w-4" />
              )}
              {isPurchasing ? 'Purchasing...' : isConfirming ? 'Confirming...' : `${film.price} ETH`}
            </Button>
          </div>
        )}
        {isOwned && (
          <Button onClick={handlePlay} className="w-full bg-primary hover:bg-primary/90">
            <Play className="mr-2 h-4 w-4" />
            Watch Now
          </Button>
        )}
        
        {/* Transaction Status */}
        {isConfirmed && (
          <div className="w-full mt-2 p-2 bg-green-100 text-green-800 rounded-md text-sm text-center">
            ✅ Purchase successful! You now own this NFT.
          </div>
        )}
        
        {error && (
          <div className="w-full mt-2 p-2 bg-red-100 text-red-800 rounded-md text-sm text-center">
            ❌ Purchase failed: {error.message}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
