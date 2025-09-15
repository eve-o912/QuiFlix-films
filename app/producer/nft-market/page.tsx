import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function NFTMarketPage() {
  // Mock data for floor price chart
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
      price: "0.018 ETH",
      usdPrice: "$45.00",
      royalty: "0.0018 ETH",
      date: "2 hours ago",
      type: "Resale",
    },
    {
      id: 2,
      film: "Neon Dreams",
      tokenId: "#0567",
      seller: "0x5555...7777",
      buyer: "0x3333...9999",
      price: "0.011 ETH",
      usdPrice: "$27.50",
      royalty: "0.0011 ETH",
      date: "4 hours ago",
      type: "Resale",
    },
    {
      id: 3,
      film: "Ocean Mystery",
      tokenId: "#2890",
      seller: "0x7777...1111",
      buyer: "0x2222...8888",
      price: "0.009 ETH",
      usdPrice: "$22.50",
      royalty: "0.0009 ETH",
      date: "6 hours ago",
      type: "Resale",
    },
  ]

  const marketStats = [
    {
      film: "Quantum Paradox",
      floorPrice: "0.018 ETH",
      highestSale: "0.025 ETH",
      totalVolume: "12.5 ETH",
      resales: 145,
      royaltiesEarned: "1.25 ETH",
    },
    {
      film: "Neon Dreams",
      floorPrice: "0.011 ETH",
      highestSale: "0.015 ETH",
      totalVolume: "4.2 ETH",
      resales: 38,
      royaltiesEarned: "0.42 ETH",
    },
    {
      film: "Ocean Mystery",
      floorPrice: "0.009 ETH",
      highestSale: "0.012 ETH",
      totalVolume: "8.7 ETH",
      resales: 97,
      royaltiesEarned: "0.87 ETH",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">NFT Market</h1>
          <p className="text-muted-foreground">Track secondary sales and royalty earnings from your NFT tickets</p>
        </div>
        <Select>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Last 30 days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Resales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">280</div>
            <p className="text-xs text-green-600 mt-1">+23 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Secondary Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">25.4 ETH</div>
            <p className="text-xs text-muted-foreground mt-1">$63,500 USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Royalties Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">2.54 ETH</div>
            <p className="text-xs text-green-600 mt-1">$6,350 USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Royalty Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">10%</div>
            <p className="text-xs text-muted-foreground mt-1">Per resale</p>
          </CardContent>
        </Card>
      </div>

      {/* Floor Price Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Floor Price Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={floorPriceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} ETH`, ""]} />
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
              <div key={index} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{stat.film}</h3>
                  <Badge variant="outline">{stat.resales} resales</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Floor Price</p>
                    <p className="font-semibold text-primary">{stat.floorPrice}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Highest Sale</p>
                    <p className="font-semibold">{stat.highestSale}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Volume</p>
                    <p className="font-semibold">{stat.totalVolume}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Your Royalties</p>
                    <p className="font-semibold text-green-600">{stat.royaltiesEarned}</p>
                  </div>
                  <div>
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

      {/* Recent Sales Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Sales Activity</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
                  <p className="font-medium">{sale.price}</p>
                  <p className="text-sm text-muted-foreground">{sale.usdPrice}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{sale.royalty}</p>
                  <p className="text-sm text-muted-foreground">Royalty earned</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{sale.date}</p>
                  <Badge variant="secondary" className="text-xs">
                    {sale.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Collections */}
      <Card>
        <CardHeader>
          <CardTitle>Trending Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Premiere Edition #1-100", film: "Quantum Paradox", avgPrice: "0.022 ETH", change: "+15%" },
              { name: "Director's Cut #1-50", film: "Neon Dreams", avgPrice: "0.014 ETH", change: "+8%" },
              { name: "Limited Edition #1-25", film: "Ocean Mystery", avgPrice: "0.011 ETH", change: "+12%" },
            ].map((collection, index) => (
              <div key={index} className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-1">{collection.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{collection.film}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{collection.avgPrice}</span>
                  <Badge variant="secondary" className="text-green-600">
                    {collection.change}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
