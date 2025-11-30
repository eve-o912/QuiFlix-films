"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { PriceDisplay } from "@/components/price-display"
import { TrendingUp, DollarSign, Wallet, ArrowUpRight } from "lucide-react"

export default function EarningsPage() {
  // Mock data for charts (in USDC)
  const revenueData = [
    { month: "Jan", nftSales: 2.133, directSales: 0.533, royalties: 0.427 },
    { month: "Feb", nftSales: 1.600, directSales: 0.400, royalties: 0.320 },
    { month: "Mar", nftSales: 2.667, directSales: 0.667, royalties: 0.533 },
    { month: "Apr", nftSales: 2.400, directSales: 0.600, royalties: 0.480 },
    { month: "May", nftSales: 3.200, directSales: 0.800, royalties: 0.640 },
    { month: "Jun", nftSales: 2.933, directSales: 0.733, royalties: 0.587 },
  ]

  const revenueBreakdown = [
    { name: "NFT Sales", value: 14.933, color: "#D4AF37" },
    { name: "Direct Sales", value: 3.733, color: "#4F46E5" },
    { name: "Royalties", value: 2.987, color: "#B8860B" },
    { name: "Platform Fees", value: -2.159, color: "#8B7355" },
  ]

  const transactions = [
    {
      id: 1,
      type: "NFT Sale",
      film: "Quantum Paradox",
      amountUsdc: 0.008,
      date: "2024-01-15",
      wallet: "0x1234...5678",
      buyer: "alice.eth"
    },
    {
      id: 2,
      type: "Direct Purchase",
      film: "Neon Dreams",
      amountUsdc: 0.009,
      date: "2024-01-15",
      wallet: "0x9876...4321",
      buyer: "bob.eth"
    },
    {
      id: 3,
      type: "Royalty",
      film: "Neon Dreams",
      amountUsdc: 0.0006,
      date: "2024-01-14",
      wallet: "0x9876...4321",
      buyer: "charlie.eth"
    },
    {
      id: 4,
      type: "NFT Sale",
      film: "Ocean Mystery",
      amountUsdc: 0.005,
      date: "2024-01-14",
      wallet: "0x5555...7777",
      buyer: "diana.eth"
    },
    {
      id: 5,
      type: "Direct Purchase",
      film: "The Last Frontier",
      amountUsdc: 0.015,
      date: "2024-01-13",
      wallet: "0x3333...9999",
      buyer: "eve.eth"
    },
  ]

  // Calculate totals
  const totalNftSales = 14.933
  const totalDirectSales = 3.733
  const totalRoyalties = 2.987
  const totalEarnings = totalNftSales + totalDirectSales + totalRoyalties
  const platformFees = 2.159
  const availableBalance = totalEarnings - platformFees

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Earnings Dashboard</h1>
          <p className="text-muted-foreground">Track revenue from NFT sales, direct purchases, and royalties</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="6m">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Last 6 months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last month</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Wallet className="w-4 h-4 mr-2" />
            Withdraw Funds
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <PriceDisplay usdcPrice={totalEarnings} size="lg" showToggle />
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">NFT Sales</CardTitle>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <PriceDisplay usdcPrice={totalNftSales} size="lg" showToggle />
            <p className="text-xs text-muted-foreground mt-1">Primary NFT ticket sales</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Direct Sales</CardTitle>
              <DollarSign className="w-4 h-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <PriceDisplay usdcPrice={totalDirectSales} size="lg" showToggle />
            <p className="text-xs text-muted-foreground mt-1">Direct purchase revenue</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Royalties</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <PriceDisplay usdcPrice={totalRoyalties} size="lg" showToggle />
            <p className="text-xs text-muted-foreground mt-1">From NFT resales</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Balance Card */}
      <Card className="border-2 border-green-500/20 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
              <PriceDisplay usdcPrice={availableBalance} size="lg" showToggle className="text-green-600" />
              <p className="text-xs text-muted-foreground mt-1">
                After {((platformFees / totalEarnings) * 100).toFixed(1)}% platform fees
              </p>
            </div>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <Wallet className="w-4 h-4 mr-2" />
              Withdraw Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (USDC)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(4)} USDC`, ""]} />
                <Line type="monotone" dataKey="nftSales" stroke="#D4AF37" strokeWidth={2} name="NFT Sales" />
                <Line type="monotone" dataKey="directSales" stroke="#4F46E5" strokeWidth={2} name="Direct Sales" />
                <Line type="monotone" dataKey="royalties" stroke="#B8860B" strokeWidth={2} name="Royalties" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueBreakdown.filter((item) => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {revenueBreakdown
                    .filter((item) => item.value > 0)
                    .map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toFixed(4)} USDC`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {revenueBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                  </div>
                  <PriceDisplay 
                    usdcPrice={Math.abs(item.value)} 
                    className={item.value < 0 ? "text-red-600" : ""}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outline" size="sm">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      transaction.type === "NFT Sale" 
                        ? "bg-primary" 
                        : transaction.type === "Direct Purchase"
                        ? "bg-indigo-500"
                        : "bg-green-500"
                    }`}
                  ></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{transaction.type}</p>
                      <Badge 
                        variant={transaction.type === "NFT Sale" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {transaction.type === "NFT Sale" ? "NFT" : transaction.type === "Royalty" ? "10%" : "Direct"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{transaction.film}</p>
                  </div>
                </div>
                <div className="text-right">
                  <PriceDisplay usdcPrice={transaction.amountUsdc} className="font-semibold" />
                  <p className="text-xs text-muted-foreground mt-1">From {transaction.buyer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  <p className="text-xs text-muted-foreground">{transaction.wallet}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Options */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium">USDC Withdrawal</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Withdraw to your connected wallet</p>
              <div className="mb-3">
                <PriceDisplay usdcPrice={availableBalance} showToggle />
              </div>
              <Button className="w-full">Withdraw USDC</Button>
            </div>
            
            <div className="p-4 border border-border rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium">USDT Withdrawal</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Withdraw as Tether stablecoin</p>
              <div className="mb-3">
                <PriceDisplay usdcPrice={availableBalance} showToggle />
              </div>
              <Button className="w-full">Withdraw USDT</Button>
            </div>
            
            <div className="p-4 border border-border rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-medium">M-Pesa Transfer</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Convert to KES and send to M-Pesa</p>
              <div className="mb-3">
                <PriceDisplay usdcPrice={availableBalance} showToggle />
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Setup M-Pesa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>NFT vs Direct Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">NFT Sales</span>
                  <span className="text-sm text-muted-foreground">
                    {((totalNftSales / (totalNftSales + totalDirectSales)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full"
                    style={{ width: `${(totalNftSales / (totalNftSales + totalDirectSales)) * 100}%` }}
                  ></div>
                </div>
                <PriceDisplay usdcPrice={totalNftSales} className="mt-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Direct Sales</span>
                  <span className="text-sm text-muted-foreground">
                    {((totalDirectSales / (totalNftSales + totalDirectSales)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div 
                    className="bg-indigo-500 h-3 rounded-full"
                    style={{ width: `${(totalDirectSales / (totalNftSales + totalDirectSales)) * 100}%` }}
                  ></div>
                </div>
                <PriceDisplay usdcPrice={totalDirectSales} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Royalty Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Royalties Earned</span>
                <PriceDisplay usdcPrice={totalRoyalties} className="font-semibold text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Royalty Rate</span>
                <span className="font-semibold">10%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Secondary Sales Volume</span>
                <PriceDisplay usdcPrice={totalRoyalties * 10} />
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Royalties represent passive income from NFT resales on secondary markets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
