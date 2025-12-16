import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Settings, DollarSign, Ticket, BarChart3 } from "lucide-react";

export type FilmRole = "filmOwner" | "nftDistributor" | "directSeller";

interface FilmCardProps {
  title: string;
  poster: string;
  roles: FilmRole[];
  revenue?: string;
  directPrice?: string;
  ticketPrice?: string;
  nftSupply?: number;
  screenings?: number;
}

const roleConfig = {
  filmOwner: {
    label: "🎬 Film Owner",
    variant: "filmOwner" as const,
  },
  nftDistributor: {
    label: "🎟️ NFT Distributor",
    variant: "nftDistributor" as const,
  },
  directSeller: {
    label: "📺 Direct Seller",
    variant: "directSeller" as const,
  },
};

export function FilmCard({
  title,
  poster,
  roles,
  revenue,
  directPrice,
  ticketPrice,
  nftSupply,
  screenings,
}: FilmCardProps) {
  const isFilmOwner = roles.includes("filmOwner");
  const isNftDistributor = roles.includes("nftDistributor");
  const isDirectSeller = roles.includes("directSeller");

  return (
    <Card variant="glass" className="overflow-hidden transition-all duration-300 hover:border-primary/30 group">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={poster}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          {roles.map((role) => (
            <Badge key={role} variant={roleConfig[role].variant}>
              {roleConfig[role].label}
            </Badge>
          ))}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {revenue && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Revenue</p>
              <p className="font-semibold gradient-gold-text">{revenue}</p>
            </div>
          )}
          {directPrice && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Direct Price</p>
              <p className="font-semibold">{directPrice}</p>
            </div>
          )}
          {ticketPrice && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Ticket Price</p>
              <p className="font-semibold">{ticketPrice}</p>
            </div>
          )}
          {nftSupply !== undefined && (
            <div className="space-y-1">
              <p className="text-muted-foreground">NFT Supply</p>
              <p className="font-semibold">{nftSupply}</p>
            </div>
          )}
          {screenings !== undefined && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Screenings</p>
              <p className="font-semibold">{screenings}</p>
            </div>
          )}
        </div>

        {/* Actions based on role */}
        <div className="flex flex-wrap gap-2">
          {isFilmOwner && (
            <>
              <Button size="sm" variant="glow" className="flex-1">
                <DollarSign className="h-4 w-4" />
                Sell Direct
              </Button>
              <Button size="sm" variant="glass">
                <Settings className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="glass">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {isNftDistributor && !isFilmOwner && (
            <>
              <Button size="sm" variant="gold" className="flex-1">
                <Ticket className="h-4 w-4" />
                Host Screening
              </Button>
              <Button size="sm" variant="glow" className="flex-1">
                <DollarSign className="h-4 w-4" />
                Sell Direct
              </Button>
            </>
          )}
          
          {isDirectSeller && !isFilmOwner && !isNftDistributor && (
            <Button size="sm" variant="glow" className="w-full">
              <DollarSign className="h-4 w-4" />
              Sell Direct
            </Button>
          )}

          <Button size="sm" variant="ghost" className="w-full mt-1">
            <Play className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
