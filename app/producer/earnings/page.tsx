"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function EarningsPage() {
  // Mock data for charts
  const revenueData = [
    { month: "Jan", primary: 4000, royalties: 800 },
    { month: "Feb", primary: 3000, royalties: 600 },
    { month: "Mar", primary: 5000, royalties: 1000 },
    { month: "Apr", primary: 4500, royalties: 900 },
    { month: "May", primary: 6000, royalties: 1200 },
    { month: "Jun", primary: 5500, royalties: 1100 },
  ]

  const revenueBreakdown = [
    { name: "Primary Sales", value: 28000, color: "#D4AF37" },
    { name: "Royalties", value: 5600, color: "#B8860B" },
    { name: "Platform Fees", value: -3360, color: "#8B7355" },
  ]

  const transactions = [
    {
      id: 1,
      type: "Primary Sale",
      film: "Quantum Paradox",
      amount: "$15.00",
      crypto: "0.008 ETH",
      date: "2024-01-15",
      wallet: "0x1234...5678",
    },
    {
      id: 2,
      type: "Royalty",
      film: "Neon Dreams",
      amount: "$1.20",
      crypto: "0.0006 ETH",
      date: "2024-01-14",
      wallet: "0x9876...4321",
    },
    {
      id: 3,
      type: "Primary Sale",
      film: "Ocean Mystery",
      amount: "$10.00",
      crypto: "0.005 ETH",
      date: "2024-01-14",
      wallet: "0x5555...7777",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Earnings</h1>
          <p className="text-muted-foreground">Track your revenue from primary sales and royalties</p>
        </div>
        <div className="flex gap-3">
          <Select>
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
          <Button>Withdraw Funds</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$30,240</div>
            <p className="text-xs text-green-600 mt-1">+18% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Primary Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$28,000</div>
            <p className="text-xs text-muted-foreground mt-1">Direct ticket sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Royalties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$5,600</div>
            <p className="text-xs text-muted-foreground mt-1">From resales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$25,880</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="primary" stroke="#D4AF37" strokeWidth={2} name="Primary Sales" />
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
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {revenueBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                  </div>
                  <span className={item.value < 0 ? "text-red-600" : "text-foreground"}>
                    {item.value < 0 ? "-" : ""}${Math.abs(item.value).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      transaction.type === "Primary Sale" ? "bg-primary" : "bg-green-500"
                    }`}
                  ></div>
                  <div>
                    <p className="font-medium">{transaction.type}</p>
                    <p className="text-sm text-muted-foreground">{transaction.film}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{transaction.amount}</p>
                  <p className="text-sm text-muted-foreground">{transaction.crypto}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  <p className="text-sm text-muted-foreground">{transaction.wallet}</p>
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
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">USDT Withdrawal</h3>
              <p className="text-sm text-muted-foreground mb-3">Withdraw to your connected wallet</p>
              <Button className="w-full">Withdraw USDT</Button>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">USDC Withdrawal</h3>
              <p className="text-sm text-muted-foreground mb-3">Withdraw to your connected wallet</p>
              <Button className="w-full">Withdraw USDC</Button>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">Bank Transfer</h3>
              <p className="text-sm text-muted-foreground mb-3">Convert to fiat and transfer</p>
              <Button variant="outline" className="w-full bg-transparent">
                Setup Bank Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
