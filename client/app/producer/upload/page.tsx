"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PriceDisplay } from "@/components/price-display"

export default function NFTMarketPage() {
  // Mock data for floor price chart (in USDC)
  const floorPriceData = [
    { date: "1/1", quantum: 0.008, neon: 0.006, ocean: 0.005 },
    { date: "1/7", quantum: 0.009, neon: 0.007, ocean: 0.006 },
    { date: "1/14", quantum: 0.012, neon: 0.008, ocean: 0.007 },
    { date: "1/21", quantum: 0.015, neon: 0.009, ocean: 0.008 },
    { date: "1/28", quantum: 0.018, neon: 0.010, ocean: 0.009 },
  ]

  // Mock NFT listings with USDC prices
  const mockListings = [
    {
      id: 1,
      filmTitle: "Quantum Paradox",
      tokenId: "#2847",
      seller: "0x1234...5678",
      priceUSDC: 0.015,
      rarity: "Rare",
      poster: "/futuristic-sci-fi-movie-poster.jpg",
    },
    {
      id: 2,
      filmTitle: "Neon Dreams",
      tokenId: "#1523",
      seller: "0x8765...4321",
      priceUSDC: 0.008,
      rarity: "Common",
      poster: "/cyberpunk-action-movie-poster.jpg",
    },
    {
      id: 3,
      filmTitle: "Ocean's Depth",
      tokenId: "#4192",
      seller: "0xabcd...efgh",
      priceUSDC: 0.012,
      rarity: "Uncommon",
      poster: "/underwater-adventure-poster.jpg",
    },
  ]

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">NFT Marketplace</h1>
        <p className="text-muted-foreground">Buy, sell, and trade film NFT tickets on the secondary market</p>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceDisplay amount={125.5} currency="USDC" showToggle={false} size="lg" />
            <p className="text-xs text-green-600 mt-1">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-muted-foreground mt-1">Across all films</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,421</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Floor Price</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceDisplay amount={0.009} currency="USDC" showToggle={false} size="lg" />
            <p className="text-xs text-green-600 mt-1">+8% this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Floor Price Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Floor Price Trends</CardTitle>
            <Select defaultValue="7d">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={floorPriceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="quantum" stroke="#8b5cf6" name="Quantum Paradox" />
              <Line type="monotone" dataKey="neon" stroke="#06b6d4" name="Neon Dreams" />
              <Line type="monotone" dataKey="ocean" stroke="#3b82f6" name="Ocean's Depth" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Listings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Listings</CardTitle>
            <div className="flex gap-2">
              <Select defaultValue="price-low">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="recent">Recently Listed</SelectItem>
                  <SelectItem value="rarity">Rarity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockListings.map((listing) => (
              <div key={listing.id} className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={listing.poster || "/placeholder.svg"}
                  alt={listing.filmTitle}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{listing.filmTitle}</h3>
                    <Badge variant={listing.rarity === "Rare" ? "default" : "secondary"}>
                      {listing.rarity}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Token {listing.tokenId}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Price</p>
                      <PriceDisplay 
                        amount={listing.priceUSDC} 
                        currency="USDC" 
                        showToggle={false}
                        size="md"
                      />
                    </div>
                    <Button size="sm">Buy Now</Button>
                  </div>

                  <div className="text-xs text-muted-foreground border-t pt-3">
                    Seller: {listing.seller}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Secondary Market Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold mb-2">List Your NFT</h4>
              <p className="text-sm text-muted-foreground">
                Set your price in USDC/USDT/KES and list your film NFT ticket for sale
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold mb-2">Automated Escrow</h4>
              <p className="text-sm text-muted-foreground">
                Smart contracts handle the secure transfer and payment automatically
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold mb-2">Creator Royalties</h4>
              <p className="text-sm text-muted-foreground">
                Producers earn 5% royalty on every resale automatically
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
