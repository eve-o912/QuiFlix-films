"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PriceDisplay } from "@/components/price-display"
import { ArrowUpRight, TrendingUp, DollarSign, Activity } from "lucide-react"

export default function NFTMarketPage() {
  const [timeRange, setTimeRange] = useState("30d")

  // Mock data for floor price chart (in USDC)
  const floorPriceData = [
    { date: "1/1", quantum: 0.008, neon: 0.006, ocean: 0.005 },
    { date: "1/7", quantum: 0.009, neon: 0.007, ocean: 0.006 },
    { date: "1/14", quantum: 0.012, neon: 0.008, ocean: 0.007 },
    { date: "1/21", quantum: 0.015, neon: 0.009, ocean: 0.008 },
    { date: "1/28", quantum: 0.018, neon: 0.011, ocean: 0.009 },
  ]

  const recentSales = [
    {
      id: 1,
      film: "Quantum Paradox",
      tokenId: "#1234",
      seller: "0x1234...5678",
      buyer: "0x9876...4321",
      priceUsdc: 0.018,
      royaltyUsdc: 0.0018,
      date: "2 hours ago",
      type: "Resale",
      thumbnail: "/futuristic-sci-fi-movie-poster.jpg"
    },
    {
      id: 2,
      film: "Neon Dreams",
      tokenId: "#0567",
      seller: "0x5555...7777",
      buyer: "0x3333...9999",
      priceUsdc: 0.011,
      royaltyUsdc: 0.0011,
      date: "4 hours ago",
      type: "Resale",
      thumbnail: "/cyberpunk-action-movie-poster.jpg"
    },
    {
      id: 3,
      film: "Ocean Mystery",
      tokenId: "#2890",
      seller: "0x7777...1111",
      buyer: "0x2222...8888",
      priceUsdc: 0.009,
      royaltyUsdc: 0.0009,
      date: "6 hours ago",
      type: "Resale",
      thumbnail: "/ocean-adventure-movie-poster.jpg"
    },
    {
      id: 4,
      film: "Quantum Paradox",
      tokenId: "#0045",
      seller: "0x4444...2222",
      buyer: "0x6666...3333",
      priceUsdc: 0.020,
      royaltyUsdc: 0.0020,
      date: "8 hours ago",
      type: "Resale",
      thumbnail: "/futuristic-sci-fi-movie-poster.jpg"
    },
  ]

  const marketStats = [
    {
      film: "Quantum Paradox",
      floorPriceUsdc: 0.018,
      highestSaleUsdc: 0.025,
      totalVolumeUsdc: 12.5,
      resales: 145,
      royaltiesUsdc: 1.25,
      change24h: "+15%",
      owners: 1240,
      thumbnail: "/futuristic-sci-fi-movie-poster.jpg"
    },
    {
      film: "Neon Dreams",
      floorPriceUsdc: 0.011,
      highestSaleUsdc: 0.015,
      totalVolumeUsdc: 4.2,
      resales: 38,
      royaltiesUsdc: 0.42,
      change24h: "+8%",
      owners: 567,
      thumbnail: "/cyberpunk-action-movie-poster.jpg"
    },
    {
      film: "Ocean Mystery",
      floorPriceUsdc: 0.009,
      highestSaleUsdc: 0.012,
      totalVolumeUsdc: 8.7,
      resales: 97,
      royaltiesUsdc: 0.87,
      change24h: "+12%",
      owners: 892,
      thumbnail: "/ocean-adventure-movie-poster.jpg"
    },
  ]

  const trendingCollections = [
    { 
      name: "Premiere Edition #1-100", 
      film: "Quantum Paradox", 
      avgPriceUsdc: 0.022, 
      change: "+15%",
      volume24h: 2.4,
      sales24h: 12
    },
    { 
      name: "Director's Cut #1-50", 
      film: "Neon Dreams", 
      avgPriceUsdc: 0.014, 
      change: "+8%",
      volume24h: 0.8,
      sales24h: 6
    },
    { 
      name: "Limited Edition #1-25", 
      film: "Ocean Mystery", 
      avgPriceUsdc: 0.011, 
      change: "+12%",
      volume24h: 1.2,
      sales24h: 9
    },
  ]

  const topTraders = [
    { address: "0x1234...5678", purchases: 45, sales: 32, volume: 3.4, profit: 0.8 },
    { address: "0x9876...4321", purchases: 38, sales: 29, volume: 2.9, profit: 0.6 },
    { address: "0x5555...7777", purchases: 31, sales: 25, volume: 2.1, profit: 0.4 },
  ]

  return (
    <div className="space-y-8">
      {/* Header with Currency Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">NFT Secondary Market</h1>
          <p className="text-muted-foreground">Track secondary sales, royalty earnings, and market trends</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Live Updates
          </Button>
        </div>
      </div>

      {/* Key Metrics - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Resales</CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">280</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +23 this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Secondary Volume</CardTitle>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <PriceDisplay usdcPrice={25.4} size="lg" showToggle />
            <p className="text-xs text-muted-foreground mt-1">Total trading volume</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Royalties Earned</CardTitle>
              <Activity className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <PriceDisplay usdcPrice={2.54} size="lg" showToggle className="text-green-600" />
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              10% avg royalty
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Sale Price</CardTitle>
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <PriceDisplay usdcPrice={0.0907} size="lg" showToggle />
            <p className="text-xs text-green-600 mt-1">+12% this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Recent Sales</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="traders">Top Traders</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Floor Price Trends */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Floor Price Trends</CardTitle>
                <Badge variant="secondary">Updated 5 min ago</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={floorPriceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} USDC`, ""]}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Line type="monotone" dataKey="quantum" stroke="#D4AF37" strokeWidth={2} name="Quantum Paradox" />
                  <Line type="monotone" dataKey="neon" stroke="#B8860B" strokeWidth={2} name="Neon Dreams" />
                  <Line type="monotone" dataKey="ocean" stroke="#8B7355" strokeWidth={2} name="Ocean Mystery" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Market Stats by Film */}
          <Card>
            <CardHeader>
              <CardTitle>Market Stats by Film</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketStats.map((stat, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={stat.thumbnail || "/placeholder.svg"} 
                          alt={stat.film}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{stat.film}</h3>
                          <p className="text-sm text-muted-foreground">{stat.owners} unique owners</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {stat.change24h}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Floor Price</p>
                        <PriceDisplay usdcPrice={stat.floorPriceUsdc} className="font-semibold" />
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Highest Sale</p>
                        <PriceDisplay usdcPrice={stat.highestSaleUsdc} className="font-semibold" />
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Total Volume</p>
                        <PriceDisplay usdcPrice={stat.totalVolumeUsdc} className="font-semibold" />
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Your Royalties</p>
                        <PriceDisplay usdcPrice={stat.royaltiesUsdc} className="font-semibold text-green-600" />
                      </div>
                      <div className="flex items-end">
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          View on OpenSea
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Sales Activity</CardTitle>
                <Button variant="outline" size="sm">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <img 
                        src={sale.thumbnail || "/placeholder.svg"} 
                        alt={sale.film}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">
                          {sale.film} {sale.tokenId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sale.seller} → {sale.buyer}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Sale Price</p>
                      <PriceDisplay usdcPrice={sale.priceUsdc} className="font-semibold" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Royalty earned</p>
                      <PriceDisplay usdcPrice={sale.royaltyUsdc} className="font-semibold text-green-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{sale.date}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {sale.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trending Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trendingCollections.map((collection, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        Rank #{index + 1}
                      </Badge>
                      <Badge variant="secondary" className="text-green-600 border-green-600">
                        {collection.change}
                      </Badge>
                    </div>
                    <h3 className="font-medium mb-1">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{collection.film}</p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Price</span>
                        <PriceDisplay usdcPrice={collection.avgPriceUsdc} className="font-semibold" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">24h Volume</span>
                        <PriceDisplay usdcPrice={collection.volume24h} />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">24h Sales</span>
                        <span className="font-semibold">{collection.sales24h}</span>
                      </div>
                    </div>
                    
                    <Button size="sm" className="w-full" variant="outline">
                      View Collection
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Traders Tab */}
        <TabsContent value="traders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Traders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTraders.map((trader, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center rounded-full">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{trader.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {trader.purchases} buys · {trader.sales} sales
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Trading Volume</p>
                      <PriceDisplay usdcPrice={trader.volume} className="font-semibold" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Profit</p>
                      <PriceDisplay usdcPrice={trader.profit} className="font-semibold text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
