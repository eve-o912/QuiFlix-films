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
    <Card className="group overflow-hidden border-diamond/20 bg-card/60 backdrop-blur-sm transition-all hover:shadow-diamond hover:border-diamond/40">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={image || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop"}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        {investmentAvailable && (
          <Badge className="absolute top-2 right-2 bg-diamond/80 text-diamond-foreground text-[10px] px-2 py-0.5">
            <TrendingUp className="h-2.5 w-2.5 mr-1" />
            Invest
          </Badge>
        )}
        
        {/* Overlay content on image */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-medium text-foreground/90 line-clamp-1 mb-1">{title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{(views / 1000).toFixed(0)}K views</span>
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-diamond text-diamond" />
              <span className="text-[10px] text-muted-foreground">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-2.5">
        {/* Investment Progress */}
        {investmentAvailable && (
          <div className="mb-2">
            <div className="flex justify-between text-[9px] mb-0.5">
              <span className="text-muted-foreground/70">Funded</span>
              <span className="text-diamond/80">{investmentPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-diamond transition-all" 
                style={{ width: `${investmentPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted-foreground/60">From</span>
          <span className="text-diamond text-xs font-medium">${Math.min(directPrice, nftPrice).toFixed(2)}</span>
        </div>

        <div className="flex gap-1.5">
          <Button 
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-[10px] text-muted-foreground hover:text-diamond hover:bg-diamond/10"
            onClick={() => setShowTrailer(true)}
          >
            <Play className="mr-1 h-3 w-3" />
            Preview
          </Button>
          <Button 
            size="sm"
            className="flex-1 h-7 text-[10px] bg-diamond/20 text-diamond hover:bg-diamond/30 border-0"
            onClick={() => setShowPurchaseDialog(true)}
          >
            <Wallet className="mr-1 h-3 w-3" />
            {investmentAvailable ? 'Invest' : 'Buy'}
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
