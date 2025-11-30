"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "@/components/price-display"
import { getPreferredCurrency, setPreferredCurrency, convertUSDCtoKES } from "@/lib/currency"
import { RefreshCw } from "lucide-react"

export default function ProducerDashboard() {
  const [displayCurrency, setDisplayCurrency] = useState<'KES' | 'USDC'>('USDC')

  // Load preferred currency
  useEffect(() => {
    const preferred = getPreferredCurrency()
    setDisplayCurrency(preferred)
  }, [])

  const toggleDisplayCurrency = () => {
    const newCurrency = displayCurrency === 'KES' ? 'USDC' : 'KES'
    setDisplayCurrency(newCurrency)
    setPreferredCurrency(newCurrency)
  }

  const mockFilms = [
    {
      id: 1,
      title: "Quantum Paradox",
      poster: "/futuristic-sci-fi-movie-poster.jpg",
      status: "Live",
      price: "$15 / 0.008 ETH",
      priceUSDC: 15,
      minted: 3200,
      total: 5000,
      views: 12400,
      avgWatchTime: "1h 45m",
      revenueUSDC: 48000, // 3200 * 15
    },
    {
      id: 2,
      title: "Neon Dreams",
      poster: "/cyberpunk-action-movie-poster.jpg",
      status: "Premiering",
      price: "$12 / 0.006 ETH",
      priceUSDC: 12,
      minted: 850,
      total: 3000,
      views: 2100,
      avgWatchTime: "2h 12m",
      revenueUSDC: 10200, // 850 * 12
    },
  ]

  // Calculate totals in USDC
  const totalRevenueUSDC = mockFilms.reduce((sum, film) => sum + film.revenueUSDC, 0)
  const totalRoyaltiesUSDC = 3200 // Mock royalties
  const totalEarningsUSDC = totalRevenueUSDC + totalRoyaltiesUSDC

  return (
    <div className="space-y-8">
      {/* Header with Currency Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Producer Dashboard</h1>
          <p className="text-muted-foreground">Manage your films, track earnings, and analyze your audience</p>
        </div>
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
          <span className="text-sm text-muted-foreground">Display Currency:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDisplayCurrency}
            className="h-8 px-3 gap-1"
          >
            <span className="font-semibold">{displayCurrency}</span>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Key Metrics with Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Films</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">2</div>
            <p className="text-xs text-muted-foreground mt-1">Currently streaming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceDisplay 
              amount={totalRevenueUSDC} 
              currency="USDC" 
              showToggle={false}
              size="lg"
              className="mb-1"
            />
            <p className="text-xs text-green-600 mt-1">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Royalties Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceDisplay 
              amount={totalRoyaltiesUSDC} 
              currency="USDC" 
              showToggle={false}
              size="lg"
              className="mb-1"
            />
            <p className="text-xs text-muted-foreground mt-1">From resales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Viewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">5,400</div>
            <p className="text-xs text-muted-foreground mt-1">Unique wallets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resale Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">850</div>
            <p className="text-xs text-muted-foreground mt-1">NFT resales</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Films Preview with Currency */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Films</CardTitle>
            <Button variant="outline" size="sm">
              <a href="/producer/films">View All</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockFilms.map((film) => (
              <div key={film.id} className="flex gap-4 p-4 border border-border rounded-lg">
                <img
                  src={film.poster || "/placeholder.svg"}
                  alt={film.title}
                  className="w-20 h-28 object-cover rounded-md"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{film.title}</h3>
                    <Badge variant={film.status === "Live" ? "default" : "secondary"}>{film.status}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <PriceDisplay 
                      amount={film.priceUSDC} 
                      currency="USDC" 
                      showToggle={false}
                      size="sm"
                    />
                  </div>

                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      Sold: {film.minted.toLocaleString()}/{film.total.toLocaleString()}
                    </span>
                    <span>Views: {film.views.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Revenue:</span>
                    <PriceDisplay 
                      amount={film.revenueUSDC} 
                      currency="USDC" 
                      showToggle={false}
                      size="sm"
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">Avg Watch: {film.avgWatchTime}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Earnings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Film Sales</p>
                <PriceDisplay 
                  amount={totalRevenueUSDC} 
                  currency="USDC" 
                  showToggle={false}
                  size="md"
                />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Royalties</p>
                <PriceDisplay 
                  amount={totalRoyaltiesUSDC} 
                  currency="USDC" 
                  showToggle={false}
                  size="md"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <div>
                <p className="text-sm font-medium text-primary mb-1">Total Available to Withdraw</p>
                <PriceDisplay 
                  amount={totalEarningsUSDC} 
                  currency="USDC" 
                  showToggle={true}
                  size="lg"
                />
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                Withdraw Earnings
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Earnings are calculated in real-time and can be withdrawn at any time
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button>Upload New Film</Button>
            <Button variant="outline">Airdrop Promo NFTs</Button>
            <Button variant="outline">View Analytics</Button>
            <Button variant="outline">Download Revenue Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
