'use client';

import { useFilms } from '@/hooks/useWeb3';
import { BlockchainFilmCard } from '@/components/blockchain-film-card';
import { Header } from '@/components/header';
import { Loader2 } from 'lucide-react';

export default function BlockchainFilmsPage() {
  const { films, isLoading, error } = useFilms();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading films from blockchain...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Films</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blockchain Films</h1>
          <p className="text-muted-foreground">
            Own your favorite films as NFTs. Purchase once, own forever, and trade on the secondary market.
          </p>
        </div>

        {films.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No Films Available</h2>
            <p className="text-muted-foreground">
              No films have been created on the blockchain yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {films.map((film, index) => (
              <BlockchainFilmCard
                key={index}
                film={film}
                tokenId={index}
                onPlay={() => {
                  console.log('Playing film:', film.title);
                  // In production, this would redirect to the streaming page
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-foreground font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Connect Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Connect your MetaMask or other Web3 wallet to interact with the blockchain.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-foreground font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Purchase NFT</h3>
              <p className="text-sm text-muted-foreground">
                Buy films as NFTs using USDC,USDT. You'll own the digital rights to stream the content,share and resale.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-foreground font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Stream & Trade</h3>
              <p className="text-sm text-muted-foreground">
                Stream your owned films NFT anytime, or trade them on the secondary market.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
