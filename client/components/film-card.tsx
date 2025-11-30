"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Play, Star, Wallet } from "lucide-react"
import { PriceDisplay } from "@/components/price-display"

interface FilmCardProps {
  id: string
  title: string
  year: number
  genre: string
  rating: number
  price: string // Keep for backward compatibility
  priceUSDC?: number // New: USDC amount as number
  poster: string
  owned?: boolean
  onBuyNFT?: () => void
  onBuyDirect?: () => void
  onPlay?: () => void
}

export function FilmCard({
  id,
  title,
  year,
  genre,
  rating,
  price,
  priceUSDC = 25, // Default to 25 USDC if not provided
  poster,
  owned = false,
  onBuyNFT,
  onBuyDirect,
  onPlay,
}: FilmCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={poster || "/placeholder.svg"}
          alt={title}
          className="object-cover w-full h-full transition-transform group-hover:scale-105"
        />
        {owned && <Badge className="absolute top-2 right-2 bg-primary">Owned</Badge>}
        
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {owned ? (
            <Button onClick={onPlay} size="lg" className="bg-primary hover:bg-primary/90">
              <Play className="mr-2 h-5 w-5" />
              Watch Now
            </Button>
          ) : (
            <div className="flex flex-col gap-2 px-4">
              <Button onClick={onBuyNFT} size="lg" className="bg-primary hover:bg-primary/90 w-full">
                <Wallet className="mr-2 h-4 w-4" />
                <span className="mr-2">Buy NFT -</span>
                <PriceDisplay 
                  amount={priceUSDC} 
                  currency="USDC" 
                  showToggle={false}
                  className="text-white"
                />
              </Button>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-1">{title}</h3>
            <p className="text-muted-foreground text-sm">
              {year} • {genre}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {!owned && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full">
              <Button onClick={onBuyNFT} className="flex-1 bg-primary hover:bg-primary/90">
                <Wallet className="mr-2 h-4 w-4" />
                <PriceDisplay 
                  amount={priceUSDC} 
                  currency="USDC" 
                  showToggle={true}
                  className="text-white"
                />
              </Button>
              <Button onClick={onBuyDirect} variant="outline" className="flex-1 bg-transparent">
                Buy Direct
              </Button>
            </div>
          </div>
        )}
        {owned && (
          <Button onClick={onPlay} className="w-full bg-primary hover:bg-primary/90">
            <Play className="mr-2 h-4 w-4" />
            Watch Now
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
