import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DollarSign, Ticket, Coins, Save, Settings } from "lucide-react";
import { useState } from "react";

interface FilmControlsCardProps {
  filmTitle: string;
  currentDirectPrice: number;
  currentTicketMin: number;
  currentTicketMax: number;
  currentNftCap: number;
}

export function FilmControlsCard({
  filmTitle,
  currentDirectPrice,
  currentTicketMin,
  currentTicketMax,
  currentNftCap,
}: FilmControlsCardProps) {
  const [directPrice, setDirectPrice] = useState(currentDirectPrice);
  const [ticketRange, setTicketRange] = useState([currentTicketMin, currentTicketMax]);
  const [nftCap, setNftCap] = useState(currentNftCap);

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-primary" />
          Film Controls: {filmTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Direct Purchase Price */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4 text-accent" />
            Direct Purchase Price
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">$</span>
            <Input
              type="number"
              value={directPrice}
              onChange={(e) => setDirectPrice(Number(e.target.value))}
              className="bg-background/50"
            />
          </div>
        </div>

        {/* Screening Ticket Price Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Ticket className="h-4 w-4 text-primary" />
            Screening Ticket Price Range
          </Label>
          <Slider
            value={ticketRange}
            onValueChange={setTicketRange}
            min={1}
            max={100}
            step={1}
            className="my-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${ticketRange[0]}</span>
            <span>${ticketRange[1]}</span>
          </div>
        </div>

        {/* NFT Supply Cap */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Coins className="h-4 w-4 text-green-400" />
            NFT Supply Cap
          </Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={nftCap}
              onChange={(e) => setNftCap(Number(e.target.value))}
              className="bg-background/50"
            />
            <span className="text-muted-foreground whitespace-nowrap">max NFTs</span>
          </div>
        </div>

        <Button variant="glow" className="w-full mt-4">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
