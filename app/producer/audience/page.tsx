"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function AudiencePage() {
  // Mock data for charts
  const countryData = [
    { country: "United States", viewers: 1200, percentage: 22 },
    { country: "United Kingdom", viewers: 800, percentage: 15 },
    { country: "Canada", viewers: 650, percentage: 12 },
    { country: "Germany", viewers: 500, percentage: 9 },
    { country: "Japan", viewers: 450, percentage: 8 },
    { country: "Others", viewers: 1800, percentage: 34 },
  ]

  const walletTypeData = [
    { name: "New Buyers", value: 3200, color: "#D4AF37" },
    { name: "Returning Buyers", value: 2200, color: "#B8860B" },
  ]

  const engagementData = [
    { film: "Quantum Paradox", avgWatch: 105, rating: 4.8, likes: 890 },
    { film: "Neon Dreams", avgWatch: 132, rating: 4.6, likes: 420 },
    { film: "Ocean Mystery", avgWatch: 118, rating: 4.9, likes: 1200 },
  ]

  const fanTiers = [
    {
      tier: "Super Collectors",
      count: 85,
      description: "Own 5+ NFT tickets",
      avgSpend: "$125",
      color: "bg-primary",
    },
    {
      tier: "Regular Fans",
      count: 320,
      description: "Own 2-4 NFT tickets",
      avgSpend: "$45",
      color: "bg-secondary",
    },
    {
      tier: "One-time Viewers",
      count: 4995,
      description: "Own 1 NFT ticket",
      avgSpend: "$15",
      color: "bg-muted",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Audience Insights</h1>
          <p className="text-muted-foreground">Understand your viewers and their engagement patterns</p>
        </div>
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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Viewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">5,400</div>
            <p className="text-xs text-green-600 mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">4,850</div>
            <p className="text-xs text-muted-foreground mt-1">Connected wallets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Watch Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1h 52m</div>
            <p className="text-xs text-green-600 mt-1">+8 min from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">68%</div>
            <p className="text-xs text-muted-foreground mt-1">Return viewers</p>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution & Wallet Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="country" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="viewers" fill="#D4AF37" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Wallet Types */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={walletTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                  {walletTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString()} viewers`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {walletTypeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                  </div>
                  <span>{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fan Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Fan Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fanTiers.map((tier, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${tier.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-2xl font-bold text-background">{tier.count}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{tier.tier}</h3>
                <p className="text-sm text-muted-foreground mb-2">{tier.description}</p>
                <Badge variant="outline">Avg Spend: {tier.avgSpend}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement by Film */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement by Film</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {engagementData.map((film, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h3 className="font-medium">{film.film}</h3>
                  <p className="text-sm text-muted-foreground">Average watch time: {film.avgWatch} minutes</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium">{film.rating}</p>
                    <p className="text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{film.likes}</p>
                    <p className="text-muted-foreground">Likes</p>
                  </div>
                  <div className="w-32 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(film.avgWatch / 150) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Collectors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Collectors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                wallet: "0x1234...5678",
                tickets: 12,
                spent: "$180",
                films: ["Quantum Paradox", "Neon Dreams", "Ocean Mystery"],
              },
              { wallet: "0x9876...4321", tickets: 8, spent: "$120", films: ["Quantum Paradox", "Ocean Mystery"] },
              { wallet: "0x5555...7777", tickets: 6, spent: "$90", films: ["Neon Dreams", "Ocean Mystery"] },
            ].map((collector, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">{collector.wallet}</p>
                  <p className="text-sm text-muted-foreground">{collector.films.join(", ")}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{collector.tickets} tickets</p>
                  <p className="text-sm text-muted-foreground">{collector.spent} spent</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
