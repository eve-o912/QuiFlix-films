import { useState } from "react";
import { Star, Wallet, Play, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { PurchaseDialog } from "./PurchaseDialog";
import { TrailerModal } from "./TrailerModal";
import { Badge } from "./ui/badge";

interface FilmCardProps {
  id: string;
  title: string;
  image: string;
  views: number;
  rating: number;
  directPrice: number;
  nftPrice: number;
  investmentPricePerShare?: number;
  availableShares?: number;
  totalShares?: number;
  trailerUrl?: string;
}

export const FilmCard = ({ 
  id, 
  title, 
  image, 
  views, 
  rating, 
  directPrice,
  nftPrice,
  investmentPricePerShare = 0,
  availableShares = 0,
  totalShares = 100,
  trailerUrl 
}: FilmCardProps) => {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  
  const investmentAvailable = availableShares > 0 && investmentPricePerShare > 0;
  const investmentPercentage = totalShares > 0 ? ((totalShares - availableShares) / totalShares) * 100 : 0;
  
  return (
    <Card className="group overflow-hidden border-border bg-card transition-all hover:shadow-neon">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop"}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {investmentAvailable && (
          <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground">
            <TrendingUp className="h-3 w-3 mr-1" />
            Invest
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-foreground line-clamp-1">{title}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm text-foreground">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{views.toLocaleString()} views</span>
        </div>

        {/* Investment Progress */}
        {investmentAvailable && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Investment Progress</span>
              <span className="text-primary font-medium">{investmentPercentage.toFixed(0)}% funded</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all" 
                style={{ width: `${investmentPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {availableShares} / {totalShares} shares available • ${investmentPricePerShare}/share
            </p>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">From</span>
          <span className="text-primary font-bold">${Math.min(directPrice, nftPrice).toFixed(2)} USDC</span>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => setShowTrailer(true)}
          >
            <Play className="mr-2 h-4 w-4" />
            Trailer
          </Button>
          <Button 
            className="flex-1"
            onClick={() => setShowPurchaseDialog(true)}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {investmentAvailable ? 'Buy/Invest' : 'Buy Now'}
          </Button>
        </div>
        
        <TrailerModal
          open={showTrailer}
          onOpenChange={setShowTrailer}
          filmTitle={title}
          trailerUrl={trailerUrl}
        />
        
        <PurchaseDialog
          open={showPurchaseDialog}
          onOpenChange={setShowPurchaseDialog}
          filmId={id}
          filmTitle={title}
          directPrice={directPrice}
          nftPrice={nftPrice}
          investmentPricePerShare={investmentPricePerShare}
          availableShares={availableShares}
        />
      </CardContent>
    </Card>
  );
};
